import { cache } from 'react'

// Funções de utilidade locais (assumidas como existentes)
import { handleApiError, handleHttpError } from '@/utils/error-handler'
import { ACCESS_TOKEN } from '@/constants'
import { cookies } from 'next/headers'

/**
 * URL base da API, definida a partir das variáveis de ambiente.
 * Caso `NEXT_PUBLIC_API_BASE_URL` não esteja definida, assume `http://localhost:3333/api`.
 * @constant {string}
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333/api'

/**
 * Interface TypeScript para as propriedades aceitas pelo `setupFetch`.
 */
interface FetchProps {
  /** Caminho do endpoint da API (ex: `"/users"`). */
  endpoint: string
  /** URL base da API (opcional, sobrescreve a padrão). */
  baseUrl?: string
  /** Tags para revalidação no Next.js (server-side apenas). */
  tags?: string[]
  /** Método HTTP da requisição (padrão: `"GET"`). */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** Corpo da requisição (usado em `POST`, `PUT`, `PATCH`). */
  body?: unknown
  /** Tempo de revalidação do cache em segundos (padrão: `3600`). */
  revalidate?: number
  /** Opções adicionais para a requisição `fetch`. */
  options?: RequestInit
  /** Tipo de resposta esperado (padrão: `"json"`). */
  responseType?: 'json' | 'blob' | 'text'
  /** Tempo limite da requisição em milissegundos. */
  timeout?: number
  /** Parâmetros de consulta para a URL. */
  query?: Record<string, string | number | boolean>
  /** Token de autenticação (opcional, sobrescreve cookies). */
  accessToken?: string
}

/**
 * Serviço de requisições para a API, compatível com server-side e client-side.
 * Utiliza `cookies-next` para acessar cookies em ambos os ambientes.
 * Suporta autenticação via token manual, revalidação de cache (server-side), timeout e query params.
 *
 * @template T - Tipo esperado da resposta da API.
 * @param {FetchProps} props - Configurações da requisição.
 * @returns {Promise<T>} - Dados retornados pela API.
 * @throws {Error} - Erros de HTTP ou falhas de rede tratados por `handleApiError`.
 *
 * @example
 * // GET simples com cookies automáticos (server ou client)
 * const users = await setupFetch({ endpoint: '/users' })
 *
 * @example
 * // POST com token manual e query params
 * const response = await setupFetch({
 *   endpoint: '/users',
 *   method: 'POST',
 *   body: { name: 'John' },
 *   accessToken: 'meu-token-aqui',
 *   query: { role: 'admin' },
 *   timeout: 5000
 * })
 *
 * @example
 * // Sobrescrevendo a base URL
 * const data = await setupFetch({
 *   endpoint: '/products',
 *   baseUrl: 'https://custom-api.com'
 * })
 */
export const setupFetch = cache(
  async <T>({
    endpoint,
    baseUrl,
    tags,
    method = 'GET',
    body,
    revalidate = 3600,
    options,
    responseType = 'json',
    timeout,
    query,
    accessToken,
  }: FetchProps): Promise<T> => {
    try {
      /**
       * Normaliza a URL base e o endpoint, evitando barras duplicadas.
       * Usa `baseUrl` se fornecido, caso contrário, usa `API_BASE_URL`.
       */
      const apiBaseUrl = baseUrl || API_BASE_URL
      const url = new URL(`${apiBaseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`)

      /**
       * Adiciona parâmetros de consulta à URL, se fornecidos.
       */
      if (query) {
        Object.entries(query).forEach(([key, value]) =>
          url.searchParams.append(key, String(value)),
        )
      }

      /**
       * Configura os headers da requisição.
       * Omite 'Content-Type' para FormData, permitindo que o navegador defina o boundary.
       */
      const headers: Record<string, string> = {}
      if (!(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json'
      }

      /**
       * Mescla headers personalizados de `options.headers`, se fornecidos.
       */
      if (options?.headers) {
        if (options.headers instanceof Headers) {
          options.headers.forEach((value, key) => {
            headers[key] = value
          })
        } else if (Array.isArray(options.headers)) {
          options.headers.forEach(([key, value]) => {
            headers[key] = value
          })
        } else {
          Object.assign(headers, options.headers)
        }
      }

      /**
       * Define o token de autenticação para a requisição.
       * Se o token for fornecido manualmente via parâmetro, ele será usado; caso contrário,
       * utiliza o token armazenado no cookie via `cookies()` do Next.js.
       */
      const cookieStore = await cookies();
      const authToken = accessToken || cookieStore.get(ACCESS_TOKEN)?.value;
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }


      /**
       * Configura as opções da requisição `fetch`, incluindo método, headers e timeout.
       * O cache Next.js (`next: { revalidate, tags }`) é aplicado apenas no server-side.
       */
      const fetchOptions: RequestInit = {
        ...options,
        method,
        headers,
        next: typeof window === 'undefined' ? { revalidate, tags } : undefined,
        body: body instanceof FormData ? body : JSON.stringify(body),
        signal: timeout ? AbortSignal.timeout(timeout) : options?.signal,
      }

      /**
       * Executa a requisição à API.
       */
      const response = await fetch(url.toString(), fetchOptions)

      /**
       * Lança erro se a resposta não for bem-sucedida (status fora de 200-299).
       */
      if (!response.ok) throw await handleHttpError(response)

      // Se estiver no ambiente server-side e for um método de escrita, invalida as tags
      if (
        typeof window === 'undefined' &&
        tags &&
        ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
      ) {
        // Importa dinamicamente revalidateTag somente no server-side.
        const { revalidateTag } = await import('next/cache');
        tags.forEach((tag) => revalidateTag(tag));
      }

      /**
       * Retorna a resposta no formato solicitado (json, blob ou text).
       */
      switch (responseType) {
        case 'blob':
          return (await response.blob()) as unknown as T
        case 'text':
          return (await response.text()) as unknown as T
        case 'json':
        default:
          return response.json()
      }
    } catch (error: unknown) {
      /**
       * Trata erros inesperados (ex: falha de rede) e lança um erro padronizado.
       */
      throw handleApiError(error)
    }
  },
)