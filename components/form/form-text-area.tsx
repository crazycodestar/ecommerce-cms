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
import { Textarea } from "../ui/textarea";

interface FromTextAreaProps<T extends FieldValues>
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  description?: string;
  containerClassNames?: string;
}

export const FormTextArea = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  containerClassNames,
  ...inputProps
}: FromTextAreaProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("grid", containerClassNames)}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea {...inputProps} {...field} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
