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
} from "@ant-design/icons";
import NavigationBar from "../../../Components/Admin/Components/NavigationBar";
import CreateVehicleWizard from "./Components/CreateVehicleWizard";
import Managemodel from "./Components/Managemodel";
import { vehicleApi } from "../../../App/EVMAdmin/VehiclesManagement/Vehicles";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

function VehicleManagement() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form] = Form.useForm();

  // API state management
  const [vehicles, setVehicles] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadVehicles();
    loadModels();
  }, []);

  // Load vehicles from API
  const loadVehicles = async () => {
    setTableLoading(true);
    try {
      const result = await vehicleApi.getAllVehicles();
      if (result.success) {
        setVehicles(result.data);
        if (result.fallback) {
          message.info("API không khả dụng, đang sử dụng dữ liệu mẫu", 3);
        } else {
          message.success("Tải danh sách xe thành công", 2);
        }
      } else {
        message.error(result.error);
        // Fallback to mock data if API fails
        setVehicles(getMockVehicles());
      }
    } catch (error) {
      console.error("Error loading vehicles:", error);
      message.error("Không thể tải danh sách xe");
      // Fallback to mock data
      setVehicles(getMockVehicles());
    } finally {
      setTableLoading(false);
    }
  };

  // Load models from API
  const loadModels = async () => {
    try {
      const result = await vehicleApi.getAllModels();
      if (result.success) {
        setModels(result.data);
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error("Error loading models:", error);
    }
  };

  // Mock data fallback
  const getMockVehicles = () => [
    {
      key: "1",
      id: "VF001",
      name: "VinFast VF8",
      category: "SUV Điện",
      price: 1200000000,
      batteryCapacity: 82,
      range: 420,
      seats: 7,
      color: ["Đỏ", "Trắng", "Đen", "Xanh"],
      stock: 150,
      status: "active",
      image: "https://picsum.photos/300/200?random=1",
      description: "SUV điện cao cấp với công nghệ tiên tiến",
      manufacturer: "VinFast",
      year: 2024,
    },
    {
      key: "2",
      id: "VF002",
      name: "VinFast VF9",
      category: "SUV Điện",
      price: 1500000000,
      batteryCapacity: 92,
      range: 450,
      seats: 7,
      color: ["Đỏ", "Trắng", "Đen"],
      stock: 120,
      status: "active",
      image: "https://picsum.photos/300/200?random=2",
      description: "SUV điện hạng sang với không gian rộng rãi",
      manufacturer: "VinFast",
      year: 2024,
    },
    {
      key: "3",
      id: "VF003",
      name: "VinFast VF5",
      category: "Hatchback Điện",
      price: 800000000,
      batteryCapacity: 50,
      range: 300,
      seats: 5,
      color: ["Trắng", "Đen", "Xanh"],
      stock: 200,
      status: "coming_soon",
      image: "https://picsum.photos/300/200?random=3",
      description: "Xe điện compact phù hợp đô thị",
      manufacturer: "VinFast",
      year: 2024,
    },
  ];

  // Tính toán thống kê
  const totalVehicles = vehicles.length;
  const totalStock = vehicles.reduce((sum, item) => sum + (item.stock || 0), 0);
  const categories = [...new Set(vehicles.map((item) => item.category))];
  const statuses = [...new Set(vehicles.map((item) => item.status))];

  // Lọc dữ liệu
  const filteredData = useMemo(() => {
    return vehicles.filter((item) => {
      const matchSearch =
        item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.id?.toLowerCase().includes(searchText.toLowerCase());
      const matchCategory =
        filterCategory === "all" || item.category === filterCategory;
      const matchStatus =
        filterStatus === "all" || item.status === filterStatus;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [vehicles, searchText, filterCategory, filterStatus]);

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

  // Cấu hình cột bảng
  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (image, record) => (
        <Image
          src={
            image ||
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjAiLz4KPHN2ZyB4PSIyMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOTk5Ij4KPHN2ZyBmaWxsPSIjOTk5IiB2aWV3Qm94PSIwIDAgMjQgMjQiPgogIDxwYXRoIGQ9Ik05IDNIMTVWNUg5VjNaTTkgOEgxMFYxNkg5VjhaTTggNUM4IDQuNDQ3NzIgOC40NDc3MiA0IDkgNEgxNUM5IDUuMzMzMzMgMTAgNS4zMzMzMyAxMSA1VjhIMTEgVjE2SDEwVjE5SDlWMTZIOVY4SDhWNVoiLz4KICA8L3N2Zz4KICA8L3N2Zz4KICA8dGV4dCB4PSIzMCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmaWxsPSIjOTk5Ij5JbWFnZTwvdGV4dD4KPC9zdmc+"
          }
          alt={record.name}
          width={60}
          height={40}
          style={{ borderRadius: 4, objectFit: "cover" }}
          preview={false}
          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjAiLz4KPHN2ZyB4PSIyMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOTk5Ij4KPHBhdGggZD0iTTkgM0gxNVY1SDlWM1pNOSA4SDEwVjE2SDlWOFpNOCA1QzggNC40NDc3MiA4LjQ0NzcyIDQgOSA0SDE1QzkgNS4zMzMzMyAxMCA1LjMzMzMzIDExIDVWOEgxMSBWMTZIMTBWMTlIOVYxNkg5VjhIOFY1WiIvPgo8L3N2Zz4KPHR2ZyB4PSIzMCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmaWxsPSIjOTk5Ij5JbWFnZTwvdGV4dD4KPC9zdmc+"
        />
      ),
    },
    {
      title: "Mã xe",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (text) => (
        <Text copyable strong style={{ color: "#1890ff" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Tên xe",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.manufacturer} • {record.year}
          </Text>
        </div>
      ),
    },
    {
      title: "Phân loại",
      dataIndex: "category",
      key: "category",
      render: (category) => {
        const colorMap = {
          "SUV Điện": "blue",
          "Sedan Điện": "green",
          "Hatchback Điện": "orange",
        };
        return <Tag color={colorMap[category]}>{category}</Tag>;
      },
    },
    {
      title: "Giá (VND)",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      render: (price) => (
        <Text strong style={{ color: "#52c41a" }}>
          {vehicleApi.formatPrice(price)}
        </Text>
      ),
    },
    {
      title: "Thông số",
      key: "specs",
      render: (_, record) => (
        <div>
          <div style={{ fontSize: "12px" }}>
            <ThunderboltOutlined /> {record.batteryCapacity} kWh
          </div>
          <div style={{ fontSize: "12px" }}>
            <CarOutlined /> {record.range} km
          </div>
          <div style={{ fontSize: "12px" }}>{record.seats} chỗ ngồi</div>
        </div>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
      sorter: (a, b) => a.stock - b.stock,
      render: (stock) => (
        <Badge
          count={stock}
          style={{
            backgroundColor: stock < 100 ? "#ff4d4f" : "#52c41a",
          }}
        />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = vehicleApi.formatVehicleStatus(status);
        return <Badge status={statusConfig.color} text={statusConfig.text} />;
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
                            title="Tổng tồn kho"
                            value={totalStock}
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
                            value={filterCategory}
                            onChange={setFilterCategory}
                            style={{ width: "100%" }}
                            placeholder="Loại xe"
                          >
                            <Option value="all">Tất cả loại</Option>
                            {categories.map((cat) => (
                              <Option key={cat} value={cat}>
                                {cat}
                              </Option>
                            ))}
                          </Select>
                        </Col>
                        <Col xs={24} sm={8} md={4}>
                          <Select
                            value={filterStatus}
                            onChange={setFilterStatus}
                            style={{ width: "100%" }}
                            placeholder="Trạng thái"
                          >
                            <Option value="all">Tất cả</Option>
                            {statuses.map((status) => (
                              <Option key={status} value={status}>
                                {status}
                              </Option>
                            ))}
                          </Select>
                        </Col>
                        <Col xs={24} sm={24} md={10}>
                          <Space>
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={() => setIsModalVisible(true)}
                            >
                              Thêm xe mới
                            </Button>
                            <Button icon={<ExportOutlined />}>
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
                key: "create-wizard",
                label: (
                  <span>
                    <PlusOutlined />
                    Tạo xe mới (Wizard)
                  </span>
                ),
                children: <CreateVehicleWizard />,
              },
              {
                key: "manage-models",
                label: (
                  <span>
                    <SettingOutlined />
                    Quản lý Model
                  </span>
                ),
                children: <Managemodel />,
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

export default VehicleManagement;
