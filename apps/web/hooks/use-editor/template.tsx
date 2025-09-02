import { Pages } from "./elements";

export const template = [
  {
    id: "home",
    name: "Home",
    elements: [
      {
        name: "Body",
        type: "body",
        id: crypto.randomUUID(),
        children: [],
      },
    ],
  },
] satisfies Pages;

const children = [
  {
    id: crypto.randomUUID(),
    name: "Section",
    hasBeenEdited: true,
    type: "section",
    className: [
      {
        id: crypto.randomUUID(),
        text: "bg-white text-black py-12 px-4 md:px-8",
      },
    ],
    children: [
      {
        id: crypto.randomUUID(),
        name: "Container",
        type: "container",
        hasBeenEdited: true,
        className: [
          {
            id: crypto.randomUUID(),
            text: "max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center",
          },
        ],
        children: [
          {
            id: crypto.randomUUID(),
            name: "Container",
            type: "container",
            hasBeenEdited: true,
            className: [
              { id: crypto.randomUUID(), text: "flex flex-col gap-4" },
            ],
            children: [
              {
                id: crypto.randomUUID(),
                name: "Text",
                type: "text",
                text: "Martech",
                hasBeenEdited: true,
                className: [
                  {
                    id: crypto.randomUUID(),
                    text: "text-4xl font-bold",
                  },
                ],
              },
              {
                id: crypto.randomUUID(),
                name: "Text",
                type: "text",
                text: "Nigeria’s Sole Distributor of Izocam Fiber Insulation",
                hasBeenEdited: true,
                className: [{ id: crypto.randomUUID(), text: "text-lg" }],
              },
              {
                id: crypto.randomUUID(),
                name: "Container",
                type: "container",
                hasBeenEdited: true,
                className: [
                  { id: crypto.randomUUID(), text: "flex gap-4 mt-4" },
                ],
                children: [
                  {
                    id: crypto.randomUUID(),
                    name: "Link",
                    type: "link",
                    href: "/shop",
                    text: "Shop Izocam",
                    hasBeenEdited: true,
                    className: [
                      {
                        id: crypto.randomUUID(),
                        text: "px-4 py-2 bg-black text-white rounded-lg",
                      },
                    ],
                  },
                  {
                    id: crypto.randomUUID(),
                    name: "Link",
                    type: "link",
                    href: "https://wa.me/2348012345678",
                    text: "WhatsApp Us",
                    hasBeenEdited: true,
                    className: [
                      {
                        id: crypto.randomUUID(),
                        text: "px-4 py-2 border border-black rounded-lg",
                      },
                    ],
                  },
                ],
              },
              {
                id: crypto.randomUUID(),
                name: "Container",
                type: "container",
                hasBeenEdited: true,
                className: [
                  {
                    id: crypto.randomUUID(),
                    text: "flex gap-6 mt-6 text-sm",
                  },
                ],
                children: [
                  {
                    id: crypto.randomUUID(),
                    name: "Text",
                    type: "text",
                    text: "✔ CAC Registered",
                    hasBeenEdited: true,
                  },
                  {
                    id: crypto.randomUUID(),
                    name: "Text",
                    type: "text",
                    text: "✔ Official Izocam Partner",
                    hasBeenEdited: true,
                  },
                  {
                    id: crypto.randomUUID(),
                    name: "Text",
                    type: "text",
                    text: "✔ Nationwide Delivery",
                    hasBeenEdited: true,
                  },
                  {
                    id: crypto.randomUUID(),
                    name: "Text",
                    type: "text",
                    text: "✔ Secure Payments",
                    hasBeenEdited: true,
                  },
                ],
              },
            ],
          },
          {
            id: crypto.randomUUID(),
            name: "Image",
            type: "image",
            src: "/placeholder.svg",
            hasBeenEdited: true,
            className: [
              {
                id: crypto.randomUUID(),
                text: "w-full h-96 object-cover rounded-lg",
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: crypto.randomUUID(),
    name: "Section",
    type: "section",
    className: [
      {
        id: crypto.randomUUID(),
        text: "bg-white text-black py-16 px-4 md:px-8",
      },
    ],
    hasBeenEdited: true,
    children: [
      {
        id: crypto.randomUUID(),
        name: "Container",
        type: "container",
        hasBeenEdited: true,
        className: [
          {
            id: crypto.randomUUID(),
            text: "max-w-4xl mx-auto text-center space-y-4",
          },
        ],
        children: [
          {
            id: crypto.randomUUID(),
            name: "Text",
            type: "text",
            text: "About March",
            hasBeenEdited: true,
            className: [
              { id: crypto.randomUUID(), text: "text-3xl font-bold" },
            ],
          },
          {
            id: crypto.randomUUID(),
            name: "Text",
            type: "text",
            text: "Martech is a Nigerian building solutions company providing premium insulation products for residential, commercial, and industrial projects. As Nigeria’s exclusive partner for Izocam, we deliver quality and trust.",
            hasBeenEdited: true,
            className: [{ id: crypto.randomUUID(), text: "text-lg" }],
          },
          {
            id: crypto.randomUUID(),
            name: "Text",
            type: "text",
            text: "Address: 123 Lagos Street, Ikeja, Lagos • CAC No: RC1234567",
            hasBeenEdited: true,
            className: [
              {
                id: crypto.randomUUID(),
                text: "text-sm text-gray-600",
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: crypto.randomUUID(),
    name: "Section",
    type: "section",
    className: [
      {
        id: crypto.randomUUID(),
        text: "bg-white text-black py-16 px-4 md:px-8",
      },
    ],
    hasBeenEdited: true,
    children: [
      {
        id: crypto.randomUUID(),
        name: "Container",
        type: "container",
        hasBeenEdited: true,
        className: [
          {
            id: crypto.randomUUID(),
            text: "max-w-5xl mx-auto grid md:grid-cols-2 gap-8",
          },
        ],
        children: [
          {
            id: crypto.randomUUID(),
            name: "Image",
            type: "image",
            src: "/placeholder.svg",
            hasBeenEdited: true,
            className: [
              {
                id: crypto.randomUUID(),
                text: "w-full h-80 object-cover rounded-lg",
              },
            ],
          },
          {
            id: crypto.randomUUID(),
            name: "Container",
            type: "container",
            hasBeenEdited: true,
            className: [
              { id: crypto.randomUUID(), text: "flex flex-col gap-4" },
            ],
            children: [
              {
                id: crypto.randomUUID(),
                name: "Text",
                type: "text",
                text: "Why Izocam?",
                hasBeenEdited: true,
                className: [
                  {
                    id: crypto.randomUUID(),
                    text: "text-3xl font-bold",
                  },
                ],
              },
              {
                id: crypto.randomUUID(),
                name: "Text",
                type: "text",
                text: "✔ Energy savings",
                hasBeenEdited: true,
              },
              {
                id: crypto.randomUUID(),
                name: "Text",
                type: "text",
                text: "✔ Noise reduction",
                hasBeenEdited: true,
              },
              {
                id: crypto.randomUUID(),
                name: "Text",
                type: "text",
                text: "✔ Safety & durability",
                hasBeenEdited: true,
              },
              {
                id: crypto.randomUUID(),
                name: "Text",
                type: "text",
                text: "Applications: Homes, offices, factories, cold rooms, oil & gas.",
                hasBeenEdited: true,
              },
              {
                id: crypto.randomUUID(),
                name: "Text",
                type: "text",
                text: "Choose Izocam through March for guaranteed originality, official distributor pricing, and trusted nationwide delivery.",
                hasBeenEdited: true,
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: crypto.randomUUID(),
    name: "Section",
    type: "section",
    className: [
      {
        id: crypto.randomUUID(),
        text: "bg-white text-black py-16 px-4 md:px-8",
      },
    ],
    hasBeenEdited: true,
    children: [
      {
        id: crypto.randomUUID(),
        name: "Container",
        type: "container",
        hasBeenEdited: true,
        className: [
          {
            id: crypto.randomUUID(),
            text: "max-w-3xl mx-auto space-y-4",
          },
        ],
        children: [
          {
            id: crypto.randomUUID(),
            name: "Text",
            type: "text",
            text: "How to Order",
            hasBeenEdited: true,
          },
          {
            id: crypto.randomUUID(),
            name: "Text",
            type: "text",
            text: "1. Browse products",
            hasBeenEdited: true,
          },
          {
            id: crypto.randomUUID(),
            name: "Text",
            type: "text",
            text: "2. Add to cart",
            hasBeenEdited: true,
          },
          {
            id: crypto.randomUUID(),
            name: "Text",
            type: "text",
            text: "3. Checkout securely via Paystack/Flutterwave",
            hasBeenEdited: true,
          },
          {
            id: crypto.randomUUID(),
            name: "Text",
            type: "text",
            text: "4. Choose delivery or pickup",
            hasBeenEdited: true,
          },
          {
            id: crypto.randomUUID(),
            name: "Text",
            type: "text",
            text: "5. Confirm via WhatsApp if needed",
            hasBeenEdited: true,
          },
        ],
      },
    ],
  },

  {
    id: crypto.randomUUID(),
    name: "Section",
    type: "section",
    hasBeenEdited: true,
    className: [
      {
        id: crypto.randomUUID(),
        text: "bg-white text-black py-16 px-4 md:px-8",
      },
    ],
    children: [
      {
        id: crypto.randomUUID(),
        name: "Container",
        type: "container",
        hasBeenEdited: true,
        className: [
          {
            id: crypto.randomUUID(),
            text: "max-w-4xl mx-auto text-center space-y-4",
          },
        ],
        children: [
          {
            id: crypto.randomUUID(),
            name: "Text",
            type: "text",
            text: "Contact Us",

            hasBeenEdited: true,
          },
          {
            id: crypto.randomUUID(),
            name: "Text",
            type: "text",
            text: "Phone: +234 801 234 5678",

            hasBeenEdited: true,
          },
          {
            id: crypto.randomUUID(),
            name: "Text",
            type: "text",
            text: "Email: sales@martech.com.ng",

            hasBeenEdited: true,
          },
          {
            id: crypto.randomUUID(),
            name: "Text",
            type: "text",
            text: "Office: 123 Lagos Street, Ikeja, Lagos",

            hasBeenEdited: true,
          },
          {
            id: crypto.randomUUID(),
            name: "Link",
            type: "link",
            href: "https://wa.me/2348012345678",
            text: "Chat with our Sales Team",
            hasBeenEdited: true,
            className: [
              {
                id: crypto.randomUUID(),
                text: "inline-block px-6 py-3 bg-black text-white rounded-lg mt-4",
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: crypto.randomUUID(),
    name: "Section",
    type: "section",
    className: [
      {
        id: crypto.randomUUID(),
        text: "bg-white text-black py-16 px-4 md:px-8",
      },
    ],
    hasBeenEdited: true,
    children: [
      {
        id: crypto.randomUUID(),
        name: "Container",
        type: "container",
        hasBeenEdited: true,
        className: [
          {
            id: crypto.randomUUID(),
            text: "max-w-5xl mx-auto text-center space-y-6",
          },
        ],
        children: [
          {
            id: crypto.randomUUID(),
            name: "Text",
            type: "text",
            text: "Trusted by Professionals",

            hasBeenEdited: true,
          },
          {
            id: crypto.randomUUID(),
            name: "Text",
            type: "text",
            text: "“We’ve used Izocam insulation for our factory projects — reliable and efficient.” – ABC Construction Ltd.",

            hasBeenEdited: true,
          },
          {
            id: crypto.randomUUID(),
            name: "Text",
            type: "text",
            text: "“Great service and timely delivery from March.” – XYZ Builders",

            hasBeenEdited: true,
          },
          {
            id: crypto.randomUUID(),
            name: "Container",
            type: "container",
            hasBeenEdited: true,
            className: [
              {
                id: crypto.randomUUID(),
                text: "flex justify-center gap-6 mt-6",
              },
            ],
            children: [
              {
                id: crypto.randomUUID(),
                name: "Image",
                type: "image",
                src: "/placeholder.svg",
                className: [{ id: crypto.randomUUID(), text: "h-12" }],
                hasBeenEdited: true,
              },
              {
                id: crypto.randomUUID(),
                name: "Image",
                type: "image",
                src: "/placeholder.svg",
                className: [{ id: crypto.randomUUID(), text: "h-12" }],
                hasBeenEdited: true,
              },
              {
                id: crypto.randomUUID(),
                name: "Image",
                type: "image",
                src: "/placeholder.svg",
                className: [{ id: crypto.randomUUID(), text: "h-12" }],
                hasBeenEdited: true,
              },
            ],
          },
        ],
      },
    ],
  },
];
