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
import {
    CheckCircleIcon,
    ClockIcon,
    TruckIcon,
    PackageIcon,
} from "lucide-react";

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

interface OrderStatusUpdateEmailProps {
    email: string;
    phone: string;
    order: OrderItem[];
    shippingInformation: ShippingInformation;
    amount: number;
    deliveryAmount: number;
    reference: string;
    status: "pending" | "processing" | "shipping" | "delivered";
    trackingUrl: string;
}

const StatusProgress = ({ status }: { status: OrderStatusUpdateEmailProps["status"] }) => {
    const steps = [
        { id: "pending", label: "Order Received", icon: ClockIcon },
        { id: "processing", label: "Processing", icon: PackageIcon },
        { id: "shipping", label: "In Transit", icon: TruckIcon },
        { id: "delivered", label: "Delivered", icon: CheckCircleIcon },
    ];

    const currentStepIndex = steps.findIndex((step) => step.id === status);

    return (
        <Row className="w-full my-6">
            <Column className="w-full">
                <div className="flex justify-between items-center w-full">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStepIndex
                                    ? "bg-green-500"
                                    : "bg-gray-200"
                                    }`}
                            >
                                <step.icon
                                    className={`w-5 h-5 ${index <= currentStepIndex
                                        ? "text-white"
                                        : "text-gray-400"
                                        }`}
                                />
                            </div>
                            <Text className={`text-xs mt-2 text-center ${index <= currentStepIndex
                                ? "text-green-500 font-bold"
                                : "text-gray-400"
                                }`}>
                                {step.label}
                            </Text>
                        </div>
                    ))}
                </div>
                <div className="relative mt-4">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-200" />
                    <div
                        className="absolute top-0 left-0 h-1 bg-green-500"
                        style={{
                            width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                        }}
                    />
                </div>
            </Column>
        </Row>
    );
};

export const OrderStatusUpdateEmail = ({
    email,
    phone,
    order,
    shippingInformation,
    amount,
    deliveryAmount,
    reference,
    status,
    trackingUrl,
}: OrderStatusUpdateEmailProps) => {
    const totalAmount = amount + deliveryAmount;

    const getStatusMessage = (status: OrderStatusUpdateEmailProps["status"]) => {
        switch (status) {
            case "pending":
                return "We've received your order and it's being verified.";
            case "processing":
                return "Your order is being prepared for shipping.";
            case "shipping":
                return "Your order is on its way to you!";
            case "delivered":
                return "Your order has been delivered successfully.";
            default:
                return "";
        }
    };

    return (
        <Html>
            <Tailwind>
                <Head />
                <Preview>Order Status Update: #{reference}</Preview>
                <Body className="bg-gray-50 font-sans">
                    <Container className="bg-white mx-auto py-5 max-w-[600px]">
                        <Section className="px-6">
                            <Heading className="text-2xl font-bold text-center my-8 text-gray-800">
                                Order Status Update
                            </Heading>
                            <Text className="text-base leading-6 my-4 text-gray-700">
                                Hi {shippingInformation.firstName},
                            </Text>
                            <Text className="text-base leading-6 my-4 text-gray-700">
                                {getStatusMessage(status)}
                            </Text>

                            <StatusProgress status={status} />

                            {status === "shipping" && (
                                <Section className="bg-blue-50 p-4 rounded-lg my-6">
                                    <Text className="text-base leading-6 text-blue-700 m-0">
                                        <strong>Estimated Delivery:</strong> 2-3 business days
                                    </Text>
                                    <Text className="text-base leading-6 text-blue-700 m-0">
                                        <strong>Carrier:</strong> Express Delivery Services
                                    </Text>
                                    <Button
                                        href={trackingUrl}
                                        className="bg-blue-700 rounded px-6 py-3 text-white text-base font-bold no-underline text-center block mt-4"
                                    >
                                        Track Your Package
                                    </Button>
                                </Section>
                            )}
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

export default (props: OrderStatusUpdateEmailProps) => (
    <OrderStatusUpdateEmail {...props} />
);
