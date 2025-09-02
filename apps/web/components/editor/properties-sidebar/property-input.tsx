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

function getValueFromObject<T extends object>(value: T): T[keyof T] | "Mixed" {
  const values = Object.values(value);
  return values.every((v) => values[0] === v) ? values[0] : "Mixed";
}

function setValuesInObject<T extends object>(value: T, newValue: T[keyof T]) {
  return {
    ...Object.fromEntries(Object.keys(value).map((key) => [key, newValue])),
  };
}

function useBlurOnEnter() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter") {
        inputRef.current?.blur();
      }
    }

    inputRef.current?.addEventListener("keydown", handleKeyDown);

    return () =>
      inputRef.current?.removeEventListener("keydown", handleKeyDown);
  }, [inputRef]);

  return { inputRef };
}

function useResizeOnDrag(callback: (deltaX: number) => void) {
  const startXRef = useRef<number>(0);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      document
        .getElementById("editor-iframe")
        ?.classList.add("pointer-events-none");
      const deltaX = e.clientX - startXRef.current;
      callback(deltaX);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document
        .getElementById("editor-iframe")
        ?.classList.remove("pointer-events-none");
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return { handleMouseDown };
}

interface PropertyInputProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  control: Control<T>;
  name: Path<T>;
  icon: ElementType;
  label: string;
  containerClassNames?: string;
  rightElement?: React.ReactNode;
}

export const PropertyInput = <T extends FieldValues>({
  control,
  name,
  icon: Icon,
  label,
  containerClassNames,
  className,
  rightElement,
  ...inputProps
}: PropertyInputProps<T>) => {
  const { form, onSubmit } = useStyle();
  const { field } = useController({ control, name });

  const { inputRef } = useBlurOnEnter();
  const { handleMouseDown } = useResizeOnDrag((deltaX) => {
    field.onChange(
      typeof field.value === "object"
        ? setValuesInObject(field.value, deltaX)
        : deltaX
    );
    form.handleSubmit(onSubmit)();
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
              <div
                className="text-muted-foreground/80 h-7 flex items-center justify-center peer-disabled:opacity-50 hover:cursor-col-resize"
                onMouseDown={handleMouseDown}
              >
                <Icon size={14} width={14} height={14} aria-hidden="true" />
              </div>

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
