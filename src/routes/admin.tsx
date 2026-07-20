import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Shield, RefreshCw, AlertTriangle, LogIn, FileText, ScrollText,
  UserCog, Loader2, Eye, Trash2, Plus, Mail,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, auditLog, WALKTHROUGH_LOCAL_KEY, WALKTHROUGH_META_KEY } from "@/lib/admin";
import { adminDeleteRow, adminWipeAll } from "@/lib/admin-actions.functions";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — SolvoraLB" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

// ---------- types ----------
type LoginEvent = { id: string; email: string; created_at: string };
type PlanRow = {
  id: string; created_at: string; user_email: string | null; city: string;
  property_type: string; status: string; monthly_bill: number;
  generator_hours: number; monthly_kwh: number | null;
  recommended_system_kw: number | null; recommended_battery: string | null;
  estimated_cost_low: number | null; estimated_cost_high: number | null;
  estimated_savings: number | null; payback_period: string | null;
  explanation_text: string | null; user_id: string | null;
};
type ErrorRow = {
  id: string; created_at: string; source: string; message: string; context: unknown;
};
type AuditRow = {
  id: string; created_at: string; actor_email: string; action: string;
  target: string | null; details: unknown;
};
type AdminUser = { id: string; email: string; last_sign_in_at: string | null };

const PAGE_SIZE = 20;

// ---------- page shell ----------
function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin, loading, user } = useIsAdmin();

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      toast.error("Admin access required");
      navigate({ to: "/" });
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-16 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking access…
        </div>
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background">
        <SiteNav />

        <div className="border-b border-accent/30 bg-accent/10">
          <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-xs font-medium text-accent-foreground">
            <Shield className="h-3.5 w-3.5 text-accent" />
            Admin mode — signed in as {user?.email}
          </div>
        </div>

        <main className="mx-auto max-w-6xl px-4 py-10">
          <header className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-foreground/70">
              Admin
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold text-foreground md:text-4xl">
              SolvoraLB control room
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Internal tools for the SolvoraLB team.
            </p>
          </header>

          <div className="space-y-10">
            <WalkthroughSection />
            <LoginsSection />
            <PlanGenerationsSection />
            <ContactMessagesSection />
            <ErrorsSection />
            <AuditLogSection />
            <RoleManagementSection />
          </div>

          <DangerZoneSection />
        </main>

        <SiteFooter />
      </div>
    </TooltipProvider>
  );
}

