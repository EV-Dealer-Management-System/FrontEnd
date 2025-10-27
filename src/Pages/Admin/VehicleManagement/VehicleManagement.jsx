import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Image,
  Typography,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  Modal,
  Form,
  Upload,
  InputNumber,
  message,
  Popconfirm,
  Tooltip,
  Badge,
  Divider,
  Tabs,
  Spin,
  Alert,
} from "antd";
import {
  PageContainer,
  ProCard,
  StatisticCard,
} from "@ant-design/pro-components";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  CarOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  SettingOutlined,
  ExportOutlined,
  FilterOutlined,
  BgColorsOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import NavigationBar from "../../../Components/Admin/Components/NavigationBar";
import ManageModel from "./Components/ModelManagement";
import ManageVersion from "./Components/VersionManagement";
import ColorManagement from "./Components/ColorManagementSimple";
import CreateTemplateVehicle from "./Components/CreateTemplateVehicle";
import { vehicleApi } from "../../../App/EVMAdmin/VehiclesManagement/Vehicles";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// Error Boundary Component
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

function VehicleManagement() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <NavigationBar collapsed={collapsed} onCollapse={setCollapsed} />

      <div className="flex-1 transition-all duration-200" style={{ marginLeft: collapsed ? 64 : 280 }}>
        <PageContainer
          header={{
            title: "Quản lý xe điện",
            subTitle: "Quản lý danh sách và thông tin các mẫu xe điện",
            breadcrumb: {
              items: [{ title: "Trang chủ" }, { title: "Admin" }, { title: "Quản lý xe điện" }],
            },
          }}
          className="p-6"
        >
          {/* Quick Action Buttons */}
          <Card className="mb-4" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none", borderRadius: "12px" }}>
            <div style={{ textAlign: "center" }}>
              <Title level={4} style={{ margin: "8px 0 16px 0", color: "white" }}>
                ⚡ Quản lý Hệ thống Xe Điện
              </Title>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setActiveTab("create-template")} style={{ minWidth: "160px", background: "#1890ff", borderColor: "#1890ff", fontWeight: "bold" }}>
                  Tạo Mẫu Xe Template
                </Button>
                <Button size="large" icon={<CarOutlined />} onClick={() => setActiveTab("manage-models")} style={{ minWidth: "160px", background: "rgba(255,255,255,0.9)", borderColor: "white", color: "#1890ff", fontWeight: "500" }}>
                  Quản lý Model
                </Button>
                <Button size="large" icon={<BuildOutlined />} onClick={() => setActiveTab("manage-versions")} style={{ minWidth: "160px", background: "rgba(255,255,255,0.9)", borderColor: "white", color: "#722ed1", fontWeight: "500" }}>
                  Quản lý Version
                </Button>
                <Button size="large" icon={<BgColorsOutlined />} onClick={() => setActiveTab("manage-colors")} style={{ minWidth: "160px", background: "rgba(255,255,255,0.9)", borderColor: "white", color: "#eb2f96", fontWeight: "500" }}>
                  Quản lý Màu sắc
                </Button>
              </div>
            </div>
          </Card>

          <Divider />

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "overview",
                label: (<span><DashboardOutlined />Tổng quan</span>),
                children: (
                  <Alert message="Tab Tổng quan" description="Chức năng đang phát triển" type="info" showIcon />
                ),
              },
              {
                key: "create-template",
                label: (<span><PlusOutlined />Tạo Mẫu Xe Template</span>),
                children: <CreateTemplateVehicle />,
              },
              {
                key: "manage-models",
                label: (<span><CarOutlined />Quản lý Model</span>),
                children: <ManageModel />,
              },
              {
                key: "manage-versions",
                label: (<span><BuildOutlined />Quản lý Version</span>),
                children: <ManageVersion />,
              },
              {
                key: "manage-colors",
                label: (<span><BgColorsOutlined />Quản lý Màu sắc</span>),
                children: <ColorManagement />,
              },
            ]}
          />
        </PageContainer>
      </div>
    </div>
  );
}

// ✅ GIỮ NGUYÊN: ErrorBoundary
function VehicleManagementWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <VehicleManagement />
    </ErrorBoundary>
  );
}

export default VehicleManagementWithErrorBoundary;
