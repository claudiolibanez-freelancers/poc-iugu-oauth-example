import { useState, useEffect } from "react";

type UseCanParams = {
  actions: string[];
};

/**
 * Hook para verificar se o usuário (ou app) possui as permissões necessárias.
 * 
 * Ao invés de ler e decodificar o token no cliente, esse hook chama uma API route
 * que roda no servidor (onde os cookies httpOnly são acessíveis) para realizar a verificação.
 *
 * A API route (por exemplo, /api/auth/verify) deve estar implementada para:
 *  - Ler o cookie 'accessToken'
 *  - Decodificar o token (por exemplo, com jwt-decode)
 *  - Chamar o endpoint de verificação da Iugu e retornar se o acesso é permitido
 *
 * Retorna:
 *  - allowed: boolean indicando se a permissão foi concedida.
 *  - loading: boolean indicando se a verificação ainda está em andamento.
 */
export function useCan({ actions }: UseCanParams) {
  const [allowed, setAllowed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkPermissions() {
      try {
        // Cria uma query string para enviar as ações para a API.
        const query = new URLSearchParams();
        actions.forEach((action) => query.append("action", action));
        const response = await fetch(`/api/auth/verify?${query.toString()}`, {
          // Como a API route roda no server, ela pode acessar o cookie httpOnly.
          credentials: "include",
        });
        const result = await response.json();

        console.log("verify result:", result);
        // Define allowed se todas as ações forem true
        const allAllowed = actions.every(action => !!result[action]);
        setAllowed(allAllowed);
      } catch (error: unknown) {
        console.error("Error checking permissions:", error);
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    }

    checkPermissions();
  }, [actions]);

  return { allowed, loading };
}
