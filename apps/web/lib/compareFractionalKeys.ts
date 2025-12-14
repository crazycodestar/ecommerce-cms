import { BASE_62_DIGITS } from "fractional-indexing";

export function compareFractionalKeys(a: string, b: string) {
  const alphabet = BASE_62_DIGITS;
  const len = Math.max(a.length, b.length);

  for (let i = 0; i < len; i++) {
    const ai = alphabet.indexOf(a[i] ?? "0"); // treat missing as smallest
    const bi = alphabet.indexOf(b[i] ?? "0");
    if (ai !== bi) return ai - bi;
  }
  return 0;
}
