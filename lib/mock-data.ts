import type { OrderType } from "./types";

export const mockOrders: OrderType[] = [
  {
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    order: [
      {
        product: {
          name: "Premium Wireless Headphones",
          price: 149.99,
        },
        quantity: 1,
        variants: [
          {
            name: "Color",
            value: "Black",
          },
          {
            name: "Warranty",
            value: "2 Years",
          },
        ],
        metadatas: [
          {
            name: "Gift Wrap",
            value: "Yes",
          },
        ],
      },
      {
        product: {
          name: "Charging Case",
          price: 29.99,
        },
        quantity: 1,
        variants: undefined,
        metadatas: undefined,
      },
    ],
    shippingInformation: {
      firstName: "John",
      lastName: "Doe",
      address1: "123 Main Street",
      address2: "Apt 4B",
      city: "New York",
      zipCode: "10001",
    },
    amount: 189.98,
    deliveryAmount: 10.0,
    reference: "ORD-12345",
    status: "succes",
  },
  {
    email: "jane.smith@example.com",
    phone: "+1 (555) 987-6543",
    order: [
      {
        product: {
          name: "Smart Watch Series 5",
          price: 299.99,
        },
        quantity: 1,
        variants: [
          {
            name: "Color",
            value: "Silver",
          },
          {
            name: "Band",
            value: "Sport",
          },
        ],
        metadatas: undefined,
      },
    ],
    shippingInformation: {
      firstName: "Jane",
      lastName: "Smith",
      address1: "456 Oak Avenue",
      city: "Los Angeles",
      zipCode: "90001",
    },
    amount: 309.99,
    deliveryAmount: 10.0,
    reference: "ORD-67890",
    status: "pending",
  },
];
