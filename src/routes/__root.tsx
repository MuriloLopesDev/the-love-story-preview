import { Outlet, createRootRoute, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { WeddingEnvelopeIntro } from "../components/WeddingEnvelopeIntro";
import { hasOpenedWeddingEnvelope } from "../lib/wedding-envelope";

export const Route = createRootRoute({
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
