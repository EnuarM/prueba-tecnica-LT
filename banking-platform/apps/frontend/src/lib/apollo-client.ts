import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

function createApolloClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://localhost:3000/graphql',
      credentials: 'include',
    }),
    cache: new InMemoryCache(),
  });
}

// Singleton para el cliente en el navegador
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let browserClient: ReturnType<typeof createApolloClient> | null = null;

export function getApolloClient() {
  if (typeof window === 'undefined') {
    // Server: nueva instancia por request (evita compartir caché entre usuarios)
    return createApolloClient();
  }

  // Browser: reutilizar instancia
  if (!browserClient) {
    browserClient = createApolloClient();
  }
  return browserClient;
}
