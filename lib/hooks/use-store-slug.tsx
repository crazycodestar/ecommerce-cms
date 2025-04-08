import React from "react";

export function useStoreSlug() {
  const [domain, setDomain] = React.useState<string>("");
  React.useEffect(() => {
    setDomain(window.location.hostname.split(".")[0]);
  }, []);
  const subdomain = !domain || domain === "www" ? "localhost" : domain;

  return { storeSlug: subdomain };
}
