import { setupFetch } from "@/services/setup-fetch"

interface SignInWithIuguRequest {
  code: string
}

interface SignInWithIuguResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export async function signInWithIugu({
  code
}: SignInWithIuguRequest): Promise<SignInWithIuguResponse> {
  const response = await setupFetch<SignInWithIuguResponse>({
    endpoint: '/auth/iugu',
    method: 'POST',
    body: {
      code
    }
  })

  if (!response.access_token) {
    throw new Error('Invalid response from Iugu authentication');
  }

  return response
}