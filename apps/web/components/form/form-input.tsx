import { Input } from "../ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { Control, FieldValues, Path } from "react-hook-form";

interface FormInputProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  description?: string;
  containerClassNames?: string;
}

export const FormInput = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  containerClassNames,
  ...inputProps
}: FormInputProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("grid", containerClassNames)}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              {...inputProps}
              {...field}
              onChange={
                inputProps.type === "number"
                  ? (e) => field.onChange(Number(e.target.value))
                  : field.onChange
              }
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
