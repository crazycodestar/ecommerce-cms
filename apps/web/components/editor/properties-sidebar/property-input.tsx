import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StyleSchema } from "@/db/types/style";
import { useBlurOnEnter } from "@/hooks/use-blur-on-enter";
import { useResizeOnDrag } from "@/hooks/use-resize-on-drag";
import { cn } from "@/lib/utils";
import { Undo2 } from "lucide-react";
import { ElementType } from "react";
import { useStyleField } from "./style-context";

type InputType = string | number | { [k: string]: any };
export interface PropertyInputPrimitiveProps<T extends InputType>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
  value: T;
  setValue?: (arg: T) => void;
  containerClassNames?: string;
  icon?: ElementType;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
  upperLimit?: number;
  lowerLimit?: number;
  increment?: number;
  sensitivity?: number;
}

export const PropertyInputPrimitive = <T extends InputType>({
  containerClassNames,
  icon: Icon,
  leftElement,
  rightElement,
  className,
  value,
  upperLimit,
  lowerLimit,
  increment,
  sensitivity,
  setValue,
  ...inputProps
}: PropertyInputPrimitiveProps<T>) => {
  const { inputRef } = useBlurOnEnter();
  const { handleMouseDown } = useResizeOnDrag({
    onDrag: (deltaX) => {
      const currentValue = value as number;
      const sensitivityFactor = sensitivity !== undefined ? sensitivity : 1;
      const incrementFactor = increment !== undefined ? increment : 1;
      const appliedValue = Number(
        Number(
          currentValue + deltaX * incrementFactor * sensitivityFactor
        ).toFixed(1)
      );

      const finalValue = Math.min(
        Math.max(
          lowerLimit !== undefined ? lowerLimit : -Infinity,
          appliedValue
        ),
        upperLimit !== undefined ? upperLimit : Infinity
      );
      setValue?.(finalValue as T);
    },
  });

  return (
    <div
      className={cn(
        "relative flex items-center gap-1.5 bg-background pl-1.5 rounded-md border h-fit",
        containerClassNames
      )}
    >
      {Icon && (
        <div
          className={cn(
            "text-muted-foreground/80 h-7 flex items-center justify-center peer-disabled:opacity-50 cursor-ew-resize",
            inputProps.disabled && "opacity-50 pointer-events-none"
          )}
          onMouseDown={handleMouseDown}
        >
          <Icon size={14} width={14} height={14} aria-hidden="true" />
        </div>
      )}
      {leftElement}

      <input
        className={cn(
          "peer text-sm w-full h-7 outline-none text-foreground/70",
          inputProps.disabled && "opacity-50 pointer-events-none",
          className
        )}
        ref={inputRef}
        onFocus={(e) => e.target.select()}
        value={value as string}
        {...inputProps}
      />

      <div
        className={cn(inputProps.disabled && "opacity-50 pointer-events-none")}
      >
        {rightElement}
      </div>
    </div>
  );
};
interface PropertyInputProps
  extends Omit<PropertyInputPrimitiveProps<string>, "setValue" | "value"> {
  name: keyof StyleSchema;
  label: string;
}

export const PropertyInput = ({
  name,
  label,
  ...inputProps
}: PropertyInputProps) => {
  const { field, previousValue, reset, setValue } = useStyleField({
    property: name,
  });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("relative", inputProps.containerClassNames)}>
          {previousValue !== undefined && field.value !== previousValue && (
            <button
              type="button"
              onClick={reset}
              className="absolute z-10 top-0 right-0 size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center -translate-y-1/2 translate-x-1/2"
            >
              <Undo2 size={10} />
            </button>
          )}
          <PropertyInputPrimitive
            {...field}
            containerClassNames="w-full"
            setValue={setValue}
            {...inputProps}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent className="pointer-events-none">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};
