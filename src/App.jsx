
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/Home/HomePage";
import LoginPage from "./pages/Home/Login/LoginPage";
import RegisterPage from "./pages/Home/Register/RegisterPage";
import CustomerProfile from "./pages/Customer/CustomerProfile";
import { MailConfirmation } from "./pages/Home/Register/partial/MailConfirmation";
import Customer from "./pages/Customer/Customer";
import EmailVerification from "./pages/Home/Register/partial/EmailVerification";
import ResetPassword from "./pages/Home/Login/Partial/ResetPassword";
import ResetPasswordConfirm from "./pages/Home/Login/Partial/ResetPasswordConfirm";
import ProtectedRoute from "./Router/ProtectedRoute";
import PublicRoute from "./Router/PublicRoute";
import Admin from "./pages/Admin/Admin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <HomePage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute>
              <CustomerProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/mailconfirm" element={<MailConfirmation />} />
        <Route
          path="/customer"
          element={
            <ProtectedRoute>
              <Customer />
            </ProtectedRoute>
          }
        />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ResetPassword />} />
        <Route path="/api/reset-password" element={<ResetPasswordConfirm />} />
        <Route path="/admin" element={<Admin />} />
        {/* Redirect to login page by default */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
