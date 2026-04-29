// Mock store for RSVPs — persists in localStorage so admin pode visualizar
export type Rsvp = {
  id: string;
  name: string;
  attending: "yes" | "no";
  companions: number;
  diet: string;
  note: string;
  createdAt: string;
};

const KEY = "wedding_rsvps_v1";
const SEED: Rsvp[] = [
  { id: "1", name: "Ana e Lucas Pereira", attending: "yes", companions: 1, diet: "Sem restrições", note: "Mal podemos esperar!", createdAt: new Date().toISOString() },
  { id: "2", name: "Carla Mendes", attending: "yes", companions: 0, diet: "Vegetariana", note: "", createdAt: new Date().toISOString() },
  { id: "3", name: "Bruno Tavares", attending: "no", companions: 0, diet: "", note: "Estarei viajando, abraço!", createdAt: new Date().toISOString() },
  { id: "4", name: "Família Souza", attending: "yes", companions: 3, diet: "1 sem glúten", note: "", createdAt: new Date().toISOString() },
];

export function getRsvps(): Rsvp[] {
  if (typeof window === "undefined") return SEED;
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(SEED));
    return SEED;
  }
  try { return JSON.parse(raw); } catch { return SEED; }
}

export function addRsvp(r: Omit<Rsvp, "id" | "createdAt">): Rsvp {
  const all = getRsvps();
  const item: Rsvp = { ...r, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify([item, ...all]));
  return item;
}
