export default function LoginPage() {
  // Constrói a URL de OAuth do Iugu usando as variáveis de ambiente
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI; // Ex: http://localhost:3000/api/auth/callback
  const oauthUrl = `https://identity.iugu.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri!)}&max_age=0`;

  console.log(oauthUrl)


  return (
    <div>
      <h1>Login</h1>
      <p>Para fazer login com Iugu, clique no botão abaixo:</p>
      <a href={oauthUrl}>
        <button>Login com Iugu</button>
      </a>
    </div>
  );
}
