import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const pathname = request.nextUrl.pathname;

  // Rotas públicas que NÃO exigem token (exceto as de API que já estão excluídas pelo matcher)
  const publicPaths = [
    // '/login',
    '/forgot-password'
  ];

  // Se a URL contiver o parâmetro "code", faz parte do fluxo OAuth e é permitido.
  if (request.nextUrl.searchParams.has('code')) {
    return NextResponse.next();
  }

  // Permite o acesso às rotas públicas
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Permite o fluxo OAuth se houver o parâmetro "code"
  // if (request.nextUrl.searchParams.has('code')) {
  //   return NextResponse.next();
  // }

  // if (publicPaths.some(path => pathname.startsWith(path))) {
  //   return NextResponse.next();
  // }

  // Se não houver token, redireciona para a URL de OAuth da Iugu, forçando a tela de login
  if (!token) {
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
    const callbackUri = process.env.NEXT_PUBLIC_REDIRECT_URI; // Ex: http://localhost:3000/api/auth/callback
    const oauthUrl = `https://identity.iugu.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(callbackUri!)}&max_age=0&prompt=login`;

    return NextResponse.redirect(new URL(oauthUrl));
  }

  // Se não houver token, redireciona para a página de login
  // if (!token) {
  //   const redirectUrl = new URL('/login', request.url);
  //   return NextResponse.redirect(redirectUrl);
  // }

  // Se o usuário acessar a raiz, redireciona para /dashboard
  if (pathname === '/') {
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}