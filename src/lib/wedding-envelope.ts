export const WEDDING_ENVELOPE_STORAGE_KEY = "weddingEnvelopeOpened";

export function hasOpenedWeddingEnvelope() {
  if (typeof window === "undefined") return false;

  try {
    return window.sessionStorage.getItem(WEDDING_ENVELOPE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}
