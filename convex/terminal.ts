"use node";
import { action } from "./_generated/server";
import { z } from "zod";
import { v } from "convex/values";
import { InternalServerError } from "./error";

const TERMINAL_URL =
  process.env.NODE_ENV == "production"
    ? "https://api.terminal.africa/v1"
    : "https://sandbox.terminal.africa/v1";

const TERMINAL_SECRET =
  process.env.NODE_ENV == "production"
    ? process.env.TERMINAL_SECRET_PROD
    : process.env.TERMINAL_SECRET_DEV;

export async function terminalFetch<T>(url: string, options: RequestInit = {}) {
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${TERMINAL_SECRET}`,
  };

  const response = await fetch(url, options);
  if (!response) {
    throw new InternalServerError("could not send terminal request");
  }

  if (!response.ok) {
    throw new InternalServerError(
      `could not send terminal request error: ${await response.text()}`,
    );
  }
  const responseData: { data: T } = await response.json();
  return responseData.data;
}

export const carrierSchema = z.object({
  name: z.string(),
  available_countries: z.array(z.string()),
  carrier_id: z.string(),
  contact: z.string(),
  logo: z.string(),
  regional: z.string(),
  slug: z.string(),
  domestic: z.string(),
});

export const packagingSchema = z.object({
  id: z.string(),
  packaging_id: z.string(),
  name: z.string(),
  height: z.number(),
  weight_unit: z.string(),
  size_unit: z.string(),
  type: z.string(),
  weight: z.number(),
  width: z.number(),
});

export const citySchema = z.object({
  name: z.string(),
  stateCode: z.string(),
  countryCode: z.string(),
});

export const stateSchema = z.object({
  name: z.string(),
  isoCode: z.string(),
  countryCode: z.string(),
});

export const rateSchema = z.object({
  amount: z.number(),
  cargo_type: z.string(),
  carrier_logo: z.string().url(),
  carrier_name: z.string(),
  carrier_rate_description: z.string(),
  carrier_reference: z.string(),
  carrier_slug: z.string(),
  created_at: z.string().datetime(),
  currency: z.string(),
  default_amount: z.number(),
  default_currency: z.string(),
  delivery_address: z.string(),
  delivery_date: z.string().datetime(),
  delivery_eta: z.number(),
  delivery_time: z.string(),
  domain: z.string(),
  dropoff_available: z.boolean(),
  dropoff_only: z.boolean(),
  dropoff_required: z.boolean(),
  id: z.string(),
  includes_duties: z.boolean(),
  includes_insurance: z.boolean(),
  insurance_coverage: z.number(),
  insurance_fee: z.number(),
  metadata: z.object({
    address_payload: z.object({
      delivery_address: z.object({
        city: z.string(),
        country: z.string(),
        state: z.string(),
        zip: z.string(),
      }),
      pickup_address: z.object({
        city: z.string(),
        country: z.string(),
        state: z.string(),
        zip: z.string(),
      }),
    }),
    avgRating: z.number(),
    cod_processing_fee: z.number(),
    insurance_fee: z.number(),
    rate_payload: z.object({
      delivery_lat: z.number(),
      delivery_lng: z.number(),
      distance: z.number(),
      pickup_lat: z.number(),
      pickup_lng: z.number(),
      rate_amount: z.number(),
    }),
    score: z.number(),
    shipment_cost: z.number(),
  }),
  pickup_address: z.string(),
  pickup_eta: z.number(),
  pickup_time: z.string(),
  source: z.string(),
  type: z.string(),
});

export const parcelSchema = z.object({
  description: z.string(),
  items: z.array(
    z.object({
      description: z.string(),
      name: z.string(),
      currency: z.string(),
      value: z.number(),
      weight: z.number(),
      quantity: z.number(),
    }),
  ),
  parcel_id: z.string(),
  total_weight: z.number(),
  packaging: z.string(),
});

export const addressSchema = z.object({
  address_id: z.string(),
  city: z.string(),
  country: z.string(),
  email: z.string(),
  line1: z.string(),
  line2: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string(),
  state: z.string(),
  id: z.string(),
});

export const shipmentSchema = z.object({
  address_from: addressSchema,
  address_to: addressSchema,
  parcel: parcelSchema,
  shipment_id: z.string(),
});

export const arrangedShipmentSchema = z.object({
  address_from: z.string(),
  address_return: z.string(),
  address_to: z.string(),
  carrier: z.string(),
  delivery_arranged: z.string(),
  delivery_cancelled: z.union([z.null(), z.string()]),
  delivery_date: z.string(),
  delivery_delivered: z.union([z.null(), z.string()]),
  delivery_dropped_off: z.union([z.null(), z.string()]),
  delivery_picked_up: z.union([z.null(), z.string()]),
  events: z.array(
    z.object({
      created_at: z.string(),
      description: z.string(),
      location: z.string(),
      status: z.string(),
    }),
  ),
  extras: z.object({
    reference: z.string(),
    tracking_number: z.string(),
    tracking_url: z.string(),
  }),
  id: z.string(),
});

export const getCarriers = action({
  args: {},
  handler: async () => {
    const response = await terminalFetch<{
      carriers: z.infer<typeof carrierSchema>[];
    }>(`${TERMINAL_URL}/carriers/?active=true`);

    return response.carriers.filter((carrier) =>
      carrier.available_countries.includes("NG"),
    );
  },
});

export const getRatesForShipment = action({
  args: {
    parcel: v.object({
      packagingId: v.string(),
      items: v.array(
        v.object({
          name: v.string(),
          description: v.string(),
          quantity: v.number(),
          value: v.number(),
          weight: v.number(),
        }),
      ),
    }),
    pickupAddress: v.string(),
    deliveryAddress: v.object({
      city: v.string(),
      country: v.string(),
      state: v.string(),
      email: v.string(),
      line1: v.string(),
      line2: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      phone: v.string(),
      zip: v.string(),
    }),
  },

  handler: async (_, args) => {
    const receiver = await handleCreateAddress(args.deliveryAddress);
    const parcel = await handleCreateParcel(args.parcel);
    const response = await terminalFetch<z.infer<typeof rateSchema>[]>(
      `${TERMINAL_URL}/rates/shipment?pickup_address=${args.pickupAddress}&delivery_address=${receiver.address_id}&parcel_id=${parcel.parcel_id}`,
    );
    return response;
  },
});

export const getDropOffLocations = action({
  args: {
    state: v.string(),
    city: v.string(),
  },
  handler: async (_, args) => {
    const response = await terminalFetch<z.infer<typeof addressSchema>[]>(
      `${TERMINAL_URL}/carriers/locations/drop-off/?country=NG&state=${args.state}&city=${args.city}&carrier=1`,
    );

    return response;
  },
});

async function handleCreateParcel(args: {
  packagingId: string;
  items: {
    name: string;
    description: string;
    quantity: number;
    value: number;
    weight: number;
  }[];
}) {
  return await terminalFetch<z.infer<typeof parcelSchema>>(
    `${TERMINAL_URL}/parcels/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: args.items.map((item) => ({
          ...item,
          currency: "NGN",
        })),
        packaging: args.packagingId,
        description: args.items.reduce<string>(
          (acc, item) => acc + item.name + "\n",
          "",
        ),
        weight_unit: "kg",
      }),
    },
  );
}

