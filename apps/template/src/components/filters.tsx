import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation, useRouter } from "@tanstack/react-router";
import React, { useEffect } from "react";

export const useFilter = (
  properties?: { _id: string; name: string; options?: string[] }[]
) => {
  const [isInit, setIsInit] = React.useState(true);
  const [filterByPropertyId, setFilterByPropertyId] = React.useState<{
    [key: string]: string[];
  }>({});

  const searchParams = new URLSearchParams();
  const router = useRouter();
  const pathname = useLocation().pathname;

  useEffect(() => {
    if (!properties) return;
    if (isInit) {
      setIsInit(false);
      const filterByProperty: Record<string, string[]> = {};
      properties.forEach(({ _id }) => {
        const value = searchParams.getAll(`filterBy${_id}`);
        return (filterByProperty[_id] = value);
      });

      return setFilterByPropertyId(filterByProperty);
    }

    const params = new URLSearchParams();
    const propertyFilters = Object.entries(filterByPropertyId) as [
      string,
      string[]
    ][];
    if (propertyFilters.length > 0) {
      propertyFilters.forEach(([key, value]) => {
        value.forEach((v) => params.append(`filterBy${key}`, v));
      });
    }

    // Update the URL
    const queryString = params.toString();
    router.navigate({
      to: `${pathname}${queryString ? `?${queryString}` : ""}`,
    });
  }, [properties, filterByPropertyId]);

  // const filterByPrice = searchParams.get("filterByPrice");

  // const [filterByPriceRange, setFilterByPriceRange] = React.useState<{
  //   min: number;
  //   max: number;
  // } | null>(null);

  //   React.useEffect(() => {
  //     if (filterByProperty) {
  //       console.log("filterByProperty", filterByProperty);
  //       //   setFilterByPropertyId(filterByProperty as Id<"properties">);
  //     }
  //   }, []);

  // React.useEffect(() => {
  //   if (filterByPrice) {
  //     const [min, max] = filterByPrice.split(",").map(Number);
  //     setFilterByPriceRange({ min, max });
  //   }
  // }, [filterByPrice]);

  const handleTogglePropertyFilter = (propertyId: string, name: string) => {
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

  const isChecked = (propertyId: string, name: string) => {
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
//   if (import.meta.env.NODE_ENV !== "production") {
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
    _id: string;
    options?: string[];
  }[];
  onTogglePropertyFilter: (propertyId: string, name: string) => void;
  isChecked: (propertyId: string, name: string) => boolean;
}) => {
  const isPending = properties === undefined;

  if (isPending) {
    return (
      <Accordion
        className="border-t border-b border-border"
        type="single"
        collapsible
      >
        {[1, 2, 3].map((i) => (
          <AccordionItem value={`skeleton-${i}`} key={i}>
            <AccordionTrigger className="text-base hover:no-underline cursor-pointer py-4 rounded-none">
              <Skeleton className="h-4 w-24 rounded" />
            </AccordionTrigger>
            <AccordionContent className="py-2 border-t border-border">
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
    <Accordion
      className="border-t border-b border-border"
      type="single"
      collapsible
    >
      {properties?.map(({ name, _id, options }) => (
        <AccordionItem value={`${name}-filter`} key={_id}>
          <AccordionTrigger className="text-base hover:no-underline cursor-pointer py-4 rounded-none">
            {name}
          </AccordionTrigger>
          <AccordionContent className="py-2 border-t border-border">
            {options?.map((name, index) => (
              <div key={index} className="flex gap-3 items-center py-1">
                <Checkbox
                  checked={isChecked(_id, name)}
                  onClick={() => onTogglePropertyFilter(_id, name)}
                />
                <p className="py-1 whitespace-nowrap font-normal">{name}</p>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
