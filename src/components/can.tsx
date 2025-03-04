'use client'

import { useCan } from "@/hooks/use-can";

type CanProps = {
  children: React.ReactNode;
  actions: string[];
};

/**
 * Componente que renderiza seu conteúdo somente se a verificação de permissões
 * (realizada pelo hook useCan) confirmar que as ações estão autorizadas.
 *
 * Enquanto a verificação estiver carregando ou se o acesso não for permitido,
 * o componente não renderiza nada.
 *
 * Exemplo de uso:
 * 
 * <Can actions={["pix:cob.write"]}>
 *   <button>Realizar Cobrança via PIX</button>
 * </Can>
 */
export function Can({ children, actions }: CanProps) {
  const { allowed, loading } = useCan({ actions });

  if (loading || !allowed) {
    return null;
  }

  return <>{children}</>;
}
