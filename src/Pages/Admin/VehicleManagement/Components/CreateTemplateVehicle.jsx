import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Row,
  Col,
  Typography,
  Divider,
  Alert,
  Steps,
  Upload,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CarOutlined,
  ReloadOutlined,
  EyeOutlined,
  ZoomInOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { vehicleApi } from "../../../../App/EVMAdmin/VehiclesManagement/Vehicles";

const { Title, Text } = Typography;
const { Option } = Select;

/** ---- Popular Colors Map ---- */
const popularColors = [
  { name: "Đỏ Cherry", code: "#DC143C" },
  { name: "Trắng Ngọc Trai", code: "#F8F8FF" },
  { name: "Đen Obsidian", code: "#0B0B0B" },
  { name: "Xanh Ocean", code: "#006994" },
  { name: "Bạc Metallic", code: "#C0C0C0" },
  { name: "Xám Titan", code: "#708090" },
  { name: "Xanh Emerald", code: "#50C878" },
  { name: "Vàng Gold", code: "#FFD700" },
  { name: "Cam Sunset", code: "#FF4500" },
  { name: "Tím Royal", code: "#663399" },
  { name: "Xanh Navy", code: "#000080" },
  { name: "Hồng Rose", code: "#FF69B4" },
  { name: "Nâu Chocolate", code: "#8B4513" },
  { name: "Xanh Mint", code: "#98FB98" },
  { name: "Cam Coral", code: "#FF7F50" },
];

/** ---- Helper: Get color name from code ---- */
const getColorNameByCode = (colorCode) => {
  if (!colorCode) return null;
  const found = popularColors.find(
    (c) => c.code.toUpperCase() === colorCode.toUpperCase()
  );
  return found ? found.name : null;
};

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

