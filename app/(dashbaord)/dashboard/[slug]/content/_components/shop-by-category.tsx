"use client";

export interface GalleryProps {
  title?: string;
  description?: string;
}

export const ShopByCategory = ({
  title = "Case Studies",
  description = "Discover how leading companies and developers are leveraging.",
}: GalleryProps) => {
  return (
    <section className="pt-10 border-t-2 border-black">
      <div className="flex flex-col items-center mb-12">
        <h3 className="text-2xl font-bold text-center uppercase">{title}</h3>
        <p className="text-md text-center text-foreground/80">{description}</p>
      </div>
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index}>
              <div className="w-full aspect-square bg-muted" />
              <div className="w-full flex justify-center mt-2">
                <div className="w-[100px] h-4 bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
