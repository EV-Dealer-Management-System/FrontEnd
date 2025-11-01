import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import React from "react";
import LoginPage from "./Pages/Home/Login/LoginPage";
import LoginSuccess from "./Pages/Home/Login/LoginSuccess";
import RegisterPage from "./Pages/Home/Register/RegisterPage";
import { MailConfirmation } from "./Pages/Home/Register/partial/MailConfirmation";
import EmailVerification from "./Pages/Home/Register/partial/EmailVerification";
import ResetPassword from "./Pages/Home/Login/Partial/ResetPassword";
import ResetPasswordConfirm from "./Pages/Home/Login/Partial/ResetPasswordConfirm";
import PublicRoute from "./Router/PublicRoute";
import CreateContract from "./Pages/Admin/CreateDealerAccount/CreateContract";
import ContractPage from "./Pages/PublicPage/ContractPage";
import EVMAdmin from "./Pages/Admin/Dashboard/EVMAdmin";
import VehicleManagement from "./Pages/Admin/VehicleManagement/VehicleManagement";
import InventoryManagement from "./Pages/Admin/InventoryManagement/InventoryManagement";
import GetAllDealerContractPage from "./Pages/Admin/GetAllDealerContracts/GetAllDealerContract";
import DealerManager from "./Pages/DealerManager/DealerManager";
import EVBooking from "./Pages/DealerManager/EVBooking/EVBooking";
import GetAllEVBooking from "./Pages/DealerManager/GetAllEVBooking.jsx/GetAllEVBooking";
import ScheduleTestDrive from "./Pages/DealerStaff/ScheduleTestDrive/ScheduleTestDrive";
import FeedBack from "./Pages/DealerStaff/FeedBack/FeedBack";
import GetAllEVQuotesDealerManager from "./Pages/DealerManager/GetAllEVQuotes/GetAllEVQuotes";
import Appointment from "./Pages/DealerManager/AppointmentSetting/Appointment";
import CreateAppointmentSetting from "./Pages/DealerManager/AppointmentSetting/Components/CreateAppointmentSetting";
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
import DealerStaffList from "./Pages/DealerManager/DealerStaffAccount/DealerStaffList";
import EVMGetAllEVBooking from "./Pages/EVMStaff/EVMGetAllEVBooking/EVMGetAllEVBooking";
import CreateDealerAccount from "./Pages/DealerManager/CreateDealerAccount/CreateDealerAccount";
import GetAllEVInventory from "./Pages/DealerManager/GetAllEVInventory/GetAllEVInventory";
import DealerStaff from "./Pages/DealerStaff/Main/DealerStaff";
import GetAvailableEVInventory from "./Pages/DealerStaff/GetAvailableEVInventory/GetAvailableEVInventory";
import CreateEVQuote from "./Pages/DealerStaff/CreateEVQuote/CreateEVQuote";
import GetAllEVQuotes from "./Pages/DealerStaff/GetAllEVQuotes/GetAllEVQuotes";
import EVVersionDetails from "./Pages/DealerStaff/EVVersionDetail/EVVersionDetails";
import GetAllPromotion from "./Pages/Admin/GetAllPromotion/GetAllPromotion";
import CreateEVPromotion from "./Pages/Admin/CreateEVPromotion/CreateEVPromotion";
import TemplateEditorPage from "./Pages/Admin/TemplateEditor/TemplateEditorPage";
import BookingContract from "./Pages/Admin/BookingSigning/BookingContract";
import GetAllEVDealerPage from "./Pages/Admin/GetAllEVDealer/GetAllEVDealer";
import ViewAllContract from "./Pages/EVMStaff/GetAllContract/ViewAllContract";
import GetAllCustomer from "./Pages/DealerManager/GetAllCustomer/GetAllCustomer";
import CreateEVCustomer from "./Pages/DealerStaff/CreateEVCustomer/CreateEVCustomer";
import GetAllEVCustomer from "./Pages/DealerStaff/GetAllEVCustomer/GetAllEVCustomer";
import PaymentResponse from "./Pages/Payment/PaymentResponse";
import Createvehicle from "./Pages/EVMStaff/Vehicle/CreateVehicle";
import TemplateOverview from "./Pages/EVMStaff/Vehicle/TemplateOverview";
import AdminGetAllEVBooking from "./Pages/Admin/GetAllEVBooking/AdminGetAllEVBooking";
import EVMGetAllInventory from "./Pages/Admin/GetAllEVInventory/EVMGetAllInventory";

