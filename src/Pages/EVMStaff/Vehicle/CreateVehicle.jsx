import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
  message,
  Badge,
  Row,
  Col,
  Typography,
  Divider,
  Alert,
  Spin,
  Tooltip,
  Empty,
  Image,
} from "antd";
import {
  PlusOutlined,
  CarOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { vehicleApi } from "../../../App/EVMAdmin/VehiclesManagement/Vehicles";
import EVMStaffLayout from "../../../Components/EVMStaff/EVMStaffLayout";

const { Title, Text } = Typography;
const { Option } = Select;

/** ---- Helpers: normalize API & extract error ---- */
const normalizeApi = (res) => ({
  success: res?.success ?? res?.isSuccess ?? false,
  data: res?.data ?? res?.result,
  message: res?.message ?? res?.error ?? "",
});
const extractErrorMessage = (err) => {
  const status = err?.response?.status;
  const serverMsg =
    err?.response?.data?.message || err?.response?.data?.error || err?.message;

  const errorsObj = err?.response?.data?.errors;
  if (errorsObj && typeof errorsObj === "object") {
    try {
      const parts = [];
      Object.keys(errorsObj).forEach((k) => {
        const v = errorsObj[k];
        if (Array.isArray(v)) parts.push(...v);
        else if (typeof v === "string") parts.push(v);
      });
      if (parts.length) return parts.join("\n");
    } catch {}
  }

  if (err?.code === "ECONNABORTED")
    return "Yêu cầu bị timeout. Vui lòng thử lại.";
  if (status === 400) return serverMsg || "Yêu cầu không hợp lệ (400).";
  if (status === 401) return "Chưa được xác thực (401).";
  if (status === 403) return "Không có quyền thực hiện (403).";
  if (status === 404) return "Không tìm thấy tài nguyên (404).";
  if (status === 500) return serverMsg || "Lỗi máy chủ (500).";
  return serverMsg || "Đã xảy ra lỗi không xác định.";
};

// ✅ Component TẠO XE ĐIỆN (có VIN)
function CreateElectricVehicle() {
  const [loading, setLoading] = useState(false);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [models, setModels] = useState([]); // ✅ Thêm state cho models
  const [versions, setVersions] = useState([]);
  const [colors, setColors] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [form] = Form.useForm();
  const [updateForm] = Form.useForm(); // Form cho update
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false); // Modal update
  const [updatingVehicle, setUpdatingVehicle] = useState(null); // Vehicle đang update
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  
  // Available colors cho version đã chọn
  const [availableColors, setAvailableColors] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null); // ✅ Thêm state cho selected model
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // 5 xe mỗi trang

  useEffect(() => {
    loadAllVehicles();
    loadDropdownData();
  }, []);

  // ✅ Load tất cả VEHICLES (có VIN)
  const loadAllVehicles = async () => {
    try {
      setLoading(true);
      const result = await vehicleApi.getAllVehicles();

      if (result.isSuccess || result.success) {
        const vehiclesData = result.result || result.data || [];
        setVehiclesList(vehiclesData);
        
        if (vehiclesData.length === 0) {
          message.info("Chưa có xe nào.");
        }
      } else {
        message.error("Không thể tải danh sách xe!");
        setVehiclesList([]);
      }
    } catch (error) {
      console.error("❌ Error loading vehicles:", error);
      message.error("Lỗi khi tải danh sách xe!");
      setVehiclesList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      // ✅ Chỉ load models và colors, warehouses lúc đầu
      // Versions sẽ được load khi chọn model
      const [modelsRes, colorsRes, warehousesRes] = await Promise.all([
        vehicleApi.getAllModels(),
        vehicleApi.getAllColors(),
        vehicleApi.getAllWarehouses(),
      ]);

      if (modelsRes.success || modelsRes.isSuccess) {
        const modelsData = modelsRes.data || modelsRes.result || [];
        setModels(modelsData);
      }
      
      if (colorsRes.success || colorsRes.isSuccess) {
        setColors(colorsRes.data || colorsRes.result || []);
      }
      if (warehousesRes.success || warehousesRes.isSuccess) {
        setWarehouses(warehousesRes.data || warehousesRes.result || []);
      }
    } catch (err) {
      console.error("❌ Error loading dropdown data:", err);
      message.error("Lỗi khi tải dữ liệu dropdown!");
    }
  };

  // ✅ Load versions theo model đã chọn
  const loadVersionsByModelId = async (modelId) => {
    if (!modelId) {
      setVersions([]);
      return;
    }

    try {
      setLoadingTemplate(true);
      const result = await vehicleApi.getVersionByModelId(modelId);
      
      if (result.success || result.isSuccess) {
        const versionsData = result.data || result.result || [];
        setVersions(versionsData);
        
        if (versionsData.length === 0) {
          message.warning('Model này chưa có version nào!');
        } else {
          message.success(`Tìm thấy ${versionsData.length} version`);
        }
      } else {
        setVersions([]);
        message.error('Không thể tải danh sách version!');
      }
    } catch (err) {
      console.error('❌ Error loading versions by model:', err);
      setVersions([]);
      message.error('Lỗi khi tải danh sách version!');
    } finally {
      setLoadingTemplate(false);
    }
  };

  // ✅ Xử lý khi chọn model
  const handleModelChange = async (modelId) => {
    setSelectedModelId(modelId);
    setSelectedVersionId(null);
    setSelectedTemplate(null);
    setAvailableColors([]);
    
    // Reset các field phụ thuộc
    form.setFieldValue('versionId', undefined);
    form.setFieldValue('colorId', undefined);
    
    // Load versions cho model này
    await loadVersionsByModelId(modelId);
  };

  // ✅ Load available colors khi chọn version
  const loadAvailableColorsForVersion = async (versionId) => {
    if (!versionId) {
      setAvailableColors([]);
      return;
    }

    try {
      setLoadingTemplate(true);
      // Lấy tất cả colors và check template cho từng color
      const validColors = [];
      
      for (const color of colors) {
        try {
          const result = await vehicleApi.getTemplateByVersionAndColor(versionId, color.id);
          
          // API có thể trả về array hoặc single object
          let hasTemplate = false;
          if (result.success || result.isSuccess) {
            const data = result.data || result.result;
            if (Array.isArray(data) && data.length > 0) {
              hasTemplate = true;
            } else if (data && !Array.isArray(data)) {
              hasTemplate = true;
            }
          }
          
          if (hasTemplate) {
            validColors.push(color);
          }
        } catch (err) {
          // Color này không có template - skip
          console.log(`Color ${color.colorName || color.name} không có template cho version này`);
        }
      }
      
      setAvailableColors(validColors);
      
      if (validColors.length === 0) {
        message.warning('Version này chưa có màu nào khả dụng!');
      } else {
        message.success(`Tìm thấy ${validColors.length} màu khả dụng`);
      }
    } catch (err) {
      console.error('Error loading available colors:', err);
      setAvailableColors([]);
    } finally {
      setLoadingTemplate(false);
    }
  };

  // ✅ Tìm template khi chọn version và color
  const handleVersionChange = async (versionId) => {
    setSelectedVersionId(versionId);
    setSelectedTemplate(null);
    form.setFieldValue('colorId', undefined); // Reset color
    await loadAvailableColorsForVersion(versionId);
  };

  const handleVersionOrColorChange = async () => {
    const versionId = form.getFieldValue('versionId');
    const colorId = form.getFieldValue('colorId');

    console.log("🔍 Looking for template with:", { versionId, colorId });

    if (!versionId || !colorId) {
      setSelectedTemplate(null);
      console.log("⚠️ Missing versionId or colorId");
      return;
    }

    try {
      setLoadingTemplate(true);
      message.loading('Đang tìm template...', 0);
      
      console.log("📡 Calling API: getTemplateByVersionAndColor");
      const result = await vehicleApi.getTemplateByVersionAndColor(versionId, colorId);
      console.log("📥 API Response:", result);
      
      message.destroy();

      if ((result.isSuccess || result.success) && (result.result || result.data)) {
        // API trả về array, lấy phần tử đầu tiên
        let templateData = result.result || result.data;
        
        // Nếu là array, lấy phần tử đầu tiên
        if (Array.isArray(templateData) && templateData.length > 0) {
          templateData = templateData[0];
          console.log("✅ Template found (from array):", templateData);
        } else if (!Array.isArray(templateData)) {
          console.log("✅ Template found (single object):", templateData);
        } else {
          console.warn("⚠️ Empty array in response");
          setSelectedTemplate(null);
          message.warning('⚠️ Không tìm thấy template. Vui lòng tạo template trước!');
          return;
        }
        
        console.log("📌 Template ID:", templateData.id);
        
        setSelectedTemplate(templateData);
        message.success(`✅ Đã tìm thấy template! ID: ${templateData.id}`);
      } else {
        console.warn("⚠️ No template found in response:", result);
        setSelectedTemplate(null);
        message.warning('⚠️ Không tìm thấy template. Vui lòng tạo template trước!');
      }
    } catch (error) {
      console.error('❌ Error getting template:', error);
      console.error('❌ Error response:', error.response?.data);
      message.error('Lỗi khi tìm template!');
      setSelectedTemplate(null);
    } finally {
      setLoadingTemplate(false);
    }
  };

 // ✅ Columns cho bảng VEHICLES 
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
    render: (text) => (
      <Text copyable strong style={{ color: "#1890ff", fontSize: 12 }}>
        {text}
      </Text>
    ),
  },
  {
    title: "Template Info",
    key: "template",
    render: (_, record) => {
      const template = record.electricVehicleTemplate || {};
      return (
        <div>
          <Text strong>
            {template.versionName || template.version?.versionName || "N/A"}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {template.modelName || template.version?.modelName || "N/A"}
          </Text>
        </div>
      );
    },
  },
  {
    title: "Màu sắc",
    key: "color",
    render: (_, record) => {
      const color = record.electricVehicleTemplate?.color || {};
      return (
        <Space>
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: color.hexCode || color.colorCode || "#ccc",
              borderRadius: "50%",
              border: "1px solid #d9d9d9",
            }}
          />
          <Text>{color.colorName || "N/A"}</Text>
        </Space>
      );
    },
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
    width: 120,
    render: (status) => {
      const statusMap = {
        1: { color: "success", text: "Khả dụng", icon: "✅" },
        2: { color: "processing", text: "Đang chờ", icon: "⏳" },
        3: { color: "error", text: "Đã đặt", icon: "📦" },
        4: { color: "default", text: "Đang vận chuyển", icon: "🚚" },
        5: { color: "warning", text: "Đã bán", icon: "💰" },
        6: { color: "default", text: "Tại đại lý", icon: "🏢" },
        7: { color: "error", text: "Bảo trì", icon: "🔧" },
      };
      const config = statusMap[status] || { color: "default", text: "N/A", icon: "❓" };
      return (
        <div className="flex items-center gap-1">
          <span>{config.icon}</span>
          <Badge status={config.color} text={config.text} />
        </div>
      );
    },
  },
  {
    title: "Ngày SX",
    dataIndex: "manufactureDate",
    key: "manufactureDate",
    width: 110,
    render: (date) =>
      date ? (
        new Date(date).toLocaleDateString("vi-VN")
      ) : (
        <Text type="secondary">Chưa có</Text>
      ),
  },
  {
    title: "Ngày nhập",
    dataIndex: "importDate",
    key: "importDate",
    width: 110,
    render: (date) =>
      date ? (
        new Date(date).toLocaleDateString("vi-VN")
      ) : (
        <Text type="secondary">Chưa có</Text>
      ),
  },
  {
    title: "Hạn bảo hành",
    dataIndex: "warrantyExpiryDate",
    key: "warrantyExpiryDate",
    width: 110,
    render: (date) =>
      date ? (
        new Date(date).toLocaleDateString("vi-VN")
      ) : (
        <Text type="secondary">Chưa có</Text>
      ),
  },


  {
    title: "Ngày đại lý nhận xe",
    dataIndex: "dealerReceivedDate",
    key: "dealerReceivedDate",
    width: 130,
    render: (date) =>
      date ? (
        new Date(date).toLocaleDateString("vi-VN")
      ) : (
        <Text type="secondary">Chưa có</Text>
      ),
  },
  {
    title: "Ngày giao xe",
    dataIndex: "deliveryDate",
    key: "deliveryDate",
    width: 130,
    render: (date) =>
      date ? (
        new Date(date).toLocaleDateString("vi-VN")
      ) : (
        <Text type="secondary">Chưa có</Text>
      ),
  },

  {
    title: "Thao tác",
    key: "actions",
    width: 120,
    fixed: "right",
    render: (_, record) => (
      <Space size="small">
        <Tooltip title="Cập nhật">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setUpdatingVehicle(record);
              updateForm.setFieldsValue({
                status: record.status,
                importDate: record.importDate
                  ? record.importDate.split("T")[0] +
                    "T" +
                    record.importDate.split("T")[1]?.substring(0, 5)
                  : null,
                warrantyExpiryDate: record.warrantyExpiryDate
                  ? record.warrantyExpiryDate.split("T")[0] +
                    "T" +
                    record.warrantyExpiryDate.split("T")[1]?.substring(0, 5)
                  : null,
              });
              setIsUpdateModalVisible(true);
            }}
          />
        </Tooltip>
        <Tooltip title="Xem chi tiết">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedVehicle(record);
              setIsViewModalVisible(true);
            }}
          />
        </Tooltip>
      </Space>
    ),
  },
];


  const handleCreateModal = () => {
    form.resetFields();
    setSelectedTemplate(null);
    setSelectedModelId(null); // ✅ Reset model selection
    setSelectedVersionId(null);
    setAvailableColors([]);
    setVersions([]); // ✅ Reset versions list
    setIsCreateModalVisible(true);
  };

  // ✅ Handle tạo vehicle
  const handleCreateVehicle = async (values) => {
    console.log("🚗 handleCreateVehicle called with values:", values);
    console.log("📋 Current selectedTemplate:", selectedTemplate);
    
    // Validation: Template phải được chọn
    if (!selectedTemplate || !selectedTemplate.id) {
      console.error("❌ No template selected!");
      message.error('❌ Chưa chọn template! Vui lòng chọn Version và Color trước.');
      return;
    }

    // Validation: VIN phải được nhập
    if (!values.vin || values.vin.trim() === '') {
      console.error("❌ VIN is empty!");
      message.error('❌ Vui lòng nhập VIN!');
      return;
    }

    // Validation: Warehouse phải được chọn
    if (!values.warehouseId) {
      console.error("❌ Warehouse not selected!");
      message.error('❌ Vui lòng chọn kho!');
      return;
    }

    console.log("✅ All validations passed!");
    console.log("✅ Template ID:", selectedTemplate.id);
    console.log("✅ VIN:", values.vin);
    console.log("✅ Warehouse ID:", values.warehouseId);

    try {
      setLoading(true);

      const vinList = [values.vin.trim().toUpperCase()]; // ✅ Uppercase VIN
      console.log("✍️ Manual VIN:", vinList);

      // ✅ Format dates to ISO 8601 with timezone
      const formatDateToISO = (dateString) => {
        if (!dateString) return null;
        try {
          const date = new Date(dateString);
          return date.toISOString(); // ✅ Format: 2025-10-25T06:11:24.201Z
        } catch (err) {
          console.error("❌ Date format error:", err);
          return null;
        }
      };

      // ✅ Payload theo đúng Swagger API schema
      const vehiclePayload = {
        electricVehicleTemplateId: selectedTemplate.id,
        warehouseId: values.warehouseId,
        vinList: vinList, // ✅ Array of VINs
        status: values.status || 1,
        manufactureDate: formatDateToISO(values.manufactureDate), // ✅ ISO 8601
        importDate: formatDateToISO(values.importDate), // ✅ ISO 8601
        warrantyExpiryDate: formatDateToISO(values.warrantyExpiryDate), // ✅ ISO 8601
      };

      console.log("📦 Vehicle payload prepared (đúng schema):", vehiclePayload);
      console.log("🔑 Template ID in payload:", vehiclePayload.electricVehicleTemplateId);
      console.log("🏢 Warehouse ID in payload:", vehiclePayload.warehouseId);
      console.log("🚗 VIN List in payload:", vehiclePayload.vinList);

      // ✅ Gọi API tạo xe ngay lập tức
      const res = await vehicleApi.createVehicle(vehiclePayload);
      console.log("📥 Create vehicle response:", res);

      const normalized = normalizeApi(res);
      console.log("📊 Normalized response:", normalized);
      
      if (normalized.success) {
        message.success(normalized.message || "🎉 Tạo xe thành công!");
        setIsCreateModalVisible(false); // ✅ Đóng create modal
        form.resetFields();
        setSelectedTemplate(null);
        setSelectedModelId(null); // ✅ Reset model selection
        setSelectedVersionId(null);
        setAvailableColors([]);
        setVersions([]); // ✅ Reset versions list
        await loadAllVehicles();
        
        // ✅ Scroll to top và reset về trang đầu tiên
        setCurrentPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log("✅ Vehicle created successfully, scrolled to top");
      } else {
        console.error("❌ Create failed:", normalized.message);
        message.error(normalized.message || "Không thể tạo xe");
      }
    } catch (error) {
      console.error("❌ Error creating vehicle:", error);
      console.error("❌ Error response:", error.response?.data);
      message.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Confirm và submit vehicle
  const confirmCreateVehicle = async () => {
    console.log("✅ confirmCreateVehicle called");
    console.log("📦 Vehicle data:", vehicleData);
    
    try {
      setLoading(true);

      const { _displayInfo, ...apiPayload } = vehicleData;

      console.log("📤 API Payload (without _displayInfo):", apiPayload);
      console.log("🔑 Template ID in payload:", apiPayload.electricVehicleTemplateId);
      console.log("🏢 Warehouse ID in payload:", apiPayload.warehouseId);
      console.log("🚗 VIN List in payload:", apiPayload.vinList);
      
      const res = await vehicleApi.createVehicle(apiPayload);
      console.log("📥 Create vehicle response:", res);

      const normalized = normalizeApi(res);
      console.log("📊 Normalized response:", normalized);
      
      if (normalized.success) {
        message.success(normalized.message || "🎉 Tạo xe thành công!");
        setConfirmModalVisible(false); // ✅ Đóng confirm modal
        setIsCreateModalVisible(false); // ✅ Đóng create modal
        form.resetFields();
        setSelectedTemplate(null);
        setSelectedModelId(null); // ✅ Reset model selection
        setSelectedVersionId(null);
        setAvailableColors([]);
        setVersions([]); // ✅ Reset versions list
        await loadAllVehicles();
      } else {
        console.error("❌ Create failed:", normalized.message);
        setConfirmModalVisible(false); // ✅ Đóng confirm modal khi lỗi
        message.error(normalized.message || "Không thể tạo xe");
      }
    } catch (err) {
      console.error("❌ CREATE VEHICLE ERROR:", err);
      console.error("❌ Error response:", err.response?.data);
      setConfirmModalVisible(false); // ✅ Đóng confirm modal khi exception
      message.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Update Vehicle
  const handleUpdateVehicle = async (values) => {
    if (!updatingVehicle) return;

    try {
      setLoading(true);
      console.log("🔄 Updating vehicle:", updatingVehicle.id);
      console.log("📝 Update values:", values);

      // Convert datetime-local format to ISO 8601 with timezone
      const formatDateForApi = (dateString) => {
        if (!dateString) return null;
        // datetime-local format: "2025-10-15T15:16"
        // Convert to ISO: "2025-10-15T15:16:00.000Z"
        return new Date(dateString).toISOString();
      };

      const updatePayload = {
        vin: updatingVehicle.vin,
        status: values.status,
        manufactureDate: updatingVehicle.manufactureDate,
        importDate: formatDateForApi(values.importDate),
        warrantyExpiryDate: formatDateForApi(values.warrantyExpiryDate),
        deliveryDate: formatDateForApi(values.deliveryDate),
        dealerReceivedDate: formatDateForApi(values.dealerReceivedDate),
      };

      console.log("📤 Update payload:", updatePayload);

      const res = await vehicleApi.updateVehicle(updatingVehicle.id, updatePayload);
      console.log("📥 Update response:", res);

      const normalized = normalizeApi(res);
      
      if (normalized.success) {
        message.success("✅ Cập nhật xe thành công!");
        setIsUpdateModalVisible(false);
        updateForm.resetFields();
        setUpdatingVehicle(null);
        await loadAllVehicles();
        
        // ✅ KHÔNG scroll và KHÔNG đổi trang - giữ nguyên vị trí hiện tại
        console.log("✅ Vehicle updated successfully, keeping current position");
      } else {
        message.error(normalized.message || "Không thể cập nhật xe");
      }
    } catch (err) {
      console.error("❌ UPDATE VEHICLE ERROR:", err);
      console.error("❌ Error response:", err.response?.data);
      message.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <EVMStaffLayout>
      <div className="w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={4} className="m-0">
              <CarOutlined style={{ color: "#1890ff", marginRight: 8 }} />
              🚗 Tạo & Quản lý Xe Điện
            </Title>
            <Text type="secondary">Quản lý các xe điện cụ thể (có VIN)</Text>
          </div>
          <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadAllVehicles}
            loading={loading}
          >
            Tải lại
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateModal}
            size="large"
          >
            Tạo Xe Mới
          </Button>
        </Space>
      </div>

      <div className="w-full pb-6">
        <Card className="shadow-sm">
          <Alert
            message={`Hiển thị ${vehiclesList.length} xe. Mỗi xe có VIN riêng và được tạo từ template.`}
            type="info"
            showIcon
            closable
            className="mb-4"
          />
          
          {/* Danh sách xe dạng Card - 2 hàng thông tin */}
          <div className="space-y-3">
            {loading && (
              <div className="text-center py-8">
                <Spin size="large" tip="Đang tải danh sách xe..." />
              </div>
            )}
            
            {!loading && vehiclesList.length === 0 && (
              <div className="text-center py-8">
                <Text type="secondary">Chưa có xe nào. Hãy tạo xe mới!</Text>
              </div>
            )}
            
            {!loading && vehiclesList.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((vehicle, index) => {
              const actualIndex = (currentPage - 1) * pageSize + index;
              
              // ✅ Dùng data trực tiếp từ API response
              const template = vehicle.electricVehicleTemplate || {};
              const warehouse = vehicle.warehouse || {};
              
              // ✅ Lấy thông tin từ nested objects
              const versionName = template.versionName || "N/A";
              const modelName = template.modelName || "N/A";
              const warehouseName = warehouse.name || "N/A";
              
              const statusMap = {
                1: { color: "success", text: "Khả dụng", bgColor: "#52c41a" },
                2: { color: "processing", text: "Đang chờ", bgColor: "#1890ff" },
                3: { color: "warning", text: "Đã đặt", bgColor: "#faad14" },
                4: { color: "processing", text: "Đang vận chuyển", bgColor: "#722ed1" },
                5: { color: "error", text: "Đã bán", bgColor: "#ff4d4f" },
                6: { color: "default", text: "Tại đại lý", bgColor: "#8c8c8c" },
                7: { color: "warning", text: "Bảo trì", bgColor: "#fa8c16" },
              };
              const statusConfig = statusMap[vehicle.status] || { color: "default", text: "N/A", bgColor: "#d9d9d9" };
              
              return (
                <Card 
                  key={vehicle.id}
                  className="hover:shadow-lg transition-all border-l-4 mb-4"
                  style={{ 
                    borderLeftColor: statusConfig.bgColor,
                    padding: '16px'
                  }}
                  size="default"
                >
                  {/* HÀNG 1: Thông tin chính */}
                  <Row gutter={[24, 12]} align="middle">
                    <Col xs={24} sm={1}>
                      <Text strong style={{ fontSize: '18px', color: '#595959' }}>#{actualIndex + 1}</Text>
                    </Col>
                    
                    <Col xs={24} sm={5} className="border-r border-gray-300 pr-4">
                      <div className="mb-2">
                        <Text strong className="block mb-2" style={{ fontSize: '13px' }}></Text>
                        <Text copyable strong className="text-blue-600 font-mono" style={{ fontSize: '14px' }}>
                          {vehicle.vin}
                        </Text>
                      </div>
                    </Col>
                    
                    <Col xs={12} sm={6} className="border-r border-gray-300 pr-4">
  {/* --- Phần Mẫu --- */}
  <div className="mb-4">
    <Text strong className="block mb-2" style={{ fontSize: '13px' }}>
      Mẫu:
    </Text>
    <Text
      type="secondary"
      className="block text-[13px] text-gray-500"
      style={{ lineHeight: '1.5' }}
    >
      {modelName}
    </Text>
  </div>

  {/* --- Phần Phiên bản --- */}
  <div>
    <Text strong className="block mb-2" style={{ fontSize: '13px' }}>
      Phiên bản:
    </Text>
    <Text
      strong
      className="block"
      style={{ fontSize: '15px', color: '#262626', lineHeight: '1.6' }}
    >
      {versionName}
    </Text>
  </div>
</Col>

                    <Col xs={12} sm={5} className="border-r border-gray-300 pr-4">
                      <div className="mb-2">
                        <Text strong className="block mb-2" style={{ fontSize: '13px' }}>Kho:   </Text>
                        <Text strong style={{ fontSize: '14px' }}>{warehouseName}</Text>
                      </div>
                    </Col>
                    
                    <Col xs={12} sm={5} className="border-r border-gray-300 pr-4">
                      <div className="mb-2">
                        <Text strong className="block mb-2" style={{ fontSize: '13px' }}>Trạng thái:    </Text>
                        <Badge 
                          status={statusConfig.color} 
                          text={<Text strong style={{ fontSize: '14px' }}>{statusConfig.text}</Text>} 
                        />
                      </div>
                    </Col>
                    
                    <Col xs={24} sm={2} className="text-right">
                      <Space direction="vertical" size="middle">
                        <Tooltip title="Cập nhật">
                          <Button
                            icon={<EditOutlined />}
                            size="middle"
                            type="primary"
                            onClick={() => {
                              setUpdatingVehicle(vehicle);
                              updateForm.setFieldsValue({
                                status: vehicle.status,
                                importDate: vehicle.importDate ? vehicle.importDate.split('T')[0] + 'T' + vehicle.importDate.split('T')[1]?.substring(0,5) : null,
                                warrantyExpiryDate: vehicle.warrantyExpiryDate ? vehicle.warrantyExpiryDate.split('T')[0] + 'T' + vehicle.warrantyExpiryDate.split('T')[1]?.substring(0,5) : null,
                                deliveryDate: vehicle.deliveryDate ? vehicle.deliveryDate.split('T')[0] + 'T' + vehicle.deliveryDate.split('T')[1]?.substring(0,5) : null,
                                dealerReceivedDate: vehicle.dealerReceivedDate ? vehicle.dealerReceivedDate.split('T')[0] + 'T' + vehicle.dealerReceivedDate.split('T')[1]?.substring(0,5) : null,
                              });
                              setIsUpdateModalVisible(true);
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Chi tiết">
                          <Button
                            icon={<EyeOutlined />}
                            size="middle"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setIsViewModalVisible(true);
                            }}
                          />
                        </Tooltip>
                      </Space>
                    </Col>
                  </Row>
                  
                 
                  
                 

                  {/* HÀNG 2: Ngày giao hàng */}
                 
<Row gutter={[24, 12]} align="middle">

  <Col xs={24} sm={8} className="border-r border-gray-300 pr-3">
    <Text strong className="block mb-1" style={{ fontSize: '13px' }}>Ngày SX:</Text>
    <Text style={{ fontSize: '14px' }}>
      {vehicle.manufactureDate 
        ? new Date(vehicle.manufactureDate).toLocaleDateString("vi-VN", { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          })
        : <Text type="secondary" italic>Chưa có</Text>
      }
    </Text>
  </Col>

  <Col xs={24} sm={8} className="border-r border-gray-300 pr-3">
    <Text strong className="block mb-1" style={{ fontSize: '13px' }}>Ngày giao xe:</Text>
    <Text style={{ fontSize: '14px' }}>
      {vehicle.deliveryDate 
        ? new Date(vehicle.deliveryDate).toLocaleDateString("vi-VN", { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          })
        : <Text type="secondary" italic>Chưa giao</Text>
      }
    </Text>
  </Col>

  <Col xs={24} sm={8}>
    <Text strong className="block mb-1" style={{ fontSize: '13px' }}>Ngày đại lý nhận:</Text>
    <Text style={{ fontSize: '14px' }}>
      {vehicle.dealerReceivedDate 
        ? new Date(vehicle.dealerReceivedDate).toLocaleDateString("vi-VN", { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          })
        : <Text type="secondary" italic>Chưa nhận</Text>
      }
    </Text>
  </Col>

</Row>
                </Card>
              );
            })}
          </div>
          
          {/* Pagination */}
          {vehiclesList.length > 0 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <Text strong style={{ fontSize: '14px' }}>
                Hiển thị {Math.min((currentPage - 1) * pageSize + 1, vehiclesList.length)} - {Math.min(currentPage * pageSize, vehiclesList.length)} / Tổng {vehiclesList.length} xe
              </Text>
              <div className="flex gap-2">
                <Button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  « Trước
                </Button>
                {Array.from({ length: Math.ceil(vehiclesList.length / pageSize) }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    type={currentPage === page ? "primary" : "default"}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button 
                  disabled={currentPage === Math.ceil(vehiclesList.length / pageSize)}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Sau »
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Modal tạo xe */}
      <Modal
        open={isCreateModalVisible}
        title="Tạo xe điện mới"
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleCreateVehicle}
          onFinishFailed={(errorInfo) => {
            console.error("❌ Form validation failed:", errorInfo);
            message.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
          }}
          preserve
        >
          <Alert
            message="Bước 1: Chọn Model → Version → Color để tìm Template"
            type="warning"
            showIcon
            className="mb-4"
          />

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Chọn Model (Mẫu xe)"
                name="modelId"
                rules={[{ required: true, message: "Vui lòng chọn model!" }]}
                tooltip="Chọn model trước để lọc các version phù hợp"
              >
                <Select
                  placeholder={models.length === 0 ? "Đang tải models..." : "Chọn model xe..."}
                  showSearch
                  onChange={handleModelChange}
                  optionFilterProp="children"
                  size="large"
                  loading={models.length === 0 && loading}
                  notFoundContent={
                    <Empty 
                      description="Không có model nào"
                    />
                  }
                >
                  {models.map((model) => {
                    const modelName = model.name || model.modelName || 'N/A';
                    
                    return (
                      <Option key={model.id} value={model.id}>
                        {modelName}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Chọn Version (Phiên bản)"
                name="versionId"
                rules={[{ required: true, message: "Vui lòng chọn version!" }]}
                tooltip={!selectedModelId ? "Vui lòng chọn model trước" : "Chọn version của model"}
              >
                <Select
                  placeholder={
                    !selectedModelId 
                      ? "Vui lòng chọn model trước..." 
                      : loadingTemplate 
                        ? "Đang tải versions..." 
                        : "Chọn version..."
                  }
                  showSearch
                  onChange={handleVersionChange}
                  optionFilterProp="children"
                  disabled={!selectedModelId}
                  loading={loadingTemplate && selectedModelId && versions.length === 0}
                  notFoundContent={
                    <Empty 
                      description={
                        !selectedModelId 
                          ? "Vui lòng chọn model trước" 
                          : "Model này chưa có version"
                      } 
                    />
                  }
                >
                  {versions.map((version) => {
                    // ✅ Lấy đúng tên version từ API response
                    const versionName = version.versionName || version.name || 'N/A';
                    
                    return (
                      <Option key={version.id} value={version.id}>
                        {versionName}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Chọn Màu sắc"
                name="colorId"
                rules={[{ required: true, message: "Vui lòng chọn màu!" }]}
                tooltip={availableColors.length === 0 ? "Vui lòng chọn version trước" : "Chỉ hiển thị màu có template"}
              >
                <Select
                  placeholder={availableColors.length === 0 ? "Vui lòng chọn version trước..." : "Chọn màu khả dụng..."}
                  showSearch
                  disabled={availableColors.length === 0}
                  onChange={handleVersionOrColorChange}
                  notFoundContent={<Empty description="Không có màu khả dụng" />}
                >
                  {availableColors.map((color) => {
                    const colorName = color.name || color.colorName || 'N/A';
                    const hexCode = color.hexCode || color.colorCode || '#ccc';
                    
                    return (
                      <Option key={color.id} value={color.id}>
                        <Space>
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              background: hexCode,
                              borderRadius: "50%",
                              border: "1px solid #d9d9d9",
                              display: "inline-block",
                            }}
                          />
                          {colorName}
                        </Space>
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>

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
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              {/* Header - Template ID */}
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-200">
                <CheckCircleOutlined className="text-green-600" />
                <Text strong className="text-sm">Template ID:</Text>
                <Text code copyable className="bg-blue-50 px-2 py-1 rounded text-xs font-mono">
                  {selectedTemplate.id}
                </Text>
              </div>

             {/* Images preview - Thumbnail nhỏ */}
{selectedTemplate.imgUrl && Array.isArray(selectedTemplate.imgUrl) && selectedTemplate.imgUrl.length > 0 && (
  <div className="mb-2 pb-2 border-b border-gray-200">
    <Text type="secondary" className="text-xs block mb-1">
      Hình ảnh ({selectedTemplate.imgUrl.length}):
    </Text>

    <Button
      type="primary"
      size="small"
      className="bg-blue-500 hover:bg-blue-600 text-white mt-1"
      onClick={() => window.open(selectedTemplate.imgUrl[0], "_blank")}
    >
      Xem ảnh full
    </Button>
  </div>
)}






              {/* Thông tin chi tiết - 4 cột */}
              <Row gutter={[8, 8]}>
                <Col span={6}>
                  <Text type="secondary" className="text-xs block">Version:</Text>
                  <Text strong className="text-sm text-blue-600">
                    {selectedTemplate.version?.versionName || 'N/A'}
                  </Text>
                </Col>

                <Col span={6}>
                  <Text type="secondary" className="text-xs block">Model:</Text>
                  <Text strong className="text-sm">
                    {selectedTemplate.version?.modelName || 'N/A'}
                  </Text>
                </Col>

                

               
              </Row>

              {/* Description - Nếu có */}
              {selectedTemplate.description && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <Text type="secondary" className="text-xs">Mô tả: </Text>
                  <Text className="text-xs">{selectedTemplate.description}</Text>
                </div>
              )}
            </div>
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
                label="VIN (VIN + 10 số)"
                name="vin"
                rules={[
                  { required: true, message: "Vui lòng nhập VIN!" },
                  { 
                    pattern: /^VIN\d{10}$/, 
                    message: "VIN phải có format: VIN + 10 số (VD: VIN1234567890)" 
                  },
                  {
                    validator: async (_, value) => {
                      if (value && vehiclesList.some(v => v.vin === value)) {
                        throw new Error('VIN này đã tồn tại! Vui lòng nhập VIN khác.');
                      }
                    }
                  }
                ]}
                extra="Format: VIN1234567890 (tổng 13 ký tự)"
              >
                <Input 
                  placeholder="VINxxxxxxxxxx (VIN + 10 số)" 
                  maxLength={13}
                  style={{ textTransform: 'uppercase' }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Chọn Kho"
                name="warehouseId"
                rules={[{ required: true, message: "Vui lòng chọn kho!" }]}
              >
                <Select placeholder="Chọn kho..." showSearch>
                  {warehouses.map((warehouse) => (
                    <Option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name || warehouse.warehouseName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Trạng thái"
                name="status"
                initialValue={1}
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
              <Form.Item 
                label="Ngày sản xuất" 
                name="manufactureDate"
                tooltip="Có thể để trống"
              >
                <Input type="date" placeholder="Chọn ngày sản xuất (tùy chọn)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Ngày nhập kho" 
                name="importDate"
                
              >
                <Input type="date" placeholder="Chọn ngày nhập kho (tùy chọn)" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item 
                label="Hạn bảo hành" 
                name="warrantyExpiryDate"
               
              >
                <Input type="date" placeholder="Chọn hạn bảo hành (tùy chọn)" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row justify="end" gutter={16}>
            <Col>
              <Button onClick={() => {
                setIsCreateModalVisible(false);
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
                disabled={!selectedTemplate}
                icon={<CarOutlined />}
              >
                Tạo Xe
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal xác nhận */}
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
      >
        {vehicleData && (
          <div className="space-y-2">
            <p><Text strong>Template ID:</Text> <Text code className="text-xs">{vehicleData.electricVehicleTemplateId}</Text></p>
            <p><Text strong>Version:</Text> {vehicleData._displayInfo?.versionName}</p>
            <p><Text strong>Màu:</Text> {vehicleData._displayInfo?.colorName}</p>
            <p><Text strong>Kho:</Text> {vehicleData._displayInfo?.warehouseName}</p>
            <p><Text strong>Số lượng xe:</Text> <Text className="text-blue-600 font-bold">{vehicleData._displayInfo?.vinCount}</Text></p>
            <Divider className="my-2" />
            <div className="bg-gray-50 p-3 rounded">
              <Text strong className="block mb-2">VIN List ({vehicleData.vinList?.length}):</Text>
              <div className="max-h-32 overflow-y-auto">
                {vehicleData.vinList?.map((vin, idx) => (
                  <div key={idx} className="text-xs font-mono bg-white px-2 py-1 mb-1 rounded border">
                    {idx + 1}. <Text code copyable>{vin}</Text>
                  </div>
                ))}
              </div>
            </div>
            <p><Text strong>Status:</Text> {vehicleData.status === 1 ? 'Khả dụng' : vehicleData.status}</p>
            <Divider className="my-2" />
            <Alert
              message="Payload theo đúng Swagger API schema"
              description={
                <div className="text-xs">
                  <p>✅ vinList: array of {vehicleData.vinList?.length} VINs</p>
                  <p>✅ manufactureDate, importDate, warrantyExpiryDate: nullable</p>
                </div>
              }
              type="info"
              showIcon
            />
          </div>
        )}
      </Modal>

      {/* Modal cập nhật thông tin xe */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EditOutlined className="text-blue-500" />
            Cập nhật thông tin xe
          </div>
        }
        open={isUpdateModalVisible}
        onCancel={() => {
          setIsUpdateModalVisible(false);
          updateForm.resetFields();
          setUpdatingVehicle(null);
        }}
        footer={null}
        width={600}
      >
        {updatingVehicle && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-sm"><Text strong>VIN:</Text> <Text code>{updatingVehicle.vin}</Text></p>
            <p className="text-sm"><Text strong>Template:</Text> {updatingVehicle.electricVehicleTemplate?.versionName || 'N/A'}</p>
            <p className="text-sm"><Text strong>Màu:</Text> {updatingVehicle.electricVehicleTemplate?.color?.colorName || 'N/A'}</p>
          </div>
        )}
        
        <Form
          form={updateForm}
          layout="vertical"
          onFinish={handleUpdateVehicle}
        >
          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value={1}><span className="mr-2">✅</span>Khả dụng (Available)</Option>
              <Option value={2}><span className="mr-2">⏳</span>Đang xử lý (Pending)</Option>
              <Option value={3}><span className="mr-2">📦</span>Đã đặt (Booked)</Option>
              <Option value={4}><span className="mr-2">🚚</span>Đang vận chuyển (InTransit)</Option>
              <Option value={5}><span className="mr-2">💰</span>Đã bán (Sold)</Option>
              <Option value={6}><span className="mr-2">🏢</span>Tại đại lý (AtDealer)</Option>
              <Option value={7}><span className="mr-2">🔧</span>Bảo trì (Maintenance)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Ngày nhập kho"
            name="importDate"
            tooltip="Ngày xe nhập vào kho"
          >
            <Input type="date" placeholder="Chọn ngày nhập" />
          </Form.Item>

          <Form.Item
            label="Hạn bảo hành"
            name="warrantyExpiryDate"
            tooltip="Ngày hết hạn bảo hành"
          >
            <Input type="date" placeholder="Chọn ngày hết hạn bảo hành" />
          </Form.Item>

          <Form.Item
            label="Ngày giao xe"
            name="deliveryDate"
            tooltip="Ngày giao xe cho khách hàng hoặc đại lý"
          >
            <Input type="date" placeholder="Chọn ngày giao xe" />
          </Form.Item>

          <Form.Item
            label="Ngày đại lý nhận"
            name="dealerReceivedDate"
            tooltip="Ngày đại lý nhận xe"
          >
            <Input type="date" placeholder="Chọn ngày đại lý nhận" />
          </Form.Item>

          <Divider />

          <Row justify="end" gutter={16}>
            <Col>
              <Button onClick={() => {
                setIsUpdateModalVisible(false);
                updateForm.resetFields();
                setUpdatingVehicle(null);
              }}>
                Hủy
              </Button>
            </Col>
            <Col>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<EditOutlined />}
              >
                Cập nhật
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        title={
          <div className="flex items-center gap-2">
            <EyeOutlined className="text-blue-500" />
            <span>Chi tiết xe điện</span>
          </div>
        }
        footer={null}
        width={900}
      >
        {selectedVehicle && (() => {
          const template = selectedVehicle.electricVehicleTemplate || {};
          const warehouse = selectedVehicle.warehouse || {};
          const version = template.version || {};
          const model = template.model || {};
          
          
          // Status mapping
          const statusMap = {
            1: { color: "success", text: "Khả dụng", icon: "✅" },
            2: { color: "warning", text: "Đang xử lý", icon: "⏳" },
            3: { color: "processing", text: "Đã đặt", icon: "📦" },
            4: { color: "default", text: "Đang vận chuyển", icon: "🚚" },
            5: { color: "error", text: "Đã bán", icon: "💰" },
            6: { color: "cyan", text: "Tại đại lý", icon: "🏢" },
            7: { color: "magenta", text: "Bảo trì", icon: "🔧" },
          };
          const statusConfig = statusMap[selectedVehicle.status] || { color: "default", text: "N/A", icon: "❓" };
          
          const formatDate = (dateString) => {
            if (!dateString) return <Text type="secondary" italic>Chưa có</Text>;
            return new Date(dateString).toLocaleDateString("vi-VN", {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            });
          };

          return (
            <div className="space-y-4">
              {/* Thông tin cơ bản */}
              <Card title="🚗 Thông tin cơ bản" size="small" className="shadow-sm">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong className="block mb-1">VIN:</Text>
                    <Text code copyable className="text-blue-600 font-mono">{selectedVehicle.vin}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong className="block mb-1">Template ID:</Text>
                    <Text code copyable className="font-mono text-xs">{template.evTemplateId || 'N/A'}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong className="block mb-1">Trạng thái:</Text>
                    <Badge 
                      status={statusConfig.color} 
                      text={<Text strong>{statusConfig.icon} {statusConfig.text}</Text>}
                    />
                  </Col>
                  <Col span={12}>
                    <Text strong className="block mb-1">Kho:</Text>
                    <Text>{warehouse.name || selectedVehicle.warehouseName || 'N/A'}</Text>
                  </Col>
                </Row>
              </Card>

              {/* Thông tin Template/Vehicle */}
              <Card title="📋 Thông tin xe" size="small" className="shadow-sm">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong className="block mb-1">Phiên bản:</Text>
                    <Text className="text-base">{template.versionName || version.versionName || 'N/A'}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong className="block mb-1">Model:</Text>
                    <Text className="text-base">{template.modelName || model.modelName || 'N/A'}</Text>
                  </Col>
                 
                  
                </Row>
              </Card>

              {/* Thông tin ngày tháng */}
              <Card title="📅 Thông tin ngày tháng" size="small" className="shadow-sm">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong className="block mb-1">Ngày sản xuất:</Text>
                    <Text>{formatDate(selectedVehicle.manufactureDate)}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong className="block mb-1">Ngày nhập kho:</Text>
                    <Text>{formatDate(selectedVehicle.importDate)}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong className="block mb-1">Hạn bảo hành:</Text>
                    <Text>{formatDate(selectedVehicle.warrantyExpiryDate)}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong className="block mb-1">Ngày giao xe:</Text>
                    <Text>{formatDate(selectedVehicle.deliveryDate)}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong className="block mb-1">Ngày đại lý nhận:</Text>
                    <Text>{formatDate(selectedVehicle.dealerReceivedDate)}</Text>
                  </Col>
                </Row>
              </Card>

              {/* Hình ảnh (nếu có) */}
              {template.images && template.images.length > 0 && (
                <Card title="🖼️ Hình ảnh" size="small" className="shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    {template.images.slice(0, 6).map((img, idx) => (
                      <Image
                        key={idx}
                        src={img.imageUrl}
                        alt={`Vehicle ${idx + 1}`}
                        width={120}
                        height={120}
                        className="object-cover rounded border"
                        preview={{
                          src: img.imageUrl
                        }}
                      />
                    ))}
                  </div>
                </Card>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
    </EVMStaffLayout>
  );
}

export default CreateElectricVehicle;

