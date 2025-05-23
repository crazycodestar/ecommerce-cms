import { CheckCircle2, Clock, Package, Truck } from "lucide-react";

interface OrderTrackerProps {
  status: "success" | "pending";
}

export function OrderTracker({ status }: OrderTrackerProps) {
  // Define the steps in the order process
  const steps = [
    { id: 1, name: "Order Placed", icon: Clock, completed: true },
    { id: 2, name: "Processing", icon: Package, completed: true },
    { id: 3, name: "Shipped", icon: Truck, completed: status === "success" },
    {
      id: 4,
      name: "Delivered",
      icon: CheckCircle2,
      completed: status === "success",
    },
  ];

  // Determine the current step based on status
  const currentStep = status === "success" ? 4 : 2;

  return (
    <div className="py-4">
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
          <div
            className="absolute h-0.5 bg-primary transition-all duration-500"
            style={{
              width: `${((currentStep - 1) * 100) / (steps.length - 1)}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  step.completed
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted bg-background"
                }`}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <div className="mt-2 text-xs text-center">{step.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