import FeedbackDealerStaff from "./Pages/DealerManager/StaffFeedback/FeedbackDealerStaff";
import UpdateStatusCustomerFeedback from "./Pages/DealerManager/ManageCusFeedback/UpdateStatusCustomerFeedback";
import UpdateStatusStaffFeedback from "./Pages/EVMStaff/StaffFeedbackManage/UpdateStatusStaffFeedback";

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
          path="/Checkout"
          element={
            <PublicRoute>
              <PaymentResponse />
            </PublicRoute>
          }
        />
        <Route path="/login-success" element={<LoginSuccess />} />
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
          path="/EContract/contract/get-info-to-sign-process-by-code"
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
                  path="inventory-management"
                  element={<InventoryManagement />}
                />
                <Route
                  path="inventory/company-inventory"
                  element={<EVMGetAllInventory />}
                />
                <Route
                  path="dealer/all-dealers"
                  element={<GetAllEVDealerPage />}
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
                <Route
                  path="staff/create-evm-staff"
                  element={<CreateEVMStaffAccount />}
                />
                <Route
                  path="settings/change-password"
                  element={<ChangePassword />}
                />
                <Route
                  path="promotions/all-promotions"
                  element={<GetAllPromotion />}
                />
                <Route
                  path="promotions/create-promotion"
                  element={<CreateEVPromotion />}
                />
                <Route
                  path="settings/template-editor"
                  element={<TemplateEditorPage />}
                />
                <Route path="booking/ready-booking-signing" element={<BookingContract />} />
                <Route path="booking/all-ev-booking" element={<AdminGetAllEVBooking />} />
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
                <Route
                  path="ev/all-ev-quotes"
                  element={<GetAllEVQuotesDealerManager />}
                />
                <Route path="ev/inventory" element={<GetAllEVInventory />} />
                
                <Route path="staff/staff-list" element={<DealerStaffList />} />
                <Route
                  path="customers/get-all-customers"
                  element={<GetAllCustomer />}
                />
                <Route
                  path="settings/change-password"
                  element={<ChangePasswordDealerManager />}
                />
                <Route
                  path="staff/create-dealer-staff-account"
                  element={<CreateDealerAccount />}
                />
                <Route path="customer-feedback/all" element={<UpdateStatusCustomerFeedback />} />
                <Route path="staff-feedback/all" element={<FeedbackDealerStaff />} />
                <Route
                  path="appointment"
                  element={<Appointment />}
                />
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
                <Route
                  path="settings/change-password"
                  element={<ChangePasswordEVMStaff />}
                />
                <Route
                  path="ev/get-all-ev-booking"
                  element={<EVMGetAllEVBooking />}
                />
                <Route
                  path="contracts/create-contract"
                  element={<CreateContract />}
                />
                <Route
                  path="contracts/view-all-dealer-contracts"
                  element={<ViewAllContract />}
                />
                <Route
                  path="vehicles/create-vehicle"
                  element={<Createvehicle />}
                />
                <Route
                  path="vehicles/template-overview"
                  element={<TemplateOverview />}
                />
                <Route
                  path="dealer-feedback/all"
                  element={<UpdateStatusStaffFeedback />}
                />
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
                <Route
                  path="settings/change-password"
                  element={<ChangePasswordDealerStaff />}
                />
                <Route
                  path="ev/inventory"
                  element={<GetAvailableEVInventory />}
                />
                <Route path="quotes/create-quote" element={<CreateEVQuote />} />
                <Route path="quotes/all-quotes" element={<GetAllEVQuotes />} />
                <Route
                  path="feedback/all"
                  element={<FeedBack />}
                />
                <Route
                  path="ev/version-details"
                  element={<EVVersionDetails />}
                />
                <Route
                  path="customers/create-ev-customer"
                  element={<CreateEVCustomer />}
                />
                <Route
                  path="customers/get-all-ev-customers"
                  element={<GetAllEVCustomer />}
                />
                <Route
                  path="schedule/test-drive"
                  element={<ScheduleTestDrive />}
                />
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
