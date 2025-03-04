import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { verifyWithIugu } from '@/http/verify-with-iugu';
import { ACCESS_TOKEN } from '@/constants';
import { decodeAccessToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  // Aqui lemos o cookie do lado do servidor (httpOnly é acessível aqui)
  const token = cookieStore.get(ACCESS_TOKEN)?.value;

  if (!token) {
    return NextResponse.json({ allowed: false }, { status: 401 });
  }

  // Decodifica o token usando jwt-decode para obter o principal (por exemplo, "app:...")
  const { sub } = decodeAccessToken<{ sub: string }>(token);
  const principal = sub;

  console.log({ principal })

  // Defina as ações que deseja verificar – por exemplo, via query param ou fixo
  const actions = request.nextUrl.searchParams.getAll('action'); // ex: ?action=pix:cob.write

  try {
    const result = await verifyWithIugu({
      principals: principal,
      actions,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    let message = "Unknown error";
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json(
      { allowed: false, error: message },
      { status: 500 }
    );
  }
}
