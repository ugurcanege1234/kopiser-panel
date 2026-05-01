import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

export type Lead = {
  id: string;
  created_at: string;
  updated_at: string;
  company: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  source: string | null;
  status: string | null;
  score: number | null;
  machine_type: string | null;
  notes: string | null;
  assigned_to: string | null;
};

export const LEAD_STATUSES = [
  "Yeni",
  "Arandı",
  "Demo",
  "Teklif Gönderildi",
  "Kazanıldı",
  "Kaybedildi",
] as const;

export const LEAD_SOURCES = [
  "Meta Reklam",
  "Organik Web",
  "Instagram DM",
  "Referans",
  "Manuel",
  "Telefon",
  "Diğer",
] as const;
