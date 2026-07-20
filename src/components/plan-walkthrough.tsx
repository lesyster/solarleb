import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import pose1 from "@/assets/sami-pose-1.png.asset.json";
import pose2 from "@/assets/sami-pose-2.png.asset.json";
import pose3 from "@/assets/sami-pose-3.png.asset.json";
import pose4 from "@/assets/sami-pose-4.png.asset.json";
import pose5 from "@/assets/sami-pose-5.png.asset.json";
import pose6 from "@/assets/sami-pose-6.png.asset.json";
import samiAvatar from "@/assets/sami-avatar.png.asset.json";

const META_KEY = "plan_walkthrough_seen_v1";
const LOCAL_KEY = "solarleb.plan_walkthrough_seen";


type Step = {
  step: number;
  targetField: string | null; // matches [data-walkthrough="X"]
  pose: string;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    step: 1,
    targetField: null,
    pose: pose1.url,
    title: "Hey, I'm Sami 👋",
    description: "I'll walk you through the plan form in a few quick tips. Takes about a minute.",
  },
  {
    step: 2,
    targetField: "city",
    pose: pose2.url,
    title: "Your city",
    description: "Pick the region closest to you — sun hours vary across Lebanon and it changes system sizing.",
  },
  {
    step: 3,
    targetField: "property_type",
    pose: pose3.url,
    title: "Property type",
    description: "Apartments, houses, and small businesses use energy differently. This tunes the recommendation.",
  },
  {
    step: 4,
    targetField: "monthly_bill",
    pose: pose4.url,
    title: "Monthly bill (USD)",
    description: "Your typical EDL bill in dollars. Rough is fine — we just need a ballpark.",
  },
  {
    step: 5,
    targetField: "generator_hours",
    pose: pose5.url,
    title: "Generator hours",
    description: "Average diesel-generator hours per day (0–24). This is where solar saves you the most.",
  },
  {
    step: 6,
    targetField: null,
    pose: pose6.url,
    title: "You're all set!",
    description: "Fill in the form and hit Generate My Plan. I'll be here if you need me again.",
  },
];

