import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mirelle & Murilo — 10.10.2026" },
      { name: "description", content: "O casamento de Mirelle e Murilo • 10 de outubro de 2026. Confirme sua presença." },
      { property: "og:title", content: "Mirelle & Murilo — 10.10.2026" },
      { property: "og:description", content: "Confirme presença e veja todas as informações do nosso casamento." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <div>
        <h1 className="font-display text-6xl">404</h1>
        <p className="mt-2 text-muted-foreground">Página não encontrada.</p>
        <a href="/" className="mt-6 inline-block text-primary underline underline-offset-4">Voltar ao início</a>
      </div>
    </div>
  ),
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1"><Outlet /></main>
      <SiteFooter />
    </div>
  );
}
