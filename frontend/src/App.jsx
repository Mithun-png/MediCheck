import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login    from "./pages/Login";
import Signup   from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Upload   from "./pages/Upload";
import Result   from "./pages/Result";
import History  from "./pages/History";

function PrivateRoute({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Login />} />
        <Route path="/signup"    element={<Signup />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/upload"    element={<PrivateRoute><Upload /></PrivateRoute>} />
        <Route path="/result"    element={<PrivateRoute><Result /></PrivateRoute>} />
        <Route path="/history"   element={<PrivateRoute><History /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}