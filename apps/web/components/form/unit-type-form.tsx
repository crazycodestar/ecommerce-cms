import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  Control,
  FieldValues,
  Path,
  useController,
  UseFormReturn,
} from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { showErrorToast } from "@/lib/handle-error";
import { tryCatch } from "@/lib/try-catch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, PlusCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";

const useCreateUnitTypeForm = ({
  onUnitTypeCreated,
}: {
  onUnitTypeCreated: (_id: Id<"unitTypes">) => void;
}) => {
  const form = useForm<CreateUnitTypeSchema>({
    resolver: zodResolver(createUnitTypeSchema),
    defaultValues: {
      name: "",
    },
  });

  const createUnitType = useMutation(api.products.createUnitType);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(data: z.infer<typeof createUnitTypeSchema>) {
    startTransition(async () => {
      const { data: res, error } = await tryCatch(createUnitType(data));
      if (error) return void showErrorToast(error);

      form.reset();
      onUnitTypeCreated(res);
    });
  }

  return { form, isPending, handleSubmit };
};

export const UnitTypeform = <T extends FieldValues>({
  control,
  name,
}: {
  control: Control<T>;
  name: Path<T>;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const unitTypes = useQuery(api.products.getUnitTypes);
  const controller = useController({ control, name });

  const handleUnitTypeCreated = (_id: Id<"unitTypes">) => {
    controller.field.onChange(_id);
    setIsDialogOpen(false);
  };

  const { form, handleSubmit, isPending } = useCreateUnitTypeForm({
    onUnitTypeCreated: handleUnitTypeCreated,
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {unitTypes?.map((unitType, index) => (
                  <SelectItem key={index} value={unitType._id}>
                    {unitType.name}
                  </SelectItem>
                ))}

                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <PlusCircle className="size-4" />
                    Add Unit
                  </Button>
                </DialogTrigger>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Unit Type</DialogTitle>
          <DialogDescription>
            Create a new unit type to specify the type of quantity for this
            product.
          </DialogDescription>
        </DialogHeader>
        <CreateUnitTypeForm form={form} handleSubmit={handleSubmit}>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader className="mr-2 size-4 animate-spin" />}
              Add Unit Type
            </Button>
          </div>
        </CreateUnitTypeForm>
      </DialogContent>
    </Dialog>
  );
};

export const createUnitTypeSchema = z.object({
  name: z.string().min(1, { message: "Atleast one character is required" }),
});

type CreateUnitTypeSchema = z.infer<typeof createUnitTypeSchema>;

export const CreateUnitTypeForm = ({
  children,
  form,
  handleSubmit,
}: {
  form: UseFormReturn<CreateUnitTypeSchema>;
  handleSubmit: (values: CreateUnitTypeSchema) => void;
  children: React.ReactNode;
}) => {
  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(handleSubmit)(e);
          e.stopPropagation();
        }}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Type Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter unit type name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {children}
      </form>
    </Form>
  );
};
