import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Control, FieldValues, Path } from "react-hook-form";

interface PropertySelectInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  description?: string;
  containerClassNames?: string;
  children: React.ReactNode;
}

export const PropertySelect = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  containerClassNames,
  children,
}: PropertySelectInputProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("grid", containerClassNames)}>
          {label && <FormLabel>{label}</FormLabel>}
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            {children}
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const PropertySelectTrigger = (
  props: React.ComponentProps<typeof SelectTrigger>
) => (
  <FormControl>
    <SelectTrigger {...props} />
  </FormControl>
);
export const PropertySelectValue = SelectValue;
export const PropertySelectContent = SelectContent;
export const PropertySelectItem = SelectItem;
