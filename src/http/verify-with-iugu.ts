import { setupFetch } from "@/services/setup-fetch";

interface VerifyWithIuguRequest {
  principals: string;
  actions: string[];
}

/**
 * Define a estrutura da resposta de verificação, onde cada ação é uma chave mapeada para um boolean.
 */
interface VerifyWithIuguResponse {
  [action: string]: boolean;
}

/**
 * Chama o endpoint de verify da Iugu para verificar se o app possui as permissões necessárias.
 * O workspace_id é gerenciado internamente pelo backend.
 *
 * @param {VerifyWithIuguRequest} params - Parâmetros contendo principals e actions.
 * @returns {Promise<VerifyWithIuguResponse>} - Resposta da verificação.
 * @throws {Error} - Caso a resposta não contenha o campo 'allowed'.
 */
export async function verifyWithIugu({
  principals,
  actions,
}: VerifyWithIuguRequest): Promise<VerifyWithIuguResponse> {
  const response = await setupFetch<VerifyWithIuguResponse>({
    endpoint: '/auth/verify',
    method: 'POST',
    body: {
      principals,
      actions,
    },
  });

  console.log({ response })

  // Valida que para cada ação a resposta tenha um valor boolean
  for (const action of actions) {
    if (typeof response[action] !== "boolean") {
      throw new Error(`Invalid response from Iugu verify for action: ${action}`);
    }
  }

  return response;
}
