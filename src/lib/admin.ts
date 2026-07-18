import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const WALKTHROUGH_LOCAL_KEY = "solarleb.plan_walkthrough_seen";
export const WALKTHROUGH_META_KEY = "plan_walkthrough_seen_v1";

export function useIsAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setIsAdmin(false); return; }
    let active = true;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => { if (active) setIsAdmin(!!data); });
    return () => { active = false; };
  }, [user, authLoading]);

  return { isAdmin, loading: authLoading || isAdmin === null, user };
}

export async function logError(source: string, message: string, context?: unknown) {
  try {
    await supabase.from("error_logs").insert({
      source,
      message,
      context: context ? (JSON.parse(JSON.stringify(context)) as never) : null,
    });
  } catch { /* logging must never break the app */ }
}

export async function auditLog(action: string, target: string | null, details?: unknown) {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;
    await supabase.from("admin_audit_log").insert({
      actor_id: user.id,
      actor_email: user.email ?? "",
      action,
      target,
      details: details ? (JSON.parse(JSON.stringify(details)) as never) : null,
    });
  } catch { /* swallow */ }
}
