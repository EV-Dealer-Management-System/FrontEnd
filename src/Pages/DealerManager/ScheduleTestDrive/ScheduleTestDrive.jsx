import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Typography, Divider, Tabs, Alert } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import {
  PlusOutlined,
  CalendarOutlined,
  SettingOutlined,
  DashboardOutlined,
} from "@ant-design/icons";

import NavigationBar from "../../../Components/DealerManager/Components/NavigationBar";

// ✅ Import các component con
import CreateAppointment from "./Components/CreateAppointment";
import CreateAppointmentSetting from "./Components/CreateAppointmentSetting";

const { Title } = Typography;

// ================= Error Boundary ==================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "50px", textAlign: "center" }}>
          <h2>❌ Đã xảy ra lỗi</h2>
          <p>Lỗi: {this.state.error?.message || "Unknown error"}</p>
          <Button
            type="primary"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Tải lại trang
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ================= Main Component ==================
function ScheduleTestDrive() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <NavigationBar collapsed={collapsed} onCollapse={setCollapsed} />

      <div
        className="flex-1 transition-all duration-200"
        style={{ marginLeft: collapsed ? 64 : 280 }}
      >
        <PageContainer
          header={{
            title: "Lịch Hẹn Lái Thử",
            subTitle: "Quản lý và tạo lịch hẹn lái thử xe cho khách hàng",
            breadcrumb: {
              items: [
                { title: "Trang chủ" },
                { title: "Admin" },
                { title: "Lịch hẹn lái thử" },
              ],
            },
          }}
          className="p-6"
        >
          {/* Quick Action Buttons */}
          <Card
            className="mb-4"
            style={{
              background: "linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)",
              border: "none",
              borderRadius: "12px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Title
                level={4}
                style={{ margin: "8px 0 16px 0", color: "white" }}
              >
                🚗 Quản lý Lịch Hẹn Lái Thử
              </Title>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => setActiveTab("create-appointment")}
                  style={{
                    minWidth: "180px",
                    background: "#1890ff",
                    borderColor: "#1890ff",
                    fontWeight: "bold",
                  }}
                >
                  Tạo Lịch Hẹn Mới
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<SettingOutlined />}
                  onClick={() => setActiveTab("appointment-setting")}
                  style={{
                    minWidth: "180px",
                    background: "#52c41a",
                    borderColor: "#52c41a",
                    fontWeight: "bold",
                  }}
                >
                  Cài Đặt Lịch Hẹn
                </Button>
              </div>
            </div>
          </Card>

          <Divider />

          {/* Tabs content */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "overview",
                label: (
                  <span>
                    <DashboardOutlined /> Tổng quan
                  </span>
                ),
                children: (
                  <Alert
                    message="Tab Tổng quan"
                    description="Chức năng đang phát triển"
                    type="info"
                    showIcon
                  />
                ),
              },
              {
                key: "create-appointment",
                label: (
                  <span>
                    <CalendarOutlined /> Tạo Lịch Hẹn
                  </span>
                ),
                children: <CreateAppointment />,
              },
              {
                key: "appointment-setting",
                label: (
                  <span>
                    <SettingOutlined /> Cài Đặt Lịch Hẹn
                  </span>
                ),
                children: <CreateAppointmentSetting />,
              },
            ]}
          />
        </PageContainer>
      </div>
    </div>
  );
}

// ✅ Export kèm ErrorBoundary
function ScheduleTestDriveWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <ScheduleTestDrive />
    </ErrorBoundary>
  );
}

export default ScheduleTestDriveWithErrorBoundary;
