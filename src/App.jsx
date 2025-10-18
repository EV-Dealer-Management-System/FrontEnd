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
import GetAllDealerContractPage from "./Pages/Admin/GetAllDealerContracts/GetAllDealerContract";
import DealerManager from "./Pages/DealerManager/DealerManager";
import EVBooking from "./Pages/DealerManager/EVBooking/EVBooking";
import GetAllEVBooking from "./Pages/DealerManager/GetAllEVBooking.jsx/GetAllEVBooking";
import DealerManagerRoute from "./Router/DealerManagerRoute";
import AdminRoute from "./Router/AdminRoute";
import DealerStaffRoute from "./Router/DealerStaffRoute";
import EVMStaffRoute from "./Router/EVMStaffRoute";
import ContractViewer from "./Pages/PublicPage/ContractView";
import EVMStaff from "./Pages/EVMStaff/EVMStaff";
import ChangePassword from "./Pages/Admin/ChangePassword/ChangePassword";
import ChangePasswordEVMStaff from "./Pages/EVMStaff/ChangePassword/ChangePassword";
import ChangePasswordDealerManager from "./Pages/DealerManager/ChangePassword/ChangePassword";
import ChangePasswordDealerStaff from "./Pages/DealerStaff/ChangePassword/ChangePassword";
import GetAllEVMStaff from "./Pages/Admin/GetAllEVMStaff/GetAllEVMStaff";
import CreateEVMStaffAccount from "./Pages/Admin/CreateEVMStaffAccount/CreateEVMStaffAccount";
import EVMGetAllEVBooking from "./Pages/EVMStaff/EVMGetAllEVBooking/EVMGetAllEVBooking";
import CreateDealerAccount from "./Pages/DealerManager/CreateDealerAccount/CreateDealerAccount";
import DealerStaff from "./Pages/DealerStaff/Main/DealerStaff";
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
        <Route
          path="/EContract/contract"
          element={
            <PublicRoute>
              <ContractPage />
            </PublicRoute>
          }
        />
        <Route
          path="/EContract/View"
          element={
            <PublicRoute>
              <ContractViewer />
            </PublicRoute>
          }
        />
        {/* Admin Routes - với catch-all route */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <Routes>
                <Route path="" element={<EVMAdmin />} />
                <Route path="vehicle/model" element={<VehicleManagement />} />
                <Route
                  path="vehicle-management"
                  element={<VehicleManagement />}
                />
                <Route
                  path="dealer/create-contract"
                  element={<CreateContract />}
                />
                <Route
                  path="dealer/contracts"
                  element={<GetAllDealerContractPage />}
                />
                <Route path="staff/evm-staff" element={<GetAllEVMStaff />} />
                <Route path="staff/create-evm-staff" element={<CreateEVMStaffAccount />} />
                <Route path="settings/change-password" element={<ChangePassword />} />
                {/* Bắt mọi đường dẫn không hợp lệ và chuyển về trang chủ admin */}
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </AdminRoute>
          }
        />
        {/* Dealer Manager Routes - với catch-all route */}
        <Route
          path="/dealer-manager/*"
          element={
            <DealerManagerRoute>
              <Routes>
                <Route path="" element={<DealerManager />} />
                <Route path="ev/ev-booking" element={<EVBooking />} />
                <Route path="ev/all-ev-booking" element={<GetAllEVBooking />} />
                <Route path="settings/change-password" element={<ChangePasswordDealerManager />} />
                <Route path="staff/create-dealer-staff-account" element={<CreateDealerAccount />} />
                {/* Bắt mọi đường dẫn không hợp lệ và chuyển về trang chủ dealer manager */}
                <Route
                  path="*"
                  element={<Navigate to="/dealer-manager" replace />}
                />
              </Routes>
            </DealerManagerRoute>
          }
        />

        {/* EVM Staff Routes - với catch-all route */}
        <Route
          path="/evm-staff/*"
          element={
            <EVMStaffRoute>
              <Routes>
                <Route path="" element={<EVMStaff />} />
                <Route path="settings/change-password" element={<ChangePasswordEVMStaff />} />
                <Route path="ev/get-all-ev-booking" element={<EVMGetAllEVBooking />} />
                {/* Bắt mọi đường dẫn không hợp lệ và chuyển về trang chủ EVM Staff */}
                <Route
                  path="*"
                  element={<Navigate to="/evm-staff" replace />}
                />
              </Routes>
            </EVMStaffRoute>
          }
        />

        {/* Dealer Staff Routes - với catch-all route */}
        <Route
          path="/dealer-staff/*"
          element={
            <DealerStaffRoute>
              <Routes>
                <Route path="" element={<DealerStaff />} />
                <Route path="settings/change-password" element={<ChangePasswordDealerStaff />} />
                {/* Bắt mọi đường dẫn không hợp lệ và chuyển về trang chủ Dealer Staff */}
                <Route
                  path="*"
                  element={<Navigate to="/dealer-staff" replace />}
                />
              </Routes>
            </DealerStaffRoute>
          }
        />
        {/* Global catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