async function handleCreatePackaging(args: {
  name: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  type: "box" | "envelope" | "soft-packaging";
}) {
  return await terminalFetch<z.infer<typeof packagingSchema>>(
    `${TERMINAL_URL}/packaging/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...args,
        weight_unit: "kg",
        size_unit: "cm",
      }),
    },
  );
}

async function handleCreateAddress(args: {
  city: string;
  country: string;
  state: string;
  email: string;
  line1: string;
  line2: string;
  firstName: string;
  lastName: string;
  phone: string;
  zip: string;
}) {
  return await terminalFetch<z.infer<typeof addressSchema>>(
    `${TERMINAL_URL}/addresses/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city: args.city,
        country: args.country,
        state: args.state,
        email: args.email,
        line1: args.line1,
        line2: args.line2,
        first_name: args.firstName,
        last_name: args.lastName,
        phone: args.phone,
        zip: args.zip,
      }),
    },
  );
}

export const createParcel = action({
  args: {
    packagingId: v.string(),
    items: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        quantity: v.number(),
        value: v.number(),
        weight: v.number(),
      }),
    ),
  },
  handler: async (_, args) => handleCreateParcel(args),
});

export const createPackaging = action({
  args: {
    name: v.string(),
    width: v.number(),
    height: v.number(),
    length: v.number(),
    weight: v.number(),
    type: v.union(
      v.literal("box"),
      v.literal("envelope"),
      v.literal("soft-packaging"),
    ),
  },
  handler: async (_, args) => handleCreatePackaging(args),
});

export const createAddress = action({
  args: {
    city: v.string(),
    country: v.string(),
    state: v.string(),
    email: v.string(),
    line1: v.string(),
    line2: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    zip: v.string(),
  },
  handler: async (_, args) => handleCreateAddress(args),
});

export const getStates = action({
  handler: async () => {
    const response = await terminalFetch<z.infer<typeof stateSchema>[]>(
      `${TERMINAL_URL}/states/?country_code=NG`,
    );
    return response;
  },
});

export const getCities = action({
  args: {
    stateCode: v.string(),
  },
  handler: async (_, args) => {
    const response = await terminalFetch<z.infer<typeof citySchema>[]>(
      `${TERMINAL_URL}/cities/?country_code=NG&state_code=${args.stateCode}`,
      {},
    );
    return response;
  },
});

export const createShipment = action({
  args: {
    rateId: v.string(),
    pickupAddress: v.string(),
    deliveryAddress: v.object({
      city: v.string(),
      country: v.string(),
      state: v.string(),
      email: v.string(),
      line1: v.string(),
      line2: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      phone: v.string(),
      zip: v.string(),
    }),
    parcel: v.object({
      packagingId: v.string(),
      items: v.array(
        v.object({
          name: v.string(),
          description: v.string(),
          quantity: v.number(),
          value: v.number(),
          weight: v.number(),
        }),
      ),
    }),
  },

  handler: async (_, args) => {
    const receiver = await handleCreateAddress(args.deliveryAddress);
    const parcel = await handleCreateParcel(args.parcel);

    const shipmentResponse = await terminalFetch<
      z.infer<typeof shipmentSchema>
    >(`${TERMINAL_URL}/shipments/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address_from: args.pickupAddress,
        address_to: receiver.address_id,
        parcel: parcel.parcel_id,
      }),
    });

    return await terminalFetch<z.infer<typeof arrangedShipmentSchema>>(
      `${TERMINAL_URL}/shipments/pickup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rate_id: args.rateId,
          shipment_id: shipmentResponse.shipment_id,
          parcel: parcel.parcel_id,
        }),
      },
    );
  },
});

export const enableCarriers = action({
  args: {
    ids: v.array(v.string()),
  },

  handler: async (_, args) => {
    await terminalFetch(`${TERMINAL_URL}/carriers/multiple/enable`, {
      method: "POST",
      body: JSON.stringify({
        carriers: args.ids.map((id) => {
          return {
            carrier_id: id,
            domestic: true,
            regional: true,
            international: false,
          };
        }),
      }),
    });

    return "success";
  },
});
