import axios from "axios";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000" });

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const signup         = (data)     => API.post("/signup", data);
export const login          = (data)     => API.post("/login", data);
export const verifyMedicine = (formData) => API.post("/verify", formData, { headers: authHeader() });
export const searchMedicine = (name)     => API.get("/medicine", { params: { name }, headers: authHeader() });
export const getHistory     = ()         => API.get("/history", { headers: authHeader() });