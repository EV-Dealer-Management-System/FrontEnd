import React, { useState, useMemo, useEffect } from "react";
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
} from "@ant-design/icons";
import NavigationBar from "../../../Components/Admin/Components/NavigationBar";
// import CreateVehicleWizard from "./Components/CreateVehicleWizard";
// import ManageModel from "./Components/ModelManagement";
// import ManageVersion from "./Components/VersionManagement";
// import ManageColor from "./Components/ColorManagementSimple";
import CreateElectricVehicle from "./Components/CreateElectricVehicle";
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
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form] = Form.useForm();

  // API state management with safe defaults
  const [vehicles, setVehicles] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial data with error handling
  useEffect(() => {
    try {
      console.log("🚀 Initializing VehicleManagement component...");
      loadVehicles();
      loadModels();
    } catch (error) {
      console.error("❌ Error in useEffect:", error);
      setError(error.message || "Error initializing component");
    }
  }, []);

  // Load vehicles from API with enhanced error handling
  const loadVehicles = async () => {
    setTableLoading(true);
    setError(null);
    try {
      console.log("🔄 Loading vehicles...");
      const result = await vehicleApi.getAllVehicles();

      if (result && result.success) {
        console.log(
          "✅ Vehicles loaded successfully:",
          result.data?.length || 0,
          "vehicles"
        );
        setVehicles(Array.isArray(result.data) ? result.data : []);

        if (result.fallback) {
          message.info("API không khả dụng, đang sử dụng dữ liệu mẫu", 3);
        } else {
          message.success("Tải danh sách xe thành công", 2);
        }
      } else {
        console.warn("⚠️ API result not successful:", result);
        message.error(result?.error || "Không thể tải danh sách xe");
        // Fallback to mock data if API fails
        setVehicles(getMockVehicles());
      }
    } catch (error) {
      console.error("❌ Error loading vehicles:", error);
      setError(error.message || "Unknown error");
      message.error(
        "Lỗi khi tải danh sách xe: " + (error.message || "Unknown error")
      );
      // Fallback to mock data
      setVehicles(getMockVehicles());
    } finally {
      setTableLoading(false);
    }
  };

  // Load models from API with error handling
  const loadModels = async () => {
    try {
      console.log("🔄 Loading models...");
      const result = await vehicleApi.getAllModels();
      if (result && result.success) {
        console.log("✅ Models loaded successfully");
        setModels(Array.isArray(result.data) ? result.data : []);
      } else {
        console.warn("⚠️ Models API result not successful:", result);
        setModels([]);
      }
    } catch (error) {
      console.error("❌ Error loading models:", error);
      setModels([]);
      // Don't show error message for models as it's not critical
    }
  };

  // Mock data fallback - structure giống API response
  const getMockVehicles = () => [
    {
      id: "01994f39-7894-78bc-a1ed-c88f87499078",
      warehouseId: "01994f2c-5ff2-7177-8fde-475270081264",
      versionId: "01994f2d-1c4f-7759-8429-475270081264",
      colorId: "01994f2d-1cff-7b50-9e88-3bf32018f2fc",
      vin: "VF001MOCK001",
      status: 1,
      manufactureDate: "2025-09-28T10:00Z",
      importDate: "2025-09-29T10:00Z",
      warrantyExpiryDate: "2027-09-28T10:00Z",
      costPrice: 1200000000,
      imageUrl: null,
      // Extended info for display
      versionName: "EV-A1 Standard",
      colorName: "Đỏ Ruby",
      warehouseName: "Kho Hà Nội",
    },
    {
      id: "01994f39-7113-71f7-af50-3e38f6e48c95",
      warehouseId: "01994f2c-5ff2-7977-8f76-a95188b341c5",
      versionId: "01994f2d-1c4f-7759-8429-475270081264",
      colorId: "01994f2d-1cff-7b50-9e88-3bf32018f2fc",
      vin: "VF002MOCK002",
      status: 1,
      manufactureDate: "2025-09-27T10:00Z",
      importDate: "2025-09-28T10:00Z",
      warrantyExpiryDate: "2027-09-27T10:00Z",
      costPrice: 1500000000,
      imageUrl: null,
      // Extended info for display
      versionName: "EV-A1 Premium",
      colorName: "Trắng Ngọc Trai",
      warehouseName: "Kho TP.HCM",
    },
    {
      id: "01994f39-mock-71f7-af50-sample003",
      warehouseId: "01994f2c-mock-7977-8f76-warehouse3",
      versionId: "01994f2d-mock-7759-8429-version003",
      colorId: "01994f2d-mock-7b50-9e88-color003",
      vin: "VF003MOCK003",
      status: 0,
      manufactureDate: "2025-09-26T10:00Z",
      importDate: "2025-09-27T10:00Z",
      warrantyExpiryDate: "2027-09-26T10:00Z",
      costPrice: 800000000,
      imageUrl: null,
      // Extended info for display
      versionName: "EV-A1 Lite",
      colorName: "Xanh Đại Dương",
      warehouseName: "Kho Đà Nẵng",
    },
  ];

  // Tính toán thống kê theo API response structure (với safe check)
  const totalVehicles = vehicles?.length || 0;
  const activeVehicles = vehicles?.filter((v) => v.status === 1)?.length || 0;
  const totalCostValue =
    vehicles?.reduce((sum, item) => sum + (item.costPrice || 0), 0) || 0;
  const statuses = vehicles?.length
    ? [...new Set(vehicles.map((item) => item.status))]
    : [];

  // Lọc dữ liệu theo structure mới (với safe check)
  const filteredData = useMemo(() => {
    if (!vehicles || !Array.isArray(vehicles)) {
      return [];
    }

    return vehicles.filter((item) => {
      const matchSearch =
        item.vin?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.id?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.versionName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.colorName?.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus =
        filterStatus === "all" || item.status?.toString() === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [vehicles, searchText, filterStatus]);

  // Xử lý thêm/sửa xe
  const handleAddOrEditVehicle = async (values) => {
    setLoading(true);
    try {
      let result;
      if (editingRecord) {
        // Cập nhật xe
        result = await vehicleApi.updateVehicle(editingRecord.id, values);
      } else {
        // Thêm xe mới
        result = await vehicleApi.createVehicle(values);
      }

      if (result.success) {
        message.success(result.message);
        setIsModalVisible(false);
        setEditingRecord(null);
        form.resetFields();
        await loadVehicles(); // Reload data
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error("Error saving vehicle:", error);
      message.error("Không thể lưu thông tin xe");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa xe
  const handleDelete = async (record) => {
    setLoading(true);
    try {
      const result = await vehicleApi.deleteVehicle(record.id);
      if (result.success) {
        message.success(result.message);
        await loadVehicles(); // Reload data
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      message.error("Không thể xóa xe");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý sửa xe
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // Xử lý xem chi tiết
  const handleView = (record) => {
    setSelectedRecord(record);
    setIsViewModalVisible(true);
  };

  // Cấu hình cột bảng theo API response thực tế
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "VIN",
      dataIndex: "vin",
      key: "vin",
      width: 150,
      render: (text) => (
        <Text copyable strong style={{ color: "#1890ff", fontSize: "12px" }}>
          {text || "N/A"}
        </Text>
      ),
    },
    {
      title: "Version",
      dataIndex: "versionId",
      key: "version",
      width: 120,
      render: (versionId, record) => {
        // Hiển thị version name hoặc rút gọn versionId
        const displayText =
          record.versionName ||
          (versionId ? versionId.substring(0, 8) + "..." : "N/A");
        return (
          <Tag color="blue" title={versionId}>
            {displayText}
          </Tag>
        );
      },
    },
    {
      title: "Màu sắc",
      dataIndex: "colorId",
      key: "color",
      width: 100,
      render: (colorId, record) => {
        const displayText =
          record.colorName ||
          (colorId ? colorId.substring(0, 8) + "..." : "N/A");
        return (
          <Tag color="purple" title={colorId}>
            {displayText}
          </Tag>
        );
      },
    },
    {
      title: "Kho",
      dataIndex: "warehouseId",
      key: "warehouse",
      width: 100,
      render: (warehouseId, record) => {
        const displayText =
          record.warehouseName ||
          (warehouseId ? warehouseId.substring(0, 8) + "..." : "N/A");
        return (
          <Tag color="orange" title={warehouseId}>
            {displayText}
          </Tag>
        );
      },
    },
    {
      title: "Giá cost",
      dataIndex: "costPrice",
      key: "costPrice",
      width: 120,
      sorter: (a, b) => (a.costPrice || 0) - (b.costPrice || 0),
      render: (price) => (
        <Text strong style={{ color: "#52c41a" }}>
          {price ? `${price.toLocaleString("vi-VN")} ₫` : "N/A"}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusMap = {
          1: { color: "success", text: "Đang hoạt động" },
          0: { color: "error", text: "Không hoạt động" },
        };
        const config = statusMap[status] || {
          color: "default",
          text: "Không xác định",
        };
        return <Badge status={config.color} text={config.text} />;
      },
    },
    {
      title: "Ngày sản xuất",
      dataIndex: "manufactureDate",
      key: "manufactureDate",
      width: 120,
      render: (date) => {
        if (!date) return "N/A";
        try {
          return new Date(date).toLocaleDateString("vi-VN");
        } catch {
          return "N/A";
        }
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc muốn xóa xe này?"
              onConfirm={() => handleDelete(record)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="text" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Error boundary fallback
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <NavigationBar collapsed={collapsed} onCollapse={setCollapsed} />
        <div
          className="flex-1 transition-all duration-200"
          style={{
            marginLeft: collapsed ? 64 : 280,
            minHeight: "100vh",
          }}
        >
          <PageContainer
            header={{
              title: "Lỗi hệ thống",
              subTitle: "Đã xảy ra lỗi trong quá trình tải dữ liệu",
            }}
          >
            <Card>
              <div style={{ textAlign: "center", padding: "50px" }}>
                <h3>❌ Đã xảy ra lỗi</h3>
                <p>Lỗi: {error}</p>
                <Button
                  type="primary"
                  onClick={() => {
                    setError(null);
                    loadVehicles();
                  }}
                >
                  Thử lại
                </Button>
              </div>
            </Card>
          </PageContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <NavigationBar collapsed={collapsed} onCollapse={setCollapsed} />

      {/* Main Content */}
      <div
        className="flex-1 transition-all duration-200"
        style={{
          marginLeft: collapsed ? 64 : 280,
          minHeight: "100vh",
        }}
      >
        <PageContainer
          header={{
            title: "Quản lý xe điện",
            subTitle: "Quản lý danh sách và thông tin các mẫu xe điện",
            breadcrumb: {
              items: [
                { title: "Trang chủ" },
                { title: "Admin" },
                { title: "Quản lý xe điện" },
              ],
            },
          }}
          className="p-6"
        >
          {/* Quick Action Buttons */}
          <Card
            className="mb-4"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "12px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Title
                level={4}
                style={{ margin: "8px 0 16px 0", color: "white" }}
              >
                ⚡ Quản lý Hệ thống Xe Điện
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
                  icon={<ThunderboltOutlined />}
                  onClick={() => setActiveTab("create-vehicle")}
                  style={{
                    minWidth: "160px",
                    background: "#52c41a",
                    borderColor: "#52c41a",
                    fontWeight: "bold",
                  }}
                >
                  Tạo Xe Điện
                </Button>
                <Button
                  size="large"
                  icon={<CarOutlined />}
                  onClick={() => setActiveTab("manage-models")}
                  style={{
                    minWidth: "160px",
                    background: "rgba(255,255,255,0.9)",
                    borderColor: "white",
                    color: "#1890ff",
                    fontWeight: "500",
                  }}
                >
                  Quản lý Model
                </Button>
                <Button
                  size="large"
                  icon={<BuildOutlined />}
                  onClick={() => setActiveTab("manage-versions")}
                  style={{
                    minWidth: "160px",
                    background: "rgba(255,255,255,0.9)",
                    borderColor: "white",
                    color: "#722ed1",
                    fontWeight: "500",
                  }}
                >
                  Quản lý Version
                </Button>
                <Button
                  size="large"
                  icon={<BgColorsOutlined />}
                  onClick={() => setActiveTab("manage-colors")}
                  style={{
                    minWidth: "160px",
                    background: "rgba(255,255,255,0.9)",
                    borderColor: "white",
                    color: "#eb2f96",
                    fontWeight: "500",
                  }}
                >
                  Quản lý Màu sắc
                </Button>
              </div>
              <div
                style={{
                  marginTop: "12px",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                💡 Chọn chức năng để bắt đầu quản lý thông tin xe điện
              </div>
            </div>
          </Card>

          <Divider style={{ margin: "16px 0" }} />

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "overview",
                label: (
                  <span>
                    <DashboardOutlined />
                    Tổng quan
                  </span>
                ),
                children: (
                  <>
                    {/* Thông tin tổng quan */}
                    <Row gutter={[16, 16]} className="mb-6">
                      <Col xs={24} sm={12} lg={8}>
                        <Card className="text-center">
                          <Statistic
                            title="Số mẫu xe"
                            value={totalVehicles}
                            prefix={<CarOutlined className="text-blue-500" />}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={8}>
                        <Card className="text-center">
                          <Statistic
                            title="Xe hoạt động"
                            value={activeVehicles}
                            suffix=" xe"
                            prefix={
                              <DashboardOutlined className="text-green-500" />
                            }
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={8}>
                        <Card className="text-center">
                          <Statistic
                            title="Xe có sẵn"
                            value={filteredData.length}
                            suffix=" mẫu"
                            prefix={
                              <SettingOutlined className="text-orange-500" />
                            }
                          />
                        </Card>
                      </Col>
                    </Row>

                    {/* Filters and Search */}
                    <ProCard className="mb-6 shadow-sm">
                      <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={8} md={6}>
                          <Search
                            placeholder="Tìm kiếm xe..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            prefix={<SearchOutlined />}
                          />
                        </Col>
                        <Col xs={24} sm={8} md={4}>
                          <Select
                            value={filterStatus}
                            onChange={setFilterStatus}
                            style={{ width: "100%" }}
                            placeholder="Trạng thái"
                          >
                            <Option value="all">Tất cả trạng thái</Option>
                            <Option value="1">Hoạt động</Option>
                            <Option value="0">Không hoạt động</Option>
                          </Select>
                        </Col>
                        <Col xs={24} sm={24} md={10}>
                          <Space wrap>
                            <Button
                              type="primary"
                              icon={<ThunderboltOutlined />}
                              onClick={() => setActiveTab("create-vehicle")}
                              size="small"
                            >
                              Tạo Xe Điện
                            </Button>
                            <Button
                              icon={<CarOutlined />}
                              onClick={() => setActiveTab("manage-models")}
                              size="small"
                            >
                              Model
                            </Button>
                            <Button
                              icon={<BuildOutlined />}
                              onClick={() => setActiveTab("manage-versions")}
                              size="small"
                            >
                              Version
                            </Button>
                            <Button
                              icon={<BgColorsOutlined />}
                              onClick={() => setActiveTab("manage-colors")}
                              size="small"
                            >
                              Màu sắc
                            </Button>
                            <Button icon={<ExportOutlined />} size="small">
                              Xuất Excel
                            </Button>
                          </Space>
                        </Col>
                      </Row>
                    </ProCard>

                    {/* Vehicle Table */}
                    <Card>
                      <Table
                        columns={columns}
                        dataSource={filteredData}
                        loading={tableLoading}
                        scroll={{ x: "max-content" }}
                        pagination={{
                          total: filteredData.length,
                          pageSize: 10,
                          showSizeChanger: true,
                          showQuickJumper: true,
                          showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} xe`,
                        }}
                      />
                    </Card>
                  </>
                ),
              },
              {
                key: "create-vehicle",
                label: (
                  <span>
                    <PlusOutlined />
                    Tạo Xe Điện
                  </span>
                ),
                children: <CreateElectricVehicle />,
              },
              {
                key: "debug",
                label: (
                  <span>
                    <ThunderboltOutlined />
                    Debug Info
                  </span>
                ),
                children: (
                  <Card>
                    <div style={{ padding: "20px" }}>
                      <h3>🧪 Vehicle Management Debug</h3>
                      <p>Total vehicles: {vehicles.length}</p>
                      <p>Active vehicles: {activeVehicles}</p>
                      <p>
                        Total cost value:{" "}
                        {totalCostValue?.toLocaleString("vi-VN")} ₫
                      </p>

                      <div style={{ marginTop: "20px" }}>
                        <h4>Raw Vehicle Data:</h4>
                        <pre
                          style={{
                            background: "#f5f5f5",
                            padding: "10px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            maxHeight: "300px",
                            overflow: "auto",
                          }}
                        >
                          {JSON.stringify(vehicles, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </Card>
                ),
              },
            ]}
          />

          {/* Add/Edit Modal */}
          <Modal
            title={editingRecord ? "Chỉnh sửa xe điện" : "Thêm xe điện mới"}
            open={isModalVisible}
            onCancel={() => {
              setIsModalVisible(false);
              setEditingRecord(null);
              form.resetFields();
            }}
            width={800}
            footer={null}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleAddOrEditVehicle}
              className="mt-4"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Mã xe"
                    name="id"
                    rules={[
                      { required: true, message: "Vui lòng nhập mã xe!" },
                    ]}
                  >
                    <Input placeholder="VD: VF001" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Tên xe"
                    name="name"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên xe!" },
                    ]}
                  >
                    <Input placeholder="VD: VinFast VF8" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Phân loại"
                    name="category"
                    rules={[
                      { required: true, message: "Vui lòng chọn phân loại!" },
                    ]}
                  >
                    <Select placeholder="Chọn phân loại">
                      <Option value="SUV Điện">SUV Điện</Option>
                      <Option value="Sedan Điện">Sedan Điện</Option>
                      <Option value="Hatchback Điện">Hatchback Điện</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Giá (VND)"
                    name="price"
                    rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      placeholder="VD: 1200000000"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Dung lượng pin (kWh)"
                    name="batteryCapacity"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập dung lượng pin!",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      placeholder="VD: 82"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Quãng đường (km)"
                    name="range"
                    rules={[
                      { required: true, message: "Vui lòng nhập quãng đường!" },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      placeholder="VD: 420"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Số chỗ ngồi"
                    name="seats"
                    rules={[
                      { required: true, message: "Vui lòng nhập số chỗ ngồi!" },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={2}
                      max={9}
                      placeholder="VD: 7"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Tồn kho"
                    name="stock"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số lượng tồn kho!",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      placeholder="VD: 150"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Trạng thái"
                    name="status"
                    rules={[
                      { required: true, message: "Vui lòng chọn trạng thái!" },
                    ]}
                  >
                    <Select placeholder="Chọn trạng thái">
                      <Option value="Đang bán">Đang bán</Option>
                      <Option value="Ngừng bán">Ngừng bán</Option>
                      <Option value="Sắp ra mắt">Sắp ra mắt</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Mô tả" name="description">
                <Input.TextArea rows={3} placeholder="Mô tả về xe điện..." />
              </Form.Item>

              <Form.Item>
                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                  <Button
                    onClick={() => {
                      setIsModalVisible(false);
                      setEditingRecord(null);
                      form.resetFields();
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit">
                    {editingRecord ? "Cập nhật" : "Thêm mới"}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>

          {/* View Details Modal */}
          <Modal
            title="Chi tiết xe điện"
            open={isViewModalVisible}
            onCancel={() => setIsViewModalVisible(false)}
            width={600}
            footer={[
              <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                Đóng
              </Button>,
            ]}
          >
            {selectedRecord && (
              <div>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Image
                      src={
                        selectedRecord.image ||
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjAiLz4KPHN2ZyB4PSIxNDAiIHk9IjkwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzk5OSI+Cjxwb2x5Z29uIHBvaW50cz0iMTIsMiBsMCwyMjQgMjQsMyAiIC8+CjxsaW5lIHgxPSIxMiIgeTE9IjEyIiB4Mj0iMTIiIHkyPSIxNiIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8L3N2Zz4KPHR2ZyB4PSIxNTAiIHk9IjEzMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5Ij5Lw7RuZyBjw7MgaOG7ueG7oCBhbmg8L3RleHQ+Cjwvc3ZnPg=="
                      }
                      alt={selectedRecord.name}
                      style={{ width: "100%", borderRadius: 8 }}
                      preview={false}
                      fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjAiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTAwIiByPSIyMCIgZmlsbD0iIzk5OSIvPgo8dGV4dCB4PSIxNTAiIHk9IjEzMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Lw7RuZyBjw7MgaOG7ueG7oCBhbmg8L3RleHQ+Cjwvc3ZnPg=="
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Title level={4}>{selectedRecord.name}</Title>
                    <Text strong>Mã xe: </Text>
                    <Text copyable>{selectedRecord.id}</Text>
                    <br />
                    <Text strong>Phân loại: </Text>
                    <Tag color="blue">{selectedRecord.category}</Tag>
                    <br />
                    <Text strong>Giá: </Text>
                    <Text
                      style={{
                        color: "#52c41a",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      {selectedRecord.price?.toLocaleString()} VND
                    </Text>
                  </Col>
                </Row>

                <Divider />

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Title level={5}>Thông số kỹ thuật</Title>
                    <div>
                      <Text strong>Dung lượng pin: </Text>
                      <Text>{selectedRecord.batteryCapacity} kWh</Text>
                    </div>
                    <div>
                      <Text strong>Quãng đường: </Text>
                      <Text>{selectedRecord.range} km</Text>
                    </div>
                    <div>
                      <Text strong>Số chỗ ngồi: </Text>
                      <Text>{selectedRecord.seats} chỗ</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Title level={5}>Tình trạng kho</Title>
                    <div>
                      <Text strong>Tồn kho: </Text>
                      <Text
                        style={{
                          color:
                            selectedRecord.stock < 100 ? "#ff4d4f" : "#52c41a",
                        }}
                      >
                        {selectedRecord.stock} xe
                      </Text>
                    </div>
                  </Col>
                </Row>

                <Divider />

                <Title level={5}>Mô tả</Title>
                <Text>{selectedRecord.description}</Text>
              </div>
            )}
          </Modal>
        </PageContainer>
      </div>
    </div>
  );
}

// Wrap với Error Boundary
function VehicleManagementWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <VehicleManagement />
    </ErrorBoundary>
  );
}

export default VehicleManagementWithErrorBoundary;
