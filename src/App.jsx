import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import HomePage from "./Pages/Home/HomePage";
import LoginPage from "./Pages/Home/Login/LoginPage.jsx";
import RegisterPage from "./Pages/Home/Register/RegisterPage";
import CustomerProfile from "./Pages/Customer/CustomerProfile";
import { MailConfirmation } from "./Pages/Home/Register/partial/MailConfirmation";
import EmailVerification from "./Pages/Home/Register/partial/EmailVerification";
import ResetPassword from "./Pages/Home/Login/Partial/ResetPassword";
import ResetPasswordConfirm from "./Pages/Home/Login/Partial/ResetPasswordConfirm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
        <Route path="/mailconfirm" element={<MailConfirmation />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ResetPassword />} />
        <Route path="/api/reset-password" element={<ResetPasswordConfirm />} />

        {/* Redirect to login page by default */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
