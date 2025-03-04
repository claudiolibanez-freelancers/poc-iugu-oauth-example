import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // try {
  //   // Remove o cookie "accessToken"
  //   const cookieStore = await cookies();
  //   cookieStore.delete('accessToken');

  //   console.log("teste")

  //   // Redireciona para a página de login interna
  //   return NextResponse.redirect(new URL('/', request.url));
  // } catch (error) {
  //   console.error('Error during logout:', error);
  //   return NextResponse.json(
  //     { message: 'Failed to logout.' },
  //     { status: 500 }
  //   );
  // }




  // Remove o cookie "token". Se o cookie foi definido com path '/', especifique-o aqui.
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');

  // Cria uma cópia da URL da requisição
  const redirectUrl = request.nextUrl.clone();

  // Define o caminho de redirecionamento para a página de login
  redirectUrl.pathname = '/';
  redirectUrl.search = '';

  // Retorna uma resposta de redirecionamento para a URL configurada
  return NextResponse.redirect(redirectUrl);
}