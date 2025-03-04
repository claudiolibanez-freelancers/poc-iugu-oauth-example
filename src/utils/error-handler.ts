/**
 * Interface que define a estrutura de um erro de API padronizado.
 */
export interface ApiError {
  /** Código de status HTTP do erro (ex: 400, 404, 500). */
  status: number

  /** Mensagem de erro descritiva. */
  message: string

  /** Detalhes adicionais sobre o erro, caso fornecidos pela API. */
  details?: Record<string, unknown>

  /** Código de erro específico retornado pela API (ex: "TOKEN_EXPIRED"). */
  code?: string
}

/**
 * Processa erros HTTP retornados pela API, garantindo um formato padronizado.
 *
 * - Converte a resposta HTTP em um objeto `ApiError`.
 * - Caso a API retorne uma estrutura de erro válida, extrai `message` e `code`.
 * - Se a resposta não contiver um corpo JSON válido, utiliza `response.statusText`.
 *
 * @param {Response} response - A resposta HTTP recebida da API.
 * @returns {Promise<ApiError>} Um objeto padronizado contendo as informações do erro.
 */
export async function handleHttpError(response: Response): Promise<ApiError> {
  const status: number = response.status
  let message: string = 'Erro desconhecido.'
  let code: string | undefined

  try {
    // Tenta extrair `message` e `code` do corpo da resposta, caso seja JSON válido.
    const errorBody: { message?: string; code?: string } = await response.json()
    message = errorBody.message ?? message
    code = errorBody.code
  } catch {
    // Se a API não retornar um JSON válido, usa `statusText` como mensagem padrão.
    message = response.statusText ?? message
  }

  return {
    status,
    message,
    code,
  }
}

/**
 * Processa erros gerais da aplicação, incluindo falhas de rede e erros inesperados.
 *
 * - Se o erro for uma falha de conexão (`Failed to fetch` ou `NetworkError`), retorna `503`.
 * - Se for um erro interno desconhecido, retorna `500` com uma mensagem genérica.
 *
 * @param {unknown} error - O erro capturado no bloco `catch`.
 * @returns {ApiError} Um objeto padronizado contendo as informações do erro.
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    if (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError')
    ) {
      return {
        status: 503,
        message: 'Erro de conexão. Tente novamente mais tarde.',
      }
    }

    return {
      status: 500,
      message: 'Erro interno. Nossa equipe já está ciente.',
    }
  }

  return {
    status: 500,
    message: 'Erro desconhecido',
  }
}
