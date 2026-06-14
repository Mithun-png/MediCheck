import { useEffect, useRef } from "react";
import { C } from "../theme";

export default function CameraModal({ stream, onCapture, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.card, borderRadius: 20, padding: 20, width: "90%", maxWidth: 500 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>📷 Camera Capture</span>
          <button onClick={onClose}
            style={{ background: C.red + "22", color: C.red, border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: 700 }}>
            ✕ Close
          </button>
        </div>
        <video ref={videoRef} autoPlay playsInline muted
          style={{ width: "100%", borderRadius: 12, background: "#000", maxHeight: 340, objectFit: "cover" }} />
        <button onClick={() => onCapture(videoRef.current)}
          style={{ background: C.blue, color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 12 }}>
          📸 Take Photo
        </button>
      </div>
    </div>
  );
}