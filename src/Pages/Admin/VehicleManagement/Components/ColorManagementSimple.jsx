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
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
  Typography,
  Divider,
  Alert,
  Avatar,
  ColorPicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BgColorsOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { vehicleApi } from "../../../../App/EVMAdmin/VehiclesManagement/Vehicles";

const { Title, Text } = Typography;

// Danh sách màu phổ biến với mã màu chuẩn
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

function ColorManagement() {
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentColor, setCurrentColor] = useState(null);
  const [form] = Form.useForm();

  // Load colors khi component mount
  useEffect(() => {
    loadColors();
  }, []);

  // Tải danh sách colors
  const loadColors = async () => {
    setLoading(true);
    try {
      console.log("=== LOADING COLORS ===");
      const result = await vehicleApi.getAllColors();

      if (result.success) {
        console.log("✅ Colors loaded successfully:", result.data);
        setColors(result.data || []);
      } else {
        console.error("❌ Failed to load colors:", result.error);
        message.error("Không thể tải danh sách màu sắc: " + result.error);
        setColors([]);
      }
    } catch (error) {
      console.error("Error loading colors:", error);
      message.error("Lỗi khi tải danh sách màu sắc");
      setColors([]);
    } finally {
      setLoading(false);
    }
  };

  // Validate mã màu HEX
  const validateColorCode = (colorCode) => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexRegex.test(colorCode);
  };

  // Validate tên màu (chỉ cho phép chữ cái, số, khoảng trắng và một số ký tự đặc biệt)
  const validateColorName = (colorName) => {
    const nameRegex = /^[a-zA-ZÀ-ỹ0-9\s\-_()]+$/;
    return (
      nameRegex.test(colorName) &&
      colorName.length >= 2 &&
      colorName.length <= 50
    );
  };

  // Mở modal tạo màu mới
  const handleCreate = () => {
    setIsEditing(false);
    setCurrentColor(null);
    form.resetFields();
    // Set default values
    form.setFieldsValue({
      extraCost: 0,
      colorCode: "#FF0000", // Default red color
    });
    setIsModalVisible(true);
  };

  // Mở modal chỉnh sửa màu
  const handleEdit = (color) => {
    setIsEditing(true);
    setCurrentColor(color);
    form.setFieldsValue({
      colorName: color.colorName,
      colorCode: color.colorCode,
      extraCost: color.extraCost || 0,
    });
    setIsModalVisible(true);
  };

  // Xử lý submit form (tạo mới hoặc cập nhật)
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log("=== SUBMITTING COLOR FORM ===");
      console.log("Is editing:", isEditing);
      console.log("Form values:", values);

      // Validate dữ liệu
      if (!validateColorName(values.colorName)) {
        message.error(
          "Tên màu không hợp lệ! Chỉ được chứa chữ cái, số, khoảng trắng và một số ký tự đặc biệt."
        );
        setLoading(false);
        return;
      }

      if (!validateColorCode(values.colorCode)) {
        message.error(
          "Mã màu không hợp lệ! Vui lòng nhập mã HEX đúng định dạng (#RRGGBB)."
        );
        setLoading(false);
        return;
      }

      // Prepare data theo API schema
      const colorData = {
        colorName: values.colorName.trim(),
        colorCode: values.colorCode.toUpperCase(), // Uppercase cho consistency
        extraCost: values.extraCost || 0,
      };

      let result;

      if (isEditing && currentColor) {
        // Cập nhật màu
        console.log("Updating color with ID:", currentColor.id);
        result = await vehicleApi.updateColor(currentColor.id, colorData);
      } else {
        // Tạo màu mới
        console.log("Creating new color with data:", colorData);
        result = await vehicleApi.createColor(colorData);
      }

      console.log("Submit result:", result);

      if (result.success) {
        message.success(
          isEditing
            ? "Cập nhật màu sắc thành công!"
            : "Tạo màu sắc mới thành công!"
        );

        // Hiển thị thông tin màu vừa tạo/cập nhật
        Modal.success({
          title: (
            <Space>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
              {isEditing
                ? "Cập nhật Màu sắc thành công!"
                : "Tạo Màu sắc thành công!"}
            </Space>
          ),
          content: (
            <div style={{ marginTop: 16 }}>
              <Alert
                message="Thông tin Màu sắc"
                description={
                  <div>
                    <p>
                      <strong>Tên màu:</strong> {colorData.colorName}
                    </p>
                    <p>
                      <strong>Mã màu:</strong>
                      <span
                        style={{
                          marginLeft: 8,
                          padding: "4px 12px",
                          backgroundColor: colorData.colorCode,
                          color:
                            colorData.colorCode === "#FFFFFF" ||
                            colorData.colorCode === "#F8F8FF"
                              ? "#000"
                              : "#fff",
                          borderRadius: 4,
                          border: "1px solid #d9d9d9",
                        }}
                      >
                        {colorData.colorCode}
                      </span>
                    </p>
                    <p>
                      <strong>Phụ thu:</strong>{" "}
                      {colorData.extraCost.toLocaleString("vi-VN")} ₫
                    </p>
                    {result.data?.id && (
                      <p>
                        <strong>ID (Database):</strong>
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
        });

        setIsModalVisible(false);
        form.resetFields();
        await loadColors(); // Reload danh sách
      } else {
        console.error("❌ Submit failed:", result.error);
        message.error(result.error || "Không thể thực hiện thao tác");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Lỗi khi thực hiện thao tác");
    } finally {
      setLoading(false);
    }
  };

  // Xóa màu
  const handleDelete = async (colorId) => {
    setLoading(true);
    try {
      console.log("=== DELETING COLOR ===");
      console.log("Color ID:", colorId);

      const result = await vehicleApi.deleteColor(colorId);
      console.log("Delete result:", result);

      if (result.success) {
        message.success("Xóa màu sắc thành công!");
        await loadColors(); // Reload danh sách
      } else {
        console.error("❌ Delete failed:", result.error);
        message.error(result.error || "Không thể xóa màu sắc");
      }
    } catch (error) {
      console.error("Error deleting color:", error);
      message.error("Lỗi khi xóa màu sắc");
    } finally {
      setLoading(false);
    }
  };

  // Chọn màu từ danh sách có sẵn
  const handleSelectPopularColor = (color) => {
    form.setFieldsValue({
      colorName: color.name,
      colorCode: color.code,
    });
    message.success(`Đã chọn màu ${color.name}`);
  };

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
      title: "Màu sắc",
      dataIndex: "colorCode",
      key: "colorPreview",
      width: 120,
      render: (colorCode, record) => (
        <Space>
          <Avatar
            style={{
              backgroundColor: colorCode,
              border: "2px solid #d9d9d9",
              width: 40,
              height: 40,
            }}
            size="large"
          />
          <div>
            <Text strong>{record.colorName}</Text>
            <br />
            <Text code style={{ fontSize: 11 }}>
              {colorCode}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Tên màu",
      dataIndex: "colorName",
      key: "colorName",
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Mã màu",
      dataIndex: "colorCode",
      key: "colorCode",
      width: 100,
      render: (colorCode) => (
        <Text code copyable style={{ fontSize: 12 }}>
          {colorCode}
        </Text>
      ),
    },
    {
      title: "Phụ thu",
      dataIndex: "extraCost",
      key: "extraCost",
      width: 120,
      render: (price) => (
        <Tag color={price > 0 ? "orange" : "default"}>
          {price ? price.toLocaleString("vi-VN") + " ₫" : "Miễn phí"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
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
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa màu sắc này?"
            onConfirm={() => handleDelete(record.id)}
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
      title="Quản lý Màu sắc Xe Điện"
      subTitle="Tạo và quản lý các màu sắc cho xe điện một cách đơn giản"
      extra={[
        <Button
          key="reload"
          icon={<ReloadOutlined />}
          onClick={loadColors}
          loading={loading}
        >
          Tải lại
        </Button>,
        <Button
          key="create"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Tạo Màu mới
        </Button>,
      ]}
    >
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Title level={4}>
              <BgColorsOutlined style={{ color: "#1890ff", marginRight: 8 }} />
              Danh sách Màu sắc
            </Title>
            <Text type="secondary">
              Quản lý màu sắc xe điện đơn giản. Tổng cộng: {colors.length} màu
            </Text>
          </Col>
        </Row>

        <Divider />

        <Table
          columns={columns}
          dataSource={colors}
          rowKey="id"
          loading={loading}
          pagination={{
            total: colors.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} màu`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal tạo/sửa màu */}
      <Modal
        title={
          <Space>
            <BgColorsOutlined style={{ color: "#1890ff" }} />
            {isEditing ? "Chỉnh sửa Màu sắc" : "Tạo Màu sắc mới"}
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Divider />

        {/* Danh sách màu phổ biến */}
        <div style={{ marginBottom: 24 }}>
          <Title level={5}>
            <BgColorsOutlined style={{ marginRight: 8 }} />
            Màu phổ biến (Click để chọn nhanh)
          </Title>
          <Row gutter={[8, 8]}>
            {popularColors.map((color, index) => (
              <Col key={index}>
                <Button
                  size="small"
                  style={{
                    backgroundColor: color.code,
                    color:
                      color.code === "#FFFFFF" || color.code === "#F8F8FF"
                        ? "#000"
                        : "#fff",
                    border: "1px solid #d9d9d9",
                    height: 40,
                    minWidth: 80,
                    fontSize: 11,
                  }}
                  onClick={() => handleSelectPopularColor(color)}
                  title={`${color.name} - ${color.code}`}
                >
                  {color.name}
                </Button>
              </Col>
            ))}
          </Row>
        </div>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{
            extraCost: 0,
            colorCode: "#FF0000",
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên màu"
                name="colorName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên màu!" },
                  { min: 2, message: "Tên màu phải có ít nhất 2 ký tự!" },
                  { max: 50, message: "Tên màu không được quá 50 ký tự!" },
                  {
                    pattern: /^[a-zA-ZÀ-ỹ0-9\s\-_()]+$/,
                    message:
                      "Tên màu chỉ được chứa chữ cái, số, khoảng trắng và ký tự đặc biệt cơ bản!",
                  },
                ]}
              >
                <Input
                  placeholder="Ví dụ: Đỏ Cherry, Xanh Ocean, Bạc Metallic..."
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Mã màu (HEX)"
                name="colorCode"
                rules={[
                  { required: true, message: "Vui lòng nhập mã màu!" },
                  {
                    pattern: /^#[0-9A-Fa-f]{6}$/,
                    message: "Mã màu phải có định dạng #RRGGBB (6 ký tự hex)!",
                  },
                ]}
              >
                <Input
                  placeholder="#FF0000"
                  size="large"
                  maxLength={7}
                  addonAfter={
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, curValues) =>
                        prevValues.colorCode !== curValues.colorCode
                      }
                    >
                      {({ getFieldValue }) => (
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            backgroundColor:
                              getFieldValue("colorCode") || "#FF0000",
                            border: "1px solid #d9d9d9",
                            borderRadius: 4,
                          }}
                          title={`Preview: ${
                            getFieldValue("colorCode") || "#FF0000"
                          }`}
                        />
                      )}
                    </Form.Item>
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Phụ thu (VND)"
                name="extraCost"
                rules={[{ required: true, message: "Vui lòng nhập phụ thu!" }]}
              >
                <InputNumber
                  placeholder="0"
                  size="large"
                  style={{ width: "100%" }}
                  min={0}
                  max={1000000000}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  addonAfter="₫"
                />
              </Form.Item>
            </Col>
          </Row>

          <Alert
            message="Hướng dẫn đặt tên và mã màu"
            description={
              <ul style={{ marginBottom: 0 }}>
                <li>
                  <strong>Tên màu:</strong> Có thể đặt tự do, ví dụ: "Đỏ
                  Cherry", "Xanh Ocean", "Bạc Metallic"
                </li>
                <li>
                  <strong>Mã màu:</strong> Định dạng HEX (#RRGGBB), ví dụ:
                  #FF0000 (đỏ), #0000FF (xanh), #FFFFFF (trắng)
                </li>
                <li>
                  <strong>Phụ thu:</strong> Số tiền thêm cho màu đặc biệt (có
                  thể để 0 nếu không tính phụ thu)
                </li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEditing ? "Cập nhật" : "Tạo Màu sắc"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}

export default ColorManagement;
