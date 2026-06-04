import { Outlet, createRootRoute, HeadContent, Scripts, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import appCss from "../styles.css?url";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { WeddingEnvelopeIntro } from "../components/WeddingEnvelopeIntro";
import { hasOpenedWeddingEnvelope } from "../lib/wedding-envelope";

const faviconSvg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%23f7f5ef'/%3E%3Ctext x='32' y='39' text-anchor='middle' font-family='Georgia,serif' font-size='24' font-style='italic' fill='%234a5239'%3EM%26M%3C/text%3E%3C/svg%3E";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Murilo & Mirelle — 10.10.2026" },
      {
        name: "description",
        content: "O casamento de Murilo e Mirelle • 10 de outubro de 2026. Confirme sua presença.",
      },
      { property: "og:title", content: "Murilo & Mirelle — 10.10.2026" },
      {
        property: "og:description",
        content: "Confirme presença e veja todas as informações do nosso casamento.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: faviconSvg },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <div>
        <h1 className="font-display text-6xl">404</h1>
        <p className="mt-2 text-muted-foreground">Página não encontrada.</p>
        <a href="/" className="mt-6 inline-block text-primary underline underline-offset-4">
          Voltar ao início
        </a>
      </div>
    </div>
  ),
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [showIntro, setShowIntro] = useState(false);
  const [introChecked, setIntroChecked] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setShowIntro(false);
      setIntroChecked(true);
      return;
    }

    setShowIntro(!hasOpenedWeddingEnvelope());
    setIntroChecked(true);
  }, [isHome]);

  if (isHome && !introChecked) {
    return null;
  }

  if (isHome && showIntro) {
    return <WeddingEnvelopeIntro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
