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
  EditOutlined,
  DeleteOutlined,
  CarOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { vehicleApi } from "../../../../App/EVMAdmin/VehiclesManagement/Vehicles";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Helper functions cho VIN
const VIN_CHARS = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789"; // Không có I, O, Q

const generateSampleVIN = () => {
  let vin = "";
  for (let i = 0; i < 17; i++) {
    vin += VIN_CHARS[Math.floor(Math.random() * VIN_CHARS.length)];
  }
  return vin;
};

const validateVIN = (vin) => {
  if (!vin || vin.length !== 17) return false;
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
};

function CreateElectricVehicle() {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [versions, setVersions] = useState([]);
  const [colors, setColors] = useState([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({}); // State để lưu form data giữa các steps
  const [uploadedImages, setUploadedImages] = useState([]); // State cho uploaded images

  // Load data khi component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Tải toàn bộ dữ liệu cần thiết
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

  // Tải danh sách xe điện
  const loadVehicles = async () => {
    try {
      console.log("=== LOADING VEHICLES ===");
      const result = await vehicleApi.getAllVehicles();

      if (result.success) {
        console.log("✅ Vehicles loaded successfully:", result.data);
        setVehicles(result.data || []);
      } else {
        console.error("❌ Failed to load vehicles:", result.error);
        setVehicles([]);
      }
    } catch (error) {
      console.error("Error loading vehicles:", error);
      setVehicles([]);
    }
  };

  // Tải danh sách kho
  const loadWarehouses = async () => {
    try {
      // Mock data cho warehouses - có thể thay bằng API thực
      const mockWarehouses = [
        {
          id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          name: "Kho Hà Nội",
          location: "Hà Nội",
        },
        {
          id: "4fa85f64-5717-4562-b3fc-2c963f66afa7",
          name: "Kho TP.HCM",
          location: "TP.HCM",
        },
        {
          id: "5fa85f64-5717-4562-b3fc-2c963f66afa8",
          name: "Kho Đà Nẵng",
          location: "Đà Nẵng",
        },
      ];
      setWarehouses(mockWarehouses);
    } catch (error) {
      console.error("Error loading warehouses:", error);
      setWarehouses([]);
    }
  };

  // Tải danh sách versions
  const loadVersions = async () => {
    try {
      const result = await vehicleApi.getAllVersions();
      if (result.success) {
        setVersions(result.data || []);
      }
    } catch (error) {
      console.error("Error loading versions:", error);
      setVersions([]);
    }
  };

  // Tải danh sách màu sắc
  const loadColors = async () => {
    try {
      const result = await vehicleApi.getAllColors();
      if (result.success) {
        setColors(result.data || []);
      }
    } catch (error) {
      console.error("Error loading colors:", error);
      setColors([]);
    }
  };

  // Function đã được move lên trên

  // Xem chi tiết xe
  const handleViewVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsViewModalVisible(true);
  };

  // Xóa xe
  const handleDeleteVehicle = async (vehicleId) => {
    setLoading(true);
    try {
      console.log("=== DELETING VEHICLE ===");
      console.log("Vehicle ID:", vehicleId);

      const result = await vehicleApi.deleteVehicle(vehicleId);
      console.log("Delete result:", result);

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

  // Xử lý submit form tạo xe
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log("=== CREATING ELECTRIC VEHICLE ===");

      // Lưu form data cuối cùng
      const finalFormData = { ...formData, ...values };
      console.log("Final form data:", finalFormData);
      console.log("Uploaded images:", uploadedImages);

      // Prepare data theo API schema
      const vehicleData = {
        warehouseId: finalFormData.warehouseId,
        versionId: finalFormData.versionId,
        colorId: finalFormData.colorId,
        vin: finalFormData.vin,
        status: 1, // Mặc định là hoạt động
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
        costPrice: finalFormData.costPrice,
        imageUrl:
          uploadedImages.length > 0
            ? uploadedImages
                .map((img) => {
                  if (img instanceof File) {
                    return img.name; // Lưu tên file hoặc có thể upload lên server
                  }
                  return img.response || img.url || img.name || "";
                })
                .filter((url) => url)
                .join(",")
            : "",
      };

      console.log("Vehicle data to be sent:", vehicleData);

      const result = await vehicleApi.createVehicle(vehicleData);
      console.log("Create result:", result);

      if (result.success) {
        message.success("Tạo xe điện mới thành công!");

        // Hiển thị thông tin xe vừa tạo
        const selectedVersion = versions.find((v) => v.id === values.versionId);
        const selectedColor = colors.find((c) => c.id === values.colorId);
        const selectedWarehouse = warehouses.find(
          (w) => w.id === values.warehouseId
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
                    <p>
                      <strong>Trạng thái:</strong>{" "}
                      {vehicleData.status === 1
                        ? "Hoạt động"
                        : "Không hoạt động"}
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

        setIsCreateModalVisible(false);
        form.resetFields();
        await loadVehicles();
      } else {
        console.error("❌ Submit failed:", result.error);
        message.error(result.error || "Không thể tạo xe điện");
      }
    } catch (error) {
      console.error("Error creating vehicle:", error);
      message.error("Lỗi khi tạo xe điện");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chuyển step với validation
  const handleNextStep = async () => {
    try {
      // Validate các fields cần thiết cho step hiện tại
      const fieldsToValidate = getRequiredFieldsForStep(currentStep);

      // Validate form fields cho step hiện tại
      await form.validateFields(fieldsToValidate);

      // Lưu form data hiện tại vào state
      const currentFormValues = form.getFieldsValue();
      const updatedFormData = { ...formData, ...currentFormValues };
      setFormData(updatedFormData);

      console.log("✅ Step validation passed, moving to next step");
      console.log("Current form values:", currentFormValues);
      console.log("Updated form data:", updatedFormData);

      // Chuyển sang step tiếp theo
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error("❌ Step validation failed:", error);
      message.error(
        "Vui lòng điền đầy đủ thông tin bắt buộc trước khi tiếp tục!"
      );
    }
  };

  // Xử lý upload ảnh
  const handleImageUpload = ({ fileList }) => {
    // Lọc ra những file hợp lệ (có originFileObj)
    const validFiles = fileList.map((file) => {
      if (file.originFileObj) {
        return file.originFileObj;
      }
      return file;
    });
    setUploadedImages(validFiles);
    console.log("Updated uploaded images:", validFiles);
  };

  // Custom upload function (có thể tích hợp với server sau)
  const customUpload = ({ file, onSuccess, onError }) => {
    // Validate file type
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ có thể upload file hình ảnh!");
      onError("Invalid file type");
      return;
    }

    // Validate file size (10MB max)
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("Kích thước ảnh phải nhỏ hơn 10MB!");
      onError("File too large");
      return;
    }

    // Mock upload success
    setTimeout(() => {
      onSuccess("ok");
    }, 100);
  };

  // Reset form và data khi mở modal
  const handleCreateVehicle = () => {
    setCurrentStep(0);
    setFormData({});
    setUploadedImages([]);
    form.resetFields();
    form.setFieldsValue({
      costPrice: 0,
      manufactureDate: dayjs(),
      importDate: dayjs(),
      warrantyExpiryDate: dayjs().add(2, "year"),
    });
    setIsCreateModalVisible(true);
  };

  // Lấy danh sách fields cần validate cho mỗi step
  const getRequiredFieldsForStep = (step) => {
    switch (step) {
      case 0: // Thông tin cơ bản
        return ["vin", "versionId", "colorId", "warehouseId"];
      case 1: // Thông tin kỹ thuật
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

  // Steps cho wizard tạo xe
  const steps = [
    {
      title: "Thông tin cơ bản",
      content: "basic-info",
    },
    {
      title: "Thông tin kỹ thuật",
      content: "technical-info",
    },
    {
      title: "Xác nhận",
      content: "confirm",
    },
  ];

  // Columns cho table
  const columns = [
    {
      title: "STT",
      dataIndex: "index",
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
        <Text code strong style={{ fontSize: 12 }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Version",
      dataIndex: "versionId",
      key: "versionId",
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
      key: "colorId",
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
      key: "warehouseId",
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
      key: "costPrice",
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
      key: "status",
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
      key: "manufactureDate",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
    },
    {
      title: "Thao tác",
      key: "actions",
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
            <Title level={4}>
              <CarOutlined style={{ color: "#1890ff", marginRight: 8 }} />
              Danh sách Xe Điện
            </Title>
            <Text type="secondary">
              Quản lý toàn bộ xe điện trong hệ thống. Tổng cộng:{" "}
              {vehicles.length} xe
            </Text>
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
                    <Select size="large" placeholder="Chọn kho">
                      {warehouses.map((warehouse) => (
                        <Option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} - {warehouse.location}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="URL hình ảnh" name="imageUrl">
                <Input
                  placeholder="https://example.com/vehicle-image.jpg"
                  size="large"
                />
              </Form.Item>
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

              <div>
                {(() => {
                  // Sử dụng formData thay vì getFieldsValue()
                  const currentFormValues = form.getFieldsValue();
                  const values = { ...formData, ...currentFormValues };

                  // Debug logging để check form values
                  console.log("=== FORM VALUES IN CONFIRMATION STEP ===");
                  console.log("FormData from state:", formData);
                  console.log("Current form values:", currentFormValues);
                  console.log("Combined values:", values);

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
                            {selectedWarehouse?.name || "N/A"}
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

                      {/* Hiển thị uploaded images */}
                      {uploadedImages.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <strong>
                            Hình ảnh đã tải lên ({uploadedImages.length}):
                          </strong>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 8,
                              marginTop: 8,
                            }}
                          >
                            {uploadedImages.map((file, index) => {
                              // Tạo URL preview cho file
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
                                <div
                                  key={index}
                                  style={{ position: "relative" }}
                                >
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

            {selectedVehicle.imageUrl && (
              <Card title="Hình ảnh" size="small" style={{ marginTop: 16 }}>
                <img
                  src={selectedVehicle.imageUrl}
                  alt="Vehicle"
                  style={{ width: "100%", maxHeight: 300, objectFit: "cover" }}
                />
              </Card>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}

export default CreateElectricVehicle;
