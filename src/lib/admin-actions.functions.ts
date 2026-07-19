import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ALLOWED_TABLES = [
  "login_events",
  "plans",
  "contact_messages",
  "error_logs",
  "admin_audit_log",
] as const;

async function assertAdmin(context: { supabase: ReturnType<typeof Object>; userId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supa: any = context.supabase;
  const { data: isAdmin, error } = await supa.rpc("has_role", {
    _role: "admin",
    _user_id: context.userId,
  });
  if (error) throw new Error(error.message);
  if (!isAdmin) throw new Error("Forbidden");
}

export const adminDeleteRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z.object({ table: z.enum(ALLOWED_TABLES), id: z.string().uuid() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // Use the authenticated Supabase client so RLS ("Admins can delete ...")
    // enforces access. Avoids needing the service-role key.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa: any = context.supabase;
    const { error } = await supa.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminWipeAll = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa: any = context.supabase;
    const { data: userData } = await supa.auth.getUser();
    const email = userData?.user?.email ?? "";

    // Log first so the record survives.
    await supa.from("admin_audit_log").insert({
      actor_id: context.userId,
      actor_email: email,
      action: "data.wipe_all",
      target: null,
      details: { wiped: ["plans", "login_events", "contact_messages", "error_logs"] } as never,
    });

    const tables = ["plans", "login_events", "contact_messages", "error_logs"] as const;
    for (const t of tables) {
      const { error } = await supa
        .from(t)
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw new Error(`${t}: ${error.message}`);
    }
    return { ok: true };
  });
