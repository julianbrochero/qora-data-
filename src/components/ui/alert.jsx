import * as React from "react"

const VARIANTS = {
  default: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    color: "#111827",
    iconColor: "#6B7280",
  },
  success: {
    background: "#F0FDF4",
    border: "1px solid #BBF7D0",
    color: "#166534",
    iconColor: "#16A34A",
  },
  destructive: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#991B1B",
    iconColor: "#DC2626",
  },
  warning: {
    background: "#FFFBEB",
    border: "1px solid #FDE68A",
    color: "#92400E",
    iconColor: "#D97706",
  },
  info: {
    background: "#EFF6FF",
    border: "1px solid #BFDBFE",
    color: "#1E40AF",
    iconColor: "#2563EB",
  },
}

function Alert({ variant = "default", style, children, ...props }) {
  const v = VARIANTS[variant] || VARIANTS.default
  return (
    <div
      role="alert"
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "0 10px",
        alignItems: "start",
        padding: "12px 16px",
        borderRadius: 10,
        fontSize: 13,
        fontFamily: "'Inter', -apple-system, sans-serif",
        background: v.background,
        border: v.border,
        color: v.color,
        position: "relative",
        /* pass iconColor via CSS var for svg children */
        "--alert-icon-color": v.iconColor,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

function AlertTitle({ style, ...props }) {
  return (
    <div
      style={{
        gridColumn: 2,
        fontWeight: 600,
        lineHeight: 1.3,
        marginBottom: 2,
        ...style,
      }}
      {...props}
    />
  )
}

function AlertDescription({ style, ...props }) {
  return (
    <div
      style={{
        gridColumn: 2,
        opacity: 0.85,
        lineHeight: 1.5,
        ...style,
      }}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
