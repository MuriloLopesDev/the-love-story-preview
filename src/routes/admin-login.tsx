import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Login Administrativo — Murilo & Mirelle" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate({ to: "/admin" });
      } else {
        setCheckingSession(false);
      }
    }
    checkSession();
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data.session) {
        navigate({ to: "/admin" });
      } else {
        setError("Erro ao autenticar. Verifique seus dados.");
      }
    } catch (err: any) {
      console.error("Erro no login:", err);
      setError(err?.message || "Credenciais inválidas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground font-serif-italic">Verificando sessão...</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-20 sm:py-28 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-card border border-border/70 rounded-xl p-8 sm:p-10 shadow-[var(--shadow-card)] animate-fade-up">
        <header className="text-center mb-8">
          <p className="divider-leaf text-xs uppercase tracking-[0.3em]">Acesso restrito</p>
          <h1 className="mt-6 font-display text-3xl sm:text-4xl">Login Administrativo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Entre com suas credenciais do Supabase para acessar o painel.
          </p>
        </header>

        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">
              E-mail
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/80">
                <Mail className="size-4" />
              </span>
              <input
                type="email"
                required
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => {
                  setError("");
                  setEmail(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-3 rounded-md bg-background border border-border/70 text-sm focus:outline-none focus:border-olive transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">
              Senha
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/80">
                <Lock className="size-4" />
              </span>
              <input
                type="password"
                required
                placeholder="Sua senha"
                value={password}
                onChange={(e) => {
                  setError("");
                  setPassword(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-3 rounded-md bg-background border border-border/70 text-sm focus:outline-none focus:border-olive transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 text-sm font-medium hover:bg-primary/90 transition-all disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
          >
            <Lock className="size-4" />
            {loading ? "Entrando..." : "Acessar Painel"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-olive transition-colors"
          >
            <ArrowLeft className="size-3" /> Voltar ao site de casamento
          </a>
        </div>
      </div>
    </div>
  );
}
