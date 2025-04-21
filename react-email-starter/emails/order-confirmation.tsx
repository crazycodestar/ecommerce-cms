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
  trackingNumber: string;
  estimatedDelivery: string;
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
  trackingNumber,
  estimatedDelivery,
}: OrderConfirmationEmailProps) => {
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const totalAmount = amount + deliveryAmount;

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Your order confirmation #{reference}</Preview>
        <Body className="bg-gray-50 font-sans">
          <Container className="bg-white mx-auto py-5 max-w-[600px]">
            <Section className="px-5 text-center">
              <Img
                src="https://example.com/logo.png"
                width="170"
                height="50"
                alt="Your Store Logo"
                className="mx-auto"
              />
            </Section>
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
                <strong>Order Reference:</strong> #{reference}
              </Text>
              <Text className="text-base leading-6 my-4 text-gray-700">
                <strong>Order Status:</strong>{" "}
                {status === "succes" ? "Confirmed" : "Pending"}
              </Text>
              <Text className="text-base leading-6 my-4 text-gray-700">
                <strong>Tracking Number:</strong> {trackingNumber}
              </Text>
              <Text className="text-base leading-6 my-4 text-gray-700">
                <strong>Estimated Delivery:</strong> {estimatedDelivery}
              </Text>

              <Button
                href={`https://example.com/track?number=${trackingNumber}`}
                className="bg-purple-600 rounded px-6 py-3 text-white text-base font-bold no-underline text-center block mx-auto my-6 w-[220px]"
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
                      {formatPrice(item.product.price)} × {item.quantity}
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
                      {formatPrice(item.product.price * item.quantity)}
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
                    {formatPrice(amount)}
                  </Text>
                </Column>
              </Row>

              <Row className="my-2">
                <Column className="w-[70%] text-right pr-3">
                  <Text className="text-sm text-gray-600">Shipping:</Text>
                </Column>
                <Column className="w-[30%] text-right">
                  <Text className="text-sm text-gray-800">
                    {formatPrice(deliveryAmount)}
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
                    {formatPrice(totalAmount)}
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
                Phone: {phone}
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

const orderData = {
  email: "customer@example.com",
  phone: "+1 (555) 123-4567",
  order: [
    {
      product: {
        imageUrl: "https://example.com/images/product1.jpg",
        name: "Premium Wireless Headphones",
        price: 129.99,
      },
      quantity: 1,
      variants: [
        {
          name: "Color",
          value: "Black",
        },
      ],
    },
    {
      product: {
        imageUrl: "https://example.com/images/product2.jpg",
        name: "Smartphone Case",
        price: 24.99,
      },
      quantity: 2,
      variants: [
        {
          name: "Color",
          value: "Blue",
        },
        {
          name: "Material",
          value: "Silicone",
        },
      ],
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
  amount: 179.97,
  deliveryAmount: 9.99,
  reference: "ORD-12345",
  status: "succes",
  trackingNumber: "TRK-9876543210",
  estimatedDelivery: "June 15-18, 2024",
};

OrderConfirmationEmail.PreviewProps = orderData as OrderConfirmationEmailProps;

export default OrderConfirmationEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0",
  maxWidth: "600px",
};

const logoContainer = {
  padding: "20px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const section = {
  padding: "0 24px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
  color: "#333",
};

const subheading = {
  fontSize: "18px",
  fontWeight: "bold",
  margin: "20px 0 10px",
  color: "#333",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
  color: "#4c4c4c",
};

const button = {
  backgroundColor: "#5f6caf",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
  margin: "24px auto",
  width: "220px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const orderItem = {
  margin: "12px 0",
};

const imageColumn = {
  width: "80px",
  verticalAlign: "top" as const,
};

const detailsColumn = {
  paddingLeft: "16px",
  verticalAlign: "top" as const,
};

const priceColumn = {
  textAlign: "right" as const,
  verticalAlign: "top" as const,
};

const productImage = {
  border: "1px solid #e6ebf1",
  borderRadius: "4px",
};

const productName = {
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 4px",
  color: "#333",
};

const productPrice = {
  fontSize: "14px",
  color: "#666",
  margin: "0 0 4px",
};

const variantText = {
  fontSize: "14px",
  color: "#666",
  margin: "0 0 4px",
};

const metadataText = {
  fontSize: "14px",
  color: "#666",
  margin: "0",
};

const itemTotalPrice = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#333",
};

const summaryRow = {
  margin: "8px 0",
};

const summaryLabelColumn = {
  width: "70%",
  textAlign: "right" as const,
  paddingRight: "12px",
};

const summaryValueColumn = {
  width: "30%",
  textAlign: "right" as const,
};

const summaryLabel = {
  fontSize: "14px",
  color: "#666",
};

const summaryValue = {
  fontSize: "14px",
  color: "#333",
};

const totalLabel = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#333",
};

const totalValue = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#333",
};

const addressText = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#4c4c4c",
};

const contactText = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#4c4c4c",
};

const footerSection = {
  padding: "0 24px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "14px",
  color: "#8898aa",
  lineHeight: "22px",
};
