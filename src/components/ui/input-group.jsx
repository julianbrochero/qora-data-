import * as React from "react"
import { cn } from "@/lib/utils"

const InputGroup = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full items-center rounded-2xl bg-gray-50/50 transition-all focus-within:bg-white focus-within:shadow-[0_0_0_1.5px_#334139] overflow-hidden group/input-group",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
InputGroup.displayName = "InputGroup"

const InputGroupInput = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-11 w-full bg-transparent px-4 py-2 text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
))
InputGroupInput.displayName = "InputGroupInput"

const InputGroupAddon = React.forwardRef(({ className, align = "inline-start", children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-center px-3 text-gray-400 transition-colors group-focus-within/input-group:text-[#334139]",
      align === "inline-start" ? "order-first" : "order-last",
      className
    )}
    {...props}
  >
    {typeof children === 'string' || typeof children === 'number' ? (
        <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap opacity-60">
            {children}
        </span>
    ) : (
        React.Children.map(children, child => {
            if (!React.isValidElement(child)) return child;
            return React.cloneElement(child, { size: child.props?.size || 16 });
        })
    )}
  </div>
))
InputGroupAddon.displayName = "InputGroupAddon"

export { InputGroup, InputGroupInput, InputGroupAddon }
