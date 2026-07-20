import { Link } from "@tanstack/react-router";
import { Menu, X, Shield, Mail, Instagram, Facebook } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/lib/admin";
import { supabase } from "@/integrations/supabase/client";
import { SolvoraLBLogo } from "@/components/brand-icons";


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
          <SolvoraLBLogo className="h-9 w-9" />
          SolvoraLB
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
      <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-muted-foreground">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand + tagline */}
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-2 font-display text-base font-semibold text-foreground">
              <SolvoraLBLogo className="h-7 w-7" />
              SolvoraLB
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Reliable solar power, designed for Lebanon's sun and Lebanon's grid.
            </p>
            <a
              href="mailto:solvoralb@gmail.com"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-accent"
            >
              <Mail className="h-4 w-4" /> solvoralb@gmail.com
            </a>
          </div>

          {/* Quick links */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">Explore</p>
            <ul className="space-y-2">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">Follow</p>
            <div className="flex items-center gap-2">
              {[
                { label: "Instagram", href: "#", Icon: Instagram },
                { label: "Facebook", href: "#", Icon: Facebook },
                { label: "WhatsApp", href: "#", Icon: WhatsAppIcon },
              ].map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent-foreground hover:bg-accent"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            {isAdmin && (
              <Link
                to="/admin"
                className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Shield className="h-3 w-3" /> Admin
              </Link>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border/70 pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} SolvoraLB. Reliable power for Lebanon.</p>
          <p>Made with sun ☀ in Beirut.</p>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .17 5.33.17 11.9c0 2.1.55 4.14 1.6 5.94L0 24l6.34-1.66a11.9 11.9 0 0 0 5.72 1.46h.01c6.55 0 11.88-5.33 11.88-11.9 0-3.18-1.24-6.17-3.43-8.42ZM12.07 21.6h-.01a9.7 9.7 0 0 1-4.95-1.36l-.35-.21-3.76.98 1-3.67-.23-.38a9.7 9.7 0 0 1-1.5-5.16c0-5.36 4.37-9.72 9.75-9.72 2.6 0 5.05 1.02 6.89 2.86a9.65 9.65 0 0 1 2.85 6.87c0 5.37-4.37 9.79-9.69 9.79Zm5.31-7.28c-.29-.15-1.72-.85-1.99-.95-.27-.1-.46-.15-.66.15-.19.29-.75.94-.92 1.14-.17.2-.34.22-.63.07-.29-.14-1.24-.46-2.36-1.46-.87-.78-1.46-1.75-1.63-2.04-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.49.1-.19.05-.36-.02-.51-.07-.15-.66-1.6-.9-2.19-.24-.57-.48-.5-.66-.51h-.56c-.19 0-.51.07-.77.36-.27.29-1.02 1-1.02 2.44 0 1.44 1.04 2.83 1.19 3.02.15.19 2.05 3.12 4.95 4.38.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.55-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.27-.19-.56-.34Z"/>
    </svg>
  );
}
