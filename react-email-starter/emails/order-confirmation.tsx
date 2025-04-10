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
      <Head />
      <Preview>Your order confirmation #{reference}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://example.com/logo.png"
              width="170"
              height="50"
              alt="Your Store Logo"
              style={logo}
            />
          </Section>
          <Section style={section}>
            <Heading style={heading}>Order Confirmation</Heading>
            <Text style={paragraph}>Hi {shippingInformation.firstName},</Text>
            <Text style={paragraph}>
              Thank you for your order! We're pleased to confirm that we've
              received your order and it's being processed.
            </Text>
            <Text style={paragraph}>
              <strong>Order Reference:</strong> #{reference}
            </Text>
            <Text style={paragraph}>
              <strong>Order Status:</strong>{" "}
              {status === "succes" ? "Confirmed" : "Pending"}
            </Text>
            <Text style={paragraph}>
              <strong>Tracking Number:</strong> {trackingNumber}
            </Text>
            <Text style={paragraph}>
              <strong>Estimated Delivery:</strong> {estimatedDelivery}
            </Text>

            <Button
              href={`https://example.com/track?number=${trackingNumber}`}
              style={button}
            >
              Track Your Order
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Heading as="h2" style={subheading}>
              Order Summary
            </Heading>

            {order.map((item, index) => (
              <Row key={index} style={orderItem}>
                <Column style={imageColumn}>
                  <Img
                    src={item.product.imageUrl}
                    width="80"
                    height="80"
                    alt={item.product.name}
                    style={productImage}
                  />
                </Column>
                <Column style={detailsColumn}>
                  <Text style={productName}>{item.product.name}</Text>
                  <Text style={productPrice}>
                    {formatPrice(item.product.price)} × {item.quantity}
                  </Text>

                  {item.variants && item.variants.length > 0 && (
                    <Text style={variantText}>
                      {item.variants
                        .map((variant) => `${variant.name}: ${variant.value}`)
                        .join(", ")}
                    </Text>
                  )}

                  {item.metadatas && item.metadatas.length > 0 && (
                    <Text style={metadataText}>
                      {item.metadatas
                        .map(
                          (metadata) => `${metadata.name}: ${metadata.value}`
                        )
                        .join(", ")}
                    </Text>
                  )}
                </Column>
                <Column style={priceColumn}>
                  <Text style={itemTotalPrice}>
                    {formatPrice(item.product.price * item.quantity)}
                  </Text>
                </Column>
              </Row>
            ))}

            <Hr style={hr} />

            <Row style={summaryRow}>
              <Column style={summaryLabelColumn}>
                <Text style={summaryLabel}>Subtotal:</Text>
              </Column>
              <Column style={summaryValueColumn}>
                <Text style={summaryValue}>{formatPrice(amount)}</Text>
              </Column>
            </Row>

            <Row style={summaryRow}>
              <Column style={summaryLabelColumn}>
                <Text style={summaryLabel}>Shipping:</Text>
              </Column>
              <Column style={summaryValueColumn}>
                <Text style={summaryValue}>{formatPrice(deliveryAmount)}</Text>
              </Column>
            </Row>

            <Row style={summaryRow}>
              <Column style={summaryLabelColumn}>
                <Text style={totalLabel}>Total:</Text>
              </Column>
              <Column style={summaryValueColumn}>
                <Text style={totalValue}>{formatPrice(totalAmount)}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Heading as="h2" style={subheading}>
              Shipping Information
            </Heading>
            <Text style={addressText}>
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

          <Hr style={hr} />

          <Section style={section}>
            <Heading as="h2" style={subheading}>
              Contact Information
            </Heading>
            <Text style={contactText}>
              Email: {email}
              <br />
              Phone: {phone}
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              If you have any questions about your order, please contact our
              customer service team at support@example.com or call us at (123)
              456-7890.
            </Text>
            <Text style={footerText}>
              © 2024 Your Store. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
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
