import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CameraModal from "../components/CameraModal";
import { verifyMedicine } from "../api";
import { useApp } from "../context/AppContext";
import { C, st } from "../theme";

export default function Upload() {
  const navigate = useNavigate();
  const { pendingImage, setPendingImage, setResult } = useApp();
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const [camStream, setCamStream] = useState(null);
  const [showCam, setShowCam]   = useState(false);
  const fRef = useRef(null);

  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      setCamStream(s); setShowCam(true);
    } catch { setErr("Camera access denied."); }
  };

  const closeCamera = () => { camStream?.getTracks().forEach(t => t.stop()); setCamStream(null); setShowCam(false); };

  const capturePhoto = (videoEl) => {
    const canvas = document.createElement("canvas");
    canvas.width  = videoEl.videoWidth  || 640;
    canvas.height = videoEl.videoHeight || 480;
    canvas.getContext("2d").drawImage(videoEl, 0, 0);
    const dataURL = canvas.toDataURL("image/jpeg", 0.92);
    camStream?.getTracks().forEach(t => t.stop());
    setCamStream(null); setShowCam(false);
    const fakeFile = new File([dataURL], "capture.jpg", { type: "image/jpeg" });
    setPendingImage({ dataURL, file: fakeFile });
  };

  const handleChange = (file) => {
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => setPendingImage({ dataURL: e.target.result, file });
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!pendingImage) return;
    setLoading(true); setErr("");
    try {
      const formData = new FormData();
      formData.append("file", pendingImage.file);
      const res = await verifyMedicine(formData);
      setResult({ ...res.data, img: pendingImage.dataURL });
      navigate("/result");
    } catch (e) {
      setErr(e.response?.data?.error || "Analysis failed. Try a clearer image.");
    }
    setLoading(false);
  };

  return (
    <div style={st.page}>
      <Navbar />
      {showCam && <CameraModal stream={camStream} onCapture={capturePhoto} onClose={closeCamera} />}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 16px" }}>
        <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, marginBottom: 20, padding: 0 }}>← Back</button>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px" }}>Analyze Medicine</h2>
        {pendingImage?.dataURL && (
          <div style={{ ...st.card, marginBottom: 16, textAlign: "center", padding: 16 }}>
            <img src={pendingImage.dataURL} alt="Medicine" style={{ maxHeight: 300, maxWidth: "100%", borderRadius: 12, objectFit: "contain" }} />
            <p style={{ color: C.muted, fontSize: 12, marginTop: 10 }}>📄 {pendingImage.file?.name}</p>
          </div>
        )}
        {err && <div style={{ background: C.red + "18", border: `1px solid ${C.red}44`, borderRadius: 10, padding: "10px 14px", color: C.red, fontSize: 13, marginBottom: 14 }}>{err}</div>}
        {loading ? (
          <div style={{ ...st.card, textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🔬</div>
            <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 6px", color: C.white }}>Analyzing your medicine...</p>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Extracting text · Checking expiry · Fetching medical info</p>
            <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "65%", background: `linear-gradient(90deg, ${C.blue}, ${C.purple})`, borderRadius: 2 }} />
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <button onClick={() => fRef.current?.click()} style={st.btn(C.card2)}>
              📁 Change
              <input ref={fRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleChange(e.target.files[0])} />
            </button>
            <button onClick={openCamera}  style={st.btn(C.card2)}>📸 Retake</button>
            <button onClick={analyze}     style={st.btn(C.blue)}>🔬 Analyze</button>
          </div>
        )}
      </div>
    </div>
  );
}