import { CSSProperties } from "react";
import { colorSchema, imageSchema } from "@/db/types/style";
import { gradientValueSchema } from "@/db/types/style";
import { z } from "zod";

export type ColorSchema = z.infer<typeof colorSchema>;
export type ImageSchema = z.infer<typeof imageSchema>;
export type GradientValueSchema = z.infer<typeof gradientValueSchema>;

export type ColorSchemaWithoutVariable = Exclude<
  ColorSchema,
  { type: "variable" }
>;

export type GradientType =
  | (ColorSchema & { type: "linear-gradient" })
  | (ColorSchema & { type: "radial-gradient" })
  | (ColorSchema & { type: "conic-gradient" });

export const isGradientType = (color: ColorSchema): color is GradientType => {
  return color.type.includes("gradient");
};

export function transformFillToStyle(background: ColorSchema) {
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
