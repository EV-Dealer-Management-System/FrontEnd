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
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);

  // Load templates khi vào tab overview
  useEffect(() => {
    if (activeTab === "overview") {
      loadAllTemplates();
    }
  }, [activeTab]);

  const loadAllTemplates = async () => {
    try {
      setLoading(true);
      const result = await vehicleApi.getAllTemplateVehicles();

      console.log("📥 Template API Response:", result);

      if (result.success) {
        const templatesData = result.data || [];
        console.log(" Loaded templates:", templatesData);
        setTemplates(templatesData);

        if (templatesData.length === 0) {
          message.info("Chưa có template nào.");
        }
      } else {
        message.error(result.error || "Không thể tải danh sách templates!");
        setTemplates([]);
      }
    } catch (error) {
      console.error(" Error loading templates:", error);
      message.error("Lỗi khi tải danh sách templates!");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy status text và color
  const getStatusConfig = (isActive) => {
    const status = isActive === true || isActive === 1;
    return {
      text: status ? "Hoạt động" : "Không hoạt động",
      color: status ? "success" : "error",
    };
  };

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
                  <div className="w-full">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <Title level={4} className="m-0">
                          <CarOutlined className="mr-2 text-blue-500" />
                           Tổng quan xe điện
                        </Title>
                        <Text type="secondary">
                          Danh sách tất cả các template xe điện có sẵn
                        </Text>
                      </div>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={loadAllTemplates}
                        loading={loading}
                        size="large"
                      >
                        Tải lại
                      </Button>
                    </div>

                    {/* Loading State */}
                    {loading && (
                      <div className="text-center py-20">
                        <Spin size="large" tip="Đang tải danh sách templates..." />
                      </div>
                    )}

                    {/* Empty State */}
                    {!loading && templates.length === 0 && (
                      <Card className="text-center py-20">
                        <div className="text-center">
                          <Text type="secondary">Chưa có template nào</Text>
                        </div>
                      </Card>
                    )}

                    {/* Template Grid */}
                    {!loading && templates.length > 0 && (
                      <>
                        <div className="mb-4">
                          <Text strong className="text-lg">
                            Tổng số: {templates.length} templates
                          </Text>
                        </div>

                        <Row gutter={[24, 24]}>
                          {templates.map((template) => {
                            // ✅ ĐÚNG: Lấy đúng như trong CreateTemplateVehicle
                            const version = template.version || {};
                            const color = template.color || {};
                            
                            console.log("Template data:", template);
                            console.log("Version:", version);
                            console.log("Color data:", color);
                            console.log("Color hex:", color.hexCode, color.colorCode);

                            const statusConfig = getStatusConfig(template.isActive);

                            const firstImage =
                              Array.isArray(template.imgUrl) && template.imgUrl.length > 0
                                ? template.imgUrl[0]
                                : "https://via.placeholder.com/400x300?text=No+Image";

                            return (
                              <Col xs={24} sm={12} lg={8} xl={6} key={template.id}>
                                <Card
                                  hoverable
                                  className="h-full shadow-md hover:shadow-xl transition-shadow"
                                  cover={
                                    <div className="relative">
                                      <Image
                                        src={firstImage}
                                        alt={template.name || "Template"}
                                        height={200}
                                        className="object-cover w-full"
                                        preview={{
                                          mask: "Xem ảnh",
                                        }}
                                        fallback="https://via.placeholder.com/400x300?text=Error"
                                      />
                                      <div className="absolute top-2 right-2">
                                        <Badge
                                          status={statusConfig.color}
                                          text={
                                            <Text
                                              strong
                                              className="bg-white px-2 py-1 rounded shadow"
                                            >
                                              {statusConfig.text}
                                            </Text>
                                          }
                                        />
                                      </div>
                                    </div>
                                  }
                                >
                                  {/* Model / Version */}
                                  <div className="mb-3">
                                    <Text strong className="text-lg block mb-1">
                                      {version.versionName || "N/A"}
                                    </Text>
                                    <Text type="secondary" className="text-sm">
                                      {version.modelName || "N/A"}
                                    </Text>
                                  </div>

                                  <Divider className="my-3" />

                                  {/* Giá bán */}
                                  <div className="mb-3">
                                    <Space>
                                      <span className="text-green-600"> Giá bán:  </span>
                                      <Text strong className="text-green-600 text-lg">
                                        {template.price
                                          ? template.price.toLocaleString("vi-VN") + " ₫"
                                          : "Liên hệ"}
                                      </Text>
                                    </Space>
                                  </div>

                                  {/* Màu sắc */}
                                  <div className="mb-3">
                                    <Space align="center">
                                      <BgColorsOutlined className="text-blue-500" />
                                      <Text strong>Màu:</Text>
                                      <Space size={4}>
                                        <div
                                          className="inline-block w-5 h-5 rounded-full border-2 border-gray-300"
                                          style={{
                                            backgroundColor:
                                              color.colorCode || color.hexCode || "#ccc",
                                          }}
                                          title={color.colorName || "N/A"}
                                        />
                                        <Text>{color.colorName || "N/A"}</Text>
                                      </Space>
                                    </Space>
                                  </div>

                                  {/* Mô tả */}
                                  {template.description && (
                                    <div className="mb-2">
                                      <Space align="start">
                                        <span className="text-gray-500 mt-1">ℹ️</span>
                                        <div>
                                          <Text strong className="block mb-1">
                                            Mô tả:
                                          </Text>
                                          <Text
                                            className="text-sm text-gray-600 mb-0"
                                            style={{
                                              display: '-webkit-box',
                                              WebkitLineClamp: 2,
                                              WebkitBoxOrient: 'vertical',
                                              overflow: 'hidden'
                                            }}
                                          >
                                            {template.description}
                                          </Text>
                                        </div>
                                      </Space>
                                    </div>
                                  )}

                             
                                </Card>
                              </Col>
                            );
                          })}
                        </Row>
                      </>
                    )}
                  </div>
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
