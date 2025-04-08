"use client";

import { FormInput } from "@/components/form/form-input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useStoreSlug } from "@/lib/hooks/use-store-slug";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "convex/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// type FilterContext = {
//   isChecked: (propertyId: Id<"properties">, name: string) => boolean;
//   handleTogglePropertyFilter: (
//     propertyId: Id<"properties">,
//     name: string
//   ) => void;
//   filterByPropertyId: {
//     [key: Id<"properties">]: string[];
//   };
// };

// const FilterContext = React.createContext<FilterContext>({
//   filterByPropertyId: {},
//   handleTogglePropertyFilter: () => {},
//   isChecked: (...args: Parameters<FilterContext["isChecked"]>) => false,
// });

export const useFilter = (
  properties?: { _id: Id<"properties">; name: string; options?: string[] }[]
) => {
  //   const { storeSlug } = useStoreSlug();
  //   const properties = useQuery(api.collections.getFilters, { storeSlug });

  const [isInit, setIsInit] = React.useState(true);
  const [filterByPropertyId, setFilterByPropertyId] = React.useState<{
    [key: Id<"properties">]: string[];
  }>({});

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!properties) return;
    if (isInit) {
      setIsInit(false);
      const filterByProperty: Record<Id<"properties">, string[]> = {};
      properties.forEach(({ _id, name, options }) => {
        const value = searchParams.getAll(`filterBy${_id}`);
        return (filterByProperty[_id] = value);
      });

      return setFilterByPropertyId(filterByProperty);
    }

    const params = new URLSearchParams();
    const propertyFilters = Object.entries(filterByPropertyId) as [
      Id<"properties">,
      string[],
    ][];
    if (propertyFilters.length > 0) {
      propertyFilters.forEach(([key, value]) => {
        value.forEach((v) => params.append(`filterBy${key}`, v));
      });
    }

    // Update the URL
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
  }, [properties, filterByPropertyId]);

  const filterByPrice = searchParams.get("filterByPrice");

  const [filterByPriceRange, setFilterByPriceRange] = React.useState<{
    min: number;
    max: number;
  } | null>(null);

  //   React.useEffect(() => {
  //     if (filterByProperty) {
  //       console.log("filterByProperty", filterByProperty);
  //       //   setFilterByPropertyId(filterByProperty as Id<"properties">);
  //     }
  //   }, []);

  React.useEffect(() => {
    if (filterByPrice) {
      const [min, max] = filterByPrice.split(",").map(Number);
      setFilterByPriceRange({ min, max });
    }
  }, [filterByPrice]);

  const handleTogglePropertyFilter = (
    propertyId: Id<"properties">,
    name: string
  ) => {
    const propertyFilters = filterByPropertyId[propertyId] as
      | string[]
      | undefined;

    if (!propertyFilters)
      return setFilterByPropertyId((init) => ({
        ...init,
        [propertyId]: [name],
      }));
    // const newFilterByPropertyId = [...propertyFilter]
    const newPropertyFilters = propertyFilters
      ? propertyFilters.includes(name)
        ? propertyFilters.filter((val) => val !== name)
        : [...(propertyFilters || []), name]
      : [name];
    setFilterByPropertyId((init) => ({
      ...init,
      [propertyId]: newPropertyFilters,
    }));
  };

  const isChecked = (propertyId: Id<"properties">, name: string) => {
    const propertyFilters = filterByPropertyId[propertyId] as
      | string[]
      | undefined;

    return !!propertyFilters?.includes(name);
  };
  //   const handleSetPriceFilter = (min: number, max: number) => {
  //     onSetPriceFilter(min, max);
  //   };
  //   const handleResetFilters = () => {
  //     onSetPriceFilter(0, 0);
  //     properties?.forEach(({ _id }) => {
  //       onTogglePropertyFilter(_id);
  //     }
  //     );
  //   };
  //   const handleClearFilters = () => {
  //     onSetPriceFilter(0, 0);
  //     properties?.forEach(({ _id }) => {
  //       onTogglePropertyFilter(_id);
  //     }
  //     );
  //   };

  //   return (
  //     <FilterContext.Provider
  //       value={{ isChecked, handleTogglePropertyFilter, filterByPropertyId }}
  //     >
  //       {children}
  //     </FilterContext.Provider>
  //   );

  return {
    filterByPropertyId,
    handleTogglePropertyFilter,
    isChecked,
  };
};

