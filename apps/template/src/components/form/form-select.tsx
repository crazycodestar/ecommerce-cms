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

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  description?: string;
  containerClassNames?: string;
  children: React.ReactNode;
}

export const FormSelect = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  containerClassNames,
  children,
}: FormInputProps<T>) => {
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
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const FormSelectTrigger = (
  props: React.ComponentProps<typeof SelectTrigger>
) => (
  <FormControl>
    <SelectTrigger {...props} />
  </FormControl>
);
export const FormSelectValue = SelectValue;
export const FormSelectContent = SelectContent;
export const FormSelectItem = SelectItem;
