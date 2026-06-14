import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import { C, st } from "../theme";

export default function Login() {
  const [form, setForm]   = useState({ username: "", password: "" });
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!form.username.trim() || !form.password.trim()) { setErr("Please fill all fields."); return; }
    setLoading(true);
    try {
      const res = await login(form);
      localStorage.setItem("token",    res.data.token);
      localStorage.setItem("username", res.data.username || form.username);
      navigate("/dashboard");
    } catch (e) {
      setErr(e.response?.data?.error || "Login failed. Try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ ...st.page, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ ...st.card, width: "100%", maxWidth: 400, margin: 16 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, background: C.blue + "22", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 14px" }}>💊</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: "0 0 4px" }}>Welcome Back</h1>
          <p style={{ color: C.muted, fontSize: 13 }}>Sign in to MediCheck</p>
        </div>
        {err && <div style={{ background: C.red + "18", border: `1px solid ${C.red}44`, borderRadius: 10, padding: "10px 14px", color: C.red, fontSize: 13, marginBottom: 16 }}>{err}</div>}
        {[["Username", "username", "text"], ["Password", "password", "password"]].map(([lbl, key, type]) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={st.lbl}>{lbl}</label>
            <input style={st.inp} type={type} placeholder={`Enter ${lbl.toLowerCase()}`}
              value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>
        ))}
        <button style={{ ...st.btn(C.blue), opacity: loading ? 0.7 : 1 }} onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: C.muted }}>
          No account?{" "}
          <span onClick={() => navigate("/signup")} style={{ color: C.blue, cursor: "pointer", fontWeight: 700 }}>Create one</span>
        </p>
      </div>
    </div>
  );
}