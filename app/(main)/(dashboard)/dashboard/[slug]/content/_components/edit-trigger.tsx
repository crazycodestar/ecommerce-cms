import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus, X } from "lucide-react";
import React from "react";

export const Edit = Sheet;

export const EditWrapper = ({
  children,
  onOpenAddSheet,
  onOpenEditSheet,
  onRemove,
}: {
  children: React.ReactNode;
  onOpenEditSheet: () => void;
  onOpenAddSheet: () => void;
  onRemove: () => void;
}) => {
  return (
    <div className="group relative hover:border-2 hover:border-primary">
      {children}
      <div className="hidden group-hover:flex items-center absolute -bottom-4.5 left-1/2 transform -translate-x-1/2 gap-2">
        <Button
          type="button"
          variant="destructive"
          onClick={onRemove}
          size="icon"
          className="rounded-full size-8"
        >
          <X className="size-4" />
        </Button>
        <Button
          type="button"
          onClick={onOpenEditSheet}
          size="sm"
          className="rounded-full"
        >
          Edit Section
        </Button>
        <Button
          type="button"
          onClick={onOpenAddSheet}
          size="icon"
          className="rounded-full size-8"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export const EditContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <SheetContent className="flex flex-col gap-0 p-0 [&>button:last-child]:top-3.5">
      <SheetHeader className="border-b">
        <SheetTitle>Create or Update Section</SheetTitle>
        <SheetDescription>Fill in the details of the section.</SheetDescription>
      </SheetHeader>
      {children}
    </SheetContent>
  );
};

export const EditTrigger = SheetTrigger;
export const EditFooter = SheetFooter;
export const EditClose = SheetClose;
