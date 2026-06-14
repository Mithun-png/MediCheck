import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api";
import { C, st } from "../theme";

export default function Signup() {
  const [form, setForm]   = useState({ username: "", password: "", confirm: "" });
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!form.username.trim() || !form.password.trim()) { setErr("Please fill all fields."); return; }
    if (form.password !== form.confirm) { setErr("Passwords don't match."); return; }
    setLoading(true);
    try {
      await signup({ username: form.username, password: form.password });
      navigate("/");
    } catch (e) {
      setErr(e.response?.data?.error || "Signup failed. Try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ ...st.page, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ ...st.card, width: "100%", maxWidth: 400, margin: 16 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, background: C.blue + "22", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 14px" }}>💊</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: "0 0 4px" }}>Create Account</h1>
          <p style={{ color: C.muted, fontSize: 13 }}>Join MediCheck for free</p>
        </div>
        {err && <div style={{ background: C.red + "18", border: `1px solid ${C.red}44`, borderRadius: 10, padding: "10px 14px", color: C.red, fontSize: 13, marginBottom: 16 }}>{err}</div>}
        {[["Username", "username", "text"], ["Password", "password", "password"], ["Confirm Password", "confirm", "password"]].map(([lbl, key, type]) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={st.lbl}>{lbl}</label>
            <input style={st.inp} type={type} placeholder={`Enter ${lbl.toLowerCase()}`}
              value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
          </div>
        ))}
        <button style={{ ...st.btn(C.blue), opacity: loading ? 0.7 : 1 }} onClick={handleSignup} disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>
        <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: C.muted }}>
          Have an account?{" "}
          <span onClick={() => navigate("/")} style={{ color: C.blue, cursor: "pointer", fontWeight: 700 }}>Sign in</span>
        </p>
      </div>
    </div>
  );
}