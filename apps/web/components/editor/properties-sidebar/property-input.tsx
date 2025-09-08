import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { ElementType, useEffect, useRef, useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { useController } from "react-hook-form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStyle } from "./style-context";
import { useBlurOnEnter } from "@/hooks/use-blur-on-enter";
import { useResizeOnDrag } from "@/hooks/use-resize-on-drag";

function getValueFromObject<T extends object>(value: T): T[keyof T] | "Mixed" {
  const values = Object.values(value);
  return values.every((v) => values[0] === v) ? values[0] : "Mixed";
}

function setValuesInObject<T extends object>(value: T, newValue: T[keyof T]) {
  return {
    ...Object.fromEntries(Object.keys(value).map((key) => [key, newValue])),
  };
}

type PropertyInputProps<T extends FieldValues> =
  React.InputHTMLAttributes<HTMLInputElement> & {
    control: Control<T>;
    name: Path<T>;
    icon?: ElementType;
    leftElement?: React.ReactNode;
    label: string;
    containerClassNames?: string;
    rightElement?: React.ReactNode;
    upperLimit?: number;
    lowerLimit?: number;
  };

export const PropertyInput = <T extends FieldValues>({
  control,
  name,
  icon: Icon,
  leftElement,
  label,
  containerClassNames,
  className,
  rightElement,
  upperLimit,
  lowerLimit,
  ...inputProps
}: PropertyInputProps<T>) => {
  const { form, onSubmit } = useStyle();
  const { field } = useController({ control, name });

  const { inputRef } = useBlurOnEnter();
  const { handleMouseDown } = useResizeOnDrag({
    onDrag: (deltaX) => {
      const value = Math.min(
        Math.max(lowerLimit !== undefined ? lowerLimit : -Infinity, deltaX),
        upperLimit !== undefined ? upperLimit : Infinity
      );
      field.onChange(
        typeof field.value === "object"
          ? setValuesInObject(field.value, value)
          : value
      );
      form.handleSubmit(onSubmit)();
    },
  });

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <FormItem
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
              {leftElement}
              <FormControl>
                <input
                  className={cn(
                    "peer text-sm w-full h-7 outline-none text-foreground/70",
                    className
                  )}
                  {...field}
                  ref={inputRef}
                  onBlur={() => form.handleSubmit(onSubmit)()}
                  onFocus={(e) => e.target.select()}
                  value={
                    typeof field.value === "object"
                      ? getValueFromObject(field.value)
                      : field.value
                  }
                  onChange={(e) =>
                    field.onChange(
                      typeof field.value === "object"
                        ? setValuesInObject(field.value, e.target.value)
                        : e.target.value
                    )
                  }
                  {...inputProps}
                />
              </FormControl>
              {rightElement}
              <TooltipContent className="pointer-events-none">
                <p>{label}</p>
              </TooltipContent>
            </FormItem>
          </TooltipTrigger>
        </Tooltip>
      )}
    />
  );
};
