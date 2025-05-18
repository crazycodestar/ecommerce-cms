export interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrls: string[];
  description: string;
}

export const products: Product[] = [
  {
    _id: "1",
    name: "Generic Skincare Product 1",
    price: 150000,
    imageUrls: ["/products/product_1_1.jpg", "/products/product_1_2.jpg"],
    description: "High-quality skincare product for daily use",
  },
  {
    _id: "2",
    name: "Generic Skincare Product 2",
    price: 100000,
    imageUrls: ["/products/product_2_1.jpg", "/products/product_2_2.jpg"],
    description: "Premium skincare product for sensitive skin",
  },
  {
    _id: "3",
    name: "Generic Skincare Product 3",
    price: 75000,
    imageUrls: ["/products/product_3_1.jpg", "/products/product_3_2.jpg"],
    description: "Advanced skincare formula for all skin types",
  },
  {
    _id: "4",
    name: "Generic Skincare Product 4",
    price: 45000,
    imageUrls: ["/products/product_4_1.jpg", "/products/product_4_2.jpg"],
    description: "Nourishing skincare solution for daily care",
  },
  {
    _id: "5",
    name: "Generic Skincare Product 5",
    price: 25000,
    imageUrls: ["/products/product_5_1.jpg", "/products/product_5_2.jpg"],
    description: "Essential skincare product for basic routine",
  },
  {
    _id: "6",
    name: "Generic Skincare Product 6",
    price: 10000,
    imageUrls: ["/products/product_6_1.jpg", "/products/product_6_2.jpg"],
    description: "Entry-level skincare product for beginners",
  },
];
