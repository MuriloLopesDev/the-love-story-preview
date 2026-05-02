import { getSupabaseClient } from "./supabase";

export type Rsvp = {
  id: string;
  name: string;
  phone?: string;
  inviteCode?: string;
  attending: "yes" | "no";
  companions: number;
  companionNames: string[];
  note: string;
  createdAt: string;
};

type RsvpRow = {
  id: string;
  name: string;
  phone: string | null;
  invite_code: string | null;
  attending: "yes" | "no";
  companions: number | null;
  companion_names: unknown;
  note: string | null;
  created_at: string;
};

function mapCompanionNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((name) => name.trim().slice(0, 100))
    .filter(Boolean);
}

function mapRsvp(row: RsvpRow): Rsvp {
  const companionNames = mapCompanionNames(row.companion_names);

  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? "",
    inviteCode: row.invite_code ?? "",
    attending: row.attending,
    companions: companionNames.length,
    companionNames,
    note: row.note ?? "",
    createdAt: row.created_at,
  };
}

export async function getRsvps(): Promise<Rsvp[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("rsvps")
    .select("id, name, phone, invite_code, attending, companions, companion_names, note, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapRsvp(row as RsvpRow));
}

export async function addRsvp(r: Omit<Rsvp, "id" | "createdAt">): Promise<Rsvp> {
  const supabase = getSupabaseClient();
  const companionNames = r.attending === "yes" ? mapCompanionNames(r.companionNames) : [];
  const { data, error } = await supabase
    .from("rsvps")
    .insert({
      name: r.name,
      phone: r.phone,
      invite_code: r.inviteCode,
      attending: r.attending,
      companions: companionNames.length,
      companion_names: companionNames,
      note: r.note,
    })
    .select("id, name, phone, invite_code, attending, companions, companion_names, note, created_at")
    .single();

  if (error) {
    throw error;
  }

  return mapRsvp(data as RsvpRow);
}
