"use client"

import { Menu } from "@base-ui/react/menu"
import { cn } from "@/lib/utils"

function DropdownMenu({ children, modal = false }) {
  return <Menu.Root modal={modal}>{children}</Menu.Root>
}

function DropdownMenuTrigger({ className, render, children, ...props }) {
  return (
    <Menu.Trigger className={className} render={render} {...props}>
      {children}
    </Menu.Trigger>
  )
}

function DropdownMenuContent({ className, align = "center", side = "bottom", children }) {
  const alignProp = align === "end" ? "end" : align === "start" ? "start" : "center"
  return (
    <Menu.Portal>
      <Menu.Positioner side={side} align={alignProp} sideOffset={4}>
        <Menu.Popup
          className={cn(
            "z-[100] max-h-[min(var(--available-height),280px)] min-w-[10rem] overflow-y-auto rounded-lg border border-[#e5e7eb] bg-white p-1 text-sm text-[#111827] shadow-lg outline-none",
            className
          )}
        >
          <Menu.Viewport className="flex flex-col gap-0.5">{children}</Menu.Viewport>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )
}

function DropdownMenuItem({ className, variant, children, ...props }) {
  return (
    <Menu.Item
      className={cn(
        "flex cursor-pointer items-center rounded-md px-2 py-1.5 text-[13px] font-medium outline-none select-none",
        "data-[highlighted]:bg-[#f3f4f6]",
        variant === "destructive" && "text-[#DC2626] data-[highlighted]:bg-[#FEF2F2]",
        className
      )}
      {...props}
    >
      {children}
    </Menu.Item>
  )
}

function DropdownMenuSeparator({ className }) {
  return <Menu.Separator className={cn("my-1 h-px shrink-0 bg-[#e5e7eb]", className)} />
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
