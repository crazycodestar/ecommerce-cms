import { z } from "zod";

export interface OrderType {
  email: string;
  phone: string;
  order: {
    product: {
      name: string;
      price: number;
    };
    quantity: number;
    variants?: {
      name: string;
      value: string;
    }[];
    metadatas?: {
      name: string;
      value: string | number;
    }[];
  }[];
  shippingInformation: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    zipCode: string;
  };
  amount: number;
  deliveryAmount: number;
  reference: string;
  status: "succes" | "pending";
}
