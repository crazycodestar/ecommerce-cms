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
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBlurOnEnter } from "@/hooks/use-blur-on-enter";
import { useDebouncedCallback } from "@/hooks/use-debouncer";
import {
  fill,
  FillSchema,
  ColorSchema,
  colorSchema,
  GradientValueSchema,
} from "@/hooks/use-editor/properties";
import { useResizeOnDrag } from "@/hooks/use-resize-on-drag";
import { cn } from "@/lib/utils";
import {
  ArrowRightToLineIcon,
  ImageIcon,
  MinusIcon,
  PaintBucketIcon,
  PercentIcon,
  PlusIcon,
  RotateCcwIcon,
} from "lucide-react";
import { CSSProperties, ElementType, useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { PropertyButton } from "./property-button";
import { useStyle } from "./style-context";

const mapping: Record<Exclude<ColorSchema["type"], "color">, string> = {
  "linear-gradient": "Linear",
  "radial-gradient": "Radial",
  "conic-gradient": "Conic",
  image: "Image",
};

interface PropertyColorInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  containerClassNames?: string;
  rightElement?: React.ReactNode;
  className?: string;
  noOptions?: boolean;
}

export const PropertyColorInput = <T extends FieldValues>({
  control,
  name,
  label,
  containerClassNames,
  className,
  rightElement,
  noOptions,
}: PropertyColorInputProps<T>) => {
  const { form, onSubmit } = useStyle();

  const { field } = useController({ control, name });
  const { success, data } = colorSchema.safeParse(field.value);

  const handleChange = (data: ColorSchema) => {
    field.onChange(data);
    form.handleSubmit(onSubmit)();
  };

  if (!success) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={containerClassNames}>
          <ColorValueInput
            color={data}
            onChange={handleChange}
            className={cn("w-full", className)}
            leftElement={
              <Popover>
                <PopoverTrigger asChild>
                  <ColorIndicator color={data} />
                </PopoverTrigger>
                <PopoverContent
                  className="p-3 w-[268px]"
                  side="left"
                  sideOffset={16}
                >
                  <ColorPicker
                    data={field.value}
                    onChange={handleChange}
                    noOptions={noOptions}
                  />
                </PopoverContent>
              </Popover>
            }
          />
          {rightElement}
          <TooltipContent className="pointer-events-none">
            <p>{label}</p>
          </TooltipContent>
        </div>
      </TooltipTrigger>
    </Tooltip>
  );
};

