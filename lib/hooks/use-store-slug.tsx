import React from "react";

export function useStoreSlug() {
  const [domain, setDomain] = React.useState<string | undefined>();
  React.useEffect(() => {
    setDomain(window.location.hostname.split(".")[0]);
  }, []);
  const subdomain = !domain || domain === "www" ? undefined : domain;

  return { storeSlug: subdomain };
}
