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
  DatePicker,
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
  Typography,
  Divider,
  Alert,
  Steps,
  Upload,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CarOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { vehicleApi } from "../../../../App/EVMAdmin/VehiclesManagement/Vehicles";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

// Helper function cho VIN
const generateSampleVIN = () => {
  const chars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789";
  let vin = "";
  for (let i = 0; i < 17; i++) {
    vin += chars[Math.floor(Math.random() * chars.length)];
  }
  return vin;
};

function CreateElectricVehicle() {
  // State chính
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [versions, setVersions] = useState([]);
  const [colors, setColors] = useState([]);

  // Modal states
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Form states
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  // Upload states
  const [uploadedImages, setUploadedImages] = useState([]);
  const [attachmentKeys, setAttachmentKeys] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // Load data khi component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Load tất cả dữ liệu cần thiết
  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadVehicles(),
        loadWarehouses(),
        loadVersions(),
        loadColors(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load danh sách xe điện
  const loadVehicles = async () => {
    try {
      const result = await vehicleApi.getAllVehicles();
      if (result.success) {
        setVehicles(result.data || []);
      } else {
        setVehicles([]);
      }
    } catch (error) {
      console.error("Error loading vehicles:", error);
      setVehicles([]);
    }
  };

  // Load danh sách kho
  const loadWarehouses = async () => {
    try {
      const result = await vehicleApi.getAllWarehouses();
      if (result && result.success && result.data) {
        const formattedWarehouses = result.data.map((warehouse, index) => ({
          id: warehouse.id,
          name: warehouse.dealerId || `Warehouse #${index + 1}`,
          displayName: `${
            warehouse.dealerId || `Warehouse #${index + 1}`
          } (Type: ${warehouse.warehouseType || 2})`,
        }));
        setWarehouses(formattedWarehouses);
      } else {
        // Mock data khi API chưa sẵn sàng
        const mockWarehouses = [
          {
            id: "0199d3ef-5fd1-7f77-84f7-89140441fc52",
            name: "Test Warehouse 1",
            displayName: "Test Warehouse 1 (Type: 2)",
          },
          {
            id: "0199d3ef-ddd1-789f-a4eb-26f47fee63a8",
            name: "Test Warehouse 2",
            displayName: "Test Warehouse 2 (Type: 2)",
          },
        ];
        setWarehouses(mockWarehouses);
        message.warning(
          "Đang dùng dữ liệu test. API warehouses có thể chưa sẵn sàng."
        );
      }
    } catch (error) {
      console.error("Error loading warehouses:", error);
      const mockWarehouses = [
        {
          id: "0199d3ef-5fd1-7f77-84f7-89140441fc52",
          name: "Test Warehouse 1",
          displayName: "Test Warehouse 1 (Type: 2)",
        },
        {
          id: "0199d3ef-ddd1-789f-a4eb-26f47fee63a8",
          name: "Test Warehouse 2",
          displayName: "Test Warehouse 2 (Type: 2)",
        },
      ];
      setWarehouses(mockWarehouses);
      message.warning("Lỗi API. Đang dùng dữ liệu test để tiếp tục.");
    }
  };

  // Load danh sách versions
  const loadVersions = async () => {
    try {
      const result = await vehicleApi.getAllVersions();
      if (result.success && result.data) {
        setVersions(result.data);
      } else {
        setVersions([]);
      }
    } catch (error) {
      console.error("Error loading versions:", error);
      setVersions([]);
    }
  };

  // Load danh sách màu sắc
  const loadColors = async () => {
    try {
      const result = await vehicleApi.getAllColors();
      if (result.success && result.data) {
        setColors(result.data);
      } else {
        setColors([]);
      }
    } catch (error) {
      console.error("Error loading colors:", error);
      setColors([]);
    }
  };

  // Xem chi tiết xe
  const handleViewVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsViewModalVisible(true);
  };

  // Xóa xe
  const handleDeleteVehicle = async (vehicleId) => {
    setLoading(true);
    try {
      const result = await vehicleApi.deleteVehicle(vehicleId);
      if (result.success) {
        message.success("Xóa xe điện thành công!");
        await loadVehicles();
      } else {
        message.error(result.error || "Không thể xóa xe điện");
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      message.error("Lỗi khi xóa xe điện");
    } finally {
      setLoading(false);
    }
  };

  // Submit form tạo xe
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const finalFormData = { ...formData, ...values };

      // Chuẩn bị dữ liệu xe
      const vehicleData = {
        warehouseId: finalFormData.warehouseId,
        versionId: finalFormData.versionId,
        colorId: finalFormData.colorId,
        vin: finalFormData.vin,
        status: finalFormData.status || 1,
        manufactureDate: finalFormData.manufactureDate?.format
          ? finalFormData.manufactureDate.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
          : finalFormData.manufactureDate,
        importDate: finalFormData.importDate?.format
          ? finalFormData.importDate.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
          : finalFormData.importDate,
        warrantyExpiryDate: finalFormData.warrantyExpiryDate?.format
          ? finalFormData.warrantyExpiryDate.format(
              "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
            )
          : finalFormData.warrantyExpiryDate,
        costPrice: Number(finalFormData.costPrice) || 0,
        attachmentKeys: attachmentKeys || [], // Lấy từ state, fallback về array rỗng
      };

      // 🔍 DEBUG: Log chi tiết data trước khi gửi
      console.log("=== FE DATA VALIDATION ===");
      console.log(
        "Vehicle data to send:",
        JSON.stringify(vehicleData, null, 2)
      );
      console.log("Field types check:");
      console.log(
        "- warehouseId:",
        typeof vehicleData.warehouseId,
        vehicleData.warehouseId
      );
      console.log(
        "- versionId:",
        typeof vehicleData.versionId,
        vehicleData.versionId
      );
      console.log(
        "- colorId:",
        typeof vehicleData.colorId,
        vehicleData.colorId
      );
      console.log("- vin:", typeof vehicleData.vin, vehicleData.vin);
      console.log("- status:", typeof vehicleData.status, vehicleData.status);
      console.log(
        "- costPrice:",
        typeof vehicleData.costPrice,
        vehicleData.costPrice
      );
      console.log(
        "- attachmentKeys:",
        Array.isArray(vehicleData.attachmentKeys),
        vehicleData.attachmentKeys
      );
      console.log("📎 AttachmentKeys from state:", attachmentKeys);
      console.log("📎 AttachmentKeys in payload:", vehicleData.attachmentKeys);

      // Validation cơ bản
      if (!vehicleData.warehouseId) {
        message.error("Vui lòng chọn kho!");
        setLoading(false);
        return;
      }
      if (!vehicleData.versionId) {
        message.error("Vui lòng chọn phiên bản xe!");
        setLoading(false);
        return;
      }
      if (!vehicleData.colorId) {
        message.error("Vui lòng chọn màu sắc!");
        setLoading(false);
        return;
      }
      if (!vehicleData.vin) {
        message.error("Vui lòng nhập VIN!");
        setLoading(false);
        return;
      }

      const result = await vehicleApi.createVehicle(vehicleData);
      if (result.success) {
        message.success(result.message || "Tạo xe điện mới thành công!");

        const selectedVersion = versions.find(
          (v) => v.id === finalFormData.versionId
        );
        const selectedColor = colors.find(
          (c) => c.id === finalFormData.colorId
        );
        const selectedWarehouse = warehouses.find(
          (w) => w.id === finalFormData.warehouseId
        );

        Modal.success({
          title: (
            <Space>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
              Tạo Xe Điện thành công!
            </Space>
          ),
          content: (
            <div style={{ marginTop: 16 }}>
              <Alert
                message="Thông tin Xe Điện"
                description={
                  <div>
                    <p>
                      <strong>VIN:</strong> {vehicleData.vin}
                    </p>
                    <p>
                      <strong>Version:</strong>{" "}
                      {selectedVersion?.versionName || "N/A"}
                    </p>
                    <p>
                      <strong>Màu sắc:</strong>{" "}
                      {selectedColor?.colorName || "N/A"}
                    </p>
                    <p>
                      <strong>Kho:</strong> {selectedWarehouse?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Giá cost:</strong>{" "}
                      {vehicleData.costPrice?.toLocaleString("vi-VN")} ₫
                    </p>
                    {result.data?.id && (
                      <p>
                        <strong>Vehicle ID:</strong>
                        <Text code copyable style={{ marginLeft: 8 }}>
                          {result.data.id}
                        </Text>
                      </p>
                    )}
                  </div>
                }
                type="success"
                showIcon
              />
            </div>
          ),
          width: 600,
        });

        // Reset form
        setIsCreateModalVisible(false);
        form.resetFields();
        setFormData({});
        setUploadedImages([]);
        setAttachmentKeys([]);
        await loadVehicles();
      } else {
        message.error(result.error || "Không thể tạo xe điện");
      }
    } catch (error) {
      console.error("Error creating vehicle:", error);
      message.error("Lỗi khi tạo xe điện");
    } finally {
      setLoading(false);
    }
  };

  // Chuyển step với validation
  const handleNextStep = async () => {
    try {
      const fieldsToValidate = getRequiredFieldsForStep(currentStep);
      await form.validateFields(fieldsToValidate);

      const currentFormValues = form.getFieldsValue();
      const updatedFormData = { ...formData, ...currentFormValues };
      setFormData(updatedFormData);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      message.error(
        "Vui lòng điền đầy đủ thông tin bắt buộc trước khi tiếp tục!"
      );
    }
  };

  // Upload nhiều ảnh
  const handleBatchImageUpload = async (files) => {
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isImage) message.error(`${file.name} không phải file hình ảnh!`);
      if (!isLt10M) message.error(`${file.name} quá lớn (>10MB)!`);
      return isImage && isLt10M;
    });

    if (validFiles.length === 0) {
      message.error("Không có file hợp lệ để upload!");
      return;
    }

    try {
      console.log(
        "🔄 Starting upload process for files:",
        validFiles.map((f) => f.name)
      );

      const attachmentKeys =
        await vehicleApi.ElectricVehicleImageService.uploadMultipleImages(
          validFiles
        );

      console.log("📦 Upload result - attachmentKeys:", attachmentKeys);

      if (attachmentKeys && attachmentKeys.length > 0) {
        setAttachmentKeys(attachmentKeys);
        console.log("✅ AttachmentKeys set to state:", attachmentKeys);
        message.success(`Upload thành công ${attachmentKeys.length} ảnh!`);
      } else {
        console.warn("⚠️ No attachment keys returned from upload");
        // Tạo mock keys để test workflow
        const mockKeys = validFiles.map(
          (file, index) => `mock-key-${Date.now()}-${index}-${file.name}`
        );
        setAttachmentKeys(mockKeys);
        console.log("🔄 Using mock keys for testing:", mockKeys);
        message.warning(
          `Upload API có vấn đề, sử dụng mock keys để test: ${mockKeys.length} keys`
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      // Tạo mock keys khi upload fail
      const mockKeys = validFiles.map(
        (file, index) => `error-fallback-${Date.now()}-${index}`
      );
      setAttachmentKeys(mockKeys);
      console.log("🔄 Upload failed, using fallback keys:", mockKeys);
      message.warning(
        `Upload lỗi, sử dụng fallback keys để test: ${mockKeys.length} keys`
      );
    }
  };

  // Xử lý thay đổi file list
  const handleImageUpload = ({ fileList }) => {
    setUploadedImages(fileList);
    const newFiles = fileList
      .filter((file) => file.originFileObj && file.status !== "done")
      .map((file) => file.originFileObj);

    if (newFiles.length > 0) {
      handleBatchImageUpload(newFiles);
    }
  };

  // Custom upload - chỉ để UI hoạt động
  const customUpload = ({ file, onSuccess }) => {
    setTimeout(() => onSuccess("ok"), 100);
  };

  // Preview ảnh
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj || file);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };

  // Convert file to base64
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Xóa ảnh
  const handleRemove = (file) => {
    const fileIndex = uploadedImages.findIndex((img) => img.uid === file.uid);
    if (fileIndex !== -1 && attachmentKeys[fileIndex]) {
      const newKeys = [...attachmentKeys];
      newKeys.splice(fileIndex, 1);
      setAttachmentKeys(newKeys);
    }
    return true;
  };

  // Reset form khi mở modal tạo
  const handleCreateVehicle = () => {
    setCurrentStep(0);
    setFormData({});
    setUploadedImages([]);
    setAttachmentKeys([]);
    setPreviewVisible(false);
    setPreviewImage("");
    setPreviewTitle("");
    form.resetFields();
    form.setFieldsValue({
      status: 1,
      costPrice: 0,
      manufactureDate: dayjs(),
      importDate: dayjs(),
      warrantyExpiryDate: dayjs().add(2, "year"),
    });
    setIsCreateModalVisible(true);
  };

  // Fields cần validate cho mỗi step
  const getRequiredFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return ["vin", "versionId", "colorId", "warehouseId"];
      case 1:
        return [
          "costPrice",
          "manufactureDate",
          "importDate",
          "warrantyExpiryDate",
        ];
      default:
        return [];
    }
  };

  // Steps cho wizard
  const steps = [
    { title: "Thông tin cơ bản", content: "basic-info" },
    { title: "Thông tin kỹ thuật", content: "technical-info" },
    { title: "Xác nhận", content: "confirm" },
  ];

  // Columns cho table
  const columns = [
    {
      title: "STT",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "VIN",
      dataIndex: "vin",
      width: 150,
      render: (text) => (
        <Text code strong style={{ fontSize: 12 }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Version",
      dataIndex: "versionId",
      width: 120,
      render: (versionId) => {
        const version = versions.find((v) => v.id === versionId);
        return version ? (
          <Tag color="blue">{version.versionName}</Tag>
        ) : (
          <Tag color="default">N/A</Tag>
        );
      },
    },
    {
      title: "Màu sắc",
      dataIndex: "colorId",
      width: 120,
      render: (colorId) => {
        const color = colors.find((c) => c.id === colorId);
        return color ? (
          <Space>
            <div
              style={{
                width: 20,
                height: 20,
                backgroundColor: color.colorCode,
                borderRadius: "50%",
                border: "1px solid #d9d9d9",
              }}
            />
            <span>{color.colorName}</span>
          </Space>
        ) : (
          <Tag color="default">N/A</Tag>
        );
      },
    },
    {
      title: "Kho",
      dataIndex: "warehouseId",
      width: 100,
      render: (warehouseId) => {
        const warehouse = warehouses.find((w) => w.id === warehouseId);
        return warehouse ? (
          <Tag color="green">{warehouse.name}</Tag>
        ) : (
          <Tag color="default">N/A</Tag>
        );
      },
    },
    {
      title: "Giá cost",
      dataIndex: "costPrice",
      width: 120,
      render: (price) => (
        <Text strong>
          {price ? price.toLocaleString("vi-VN") + " ₫" : "N/A"}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 100,
      render: (status) => (
        <Tag color={status === 1 ? "success" : "error"}>
          {status === 1 ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Ngày sản xuất",
      dataIndex: "manufactureDate",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
    },
    {
      title: "Thao tác",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewVehicle(record)}
          >
            Xem
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa xe điện này?"
            onConfirm={() => handleDeleteVehicle(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Tạo & Quản lý Xe Điện"
      subTitle="Tạo mới và quản lý toàn bộ xe điện trong hệ thống"
      extra={[
        <Button
          key="reload"
          icon={<ReloadOutlined />}
          onClick={loadAllData}
          loading={loading}
        >
          Tải lại
        </Button>,
        <Button
          key="create"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateVehicle}
          size="large"
        >
          Tạo Xe Điện
        </Button>,
      ]}
    >
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Title level={4}>
                <CarOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                Danh sách Xe Điện
              </Title>
              <Text type="secondary">
                Quản lý toàn bộ xe điện trong hệ thống. Tổng cộng:{" "}
                {vehicles.length} xe
              </Text>
            </Space>
          </Col>
        </Row>

        <Divider />

        <Table
          columns={columns}
          dataSource={vehicles}
          rowKey="id"
          loading={loading}
          pagination={{
            total: vehicles.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} xe`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal tạo xe điện */}
      <Modal
        title={
          <Space>
            <CarOutlined style={{ color: "#1890ff" }} />
            Tạo Xe Điện Mới
          </Space>
        }
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          form.resetFields();
          setCurrentStep(0);
        }}
        footer={null}
        width={900}
      >
        <Divider />

        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          {steps.map((item) => (
            <Steps.Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          preserve={false}
        >
          {/* Step 1: Thông tin cơ bản */}
          {currentStep === 0 && (
            <div>
              <Title level={5}>
                <InfoCircleOutlined style={{ marginRight: 8 }} />
                Thông tin cơ bản
              </Title>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="VIN (Vehicle Identification Number)"
                    name="vin"
                    rules={[
                      { required: true, message: "Vui lòng nhập VIN!" },
                      {
                        min: 17,
                        max: 17,
                        message: "VIN phải có đúng 17 ký tự!",
                      },
                      {
                        pattern: /^[A-HJ-NPR-Z0-9]{17}$/,
                        message:
                          "VIN không đúng định dạng! Chỉ được sử dụng A-H, J-N, P-R, T-Z, 0-9 (không có I, O, Q)",
                      },
                    ]}
                    extra={
                      <div style={{ fontSize: 12, color: "#666" }}>
                        <strong>Quy tắc VIN:</strong>
                        <br />• Đúng 17 ký tự
                        <br />• Chỉ sử dụng: A-H, J-N, P-R, T-Z, 0-9
                        <br />• Không được dùng: I, O, Q (để tránh nhầm lẫn)
                        <br />• Ví dụ hợp lệ: 1HGBH41JXMN109186,
                        WVWZZZ1JZ3W386752
                      </div>
                    }
                  >
                    <Input.Group compact>
                      <Input
                        placeholder="Nhập 17 ký tự VIN (tự động viết hoa)"
                        size="large"
                        maxLength={17}
                        style={{
                          width: "calc(100% - 120px)",
                          textTransform: "uppercase",
                          fontFamily: "monospace",
                          letterSpacing: "1px",
                        }}
                        onChange={(e) => {
                          // Auto uppercase và chỉ giữ ký tự hợp lệ
                          const value = e.target.value
                            .toUpperCase()
                            .replace(/[^A-HJ-NPR-Z0-9]/g, "");
                          form.setFieldsValue({ vin: value });
                        }}
                      />
                      <Button
                        size="large"
                        style={{ width: 120 }}
                        onClick={() => {
                          const sampleVIN = generateSampleVIN();
                          form.setFieldsValue({ vin: sampleVIN });
                          message.success(`Đã tạo VIN mẫu: ${sampleVIN}`);
                        }}
                      >
                        Tạo VIN mẫu
                      </Button>
                    </Input.Group>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="Upload hình ảnh xe">
                    <Upload
                      multiple
                      listType="picture-card"
                      fileList={uploadedImages}
                      onChange={handleImageUpload}
                      onPreview={handlePreview}
                      onRemove={handleRemove}
                      customRequest={customUpload}
                      accept="image/*"
                      beforeUpload={(file) => {
                        const isImage = file.type.startsWith("image/");
                        if (!isImage) {
                          message.error("Chỉ được upload file hình ảnh!");
                        }
                        const isLt5M = file.size / 1024 / 1024 < 5;
                        if (!isLt5M) {
                          message.error("Hình ảnh phải nhỏ hơn 5MB!");
                        }
                        return isImage && isLt5M;
                      }}
                    >
                      {uploadedImages.length >= 8 ? null : (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      )}
                    </Upload>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                      Có thể upload tối đa 8 hình ảnh, mỗi ảnh &lt; 5MB
                    </div>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Version"
                    name="versionId"
                    rules={[
                      { required: true, message: "Vui lòng chọn Version!" },
                    ]}
                  >
                    <Select
                      size="large"
                      placeholder="Chọn Version"
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {versions.map((version) => (
                        <Option key={version.id} value={version.id}>
                          {version.versionName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Màu sắc"
                    name="colorId"
                    rules={[
                      { required: true, message: "Vui lòng chọn màu sắc!" },
                    ]}
                  >
                    <Select
                      size="large"
                      placeholder="Chọn màu sắc"
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {colors.map((color) => (
                        <Option key={color.id} value={color.id}>
                          <Space>
                            <div
                              style={{
                                width: 16,
                                height: 16,
                                backgroundColor: color.colorCode,
                                borderRadius: "50%",
                                border: "1px solid #d9d9d9",
                              }}
                            />
                            {color.colorName}
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Kho"
                    name="warehouseId"
                    rules={[{ required: true, message: "Vui lòng chọn kho!" }]}
                  >
                    <Select
                      size="large"
                      placeholder="Chọn kho"
                      loading={loading}
                    >
                      {warehouses.map((warehouse) => (
                        <Option key={warehouse.id} value={warehouse.id}>
                          {warehouse.displayName}
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              marginTop: "2px",
                            }}
                          >
                            ID: {warehouse.id.substring(0, 8)}...
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Trạng thái" name="status" initialValue={1}>
                    <Select size="large" disabled>
                      <Option value={1}>Hoạt động</Option>
                      <Option value={0}>Không hoạt động</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* Step 2: Thông tin kỹ thuật */}
          {currentStep === 1 && (
            <div>
              <Title level={5}>
                <CarOutlined style={{ marginRight: 8 }} />
                Thông tin kỹ thuật và thời gian
              </Title>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Giá cost (VND)"
                    name="costPrice"
                    rules={[
                      { required: true, message: "Vui lòng nhập giá cost!" },
                    ]}
                  >
                    <InputNumber
                      placeholder="0"
                      size="large"
                      style={{ width: "100%" }}
                      min={0}
                      max={10000000000}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      addonAfter="₫"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Ngày sản xuất"
                    name="manufactureDate"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ngày sản xuất!",
                      },
                    ]}
                  >
                    <DatePicker
                      size="large"
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày sản xuất"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Ngày nhập khẩu"
                    name="importDate"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ngày nhập khẩu!",
                      },
                    ]}
                  >
                    <DatePicker
                      size="large"
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày nhập khẩu"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Ngày hết hạn bảo hành"
                    name="warrantyExpiryDate"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ngày hết hạn bảo hành!",
                      },
                    ]}
                  >
                    <DatePicker
                      size="large"
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày hết hạn bảo hành"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* Step 3: Xác nhận */}
          {currentStep === 2 && (
            <div>
              <Title level={5}>
                <CheckCircleOutlined style={{ marginRight: 8 }} />
                Xác nhận thông tin
              </Title>

              <Alert
                message="Vui lòng kiểm tra lại thông tin trước khi tạo xe điện"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />

              {(() => {
                const currentFormValues = form.getFieldsValue();
                const values = { ...formData, ...currentFormValues };
                const selectedVersion = versions.find(
                  (v) => v.id === values.versionId
                );
                const selectedColor = colors.find(
                  (c) => c.id === values.colorId
                );
                const selectedWarehouse = warehouses.find(
                  (w) => w.id === values.warehouseId
                );

                return (
                  <Card title="Xác nhận thông tin xe điện">
                    <Row gutter={16}>
                      <Col span={12}>
                        <p>
                          <strong>VIN:</strong> {values.vin || "N/A"}
                        </p>
                        <p>
                          <strong>Version:</strong>{" "}
                          {selectedVersion?.versionName || "N/A"}
                        </p>
                        <p>
                          <strong>Màu sắc:</strong>{" "}
                          {selectedColor?.colorName || "N/A"}
                        </p>
                        <p>
                          <strong>Kho:</strong>{" "}
                          {selectedWarehouse?.name || "Chưa chọn kho"}
                        </p>
                      </Col>
                      <Col span={12}>
                        <p>
                          <strong>Giá cost:</strong>{" "}
                          {values.costPrice?.toLocaleString
                            ? values.costPrice.toLocaleString("vi-VN") + " ₫"
                            : values.costPrice || "N/A"}
                        </p>
                        <p>
                          <strong>Ngày sản xuất:</strong>{" "}
                          {values.manufactureDate?.format("DD/MM/YYYY") ||
                            "N/A"}
                        </p>
                        <p>
                          <strong>Ngày nhập khẩu:</strong>{" "}
                          {values.importDate?.format("DD/MM/YYYY") || "N/A"}
                        </p>
                      </Col>
                    </Row>

                    {/* Hiển thị uploaded images và attachment keys */}
                    {uploadedImages.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <strong>
                          Hình ảnh đã tải lên ({uploadedImages.length}):
                        </strong>

                        {/* Hiển thị attachment keys nếu có */}
                        {attachmentKeys.length > 0 && (
                          <div
                            style={{
                              marginTop: 8,
                              padding: "8px 12px",
                              backgroundColor: "#f6ffed",
                              border: "1px solid #b7eb8f",
                              borderRadius: 6,
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                color: "#389e0d",
                                fontSize: "14px",
                              }}
                            >
                              ✅ Đã upload thành công {attachmentKeys.length}{" "}
                              ảnh và nhận được keys từ server
                            </p>
                            <details style={{ marginTop: 4 }}>
                              <summary
                                style={{ cursor: "pointer", color: "#595959" }}
                              >
                                Xem chi tiết keys
                              </summary>
                              <div
                                style={{
                                  marginTop: 4,
                                  fontSize: "12px",
                                  fontFamily: "monospace",
                                }}
                              >
                                {attachmentKeys.map((key, index) => (
                                  <div key={index}>
                                    Ảnh {index + 1}: {key}
                                  </div>
                                ))}
                              </div>
                            </details>
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                            marginTop: 8,
                          }}
                        >
                          {uploadedImages.map((file, index) => {
                            let previewUrl = "";
                            try {
                              if (file instanceof File) {
                                previewUrl = URL.createObjectURL(file);
                              } else if (file.url) {
                                previewUrl = file.url;
                              } else if (file.thumbUrl) {
                                previewUrl = file.thumbUrl;
                              }
                            } catch (error) {
                              console.warn(
                                "Cannot create preview URL for file:",
                                file
                              );
                            }

                            return previewUrl ? (
                              <div key={index} style={{ position: "relative" }}>
                                <img
                                  src={previewUrl}
                                  alt={`Hình ${index + 1}`}
                                  style={{
                                    width: 100,
                                    height: 100,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                    border: "1px solid #d9d9d9",
                                  }}
                                />
                                {attachmentKeys[index] && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      background: "rgba(0,0,0,0.7)",
                                      color: "white",
                                      fontSize: "10px",
                                      padding: "2px 4px",
                                      borderRadius: "0 0 8px 8px",
                                      textAlign: "center",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                    title={attachmentKeys[index] || "No key"}
                                  >
                                    Key:{" "}
                                    {attachmentKeys[index] &&
                                    typeof attachmentKeys[index] === "string"
                                      ? attachmentKeys[index].substring(0, 8) +
                                        "..."
                                      : "No key"}
                                  </div>
                                )}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })()}
            </div>
          )}

          {/* Navigation buttons */}
          <Divider />
          <div style={{ textAlign: "right" }}>
            <Space>
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(currentStep - 1)}>
                  Quay lại
                </Button>
              )}

              <Button
                onClick={() => {
                  setIsCreateModalVisible(false);
                  form.resetFields();
                  setCurrentStep(0);
                }}
              >
                Hủy
              </Button>

              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={handleNextStep}>
                  Tiếp theo
                </Button>
              )}

              {currentStep === steps.length - 1 && (
                <Button type="primary" htmlType="submit" loading={loading}>
                  Tạo Xe Điện
                </Button>
              )}
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal xem chi tiết xe */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: "#1890ff" }} />
            Chi tiết Xe Điện
          </Space>
        }
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedVehicle && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Thông tin cơ bản" size="small">
                  <p>
                    <strong>VIN:</strong>{" "}
                    <Text code>{selectedVehicle.vin}</Text>
                  </p>
                  <p>
                    <strong>Version:</strong>{" "}
                    {versions.find((v) => v.id === selectedVehicle.versionId)
                      ?.versionName || "N/A"}
                  </p>
                  <p>
                    <strong>Màu sắc:</strong>{" "}
                    {colors.find((c) => c.id === selectedVehicle.colorId)
                      ?.colorName || "N/A"}
                  </p>
                  <p>
                    <strong>Kho:</strong>{" "}
                    {warehouses.find(
                      (w) => w.id === selectedVehicle.warehouseId
                    )?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>
                    <Tag
                      color={selectedVehicle.status === 1 ? "success" : "error"}
                    >
                      {selectedVehicle.status === 1
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </Tag>
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Thông tin kỹ thuật" size="small">
                  <p>
                    <strong>Giá cost:</strong>{" "}
                    {selectedVehicle.costPrice?.toLocaleString("vi-VN")} ₫
                  </p>
                  <p>
                    <strong>Ngày sản xuất:</strong>{" "}
                    {selectedVehicle.manufactureDate
                      ? dayjs(selectedVehicle.manufactureDate).format(
                          "DD/MM/YYYY"
                        )
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Ngày nhập khẩu:</strong>{" "}
                    {selectedVehicle.importDate
                      ? dayjs(selectedVehicle.importDate).format("DD/MM/YYYY")
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Hết hạn bảo hành:</strong>{" "}
                    {selectedVehicle.warrantyExpiryDate
                      ? dayjs(selectedVehicle.warrantyExpiryDate).format(
                          "DD/MM/YYYY"
                        )
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Vehicle ID:</strong>{" "}
                    <Text code copyable>
                      {selectedVehicle.id}
                    </Text>
                  </p>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Modal preview ảnh */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </PageContainer>
  );
}

export default CreateElectricVehicle;
