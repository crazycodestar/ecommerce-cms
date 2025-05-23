import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function OrderSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-6 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Tracker Skeleton */}
          {/* <div className="py-4">
            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
              <div className="relative flex justify-between">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="mt-2 h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div> */}

          {/* Customer Information Skeleton */}
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>

          {/* Shipping Information Skeleton */}
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>

          {/* Order Items Skeleton */}
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div key={item} className="border rounded-md p-3">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-4 w-56" />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Summary Skeleton */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
