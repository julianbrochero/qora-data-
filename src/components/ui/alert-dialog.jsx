/**
 * alert-dialog.jsx — built on @base-ui/react/dialog with inline styles.
 * Same API as shadcn AlertDialog.
 */
import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

function AlertDialog({ ...props }) {
  return <DialogPrimitive.Root {...props} />
}

function AlertDialogPortal({ ...props }) {
  return <DialogPrimitive.Portal {...props} />
}

function AlertDialogOverlay({ style, ...props }) {
  return (
    <DialogPrimitive.Backdrop
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(2px)",
        ...style,
      }}
      {...props}
    />
  )
}

function AlertDialogContent({ style, children, ...props }) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <DialogPrimitive.Popup
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          width: "min(480px, calc(100vw - 32px))",
          background: "#ffffff",
          borderRadius: 14,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)",
          border: "1px solid rgba(0,0,0,0.08)",
          fontFamily: "'Inter', -apple-system, sans-serif",
          overflow: "hidden",
          ...style,
        }}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({ style, ...props }) {
  return (
    <div
      style={{ padding: "24px 24px 0", display: "flex", flexDirection: "column", gap: 6, ...style }}
      {...props}
    />
  )
}

function AlertDialogFooter({ style, ...props }) {
  return (
    <div
      style={{
        display: "flex", justifyContent: "flex-end", gap: 8,
        padding: "16px 24px",
        borderTop: "1px solid #f3f4f6",
        background: "#f9fafb",
        ...style,
      }}
      {...props}
    />
  )
}

function AlertDialogTitle({ style, ...props }) {
  return (
    <DialogPrimitive.Title
      style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827", ...style }}
      {...props}
    />
  )
}

function AlertDialogDescription({ style, ...props }) {
  return (
    <DialogPrimitive.Description
      style={{ margin: 0, fontSize: 13, color: "#6B7280", lineHeight: 1.5, ...style }}
      {...props}
    />
  )
}

function AlertDialogAction({ style, onClick, children, ...props }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 34, padding: "0 18px", borderRadius: 8,
        border: "none", background: "#DC2626",
        fontSize: 13, fontWeight: 600, color: "#ffffff",
        cursor: "pointer", fontFamily: "inherit",
        transition: "background .12s",
        ...style,
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#B91C1C"}
      onMouseLeave={e => e.currentTarget.style.background = style?.background || "#DC2626"}
      {...props}
    >
      {children}
    </button>
  )
}

function AlertDialogCancel({ style, children, onClick, ...props }) {
  return (
    <DialogPrimitive.Close
      onClick={onClick}
      style={{
        height: 34, padding: "0 16px", borderRadius: 8,
        border: "1.5px solid #d1d5db", background: "#ffffff",
        fontSize: 13, fontWeight: 500, color: "#374151",
        cursor: "pointer", fontFamily: "inherit",
        transition: "all .12s",
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.borderColor = "#9ca3af" }}
      onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#d1d5db" }}
      {...props}
    >
      {children}
    </DialogPrimitive.Close>
  )
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
}
