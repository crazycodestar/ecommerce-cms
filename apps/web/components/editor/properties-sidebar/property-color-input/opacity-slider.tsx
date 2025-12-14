import { Slider } from "@/components/ui/slider";

export function OpacitySlider({
  opacity,
  onChange,
}: {
  opacity: number[];
  onChange: (opacity: number[]) => void;
}) {
  return (
    <Slider
      value={opacity}
      onValueChange={(opacity) => onChange(opacity)}
      trackClassName="data-[orientation=horizontal]:h-[14px] bg-[url(/transparent.png)] bg-repeat-x after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:to-black"
      rangeClassName="bg-transparent"
      thumbClassName="hover:ring-0 border-white border-[4.5px] bg-transparent size-4.5"
      min={0}
      max={100}
      step={1}
    />
  );
}
