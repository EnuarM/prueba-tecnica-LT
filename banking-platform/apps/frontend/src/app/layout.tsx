import type { Metadata } from 'next';
import ApolloClientProvider from '@/lib/apollo-provider';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'CoreBank Admin | Portal de Evaluación Técnica',
  description: 'Plataforma de banca institucional — Evaluación técnica',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <head>
        {/* Fonts loaded at browser runtime — avoids build-time SSL issues in corporate networks */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-surface font-sans">
        <ApolloClientProvider>
          <AuthProvider>{children}</AuthProvider>
        </ApolloClientProvider>
      </body>
    </html>
  );
}
