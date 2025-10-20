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
} from "@ant-design/icons";
import NavigationBar from "../../../Components/Admin/Components/NavigationBar";
import ManageModel from "./Components/ModelManagement";
import ManageVersion from "./Components/VersionManagement";
import ColorManagement from "./Components/ColorManagementSimple";
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

// Component tạo Template Vehicle
function CreateTemplateVehicleForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [templateData, setTemplateData] = useState(null);
  const [fileList, setFileList] = useState([]);

  // State cho dropdown data
  const [versions, setVersions] = useState([]);
  const [colors, setColors] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [loadingColors, setLoadingColors] = useState(false);

  // Load versions và colors khi component mount
  useEffect(() => {
    loadVersions();
    loadColors();
  }, []);

  const loadVersions = async () => {
    try {
      setLoadingVersions(true);
      const result = await vehicleApi.getAllVersions();
      if (result.success) {
        setVersions(result.data || []);
      } else {
        message.error("Không thể tải danh sách version: " + result.error);
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách version: " + error.message);
    } finally {
      setLoadingVersions(false);
    }
  };

  const loadColors = async () => {
    try {
      setLoadingColors(true);
      const result = await vehicleApi.getAllColors();
      if (result.success) {
        setColors(result.data || []);
      } else {
        message.error("Không thể tải danh sách màu: " + result.error);
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách màu: " + error.message);
    } finally {
      setLoadingColors(false);
    }
  };

  // Upload configuration
  const uploadProps = {
    name: "files",
    multiple: true,
    fileList,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error(`${file.name} không phải là file hình ảnh!`);
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error(`${file.name} phải nhỏ hơn 5MB!`);
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    onChange: (info) => {
      setFileList(info.fileList);
    },
    onRemove: (file) => {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
    },
  };

  // Upload attachments function
  const uploadAttachments = async (files) => {
    if (!files || files.length === 0) return [];

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file.originFileObj || file);
    });

    try {
      const response = await vehicleApi.uploadAttachments(formData);
      if (response.success) {
        return response.data.attachmentKeys || [];
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Lỗi upload hình ảnh: " + error.message);
      return [];
    }
  };

  // Handle form submission
  const handleCreateTemplate = async (values) => {
    try {
      setLoading(true);

      console.log("=== CREATE TEMPLATE VEHICLE DEBUG ===");
      console.log("📝 Form values:", values);

      // Upload attachments first
      let attachmentKeys = [];
      if (fileList.length > 0) {
        message.loading("Đang upload hình ảnh...", 0);
        attachmentKeys = await uploadAttachments(fileList);
        message.destroy();

        if (attachmentKeys.length === 0) {
          message.warning("Không có file nào được upload thành công!");
        } else {
          message.success(
            `Upload thành công ${attachmentKeys.length} hình ảnh!`
          );
        }
      }

      // Tìm thông tin version và color để hiển thị
      const selectedVersion = versions.find((v) => v.id === values.versionId);
      const selectedColor = colors.find((c) => c.id === values.colorId);

      // Prepare template data
      const templatePayload = {
        versionId: values.versionId,
        colorId: values.colorId,
        price: Number(values.price),
        description: values.description,
        attachmentKeys: attachmentKeys,
        isActive: true,
        // Thêm thông tin hiển thị
        versionName: selectedVersion?.name || "N/A",
        modelName: selectedVersion?.model?.name || "N/A",
        colorName: selectedColor?.name || "N/A",
        colorHex: selectedColor?.hexCode || "#ccc",
      };

      console.log("📤 Template payload:", templatePayload);
      setTemplateData(templatePayload);
      setConfirmModalVisible(true);
    } catch (error) {
      console.error("❌ Error preparing template data:", error);
      message.error("Có lỗi xảy ra khi chuẩn bị dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  // Confirm and submit template
  const confirmCreateTemplate = async () => {
    try {
      setLoading(true);
      setConfirmModalVisible(false);

      const result = await vehicleApi.createTemplateVehicle(templateData);

      if (result.success) {
        message.success(result.message || "Tạo mẫu xe thành công!");
        form.resetFields();
        setFileList([]);
      } else {
        message.error(result.message || "Có lỗi xảy ra khi tạo mẫu xe!");
      }
    } catch (error) {
      console.error("❌ Error creating template:", error);
      message.error("Có lỗi xảy ra khi tạo mẫu xe!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading} tip="Đang xử lý...">
      <Card
        title="Tạo mẫu xe điện"
        extra={
          <Alert
            message="Tạo template cho dòng xe, sau đó có thể tạo nhiều xe cụ thể từ template này"
            type="info"
            showIcon
            style={{ marginBottom: 0 }}
          />
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTemplate}
          size="large"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Chọn Version"
                name="versionId"
                rules={[{ required: true, message: "Vui lòng chọn version!" }]}
                extra="Chọn version từ danh sách có sẵn"
              >
                <Select
                  placeholder="Chọn version..."
                  loading={loadingVersions}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {versions.map((version) => (
                    <Option key={version.id} value={version.id}>
                      {version.name} - {version.model?.name || "N/A"}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Chọn Màu sắc"
                name="colorId"
                rules={[{ required: true, message: "Vui lòng chọn màu sắc!" }]}
                extra="Chọn màu sắc từ danh sách có sẵn"
              >
                <Select
                  placeholder="Chọn màu sắc..."
                  loading={loadingColors}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {colors.map((color) => (
                    <Option key={color.id} value={color.id}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            backgroundColor: color.hexCode || "#ccc",
                            borderRadius: "50%",
                            marginRight: 8,
                            border: "1px solid #d9d9d9",
                          }}
                        />
                        {color.name}
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Giá (VNĐ)"
                name="price"
                rules={[
                  { required: true, message: "Vui lòng nhập giá!" },
                  { type: "number", min: 0, message: "Giá phải lớn hơn 0!" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Nhập giá xe"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  min={0}
                  step={1000000}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label="Mô tả"
                name="description"
                rules={[
                  { required: true, message: "Vui lòng nhập mô tả!" },
                  { max: 1000, message: "Mô tả không được quá 1000 ký tự!" },
                ]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Nhập mô tả chi tiết về mẫu xe điện này..."
                  showCount
                  maxLength={1000}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label="Hình ảnh mẫu xe">
                <Upload.Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined
                      style={{ fontSize: 48, color: "#1890ff" }}
                    />
                  </p>
                  <p className="ant-upload-text">
                    Kéo thả hình ảnh vào đây hoặc click để chọn
                  </p>
                  <p className="ant-upload-hint">
                    Hỗ trợ upload nhiều file. Chỉ chấp nhận file hình ảnh (.jpg,
                    .png, .gif)
                    <br />
                    Kích thước file tối đa: 5MB
                  </p>
                </Upload.Dragger>

                {fileList.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Đã chọn {fileList.length} file:</Text>
                    <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                      {fileList.map((file) => (
                        <li key={file.uid} style={{ marginBottom: 4 }}>
                          <Text>{file.name}</Text>
                          <Text type="secondary" style={{ marginLeft: 8 }}>
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row justify="end" gutter={16}>
            <Col>
              <Button size="large" onClick={() => form.resetFields()}>
                Xóa form
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                icon={<CarOutlined />}
                loading={loading}
              >
                Tạo mẫu xe điện
              </Button>
            </Col>
          </Row>
        </Form>

        {/* Confirmation Modal */}
        <Modal
          title={
            <div style={{ textAlign: "center" }}>
              <CheckCircleOutlined
                style={{ color: "#52c41a", fontSize: 24, marginRight: 8 }}
              />
              Xác nhận tạo mẫu xe điện
            </div>
          }
          open={confirmModalVisible}
          onOk={confirmCreateTemplate}
          onCancel={() => setConfirmModalVisible(false)}
          okText="Xác nhận tạo"
          cancelText="Hủy bỏ"
          okButtonProps={{
            loading: loading,
            size: "large",
            type: "primary",
          }}
          cancelButtonProps={{ size: "large" }}
          width={600}
        >
          <div style={{ padding: "20px 0" }}>
            <Alert
              message="Thông tin mẫu xe sẽ được tạo"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            {templateData && (
              <div>
                <Row gutter={[16, 8]}>
                  <Col span={8}>
                    <Text strong>Version:</Text>
                  </Col>
                  <Col span={16}>
                    <Text>
                      {templateData.versionName} ({templateData.modelName})
                    </Text>
                  </Col>

                  <Col span={8}>
                    <Text strong>Màu sắc:</Text>
                  </Col>
                  <Col span={16}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          backgroundColor: templateData.colorHex,
                          borderRadius: "50%",
                          marginRight: 8,
                          border: "1px solid #d9d9d9",
                        }}
                      />
                      <Text>{templateData.colorName}</Text>
                    </div>
                  </Col>

                  <Col span={8}>
                    <Text strong>Giá:</Text>
                  </Col>
                  <Col span={16}>
                    <Text strong style={{ color: "#f5222d" }}>
                      {templateData.price?.toLocaleString()} VNĐ
                    </Text>
                  </Col>

                  <Col span={8}>
                    <Text strong>Mô tả:</Text>
                  </Col>
                  <Col span={16}>
                    <Text>{templateData.description}</Text>
                  </Col>

                  <Col span={8}>
                    <Text strong>Hình ảnh:</Text>
                  </Col>
                  <Col span={16}>
                    <Text>
                      {templateData.attachmentKeys?.length || 0} file đã upload
                    </Text>
                  </Col>
                </Row>
              </div>
            )}
          </div>
        </Modal>
      </Card>
    </Spin>
  );
}

function VehicleManagement() {
  const navigate = useNavigate();
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
        setVehicles([]);
      }
    } catch (error) {
      console.error("❌ Error loading vehicles:", error);
      setError(error.message || "Unknown error");
      message.error(
        "Lỗi khi tải danh sách xe: " + (error.message || "Unknown error")
      );
      setVehicles([]);
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

  // Cấu hình cột bảng hiển thị TẤT CẢ thông tin xe (trừ versionId, colorId)
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      fixed: "left",
      render: (_, __, index) => index + 1,
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      fixed: "left",
      render: (text) => (
        <Text copyable style={{ fontSize: "11px", color: "#666" }}>
          {text ? text.substring(0, 8) + "..." : "N/A"}
        </Text>
      ),
    },
    {
      title: "VIN",
      dataIndex: "vin",
      key: "vin",
      width: 130,
      render: (text) => (
        <Text copyable strong style={{ color: "#1890ff", fontSize: "12px" }}>
          {text || "N/A"}
        </Text>
      ),
    },
    {
      title: "Warehouse",
      key: "warehouse",
      width: 160,
      render: (_, record) => (
        <div>
          <Text strong style={{ display: "block", fontSize: "12px" }}>
            {record.warehouseName || "Chưa có tên"}
          </Text>
          <Text style={{ fontSize: "10px", color: "#999" }}>
            ID:{" "}
            {record.warehouseId
              ? record.warehouseId.substring(0, 8) + "..."
              : "N/A"}
          </Text>
        </div>
      ),
    },
    {
      title: "Model & Version",
      key: "modelVersion",
      width: 200,
      render: (_, record) => (
        <div>
          <Text
            strong
            style={{ color: "#1890ff", display: "block", fontSize: "12px" }}
          >
            {record.modelName || "N/A"}
          </Text>
          <Tag color="blue" size="small" style={{ marginTop: 2 }}>
            {record.versionName || "N/A"}
          </Tag>
          {record.modelId && (
            <Text style={{ fontSize: "10px", color: "#999", display: "block" }}>
              Model ID: {record.modelId.substring(0, 8)}...
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Màu sắc",
      key: "color",
      width: 150,
      render: (_, record) => (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: record.hexCode || "#CCCCCC",
                border: "1px solid #d9d9d9",
              }}
            />
            <Text strong style={{ fontSize: "12px" }}>
              {record.colorName || "N/A"}
            </Text>
          </div>
          <Text style={{ fontSize: "10px", color: "#666" }}>
            Hex: {record.hexCode || "N/A"}
          </Text>
          {record.additionalPrice > 0 && (
            <Text style={{ fontSize: "10px", color: "#fa8c16" }}>
              +{record.additionalPrice.toLocaleString("vi-VN")} ₫
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Thông số & Giá",
      key: "specifications",
      width: 160,
      render: (_, record) => (
        <div>
          <Text style={{ fontSize: "11px", color: "#666" }}>
            Giá bán:{" "}
            <Text strong style={{ color: "#52c41a" }}>
              {record.price
                ? `${record.price.toLocaleString("vi-VN")} ₫`
                : "N/A"}
            </Text>
          </Text>
          <br />
          <Text style={{ fontSize: "11px", color: "#666" }}>
            Cost:{" "}
            <Text strong style={{ color: "#fa8c16" }}>
              {record.costPrice
                ? `${record.costPrice.toLocaleString("vi-VN")} ₫`
                : "N/A"}
            </Text>
          </Text>
          <br />
          <Text style={{ fontSize: "11px", color: "#666" }}>
            Pin: <Text strong>{record.batteryCapacity || 0} kWh</Text>
          </Text>
          <br />
          <Text style={{ fontSize: "11px", color: "#666" }}>
            Tầm xa: <Text strong>{record.range || 0} km</Text>
          </Text>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status) => {
        const statusMap = {
          1: { color: "success", text: "Hoạt động" },
          0: { color: "error", text: "Ngừng hoạt động" },
        };
        const config = statusMap[status] || {
          color: "default",
          text: "Không xác định",
        };
        return <Badge status={config.color} text={config.text} />;
      },
    },
    {
      title: "Ngày tháng",
      key: "dates",
      width: 140,
      render: (_, record) => (
        <div>
          <Text style={{ fontSize: "10px", color: "#666" }}>
            SX:{" "}
            {record.manufactureDate
              ? new Date(record.manufactureDate).toLocaleDateString("vi-VN")
              : "N/A"}
          </Text>
          <br />
          <Text style={{ fontSize: "10px", color: "#666" }}>
            NK:{" "}
            {record.importDate
              ? new Date(record.importDate).toLocaleDateString("vi-VN")
              : "N/A"}
          </Text>
          <br />
          <Text style={{ fontSize: "10px", color: "#666" }}>
            BH:{" "}
            {record.warrantyExpiryDate
              ? new Date(record.warrantyExpiryDate).toLocaleDateString("vi-VN")
              : "N/A"}
          </Text>
        </div>
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 100,
      render: (imageUrl) => {
        if (imageUrl && Array.isArray(imageUrl) && imageUrl.length > 0) {
          return (
            <div>
              <Tag color="green">{imageUrl.length} ảnh</Tag>
            </div>
          );
        }
        return <Tag color="default">Chưa có ảnh</Tag>;
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
        <Spin spinning={loading} tip="Đang xử lý...">
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
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => setActiveTab("create-template")}
                    style={{
                      minWidth: "160px",
                      background: "#1890ff",
                      borderColor: "#1890ff",
                      fontWeight: "bold",
                    }}
                  >
                    Tạo Mẫu Xe
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
                          scroll={{ x: 1800, y: 600 }}
                          size="small"
                          rowKey="id"
                          pagination={{
                            total: filteredData.length,
                            pageSize: 20,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                              `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} `,
                            pageSizeOptions: ["10", "20", "30", "50", "100"],
                          }}
                          bordered
                          title={() => (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Text strong>
                                📋 Danh sách xe điện - Hiển thị tất cả thông tin
                              </Text>
                              <Text style={{ fontSize: "12px", color: "#666" }}>
                                Total: {filteredData.length} vehicles
                              </Text>
                            </div>
                          )}
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
                  key: "create-template",
                  label: (
                    <span>
                      <CarOutlined />
                      Tạo Mẫu Xe
                    </span>
                  ),
                  children: <CreateTemplateVehicleForm />,
                },
                {
                  key: "manage-models",
                  label: (
                    <span>
                      <CarOutlined />
                      Quản lý Model
                    </span>
                  ),
                  children: (
                    <div>
                      <div
                        style={{
                          padding: "16px",
                          background: "#f0f2f5",
                          marginBottom: "16px",
                        }}
                      >
                        <Text type="secondary">
                          📋 Tab: Quản lý Model - Component đang tải...
                        </Text>
                      </div>
                      <ManageModel />
                    </div>
                  ),
                },
                {
                  key: "manage-versions",
                  label: (
                    <span>
                      <BuildOutlined />
                      Quản lý Version
                    </span>
                  ),
                  children: (
                    <div>
                      <div
                        style={{
                          padding: "16px",
                          background: "#f0f2f5",
                          marginBottom: "16px",
                        }}
                      >
                        <Text type="secondary">
                          🔧 Tab: Quản lý Version - Component đang tải...
                        </Text>
                      </div>
                      <ManageVersion />
                    </div>
                  ),
                },
                {
                  key: "manage-colors",
                  label: (
                    <span>
                      <BgColorsOutlined />
                      Quản lý Màu sắc
                    </span>
                  ),
                  children: (
                    <div>
                      <div
                        style={{
                          padding: "16px",
                          background: "#f0f2f5",
                          marginBottom: "16px",
                        }}
                      >
                        <Text type="secondary">
                          🎨 Tab: Quản lý Màu sắc - Component đang tải...
                        </Text>
                      </div>
                      <ColorManagement />
                    </div>
                  ),
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
                      rules={[
                        { required: true, message: "Vui lòng nhập giá!" },
                      ]}
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
                        {
                          required: true,
                          message: "Vui lòng nhập quãng đường!",
                        },
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
                        {
                          required: true,
                          message: "Vui lòng nhập số chỗ ngồi!",
                        },
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
                        {
                          required: true,
                          message: "Vui lòng chọn trạng thái!",
                        },
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
                <Button
                  key="close"
                  onClick={() => setIsViewModalVisible(false)}
                >
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
                              selectedRecord.stock < 100
                                ? "#ff4d4f"
                                : "#52c41a",
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
        </Spin>
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
