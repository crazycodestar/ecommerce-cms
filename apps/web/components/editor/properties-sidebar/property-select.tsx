import { FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { useStyle } from "./style-context";
import { useState } from "react";

interface PropertySelectInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  containerClassNames?: string;
  children: React.ReactNode;
}

export const PropertySelect = <T extends FieldValues>({
  control,
  name,
  label,
  containerClassNames,
  children,
}: PropertySelectInputProps<T>) => {
  const [open, onOpenChange] = useState(false);

  const { form, onSubmit } = useStyle();
  const { field } = useController({ control, name });

  function handleChange(value: string) {
    field.onChange(value);
    form.handleSubmit(onSubmit)();
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <FormItem className={cn("grid", containerClassNames)}>
              <Select
                onValueChange={handleChange}
                value={field.value}
                open={open}
                onOpenChange={onOpenChange}
              >
                {children}
              </Select>
              {label && !open && (
                <TooltipContent className="pointer-events-none">
                  <p>{label}</p>
                </TooltipContent>
              )}
            </FormItem>
          </TooltipTrigger>
        </Tooltip>
      )}
    />
  );
};

export const PropertySelectTrigger = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectTrigger>) => (
  <FormControl>
    <SelectTrigger className={cn("max-h-7", className)} size="sm" {...props} />
  </FormControl>
);
export const PropertySelectValue = SelectValue;
export const PropertySelectContent = SelectContent;
export const PropertySelectItem = SelectItem;
