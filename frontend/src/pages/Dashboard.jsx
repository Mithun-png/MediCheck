import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CameraModal from "../components/CameraModal";
import { searchMedicine, getHistory } from "../api";
import { useApp } from "../context/AppContext";
import { C, st, statusColor, statusIcon } from "../theme";

export default function Dashboard() {
  const navigate = useNavigate();
  const { setPendingImage } = useApp();

  const [drag, setDrag]         = useState(false);
  const [camStream, setCamStream] = useState(null);
  const [showCam, setShowCam]   = useState(false);
  const [recentHist, setRecentHist] = useState([]);

  const [medName, setMedName]   = useState("");
  const [medRes, setMedRes]     = useState(null);
  const [medLoad, setMedLoad]   = useState(false);
  const [medErr, setMedErr]     = useState("");

  const fRef = useRef(null);

  useEffect(() => {
    getHistory().then(r => setRecentHist(r.data.slice(0, 4))).catch(() => {});
  }, []);

  useEffect(() => () => { camStream?.getTracks().forEach(t => t.stop()); }, [camStream]);

  const handleFile = (file) => {
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => {
      setPendingImage({ dataURL: e.target.result, file });
      navigate("/upload");
    };
    reader.readAsDataURL(file);
  };

  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      setCamStream(s);
      setShowCam(true);
    } catch { alert("Camera access denied or unavailable."); }
  };

  const closeCamera = () => {
    camStream?.getTracks().forEach(t => t.stop());
    setCamStream(null);
    setShowCam(false);
  };

  const capturePhoto = (videoEl) => {
    const canvas = document.createElement("canvas");
    canvas.width  = videoEl.videoWidth  || 640;
    canvas.height = videoEl.videoHeight || 480;
    canvas.getContext("2d").drawImage(videoEl, 0, 0);
    const dataURL = canvas.toDataURL("image/jpeg", 0.92);
    camStream?.getTracks().forEach(t => t.stop());
    setCamStream(null);
    setShowCam(false);
    const fakeFile = new File([dataURL], "capture.jpg", { type: "image/jpeg" });
    setPendingImage({ dataURL, file: fakeFile });
    navigate("/upload");
  };

  const searchMed = async () => {
    if (!medName.trim()) return;
    setMedLoad(true); setMedErr(""); setMedRes(null);
    try {
      const res = await searchMedicine(medName.trim());
      if (!res.data.found) { setMedErr("Medicine not found. Check the name and try again."); }
      else setMedRes(res.data);
    } catch { setMedErr("Search failed. Please try again."); }
    setMedLoad(false);
  };

  return (
    <div style={st.page}>
      <Navbar />
      {showCam && <CameraModal stream={camStream} onCapture={capturePhoto} onClose={closeCamera} />}

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 16px" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            Good day, {localStorage.getItem("username")} 👋
          </h2>
          <p style={{ color: C.muted, fontSize: 14 }}>Scan a medicine or search by name to get details instantly.</p>
        </div>

        {/* Two Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>

          {/* Card 1 – Scan */}
          <div style={{ ...st.card, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, background: C.blue + "22", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📷</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Scan Medicine</div>
                <div style={{ fontSize: 12, color: C.muted }}>Upload image or use camera</div>
              </div>
            </div>
            <div
              style={{ border: `2px dashed ${drag ? C.blue : C.border}`, background: drag ? C.blue + "0d" : C.card2, borderRadius: 12, padding: "28px 16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", marginBottom: 12, flex: 1 }}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => fRef.current?.click()}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>🖼️</div>
              <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 4px", color: C.white }}>Drop image here</p>
              <p style={{ color: C.muted, fontSize: 11, margin: 0 }}>or click to browse</p>
              <input ref={fRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => fRef.current?.click()} style={{ ...st.btnSm(C.card2, C.text), flex: 1, textAlign: "center" }}>📁 Upload</button>
              <button onClick={openCamera}                  style={{ ...st.btnSm(C.blue + "22", C.blue), flex: 1, textAlign: "center", border: `1px solid ${C.blue}44` }}>📸 Camera</button>
            </div>
          </div>

          {/* Card 2 – Name Search */}
          <div style={{ ...st.card, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, background: C.purple + "22", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🔍</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Know Your Medicine</div>
                <div style={{ fontSize: 12, color: C.muted }}>Search by medicine name</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input style={{ ...st.inp, flex: 1 }} placeholder="e.g. Paracetamol, Amoxicillin..."
                value={medName} onChange={e => setMedName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && searchMed()} />
              <button onClick={searchMed} disabled={medLoad}
                style={{ ...st.btn(C.purple, false), padding: "11px 16px", opacity: medLoad ? 0.7 : 1, flexShrink: 0 }}>
                {medLoad ? "..." : "Search"}
              </button>
            </div>
            {medErr && <div style={{ background: C.red + "18", border: `1px solid ${C.red}33`, borderRadius: 10, padding: "10px 12px", color: C.red, fontSize: 12 }}>{medErr}</div>}
            {!medRes && !medLoad && !medErr && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 0", color: C.muted }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>💊</div>
                <p style={{ fontSize: 12, textAlign: "center", lineHeight: 1.6 }}>Type any medicine name to get its purpose, dosage, side effects and more.</p>
              </div>
            )}
            {medLoad && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔬</div>
                <p style={{ fontSize: 13, color: C.muted }}>Fetching medicine info...</p>
              </div>
            )}
            {medRes && (
              <div style={{ flex: 1, overflowY: "auto", maxHeight: 280 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{medRes.name}</div>
                    {medRes.generic_name && <div style={{ fontSize: 12, color: C.muted }}>{medRes.generic_name}</div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                    {medRes.category && <span style={st.badge(C.purple)}>{medRes.category}</span>}
                    {medRes.otc !== undefined && <span style={st.badge(medRes.otc ? C.green : C.amber)}>{medRes.otc ? "OTC" : "Rx Only"}</span>}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 10 }}>{medRes.purpose}</p>
                {medRes.how_it_works && <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 10, fontStyle: "italic" }}>⚙️ {medRes.how_it_works}</p>}
                {medRes.uses?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>Uses</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {medRes.uses.map((u, i) => <span key={i} style={{ ...st.badge(C.purple), fontSize: 10 }}>{u}</span>)}
                    </div>
                  </div>
                )}
                {medRes.side_effects?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>Side Effects</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {medRes.side_effects.map((s, i) => <span key={i} style={{ ...st.badge(C.amber), fontSize: 10 }}>{s}</span>)}
                    </div>
                  </div>
                )}
                {medRes.dosage && (
                  <div style={{ background: C.card2, borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 4 }}>💊 Dosage</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{medRes.dosage}</div>
                  </div>
                )}
                {medRes.warnings?.length > 0 && (
                  <div style={{ background: C.red + "0e", border: `1px solid ${C.red}22`, borderRadius: 8, padding: "8px 12px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.red, marginBottom: 4 }}>⚠️ Warnings</div>
                    {medRes.warnings.map((w, i) => <div key={i} style={{ fontSize: 12, color: C.muted, marginTop: i > 0 ? 4 : 0 }}>• {w}</div>)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Scans */}
        {recentHist.length > 0 && (
          <div style={st.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>📋 Recent Scans</h3>
              <button onClick={() => navigate("/history")} style={st.btnSm(C.card2, C.blue)}>View All</button>
            </div>
            {recentHist.map((h, i) => {
              const sc = statusColor(h.status);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ width: 40, height: 40, background: sc + "22", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{statusIcon(h.status)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{h.name || "Unknown"}</div>
                    <div style={{ color: C.muted, fontSize: 12 }}>{h.category || "—"} · {new Date(h.timestamp).toLocaleDateString()}</div>
                  </div>
                  <span style={st.badge(sc)}>{h.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}