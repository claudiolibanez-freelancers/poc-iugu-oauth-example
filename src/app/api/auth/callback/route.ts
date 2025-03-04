import { signInWithIugu } from '@/http/sign-in-with-iugu';
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json(
      { message: 'Iugu OAuth code was not found.' },
      { status: 400 }
    );
  }

  try {
    const { access_token } = await signInWithIugu({ code })

    // Define o cookie com o token para autenticação
    const cookieStore = await cookies();
    cookieStore.set('accessToken', access_token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      httpOnly: true, // Impede acesso via JavaScript
      secure: process.env.NODE_ENV === 'production', // Apenas em HTTPS em produção
      sameSite: 'lax', // Protege contra CSRF
    });

    // Redireciona para o dashboard
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    redirectUrl.search = '';

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Sign-in error:', error);
    return NextResponse.json(
      { message: 'Failed to authenticate with Iugu.' },
      { status: 500 }
    );
  }
}