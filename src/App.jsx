import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import LoginPage from "./Pages/Home/Login/LoginPage";
import RegisterPage from "./Pages/Home/Register/RegisterPage";
import { MailConfirmation } from "./Pages/Home/Register/partial/MailConfirmation";
import EmailVerification from "./Pages/Home/Register/partial/EmailVerification";
import ResetPassword from "./Pages/Home/Login/Partial/ResetPassword";
import ResetPasswordConfirm from "./Pages/Home/Login/Partial/ResetPasswordConfirm";

import PublicRoute from "./Router/PublicRoute";
import CreateContract from "./Pages/Admin/CreateDealerAccount/CreateContract";
import ContractPage from "./Pages/PublicPage/ContractPage";
import EVMAdmin from "./Pages/Admin/EVMAdmin";
import VehicleManagement from "./Pages/Admin/VehicleManagement/VehicleManagement";
import DealerManager from "./Pages/DealerManager/DealerManager";
import EVBooking from "./Pages/DealerManager/EVBooking/EVBooking";
import GetAllEVBooking from "./Pages/DealerManager/GetAllEVBooking.jsx/GetAllEVBooking";
import DealerManagerRoute from "./Router/DealerManagerRoute";
import AdminRoute from "./Router/AdminRoute";
import DealerStaffRoute from "./Router/DealerStaffRoute";
import EVMStaffRoute from "./Router/EVMStaffRoute";
import ContractViewer from "./Pages/PublicPage/ContractView";

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
        <Route path="/contract" element={<ContractPage />} />
        <Route path="/EContract/preview" element={<ContractViewer />} />
        {/* Admin Routes - với catch-all route */}
        <Route path="/admin/*" element={<AdminRoute>
          <Routes>
            <Route path="" element={<EVMAdmin />} />
            <Route path="vehicle/model" element={<VehicleManagement />} />
            <Route path="dealer/create-contract" element={<CreateContract />} />
            {/* Bắt mọi đường dẫn không hợp lệ và chuyển về trang chủ admin */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </AdminRoute>} />
        {/* Dealer Manager Routes - với catch-all route */}
        <Route path="/dealer-manager/*" element={<DealerManagerRoute>
          <Routes>
            <Route path="" element={<DealerManager />} />
            <Route path="ev/ev-booking" element={<EVBooking />} />
            <Route path="ev/all-ev-booking" element={<GetAllEVBooking />} />
            {/* Bắt mọi đường dẫn không hợp lệ và chuyển về trang chủ dealer manager */}
            <Route path="*" element={<Navigate to="/dealer-manager" replace />} />
          </Routes>
        </DealerManagerRoute>} />

        {/* Global catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
