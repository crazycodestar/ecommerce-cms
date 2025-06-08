import { formatCurrency } from "@/lib/utils";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  Geist,
  Geist_Mono,
  Inter,
  Lora,
  Montserrat,
  Poppins,
  Roboto,
} from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { ContentFormValues } from "./content-form";
import { products } from "./dummy-products";
import { Footer } from "./footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
interface ContentPreviewProps {
  formValues?: ContentFormValues;
}

export function ContentPreview({ formValues }: ContentPreviewProps) {
  return (
    <div
      className={`${inter.variable} ${roboto.variable} ${montserrat.variable} ${lora.variable} ${poppins.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <HeroSection formValues={formValues} />

      <section className="container mx-auto px-4 md:px-8 py-16 flex flex-col gap-8">
        <h2 className="text-lg font-light uppercase tracking-wide text-center">
          My Products
        </h2>

        <MyProducts />
      </section>
      <Footer />
    </div>
  );
}

interface HeroSectionProps {
  formValues?: ContentFormValues;
}

function HeroSection({ formValues }: HeroSectionProps) {
  const store = useQuery(api.stores.getMyStore);
  const imageId = formValues?.hero?.imageId as Id<"_storage"> | undefined;
  const imageUrl = useQuery(
    api.contents.getImageUrl,
    imageId
      ? {
        imageId,
      }
      : "skip"
  );
  return (
    <div className="relative h-[50vh] w-full text-white">
      <Image
        src={imageUrl ?? "/placeholder.svg"}
        alt="Hero"
        fill
        className="w-full h-full object-cover absolute top-0 left-0"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black/30"></div>
      <div
        className="relative w-full h-full flex flex-col gap-2 justify-center items-center"
      >
        <p className="font-extralight text-sm uppercase tracking-wide">
          {store?.name}
        </p>
        <h1
          className="text-4xl font-light uppercase tracking-wide"
        >
          {formValues?.hero?.title || "Enter your title here"}
        </h1>
        <p className="text-sm font-extralight">
          {formValues?.hero?.description || "Enter your description here"}
        </p>
      </div>
    </div>
  );
}

const MyProducts = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {products?.map((product) => (
        <Link key={product._id} href="#" className="flex flex-col gap-2">
          <div className="relative w-full h-full overflow-hidden group">
            <Image
              src={product.imageUrls[0]}
              alt={product.name}
              width={300}
              height={400}
              className="w-full aspect-[3/4] object-cover transition-transform duration-250 group-hover:scale-105"
            />
            {product.imageUrls[1] && (
              <Image
                width={300}
                height={400}
                src={product.imageUrls[1]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-250 group-hover:opacity-100"
              />
            )}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center opacity-0 transition-opacity duration-250 group-hover:opacity-100">
              <button className="bg-white/90 text-black px-6 py-2 w-full text-sm font-medium hover:bg-white transition-colors">
                Quick View
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-light uppercase tracking-wider">
              {product.name}
            </p>
            <p className="font-extralight text-sm">
              {formatCurrency(product.price)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};
