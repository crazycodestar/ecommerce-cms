import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@packages/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export const Filters = async ({ storeSlug, slug }: { storeSlug: string, slug: string }) => {
    const filters = await fetchQuery(api.products.getFiltersBySlugAndStoreSlug, {
        storeSlug,
        slug,
    });

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
            {filters?.map(({ name, _id, options }) => (
                <AccordionItem value={`${name}-filter`} key={_id}>
                    <AccordionTrigger className="text-base hover:no-underline cursor-pointer py-4 rounded-none">
                        {name}
                    </AccordionTrigger>
                    <AccordionContent className="py-2 border-t">
                        {options?.map((name, index) => (
                            <div key={index} className="flex gap-3 items-center py-1">
                                <Checkbox />
                                <p className="py-1 whitespace-nowrap font-medium">{name}</p>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}