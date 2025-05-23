"use node";
import { v } from "convex/values";
import { pick } from "es-toolkit";
import { z } from "zod";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import {
    InternalServerError,
    NotFoundError
} from "./error";

const TERMINAL_URL =
  process.env.NODE_ENV == "production"
    ? "https://api.terminal.africa/v1"
    : "https://sandbox.terminal.africa/v1";

const getTerminalSecret = () => {
  const TERMINAL_SECRET =
    process.env.NODE_ENV == "production"
      ? process.env.TERMINAL_SECRET_PROD
      : process.env.TERMINAL_SECRET_DEV;

  if (!TERMINAL_SECRET)
    throw new InternalServerError("Please set a terminal secret ENV");
  return TERMINAL_SECRET;
};

export async function terminalFetch<T>(
  url: string,
  options: RequestInit = {},
  terminalSecret: string
) {
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${terminalSecret}`,
  };

  const response = await fetch(url, options);
  if (!response) {
    throw new InternalServerError("could not send terminal request");
  }

  if (!response.ok) {
    throw new InternalServerError(
      `could not send terminal request error: ${await response.text()}`
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
  rate_id: z.string(),
  parcel: z.string(),
  // ^? I added
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
    recommended: z.string(),
    // ^? I added
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
    })
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
    })
  ),
  extras: z.object({
    reference: z.string(),
    tracking_number: z.string(),
    tracking_url: z.string(),
  }),
  id: z.string(),
});

export const getCarriers = action({
  args: {
    terminalSecretKey: v.string(),
  },
  handler: async (_, { terminalSecretKey }) => {
    const response = await terminalFetch<{
      carriers: z.infer<typeof carrierSchema>[];
    }>(`${TERMINAL_URL}/carriers/?active=true`, {}, terminalSecretKey);

    return response.carriers.filter((carrier) =>
      carrier.available_countries.includes("NG")
    );
  },
});

const handleCreatePackageFromPackages = ({
  packages,
  terminalSecretKey,
}: {
  packages: {
    width: number;
    height: number;
    length: number;
    weight: number;
  }[];
  terminalSecretKey: string;
}) => {
  let package_ = {
    name: Math.random().toString(36).substring(7), // generates random string
    width: 0,
    height: 0,
    length: 0,
    weight: 0,
    type: "box" as const,
  };
  packages.forEach((p) => {
    package_.width += p.width;
    package_.height += p.height;
    package_.length += p.length;
    package_.weight += p.weight;
  });

  const formattedPackage = pick(package_, [
    "name",
    "width",
    "height",
    "length",
    "weight",
    "type",
  ]);

  return handleCreatePackaging(formattedPackage, terminalSecretKey);
};

export const getDropOffLocations = action({
  args: {
    state: v.string(),
    city: v.string(),
    terminalSecretKey: v.string(),
  },
  handler: async (_, { terminalSecretKey, ...args }) => {
    const response = await terminalFetch<z.infer<typeof addressSchema>[]>(
      `${TERMINAL_URL}/carriers/locations/drop-off/?country=NG&state=${args.state}&city=${args.city}&carrier=1`,
      {},
      terminalSecretKey
    );

    return response;
  },
});

async function handleCreateParcel(
  args: {
    packagingId: string;
    items: {
      name: string;
      description: string;
      quantity: number;
      value: number;
      weight: number;
    }[];
  },
  terminalSecretKey: string
) {
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
          ""
        ),
        weight_unit: "kg",
      }),
    },
    terminalSecretKey
  );
}

export async function handleCreatePackaging(
  args: {
    name: string;
    width: number;
    height: number;
    length: number;
    weight: number;
    type: "box" | "envelope" | "soft-packaging";
  },
  terminalSecretKey: string
) {
  return terminalFetch<z.infer<typeof packagingSchema>>(
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
    terminalSecretKey
  );
}

async function handleCreateAddress(
  args: {
    city: string;
    country: string;
    state: string;
    email: string;
    line1: string;
    line2?: string;
    firstName: string;
    lastName: string;
    phone: string;
    zip: string;
  },
  terminalSecretKey: string
) {
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
    terminalSecretKey
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
      })
    ),
    terminalSecretKey: v.string(),
  },
  handler: async (_, { terminalSecretKey, ...args }) =>
    handleCreateParcel(args, terminalSecretKey),
});

export const createPackaging = action({
  args: {
    packageId: v.id("packages"),
    terminalSecretKey: v.string(),
  },
  handler: async (ctx, { packageId, terminalSecretKey }) => {
    const package_ = await ctx.runQuery(
      internal.packages.internalGetPackageById,
      { packageId }
    );
    if (!package_) throw new NotFoundError("Package not found");
    const formattedPackage = pick(package_, [
      "name",
      "width",
      "height",
      "length",
      "weight",
      "type",
    ]);
    const res = await handleCreatePackaging(
      formattedPackage,
      terminalSecretKey
    );
    await ctx.runMutation(
      internal.packages.updatePackageWithTerminalPackageId,
      { packageId, terminalPackageId: res.packaging_id }
    );
  },
});

export const createAddress = action({
  args: {
    city: v.string(),
    country: v.string(),
    state: v.string(),
    email: v.string(),
    line1: v.string(),
    line2: v.optional(v.string()),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    zip: v.string(),
    terminalSecretKey: v.string(),
  },
  handler: async (_, { terminalSecretKey, ...args }) =>
    handleCreateAddress(args, terminalSecretKey),
});

export const getStates = action(async () => {
  // we have to use our own secret_key here because of convex's architect and I can't figure out a way around it
  const terminalSecret = getTerminalSecret();
  const response = await terminalFetch<z.infer<typeof stateSchema>[]>(
    `${TERMINAL_URL}/states/?country_code=NG`,
    {},
    terminalSecret
  );

  return response;
});

export const getCities = action({
  args: {
    stateCode: v.string(),
  },
  handler: async (_, args) => {
    const terminalSecretKey = getTerminalSecret();
    const response = await terminalFetch<z.infer<typeof citySchema>[]>(
      `${TERMINAL_URL}/cities/?country_code=NG&state_code=${args.stateCode}`,
      {},
      terminalSecretKey
    );
    return response;
  },
});

export const enableCarriers = action({
  args: {
    ids: v.array(v.string()),
    terminalSecretKey: v.string(),
  },

  handler: async (_, { terminalSecretKey, ...args }) => {
    await terminalFetch(
      `${TERMINAL_URL}/carriers/multiple/enable`,
      {
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
      },
      terminalSecretKey
    );

    return "success";
  },
});