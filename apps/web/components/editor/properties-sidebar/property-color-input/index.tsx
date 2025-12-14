import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { colorSchema, StyleSchema } from "@/db/types/style";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { useStyleField } from "../style-context";
import { ColorIndicator, ColorPicker } from "./color-picker";
import { ColorValueInput } from "./color-value-picker";
import { ColorSchema } from "./shared";

interface PropertyColorInputProps {
  name: keyof StyleSchema;
  label: string;
  containerClassNames?: string;
  rightElement?: React.ReactNode;
  className?: string;
  noOptions?: boolean;
}

export const PropertyColorInput = ({
  name,
  label,
  containerClassNames,
  className,
  rightElement,
  noOptions,
}: PropertyColorInputProps) => {
  const { field, setValue } = useStyleField({ property: name });
  const { success, data: parsedData } = colorSchema.safeParse(field.value);

  if (!success)
    throw new Error(`Invalid color schema: ${JSON.stringify(field.value)}`);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const handleChange = (data: ColorSchema) => {
    setValue(data);
  };

  const parsedDataFill = parsedData;
  const value = parsedDataFill;
  const data = value ?? {
    type: "color",
    value: "#ffffff",
    opacity: 100,
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={containerClassNames}>
          <ColorValueInput
            color={data}
            onChange={handleChange}
            className={cn("w-full", className)}
            leftElement={
              data.type === "variable" ? (
                <ColorIndicator color={data} />
              ) : (
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
                      data={data}
                      onChange={handleChange}
                      noOptions={noOptions}
                    />
                  </PopoverContent>
                </Popover>
              )
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
