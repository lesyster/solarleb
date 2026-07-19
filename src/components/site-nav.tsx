import { Link } from "@tanstack/react-router";
import { Sun, Menu, X, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/lib/admin";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/plan", label: "Get a Plan" },
  { to: "/news", label: "News" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteNav() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground">
          <span className="grid h-9 w-9 place-items-center rounded-lg gradient-sun shadow-glow">
            <Sun className="h-5 w-5 text-deep" strokeWidth={2.5} />
          </span>
          SolarLeb
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-2 text-sm font-medium text-foreground bg-secondary" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/20"
              activeProps={{ className: "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-accent-foreground bg-accent/20" }}
            >
              <Shield className="h-4 w-4 text-accent" /> Admin
            </Link>
          )}
        </nav>


        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="bg-deep text-deep-foreground hover:bg-deep/90">
              <Link to="/auth">Login / Signup</Link>
            </Button>
          )}
        </div>

        <button
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/20"
              >
                <Shield className="h-4 w-4 text-accent" /> Admin
              </Link>
            )}
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary">
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setOpen(false);
                  }}
                  className="rounded-md px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-secondary"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary">
                Login / Signup
              </Link>
            )}

          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  const { isAdmin } = useIsAdmin();
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40" data-reveal>
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-2 font-display font-semibold text-foreground">
            <Sun className="h-4 w-4 text-accent" />
            SolarLeb
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link to="/admin" className="hidden items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground md:inline-flex">
                <Shield className="h-3 w-3" /> Admin
              </Link>
            )}
            <p>© {new Date().getFullYear()} SolarLeb. Reliable power for Lebanon.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