function ColorPicker({
  data,
  onChange,
  noOptions = false,
}: {
  data: ColorSchema;
  onChange: (data: ColorSchema) => void;
  noOptions?: boolean;
}) {
  const defaults: Record<ColorSchema["type"], ColorSchema> = {
    color: {
      type: "color",
      value: "#ffffff",
      opacity: 100,
    },
    "linear-gradient": {
      type: "linear-gradient",
      deg: 180,
      colors: [
        { value: "#ffffff", opacity: 100, position: 0 },
        { value: "#000000", opacity: 100, position: 100 },
      ],
    },
    "radial-gradient": {
      type: "radial-gradient",
      deg: 180,
      colors: [
        { value: "#ffffff", opacity: 100, position: 0 },
        { value: "#000000", opacity: 100, position: 100 },
      ],
    },
    "conic-gradient": {
      type: "conic-gradient",
      deg: 180,
      colors: [
        { value: "#ffffff", opacity: 100, position: 0 },
        { value: "#000000", opacity: 100, position: 100 },
      ],
    },
    image: {
      type: "image",
      value: "https://via.placeholder.com/150",
      objectFit: "cover",
    },
  };

  const [defaultValue, setDefaultValue] =
    useState<Record<ColorSchema["type"], ColorSchema>>(defaults);

  useEffect(() => {
    if (!data) return;

    setDefaultValue((init) => {
      const newDefaults = { ...init };
      newDefaults[data.type] = data;
      return newDefaults;
    });
  }, [data]);

  const [gradientType, setGradientType] =
    useState<Exclude<ColorSchema["type"], "color" | "image">>(
      "linear-gradient"
    );
  function handleChangeType(type: ColorSchema["type"] | "gradient") {
    if (type !== "gradient") {
      type.includes("gradient") &&
        setGradientType(
          type as Exclude<ColorSchema["type"], "color" | "image">
        );
      onChange(defaultValue[type as ColorSchema["type"]]);
      return;
    }

    onChange(defaultValue[gradientType]);
  }

  return (
    <div className="w-full flex flex-col gap-2">
      {!noOptions && (
        <Tabs
          value={data.type.includes("gradient") ? "gradient" : data.type}
          onValueChange={(type) =>
            handleChangeType(type as Parameters<typeof handleChangeType>[0])
          }
          className="col-span-4"
        >
          <TabsList className="w-full h-7">
            <TabsTrigger value="color" className="py-0 rounded-sm">
              <PaintBucketIcon size={16} />
            </TabsTrigger>
            <TabsTrigger value="gradient" className="py-0 rounded-sm">
              <ArrowRightToLineIcon size={16} />
            </TabsTrigger>
            <TabsTrigger value="image" className="py-0 rounded-sm">
              <ImageIcon size={16} />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      {data.type === "color" && (
        <ColorValuePicker color={data} onChange={onChange} />
      )}
      {data.type.includes("gradient") && (
        <GradientValuePicker
          gradient={data as GradientType}
          onChange={onChange}
          handleChangeType={handleChangeType}
        />
      )}
      {/* {data.type === "image" && (
        <ImageValuePicker image={data} onChange={onChange} />
      )} */}
    </div>
  );
}

function ColorValuePicker({
  color,
  onChange,
}: {
  color: ColorSchema & { type: "color" };
  onChange: (color: ColorSchema & { type: "color" }) => void;
}) {
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
      <ColorValueInput color={color} onChange={onChange} />
    </div>
  );
}

function isColorType(val: ColorSchema): val is ColorSchema & { type: "color" } {
  return val.type === "color";
}

interface ColorValueInputProps {
  color: ColorSchema;
  onChange: (color: ColorSchema & { type: "color" }) => void;
  className?: string;
  leftElement?: React.ReactNode;
  containerClassNames?: string;
}

function ColorValueInput({
  color,
  onChange,
  className,
  containerClassNames,
  leftElement,
}: ColorValueInputProps) {
  const { inputRef } = useBlurOnEnter();
  const [opacity, setOpacity] = useState<number>();

  useEffect(() => {
    if (!isColorType(color)) return;
    setOpacity(color.opacity);
  }, [color]);

  function handleColorChange(value?: string, opacity?: number) {
    if (!isColorType(color)) return;
    onChange({
      ...color,
      ...(value !== undefined && { value }),
      ...(opacity !== undefined && { opacity }),
    });
  }

  const { handleMouseDown } = useResizeOnDrag({
    onDrag: (deltaX) => {
      if (!isColorType(color)) return;

      const value = Math.min(Math.max(0, color.opacity + deltaX), 100);
      handleColorChange(undefined, value);
    },
  });

  return (
    <div className={cn("grid grid-cols-[1fr_60px]", containerClassNames)}>
      <div
        className={cn(
          "flex items-center gap-1.5 bg-background pl-1.5 rounded-md border h-fit border-r-0 rounded-r-none",
          !isColorType(color) && "rounded-r-md border-r col-span-2"
        )}
      >
        {leftElement}
        <input
          className={cn(
            "peer text-sm w-full h-7 outline-none text-foreground/70 uppercase",
            !isColorType(color) && "capitalize",
            className
          )}
          ref={inputRef}
          onBlur={(e) => handleColorChange(e.target.value)}
          onFocus={(e) => e.target.select()}
          value={isColorType(color) ? color.value : mapping[color.type]}
          onChange={(e) => handleColorChange(e.target.value)}
        />
      </div>
      {isColorType(color) && (
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
            className="text-muted-foreground/80 h-7 min-w-7 flex items-center justify-center peer-disabled:opacity-50 hover:cursor-col-resize"
            onMouseDown={handleMouseDown}
          >
            <PercentIcon size={16} />
          </div>
        </div>
      )}
    </div>
  );
}

function OpacitySlider({
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

type GradientType =
  | (ColorSchema & { type: "linear-gradient" })
  | (ColorSchema & { type: "radial-gradient" })
  | (ColorSchema & { type: "conic-gradient" });

function GradientValuePicker({
  gradient,
  onChange,
  handleChangeType,
}: {
  gradient: GradientType;
  onChange: (gradient: GradientType) => void;
  handleChangeType: (type: ColorSchema["type"]) => void;
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
            handleChangeType(value as ColorSchema["type"])
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
          className="text-muted-foreground/80 h-7 flex items-center justify-center peer-disabled:opacity-50 hover:cursor-col-resize"
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

function GradientPreview({
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

const isGradientType = (color: ColorSchema): color is GradientType => {
  return color.type.includes("gradient");
};

interface ColorIndicatorProps
  extends Omit<React.ComponentProps<"button">, "color"> {
  color: ColorSchema;
}

function ColorIndicator({ color, ...props }: ColorIndicatorProps) {
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

function transformFillToStyle(
  background: NonNullable<FillSchema["fill"]>["value"]
) {
  function parseGradientValue(value: GradientValueSchema) {
    let style: string[] = [];
    if (value.deg !== 180) style.push(`${value.deg}deg`);

    const colors = value.colors
      .map(
        (color) =>
          `${color.value}${color.position && color.position !== 100 ? ` ${color.position}%` : ""}`
      )
      .join();

    style.push(colors);
    return style.join();
  }

  let style: CSSProperties = {};
  switch (background.type) {
    case "image":
      style.backgroundImage = `url(${background.value})`;
      if (background.objectFit && background.objectFit !== "tile") {
        style.backgroundSize = background.objectFit;
      } else if (background.objectFit) {
        style.backgroundRepeat = "repeat";
      }
      break;
    case "linear-gradient":
      style.backgroundImage = `linear-gradient(${parseGradientValue(background)})`;

      break;
    case "color":
      style.backgroundColor = background.value;
      break;
  }

  return style;
}
