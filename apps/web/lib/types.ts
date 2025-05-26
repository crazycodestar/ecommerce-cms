export interface OrderType {
  url: string;
  email: string;
  phone: string;
  items: {
    name: string;
    price: number;
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
  terminalTrackingNumber?: string;
  terminalTrackingUrl?: string;
  reference: string;
  status: "pending" | "processing" | "shipping" | "delivered";
  paymentStatus: "pending" | "success";
}
