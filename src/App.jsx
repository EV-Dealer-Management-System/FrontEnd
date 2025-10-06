
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import LoginPage from "./Pages/Home/Login/LoginPage";
import RegisterPage from "./Pages/Home/Register/RegisterPage";
import { MailConfirmation } from "./Pages/Home/Register/partial/MailConfirmation";
import EmailVerification from "./Pages/Home/Register/partial/EmailVerification";
import ResetPassword from "./Pages/Home/Login/Partial/ResetPassword";
import ResetPasswordConfirm from "./Pages/Home/Login/Partial/ResetPasswordConfirm";
import ProtectedRoute from "./Router/ProtectedRoute"; 
import PublicRoute from "./Router/PublicRoute";
import CreateAccount from "./Pages/Admin/CreateDealerAccount/CreateAccount";
import ContractPage from "./Pages/ContractPage";
import EVMAdmin from "./Pages/Admin/EVMAdmin";
import VehicleManagement from "./Pages/Admin/VehicleManagement/VehicleManagement";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
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
        <Route path="/mailconfirm" element={<MailConfirmation />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ResetPassword />} />
        <Route path="/api/reset-password" element={<ResetPasswordConfirm />} />
        <Route path="/admin/dealer/create-account" element={<CreateAccount />} />
        <Route path="/contract" element={<ContractPage />} />
        <Route 
          path="/admin" 
          element={
         <ProtectedRoute>
           <EVMAdmin />
         </ProtectedRoute>
          
          } 
        />
        <Route 
          path="/admin/vehicle/model" 
          element={
         <PublicRoute>
           <VehicleManagement />
         </PublicRoute>
          
          } 
        /> 
        {/* Redirect to login page by default */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
