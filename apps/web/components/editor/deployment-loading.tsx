import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { AlertCircle, CheckCircle2, CircleAlert, Loader } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";

const deploymentStages = [
  "Setting up project",
  "Spinning up server",
  "Deploying project",
  "This may take a few minutes",
];

interface DeploymentLoadingProps {
  isSuccess?: boolean;
}

export const DeploymentLoading = ({ isSuccess }: DeploymentLoadingProps) => {
  const [currentStage, setCurrentStage] = React.useState(0);
  const [hasTimedOut, setHasTimedOut] = React.useState(false);
  const searchParams = useSearchParams();
  const isFromOnboarding = searchParams.get("from") === "onboarding";
  const { slug } = useParams<{ slug: string }>();
  const store = useQuery(api.stores.getMyStore);

  React.useEffect(() => {
    if (isSuccess) return; // Don't start timeout if already successful

    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % deploymentStages.length);
    }, 3000);

    const timeout = setTimeout(() => {
      setHasTimedOut(true);
    }, 30000);

    return () => {
      clearInterval(stageInterval);
      clearTimeout(timeout);
    };
  }, [isSuccess]);

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-lg z-50 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="size-5" />
          <h2 className="font-semibold">Deployment Successful!</h2>
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Your site has been successfully deployed and is ready to go live.
        </p>
        {isFromOnboarding ? (
          <div className="flex gap-3">
            {store?.siteUrl ? (
              <Button asChild variant="outline">
                <Link href={store?.siteUrl ?? ""}>View Site</Link>
              </Button>
            ) : (
              <Alert>
                <CircleAlert className="h-4 w-4" />
                <AlertTitle>Site URL not found</AlertTitle>
              </Alert>
            )}
            <Button asChild variant="default">
              <Link href={`/dashboard/${slug}/products/add-product`}>
                Create Your First Product
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href={`/dashboard/${slug}`}>Return to Dashboard</Link>
            </Button>
            {store?.siteUrl ? (
              <Button asChild>
                <Link href={store?.siteUrl ?? ""}>View Site</Link>
              </Button>
            ) : (
              <Alert>
                <CircleAlert className="h-4 w-4" />
                <AlertTitle>Site URL not found</AlertTitle>
              </Alert>
            )}
          </div>
        )}
      </div>
    );
  }

  if (hasTimedOut) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-lg z-50 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="size-5" />
          <h2 className="font-semibold">Deployment Failed</h2>
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          We couldn&apos;t complete the deployment process. This might be due to
          a temporary issue or network problem.
        </p>
        <Button asChild variant="default">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-lg z-50 flex flex-col items-center justify-center gap-2">
      <h2 className="font-semibold">Deploying your project</h2>
      <div className="flex items-center gap-2">
        <Loader className="size-4 animate-spin" />
        <p className="text-sm text-muted-foreground">
          {deploymentStages[currentStage]}
        </p>
      </div>
    </div>
  );
};
