/**
 * Convert an opacity percentage (0-100) to a two-digit hex string (00-FF).
 * Examples:
 *  - 0   -> "00"
 *  - 50  -> "80"
 *  - 100 -> "FF"
 */
export function opacityPercentToHex(opacityPercent: number): string {
  const clamped = Number.isFinite(opacityPercent)
    ? Math.min(100, Math.max(0, opacityPercent))
    : 0;
  const alpha0to255 = Math.round((clamped / 100) * 255);
  return alpha0to255.toString(16).padStart(2, "0").toUpperCase();
}
