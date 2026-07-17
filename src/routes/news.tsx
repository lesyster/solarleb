import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, ArrowLeft } from "lucide-react";

import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { ARTICLES, type Article } from "@/lib/news-articles";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News & Insights — SolarLeb" },
      { name: "description", content: "Solar technology, policy, and community stories from across Lebanon." },
      { property: "og:title", content: "News & Insights — SolarLeb" },
      { property: "og:description", content: "Battery tech, government incentives, maintenance tips, and community solar stories." },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const [selected, setSelected] = useState<Article | null>(null);
  const { user } = useAuth();

  if (selected) {
    return <ArticleView article={selected} user={!!user} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">News & Insights</h1>
          <p className="mt-2 text-muted-foreground">Solar tech, policy, and community stories from across Lebanon.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {ARTICLES.map((a) => (
            <article
              key={a.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={a.imageUrl}
                  alt={a.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-deep shadow-sm">
                  {a.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs text-muted-foreground">{a.date}</p>
                <h2 className="mt-2 font-display text-xl font-bold text-foreground">{a.title}</h2>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{a.excerpt}</p>
                <div className="mt-5">
                  <Button
                    variant="outline"
                    onClick={() => setSelected(a)}
                  >
                    {user ? "Read article" : (<><Lock className="mr-2 h-3.5 w-3.5" /> Login to read more</>)}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function ArticleView({ article, user, onBack }: { article: Article; user: boolean; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to news
        </Button>
        <p className="text-xs font-medium uppercase tracking-wider text-accent">{article.category} · {article.date}</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-foreground md:text-5xl">{article.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>

        <div className="mt-8 border-t border-border pt-8">
          {user ? (
            <div className="prose prose-slate max-w-none space-y-4 text-foreground">
              {article.body.split("\n\n").map((p, i) => (
                <p key={i} className="leading-relaxed">{p}</p>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/40 p-8 text-center">
              <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="mt-4 font-display text-xl font-bold text-foreground">Sign in to keep reading</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Full articles are available to SolarLeb members. It's free to create an account.
              </p>
              <Button asChild className="mt-6 bg-deep text-deep-foreground hover:bg-deep/90">
                <Link to="/auth">Login or sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
