import * as React from "react"

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card"
      className={`[--card-spacing:1.5rem] flex flex-col gap-6 rounded-2xl border border-[#2A9D8F]/30 bg-[#264653] py-(--card-spacing) text-[#FAF3E0] shadow-[0_0_20px_rgba(42,157,143,0.12)] ${className}`.trim()}
      {...props}
    />
  ),
)
Card.displayName = "Card"

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      className={`flex flex-col gap-1.5 px-(--card-spacing) text-left ${className}`.trim()}
      {...props}
    />
  ),
)
CardHeader.displayName = "CardHeader"

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", ...props }, ref) => (
    <h3
      ref={ref}
      data-slot="card-title"
      className={`text-base font-bold leading-none tracking-tight text-[#FAF3E0] ${className}`.trim()}
      {...props}
    />
  ),
)
CardTitle.displayName = "CardTitle"

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
  <p
    ref={ref}
    data-slot="card-description"
    className={`text-xs text-[#FAF3E0]/75 ${className}`.trim()}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-content"
      className={`px-(--card-spacing) text-left ${className}`.trim()}
      {...props}
    />
  ),
)
CardContent.displayName = "CardContent"

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      className={`flex items-center border-t border-[#2A9D8F]/30 px-(--card-spacing) pt-4 ${className}`.trim()}
      {...props}
    />
  ),
)
CardFooter.displayName = "CardFooter"
