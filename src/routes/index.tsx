import { createFileRoute, Link } from "@tanstack/react-router";
import { Sun, ArrowRight } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { HeroIllustration } from "@/components/hero-illustration";
import { SolarPanelSparkIcon, LockPriceIcon, CedarSunIcon } from "@/components/brand-icons";
import { ARTICLES } from "@/lib/news-articles";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const preview = ARTICLES.slice(0, 3);
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full gradient-sun opacity-40 blur-3xl" />
        <HeroIllustration />
        <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
              <Sun className="h-3.5 w-3.5 text-accent" /> Built for Lebanese conditions
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] text-white md:text-7xl">
              SolarLeb
            </h1>
            <p className="mt-4 text-xl font-medium text-white/90 md:text-2xl">
              Reliable power for Lebanon's harsh conditions.
            </p>
            <p className="mt-6 max-w-2xl text-base text-white/75 md:text-lg">
              The grid is unreliable. Diesel generators are expensive, loud, and getting worse.
              Yet Lebanon has some of the best solar potential in the Mediterranean — over 300 sunny
              days a year. SolarLeb uses AI to design a system tailored to your home, budget, and
              region, then locks in today's prices while the market moves.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gradient-sun text-deep font-semibold shadow-glow hover:opacity-90">
                <Link to="/plan">
                  Get Your Free Plan <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/15">
                <Link to="/news">Read the latest</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-4 py-16" data-reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { Icon: SolarPanelSparkIcon, title: "AI-designed system", body: "Answer 5 quick questions and get a tailored panel + battery recommendation in seconds." },
            { Icon: LockPriceIcon, title: "Price lock guarantee", body: "A $25 deposit locks in today's panel and battery prices for 30 days — fully credited to your install." },
            { Icon: CedarSunIcon, title: "Built for Lebanon", body: "Sized for 40°C summers, dust, and long generator hours — not generic templates from abroad." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <f.Icon className="mb-4 h-16 w-16" />
              <h3 className="font-display text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>




      {/* News preview */}
      <section className="mx-auto max-w-6xl px-4 py-16" data-reveal>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Latest news</h2>
            <p className="mt-2 text-muted-foreground">Solar tech, policy, and stories from across Lebanon.</p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/news">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {preview.map((a) => (
            <Link
              key={a.slug}
              to="/news"
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={a.imageUrl}
                  alt={a.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-deep">
                  {a.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs text-muted-foreground">{a.date}</p>
                <h3 className="mt-1 font-display text-lg font-semibold text-foreground group-hover:text-primary">
                  {a.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{a.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16" data-reveal>
        <div className="overflow-hidden rounded-3xl bg-deep p-10 text-center shadow-glow md:p-16">
          <h2 className="font-display text-3xl font-bold text-deep-foreground md:text-4xl">
            Ready to see your solar plan?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-deep-foreground/75">
            Free, AI-generated in under a minute. No commitment until you're ready.
          </p>
          <Button asChild size="lg" className="mt-8 gradient-sun text-deep font-semibold shadow-glow hover:opacity-90">
            <Link to="/plan">Get Your Free Plan <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
