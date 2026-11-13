// src/pages/Profile.tsx

import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../services/supabase"

type ProfileData = {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: string
  is_active: boolean
}

/* ──────────────────────────────────────────────────────────────────────────
   ICON SYSTEM
   ────────────────────────────────────────────────────────────────────────── */
type IconProps = { className?: string }
const Icon = {
  User: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  Mail: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  Phone: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  Lock: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  Eye: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  EyeOff: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ),
  ArrowRight: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  ArrowLeft: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  Alert: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  Check: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  Shield: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  Bolt: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  Sparkles: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  ),
  Tag: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    </svg>
  ),
  Image: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25z" />
    </svg>
  ),
  Store: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72" />
    </svg>
  ),
  ShoppingBag: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
    </svg>
  ),
  Key: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  ),
  ShieldCheck: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  ),
  Dashboard: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  Clock: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

/* ──────────────────────────────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────────────────────────────── */
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "U"
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function formatRole(role: string) {
  const n = role.toLowerCase()
  if (n === "buyer") return "Umuguzi"
  if (n === "seller") return "Umucuruzi"
  if (n === "admin") return "Umuyobozi"
  return role
}

function validateRwandanPhone(raw: string): boolean {
  const cleaned = raw.replace(/[\s\-\(\)]/g, "")
  const rwandaRegex = /^(?:\+?250|0)?7[2389]\d{7}$/
  return rwandaRegex.test(cleaned)
}

function getPasswordStrength(pw: string): { score: number; label: string; color: string; bar: string } {
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (pw.length === 0) return { score: 0, label: "", color: "text-slate-500", bar: "bg-slate-300" }
  if (score <= 1) return { score: 1, label: "Ntoya", color: "text-rose-600", bar: "bg-rose-500" }
  if (score === 2) return { score: 2, label: "Iri hagati", color: "text-amber-600", bar: "bg-amber-500" }
  if (score === 3) return { score: 3, label: "Nini", color: "text-blue-600", bar: "bg-blue-500" }
  if (score === 4) return { score: 4, label: "Nini cyane", color: "text-emerald-600", bar: "bg-emerald-500" }
  return { score: 5, label: "Ikomeye cyane", color: "text-emerald-600", bar: "bg-gradient-to-r from-emerald-500 to-teal-500" }
}

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

type TabKey = "general" | "security" | "activity"

