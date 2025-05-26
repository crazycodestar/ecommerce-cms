"use node"

import { v } from "convex/values";
import { action } from "./_generated/server";

const NETLIFY_API_KEY = process.env.NETLIFY_API_KEY;
const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;

export const addSubDomain = action({
    args:{
        slug: v.string(),
    },
    handler: async (ctx, args) => {

    const site = await fetch(`https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}`, {
        headers: {
            "Authorization": `Bearer ${NETLIFY_API_KEY}`,
            "Content-Type": "application/json",
        },
    });

    const siteData = await site.json();

    const response = await fetch(`https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${NETLIFY_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            domain_aliases: [
                ...siteData.domain_aliases,
                `${args.slug}.convertlykit.store`,
            ],
        }),
    });
    return response.json();

    },
});
