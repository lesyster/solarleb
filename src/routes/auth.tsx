import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Sun } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type AuthSearch = { next?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    next: typeof search.next === "string" ? search.next : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Login or Sign Up — SolvoraLB" },
      { name: "description", content: "Sign in to your SolvoraLB account to save plans and lock in solar prices." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      const dest = search.next && search.next.startsWith("/") ? search.next : "/dashboard";
      navigate({ to: dest, replace: true });
    }
  }, [user, loading, search.next, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-sun shadow-glow">
            <Sun className="h-7 w-7 text-deep" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Welcome to SolvoraLB</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to save your solar plans.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-6">
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <SignupForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Signed in");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-deep text-deep-foreground hover:bg-deep/90">
        {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</>) : "Log in"}
      </Button>
    </form>
  );
}

function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created — check your email to confirm, then sign in.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
        <p className="text-xs text-muted-foreground">At least 6 characters.</p>
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-deep text-deep-foreground hover:bg-deep/90">
        {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…</>) : "Create account"}
      </Button>
    </form>
  );
}
