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

interface OrderConfirmationEmailProps {
  email: string;
  phone: string;
  order: OrderItem[];
  shippingInformation: ShippingInformation;
  amount: number;
  deliveryAmount: number;
  reference: string;
  status: "succes" | "pending";
  trackingUrl: string;
}

export const OrderConfirmationEmail = ({
  email,
  phone,
  order,
  shippingInformation,
  amount,
  deliveryAmount,
  reference,
  status,
  trackingUrl,
}: OrderConfirmationEmailProps) => {
  const totalAmount = amount + deliveryAmount;

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Your order confirmation #{reference}</Preview>
        <Body className="bg-gray-50 font-sans">
          <Container className="bg-white mx-auto py-5 max-w-[600px]">
            <Section className="px-6">
              <Heading className="text-2xl font-bold text-center my-8 text-gray-800">
                Order Confirmation
              </Heading>
              <Text className="text-base leading-6 my-4 text-gray-700">
                Hi {shippingInformation.firstName},
              </Text>
              <Text className="text-base leading-6 my-4 text-gray-700">
                Thank you for your order! We're pleased to confirm that we've
                received your order and it's being processed.
              </Text>
              <Text className="text-base leading-6 my-4 text-gray-700">
                <strong>Order Number:</strong> #{reference}
              </Text>
              <Text className="text-base leading-6 my-4 text-gray-700">
                <strong>Order Status:</strong>{" "}
                {status === "succes" ? "Confirmed" : "Pending"}
              </Text>

              <Button
                href={trackingUrl}
                className="bg-slate-900 rounded px-6 py-3 text-white text-base font-bold no-underline text-center block mx-auto my-6 w-[220px]"
              >
                Track Your Order
              </Button>
            </Section>

            <Hr className="border-gray-200 my-5" />

            <Section className="px-6">
              <Heading
                as="h2"
                className="text-lg font-bold my-5 mt-2 text-gray-800"
              >
                Order Summary
              </Heading>

              {order.map((item, index) => (
                <Row key={index} className="my-3">
                  <Column className="w-[80px] align-top">
                    <Img
                      src={item.product.imageUrl}
                      width="80"
                      height="80"
                      alt={item.product.name}
                      className="border border-gray-200 rounded"
                    />
                  </Column>
                  <Column className="pl-4 align-top">
                    <Text className="text-base font-bold m-0 mb-1 text-gray-800">
                      {item.product.name}
                    </Text>
                    <Text className="text-sm text-gray-600 m-0 mb-1">
                      {formatCurrency(item.product.price)} × {item.quantity}
                    </Text>

                    {item.variants && item.variants.length > 0 && (
                      <Text className="text-sm text-gray-600 m-0 mb-1">
                        {item.variants
                          .map((variant) => `${variant.name}: ${variant.value}`)
                          .join(", ")}
                      </Text>
                    )}

                    {item.metadatas && item.metadatas.length > 0 && (
                      <Text className="text-sm text-gray-600 m-0">
                        {item.metadatas
                          .map(
                            (metadata) => `${metadata.name}: ${metadata.value}`
                          )
                          .join(", ")}
                      </Text>
                    )}
                  </Column>
                  <Column className="text-right align-top">
                    <Text className="text-base font-bold text-gray-800">
                      {formatCurrency(item.product.price * item.quantity)}
                    </Text>
                  </Column>
                </Row>
              ))}

              <Hr className="border-gray-200 my-5" />

              <Row className="my-2">
                <Column className="w-[70%] text-right pr-3">
                  <Text className="text-sm text-gray-600">Subtotal:</Text>
                </Column>
                <Column className="w-[30%] text-right">
                  <Text className="text-sm text-gray-800">
                    {formatCurrency(amount)}
                  </Text>
                </Column>
              </Row>

              <Row className="my-2">
                <Column className="w-[70%] text-right pr-3">
                  <Text className="text-sm text-gray-600">Shipping:</Text>
                </Column>
                <Column className="w-[30%] text-right">
                  <Text className="text-sm text-gray-800">
                    {formatCurrency(deliveryAmount)}
                  </Text>
                </Column>
              </Row>

              <Row className="my-2">
                <Column className="w-[70%] text-right pr-3">
                  <Text className="text-base font-bold text-gray-800">
                    Total:
                  </Text>
                </Column>
                <Column className="w-[30%] text-right">
                  <Text className="text-base font-bold text-gray-800">
                    {formatCurrency(totalAmount)}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Hr className="border-gray-200 my-5" />

            <Section className="px-6">
              <Heading
                as="h2"
                className="text-lg font-bold my-5 mt-2 text-gray-800"
              >
                Shipping Information
              </Heading>
              <Text className="text-base leading-6 text-gray-700">
                {shippingInformation.firstName} {shippingInformation.lastName}
                <br />
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
            </Section>

            <Hr className="border-gray-200 my-5" />

            <Section className="px-6">
              <Heading
                as="h2"
                className="text-lg font-bold my-5 mt-2 text-gray-800"
              >
                Contact Information
              </Heading>
              <Text className="text-base leading-6 text-gray-700">
                Email: {email}
                <br />
                Phone: +234{phone}
              </Text>
            </Section>

            <Hr className="border-gray-200 my-5" />

            <Section className="px-6 text-center">
              <Text className="text-sm text-gray-500 leading-5">
                If you have any questions about your order, please contact our
                customer service team at support@example.com or call us at (123)
                456-7890.
              </Text>
              <Text className="text-sm text-gray-500 leading-5">
                © 2024 Your Store. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default (props: OrderConfirmationEmailProps) => (
  <OrderConfirmationEmail {...props} />
);
