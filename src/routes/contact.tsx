import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { EmailIcon, LocationIcon, MessageIcon } from "@/components/brand-icons";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — SolarLeb" },
      { name: "description", content: "Get in touch with the SolarLeb team about solar installation, pricing, or partnerships." },
      { property: "og:title", content: "Contact — SolarLeb" },
      { property: "og:description", content: "Reach the SolarLeb team about solar installation, pricing, or partnerships." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();
    if (!name || !email || !message) {
      toast.error("Please fill in all fields");
      return;
    }
    if (name.length > 100 || email.length > 255 || message.length > 2000) {
      toast.error("Please shorten your input");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({ name, email, message });
    setSubmitting(false);

    if (error) {
      console.error(error);
      toast.error("Couldn't send your message. Please try again.");
      return;
    }
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Contact us</h1>
          <p className="mt-3 text-muted-foreground">Questions about installation, pricing, or partnerships? We're here.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_2fr]" data-reveal>
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <EmailIcon className="mb-3 h-12 w-12" />
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
              <p className="mt-1 font-medium text-foreground">SolarLeb@gmail.com</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <LocationIcon className="mb-3 h-12 w-12" />
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Serving</p>
              <p className="mt-1 font-medium text-foreground">All of Lebanon</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
            {done ? (
              <div className="py-12 text-center">
                <MessageIcon className="mx-auto mb-4 h-16 w-16" />
                <h2 className="font-display text-2xl font-bold text-foreground">Message received</h2>
                <p className="mt-2 text-muted-foreground">We'll get back to you within 24–48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} required maxLength={2000} />
                </div>
                <Button type="submit" disabled={submitting} size="lg" className="w-full bg-deep text-deep-foreground hover:bg-deep/90">
                  {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>) : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
