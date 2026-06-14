import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getHistory } from "../api";
import { useApp } from "../context/AppContext";
import { C, st, statusColor, statusIcon } from "../theme";

export default function History() {
  const navigate = useNavigate();
  const { setPendingImage } = useApp();
  const [hist, setHist]   = useState([]);
  const [hf, setHf]       = useState("all");
  const [loading, setLoading] = useState(true);
  const fRef = useRef(null);

  useEffect(() => {
    getHistory()
      .then(r => setHist(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFile = (file) => {
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => { setPendingImage({ dataURL: e.target.result, file }); navigate("/upload"); };
    reader.readAsDataURL(file);
  };

  const filtered = hf === "all" ? hist : hist.filter(h =>
    hf === "expiring" ? h.status === "Expiring Soon" : h.status?.toLowerCase() === hf
  );

  return (
    <div style={st.page}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Scan History</h2>
          <button onClick={() => fRef.current?.click()} style={st.btnSm(C.blue, "white")}>
            + New Scan
            <input ref={fRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {[["all", `All (${hist.length})`], ["valid", "✅ Valid"], ["expired", "❌ Expired"], ["expiring", "⚠️ Expiring Soon"]].map(([f, l]) => (
            <button key={f} onClick={() => setHf(f)}
              style={{ ...st.btnSm(hf === f ? C.blue : C.card, hf === f ? "white" : C.muted), borderColor: hf === f ? C.blue : C.border, fontSize: 12 }}>
              {l}
            </button>
          ))}
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: C.muted }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ ...st.card, textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>📋</div>
            <p style={{ color: C.muted, fontWeight: 600 }}>No scans found</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((h, i) => {
              const sc = statusColor(h.status);
              return (
                <div key={i} style={{ ...st.card, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 46, height: 46, background: sc + "18", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{statusIcon(h.status)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{h.name || "Unknown"}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      {h.category && <span style={{ ...st.badge(C.blue), fontSize: 10 }}>{h.category}</span>}
                      <span style={{ color: C.muted, fontSize: 12 }}>Exp: {h.expiry || "N/A"} · {h.manufacturer || "N/A"}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={st.badge(sc)}>{h.status}</span>
                    <div style={{ color: C.muted, fontSize: 11, marginTop: 5 }}>{new Date(h.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}