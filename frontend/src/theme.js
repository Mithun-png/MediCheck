export const C = {
  bg:     "#080d1a",
  card:   "#0f172a",
  card2:  "#1a2236",
  border: "#1e2d45",
  blue:   "#3b82f6",
  green:  "#10b981",
  red:    "#ef4444",
  amber:  "#f59e0b",
  purple: "#8b5cf6",
  text:   "#e2e8f0",
  muted:  "#64748b",
  white:  "#ffffff",
};

export const st = {
  page:  { minHeight: "100vh", background: C.bg, color: C.text },
  card:  { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 },
  inp:   { background: C.card2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 14px", color: C.text, fontSize: 14, width: "100%", outline: "none" },
  btn:   (bg = C.blue, full = true) => ({ background: bg, color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", ...(full ? { width: "100%" } : {}) }),
  btnSm: (bg = C.card2, col = C.muted) => ({ background: bg, color: col, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }),
  badge: (color) => ({ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }),
  lbl:   { fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" },
};

export const statusColor = (s) => ({ Valid: C.green, Expired: C.red, "Expiring Soon": C.amber, Unknown: C.muted }[s] ?? C.muted);
export const statusIcon  = (s) => ({ Valid: "✅", Expired: "❌", "Expiring Soon": "⚠️", Unknown: "❓" }[s] ?? "❓");