import { cn } from "@/lib/utils";

export const FeatureCard = ({
    image: Image,
    title,
    description,
    imageContainerClassName,
}: {
    image: React.ReactNode;
    title: string;
    description: string;
    imageContainerClassName?: string;
}) => {
    return (
        <div className="flex flex-col gap-4 bg-muted/60 rounded-lg pb-8">
            <div
                className={cn(
                    "w-full h-full flex flex-col justify-center items-center",
                    imageContainerClassName
                )}
            >
                {Image}
            </div>
            <div className="px-8">
                <h3 className="text-xl">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
            </div>
        </div>
    );
};
