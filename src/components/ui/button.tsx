import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", type = "button", ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50"

    const variantClasses =
      variant === "outline"
        ? "border border-[#2A9D8F]/35 bg-[#1A1F2B] text-[#FAF3E0]/85 hover:border-[#2A9D8F] hover:bg-[#264653] hover:text-[#FAF3E0]"
        : variant === "ghost"
          ? "bg-transparent text-[#FAF3E0]/80 hover:bg-[#264653] hover:text-[#FAF3E0]"
          : "bg-[#EF4444] text-[#1A1F2B] font-bold hover:bg-[#F87171] hover:text-[#1A1F2B] shadow-[0_0_20px_rgba(239,68,68,0.35)]"

    const sizeClasses =
      size === "sm"
        ? "h-8 px-3 py-1.5"
        : size === "lg"
          ? "h-10 px-6 py-2.5 text-sm"
          : "h-9 px-4 py-2"

    return (
      <button
        ref={ref}
        type={type}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim()}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"
