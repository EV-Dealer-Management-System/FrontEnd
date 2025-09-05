import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import HomePage from "./Pages/Home/HomePage";
import LoginPage from "./Pages/Home/Login/LoginPage";
import RegisterPage from "./Pages/Home/Register/RegisterPage";
import CustomerProfile from "./Pages/Customer/CustomerProfile";
import { MailConfirmation } from "./Pages/Home/Register/partial/MailConfirmation";
import Customer from "./Pages/Customer/Customer";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
        <Route path="/mailconfirm" element={<MailConfirmation />} />
        <Route path="/customer" element={<Customer />} />
        {/* Redirect to login page by default */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