export function PlanWalkthrough() {
  const { user, loading } = useAuth();
  const onboardingEnabled = true;
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [checking, setChecking] = useState(true);
  const [anchor, setAnchor] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [poseVisible, setPoseVisible] = useState(true);

  const current = STEPS[index];
  const isLast = index === STEPS.length - 1;

  // Preload all pose images once on mount
  useEffect(() => {
    STEPS.forEach((s) => {
      const img = new Image();
      img.src = s.pose;
    });
  }, []);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Decide visibility. Respect ?walkthrough=replay and ?walkthrough_step=N from admin.
  useEffect(() => {
    if (loading) return;
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const replay = params.get("walkthrough") === "replay";
    const jumpStep = params.get("walkthrough_step");

    if (replay) {
      try { localStorage.removeItem(LOCAL_KEY); } catch {}
      setIndex(0);
      setVisible(true);
      setChecking(false);
      return;
    }
    if (jumpStep) {
      const n = Math.max(1, Math.min(STEPS.length, Number(jumpStep) || 1));
      setIndex(n - 1);
      setVisible(true);
      setChecking(false);
      return;
    }

    if (!onboardingEnabled) {
      setVisible(false);
      setChecking(false);
      return;
    }
    if (localStorage.getItem(LOCAL_KEY) === "1") {
      setChecking(false);
      return;
    }
    const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
    if (user && meta[META_KEY] === true) {
      try { localStorage.setItem(LOCAL_KEY, "1"); } catch {}
      setChecking(false);
      return;
    }
    setVisible(true);
    setChecking(false);
  }, [user, loading, onboardingEnabled]);


  // Crossfade pose when step changes
  useEffect(() => {
    setPoseVisible(false);
    const t = setTimeout(() => setPoseVisible(true), 60);
    return () => clearTimeout(t);
  }, [index]);

  // Track anchor of current field — derived directly from current step config
  useEffect(() => {
    if (!visible) return;
    const targetField = current.targetField;
    if (!targetField) {
      setAnchor(null);
      return;
    }
    const findEl = () =>
      document.querySelector<HTMLElement>(`[data-walkthrough="${targetField}"]`);

    const update = () => {
      const el = findEl();
      if (!el) { setAnchor(null); return; }
      const r = el.getBoundingClientRect();
      setAnchor({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    // Scroll into view first, then keep measuring while the smooth scroll settles
    const el = findEl();
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    update();
    const raf = requestAnimationFrame(update);
    const interval = window.setInterval(update, 100);
    const stopTimer = window.setTimeout(() => window.clearInterval(interval), 800);

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(interval);
      window.clearTimeout(stopTimer);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };

  }, [visible, current.targetField]);

  async function dismiss() {
    setVisible(false);
    try { localStorage.setItem(LOCAL_KEY, "1"); } catch {}
    if (user) {
      const nextMeta = { ...(user.user_metadata ?? {}), [META_KEY]: true };
      await supabase.auth.updateUser({ data: nextMeta });
    }
  }

  const bubbleStyle: React.CSSProperties | undefined = useMemo(() => {
    if (!isDesktop || !anchor) return undefined;
    return {
      position: "fixed",
      top: anchor.top + anchor.height + 12,
      left: Math.max(16, Math.min(anchor.left, window.innerWidth - 380)),
      maxWidth: 340,
    };
  }, [isDesktop, anchor]);


  if (checking || !visible) return null;

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-40 bg-background/30 backdrop-blur-[1px] animate-in fade-in duration-300"
      />

      {anchor && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-40 rounded-lg ring-2 ring-accent ring-offset-2 ring-offset-background transition-all duration-300"
          style={{
            top: anchor.top - 4,
            left: anchor.left - 4,
            width: anchor.width + 8,
            height: anchor.height + 8,
          }}
        />
      )}

      <div className="pointer-events-none fixed bottom-0 left-4 z-50 hidden md:block animate-in slide-in-from-bottom-8 fade-in duration-500">
        <img
          key={current.step}
          src={current.pose}
          alt={`Sami — ${current.title}`}
          className={`h-[380px] w-auto max-w-[280px] object-contain drop-shadow-2xl select-none transition-opacity duration-300 ${poseVisible ? "opacity-100" : "opacity-0"}`}
          draggable={false}
        />
      </div>


      <div
        role="dialog"
        aria-live="polite"
        aria-label={current.title}
        className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-md rounded-2xl border border-accent/50 bg-card p-5 pl-20 shadow-glow animate-in fade-in slide-in-from-bottom-4 duration-300 md:absolute md:inset-x-auto md:bottom-auto md:pl-5"
        style={bubbleStyle}
      >
        <img
          src={samiAvatar.url}
          alt="Sami"
          className="absolute left-3 top-3 h-14 w-14 rounded-full border-2 border-accent object-cover shadow-md md:hidden"
          draggable={false}
        />

        <button
          type="button"
          onClick={dismiss}
          aria-label="Skip walkthrough"
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-xs font-semibold uppercase tracking-wider text-accent-foreground/70">
          Step {current.step} of {STEPS.length}
        </p>
        <h3 className="mt-1 font-display text-lg font-bold text-foreground">{current.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{current.description}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={dismiss}
            className="text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
          >
            Skip
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <Button variant="outline" size="sm" onClick={() => setIndex((i) => i - 1)}>
                Back
              </Button>
            )}
            {!isLast ? (
              <Button
                size="sm"
                onClick={() => setIndex((i) => i + 1)}
                className="bg-deep text-deep-foreground hover:bg-deep/90"
              >
                Next
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={dismiss}
                className="gradient-sun text-deep font-semibold hover:opacity-90"
              >
                Yes, understood
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
