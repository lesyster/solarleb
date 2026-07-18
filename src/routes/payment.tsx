import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock, ShieldCheck, CheckCircle2, CreditCard } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Plan = {
  id: string;
  city: string;
  property_type: string;
  recommended_system_kw: number | null;
  recommended_battery: string | null;
  estimated_cost_low: number | null;
  estimated_cost_high: number | null;
  is_locked: boolean;
  locked_until: string | null;
};

type PaymentSearch = { plan?: string };

export const Route = createFileRoute("/payment")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): PaymentSearch => ({
    plan: typeof s.plan === "string" ? s.plan : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Lock In Your Solar Price — SolarLeb" },
      { name: "description", content: "Secure today's solar panel and battery prices for 30 days with a $25 deposit, fully credited toward your installation." },
    ],
  }),
  component: PaymentPage,
});

function PaymentPage() {
  const { user, loading: authLoading } = useAuth();
  const search = useSearch({ from: "/payment" });
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "processing" | "done" | "error">("loading");
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);

  const [card, setCard] = useState({ name: "", number: "", exp: "", cvc: "" });
  const [method, setMethod] = useState<"card" | "whish">("card");
  const [whishPhone, setWhishPhone] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/auth", search: { next: `/payment?plan=${search.plan ?? ""}` } as never, replace: true });
      return;
    }
    if (!search.plan) {
      setStatus("error");
      return;
    }
    supabase
      .from("plans")
      .select("id, city, property_type, recommended_system_kw, recommended_battery, estimated_cost_low, estimated_cost_high, is_locked, locked_until")
      .eq("id", search.plan)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setStatus("error");
          return;
        }
        setPlan(data as Plan);
        setStatus("ready");
      });
  }, [authLoading, user, search.plan, navigate]);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!plan) return;
    if (!card.name || card.number.replace(/\s/g, "").length < 12 || !card.exp || card.cvc.length < 3) {
      toast.error("Please fill in valid card details");
      return;
    }

    setStatus("processing");
    // Mock payment processing — replace with Stripe integration later.
    await new Promise((r) => setTimeout(r, 1600));

    const until = new Date();
    until.setDate(until.getDate() + 30);
    const untilIso = until.toISOString();

    const { error } = await supabase
      .from("plans")
      .update({ is_locked: true, locked_until: untilIso })
      .eq("id", plan.id);

    if (error) {
      console.error(error);
      toast.error("Payment recorded, but couldn't lock the plan. Contact support.");
      setStatus("error");
      return;
    }

    setLockedUntil(untilIso);
    setStatus("done");
    toast.success("Price locked in");
  }

  if (status === "loading" || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (status === "error" || !plan) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Plan not found</h1>
          <p className="mt-2 text-muted-foreground">We couldn't load this plan. Generate a new one to continue.</p>
          <Button asChild className="mt-6 bg-deep text-deep-foreground hover:bg-deep/90">
            <Link to="/plan">Get a plan</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto max-w-2xl px-4 py-16">
          <div className="rounded-2xl border-2 border-accent bg-card p-10 text-center shadow-glow">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full gradient-sun shadow-glow">
              <CheckCircle2 className="h-8 w-8 text-deep" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">You're locked in</h1>
            <p className="mt-3 text-muted-foreground">
              Your price is locked until{" "}
              <span className="font-semibold text-foreground">
                {new Date(lockedUntil!).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </span>
              . We'll be in touch soon to match you with a certified installer in your region.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button asChild variant="outline"><Link to="/dashboard">Go to dashboard</Link></Button>
              <Button asChild className="bg-deep text-deep-foreground hover:bg-deep/90"><Link to="/">Home</Link></Button>
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const alreadyLocked = plan.is_locked && plan.locked_until && new Date(plan.locked_until) > new Date();

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-[1fr_1fr] md:py-16">
        {/* Summary */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Lock in your price</h1>
          <p className="mt-2 text-muted-foreground">Review your plan and confirm the $25 deposit.</p>

          <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your plan</p>
            <p className="mt-3 font-display text-4xl font-bold text-foreground">
              {plan.recommended_system_kw} <span className="text-2xl text-accent">kW</span>
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p><span className="text-foreground">Location:</span> {plan.property_type} in {plan.city}</p>
              <p><span className="text-foreground">Battery:</span> {plan.recommended_battery}</p>
              <p>
                <span className="text-foreground">Est. install cost:</span>{" "}
                ${plan.estimated_cost_low?.toLocaleString()} – ${plan.estimated_cost_high?.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-accent/40 bg-secondary/40 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <p className="text-sm leading-relaxed text-secondary-foreground">
                This <span className="font-semibold text-foreground">$25 deposit</span> locks in today's solar panel and battery prices for
                30 days and will be <span className="font-semibold text-foreground">fully credited toward your final installation invoice</span>.
                This fee is <span className="font-semibold text-foreground">non-refundable</span>, as it reflects a real price guarantee we
                provide the moment you pay, regardless of whether you proceed with installation.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-deep" />
              <h2 className="font-display text-lg font-bold text-foreground">Payment</h2>
            </div>
            <span className="text-2xl font-bold text-foreground">$25.00</span>
          </div>

          {alreadyLocked ? (
            <div className="rounded-xl bg-secondary p-5 text-center">
              <Lock className="mx-auto h-6 w-6 text-accent" />
              <p className="mt-2 font-semibold text-foreground">This plan is already locked</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Until {new Date(plan.locked_until!).toLocaleDateString()}.
              </p>
              <Button asChild className="mt-4"><Link to="/dashboard">Back to dashboard</Link></Button>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-name">Name on card</Label>
                <Input id="card-name" value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-number">Card number</Label>
                <Input
                  id="card-number"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  value={card.number}
                  onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))}
                  required
                  maxLength={23}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card-exp">Expiry</Label>
                  <Input id="card-exp" placeholder="MM/YY" value={card.exp} onChange={(e) => setCard((c) => ({ ...c, exp: e.target.value }))} required maxLength={7} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-cvc">CVC</Label>
                  <Input id="card-cvc" inputMode="numeric" placeholder="123" value={card.cvc} onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value }))} required maxLength={4} />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={status === "processing"}
                className="w-full gradient-sun text-deep font-semibold shadow-glow hover:opacity-90"
              >
                {status === "processing" ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <><Lock className="mr-2 h-4 w-4" /> Pay $25 & lock in price</>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Demo mode — no real charge is made. Wire up Stripe when ready to go live.
              </p>
            </form>
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
