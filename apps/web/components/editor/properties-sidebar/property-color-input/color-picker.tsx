import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRightToLineIcon,
  ImageIcon,
  Loader2,
  PaintBucketIcon,
} from "lucide-react";
import Image from "next/image";
import {
  CSSProperties,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { HexColorPicker } from "react-colorful";
import { ColorValueInput } from "./color-value-picker";
import { GradientValuePicker } from "./gradient-value-picker";
import { OpacitySlider } from "./opacity-slider";
import {
  ColorSchema,
  GradientType,
  GradientValueSchema,
  ImageSchema,
  isGradientType,
} from "./shared";

type ColorSchemaWithoutVariable = Exclude<ColorSchema, { type: "variable" }>;

export function ColorPicker({
  data,
  onChange,
  noOptions = false,
}: {
  data: ColorSchemaWithoutVariable;
  onChange: (data: ColorSchemaWithoutVariable) => void;
  noOptions?: boolean;
}) {
  const defaults: Record<
    ColorSchemaWithoutVariable["type"],
    ColorSchemaWithoutVariable
  > = {
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
      value: "",
      objectFit: "cover",
    },
  };

  const [defaultValue, setDefaultValue] =
    useState<
      Record<ColorSchemaWithoutVariable["type"], ColorSchemaWithoutVariable>
    >(defaults);

  useEffect(() => {
    if (!data) return;

    setDefaultValue((init) => {
      const newDefaults = { ...init };
      newDefaults[data.type] = data;
      return newDefaults;
    });
  }, [data]);

  const [gradientType, setGradientType] =
    useState<Exclude<ColorSchemaWithoutVariable["type"], "image">>(
      "linear-gradient"
    );
  function handleChangeType(
    type: ColorSchemaWithoutVariable["type"] | "gradient"
  ) {
    if (type !== "gradient") {
      type.includes("gradient") &&
        setGradientType(
          type as Exclude<ColorSchemaWithoutVariable["type"], "image">
        );
      onChange(defaultValue[type as ColorSchemaWithoutVariable["type"]]);
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
      {data.type === "image" && (
        <ImageValuePicker image={data} onChange={onChange} />
      )}
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

function transformFillToStyle(background: ColorSchema) {
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

function ImageValuePicker({
  image,
  onChange,
}: {
  image: ColorSchema & { type: "image" };
  onChange: (image: ColorSchema & { type: "image" }) => void;
}) {
  const imageUrl = useQuery(
    api.images.getImageUrl,
    image.value
      ? {
          imageId: image.value as Id<"_storage">,
        }
      : "skip"
  );

  const generateUploadUrl = useMutation(api.images.generateUploadUrl);
  const [isUploading, startUploading] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  async function uploadImage(fileList: FileList | null) {
    if (!fileList) return;
    const file = fileList[0];

    startUploading(async () => {
      const postUrl = await generateUploadUrl();
      const res = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await res.json();
      onChange({ ...image, value: storageId });
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Select
        value={image.objectFit}
        onValueChange={(value) =>
          onChange({ ...image, objectFit: value as ImageSchema["objectFit"] })
        }
      >
        <SelectTrigger className="max-h-7" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fill">Fill</SelectItem>
          <SelectItem value="cover">Cover</SelectItem>
          <SelectItem value="contain">Contain</SelectItem>
          <SelectItem value="tile">Tile</SelectItem>
        </SelectContent>
      </Select>
      {isUploading ? (
        <div className="relative w-full aspect-square group">
          <Loader2 className="animate-spin size-4" />
        </div>
      ) : (
        <div className="relative w-full aspect-square group">
          <Image
            src={imageUrl ?? "/placeholder.svg"}
            alt="image"
            fill
            className="object-contain rounded-md"
          />
          <div className="absolute inset-0 bg-black/20 rounded-md hidden justify-center items-center group-hover:flex">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple={false}
              onChange={(e) => uploadImage(e.currentTarget.files)}
              className="hidden"
            />
            <Button
              onClick={() => inputRef.current?.click()}
              type="button"
              size="sm"
              className="h-7"
              disabled={isUploading}
            >
              Upload image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
