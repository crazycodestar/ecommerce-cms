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

export const addressSchema = z.object({
  address: z.string(),
  carrier: z.string(),
  city: z.string(),
  country: z.string(),
  email: z.string(),
  phone: z.string(),
  state: z.string(),
  drop_off_location_id: z.string(),
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
    );
    return response;
  },
});

export const createShipment = action({
  args: {
    pickup: v.object({
      city: v.string(),
      countryCode: v.string(),
      email: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      address: v.string(),
      phone: v.string(),
      state: v.string(),
      zip: v.string(),
    }),
    delivery: v.object({
      city: v.string(),
      countryCode: v.string(),
      email: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      address: v.string(),
      phone: v.string(),
      state: v.string(),
      zip: v.string(),
    }),
    parcel: v.object({
      items: v.array(
        v.object({
          name: v.string(),
          value: v.number(),
          quantity: v.number(),
          weight: v.string(),
        }),
      ),
    }),
  },

  handler: async (_, args) => {
    await terminalFetch(`${TERMINAL_URL}/shipments/quick`, {
      method: "POST",
      body: JSON.stringify({
        pickup_address: {
          city: args.pickup.city,
          country: "NG",
          first_name: args.pickup.firstName,
          last_name: args.pickup.lastName,
          line1: args.pickup.address,
          phone: args.pickup.phone,
          state: args.pickup.state,
        },

        delivery_address: {
          city: args.delivery.city,
          country: "NG",
          first_name: args.delivery.firstName,
          last_name: args.delivery.lastName,
          line1: args.delivery.address,
          phone: args.delivery.phone,
          state: args.delivery.state,
        },
      }),
    });
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
