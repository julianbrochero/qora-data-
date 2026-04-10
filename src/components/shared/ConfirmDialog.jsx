import React, { useEffect, useRef } from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { AlertTriangle } from "lucide-react"

export default function ConfirmDialog({
  open,
  title        = "¿Estás seguro?",
  description  = "Esta acción no se puede deshacer.",
  confirmLabel = "Eliminar",
  cancelLabel  = "Cancelar",
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null)

  useEffect(() => {
    if (open) setTimeout(() => cancelRef.current?.focus(), 50)
  }, [open])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={v => { if (!v) onCancel?.() }}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Backdrop
          style={{
            position: "fixed", inset: 0, zIndex: 9998,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(2px)",
          }}
        />

        {/* Panel */}
        <DialogPrimitive.Popup
          style={{
            position: "fixed",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
            width: "min(440px, calc(100vw - 32px))",
            background: "#ffffff",
            borderRadius: 14,
            boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)",
            border: "1px solid rgba(0,0,0,0.08)",
            overflow: "hidden",
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          {/* Body */}
          <div style={{ padding: "28px 28px 20px" }}>
            {/* Icon + title row */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: "#FEF2F2", border: "1px solid #FECACA",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <AlertTriangle size={20} strokeWidth={2} style={{ color: "#DC2626" }} />
              </div>
              <div>
                <DialogPrimitive.Title
                  style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827", lineHeight: 1.3 }}
                >
                  {title}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description
                  style={{ margin: "5px 0 0", fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}
                >
                  {description}
                </DialogPrimitive.Description>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: "flex", justifyContent: "flex-end", gap: 8,
            padding: "14px 28px",
            borderTop: "1px solid #f3f4f6",
            background: "#f9fafb",
            borderRadius: "0 0 14px 14px",
          }}>
            <DialogPrimitive.Close
              ref={cancelRef}
              onClick={onCancel}
              style={{
                height: 34, padding: "0 16px", borderRadius: 8,
                border: "1.5px solid #d1d5db", background: "#ffffff",
                fontSize: 13, fontWeight: 500, color: "#374151",
                cursor: "pointer", fontFamily: "inherit",
                transition: "all .12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.borderColor = "#9ca3af" }}
              onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#d1d5db" }}
            >
              {cancelLabel}
            </DialogPrimitive.Close>

            <button
              onClick={onConfirm}
              style={{
                height: 34, padding: "0 18px", borderRadius: 8,
                border: "none", background: "#DC2626",
                fontSize: 13, fontWeight: 600, color: "#ffffff",
                cursor: "pointer", fontFamily: "inherit",
                transition: "background .12s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#B91C1C"}
              onMouseLeave={e => e.currentTarget.style.background = "#DC2626"}
            >
              {confirmLabel}
            </button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
