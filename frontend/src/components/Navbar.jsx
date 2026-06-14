import { useNavigate, useLocation } from "react-router-dom";
import { C } from "../theme";

export default function Navbar() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  const user = localStorage.getItem("username") || "User";

  return (
    <nav style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "0 20px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20 }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: C.blue, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 22 }}>💊</span> MediCheck
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {[["🏠", "/dashboard", "Home"], ["📋", "/history", "History"]].map(([icon, path, lbl]) => (
          <button key={path} onClick={() => navigate(path)}
            style={{ background: pathname === path ? C.blue + "22" : "transparent", color: pathname === path ? C.blue : C.muted, border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {icon} {lbl}
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: C.border, margin: "0 4px" }} />
        <span style={{ fontSize: 13, color: C.muted }}>{user}</span>
        <button onClick={logout}
          style={{ background: C.card2, color: C.red, border: `1px solid ${C.red}44`, borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Logout
        </button>
      </div>
    </nav>
  );
}