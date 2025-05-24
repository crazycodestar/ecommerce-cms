import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-gray-50/80 text-card-foreground flex flex-col gap-2 rounded-xl border-0 pt-6 overflow-hidden",
        className,
      )}
      {...props}
    />
  )
}
Card.displayName = "Card"

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 bg-gray-50/80 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  )
}
CardHeader.displayName = "CardHeader"

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-title" className={cn("leading-none font-semibold text-gray-900", className)} {...props} />
}
CardTitle.displayName = "CardTitle"

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-description" className={cn("text-gray-600 text-sm leading-relaxed", className)} {...props} />
  )
}
CardDescription.displayName = "CardDescription"

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("bg-white border border-gray-200/60 rounded-lg mx-2 mb-2 p-4 shadow-sm", className)}
      {...props}
    />
  )
}
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center px-6 pb-6", className)} {...props} />
  ),
)
CardFooter.displayName = "CardFooter"

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-action" className={cn("flex items-center justify-end space-x-2", className)} {...props} />
}
CardAction.displayName = "CardAction"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardAction }
