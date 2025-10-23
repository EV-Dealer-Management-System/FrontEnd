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

// Component tạo Vehicle - SỬA LẠI LOGIC HIỂN THỊ DROPDOWN
function CreateTemplateVehicleForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // State cho dropdown data
  const [versions, setVersions] = useState([]);
  const [colors, setColors] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [loadingColors, setLoadingColors] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  
  // State để lưu template đã lấy được
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  // Load data khi component mount
  useEffect(() => {
    loadVersions();
    loadColors();
    loadWarehouses();
    loadAllVehicles();
  }, []);

  // Load tất cả xe
  const loadAllVehicles = async () => {
    try {
      setTableLoading(true);
      const result = await vehicleApi.getAllVehicles();
      
      if (result.success) {
        setVehiclesList(result.data || result.result || []);
        message.success(`Đã tải ${(result.data || result.result)?.length || 0} xe`);
      } else {
        message.error(result.message || "Không thể tải danh sách xe!");
        setVehiclesList([]);
      }
    } catch (error) {
      console.error("❌ Error loading vehicles:", error);
      message.error("Có lỗi xảy ra khi tải danh sách xe!");
      setVehiclesList([]);
    } finally {
      setTableLoading(false);
    }
  };

  const loadVersions = async () => {
    try {
      setLoadingVersions(true);
      const result = await vehicleApi.getAllVersions();
      
      console.log("📋 Version API Response:", result);
      
      if (result.success) {
        const versionData = result.data || [];
        console.log("✅ Versions loaded:", versionData);
        setVersions(versionData);
        
        if (versionData.length === 0) {
          message.warning("Chưa có version nào. Vui lòng tạo version trước!");
        }
      } else {
        message.error("Không thể tải danh sách version: " + result.error);
        setVersions([]);
      }
    } catch (error) {
      console.error("❌ Error loading versions:", error);
      message.error("Lỗi khi tải danh sách version: " + error.message);
      setVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  };

  const loadColors = async () => {
    try {
      setLoadingColors(true);
      const result = await vehicleApi.getAllColors();
      
      console.log("🎨 Color API Response:", result);
      
      if (result.success) {
        const colorData = result.data || [];
        console.log("✅ Colors loaded:", colorData);
        setColors(colorData);
        
        if (colorData.length === 0) {
          message.warning("Chưa có màu sắc nào. Vui lòng tạo màu trước!");
        }
      } else {
        message.error("Không thể tải danh sách màu: " + result.error);
        setColors([]);
      }
    } catch (error) {
      console.error("❌ Error loading colors:", error);
      message.error("Lỗi khi tải danh sách màu: " + error.message);
      setColors([]);
    } finally {
      setLoadingColors(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      setLoadingWarehouses(true);
      const result = await vehicleApi.getAllWarehouses();
      
      console.log("🏭 Warehouse API Response:", result);
      
      if (result.success) {
        const warehouseData = result.data || [];
        console.log("✅ Warehouses loaded:", warehouseData);
        setWarehouses(warehouseData);
        
        if (warehouseData.length === 0) {
          message.warning("Chưa có kho nào. Vui lòng tạo kho trước!");
        }
      } else {
        message.error("Không thể tải danh sách kho: " + result.error);
        setWarehouses([]);
      }
    } catch (error) {
      console.error("❌ Error loading warehouses:", error);
      message.error("Lỗi khi tải danh sách kho: " + error.message);
      setWarehouses([]);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  // Hàm gọi API lấy template khi chọn version và color
  const handleVersionOrColorChange = async () => {
    const versionId = form.getFieldValue('versionId');
    const colorId = form.getFieldValue('colorId');

    console.log("🔄 Version/Color changed:", { versionId, colorId });

    // Chỉ gọi API khi đã chọn cả version và color
    if (!versionId || !colorId) {
      setSelectedTemplate(null);
      return;
    }

    try {
      setLoadingTemplate(true);
      message.loading('Đang tìm template...', 0);

      console.log(`🔍 Calling API: /EVTemplate/get-template-by-version-and-color/${versionId}/${colorId}`);
      
      const result = await vehicleApi.getTemplateByVersionAndColor(versionId, colorId);
      message.destroy();

      console.log("📦 Template API Response:", result);

      if (result.success && result.data) {
        setSelectedTemplate(result.data);
        message.success('✅ Đã tìm thấy template phù hợp!');
        
        // Tìm tên version và color để hiển thị
        const versionInfo = versions.find(v => v.id === versionId);
        const colorInfo = colors.find(c => c.id === colorId);
        
        console.log('✅ Template found:', {
          id: result.data.id,
          version: versionInfo?.name || versionInfo?.versionName || 'N/A',
          color: colorInfo?.name || colorInfo?.colorName || 'N/A',
          price: result.data.price
        });
      } else {
        setSelectedTemplate(null);
        message.warning('⚠️ Không tìm thấy template cho version và color này. Vui lòng tạo template trước!');
        console.warn("Template not found:", result);
      }
    } catch (error) {
      console.error('❌ Error getting template:', error);
      message.error('Lỗi khi tìm template!');
      setSelectedTemplate(null);
    } finally {
      setLoadingTemplate(false);
    }
  };

  // Handle form submission TẠO MỚI - SỬA LẠI
  const handleCreateVehicle = async (values) => {
    // ✅ Kiểm tra template trước
    if (!selectedTemplate || !selectedTemplate.id) {
      message.error('❌ Chưa chọn template! Vui lòng chọn Version và Color trước.');
      return;
    }

    try {
      setLoading(true);

      // Tìm thông tin warehouse để hiển thị
      const selectedWarehouse = warehouses.find((w) => w.id === values.warehouseId);

      // ✅ Prepare vehicle data theo ĐÚNG API format
      const vehiclePayload = {
        electricVehicleTemplateId: selectedTemplate.id, // ✅ BẮT BUỘC
        warehouseId: values.warehouseId,
        vin: values.vin,
        status: values.status || 1,
        vehicleList: [], // ✅ Array rỗng
        manufactureDate: values.manufactureDate || null,
        importDate: null, // ✅ Mặc định null
        warrantyExpiryDate: null, // ✅ Mặc định null
        dealerReceivedDate: values.dealerReceivedDate || null,
      };

      console.log("=== VEHICLE PAYLOAD CHECK ===");
      console.log("✅ electricVehicleTemplateId:", vehiclePayload.electricVehicleTemplateId);
      console.log("✅ warehouseId:", vehiclePayload.warehouseId);
      console.log("✅ vin:", vehiclePayload.vin);
      console.log("✅ Full payload:", JSON.stringify(vehiclePayload, null, 2));

      // ✅ Lưu payload để hiển thị trong modal xác nhận
      setVehicleData({
        ...vehiclePayload,
        // Thêm thông tin hiển thị (không gửi lên API)
        _displayInfo: {
          templateInfo: selectedTemplate,
          warehouseName: selectedWarehouse?.name || "N/A",
          versionName: versions.find(v => v.id === form.getFieldValue('versionId'))?.name || 'N/A',
          colorName: colors.find(c => c.id === form.getFieldValue('colorId'))?.name || 'N/A',
        }
      });
      
      setConfirmModalVisible(true);
    } catch (error) {
      console.error("❌ Error preparing vehicle data:", error);
      message.error("Có lỗi xảy ra khi chuẩn bị dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  // Confirm and submit vehicle - SỬA LẠI
  const confirmCreateVehicle = async () => {
    try {
      setLoading(true);
      setConfirmModalVisible(false);

      // ✅ Chỉ lấy các field cần thiết cho API (loại bỏ _displayInfo)
      const { _displayInfo, ...apiPayload } = vehicleData;

      console.log("=== CALLING CREATE VEHICLE API ===");
      console.log("📤 API Payload:", JSON.stringify(apiPayload, null, 2));

      // ✅ ĐÚNG: Gọi API createVehicle()
      const result = await vehicleApi.createVehicle(apiPayload);

      console.log("📥 API Response:", result);

      if (result.success || result.isSuccess) {
        message.success(result.message || "✅ Tạo xe thành công!");
        form.resetFields();
        setCreateModalVisible(false);
        setSelectedTemplate(null);
        
        // Reload danh sách
        loadAllVehicles();
      } else {
        message.error(result.message || result.error || "❌ Có lỗi xảy ra khi tạo xe!");
        console.error("API Error:", result);
      }
    } catch (error) {
      console.error("❌ Error creating vehicle:", error);
      message.error("Có lỗi xảy ra khi tạo xe: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Handle EDIT vehicle
  const handleEditVehicle = (record) => {
    setEditingVehicle(record);
    form.setFieldsValue({
      vin: record.vin,
      status: record.status,
      manufactureDate: record.manufactureDate,
      importDate: record.importDate,
      warrantyExpiryDate: record.warrantyExpiryDate,
      dealerReceivedDate: record.dealerReceivedDate,
    });
    setEditModalVisible(true);
  };

  // Submit EDIT
  const handleSubmitEdit = async (values) => {
    try {
      setLoading(true);

      const updatePayload = {
        vin: values.vin,
        status: values.status,
        manufactureDate: values.manufactureDate || null,
        importDate: values.importDate || null,
        warrantyExpiryDate: values.warrantyExpiryDate || null,
        dealerReceivedDate: values.dealerReceivedDate || null,
      };

      const result = await vehicleApi.updateVehicle(editingVehicle.id, updatePayload);

      if (result.success) {
        message.success("Cập nhật xe thành công!");
        setEditModalVisible(false);
        form.resetFields();
        loadAllVehicles();
      } else {
        message.error(result.message || "Có lỗi xảy ra khi cập nhật!");
      }
    } catch (error) {
      console.error("❌ Error updating vehicle:", error);
      message.error("Có lỗi xảy ra khi cập nhật xe!");
    } finally {
      setLoading(false);
    }
  };

  // Handle DELETE
  const handleDeleteVehicle = async (id) => {
    try {
      setLoading(true);
      const result = await vehicleApi.deleteVehicle(id);

      if (result.success) {
        message.success("Xóa xe thành công!");
        loadAllVehicles();
      } else {
        message.error(result.message || "Không thể xóa xe!");
      }
    } catch (error) {
      console.error("❌ Error deleting vehicle:", error);
      message.error("Có lỗi xảy ra khi xóa xe!");
    } finally {
      setLoading(false);
    }
  };

  // Columns cho bảng danh sách xe
  const vehicleColumns = [
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
      render: (text) => <Text copyable strong style={{ color: "#1890ff" }}>{text}</Text>,
    },
    {
      title: "Template",
      dataIndex: "electricVehicleTemplate",
      key: "template",
      render: (template) => (
        <div>
          <Text strong>{template?.versionName || "N/A"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {template?.modelName || "N/A"}
          </Text>
        </div>
      ),
    },
    {
      title: "Kho",
      dataIndex: "warehouseName",
      key: "warehouse",
      render: (text) => <Text>{text || "N/A"}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          1: { color: "success", text: "Khả dụng" },
          2: { color: "processing", text: "Đã bán" },
          3: { color: "warning", text: "Bảo trì" },
          4: { color: "error", text: "Hỏng" },
        };
        const config = statusMap[status] || { color: "default", text: "N/A" };
        return <Badge status={config.color} text={config.text} />;
      },
    },
    {
      title: "Ngày SX",
      dataIndex: "manufactureDate",
      key: "manufactureDate",
      render: (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditVehicle(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc muốn xóa xe này?"
              onConfirm={() => handleDeleteVehicle(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading} tip="Đang xử lý...">
      <div className="mb-4 flex justify-between items-center">
        <Title level={4} className="m-0">
          🚗 Danh sách Xe Điện
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadAllVehicles}
            loading={tableLoading}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCreateModalVisible(true);
              // Debug: In ra console khi mở modal
              console.log("📊 Current data:", {
                versions: versions.length,
                colors: colors.length,
                warehouses: warehouses.length
              });
            }}
            size="large"
          >
            Tạo Xe Mới
          </Button>
        </Space>
      </div>

      {/* Alert debug info */}
      <Alert
        message="Thông tin dữ liệu"
        description={
          <div>
            <p>✅ Versions: {versions.length} items</p>
            <p>✅ Colors: {colors.length} items</p>
            <p>✅ Warehouses: {warehouses.length} items</p>
            {versions.length === 0 && <p className="text-red-500">⚠️ Chưa có version nào!</p>}
            {colors.length === 0 && <p className="text-red-500">⚠️ Chưa có màu sắc nào!</p>}
          </div>
        }
        type="info"
        showIcon
        closable
        className="mb-4"
      />

      <Card>
        <Table
          columns={vehicleColumns}
          dataSource={vehiclesList}
          rowKey="id"
          loading={tableLoading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} xe`,
          }}
        />
      </Card>

      {/* Modal tạo mới - CẬP NHẬT HIỂN THỊ */}
      <Modal
        title="Tạo Xe Điện Mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
          setSelectedTemplate(null);
        }}
        footer={null}
        width={900}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateVehicle}>
          <Alert
            message="Bước 1: Chọn Version và Color để tìm Template"
            type="warning"
            showIcon
            className="mb-4"
          />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Chọn Version"
                name="versionId"
                rules={[{ required: true, message: "Vui lòng chọn version!" }]}
              >
                <Select
                  placeholder="Chọn version..."
                  loading={loadingVersions}
                  showSearch
                  onChange={handleVersionOrColorChange}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children?.toString() || '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {versions.map((version) => {
                    // Xử lý nhiều trường hợp tên field khác nhau
                    const versionName = version.name || version.versionName || version.Name || 'N/A';
                    const modelName = version.model?.name || version.model?.modelName || version.modelName || 'N/A';
                    
                    return (
                      <Option key={version.id} value={version.id}>
                        {versionName} - {modelName}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
              
              {/* Debug info */}
              {versions.length > 0 && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Có {versions.length} version | Sample: {versions[0]?.name || versions[0]?.versionName || 'N/A'}
                </Text>
              )}
            </Col>

            <Col span={12}>
              <Form.Item
                label="Chọn Màu sắc"
                name="colorId"
                rules={[{ required: true, message: "Vui lòng chọn màu sắc!" }]}
              >
                <Select
                  placeholder="Chọn màu sắc..."
                  loading={loadingColors}
                  showSearch
                  onChange={handleVersionOrColorChange}
                  filterOption={(input, option) =>
                    (option?.children?.toString() || '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {colors.map((color) => {
                    // Xử lý nhiều trường hợp tên field khác nhau
                    const colorName = color.name || color.colorName || color.Name || 'N/A';
                    const hexCode = color.hexCode || color.hex || '#ccc';
                    
                    return (
                      <Option key={color.id} value={color.id}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              backgroundColor: hexCode,
                              borderRadius: "50%",
                              marginRight: 8,
                              border: "1px solid #d9d9d9",
                            }}
                          />
                          {colorName}
                        </div>
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
              
              {/* Debug info */}
              {colors.length > 0 && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Có {colors.length} màu | Sample: {colors[0]?.name || colors[0]?.colorName || 'N/A'}
                </Text>
              )}
            </Col>
          </Row>

          {/* Hiển thị template đã tìm được */}
          {loadingTemplate && (
            <Alert
              message="Đang tìm template..."
              type="info"
              showIcon
              icon={<Spin size="small" />}
              className="mb-4"
            />
          )}

          {selectedTemplate && (
            <Alert
              message="✅ Đã tìm thấy Template!"
              description={
                <div>
                  <p><strong>Template ID:</strong> <Text code>{selectedTemplate.id}</Text></p>
                  <p><strong>Giá:</strong> {selectedTemplate.price?.toLocaleString('vi-VN')} ₫</p>
                  <p><strong>Mô tả:</strong> {selectedTemplate.description || 'N/A'}</p>
                </div>
              }
              type="success"
              showIcon
              className="mb-4"
            />
          )}

          {!selectedTemplate && form.getFieldValue('versionId') && form.getFieldValue('colorId') && !loadingTemplate && (
            <Alert
              message="⚠️ Chưa tìm thấy Template"
              description="Không tìm thấy template cho Version và Color này. Vui lòng tạo template trước trong tab 'Tạo Mẫu Xe'!"
              type="warning"
              showIcon
              className="mb-4"
            />
          )}

          <Divider />

          <Alert
            message="Bước 2: Nhập thông tin xe"
            type="info"
            showIcon
            className="mb-4"
          />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Chọn Kho"
                name="warehouseId"
                rules={[{ required: true, message: "Vui lòng chọn kho!" }]}
              >
                <Select
                  placeholder="Chọn kho..."
                  loading={loadingWarehouses}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children?.toString() || '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {warehouses.map((warehouse) => {
                    const warehouseName = warehouse.name || warehouse.warehouseName || warehouse.Name || 'N/A';
                    
                    return (
                      <Option key={warehouse.id} value={warehouse.id}>
                        {warehouseName}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="VIN (Số khung)"
                name="vin"
                rules={[
                  { required: true, message: "Vui lòng nhập VIN!" },
                  { min: 17, max: 17, message: "VIN phải có đúng 17 ký tự!" }
                ]}
              >
                <Input placeholder="Nhập VIN 17 ký tự" maxLength={17} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Trạng thái"
                name="status"
                initialValue={1}
                rules={[{ required: true }]
                }
              >
                <Select>
                  <Option value={1}>Khả dụng</Option>
                  <Option value={2}>Đã bán</Option>
                  <Option value={3}>Bảo trì</Option>
                  <Option value={4}>Hỏng</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Ngày sản xuất" name="manufactureDate">
                <Input type="datetime-local" />
              </Form.Item>
            </Col>
          </Row>

          <Alert
            message="Lưu ý: Import Date và Warranty Date sẽ được set NULL"
            type="info"
            showIcon
            className="mb-4"
          />

          <Divider />

          <Row justify="end" gutter={16}>
            <Col>
              <Button onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
                setSelectedTemplate(null);
              }}>
                Hủy
              </Button>
            </Col>
            <Col>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                icon={<CarOutlined />}
                disabled={!selectedTemplate}
              >
                Tạo Xe
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal xác nhận - CẬP NHẬT */}
      <Modal
        title={
          <div className="text-center">
            <CheckCircleOutlined className="text-green-500 text-2xl mr-2" />
            Xác nhận tạo xe
          </div>
        }
        open={confirmModalVisible}
        onOk={confirmCreateVehicle}
        onCancel={() => setConfirmModalVisible(false)}
        okText="Xác nhận tạo"
        cancelText="Hủy"
        okButtonProps={{ loading }}
        width={600}
      >
        {vehicleData && (
          <div className="space-y-3">
            <Alert
              message="Thông tin xe sẽ được tạo"
              type="info"
              showIcon
              className="mb-3"
            />

            <div className="bg-gray-50 p-4 rounded">
              <p className="mb-2">
                <Text strong>Template ID:</Text>{" "}
                <Text code className="text-xs">{vehicleData.electricVehicleTemplateId}</Text>
              </p>
              <p className="mb-2">
                <Text strong>Version:</Text> {vehicleData._displayInfo?.versionName}
              </p>
              <p className="mb-2">
                <Text strong>Màu sắc:</Text> {vehicleData._displayInfo?.colorName}
              </p>
              <p className="mb-2">
                <Text strong>Kho:</Text> {vehicleData._displayInfo?.warehouseName}
              </p>
              <p className="mb-2">
                <Text strong>VIN:</Text> <Text code>{vehicleData.vin}</Text>
              </p>
              <p className="mb-2">
                <Text strong>Trạng thái:</Text>{" "}
                {vehicleData.status === 1 ? "Khả dụng" : "Khác"}
              </p>
              
              {vehicleData.manufactureDate && (
                <p className="mb-2">
                  <Text strong>Ngày SX:</Text> {vehicleData.manufactureDate}
                </p>
              )}
            </div>

            {vehicleData._displayInfo?.templateInfo && (
              <div className="bg-blue-50 p-3 rounded mt-3">
                <Text strong>Thông tin template:</Text>
                <p className="text-sm mt-1">
                  Giá: {vehicleData._displayInfo.templateInfo.price?.toLocaleString('vi-VN')} ₫
                </p>
                {vehicleData._displayInfo.templateInfo.description && (
                  <p className="text-sm">
                    Mô tả: {vehicleData._displayInfo.templateInfo.description}
                  </p>
                )}
              </div>
            )}

            <Divider className="my-3" />
            
            <Alert
              message="Lưu ý"
              description="Import Date và Warranty Date sẽ được set NULL. Bạn có thể cập nhật sau."
              type="warning"
              showIcon
            />
          </div>
        )}
      </Modal>

      {/* Modal Edit giữ nguyên như cũ */}
      <Modal
        title="Chỉnh sửa thông tin xe"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitEdit}>
          <Form.Item label="VIN" name="vin">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Trạng thái" name="status">
            <Select>
              <Option value={1}>Khả dụng</Option>
              <Option value={2}>Đã bán</Option>
              <Option value={3}>Bảo trì</Option>
              <Option value={4}>Hỏng</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Ngày sản xuất" name="manufactureDate">
            <Input type="datetime-local" />
          </Form.Item>

          <Form.Item 
            label="Ngày nhập khẩu" 
            name="importDate"
            extra="Có thể cập nhật từ NULL"
          >
            <Input type="datetime-local" />
          </Form.Item>

          <Form.Item 
            label="Ngày hết hạn bảo hành" 
            name="warrantyExpiryDate"
            extra="Có thể cập nhật từ NULL"
          >
            <Input type="datetime-local" />
          </Form.Item>

          <Form.Item label="Ngày dealer nhận" name="dealerReceivedDate">
            <Input type="datetime-local" />
          </Form.Item>

          <Divider />

          <Row justify="end" gutter={16}>
            <Col>
              <Button onClick={() => {
                setEditModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
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
      console.log("🔄 [VehicleManagement] Loading vehicles...");
      const result = await vehicleApi.getAllVehicles();

      if (result && result.success) {
        console.log(
          "✅ [VehicleManagement] Vehicles loaded successfully:",
          result.data?.length || 0,
          "vehicles"
        );
        
        // ✅ Lấy từ result.data hoặc result.result
        setVehicles(Array.isArray(result.data) ? result.data : (result.result || []));

        if (result.fallback) {
          message.info("API không khả dụng, đang sử dụng dữ liệu mẫu", 3);
        }
      } else {
        console.warn("⚠️ [VehicleManagement] API result not successful:", result);
        message.error(result?.error || "Không thể tải danh sách xe");
        setVehicles([]);
      }
    } catch (error) {
      console.error("❌ [VehicleManagement] Error loading vehicles:", error);
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
            {/* Quick Action Buttons - HOÁN ĐỔI */}
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
                  {/* ✅ HOÁN ĐỔI: "Tạo Mẫu Xe Template" → tab create-template */}
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
                    Tạo Mẫu Xe Template
                  </Button>
                  
                  {/* ✅ HOÁN ĐỔI: "Tạo Xe Điện" → tab create-vehicle */}
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

            {/* TABS - HOÁN ĐỔI */}
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
                      {/* ...existing overview content... */}
                    </>
                  ),
                },
                {
                  /* ✅ HOÁN ĐỔI: create-template → CreateElectricVehicle (tạo template) */
                  key: "create-template",
                  label: (
                    <span>
                      <PlusOutlined />
                      Tạo Mẫu Xe Template
                    </span>
                  ),
                  children: <CreateElectricVehicle />,
                },
                {
                  /* ✅ HOÁN ĐỔI: create-vehicle → CreateTemplateVehicleForm (tạo xe) */
                  key: "create-vehicle",
                  label: (
                    <span>
                      <ThunderboltOutlined />
                      Tạo Xe Điện
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

            {/* ...existing modals... */}
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
