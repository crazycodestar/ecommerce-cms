import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import { formatCurrency } from "../utils";

interface OrderVariant {
  name: string;
  value: string;
}

interface OrderMetadata {
  name: string;
  value: string | number;
}

interface OrderProduct {
  imageUrl: string;
  name: string;
  price: number;
}

interface OrderItem {
  product: OrderProduct;
  quantity: number;
  variants?: OrderVariant[];
  metadatas?: OrderMetadata[];
}

interface ShippingInformation {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  zipCode: string;
}

interface StoreOwnerNotificationEmailProps {
  email: string;
  phone: string;
  order: OrderItem[];
  shippingInformation: ShippingInformation;
  amount: number;
  deliveryAmount: number;
  reference: string;
  status: "succes" | "pending";
  orderDate: string;
  orderUrl: string;
}

export const StoreOwnerNotificationEmail = ({
  email,
  phone,
  order,
  shippingInformation,
  amount,
  deliveryAmount,
  reference,
  status,
  orderDate,
  orderUrl,
}: StoreOwnerNotificationEmailProps) => {
  const totalAmount = amount + deliveryAmount;
  const totalItems = order.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>
          New Order: #{reference} - {formatCurrency(totalAmount)}
        </Preview>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white mx-auto p-0 max-w-[600px] shadow-sm">
            <Section className="bg-indigo-600 p-5 text-center">
              <Heading className="text-white text-2xl font-bold m-0">
                New Order Received
              </Heading>
            </Section>

            <Section className="p-5 sm:p-6">
              <Row>
                <Column>
                  <Text className="text-sm leading-5 m-0 mb-2 text-gray-700">
                    <strong>Order #:</strong> {reference}
                  </Text>
                  <Text className="text-sm leading-5 m-0 mb-2 text-gray-700">
                    <strong>Date:</strong> {orderDate}
                  </Text>
                  <Text className="text-sm leading-5 m-0 mb-2 text-gray-700">
                    <strong>Status:</strong>{" "}
                    {status === "succes" ? "Confirmed" : "Pending"}
                  </Text>
                </Column>
                <Column align="right">
                  <Button
                    href={orderUrl}
                    className="bg-indigo-600 rounded px-4 py-2.5 text-white text-sm font-bold no-underline text-center"
                  >
                    View Order Details
                  </Button>
                </Column>
              </Row>
            </Section>

            <Hr className="border-gray-200 my-0" />

            <Section className="p-5 sm:p-6">
              <Heading
                as="h2"
                className="text-lg font-bold m-0 mb-4 text-gray-800"
              >
                Customer Information
              </Heading>
              <Row>
                <Column className="w-1/2 align-top">
                  <Text className="text-sm font-bold m-0 mb-1 text-gray-600">
                    Name:
                  </Text>
                  <Text className="text-sm m-0 mb-3 text-gray-800">
                    {shippingInformation.firstName}{" "}
                    {shippingInformation.lastName}
                  </Text>
                  <Text className="text-sm font-bold m-0 mb-1 text-gray-600">
                    Email:
                  </Text>
                  <Text className="text-sm m-0 mb-3 text-gray-800">
                    <Link
                      href={`mailto:${email}`}
                      className="text-indigo-600 no-underline"
                    >
                      {email}
                    </Link>
                  </Text>
                  <Text className="text-sm font-bold m-0 mb-1 text-gray-600">
                    Phone:
                  </Text>
                  <Text className="text-sm m-0 mb-3 text-gray-800">
                    <Link
                      href={`tel:+234${phone}`}
                      className="text-indigo-600 no-underline"
                    >
                      +234{phone}
                    </Link>
                  </Text>
                </Column>
                <Column className="w-1/2 align-top">
                  <Text className="text-sm font-bold m-0 mb-1 text-gray-600">
                    Shipping Address:
                  </Text>
                  <Text className="text-sm m-0 mb-3 text-gray-800">
                    {shippingInformation.address1}
                    <br />
                    {shippingInformation.address2 && (
                      <>
                        {shippingInformation.address2}
                        <br />
                      </>
                    )}
                    {shippingInformation.city}, {shippingInformation.zipCode}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Hr className="border-gray-200 my-0" />

            <Section className="p-5 sm:p-6">
              <Heading
                as="h2"
                className="text-lg font-bold m-0 mb-4 text-gray-800"
              >
                Order Summary ({totalItems}{" "}
                {totalItems === 1 ? "item" : "items"})
              </Heading>

              <table className="w-full border-collapse mb-5">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b border-gray-200 text-sm font-bold text-gray-600">
                      Product
                    </th>
                    <th className="text-left p-2 border-b border-gray-200 text-sm font-bold text-gray-600">
                      Qty
                    </th>
                    <th className="text-left p-2 border-b border-gray-200 text-sm font-bold text-gray-600">
                      Price
                    </th>
                    <th className="text-left p-2 border-b border-gray-200 text-sm font-bold text-gray-600">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="p-3 text-sm text-gray-800 align-top">
                        <div className="flex items-center">
                          <Img
                            src={item.product.imageUrl}
                            width="40"
                            height="40"
                            alt={item.product.name}
                            className="border border-gray-200 rounded mr-2.5"
                          />
                          <div className="flex flex-col">
                            <Text className="text-sm font-bold m-0 mb-1 text-gray-800">
                              {item.product.name}
                            </Text>
                            {item.variants && item.variants.length > 0 && (
                              <Text className="text-xs m-0 text-gray-600">
                                {item.variants
                                  .map(
                                    (variant) =>
                                      `${variant.name}: ${variant.value}`
                                  )
                                  .join(", ")}
                              </Text>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-800 align-top">
                        {item.quantity}
                      </td>
                      <td className="p-3 text-sm text-gray-800 align-top">
                        {formatCurrency(item.product.price)}
                      </td>
                      <td className="p-3 text-sm text-gray-800 align-top">
                        {formatCurrency(item.product.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <table className="w-full max-w-[300px] ml-auto border-collapse">
                <tbody>
                  <tr>
                    <td className="text-right p-1 px-2 text-sm text-gray-600">
                      Subtotal:
                    </td>
                    <td className="text-right p-1 text-sm text-gray-800 w-[80px]">
                      {formatCurrency(amount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-right p-1 px-2 text-sm text-gray-600">
                      Shipping:
                    </td>
                    <td className="text-right p-1 text-sm text-gray-800 w-[80px]">
                      {formatCurrency(deliveryAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-right p-2 px-2 text-base font-bold text-gray-800">
                      Total:
                    </td>
                    <td className="text-right p-2 text-base font-bold text-gray-800 w-[80px]">
                      {formatCurrency(totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Hr className="border-gray-200 my-0" />

            <Section className="p-5 sm:p-6 text-center bg-gray-50">
              <Text className="text-xs text-gray-500 leading-4 m-0 mb-2">
                This is an automated notification from your e-commerce platform.
                Please do not reply to this email.
              </Text>
              <Text className="text-xs text-gray-500 leading-4 m-0 mb-2">
                © 2024 Your Store. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default (props: StoreOwnerNotificationEmailProps) => (
  <StoreOwnerNotificationEmail {...props} />
);
