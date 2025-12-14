import { opacityPercentToHex } from "@/lib/opacity-to-hex";

export function generateOpacityHex(opacity: number) {
  return opacity !== 100 ? opacityPercentToHex(opacity) : "";
}
