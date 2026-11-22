import { supabase } from "./supabase"

type LogPayload = {
  action: string
  entity_type: "user" | "listing" | "report" | "category" | "conversation" | "system"
  entity_id?: string | null
  entity_label?: string | null
  details?: Record<string, any>
}

export async function logActivity(payload: LogPayload) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch admin name once (cached would be better, but fine for now)
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single()

    await supabase.from("admin_activity_log").insert({
      admin_id: user.id,
      admin_name: profile?.full_name || "Admin",
      action: payload.action,
      entity_type: payload.entity_type,
      entity_id: payload.entity_id || null,
      entity_label: payload.entity_label || null,
      details: payload.details || null,
    })
  } catch (err) {
    console.warn("Activity log failed (non-blocking):", err)
  }
}