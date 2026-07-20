import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sun, Lock, Clock, Plus } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Plan = {
  id: string;
  created_at: string;
  city: string;
  property_type: string;
  recommended_system_kw: number | null;
  recommended_battery: string | null;
  estimated_cost_low: number | null;
  estimated_cost_high: number | null;
  is_locked: boolean;
  locked_until: string | null;
};

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard — SolvoraLB" },
      { name: "description", content: "Your saved solar plans and price-lock status." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[] | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", search: { next: "/dashboard" } as never, replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("plans")
      .select("id, created_at, city, property_type, recommended_system_kw, recommended_battery, estimated_cost_low, estimated_cost_high, is_locked, locked_until")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        setPlans((data ?? []) as Plan[]);
      });
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground">Your solar plans</h1>
            <p className="mt-2 text-muted-foreground">Signed in as {user.email}</p>
          </div>
          <Button asChild className="bg-deep text-deep-foreground hover:bg-deep/90">
            <Link to="/plan"><Plus className="mr-2 h-4 w-4" /> New plan</Link>
          </Button>
        </div>

        {plans === null ? (
          <p className="text-muted-foreground">Loading your plans...</p>
        ) : plans.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
            <Sun className="mx-auto h-10 w-10 text-accent" />
            <h2 className="mt-4 font-display text-xl font-bold text-foreground">No plans yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Generate your first free solar plan in under a minute.</p>
            <Button asChild className="mt-6 bg-deep text-deep-foreground hover:bg-deep/90">
              <Link to="/plan">Get Your Free Plan</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {plans.map((p) => {
              const locked = p.is_locked && p.locked_until && new Date(p.locked_until) > new Date();
              return (
                <div key={p.id} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                        {locked ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-deep">
                            <Lock className="h-3 w-3" /> Locked until {new Date(p.locked_until!).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            <Clock className="h-3 w-3" /> Not locked
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 font-display text-xl font-bold text-foreground">
                        {p.recommended_system_kw ?? "—"} kW · {p.property_type} in {p.city}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Battery: {p.recommended_battery ?? "—"} · Est.{" "}
                        ${p.estimated_cost_low?.toLocaleString() ?? "?"} – ${p.estimated_cost_high?.toLocaleString() ?? "?"}
                      </p>
                    </div>
                    {!locked && (
                      <Button asChild variant="outline">
                        <Link to="/payment" search={{ plan: p.id } as never}>Lock in price</Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
