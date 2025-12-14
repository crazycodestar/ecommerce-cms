import { useBlurOnEnter } from "@/hooks/use-blur-on-enter";
import { useResizeOnDrag } from "@/hooks/use-resize-on-drag";
import { cn } from "@/lib/utils";
import { PercentIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { VariableItem, VariablePopover } from "../variable-library";
import { OpacitySlider } from "./opacity-slider";
import { ColorSchema } from "./shared";
import { VariablePicker } from "./variable-picker";

const mapping: Record<
  Exclude<ColorSchema["type"], "color" | "variable">,
  string
> = {
  "linear-gradient": "Linear",
  "radial-gradient": "Radial",
  "conic-gradient": "Conic",
  image: "Image",
};

export function ColorValuePicker({
  color,
  onChange,
}: {
  color: ColorSchema & { type: "color" };
  onChange: (color: ColorSchema & { type: "color" }) => void;
}) {
  function handleChange(color: ColorSchema) {
    if (color.type !== "color") return;
    onChange(color);
  }

  return (
    <div className="color-picker-container flex flex-col gap-2">
      <HexColorPicker
        color={color.value}
        onChange={(value) => onChange({ ...color, value })}
      />
      <OpacitySlider
        opacity={[color.opacity]}
        onChange={([opacity]) => onChange({ ...color, opacity })}
      />
      <ColorValueInput color={color} onChange={handleChange} />
    </div>
  );
}

function isColorType(val: ColorSchema): val is ColorSchema & { type: "color" } {
  return val.type === "color";
}

interface ColorValueInputProps {
  color: ColorSchema;
  onChange: (
    color:
      | (ColorSchema & { type: "color" })
      | (ColorSchema & { type: "variable" })
  ) => void;
  className?: string;
  leftElement?: React.ReactNode;
  containerClassNames?: string;
}

export function ColorValueInput({
  color,
  onChange,
  className,
  containerClassNames,
  leftElement,
}: ColorValueInputProps) {
  const { inputRef } = useBlurOnEnter();
  const [opacity, setOpacity] = useState<number>();

  const isColor = isColorType(color);

  useEffect(() => {
    if (!isColor) return;
    setOpacity(color.opacity);
  }, [color]);

  function handleColorChange(value?: string, opacity?: number) {
    if (color.type === "variable" || !isColorType(color)) return;
    onChange({
      ...color,
      ...(value !== undefined && { value }),
      ...(opacity !== undefined && { opacity }),
    });
  }

  const { handleMouseDown } = useResizeOnDrag({
    onDrag: (deltaX) => {
      if (!isColor) return;

      const value = Math.min(Math.max(0, color.opacity + deltaX), 100);
      handleColorChange(undefined, value);
    },
  });

  return (
    <div className={cn("grid grid-cols-[1fr_60px]", containerClassNames)}>
      <div
        className={cn(
          "flex items-center gap-1.5 bg-background rounded-md border h-fit border-r-0 rounded-r-none",
          !isColor && "rounded-r-md border-r col-span-2",
          color.type !== "variable" && "pl-1.5"
        )}
      >
        {color.type === "variable" ? (
          <VariablePicker color={color} onChange={onChange} />
        ) : (
          <>
            {leftElement}
            <input
              className={cn(
                "peer text-sm w-full h-7 outline-none text-foreground/70 uppercase",
                !isColor && "capitalize",
                className
              )}
              ref={inputRef}
              onBlur={(e) => handleColorChange(e.target.value)}
              onFocus={(e) => e.target.select()}
              value={
                isColor
                  ? color.value
                  : mapping[
                      color.type as Exclude<
                        ColorSchema["type"],
                        "color" | "variable"
                      >
                    ]
              }
              onChange={(e) => handleColorChange(e.target.value)}
            />
          </>
        )}
      </div>
      {isColor && (
        <div className="rounded-l-none flex items-center bg-background pl-1.5 rounded-md border h-fit">
          <input
            className={
              "peer text-sm w-full h-7 outline-none text-foreground/70 uppercase"
            }
            ref={inputRef}
            onBlur={(e) => handleColorChange(undefined, Number(e.target.value))}
            onFocus={(e) => e.target.select()}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
          />
          <div
            className="text-muted-foreground/80 h-7 min-w-7 flex items-center justify-center peer-disabled:opacity-50 cursor-ew-resize"
            onMouseDown={handleMouseDown}
          >
            <PercentIcon size={16} />
          </div>
        </div>
      )}
    </div>
  );
}