// ✅ Component TẠO TEMPLATE (không có VIN, có upload ảnh)
function CreateTemplateVehicle() {
  const [loading, setLoading] = useState(false);
  const [templatesList, setTemplatesList] = useState([]);
  const [models, setModels] = useState([]);
  const [versions, setVersions] = useState([]);
  const [colors, setColors] = useState([]);
  const [filteredVersions, setFilteredVersions] = useState([]);

  const [form] = Form.useForm();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Upload state
  const [uploadedImages, setUploadedImages] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  
  // View detail state
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Edit state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  // Delete state
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState(null);

  useEffect(() => {
    loadAllTemplates();
    loadModelsVersionsColors();
  }, []);

  // ✅ Load models, versions, colors cho dropdown
  const loadModelsVersionsColors = async () => {
    try {
      const [modelsRes, versionsRes, colorsRes] = await Promise.all([
        vehicleApi.getAllModels(),
        vehicleApi.getAllVersions(),
        vehicleApi.getAllColors(),
      ]);

      if (modelsRes.success || modelsRes.isSuccess) {
        setModels(modelsRes.data || modelsRes.result || []);
      }
      if (versionsRes.success || versionsRes.isSuccess) {
        setVersions(versionsRes.data || versionsRes.result || []);
      }
      if (colorsRes.success || colorsRes.isSuccess) {
        setColors(colorsRes.data || colorsRes.result || []);
      }
    } catch (err) {
      console.error("❌ Error loading dropdown data:", err);
    }
  };

  // ✅ Load tất cả TEMPLATES
  const loadAllTemplates = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading all templates...");
      
      const result = await vehicleApi.getAllTemplateVehicles(); // ✅ SỬA: Gọi đúng tên hàm

      console.log("📥 Template API Result:", result);

      if (result.isSuccess || result.success) {
        const templatesData = result.result || result.data || [];
        console.log(`✅ Loaded ${templatesData.length} templates:`, templatesData);
        
        // Log chi tiết về isActive
        const activeCount = templatesData.filter(t => t.isActive === true || t.isActive === 1).length;
        const inactiveCount = templatesData.filter(t => t.isActive === false || t.isActive === 0).length;
        console.log(`📊 Templates status: Active=${activeCount}, Inactive=${inactiveCount}`);
        
        setTemplatesList(templatesData);
        
        if (templatesData.length === 0) {
          message.info("Chưa có template nào.");
        } else {
          message.success(`Đã tải ${templatesData.length} templates (${activeCount} hoạt động, ${inactiveCount} đã xóa)`);
        }
      } else {
        console.warn("⚠️ API returned unsuccessful:", result);
        message.error(result.error || "Không thể tải templates!");
        setTemplatesList([]);
      }
    } catch (error) {
      console.error("❌ Error loading templates:", error);
      message.error("Lỗi khi tải templates!");
      setTemplatesList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    console.log("🗑️ DELETE BUTTON CLICKED! ID:", id);
    
    if (!id) {
      message.error("Không tìm thấy ID template để xóa!");
      return;
    }

    // Mở modal xác nhận
    setDeletingTemplateId(id);
    setIsDeleteModalVisible(true);
  };

  // Xác nhận xóa template
  const confirmDelete = async () => {
    if (!deletingTemplateId) return;
    
    console.log("🗑️ Confirming delete for ID:", deletingTemplateId);
    setLoading(true);
    setIsDeleteModalVisible(false);
    
    try {
      message.loading({ content: "Đang xóa template...", key: "deleting", duration: 0 });
      
      const res = await vehicleApi.deleteTemplateVehicle(deletingTemplateId);
      console.log("🗑️ Delete API response:", res);
      
      message.destroy("deleting");
      
      // Xử lý response trực tiếp
      if (res?.success || res?.isSuccess) {
        message.success(res?.message || "✅ Đã xóa template thành công!");
        setDeletingTemplateId(null);
        await loadAllTemplates();
      } else {
        message.error(res?.message || res?.error || "❌ Xóa template thất bại");
      }
    } catch (err) {
      console.error("❌ Delete error:", err);
      message.destroy("deleting");
      message.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Edit Template
  const handleEdit = (record) => {
    console.log("✏️ Editing template:", record);
    setEditingTemplate(record);
    
    // Set form values
    form.setFieldsValue({
      price: record.price,
      description: record.description,
    });
    
    setIsEditModalVisible(true);
  };

  // ✅ Handle Submit Edit
  const handleSubmitEdit = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      const payload = {
        price: Number(values.price),
        description: values.description || "",
        attachmentKeys: [], // Keep existing images or add new ones if needed
      };

      console.log("📤 Updating template:", editingTemplate.id, payload);

      message.loading({ content: "Đang cập nhật template...", key: "updating", duration: 0 });
      
      const res = await vehicleApi.updateTemplateVehicle(editingTemplate.id, payload);
      message.destroy("updating");

      const normalized = normalizeApi(res);
      if (normalized.success) {
        message.success(normalized.message || "✅ Cập nhật template thành công!");
        setIsEditModalVisible(false);
        form.resetFields();
        setEditingTemplate(null);
        await loadAllTemplates();
      } else {
        message.error(normalized.message || "Không thể cập nhật template");
      }
    } catch (err) {
      message.destroy("updating");
      message.error(extractErrorMessage(err));
      console.error("UPDATE TEMPLATE ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Columns cho bảng TEMPLATES - Gọn gàng và dễ xem
  const templateColumns = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (_, __, index) => <Text strong>{index + 1}</Text>,
    },
    {
      title: "Model / Version",
      key: "modelVersion",
      width: 200,
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{record.version?.versionName || "N/A"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.version?.modelName || "N/A"}
          </Text>
        </div>
      ),
    },
    {
      title: "Màu sắc",
      key: "color",
      width: 150,
      render: (_, record) => {
        const hexCode = record.color?.colorCode || record.color?.hexCode || "#ccc";
        const colorName = record.color?.colorName || "N/A";
        // ✅ Lấy tên màu đẹp từ popularColors nếu có
        const prettyName = getColorNameByCode(hexCode) || colorName;
        
        // 🔍 Debug log để kiểm tra
        console.log("Color Debug:", { 
          hexCode, 
          colorName, 
          prettyName,
          found: getColorNameByCode(hexCode) ? "✅ Matched" : "❌ No match"
        });
        
        return (
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 32,
                height: 32,
                backgroundColor: hexCode,
                borderRadius: "6px",
                border: "2px solid #e0e0e0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
            <div>
              <Text strong style={{ fontSize: 12 }}>{prettyName}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 10 }}>{hexCode}</Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      width: 130,
      align: "right",
      render: (price) => (
        <Text strong style={{ color: "#52c41a", fontSize: 13 }}>
          {price?.toLocaleString('vi-VN')} ₫
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      align: "center",
      render: (isActive) => {
        const status = isActive === true || isActive === 1;
        return (
          <div className="flex items-center justify-center gap-2">
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: status ? "#52c41a" : "#ff4d4f",
              }}
            />
            <Text strong style={{ color: status ? "#52c41a" : "#ff4d4f", fontSize: 12 }}>
              {status ? "Hoạt động" : "Không hoạt động"}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text || "Chưa có mô tả"}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {text || "Chưa có mô tả"}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                console.log("👁️ Viewing template:", record);
                setSelectedTemplate(record);
                setIsViewModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Sửa template">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa template">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                console.log("🖱️ Delete button ONCLICK fired! Record:", record);
                handleDelete(record.id);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleCreateModal = () => {
    form.resetFields();
    setUploadedImages([]);
    setCurrentStep(0);
    setIsCreateModalVisible(true);
  };

  const customUpload = ({ onSuccess }) =>
    setTimeout(() => onSuccess("ok"), 100);

  const handleImageChange = ({ fileList }) => {
    let list = [...fileList];
    if (list.length > 8) {
      message.warning("Chỉ được upload tối đa 8 hình ảnh!");
      list = list.slice(0, 8);
    }
    setUploadedImages(list);
  };

  const handlePreview = async (file) => {
    setPreviewImage(file.thumbUrl || file.url);
    setPreviewVisible(true);
  };

  const steps = [
    { title: "Thông tin template & hình ảnh" },
    { title: "Xác nhận thông tin" },
  ];

  const next = () => {
    form
      .validateFields()
      .then(() => setCurrentStep((s) => s + 1))
      .catch(() => message.warning("Vui lòng nhập đủ thông tin"));
  };

  const prev = () => setCurrentStep((s) => s - 1);

  // ✅ Handle submit tạo TEMPLATE
  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      // 1) Upload ảnh
      message.loading({ content: "Đang upload ảnh...", key: "uploading", duration: 0 });
      let attachmentKeys = [];
      try {
        const uploadPromises = uploadedImages.map((f) =>
          vehicleApi.uploadImageAndGetKey(f.originFileObj)
        );
        attachmentKeys = (await Promise.all(uploadPromises)).filter(Boolean);
        message.success({ content: `Upload thành công ${attachmentKeys.length} ảnh!`, key: "uploading", duration: 1.2 });
      } catch (err) {
        message.destroy("uploading");
        throw err;
      }

      // 2) Tạo template
      const payload = {
        versionId: values.versionId,
        colorId: values.colorId,
        price: Number(values.costPrice),
        description: values.description || "New EV Template",
        attachmentKeys,
      };

      console.log("📤 Creating template with payload:", payload);

      message.loading({ content: "Đang tạo template...", key: "creating", duration: 0 });
      
      const res = await vehicleApi.createTemplateVehicle(payload);
      message.destroy("creating");

      const normalized = normalizeApi(res);
      if (normalized.success) {
        message.success(normalized.message || "🎉 Tạo template thành công!");
        setIsCreateModalVisible(false);
        setCurrentStep(0);
        form.resetFields();
        setUploadedImages([]);
        await loadAllTemplates();
      } else {
        message.error(normalized.message || "Không thể tạo template");
      }
    } catch (err) {
      message.destroy("uploading");
      message.destroy("creating");
      message.error(extractErrorMessage(err));
      console.error("CREATE TEMPLATE ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header với các nút action */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <Title level={4} className="m-0">🎨 Tạo & Quản lý Template Xe Điện</Title>
          <Text type="secondary">Quản lý các template xe điện (version + color)</Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadAllTemplates}
            loading={loading}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateModal}
            size="large"
          >
            Tạo Template Mới
          </Button>
        </Space>
      </div>

      <Alert
        message="Danh sách Template Xe Điện"
        description={
          <div>
            <p className="mb-1">
              Tổng: <strong>{templatesList.length}</strong> templates |{" "}
              Hoạt động: <strong className="text-green-600">{templatesList.filter(t => t.isActive === true || t.isActive === 1).length}</strong> |{" "}
              Đã xóa: <strong className="text-red-600">{templatesList.filter(t => t.isActive === false || t.isActive === 0).length}</strong>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Khi xóa template, trạng thái isActive sẽ chuyển từ <strong>true → false</strong> (soft delete)
            </p>
          </div>
        }
        type="info"
        showIcon
        closable
        className="mb-4"
      />

      <Card className="shadow-sm">
        <Table
          columns={templateColumns}
          dataSource={templatesList}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} templates`,
            pageSizeOptions: ['10', '20', '50'],
          }}
          locale={{
            emptyText: (
              <div className="py-12 text-center">
                <CarOutlined style={{ fontSize: 56, color: "#d9d9d9" }} />
                <p className="text-gray-500 mt-3 text-base">Chưa có template nào</p>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleCreateModal}
                  className="mt-2"
                >
                  Tạo template đầu tiên
                </Button>
              </div>
            ),
          }}
        />
      </Card>

        {/* Modal tạo template */}
        <Modal
          open={isCreateModalVisible}
          title="Tạo template xe điện mới"
          onCancel={() => setIsCreateModalVisible(false)}
          footer={null}
          width={980}
          destroyOnClose
        >
          <Steps
            current={currentStep}
            items={steps}
            style={{ marginBottom: 24 }}
          />
          <Form form={form} layout="vertical" onFinish={handleSubmit} preserve>
            {currentStep === 0 && (
              <>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label="Model"
                      name="modelId"
                      rules={[{ required: true, message: "Chọn model" }]}
                    >
                      <Select
                        placeholder="Chọn model"
                        onChange={(id) => {
                          const list = versions.filter((v) => v.modelId === id);
                          setFilteredVersions(list);
                          form.setFieldValue("versionId", null);
                        }}
                        showSearch
                        optionFilterProp="children"
                      >
                        {models.map((m) => (
                          <Option key={m.id} value={m.id}>
                            {m.modelName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item
                      label="Version"
                      name="versionId"
                      rules={[{ required: true, message: "Chọn version" }]}
                    >
                      <Select
                        placeholder="Chọn version"
                        showSearch
                        optionFilterProp="children"
                      >
                        {filteredVersions.map((v) => (
                          <Option key={v.id} value={v.id}>
                            {v.versionName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item
                      label="Màu sắc"
                      name="colorId"
                      rules={[{ required: true, message: "Chọn màu sắc" }]}
                    >
                      <Select
                        placeholder="Chọn màu"
                        showSearch
                        optionFilterProp="children"
                      >
                        {colors.map((c) => (
                          <Option key={c.id} value={c.id}>
                            <Space>
                              <span
                                style={{
                                  width: 16,
                                  height: 16,
                                  background: c.colorCode,
                                  borderRadius: "50%",
                                  border: "1px solid #d9d9d9",
                                  display: "inline-block",
                                }}
                              />
                              {c.colorName}
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label="Giá (VND)"
                      name="costPrice"
                      rules={[{ required: true, message: "Nhập giá template" }]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        formatter={(v) =>
                          `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item label="Mô tả" name="description">
                      <textarea
                        rows={3}
                        className="w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Mô tả về template..."
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={
                    <div className="flex items-center justify-between w-full">
                      <span>Hình ảnh template (tối đa 8)</span>
                      <span className="text-gray-500 text-sm">
                        Đã chọn: <b>{uploadedImages.length}</b>/8
                      </span>
                    </div>
                  }
                >
                  <Upload
                    listType="picture-card"
                    fileList={uploadedImages}
                    onChange={handleImageChange}
                    onPreview={handlePreview}
                    customRequest={customUpload}
                    accept="image/*"
                  >
                    {uploadedImages.length >= 8 ? null : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    )}
                  </Upload>
                  <div className="text-xs text-gray-500">
                    Mỗi ảnh &lt; 5MB. Tối đa 8 ảnh.
                  </div>
                </Form.Item>
              </>
            )}

            {currentStep === 1 && (
              <Card>
                <Alert
                  type="info"
                  showIcon
                  message="Xác nhận thông tin trước khi tạo template"
                  style={{ marginBottom: 16 }}
                />
                <Row gutter={16}>
                  <Col span={12}>
                    <p>
                      <strong>Model:</strong>{" "}
                      {models.find((m) => m.id === form.getFieldValue("modelId"))
                        ?.modelName || "—"}
                    </p>
                    <p>
                      <strong>Version:</strong>{" "}
                      {
                        versions.find(
                          (v) => v.id === form.getFieldValue("versionId")
                        )?.versionName
                      }
                    </p>
                    <p>
                      <strong>Màu sắc:</strong>{" "}
                      {(() => {
                        const selectedColor = colors.find((c) => c.id === form.getFieldValue("colorId"));
                        const colorCode = selectedColor?.colorCode;
                        const prettyName = getColorNameByCode(colorCode) || selectedColor?.colorName;
                        return prettyName || "—";
                      })()}
                    </p>
                    <p>
                      <strong>Giá:</strong>{" "}
                      {(form.getFieldValue("costPrice") || 0).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      ₫
                    </p>
                    <p>
                      <strong>Mô tả:</strong>{" "}
                      {form.getFieldValue("description") || (
                        <span className="text-gray-400">—</span>
                      )}
                    </p>
                  </Col>
                  <Col span={12}>
                    {uploadedImages.length > 0 && (
                      <>
                        <strong>Ảnh đã chọn:</strong>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                            marginTop: 8,
                          }}
                        >
                          {uploadedImages.map((f, i) => (
                            <div
                              key={i}
                              style={{ position: "relative", cursor: "pointer" }}
                              onClick={() => {
                                setPreviewImage(f.thumbUrl || f.url);
                                setPreviewVisible(true);
                              }}
                            >
                              <img
                                src={f.thumbUrl || f.url}
                                alt={`img-${i}`}
                                style={{
                                  width: 90,
                                  height: 90,
                                  borderRadius: 8,
                                  objectFit: "cover",
                                  border: "1px solid #d9d9d9",
                                }}
                              />
                              <ZoomInOutlined
                                style={{
                                  position: "absolute",
                                  bottom: 6,
                                  right: 6,
                                  color: "#fff",
                                  fontSize: 14,
                                  textShadow: "0 0 4px rgba(0,0,0,0.5)",
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </Col>
                </Row>
              </Card>
            )}

            <Divider />
            <div className="text-right">
              <Space>
                {currentStep > 0 && (
                  <Button onClick={prev} disabled={loading}>
                    Quay lại
                  </Button>
                )}
                {currentStep < 1 && (
                  <Button type="primary" onClick={next} disabled={loading}>
                    Tiếp theo
                  </Button>
                )}
                {currentStep === 1 && (
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Tạo Template
                  </Button>
                )}
              </Space>
            </div>
          </Form>
        </Modal>

        {/* Modal xem chi tiết template */}
        <Modal
          open={isViewModalVisible}
          onCancel={() => {
            setIsViewModalVisible(false);
            setSelectedTemplate(null);
          }}
          title={
            <div className="flex items-center gap-2">
              <CarOutlined style={{ color: "#1890ff", fontSize: 18 }} />
              <span className="text-lg">Chi tiết Template</span>
            </div>
          }
          footer={null}
          width={900}
          destroyOnClose
        >
          {selectedTemplate && (
            <div className="pt-2">
              {/* Thông tin cơ bản */}
              <Card size="small" className="bg-gray-50 mb-4">
                <Row gutter={[12, 8]}>
               
                  <Col span={8}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>Model:</Text>
                      <br />
                      <Text strong style={{ fontSize: 13 }}>
                        {selectedTemplate.version?.modelName || 'N/A'}
                      </Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>Version:</Text>
                      <br />
                      <Text strong style={{ fontSize: 13 }}>
                        {selectedTemplate.version?.versionName || 'N/A'}
                      </Text>
                    </div>
                  </Col>
                  
                  <Col span={12}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>Màu sắc:</Text>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            backgroundColor: selectedTemplate.color?.colorCode || selectedTemplate.color?.hexCode ,
                            borderRadius: "6px",
                            border: "2px solid #d9d9d9",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <Text strong style={{ fontSize: 12 }}>
                            {getColorNameByCode(selectedTemplate.color?.colorCode) || selectedTemplate.color?.colorName || 'Chưa rõ'}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 10 }}>
                            {selectedTemplate.color?.colorCode || selectedTemplate.color?.hexCode || '#cccccc'}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Col>
                  
                  <Col span={12}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>Giá bán:</Text>
                      <br />
                      <Text strong style={{ fontSize: 18, color: "#52c41a" }}>
                        {selectedTemplate.price?.toLocaleString('vi-VN')} ₫
                      </Text>
                    </div>
                  </Col>
                  
                  <Col span={24}>
                    <div className="mt-1">
                      <Text type="secondary" style={{ fontSize: 11 }}>Mô tả:</Text>
                      <br />
                      <Text style={{ fontSize: 12 }}>
                        {selectedTemplate.description || 'Chưa có mô tả'}
                      </Text>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Hình ảnh */}
              {(() => {
                const imgUrls = Array.isArray(selectedTemplate.imgUrl) 
                  ? selectedTemplate.imgUrl 
                  : [];
                
                console.log("📸 Template images:", imgUrls);
                console.log("🎨 Color data:", selectedTemplate.color);

                return imgUrls.length > 0 ? (
                  <div>
                    <Divider orientation="left" className="!my-2">
                      <Text strong style={{ fontSize: 12 }}>
                        Hình ảnh ({imgUrls.length} ảnh)
                      </Text>
                    </Divider>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)', 
                      gap: '12px',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      padding: '4px'
                    }}>
                      {imgUrls.map((url, idx) => (
                        <div 
                          key={idx} 
                          className="cursor-pointer hover:opacity-80 transition-opacity group relative"
                          onClick={() => {
                            console.log("🖼️ Opening image:", url);
                            setPreviewImage(url);
                            setPreviewVisible(true);
                          }}
                        >
                          <img
                            src={url}
                            alt={`Template ${idx + 1}`}
                            style={{
                              width: '100%',
                              height: '160px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #e0e0e0'
                            }}
                            onError={(e) => {
                              console.error("❌ Image load error:", url);
                              e.target.src = 'https://via.placeholder.com/300x160?text=No+Image';
                            }}
                          />
                          <div 
                            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center"
                            style={{ borderRadius: '8px' }}
                          >
                            <ZoomInOutlined 
                              className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ fontSize: 28 }}
                            />
                          </div>
                          <Text 
                            type="secondary" 
                            style={{ fontSize: 10, display: 'block', textAlign: 'center', marginTop: '4px' }}
                          >
                            Ảnh {idx + 1}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Alert
                    message="Chưa có hình ảnh"
                    description="Template này chưa có hình ảnh nào"
                    type="info"
                    showIcon
                    icon={<CarOutlined />}
                    className="mt-2"
                  />
                );
              })()}
            </div>
          )}
        </Modal>

        {/* Modal sửa template */}
        <Modal
          open={isEditModalVisible}
          onCancel={() => {
            setIsEditModalVisible(false);
            setEditingTemplate(null);
            form.resetFields();
          }}
          title={
            <div className="flex items-center gap-2">
              <EditOutlined style={{ color: "#faad14", fontSize: 18 }} />
              <span className="text-lg">Chỉnh sửa Template</span>
            </div>
          }
          footer={null}
          width={700}
          destroyOnClose
        >
          {editingTemplate && (
            <div>
              {/* Hiển thị thông tin không thể sửa */}
              <Alert
                message="Thông tin template (không thể thay đổi)"
                type="info"
                showIcon
                className="mb-4"
              />
              
              <Card size="small" className="bg-gray-50 mb-4">
                <Row gutter={[12, 8]}>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Model:</Text>
                    <br />
                    <Text strong style={{ fontSize: 13 }}>
                      {editingTemplate.version?.modelName || 'N/A'}
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Version:</Text>
                    <br />
                    <Text strong style={{ fontSize: 13 }}>
                      {editingTemplate.version?.versionName || 'N/A'}
                    </Text>
                  </Col>
                  <Col span={24}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Màu sắc:</Text>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          backgroundColor: editingTemplate.color?.colorCode || editingTemplate.color?.hexCode || "#cccccc",
                          borderRadius: "6px",
                          border: "2px solid #d9d9d9",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                        }}
                      />
                      <Text strong style={{ fontSize: 12 }}>
                        {getColorNameByCode(editingTemplate.color?.colorCode) || editingTemplate.color?.colorName || 'N/A'}
                      </Text>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Form sửa */}
              <Form form={form} layout="vertical" onFinish={handleSubmitEdit}>
                <Form.Item
                  label="Giá bán (VND)"
                  name="price"
                  rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
                    size="large"
                  />
                </Form.Item>

                <Form.Item label="Mô tả" name="description">
                  <textarea
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập mô tả về template..."
                  />
                </Form.Item>

                <Alert
                  message="Lưu ý"
                  description="Hiện tại chỉ có thể sửa giá và mô tả. Không thể thay đổi model, version, màu sắc hoặc hình ảnh."
                  type="warning"
                  showIcon
                  className="mb-4"
                />

                <Divider className="!my-3" />

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      setIsEditModalVisible(false);
                      setEditingTemplate(null);
                      form.resetFields();
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading} icon={<EditOutlined />}>
                    Cập nhật
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </Modal>

        {/* Modal xem ảnh lớn */}
        <Modal
          open={previewVisible}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
          width={700}
          centered
        >
          <img 
            alt="preview" 
            style={{ 
              width: "100%", 
              maxHeight: "70vh",
              objectFit: "contain"
            }} 
            src={previewImage} 
          />
        </Modal>

        {/* Modal xác nhận xóa */}
        <Modal
          open={isDeleteModalVisible}
          title={
            <div className="flex items-center gap-2">
              <DeleteOutlined className="text-red-500 text-xl" />
              <span>Xác nhận xóa template</span>
            </div>
          }
          onCancel={() => {
            setIsDeleteModalVisible(false);
            setDeletingTemplateId(null);
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsDeleteModalVisible(false);
                setDeletingTemplateId(null);
              }}
            >
              Hủy
            </Button>,
            <Button
              key="delete"
              type="primary"
              danger
              loading={loading}
              onClick={confirmDelete}
              icon={<DeleteOutlined />}
            >
              Xác nhận xóa
            </Button>,
          ]}
        >
          <Alert
            message="Template sẽ được chuyển sang trạng thái 'Đã xóa'"
            description={
              <div>
                <p className="text-sm">
                  Template sẽ không bị xóa vĩnh viễn khỏi hệ thống, chỉ chuyển trạng thái.
                </p>
              </div>
            }
            type="warning"
            showIcon
            className="mb-4"
          />
          <div className="text-gray-700">
            <p className="mb-2">Template ID: <Text code className="text-blue-600">{deletingTemplateId}</Text></p>
          </div>
        </Modal>
      </div>
  );
}

export default CreateTemplateVehicle;
