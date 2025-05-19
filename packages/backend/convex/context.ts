import { createClerkClient } from "@clerk/backend";

export const clerkClient = () => {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey)
    throw new Error(
      "Error: Please add CLERK_SECRET_KEY from Clerk Dashboard to .env or .env.local"
    );

  return createClerkClient({
    secretKey,
  });
};
