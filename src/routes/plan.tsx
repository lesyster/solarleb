import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Sun, Battery, DollarSign, TrendingDown, Clock, Lock, Sparkles, PanelTop, BatteryCharging } from "lucide-react";

const LOADING_PHRASES = [
  "Reading your inputs...",
  "Sizing your panels...",
  "Crunching the sun math...",
  "Cogitating...",
  "Crystallizing your plan...",
  "Balancing your battery...",
  "Finalizing your numbers...",
];
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEBANON_CITIES, PROPERTY_TYPES, generatePlan, type PlanResult } from "@/lib/solar-config";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PlanWalkthrough } from "@/components/plan-walkthrough";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Get a Free Solar Plan — SolarLeb" },
      { name: "description", content: "Answer a few quick questions and get an AI-generated solar system recommendation for your Lebanese home or business." },
      { property: "og:title", content: "Get a Free Solar Plan — SolarLeb" },
      { property: "og:description", content: "AI-generated solar recommendations for Lebanon: system size, battery, cost, savings, and payback." },
    ],
  }),
  component: PlanPage,
});

function PlanPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [loadingPhraseIdx, setLoadingPhraseIdx] = useState(0);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [hoursError, setHoursError] = useState<string | null>(null);

  useEffect(() => {
    if (!submitting) return;
    setLoadingPhraseIdx(0);
    const id = setInterval(() => {
      setLoadingPhraseIdx((i) => (i + 1) % LOADING_PHRASES.length);
    }, 1200);
    return () => clearInterval(id);
  }, [submitting]);

  const [form, setForm] = useState({
    city: "",
    monthly_bill: "",
    generator_hours: "",
    property_type: "",
    monthly_kwh: "",
  });

  function updateHours(raw: string) {
    if (raw === "") {
      setForm((f) => ({ ...f, generator_hours: "" }));
      setHoursError(null);
      return;
    }
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    const clamped = Math.max(0, Math.min(24, n));
    setForm((f) => ({ ...f, generator_hours: String(clamped) }));
    setHoursError(clamped !== n ? "Enter a value between 0 and 24" : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.city || !form.property_type) {
      toast.error("Please fill in all required fields");
      return;
    }
    const monthly_bill = Number(form.monthly_bill);
    const generator_hours = Number(form.generator_hours);
    if (!(monthly_bill > 0)) {
      toast.error("Please enter valid numbers");
      return;
    }
    if (
      form.generator_hours === "" ||
      Number.isNaN(generator_hours) ||
      generator_hours < 0 ||
      generator_hours > 24
    ) {
      setHoursError("Enter a value between 0 and 24");
      toast.error("Generator hours must be between 0 and 24");
      return;
    }

    setSubmitting(true);
    setResult(null);
    setPlanId(null);

    try {
      const input = {
        city: form.city,
        monthly_bill,
        generator_hours,
        property_type: form.property_type,
        monthly_kwh: form.monthly_kwh ? Number(form.monthly_kwh) : null,
      };

      const plan = await generatePlan(input);
      setResult(plan);

      // Try to save to database, but don't block UX if it fails
      let savedId: string | null = null;
      try {
        const { data, error } = await supabase
          .from("plans")
          .insert({
            city: input.city,
            monthly_bill: input.monthly_bill,
            generator_hours: input.generator_hours,
            property_type: input.property_type,
            monthly_kwh: input.monthly_kwh,
            recommended_system_kw: plan.recommended_system_kw,
            recommended_battery: plan.recommended_battery,
            estimated_cost_low: plan.estimated_cost_low,
            estimated_cost_high: plan.estimated_cost_high,
            estimated_savings: plan.estimated_savings,
            payback_period: plan.payback_period,
            explanation_text: plan.explanation_text,
            user_id: user?.id ?? null,
          })
          .select("id")
          .single();
        if (error) {
          console.warn("[SolarLeb] failed to save plan", error);
        } else if (data?.id) {
          savedId = data.id as string;
        }
      } catch (dbErr) {
        console.warn("[SolarLeb] plan insert threw", dbErr);
      }
      setPlanId(savedId);

      toast.success("Your solar plan is ready");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong generating your plan. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleLockIn() {
    if (!planId) return;
    if (!user) {
      toast.info("Please sign in to lock your price", { duration: 4000 });
      navigate({ to: "/auth", search: { next: `/payment?plan=${planId}` } as never });
      return;
    }
    navigate({ to: "/payment", search: { plan: planId } as never });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="relative">
        {/* Background: aerial solar farm photo, dimmed by cream overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1800&q=80')",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-background/90" />

        <PlanWalkthrough />
        <div className="relative mx-auto max-w-3xl px-4 py-12 md:py-16">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" /> Free · Takes 60 seconds
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            Get your custom solar plan
          </h1>
          <p className="mt-3 text-muted-foreground">
            Tell us about your home. Our AI will design a system sized for your usage and region.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-card md:p-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2" data-walkthrough="city">
              <Label htmlFor="city">City / region <span className="text-destructive">*</span></Label>
              <Select value={form.city} onValueChange={(v) => setForm((f) => ({ ...f, city: v }))}>
                <SelectTrigger id="city"><SelectValue placeholder="Select region" /></SelectTrigger>
                <SelectContent>
                  {LEBANON_CITIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2" data-walkthrough="property_type">
              <Label htmlFor="property_type">Property type <span className="text-destructive">*</span></Label>
              <Select value={form.property_type} onValueChange={(v) => setForm((f) => ({ ...f, property_type: v }))}>
                <SelectTrigger id="property_type"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2" data-walkthrough="monthly_bill">
              <Label htmlFor="monthly_bill">Monthly electricity bill (USD) <span className="text-destructive">*</span></Label>
              <Input
                id="monthly_bill"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 120"
                value={form.monthly_bill}
                onChange={(e) => setForm((f) => ({ ...f, monthly_bill: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2" data-walkthrough="generator_hours">
              <Label htmlFor="generator_hours">Generator hours per day <span className="text-destructive">*</span></Label>
              <Input
                id="generator_hours"
                type="number"
                min={0}
                max={24}
                step="0.5"
                inputMode="decimal"
                placeholder="e.g. 6"
                value={form.generator_hours}
                onChange={(e) => updateHours(e.target.value)}
                onBlur={(e) => updateHours(e.target.value)}
                aria-invalid={!!hoursError}
                aria-describedby={hoursError ? "generator_hours_error" : undefined}
                required
              />
              {hoursError ? (
                <p id="generator_hours_error" className="text-xs font-medium text-destructive">
                  {hoursError}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="monthly_kwh">Rough monthly usage in kWh <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                id="monthly_kwh"
                type="number"
                min="0"
                step="1"
                placeholder="Leave blank if unknown — we'll estimate"
                value={form.monthly_kwh}
                onChange={(e) => setForm((f) => ({ ...f, monthly_kwh: e.target.value }))}
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full bg-deep text-deep-foreground hover:bg-deep/90"
          >
            {submitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing your energy needs...</>
            ) : (
              <>Generate My Plan</>
            )}
          </Button>
        </form>

        {result && (
          <div className="mt-10 space-y-6">
            <div className="rounded-2xl border border-accent/40 bg-card p-6 shadow-glow md:p-8">
              <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-foreground/70">
                <Sparkles className="h-4 w-4 text-accent" /> Your recommendation
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">Recommended system size</p>
                <p className="mt-2 font-display text-7xl font-bold text-foreground md:text-8xl">
                  {result.recommended_system_kw}
                  <span className="ml-2 text-3xl font-medium text-accent md:text-4xl">kW</span>
                </p>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2">
                <StatCard icon={Battery} label="Battery capacity" value={result.recommended_battery} />
                <StatCard
                  icon={DollarSign}
                  label="Est. installation cost"
                  value={`$${result.estimated_cost_low.toLocaleString()} – $${result.estimated_cost_high.toLocaleString()}`}
                />
                <StatCard
                  icon={TrendingDown}
                  label="Est. monthly savings"
                  value={`$${result.estimated_savings.toLocaleString()}/mo`}
                />
                <StatCard icon={Clock} label="Payback period" value={result.payback_period} />
              </div>

              <div className="mt-8 rounded-xl bg-secondary/60 p-5">
                <p className="text-sm leading-relaxed text-secondary-foreground">
                  {result.explanation_text}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-accent bg-card p-6 md:p-8">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Lock in today's prices for 30 days
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A $25 deposit guarantees these panel and battery prices, fully credited toward installation.
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={handleLockIn}
                  disabled={!planId}
                  className="gradient-sun text-deep font-semibold shadow-glow hover:opacity-90 disabled:opacity-50"
                >
                  <Lock className="mr-2 h-4 w-4" /> Lock In This Price — $25
                </Button>
              </div>
              {!planId ? (
                <p className="mt-4 rounded-lg bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
                  <Link to="/auth" className="font-semibold text-foreground underline">Sign in</Link> to save and lock in this plan.
                </p>
              ) : !user ? (
                <p className="mt-4 rounded-lg bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
                  You'll need to <Link to="/auth" className="font-semibold text-foreground underline">sign in or create an account</Link> to lock in the price.
                </p>
              ) : null}
            </div>
          </div>
        )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
        <Icon className="h-4 w-4 text-deep" />
      </div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}
