import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { tryCatch } from "@/convex/utils";
import { ProductSchema } from "@/lib/validations/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Loader, Package, PlusCircle, RefreshCw } from "lucide-react";
import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { FormInput } from "./form-input";
import {
  FormSelect,
  FormSelectContent,
  FormSelectItem,
  FormSelectTrigger,
  FormSelectValue,
} from "./form-select";

const packageSchema = z.object({
  name: z.string().min(1, { message: "required" }),
  width: z.number().min(0).max(99),
  height: z.number().min(0).max(99),
  length: z.number().min(0).max(99),
  weight: z.number().min(0).max(99),
  type: z.union([
    z.literal("box"),
    z.literal("envelope"),
    z.literal("soft-packaging"),
  ]),
});

export type PackageSchema = z.infer<typeof packageSchema>;

export function ShippingForm({ form }: { form: UseFormReturn<ProductSchema> }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const packageForm = useForm<PackageSchema>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      width: 0,
      height: 0,
      length: 0,
      weight: 0,
      type: "box",
    },
    mode: "onChange",
  });

  const [isPending, startTransition] = React.useTransition();
  const createPackage = useMutation(api.packages.createPackage);
  const handleCreatePackage = (values: PackageSchema) => {
    startTransition(async () => {
      const { data: packageId, error } = await tryCatch(createPackage(values));
      if (error)
        return void toast.error("Failed to create package, Try again later.");
      form.setValue("packageId", packageId);
      setIsDialogOpen(false);
    });
  };

  const handleSelectPreset = (packageId: string) => {
    form.setValue("packageId", packageId);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="Weight"
        type="number"
        control={form.control}
        name="weight"
        placeholder="weight"
        description="Weight is in kg"
      />
      <FormField
        control={form.control}
        name="packageId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Package</FormLabel>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              {field.value ? (
                <PackageItem
                  onChangePackage={() => setIsDialogOpen(true)}
                  packageId={field.value as Id<"packages">}
                />
              ) : (
                <div className="gap-2 border border-dashed border-muted-foreground h-48 rounded-md flex flex-col justify-center items-center">
                  <div className="p-4 bg-primary text-primary-foreground rounded-md">
                    <Package className="size-4" />
                  </div>
                  <p>Add a package for this product</p>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <PlusCircle className="size-4" />
                      Add package
                    </Button>
                  </DialogTrigger>
                </div>
              )}
              <div className="relative">
                <DialogContent className="flex flex-col sm:max-h-[min(640px,80vh)] sm:max-w-lg p-0 gap-0">
                  <DialogHeader className="border-b p-6 pb-3">
                    <DialogTitle>Create or select package</DialogTitle>
                    <DialogDescription>
                      Add a package for this product
                    </DialogDescription>
                  </DialogHeader>
                  <div className="overflow-y-auto mb-16 p-6 pb-0">
                    <PackageSelectForm
                      onSelectPreset={handleSelectPreset}
                      form={packageForm}
                      onSubmit={handleCreatePackage}
                    >
                      <div className="absolute w-full justify-end flex gap-2 bg-background rounded-b-md border-t bottom-0 right-0 p-2">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button disabled={isPending}>
                          {isPending && (
                            <Loader className="mr-2 size-4 animate-spin" />
                          )}
                          Add Package
                        </Button>
                      </div>
                    </PackageSelectForm>
                  </div>
                </DialogContent>
              </div>
            </Dialog>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function PackageItem({
  packageId,
  onChangePackage,
}: {
  packageId: Id<"packages">;
  onChangePackage: () => void;
}) {
  const pkg = useQuery(api.packages.getPackageById, { packageId });

  if (!pkg) {
    return (
      <div className="p-4 flex items-center justify-center border rounded-md">
        <Loader className="size-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4 flex gap-2">
      <Package className="size-4 text-muted-foreground mt-1" />
      <div>
        <p className="font-medium">{pkg.name}</p>
        <p className="text-sm text-muted-foreground">
          <span className="capitalize">{pkg.type}</span>, {pkg.width}x
          {pkg.height}x{pkg.length}cm, {pkg.weight}kg
        </p>
      </div>
      <Button
        onClick={onChangePackage}
        className="ml-auto self-center"
        size="icon"
        variant="outline"
        type="button"
      >
        <RefreshCw className="size-4" />
      </Button>
    </div>
  );
}

interface PackageSelectFormProps {
  form: UseFormReturn<PackageSchema>;
  onSubmit: (values: PackageSchema) => void;
  onSelectPreset: (packageId: string) => void;
  children: React.ReactNode;
}

interface Package {
  _id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  length: number;
  weight: number;
}

function PackageSelectForm({
  form,
  onSubmit,
  onSelectPreset,
  children,
}: PackageSelectFormProps) {
  const packages = useQuery(api.packages.getPackages) as Package[] | undefined;

  return (
    <Tabs defaultValue="presets">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="presets">Saved Packages</TabsTrigger>
        <TabsTrigger value="create">Create New</TabsTrigger>
      </TabsList>

      <TabsContent value="presets">
        <div className="border rounded-md">
          {packages === undefined ? (
            <div className="p-4 flex items-center justify-center">
              <Loader className="size-4 animate-spin" />
            </div>
          ) : packages.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No saved packages found
            </div>
          ) : (
            <div className="divide-y">
              {packages.map((pkg) => (
                <button
                  key={pkg._id}
                  onClick={() => onSelectPreset(pkg._id)}
                  className="w-full p-3 text-left hover:bg-muted flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{pkg.name}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="capitalize">{pkg.type}</span>,{" "}
                      {pkg.width}x{pkg.height}x{pkg.length}cm, {pkg.weight}kg
                    </p>
                  </div>
                  <Package className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="create">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(onSubmit)(e);
              e.stopPropagation();
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Package name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormSelect control={form.control} name="type" label="Type">
              <FormSelectTrigger className="w-full">
                <FormSelectValue placeholder="Select country" />
              </FormSelectTrigger>
              <FormSelectContent>
                <FormSelectItem value="box">Box</FormSelectItem>
                <FormSelectItem value="envelope">Envelope</FormSelectItem>
                <FormSelectItem value="soft-packaging">
                  Soft Packaging
                </FormSelectItem>
              </FormSelectContent>
            </FormSelect>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            {children}
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
}