// const useFilter = () => {
//   const value = React.useContext(FilterContext);
//   if (process.env.NODE_ENV !== "production") {
//     if (!value) {
//       throw new Error("useFilter must be wrapped in a <FilterProvider />");
//     }
//   }

//   return value;
// };

export const Filters = ({
  properties,
  isChecked,
  onTogglePropertyFilter,
}: {
  properties?: {
    name: string;
    _id: Id<"properties">;
    options?: string[];
  }[];
  onTogglePropertyFilter: (propertyId: Id<"properties">, name: string) => void;
  isChecked: (propertyId: Id<"properties">, name: string) => boolean;
}) => {
  const isPending = properties === undefined;

  if (isPending) {
    return (
      <Accordion className="border-t border-b" type="single" collapsible>
        {/* <AccordionItem value="price-filter">
          <AccordionTrigger className="text-base hover:no-underline cursor-pointer py-4 rounded-none">
            <Skeleton className="h-4 w-16 rounded" />
          </AccordionTrigger>
          <AccordionContent className="py-2 border-t">
            <div className="flex items-center gap-3 mt-2">
              <Skeleton className="h-8 w-full rounded" />
              <span>-</span>
              <Skeleton className="h-8 w-full rounded" />
            </div>
            <div className="flex justify-end mt-2">
              <Skeleton className="h-8 w-16 rounded" />
            </div>
          </AccordionContent>
        </AccordionItem> */}
        {[1, 2, 3].map((i) => (
          <AccordionItem value={`skeleton-${i}`} key={i}>
            <AccordionTrigger className="text-base hover:no-underline cursor-pointer py-4 rounded-none">
              <Skeleton className="h-4 w-24 rounded" />
            </AccordionTrigger>
            <AccordionContent className="py-2 border-t">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex gap-3 items-center py-1">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  }

  return (
    <Accordion className="border-t border-b" type="single" collapsible>
      {/* <AccordionItem value="price-filter">
        <AccordionTrigger className="text-base hover:no-underline cursor-pointer py-4 rounded-none">
          Price
        </AccordionTrigger>
        <AccordionContent className="py-2 border-t">
          <PriceForm
            handlePriceFilter={(values) =>
              onSetPriceFilter(values.min, values.max)
            }
          />
        </AccordionContent>
      </AccordionItem> */}
      {properties?.map(({ name, _id, options }) => (
        <AccordionItem value={`${name}-filter`} key={_id}>
          <AccordionTrigger className="text-base hover:no-underline cursor-pointer py-4 rounded-none">
            {name}
          </AccordionTrigger>
          <AccordionContent className="py-2 border-t">
            {options?.map((name, index) => (
              <div key={index} className="flex gap-3 items-center py-1">
                <Checkbox
                  checked={isChecked(_id, name)}
                  onClick={() => onTogglePropertyFilter(_id, name)}
                />
                <p className="py-1 whitespace-nowrap font-medium">{name}</p>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

const formSchema = z
  .object({
    min: z.coerce.number().min(0, {
      message: "The minimum amount is zero",
    }),
    max: z.coerce.number().min(0, {
      message: "The minimum amount is zero",
    }),
  })
  .refine(
    (data) => {
      if (data.min && data.max) {
        return data.min <= data.max;
      }
      return true;
    },
    {
      message: "The minimum amount must be less than the maximum amount",
      path: ["max"],
    }
  );

const PriceForm = ({
  handlePriceFilter,
}: {
  handlePriceFilter: (values: z.infer<typeof formSchema>) => void;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      min: 0,
      max: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    handlePriceFilter(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <div className="flex items-center gap-3 mt-2">
          <FormInput
            type="text"
            placeholder="Min"
            control={form.control}
            name="min"
            className="border rounded-md px-2 py-1 w-full"
          />
          <span>-</span>
          <FormInput
            type="text"
            placeholder="Max"
            control={form.control}
            name="max"
            className="border rounded-md px-2 py-1 w-full"
          />
        </div>
        <div className="flex justify-end mt-2">
          <Button variant="outline" size="sm" className="w-full">
            Apply
          </Button>
        </div>
      </form>
    </Form>
  );
};
