"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { ChevronRight, Loader, PlusCircle, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  Control,
  FieldValues,
  Path,
  useController,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { FormInput } from "./form-input";

type category = { _id: Id<"categories">; name: string };

interface CategoryPickerProps<T extends FieldValues> {
  canUpdate: boolean;
  control: Control<T>;
  name: Path<T>;
}

export function CategoryPicker<T extends FieldValues>({
  canUpdate,
  name,
  control,
}: CategoryPickerProps<T>) {
  const { field } = useController({ name, control });
  const value = useWatch({ control, name });
  const id = useRef(value as unknown as Id<"categories">);
  const categoryTree = useQuery(
    api.products.getCategoryTreeById,
    id.current ? { id: id.current } : "skip"
  );
  const [selectedCategory, setSelectedCategory] = useState<category[]>([]);

  useEffect(() => {
    if (!categoryTree) return;
    setSelectedCategory(categoryTree.reverse());
  }, [categoryTree]);

  const categories = useQuery(api.products.getCategories, {});
  const subCategories = useQuery(
    api.products.getCategories,
    selectedCategory[0] ? { parentId: selectedCategory[0]._id } : "skip"
  );

  const handleCategoryClick = (category: category) => {
    setSelectedCategory([category]);
  };

  const handleSubcategoryClick = (subCategory: category) => {
    setSelectedCategory((current) => [...current, subCategory]);
    field.onChange(subCategory._id);
  };

  return (
    <div className="w-full mx-auto space-y-4">
      <div className="grid grid-cols-2 border rounded-md">
        <ScrollArea className="border-r p-4">
          <div className="flex flex-col gap-2">
            {categories?.map((category) => (
              <Button
                type="button"
                key={category.name}
                variant="ghost"
                className={cn(
                  "w-full justify-between",
                  category._id === selectedCategory[0]?._id
                    ? "bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                    : null
                )}
                onClick={() =>
                  handleCategoryClick({
                    _id: category._id,
                    name: category.name,
                  })
                }
              >
                {category.name}
                <ChevronRight className="h-4 w-4" />
              </Button>
            ))}
            <CategoryForm>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start"
              >
                <PlusCircle className="size-4" /> Add Category
              </Button>
            </CategoryForm>
          </div>
        </ScrollArea>
        <ScrollArea className="p-4 gap-2">
          <div className="flex flex-col gap-2">
            {subCategories?.map((subCategory) => {
              if (canUpdate)
                return (
                  <Button
                    type="button"
                    key={subCategory.name}
                    variant="ghost"
                    className={cn(
                      "w-full justify-between",
                      subCategory._id === value
                        ? "bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                        : null
                    )}
                    onClick={() =>
                      handleSubcategoryClick({
                        _id: subCategory._id,
                        name: subCategory.name,
                      })
                    }
                  >
                    {subCategory.name}
                    {/* {subCategory._id} */}
                  </Button>
                );

              return (
                <AlertDialog key={subCategory.name}>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      key={subCategory.name}
                      variant="ghost"
                      className={cn(
                        "w-full justify-between",
                        subCategory._id === value
                          ? "bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                          : null
                      )}
                    >
                      {subCategory.name}
                      {/* {subCategory._id} */}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will clear all of your the properties you have set
                        for this category
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          handleSubcategoryClick({
                            _id: subCategory._id,
                            name: subCategory.name,
                          })
                        }
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              );
            })}
            {selectedCategory[0] && (
              <SubcategoryForm parentId={selectedCategory[0]?._id}>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <PlusCircle className="size-4" /> Add Subcategory
                </Button>
              </SubcategoryForm>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

const categorySchema = z.object({
  category: z.string().min(1, { message: "Category name is required" }),
  subcategories: z
    .array(
      z.object({
        name: z.string().min(1, { message: "Sub-category name is required" }),
      })
    )
    .min(1, { message: "At least one sub-category is required" }),
});

const useCategoryForm = ({ onComplete }: { onComplete?: () => void }) => {
  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      category: "",
      subcategories: [{ name: "" }],
    },
  });

  const createCategory = useMutation(api.products.createCategory);
  const [isPending, startTransition] = React.useTransition();
  const onSubmit = (data: z.infer<typeof categorySchema>) => {
    startTransition(async () => {
      try {
        await createCategory({
          category: {
            name: data.category,
            subCategories: data.subcategories.map((sc) => ({
              name: sc.name,
            })),
          },
        });
        toast.success("Category created successfully");
        form.reset();
        return onComplete && onComplete();
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong. Try again later");
      }
    });
  };

  return { form, onSubmit, isPending };
};

const useCategoryDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = () => {
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  return { open: isOpen, onOpenChange: setIsOpen, openDialog, closeDialog };
};

const CategoryForm = ({ children }: { children: React.ReactNode }) => {
  const { open, onOpenChange, closeDialog } = useCategoryDialog();
  const handleCloseDialog = () => {
    form.reset();
    closeDialog();
  };

  const { form, onSubmit, isPending } = useCategoryForm({
    onComplete: handleCloseDialog,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subcategories",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new category.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(onSubmit)(e);
              e.stopPropagation();
            }}
            className="flex flex-col gap-4"
          >
            <FormInput
              control={form.control}
              name="category"
              label="Category"
              placeholder="Category"
            />
            <div className="p-4 rounded-md border flex flex-col gap-4">
              <FormField
                control={form.control}
                name="subcategories"
                render={() => (
                  <FormItem>
                    <FormLabel className="mb-2">Subcategory</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        {fields.map((field, index) => (
                          <div key={field.id} className="flex gap-4">
                            <div className="flex flex-1 gap-2">
                              <FormInput
                                control={form.control}
                                name={`subcategories.${index}.name`}
                                containerClassNames="flex-1"
                                placeholder="Subcategory"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => remove(index)}
                              >
                                <X className="size-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" onClick={() => append({ name: "" })}>
                Add Subcategory
              </Button>
            </div>
            <div className="flex flex-row justify-end gap-2">
              <Button
                disabled={isPending}
                onClick={handleCloseDialog}
                type="button"
                variant="ghost"
              >
                Cancel
              </Button>

              <Button disabled={isPending}>
                {isPending && <Loader className="mr-2 size-4 animate-spin" />}
                Create Category
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const subcategorySchema = z.object({
  subcategory: z.string().min(1, { message: "Category name is required" }),
});

const useSubcategoryForm = ({
  parentId,
  onComplete,
}: {
  parentId: Id<"categories">;
  onComplete?: () => void;
}) => {
  const form = useForm<z.infer<typeof subcategorySchema>>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      subcategory: "",
    },
  });

  const createSubcategory = useMutation(api.products.createSubcategory);
  const [isPending, startTransition] = React.useTransition();
  const onSubmit = (data: z.infer<typeof subcategorySchema>) => {
    startTransition(async () => {
      try {
        await createSubcategory({
          parentId,
          name: data.subcategory,
        });
        toast.success("Subcategory created successfully");
        form.reset();
        return onComplete && onComplete();
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong. Try again later");
      }
    });
  };

  return { form, onSubmit, isPending };
};

const useSubcategoryDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = () => {
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  return { open: isOpen, onOpenChange: setIsOpen, openDialog, closeDialog };
};

const SubcategoryForm = ({
  children,
  parentId,
}: {
  children: React.ReactNode;
  parentId: Id<"categories">;
}) => {
  const { open, onOpenChange, closeDialog } = useSubcategoryDialog();
  const handleCloseDialog = () => {
    form.reset();
    closeDialog();
  };

  const { form, onSubmit, isPending } = useSubcategoryForm({
    onComplete: handleCloseDialog,
    parentId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Subcategory</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new subcategory.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(onSubmit)(e);
              e.stopPropagation();
            }}
            className="flex flex-col gap-4"
          >
            <FormInput
              control={form.control}
              name="subcategory"
              label="Subcategory"
              placeholder="Subcategory"
            />
            <div className="flex flex-row justify-end gap-2">
              <Button
                disabled={isPending}
                onClick={handleCloseDialog}
                type="button"
                variant="ghost"
              >
                Cancel
              </Button>
              <Button disabled={isPending}>
                {isPending && <Loader className="mr-2 size-4 animate-spin" />}
                Create SubCategory
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