// ---------- section wrapper ----------
function Section({
  icon: Icon, title, description, action, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-secondary">
              <Icon className="h-4 w-4 text-accent" />
            </span>
            <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
          </div>
          {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <Card className="overflow-hidden border-border bg-card">{children}</Card>
    </section>
  );
}

function TableSkeleton({ rows = 4, cols = 3 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-12 text-center text-sm text-muted-foreground">{children}</div>;
}

// ---------- delete confirmation ----------
function DeleteConfirmDialog({
  open, onCancel, onConfirm, title, description, busy,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  busy?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={busy}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteRowButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <Button size="sm" variant="ghost" onClick={onClick} aria-label="Delete row">
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}

// ---------- time helpers ----------
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.round((now - then) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.round(diff / 60);
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  return `${Math.round(months / 12)}y ago`;
}
function fullDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
function TimeCell({ iso }: { iso: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help whitespace-nowrap text-muted-foreground">{relativeTime(iso)}</span>
      </TooltipTrigger>
      <TooltipContent>{fullDate(iso)}</TooltipContent>
    </Tooltip>
  );
}

// ---------- 1. walkthrough ----------
function WalkthroughSection() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function replay() {
    setBusy(true);
    try {
      try { localStorage.removeItem(WALKTHROUGH_LOCAL_KEY); } catch { /* ignore */ }
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const meta = { ...(data.user.user_metadata ?? {}), [WALKTHROUGH_META_KEY]: false };
        await supabase.auth.updateUser({ data: meta });
      }
      await auditLog("walkthrough.replay", null);
      toast.success("Walkthrough reset — opening the plan page");
      navigate({ to: "/plan", search: { walkthrough: "replay" } as never });
    } catch (e) {
      toast.error("Could not reset walkthrough");
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section
      icon={RefreshCw}
      title="Sami walkthrough"
      description="Reset your onboarding flag and reopen the plan page with Sami running from step 1."
    >
      <div className="flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Useful for previewing tweaks to the Sami tour on your own account.
        </p>
        <Button onClick={replay} disabled={busy} className="bg-deep text-deep-foreground hover:bg-deep/90">
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Replay Sami walkthrough
        </Button>
      </div>
    </Section>
  );
}

// ---------- generic paginated hook ----------
function useLoadMore<T>(
  fetcher: (offset: number, limit: number) => Promise<{ data: T[]; total: number | null }>,
  deps: unknown[] = [],
) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(async (reset: boolean) => {
    if (reset) setLoading(true); else setMore(true);
    try {
      const offset = reset ? 0 : rows.length;
      const { data, total } = await fetcher(offset, PAGE_SIZE);
      const next = reset ? data : [...rows, ...data];
      setRows(next);
      if (typeof total === "number") setHasMore(next.length < total);
      else setHasMore(data.length === PAGE_SIZE);
    } finally {
      setLoading(false); setMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length, ...deps]);

  useEffect(() => { load(true); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { rows, loading, more, hasMore, loadMore: () => load(false), refresh: () => load(true), setRows };
}

// ---------- shared delete hook ----------
function useAdminDelete<T extends { id: string }>(
  table: "login_events" | "plans" | "contact_messages" | "error_logs" | "admin_audit_log",
  setRows: React.Dispatch<React.SetStateAction<T[]>>,
  auditAction: string,
  targetLabel: (row: T) => string,
) {
  const deleteRow = useServerFn(adminDeleteRow);
  const [confirmRow, setConfirmRow] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    if (!confirmRow) return;
    setBusy(true);
    try {
      await deleteRow({ data: { table, id: confirmRow.id } });
      await auditLog(auditAction, targetLabel(confirmRow));
      setRows((r) => r.filter((x) => x.id !== confirmRow.id));
      toast.success("Deleted");
      setConfirmRow(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return { confirmRow, setConfirmRow, busy, handleConfirm };
}

// ---------- 2. logins ----------
function LoginsSection() {
  const { rows, loading, more, hasMore, loadMore, refresh, setRows } = useLoadMore<LoginEvent>(
    async (offset, limit) => {
      const { data, count } = await supabase
        .from("login_events")
        .select("id, email, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      return { data: (data ?? []) as LoginEvent[], total: count };
    },
  );
  const del = useAdminDelete<LoginEvent>("login_events", setRows, "login_event.delete", (r) => r.email);

  return (
    <>
      <Section
        icon={LogIn}
        title="Recent logins"
        description="Most recent user sign-ins, newest first."
        action={<Button variant="outline" size="sm" onClick={refresh}>Refresh</Button>}
      >
        {loading ? (
          <TableSkeleton rows={4} cols={2} />
        ) : rows.length === 0 ? (
          <EmptyState>No recent logins yet</EmptyState>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.email}</TableCell>
                      <TableCell><TimeCell iso={r.created_at} /></TableCell>
                      <TableCell className="text-right">
                        <DeleteRowButton onClick={() => del.setConfirmRow(r)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {hasMore && (
              <div className="border-t border-border p-3 text-center">
                <Button variant="outline" size="sm" onClick={loadMore} disabled={more}>
                  {more ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </Section>
      <DeleteConfirmDialog
        open={!!del.confirmRow}
        busy={del.busy}
        onCancel={() => del.setConfirmRow(null)}
        onConfirm={del.handleConfirm}
        title="Delete this login record?"
        description="This permanently removes the login event. Cannot be undone."
      />
    </>
  );
}

// ---------- 3. plan generations ----------
function PlanGenerationsSection() {
  const [selected, setSelected] = useState<PlanRow | null>(null);
  const { rows, loading, more, hasMore, loadMore, refresh, setRows } = useLoadMore<PlanRow>(
    async (offset, limit) => {
      const { data, count } = await supabase
        .from("plans")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      return { data: (data ?? []) as PlanRow[], total: count };
    },
  );
  const del = useAdminDelete<PlanRow>("plans", setRows, "plan.delete", (r) => r.id);

  return (
    <>
      <Section
        icon={FileText}
        title="Recent plan generations"
        description="Every solar plan the AI has produced. Click a row for full inputs and output."
        action={<Button variant="outline" size="sm" onClick={refresh}>Refresh</Button>}
      >
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : rows.length === 0 ? (
          <EmptyState>No plan generations yet</EmptyState>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">{r.user_email ?? "—"}</TableCell>
                      <TableCell><TimeCell iso={r.created_at} /></TableCell>
                      <TableCell>{r.city}</TableCell>
                      <TableCell>{r.property_type}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === "failed" ? "destructive" : "secondary"}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm" variant="ghost"
                          onClick={(e) => { e.stopPropagation(); setSelected(r); }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DeleteRowButton
                          onClick={(e) => { e.stopPropagation(); del.setConfirmRow(r); }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {hasMore && (
              <div className="border-t border-border p-3 text-center">
                <Button variant="outline" size="sm" onClick={loadMore} disabled={more}>
                  {more ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </Section>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Plan detail</DialogTitle>
            {selected && (
              <DialogDescription>
                {selected.user_email ?? "anonymous"} · {fullDate(selected.created_at)}
              </DialogDescription>
            )}
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inputs</h4>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-muted-foreground">City</dt><dd>{selected.city}</dd>
                  <dt className="text-muted-foreground">Property</dt><dd>{selected.property_type}</dd>
                  <dt className="text-muted-foreground">Monthly bill</dt><dd>${selected.monthly_bill}</dd>
                  <dt className="text-muted-foreground">Generator hrs/day</dt><dd>{selected.generator_hours}</dd>
                  <dt className="text-muted-foreground">Monthly kWh</dt><dd>{selected.monthly_kwh ?? "—"}</dd>
                </dl>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Output</h4>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-muted-foreground">System kW</dt><dd>{selected.recommended_system_kw ?? "—"}</dd>
                  <dt className="text-muted-foreground">Battery</dt><dd>{selected.recommended_battery ?? "—"}</dd>
                  <dt className="text-muted-foreground">Cost range</dt><dd>${selected.estimated_cost_low ?? "—"}–${selected.estimated_cost_high ?? "—"}</dd>
                  <dt className="text-muted-foreground">Est. savings</dt><dd>{selected.estimated_savings ?? "—"}</dd>
                  <dt className="text-muted-foreground">Payback</dt><dd>{selected.payback_period ?? "—"}</dd>
                </dl>
                {selected.explanation_text && (
                  <p className="mt-3 rounded-lg bg-secondary/60 p-3 text-sm">{selected.explanation_text}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!del.confirmRow}
        busy={del.busy}
        onCancel={() => del.setConfirmRow(null)}
        onConfirm={del.handleConfirm}
        title="Delete this submission?"
        description="This permanently removes the plan record. Cannot be undone."
      />
    </>
  );
}

// ---------- 4. errors ----------
function ErrorsSection() {
  const { rows, loading, more, hasMore, loadMore, refresh, setRows } = useLoadMore<ErrorRow>(
    async (offset, limit) => {
      const { data, count } = await supabase
        .from("error_logs")
        .select("id, created_at, source, message, context", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      return { data: (data ?? []) as ErrorRow[], total: count };
    },
  );
  const del = useAdminDelete<ErrorRow>("error_logs", setRows, "error_log.delete", (r) => r.source);

  return (
    <>
      <Section
        icon={AlertTriangle}
        title="Error logs"
        description="Recent frontend and API failures, newest first."
        action={<Button variant="outline" size="sm" onClick={refresh}>Refresh</Button>}
      >
        {loading ? (
          <TableSkeleton rows={4} cols={3} />
        ) : rows.length === 0 ? (
          <EmptyState>No errors logged</EmptyState>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">When</TableHead>
                    <TableHead className="w-[180px]">Source</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell><TimeCell iso={r.created_at} /></TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="font-mono text-[10px]">
                          {r.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md break-words text-sm">{r.message}</TableCell>
                      <TableCell className="text-right">
                        <DeleteRowButton onClick={() => del.setConfirmRow(r)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {hasMore && (
              <div className="border-t border-border p-3 text-center">
                <Button variant="outline" size="sm" onClick={loadMore} disabled={more}>
                  {more ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </Section>
      <DeleteConfirmDialog
        open={!!del.confirmRow}
        busy={del.busy}
        onCancel={() => del.setConfirmRow(null)}
        onConfirm={del.handleConfirm}
        title="Delete this error log?"
        description="This permanently removes the error record. Cannot be undone."
      />
    </>
  );
}

// ---------- contact messages ----------
type ContactRow = { id: string; created_at: string; name: string; email: string; message: string };
function ContactMessagesSection() {
  const [selected, setSelected] = useState<ContactRow | null>(null);
  const { rows, loading, more, hasMore, loadMore, refresh, setRows } = useLoadMore<ContactRow>(
    async (offset, limit) => {
      const { data, count } = await supabase
        .from("contact_messages")
        .select("id, created_at, name, email, message", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      return { data: (data ?? []) as ContactRow[], total: count };
    },
  );
  const del = useAdminDelete<ContactRow>("contact_messages", setRows, "contact_message.delete", (r) => r.email);

  return (
    <>
      <Section
        icon={Mail}
        title="Contact messages"
        description="Messages submitted through the Contact form."
        action={<Button variant="outline" size="sm" onClick={refresh}>Refresh</Button>}
      >
        {loading ? (
          <TableSkeleton rows={4} cols={3} />
        ) : rows.length === 0 ? (
          <EmptyState>No contact messages yet</EmptyState>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
                      <TableCell><TimeCell iso={r.created_at} /></TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.email}</TableCell>
                      <TableCell className="max-w-md truncate text-sm">{r.message}</TableCell>
                      <TableCell className="text-right">
                        <DeleteRowButton
                          onClick={(e) => { e.stopPropagation(); del.setConfirmRow(r); }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {hasMore && (
              <div className="border-t border-border p-3 text-center">
                <Button variant="outline" size="sm" onClick={loadMore} disabled={more}>
                  {more ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </Section>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Message from {selected?.name}</DialogTitle>
            {selected && (
              <DialogDescription>
                {selected.email} · {fullDate(selected.created_at)}
              </DialogDescription>
            )}
          </DialogHeader>
          {selected && (
            <p className="whitespace-pre-wrap rounded-lg bg-secondary/60 p-4 text-sm">{selected.message}</p>
          )}
          <DialogFooter>
            {selected && (
              <Button asChild variant="outline">
                <a href={`mailto:${selected.email}`}>Reply via email</a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!del.confirmRow}
        busy={del.busy}
        onCancel={() => del.setConfirmRow(null)}
        onConfirm={del.handleConfirm}
        title="Delete this contact message?"
        description="This permanently removes the message. Cannot be undone."
      />
    </>
  );
}


// ---------- 5. audit log ----------
function AuditLogSection() {
  const { rows, loading, more, hasMore, loadMore, refresh, setRows } = useLoadMore<AuditRow>(
    async (offset, limit) => {
      const { data, count } = await supabase
        .from("admin_audit_log")
        .select("id, created_at, actor_email, action, target, details", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      return { data: (data ?? []) as AuditRow[], total: count };
    },
  );
  const del = useAdminDelete<AuditRow>("admin_audit_log", setRows, "audit_log.delete", (r) => r.action);

  return (
    <>
      <Section
        icon={ScrollText}
        title="Admin audit log"
        description="Every admin action (walkthrough replays, deletions, role changes) is recorded here."
        action={<Button variant="outline" size="sm" onClick={refresh}>Refresh</Button>}
      >
        {loading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : rows.length === 0 ? (
          <EmptyState>No admin actions recorded yet</EmptyState>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell><TimeCell iso={r.created_at} /></TableCell>
                      <TableCell className="text-sm">{r.actor_email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-[10px]">{r.action}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[240px] truncate font-mono text-xs text-muted-foreground">
                        {r.target ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteRowButton onClick={() => del.setConfirmRow(r)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {hasMore && (
              <div className="border-t border-border p-3 text-center">
                <Button variant="outline" size="sm" onClick={loadMore} disabled={more}>
                  {more ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </Section>
      <DeleteConfirmDialog
        open={!!del.confirmRow}
        busy={del.busy}
        onCancel={() => del.setConfirmRow(null)}
        onConfirm={del.handleConfirm}
        title="Delete this audit entry?"
        description="This permanently removes the audit log entry. Cannot be undone."
      />
    </>
  );
}

// ---------- 6. role management (admins only) ----------
function RoleManagementSection() {
  const [admins, setAdmins] = useState<AdminUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [grantEmail, setGrantEmail] = useState("");
  const [granting, setGranting] = useState(false);
  const [confirm, setConfirm] = useState<AdminUser | null>(null);
  const { user: me } = useIsAdmin();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: usersData, error: usersErr }, { data: rolesData }] = await Promise.all([
        supabase.rpc("admin_list_users"),
        supabase.from("user_roles").select("user_id").eq("role", "admin"),
      ]);
      if (usersErr) throw usersErr;
      const adminIds = new Set((rolesData ?? []).map((r) => r.user_id));
      const all = (usersData ?? []) as AdminUser[];
      setAdmins(all.filter((u) => adminIds.has(u.id)));
    } catch (e) {
      toast.error("Failed to load admins");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function grantByEmail(e: React.FormEvent) {
    e.preventDefault();
    const email = grantEmail.trim();
    if (!email) return;
    setGranting(true);
    try {
      const { data: uid, error } = await supabase.rpc("admin_find_user_by_email", { _email: email });
      if (error) throw error;
      if (!uid) { toast.error(`No user found with email ${email}`); return; }
      const { error: insErr } = await supabase.from("user_roles").insert({ user_id: uid as string, role: "admin" });
      if (insErr && !/duplicate/i.test(insErr.message)) throw insErr;
      await auditLog("role.grant", email, { user_id: uid });
      toast.success(`${email} is now an admin`);
      setGrantEmail("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to grant admin");
    } finally {
      setGranting(false);
    }
  }

  async function revoke(user: AdminUser) {
    try {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", user.id).eq("role", "admin");
      if (error) throw error;
      await auditLog("role.revoke", user.email, { user_id: user.id });
      toast.success(`Revoked admin from ${user.email}`);
      setConfirm(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke role");
    }
  }

  return (
    <>
      <Section
        icon={UserCog}
        title="Admin role management"
        description="Only current admins are shown. Grant new admins by email above."
      >
        <form onSubmit={grantByEmail} className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row">
          <Input
            type="email" required placeholder="Grant admin by email (e.g. name@example.com)"
            value={grantEmail}
            onChange={(e) => setGrantEmail(e.target.value)}
            className="sm:max-w-sm"
          />
          <Button type="submit" disabled={granting || !grantEmail} className="bg-deep text-deep-foreground hover:bg-deep/90">
            {granting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Grant admin
          </Button>
        </form>

        {loading || !admins ? (
          <TableSkeleton rows={3} cols={3} />
        ) : admins.length === 0 ? (
          <EmptyState>No admins yet — grant one by email above.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Last sign-in</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((u) => {
                  const isSelf = me?.id === u.id;
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.email} {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
                      </TableCell>
                      <TableCell>
                        {u.last_sign_in_at ? <TimeCell iso={u.last_sign_in_at} /> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm" variant="outline"
                          disabled={isSelf}
                          onClick={() => setConfirm(u)}
                        >
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke admin role</DialogTitle>
            <DialogDescription>
              {confirm?.email} will lose access to the admin panel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => confirm && revoke(confirm)}
            >
              Revoke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- 7. danger zone ----------
function DangerZoneSection() {
  const wipe = useServerFn(adminWipeAll);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleWipe() {
    if (typed !== "DELETE") return;
    setBusy(true);
    try {
      await wipe({});
      toast.success("All data wiped");
      setOpen(false);
      setTyped("");
      // Reload so every section re-fetches its now-empty tables.
      window.location.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Wipe failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-16 border-t-2 border-destructive/40 pt-10">
      <div className="rounded-2xl border-2 border-destructive/60 bg-destructive/5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-destructive">
              <AlertTriangle className="h-5 w-5" /> Danger zone
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Permanently deletes <strong>all plans, logins, contact messages, and error logs</strong>.
              This action is logged in the audit log but cannot be undone.
            </p>
          </div>
          <Button
            variant="destructive"
            size="lg"
            onClick={() => setOpen(true)}
            className="shrink-0"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete all data
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(o) => { if (!o) { setOpen(false); setTyped(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete all data?</DialogTitle>
            <DialogDescription>
              This will permanently wipe plans, login events, contact messages, and error logs.
              Type <strong>DELETE</strong> below to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Type DELETE to confirm"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setTyped(""); }} disabled={busy}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={typed !== "DELETE" || busy}
              onClick={handleWipe}
            >
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Permanently delete everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
