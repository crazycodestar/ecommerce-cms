"use node"
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { Octokit } from "@octokit/rest";
import { NetlifyAPI } from "@netlify/api";

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const NETLIFY_ACCESS_TOKEN = process.env.NETLIFY_ACCESS_TOKEN;


async function downloadImageToBase64(imageUrl: string) {
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}



export async function generateSiteFromContent(
  storeName: string,
  storeSlug: string,
  logoUrl: string,
) {
  // octokit
  const octokit = new Octokit({
    auth: GITHUB_ACCESS_TOKEN,
  });


  const updateGithubFileContents = async (
    filePath: string,
    updatedContent: string,
  ) => {
    const file = (await octokit.rest.repos.getContent({
      owner: "convertly-dev",
      repo: `${storeSlug}-deployment`,
      path: filePath,
    })) as any;

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: "convertly-dev",
      repo: `${storeSlug}-deployment`,
      message: "update file",
      commiter: {
        name: "convertly-dev",
        email: "convertlybusiness@gmail.com",
      },
      content: updatedContent,
      path: filePath,
      sha: file.data.sha,
    });
  }

  const netlify = new NetlifyAPI(NETLIFY_ACCESS_TOKEN);
  //try creating repo
  try {
    await octokit.rest.repos.createUsingTemplate({
      template_repo: "ecommerce-cms",
      template_owner: "convertly-dev",
      name: `${storeSlug}-deployment`,
    });
  } catch (error) {
    //attempt to delete repo if it already exists
    // await octokit.rest.repos.delete({
    //   repo: `${storeSlug}-deployment`,
    //   owner: "convertly-dev",
    // });

    // //try creating repo again
    // await octokit.rest.repos.createUsingTemplate({
    //   template_repo: "ecommerce-cms",
    //   template_owner: "convertly-dev",
    //   name: `${storeSlug}-deployment`,
    // });
  }


  //update logo
  await updateGithubFileContents(
    "apps/template/public/logo.png",
    await downloadImageToBase64(logoUrl),
  );

  //update store name
  const storeHtmlData = (await octokit.rest.repos.getContent({
    owner: "convertly-dev",
    repo: `${storeSlug}-deployment`,
    path: "apps/template/index.html",
  })) as any;
  const htmlContent = Buffer.from(storeHtmlData.data.content, "base64").toString(
    "utf-8",
  );


  const updatedContent = htmlContent.replace("ACME", storeName);
  await updateGithubFileContents(
    "apps/template/index.html",
    Buffer.from(updatedContent, "utf-8").toString("base64"),
  );

  //create netlify deploy key
  const deployKey = await netlify.createDeployKey();

  //addd deploy key to github
  await octokit.rest.repos.createDeployKey({
    repo: `${storeSlug}-deployment`,
    owner: "convertly-dev",
    key: deployKey.public_key!,
  });


  const sitePayload = {
    body: {
      name: storeSlug,
      custom_domain: `${storeSlug}.convertlykit.store`,
      repo: {
        provider: "github",
        repo_path: `convertly-dev/${storeSlug}-deployment`,
        public_repo: false,
        repo_branch: "main",
        installation_id: 67440043,
        deploy_key_id: deployKey.id,
        cmd: "turbo run build --filter template",
        dir: "apps/template/dist",
      },
      build_settings: {
        cmd: "turbo run build --filter template",
        dir: "apps/template/dist",
      },
    },
  };

  console.log("Creating Netlify site with payload:", JSON.stringify(sitePayload, null, 2));

  let site;
  try {
    site = await netlify.createSite(sitePayload);
    console.log("Netlify site created successfully:", JSON.stringify(site, null, 2));
  } catch (error: any) {
    console.error("Netlify site creation failed with error:", JSON.stringify(error, null, 2));
    if (error.response) {
      console.error("Error response data:", JSON.stringify(error.response.data, null, 2));
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", JSON.stringify(error.response.headers, null, 2));
    }
    throw error;
  }

  await netlify.createEnvVars({
    site_id: site.id,
    account_id: site.account_id!,
    body: [
      {
        key: "VITE_CONVEX_URL",
        values: [
          {
            value: process.env.CONVEX_CLOUD_URL!,
          },
        ],
      },
      {
        key: "VITE_STORE_SLUG",
        values: [
          {
            value: storeSlug,
          },
        ],
      },
    ],
  });

  while (true) {
    const deployStatus = await netlify.listSiteDeploys({
      site_id: site.id!,
    });

    if (deployStatus[0].state == "ready") {
      break;
    } else if (["rejected", "error"].includes(deployStatus[0].state!)) {
      throw new Error("Deploy failed");
    }
    setTimeout(() => { }, 1000);
  }

  return `${storeSlug}.convertlykit.store`;
}

export const generateSite = internalAction({
  args: {
    storeId: v.id("stores"),
    redeploy: v.optional(v.boolean()),
  },
  handler: async (ctx, { storeId, redeploy }) => {
    const store = await ctx.runQuery(internal.stores.getStoreById, {
      storeId,
    });

    if (!store) {
      throw new Error("Store not found");
    }

    if (!store.logoId) {
      throw new Error("Store logo not found");
    }

    const imageUrl = await ctx.storage.getUrl(store.logoId);

    if (redeploy) {
      // TODO: redeploy site to update logo for instance
      return;
    }

    const siteUrl = await generateSiteFromContent(store.name, store.slug, imageUrl!);
    // store unique identifier of store
    // const content = JSON.parse(contentJson);
    // TODO: Generate site from content
    // const site = await generateSiteFromContent(content);

    // simulate site generation
    await ctx.runMutation(internal.stores.updateStoreByStoreId, {
      storeId,
      siteUrl: siteUrl,
    });
  },
});
