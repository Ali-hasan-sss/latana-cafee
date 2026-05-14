/** Build `https://wa.me/…` from a stored number; returns null if too few digits. */
export function buildWhatsAppHref(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length < 8) {
    return null;
  }
  return `https://wa.me/${digits}`;
}
