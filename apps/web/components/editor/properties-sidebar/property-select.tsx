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
import { StyleSchema } from "@/db/types/style";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useStyleField } from "./style-context";

interface PropertySelectInputProps {
  name: keyof StyleSchema;
  label?: string;
  containerClassNames?: string;
  children: React.ReactNode;
}

export const PropertySelect = ({
  name,
  label,
  containerClassNames,
  children,
}: PropertySelectInputProps) => {
  const [open, onOpenChange] = useState(false);
  const { field, setValue } = useStyleField({ property: name });

  function handleChange(value: string) {
    setValue(value as StyleSchema[typeof name]);
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("grid", containerClassNames)}>
          <Select
            onValueChange={handleChange}
            value={field.value as string}
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
        </div>
      </TooltipTrigger>
    </Tooltip>
  );
};

export const PropertySelectTrigger = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectTrigger>) => (
  <SelectTrigger className={cn("max-h-7", className)} size="sm" {...props} />
);
export const PropertySelectValue = SelectValue;
export const PropertySelectContent = SelectContent;
export const PropertySelectItem = SelectItem;
