import { Route, Routes, useNavigate } from "react-router";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ProtectedRoute } from "./components/protected-route";
import { setNavigate } from "./config/navigate";

export default function App() {
  const navigate = useNavigate();

  setNavigate(navigate);

  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<Dashboard />} />
      </Route>

      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/email/verify/:code" element={<VerifyEmail />} />
      <Route path="/password/forgot" element={<ForgotPassword />} />
      <Route path="/password/reset" element={<ResetPassword />} />
    </Routes>
  );
}
