import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/Home/HomePage";
import LoginPage from "./pages/Home/Login/LoginPage";
import RegisterPage from "./pages/Home/Register/RegisterPage";
import CustomerProfile from "./pages/Customer/CustomerProfile";
import { MailConfirmation } from "./Pages/Home/Register/partial/MailConfirmation";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
        <Route path="/mailconfirm" element={<MailConfirmation />} />

        {/* Redirect to login page by default */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
