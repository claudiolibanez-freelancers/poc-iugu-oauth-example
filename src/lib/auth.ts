import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN } from "@/constants";

/**
 * Retorna o token de acesso armazenado nos cookies.
 *
 * @returns {string | null} O token de acesso ou null se não estiver definido.
 */
export async function getAccessToken(): Promise<string | null> {
  const token = await getCookie(ACCESS_TOKEN);

  return typeof token === "string" ? token : null;
}

/**
 * Decodifica o token JWT e retorna seu payload.
 *
 * @param token - O token JWT a ser decodificado.
 * @returns O payload decodificado.
 */
export function decodeAccessToken<T>(token: string): T {
  return jwtDecode<T>(token);
}

/**
 * Verifica se o usuário está autenticado com base na presença do token de acesso.
 *
 * @returns {boolean} True se o token existir; caso contrário, false.
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Executa o logout redirecionando o usuário para a rota de logout da API.
 */
export function logout() {
  // Redireciona o navegador para a rota de logout da API.
  window.location.href = '/api/auth/logout';
}