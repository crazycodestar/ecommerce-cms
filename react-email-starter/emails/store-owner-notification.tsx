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
  dashboardUrl: string;
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
  dashboardUrl,
}: StoreOwnerNotificationEmailProps) => {
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const totalAmount = amount + deliveryAmount;
  const totalItems = order.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Html>
      <Head />
      <Preview>
        New Order: #{reference} - ${totalAmount.toFixed(2)}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={headerText}>New Order Received</Heading>
          </Section>

          <Section style={section}>
            <Row>
              <Column>
                <Text style={orderInfoText}>
                  <strong>Order #:</strong> {reference}
                </Text>
                <Text style={orderInfoText}>
                  <strong>Date:</strong> {orderDate}
                </Text>
                <Text style={orderInfoText}>
                  <strong>Status:</strong>{" "}
                  {status === "succes" ? "Confirmed" : "Pending"}
                </Text>
              </Column>
              <Column align="right">
                <Button
                  href={`${dashboardUrl}/orders/${reference}`}
                  style={primaryButton}
                >
                  View Order Details
                </Button>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Heading as="h2" style={sectionHeading}>
              Customer Information
            </Heading>
            <Row>
              <Column style={columnHalf}>
                <Text style={infoLabel}>Name:</Text>
                <Text style={infoValue}>
                  {shippingInformation.firstName} {shippingInformation.lastName}
                </Text>
                <Text style={infoLabel}>Email:</Text>
                <Text style={infoValue}>
                  <Link href={`mailto:${email}`} style={link}>
                    {email}
                  </Link>
                </Text>
                <Text style={infoLabel}>Phone:</Text>
                <Text style={infoValue}>
                  <Link href={`tel:${phone}`} style={link}>
                    {phone}
                  </Link>
                </Text>
              </Column>
              <Column style={columnHalf}>
                <Text style={infoLabel}>Shipping Address:</Text>
                <Text style={infoValue}>
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

          <Hr style={hr} />

          <Section style={section}>
            <Heading as="h2" style={sectionHeading}>
              Order Summary ({totalItems} {totalItems === 1 ? "item" : "items"})
            </Heading>

            <table style={orderTable}>
              <thead>
                <tr>
                  <th style={tableHeader}>Product</th>
                  <th style={tableHeader}>Qty</th>
                  <th style={tableHeader}>Price</th>
                  <th style={tableHeader}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.map((item, index) => (
                  <tr key={index} style={tableRow}>
                    <td style={tableCell}>
                      <div style={productCell}>
                        <Img
                          src={item.product.imageUrl}
                          width="40"
                          height="40"
                          alt={item.product.name}
                          style={productImage}
                        />
                        <div style={productInfo}>
                          <Text style={productName}>{item.product.name}</Text>
                          {item.variants && item.variants.length > 0 && (
                            <Text style={variantText}>
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
                    <td style={tableCell}>{item.quantity}</td>
                    <td style={tableCell}>{formatPrice(item.product.price)}</td>
                    <td style={tableCell}>
                      {formatPrice(item.product.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table style={summaryTable}>
              <tbody>
                <tr>
                  <td style={summaryLabelCell}>Subtotal:</td>
                  <td style={summaryValueCell}>{formatPrice(amount)}</td>
                </tr>
                <tr>
                  <td style={summaryLabelCell}>Shipping:</td>
                  <td style={summaryValueCell}>
                    {formatPrice(deliveryAmount)}
                  </td>
                </tr>
                <tr>
                  <td style={totalLabelCell}>Total:</td>
                  <td style={totalValueCell}>{formatPrice(totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Row>
              <Column align="center">
                <Button
                  href={`${dashboardUrl}/orders/${reference}/process`}
                  style={actionButton}
                >
                  Process Order
                </Button>
              </Column>
              <Column align="center">
                <Button
                  href={`${dashboardUrl}/orders/${reference}/print`}
                  style={secondaryButton}
                >
                  Print Invoice
                </Button>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              This is an automated notification from your e-commerce platform.
              Please do not reply to this email.
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

// Example data
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
  orderDate: "June 8, 2024 - 10:23 AM",
  dashboardUrl: "https://admin.yourstore.com",
};

StoreOwnerNotificationEmail.PreviewProps =
  orderData as StoreOwnerNotificationEmailProps;

export default StoreOwnerNotificationEmail;

// Styles
const main = {
  backgroundColor: "#f5f5f5",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  maxWidth: "600px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
};

const headerSection = {
  backgroundColor: "#4f46e5",
  padding: "20px",
  textAlign: "center" as const,
};

const headerText = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const section = {
  padding: "20px 24px",
};

const sectionHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 15px",
  color: "#333",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "0",
};

const orderInfoText = {
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 8px",
  color: "#4c4c4c",
};

const columnHalf = {
  width: "50%",
  verticalAlign: "top" as const,
};

const infoLabel = {
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 4px",
  color: "#666",
};

const infoValue = {
  fontSize: "14px",
  margin: "0 0 12px",
  color: "#333",
};

const link = {
  color: "#4f46e5",
  textDecoration: "none",
};

const orderTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
  marginBottom: "20px",
};

const tableHeader = {
  textAlign: "left" as const,
  padding: "8px",
  borderBottom: "1px solid #e6ebf1",
  fontSize: "14px",
  fontWeight: "bold",
  color: "#666",
};

const tableRow = {
  borderBottom: "1px solid #e6ebf1",
};

const tableCell = {
  padding: "12px 8px",
  fontSize: "14px",
  color: "#333",
  verticalAlign: "top" as const,
};

const productCell = {
  display: "flex" as const,
  alignItems: "center" as const,
};

const productImage = {
  border: "1px solid #e6ebf1",
  borderRadius: "4px",
  marginRight: "10px",
};

const productInfo = {
  display: "flex" as const,
  flexDirection: "column" as const,
};

const productName = {
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 4px",
  color: "#333",
};

const variantText = {
  fontSize: "12px",
  color: "#666",
  margin: "0",
};

const summaryTable = {
  width: "100%",
  maxWidth: "300px",
  marginLeft: "auto",
  borderCollapse: "collapse" as const,
};

const summaryLabelCell = {
  textAlign: "right" as const,
  padding: "4px 8px",
  fontSize: "14px",
  color: "#666",
};

const summaryValueCell = {
  textAlign: "right" as const,
  padding: "4px 0",
  fontSize: "14px",
  color: "#333",
  width: "80px",
};

const totalLabelCell = {
  textAlign: "right" as const,
  padding: "8px 8px",
  fontSize: "16px",
  fontWeight: "bold",
  color: "#333",
};

const totalValueCell = {
  textAlign: "right" as const,
  padding: "8px 0",
  fontSize: "16px",
  fontWeight: "bold",
  color: "#333",
  width: "80px",
};

const primaryButton = {
  backgroundColor: "#4f46e5",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "10px 16px",
};

const actionButton = {
  backgroundColor: "#22c55e",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "10px 16px",
  width: "150px",
};

const secondaryButton = {
  backgroundColor: "#f3f4f6",
  borderRadius: "4px",
  color: "#374151",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "10px 16px",
  width: "150px",
  border: "1px solid #d1d5db",
};

const footerSection = {
  padding: "20px 24px",
  textAlign: "center" as const,
  backgroundColor: "#f9fafb",
};

const footerText = {
  fontSize: "12px",
  color: "#6b7280",
  lineHeight: "18px",
  margin: "0 0 8px",
};