/* ──────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [tab, setTab] = useState<TabKey>("general")
  const [focused, setFocused] = useState<string | null>(null)

  useEffect(() => { void loadProfile() }, [])

  async function loadProfile() {
    setLoading(true); setError("")
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) { setError("Ugomba kubanza kwinjira muri konti yawe."); return }
      setEmail(user.email ?? "")

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, phone, avatar_url, role, is_active")
        .eq("id", user.id).maybeSingle()

      if (profileError) { setError(`Ntitwashoboye kubona profile yawe. ${profileError.message}`); return }
      if (!data) { setError("Profile yawe ntiyabonetse."); return }

      setProfile(data)
      setFullName(data.full_name ?? "")
      setPhone(data.phone ?? "")
      setAvatarUrl(data.avatar_url ?? "")
    } catch (err) {
      console.error("PROFILE LOAD ERROR:", err)
      setError("Habaye ikibazo mu kubona amakuru ya profile yawe.")
    } finally {
      setLoading(false)
    }
  }

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { setError("Hitamo ifoto gusa (JPG, PNG, WebP)."); return }
    if (file.size > 2 * 1024 * 1024) { setError("Ifoto igomba kuba munsi ya 2MB."); return }
    setError("")
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(String(reader.result))
    reader.readAsDataURL(file)
  }

  function clearAvatarPreview() {
    setAvatarPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true); setMessage(""); setError("")
    try {
      if (!profile) { setError("Profile yawe ntiyabonetse."); return }

      const trimmedPhone = phone.trim()
      if (trimmedPhone && !validateRwandanPhone(trimmedPhone)) {
        setError("Nimero ya telefoni ntabwo yubahirije imiterere yo mu Rwanda (+250 cyangwa 07...).")
        return
      }

      const finalAvatar = avatarPreview || avatarUrl.trim() || null

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          phone: trimmedPhone || null,
          avatar_url: finalAvatar,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)
        .select("id, full_name, phone, avatar_url, role, is_active")
        .single()

      if (updateError) {
        if (updateError.message.includes("Nimero ya telefoni")) setError(updateError.message)
        else setError(`Ntibyashobotse kubika profile. ${updateError.message}`)
        return
      }

      setProfile(data)
      setFullName(data.full_name ?? "")
      setPhone(data.phone ?? "")
      setAvatarUrl(data.avatar_url ?? "")
      setAvatarPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      setMessage("Amakuru ya profile yawe yabitswe neza.")
    } catch (err: unknown) {
      console.error("PROFILE UPDATE ERROR:", err)
      setError(err instanceof Error ? err.message : "Habaye ikibazo mu kubika amakuru yawe.")
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail.trim()) return
    setSavingEmail(true); setMessage(""); setError("")
    try {
      const { error: emailError } = await supabase.auth.updateUser({ email: newEmail.trim() })
      if (emailError) { setError(`Ntibyashobotse guhindura email. ${emailError.message}`); return }
      setMessage("Email yahinduwe neza. Reba ubutumwa muri email yawe nshya kugira ngo uyemeze.")
      setEmail(newEmail.trim())
      setNewEmail("")
    } catch (err) {
      console.error("EMAIL UPDATE ERROR:", err)
      setError("Habaye ikibazo mu guhindura email.")
    } finally {
      setSavingEmail(false)
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!newPassword || !confirmPassword) { setError("Ugomba kuzuza amagambo yombi y'ibanga."); return }
    if (newPassword !== confirmPassword) { setError("Amagambo y'ibanga yombi ntahuye."); return }
    if (newPassword.length < 6) { setError("Ijambo ry'ibanga rigomba kugira nibura inyuguti 6."); return }

    setSavingPassword(true); setMessage(""); setError("")
    try {
      const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword })
      if (passwordError) { setError(`Ntibyashobotuye guhindura ijambo ry'ibanga. ${passwordError.message}`); return }
      setMessage("Ijambo ry'ibanga ryahinduwe neza.")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      console.error("PASSWORD UPDATE ERROR:", err)
      setError("Habaye ikibazo mu guhindura ijambo ry'ibanga.")
    } finally {
      setSavingPassword(false)
    }
  }

  const displayAvatar = avatarPreview || avatarUrl
  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword])
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword
  const showMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword
  const isPhoneValid = !phone.trim() || validateRwandanPhone(phone.trim())
  const isEmailValid = newEmail.includes("@") && newEmail.includes(".")

  const cCompleteness = useCountUp(
    ([fullName.trim(), phone.trim(), avatarUrl.trim()].filter(Boolean).length / 3) * 100
  )

  /* ─────────── LOADING ─────────── */
  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f8fb] dark:bg-[#060f19]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[140px] dark:bg-blue-500/[0.06]" />
          <div className="absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full bg-[#FF5D00]/10 blur-[140px] dark:bg-[#FF5D00]/[0.06]" />
        </div>
        <div className="relative w-full max-w-sm rounded-[2rem] border border-slate-200/70 bg-white/90 p-8 text-center shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          </div>
          <h2 className="mt-5 text-lg font-black text-slate-900 dark:text-white">Turabona profile yawe...</h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Tegereza akanya gato.</p>
        </div>
      </main>
    )
  }

  /* ─────────── MAIN ─────────── */
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f8fb] text-[#102436] dark:bg-[#060f19] dark:text-slate-100">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[140px] dark:bg-blue-500/[0.06]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-[#FF5D00]/10 blur-[140px] dark:bg-[#FF5D00]/[0.06]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[140px] dark:bg-indigo-500/[0.04]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2.5">
            
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="hidden items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-[#FF5D00] hover:text-[#FF5D00] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 sm:inline-flex"
            >
              <Icon.Dashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <Link
              to="/"
              className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] px-4 py-2 text-xs font-black text-white shadow-md shadow-[#FF5D00]/30 transition hover:-translate-y-0.5"
            >
              <Icon.ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              Ahabanza
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
       {/* Cover */}
<div className="relative h-40 overflow-hidden sm:h-48">
  <div className="absolute inset-0 bg-gradient-to-b from-slate-100/80 via-slate-50/40 to-transparent dark:from-white/[0.03] dark:via-white/[0.01] dark:to-transparent" />
  <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
  <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/[0.06] blur-3xl dark:bg-blue-500/[0.04]" />
  <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-indigo-500/[0.06] blur-3xl dark:bg-indigo-500/[0.04]" />

  <div className="absolute inset-x-0 top-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">
      <Icon.Sparkles className="w-3 h-3 text-[#FF5D00]" />
      Konti yanjye
    </div>
  </div>
</div>

        {/* Avatar + info */}
        <div className="relative mx-auto -mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-5">
              <div className="relative shrink-0">
                <div className="rounded-[1.75rem] bg-[#f4f8fb] p-1.5 shadow-2xl dark:bg-[#060f19]">
                  {displayAvatar ? (
                    <img
                      src={displayAvatar}
                      alt="Avatar"
                      className="h-24 w-24 rounded-[1.5rem] border-2 border-white object-cover shadow-lg dark:border-white/20 sm:h-28 sm:w-28"
                      onError={(e) => { e.currentTarget.style.display = "none" }}
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] border-2 border-white bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-black text-white shadow-lg dark:border-white/20 sm:h-28 sm:w-28">
                      {getInitials(fullName)}
                    </div>
                  )}
                </div>
                <span className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-[#f4f8fb] dark:border-[#060f19] ${profile?.is_active ? "bg-emerald-500" : "bg-rose-500"}`} />
              </div>

              <div className="pb-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  {fullName || "Umukoresha"}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {profile?.role === "seller" ? <Icon.Store className="w-3 h-3" /> : <Icon.ShoppingBag className="w-3 h-3" />}
                    {profile?.role ? formatRole(profile.role) : "Umukoresha"}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                    profile?.is_active
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}>
                    <Icon.ShieldCheck className="w-3 h-3" />
                    {profile?.is_active ? "Active" : "Inactive"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                    <Icon.Mail className="w-3 h-3" />
                    {email || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Completeness */}
            <div className="w-full shrink-0 rounded-2xl border border-slate-200/70 bg-white/80 p-3.5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60 sm:w-auto">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Umubare wuzuye</p>
                  <p className="mt-0.5 text-lg font-black text-slate-900 dark:text-white">
                    {cCompleteness}<span className="text-sm text-slate-400">%</span>
                  </p>
                </div>
                <div className="relative h-10 w-10">
                  <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-white/10" />
                    <circle
                      cx="18" cy="18" r="14" fill="none" stroke="url(#grad-progress)" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${(cCompleteness / 100) * 88} 88`}
                      style={{ transition: "stroke-dasharray 900ms cubic-bezier(0.16,1,0.3,1)" }}
                    />
                    <defs>
                      <linearGradient id="grad-progress">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <section className="relative mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto rounded-full border border-slate-200/70 bg-white/70 p-1 backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
          {[
            { key: "general" as TabKey, label: "Amakuru", icon: Icon.User },
            { key: "security" as TabKey, label: "Umutekano", icon: Icon.Lock },
            { key: "activity" as TabKey, label: "Ibikorwa", icon: Icon.Clock },
          ].map((t) => {
            const isActive = tab === t.key
            const TabIcon = t.icon
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#FF5D00] to-[#e05200] text-white shadow-md shadow-[#FF5D00]/25"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* CONTENT */}
      <section className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            {/* GENERAL TAB */}
            {tab === "general" && (
              <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4 dark:border-white/10">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Icon.User className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">Amakuru Rusange</p>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">Hindura profile yawe</h2>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5 p-6">
                  {/* Avatar */}
                  <div>
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300">Ifoto yawe</label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="relative">
                        {avatarPreview || avatarUrl ? (
                          <img
                            src={avatarPreview || avatarUrl}
                            alt="Preview"
                            className="h-16 w-16 rounded-2xl border border-slate-200 object-cover dark:border-white/10"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-white/10 dark:bg-white/[0.04]">
                            <Icon.User className="w-6 h-6" />
                          </div>
                        )}
                        {avatarPreview && (
                          <button
                            type="button"
                            onClick={clearAvatarPreview}
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white shadow-md"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <div className="flex-1">
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" id="avatar-upload" />
                        <label
                          htmlFor="avatar-upload"
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
                        >
                          <Icon.Image className="w-3.5 h-3.5" />
                          Hitamo ifoto
                        </label>
                        <p className="mt-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">JPG, PNG, WebP · Munsi ya 2MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300">Amazina yuzuye</label>
                    <div className="relative mt-2">
                      <span className={`pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center transition-colors ${focused === "name" ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>
                        <Icon.User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        onFocus={() => setFocused("name")}
                        onBlur={() => setFocused(null)}
                        placeholder="Andika amazina yawe"
                        className="h-12 w-full rounded-xl border border-slate-200/80 bg-slate-50/60 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300">
                      <span>Telefoni</span>
                      {phone && (
                        <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${isPhoneValid ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {isPhoneValid ? <Icon.Check className="w-3 h-3" /> : <Icon.Alert className="w-3 h-3" />}
                          {isPhoneValid ? "Byiza" : "Sibyo"}
                        </span>
                      )}
                    </label>
                    <div className="relative mt-2">
                      <span className={`pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center transition-colors ${focused === "phone" ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>
                        <Icon.Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onFocus={() => setFocused("phone")}
                        onBlur={() => setFocused(null)}
                        placeholder="07XXXXXXXX cyangwa +2507XXXXXXXX"
                        className={`h-12 w-full rounded-xl border bg-slate-50/60 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 ${
                          phone && !isPhoneValid
                            ? "border-rose-500/40 focus:border-rose-500 focus:ring-rose-500/10"
                            : "border-slate-200/80 focus:border-[#FF5D00] focus:ring-[#FF5D00]/10"
                        }`}
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">Izagufasha mu matangazo yawe yose.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="group relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] text-sm font-black text-white shadow-[0_16px_38px_-10px_rgba(255,93,0,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_-10px_rgba(255,93,0,0.85)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    {savingProfile ? (
                      <>
                        <span className="relative h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        <span className="relative">Turabika...</span>
                      </>
                    ) : (
                      <>
                        <Icon.Check className="relative w-4 h-4" />
                        <span className="relative">Bika amakuru ya profile</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* SECURITY TAB */}
            {tab === "security" && (
              <>
                {/* Email */}
                <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
                  <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4 dark:border-white/10">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Icon.Mail className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">Umutekano wa Konti</p>
                      <h2 className="text-sm font-black text-slate-900 dark:text-white">Hindura Email</h2>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateEmail} className="space-y-4 p-6">
                    <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.02]">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon.Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <div className="min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Email y'ubu</p>
                          <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{email || "—"}</p>
                        </div>
                      </div>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <Icon.Check className="w-3 h-3" />
                      </span>
                    </div>

                    <div>
                      <label className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300">
                        <span>Email nshya</span>
                        {newEmail && (
                          <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${isEmailValid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                            {isEmailValid ? <Icon.Check className="w-3 h-3" /> : <Icon.Alert className="w-3 h-3" />}
                            {isEmailValid ? "Byiza" : "Si email"}
                          </span>
                        )}
                      </label>
                      <div className="relative mt-2">
                        <span className={`pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center transition-colors ${focused === "new-email" ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>
                          <Icon.Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          onFocus={() => setFocused("new-email")}
                          onBlur={() => setFocused(null)}
                          placeholder="andika.email@example.com"
                          className="h-12 w-full rounded-xl border border-slate-200/80 bg-slate-50/60 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500"
                        />
                      </div>
                      <p className="mt-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        Uzamenyeshwa cyangwa usabwe kwemeza email nshya.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={savingEmail || !newEmail.trim()}
                      className="group relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#102436] text-sm font-black text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#1a3350] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/10"
                    >
                      {savingEmail ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          <span>Birimo koherezwa...</span>
                        </>
                      ) : (
                        <>
                          <Icon.ArrowRight className="w-4 h-4" />
                          <span>Hindura Email</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Password */}
                <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
                  <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4 dark:border-white/10">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF5D00]/10 text-[#FF5D00]">
                      <Icon.Key className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#FF5D00]">Ijambo ry'ibanga</p>
                      <h2 className="text-sm font-black text-slate-900 dark:text-white">Hindura Password</h2>
                    </div>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-4 p-6">
                    <div>
                      <label className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300">
                        <span>Password nshya</span>
                        {newPassword && (
                          <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${strength.color}`}>
                            <Icon.Bolt className="w-3 h-3" />
                            {strength.label}
                          </span>
                        )}
                      </label>
                      <div className="relative mt-2">
                        <span className={`pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center transition-colors ${focused === "new-pass" ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>
                          <Icon.Lock className="w-4 h-4" />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          onFocus={() => setFocused("new-pass")}
                          onBlur={() => setFocused(null)}
                          placeholder="Nibura inyuguti 6"
                          className="h-12 w-full rounded-xl border border-slate-200/80 bg-slate-50/60 pl-12 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-[#FF5D00]"
                        >
                          {showPassword ? <Icon.EyeOff className="w-4 h-4" /> : <Icon.Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {newPassword && (
                        <div className="mt-2 flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                i <= strength.score ? strength.bar : "bg-slate-200 dark:bg-white/10"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300">
                        <span>Wemeze password</span>
                        {confirmPassword && (
                          <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${passwordsMatch ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                            {passwordsMatch ? <Icon.Check className="w-3 h-3" /> : <Icon.Alert className="w-3 h-3" />}
                            {passwordsMatch ? "Bihuye" : "Ntibihuye"}
                          </span>
                        )}
                      </label>
                      <div className="relative mt-2">
                        <span className={`pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center transition-colors ${focused === "confirm-pass" ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>
                          <Icon.Lock className="w-4 h-4" />
                        </span>
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onFocus={() => setFocused("confirm-pass")}
                          onBlur={() => setFocused(null)}
                          placeholder="Ongera wandike password"
                          className={`h-12 w-full rounded-xl border bg-slate-50/60 pl-12 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 ${
                            showMismatch
                              ? "border-rose-500/40 focus:border-rose-500 focus:ring-rose-500/10"
                              : "border-slate-200/80 focus:border-[#FF5D00] focus:ring-[#FF5D00]/10"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((p) => !p)}
                          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-[#FF5D00]"
                        >
                          {showConfirm ? <Icon.EyeOff className="w-4 h-4" /> : <Icon.Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingPassword || !newPassword || !confirmPassword || !passwordsMatch}
                      className="group relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] text-sm font-black text-white shadow-[0_16px_38px_-10px_rgba(255,93,0,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_-10px_rgba(255,93,0,0.85)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      {savingPassword ? (
                        <>
                          <span className="relative h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          <span className="relative">Birimo guhinduka...</span>
                        </>
                      ) : (
                        <>
                          <Icon.ShieldCheck className="relative w-4 h-4" />
                          <span className="relative">Hindura Password</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* ACTIVITY TAB */}
            {tab === "activity" && (
              <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4 dark:border-white/10">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Icon.Clock className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Ibikorwa</p>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">Amakuru y'ikiganiro</h2>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  {[
                    { icon: Icon.ShieldCheck, label: "Konti yaremye", value: "—", tone: "emerald" },
                    { icon: Icon.Mail, label: "Email yemejwe", value: "—", tone: "blue" },
                    { icon: Icon.Phone, label: "Telefoni yongeweho", value: "—", tone: "indigo" },
                  ].map((item) => {
                    const ItemIcon = item.icon
                    const toneClass: Record<string, string> = {
                      emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                      blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                      indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
                    }
                    return (
                      <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 dark:border-white/10 dark:bg-white/[0.02]">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClass[item.tone]}`}>
                          <ItemIcon className="w-4 h-4" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-900 dark:text-white">{item.label}</p>
                          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{item.value}</p>
                        </div>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <Icon.Check className="w-3 h-3" />
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Messages */}
            {message && (
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Icon.Check className="w-3.5 h-3.5" />
                </span>
                <p className="mt-1 leading-5">{message}</p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-xs font-semibold text-rose-700 dark:text-rose-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400">
                  <Icon.Alert className="w-3.5 h-3.5" />
                </span>
                <p className="mt-1 leading-5">{error}</p>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
              <div className="p-5">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Aka kanya</p>
                <div className="mt-3 space-y-2">
                  {[
                    { label: "Uruhare", value: profile?.role ? formatRole(profile.role) : "—", icon: Icon.Store },
                    { label: "Email", value: email || "—", icon: Icon.Mail },
                    { label: "Telefoni", value: phone || "Ntabwo irashyirwaho", icon: Icon.Phone },
                  ].map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <div key={item.label} className="flex items-center gap-2.5 rounded-lg bg-slate-50/60 p-2.5 dark:bg-white/[0.02]">
                        <ItemIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{item.label}</p>
                          <p className="truncate text-[11px] font-bold text-slate-900 dark:text-white">{item.value}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <Link
              to="/dashboard"
              className="group flex items-center justify-between gap-3 rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-500/[0.06] to-indigo-500/[0.06] p-4 shadow-sm backdrop-blur transition hover:border-blue-500/40 hover:from-blue-500/[0.1] hover:to-indigo-500/[0.1] dark:border-blue-500/25 dark:from-blue-500/[0.08] dark:to-indigo-500/[0.08]"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">Umwirondoro</p>
                <p className="mt-0.5 text-xs font-black text-slate-900 dark:text-white">Jya kuri Dashboard</p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-slate-600 transition group-hover:bg-[#FF5D00] group-hover:text-white dark:bg-white/[0.06] dark:text-white">
                <Icon.ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Icon.Shield className="w-3 h-3 text-emerald-500" />
                Umutekano
              </p>
              <p className="mt-2 text-[11px] font-medium leading-5 text-slate-600 dark:text-slate-400">
                Amakuru yawe arinzwe neza. Ntubwira umuntu uwo ari we wese ijambo ry'ibanga cyangwa kode yawe.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative mt-8 border-t border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
              <Icon.Tag className="w-4 h-4" />
            </span>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                KUGURISHA
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">.COM</span>
              </p>
              <p className="text-[11px] text-slate-400">Isoko ryawe ryo mu Rwanda</p>
            </div>
          </div>
          <Link to="/" className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-[#FF5D00] dark:text-slate-400">
            Ahabanza
            <Icon.ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </footer>
    </main>
  )
}