import { Button } from "@/components/ui/button";
import React from "react";

export const EditTrigger = ({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="group relative hover:border-2 hover:border-primary">
      {children}
      <Button
        size="sm"
        className="hidden group-hover:flex absolute -bottom-4 left-1/2 rounded-full transform -translate-x-1/2"
      >
        Edit {name}
      </Button>
    </div>
  );
};
