"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBlurOnEnter } from "@/hooks/use-blur-on-enter";
import { useDebouncedCallback } from "@/hooks/use-debouncer";
import { useResizeOnDrag } from "@/hooks/use-resize-on-drag";
import { cn } from "@/lib/utils";
import { MinusIcon, PercentIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import { ElementType, useEffect, useRef, useState } from "react";
import { PropertyButton } from "../property-button";
import { ColorPicker } from "./color-picker";
import { ColorValueInput } from "./color-value-picker";
import {
  ColorSchema,
  ColorSchemaWithoutVariable,
  GradientType,
  isGradientType,
  transformFillToStyle,
} from "./shared";

export function GradientValuePicker({
  gradient,
  onChange,
  handleChangeType,
}: {
  gradient: GradientType;
  onChange: (gradient: GradientType) => void;
  handleChangeType: (type: ColorSchemaWithoutVariable["type"]) => void;
}) {
  function handleAddStop() {
    const lastColor = gradient.colors[gradient.colors.length - 1];
    const secondLastColor = gradient.colors[gradient.colors.length - 2];

    const position =
      ((lastColor?.position ?? 0) + (secondLastColor?.position ?? 0)) / 2;
    const newColor = { value: "#000000", opacity: 100, position };

    onChange({
      ...gradient,
      colors: [
        ...gradient.colors.slice(0, -1),
        newColor,
        gradient.colors[gradient.colors.length - 1],
      ],
    });
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between">
        <Select
          value={gradient.type as string}
          onValueChange={(value) =>
            handleChangeType(value as ColorSchemaWithoutVariable["type"])
          }
        >
          <SelectTrigger className="max-h-7" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear-gradient">Linear</SelectItem>
            <SelectItem value="radial-gradient">Radial</SelectItem>
            <SelectItem value="conic-gradient">Conic</SelectItem>
          </SelectContent>
        </Select>
        <ValueInput
          containerClassNames="w-[66px]"
          value={gradient.deg}
          onChange={(deg) => onChange({ ...gradient, deg })}
          icon={RotateCcwIcon}
        />
      </div>
      <GradientPreview
        className="mt-4"
        gradient={gradient}
        onChange={onChange}
      />
      <div className="grid grid-cols-[1fr_28px] gap-2 h-7 items-center">
        <h5 className="text-sm font-medium">Stops</h5>
        <PropertyButton onClick={handleAddStop}>
          <PlusIcon size={16} />
        </PropertyButton>
      </div>
      <div className="flex flex-col gap-2">
        {gradient.colors.map((color, index) => (
          <div className="grid grid-cols-[60px_1fr_28px] gap-1" key={index}>
            <ValueInput
              value={color.position ?? 0}
              onChange={(position) =>
                onChange({
                  ...gradient,
                  colors: gradient.colors.map((c, i) =>
                    i === index ? { ...c, position } : c
                  ),
                })
              }
              icon={PercentIcon}
              upperLimit={100}
              lowerLimit={0}
            />
            <ColorValueInput
              color={{
                type: "color",
                value: color.value,
                opacity: color.opacity,
              }}
              onChange={(color) =>
                onChange({
                  ...gradient,
                  colors: gradient.colors.map((c, i) =>
                    i === index ? { ...c, ...color } : c
                  ),
                })
              }
              leftElement={
                <Popover>
                  <PopoverTrigger asChild>
                    <ColorIndicator
                      color={{
                        type: "color",
                        value: color.value,
                        opacity: color.opacity,
                      }}
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-3 w-[268px]"
                    side="left"
                    sideOffset={83}
                  >
                    <ColorPicker
                      data={{
                        type: "color",
                        value: color.value,
                        opacity: color.opacity,
                      }}
                      onChange={(color) =>
                        onChange({
                          ...gradient,
                          colors: gradient.colors.map((c, i) => {
                            const typedColor = color as ColorSchema & {
                              type: "color";
                            };
                            return i === index
                              ? {
                                  ...c,
                                  value: typedColor.value,
                                  opacity: typedColor.opacity,
                                }
                              : c;
                          }),
                        })
                      }
                      noOptions
                    />
                  </PopoverContent>
                </Popover>
              }
            />
            {gradient.colors.length > 2 && (
              <PropertyButton
                onClick={() =>
                  onChange({
                    ...gradient,
                    colors: gradient.colors.filter((_, i) => i !== index),
                  })
                }
                className="col-span-1"
              >
                <MinusIcon size={16} />
              </PropertyButton>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ValueInput({
  value,
  onChange,
  icon: Icon,
  upperLimit,
  lowerLimit,
  containerClassNames,
}: {
  value: number;
  onChange: (value: number) => void;
  icon?: ElementType;
  upperLimit?: number;
  lowerLimit?: number;
  containerClassNames?: string;
}) {
  const { inputRef } = useBlurOnEnter();
  const { handleMouseDown } = useResizeOnDrag({
    onDrag: (deltaX) => {
      onChange(
        Math.min(
          Math.max(
            lowerLimit !== undefined ? lowerLimit : -Infinity,
            value + deltaX
          ),
          upperLimit !== undefined ? upperLimit : Infinity
        )
      );
    },
  });

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 bg-background pl-1.5 rounded-md border h-fit",
        containerClassNames
      )}
    >
      {Icon && (
        <div
          className="text-muted-foreground/80 h-7 flex items-center justify-center peer-disabled:opacity-50 cursor-ew-resize"
          onMouseDown={handleMouseDown}
        >
          <Icon size={14} width={14} height={14} aria-hidden="true" />
        </div>
      )}

      <input
        className="peer text-sm w-full h-7 outline-none text-foreground/70"
        ref={inputRef}
        onBlur={(e) => onChange(Number(e.target.value))}
        onFocus={(e) => e.target.select()}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function GradientPreview({
  gradient,
  className,
  onChange,
}: {
  gradient: GradientType;
  className?: string;
  onChange: (gradient: GradientType) => void;
}) {
  const [width, setWidth] = useState<number>(0);
  const gradientRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!gradientRef.current) return;
    setWidth(gradientRef.current.offsetWidth);
  }, [gradientRef.current]);

  function getOffsetLeft(position: number) {
    return ((position ?? 0) / 100) * width;
  }
  return (
    <div className={cn("relative w-full", className)}>
      <div
        ref={gradientRef}
        className="h-10 rounded-sm border"
        style={transformFillToStyle({
          type: "linear-gradient",
          deg: 90,
          colors: gradient.colors,
        })}
      />
      {gradient.colors.map((color, index) => (
        <GradientThumb
          key={index}
          color={{
            type: "color",
            value: color.value,
            opacity: color.opacity,
          }}
          offsetLeft={getOffsetLeft(color.position ?? 0)}
          width={width}
          onChange={(position) =>
            onChange({
              ...gradient,
              colors: gradient.colors.map((c, i) =>
                i === index ? { ...c, position } : c
              ),
            })
          }
          upperLimit={100}
          lowerLimit={0}
        />
      ))}
    </div>
  );
}

function GradientThumb({
  offsetLeft,
  width,
  color,
  onChange,
  upperLimit,
  lowerLimit,
}: {
  offsetLeft: number;
  width: number;
  color: ColorSchema;
  onChange: (color: number) => void;
  upperLimit?: number;
  lowerLimit?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const setValue = useDebouncedCallback((value: number) => {
    onChange(value);
  }, 100);

  const { handleMouseDown } = useResizeOnDrag({
    onDrag: (deltaX) => {
      if (!ref.current) return;

      const pos = ((offsetLeft + deltaX) / width) * 100;
      const appliedValue = Math.floor(
        Math.min(
          Math.max(lowerLimit !== undefined ? lowerLimit : -Infinity, pos),
          upperLimit !== undefined ? upperLimit : Infinity
        )
      );

      ref.current.style.left = `${appliedValue}%`;
      setValue(appliedValue);
    },
  });

  return (
    <div
      ref={ref}
      className={cn(
        "cursor-grab active:cursor-grabbing absolute -top-3.5 size-3.5 -translate-x-1/2 p-[4.5px] rounded-xs shadow-sm border-[4.5px] border-white after:content-[''] after:top-3.5 after:block after:border-white after:border-4 after:border-t-transparent after:border-l-transparent after:rotate-45 after:-translate-x-1/2 after:translate-y-1/2"
      )}
      style={{
        left: offsetLeft,
        ...transformFillToStyle(color),
      }}
      onMouseDown={handleMouseDown}
    />
  );
}

interface ColorIndicatorProps
  extends Omit<React.ComponentProps<"button">, "color"> {
  color: ColorSchema;
}

export function ColorIndicator({ color, ...props }: ColorIndicatorProps) {
  let value = color;

  if (isGradientType(color))
    value = {
      type: "linear-gradient",
      deg: 90,
      colors: color.colors,
    };

  const parseColor = transformFillToStyle(value);

  return (
    <button
      style={parseColor}
      className={cn("size-3.5 rounded-xs border")}
      {...props}
    />
  );
}
