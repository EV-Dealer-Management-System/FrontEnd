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
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
  Typography,
  Divider,
  Alert,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BgColorsOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { vehicleApi } from "../../../../App/EVMAdmin/VehiclesManagement/Vehicles";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

// Danh sách màu phổ biến
const commonColors = [
  { label: 'Đỏ Cherry', value: '#DC143C' },
  { label: 'Trắng Ngọc Trai', value: '#F8F8FF' },
  { label: 'Đen Obsidian', value: '#0B0B0B' },
  { label: 'Xanh Ocean', value: '#006994' },
  { label: 'Bạc Metallic', value: '#C0C0C0' },
  { label: 'Xám Titan', value: '#708090' },
  { label: 'Xanh Emerald', value: '#50C878' },
  { label: 'Vàng Gold', value: '#FFD700' },
  { label: 'Cam Sunset', value: '#FF4500' },
  { label: 'Tím Royal', value: '#663399' },
];

function ManageColor() {
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState([]);
  const [versions, setVersions] = useState([]);
  const [models, setModels] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentColor, setCurrentColor] = useState(null);
  const [form] = Form.useForm();

  // Load colors, versions, models khi component mount
  useEffect(() => {
    loadColors();
    loadVersions();
    loadModels();
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
        message.error("Không thể tải danh sách color: " + result.error);
        setColors([]);
      }
    } catch (error) {
      console.error("Error loading colors:", error);
      message.error("Lỗi khi tải danh sách color");
      setColors([]);
    } finally {
      setLoading(false);
    }
  };

  // Tải danh sách versions
  const loadVersions = async () => {
    try {
      console.log("=== LOADING VERSIONS FOR DROPDOWN ===");
      const result = await vehicleApi.getAllVersions();
      
      if (result.success) {
        console.log("✅ Versions loaded successfully:", result.data);
        setVersions(result.data || []);
      } else {
        console.error("❌ Failed to load versions:", result.error);
        setVersions([]);
      }
    } catch (error) {
      console.error("Error loading versions:", error);
      setVersions([]);
    }
  };

  // Tải danh sách models
  const loadModels = async () => {
    try {
      console.log("=== LOADING MODELS FOR REFERENCE ===");
      const result = await vehicleApi.getAllModels();
      
      if (result.success) {
        console.log("✅ Models loaded successfully:", result.data);
        setModels(result.data || []);
      } else {
        console.error("❌ Failed to load models:", result.error);
        setModels([]);
      }
    } catch (error) {
      console.error("Error loading models:", error);
      setModels([]);
    }
  };

  // Mở modal tạo color mới
  const handleCreate = () => {
    if (versions.length === 0) {
      message.warning("Cần tạo Version trước khi tạo Color!");
      return;
    }
    
    setIsEditing(false);
    setCurrentColor(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Mở modal chỉnh sửa color
  const handleEdit = (color) => {
    setIsEditing(true);
    setCurrentColor(color);
    form.setFieldsValue({
      versionId: color.versionId,
      colorName: color.colorName,
      hexCode: color.hexCode,
      imageUrl: color.imageUrl,
      additionalPrice: color.additionalPrice,
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
      console.log("Current color:", currentColor);

      // Validate versionId tồn tại
      if (!values.versionId) {
        message.error("Vui lòng chọn Version!");
        return;
      }

      let result;
      
      if (isEditing && currentColor) {
        // Cập nhật color
        console.log("Updating color with ID:", currentColor.id);
        result = await vehicleApi.updateColor(currentColor.id, values);
      } else {
        // Tạo color mới
        console.log("Creating new color");
        result = await vehicleApi.createColor(values);
      }

      console.log("Submit result:", result);

      if (result.success) {
        message.success(
          isEditing ? "Cập nhật color thành công!" : "Tạo color mới thành công!"
        );
        
        // Hiển thị thông tin color vừa tạo/cập nhật
        if (result.data) {
          console.log("✅ Color data:", result.data);
          
          // Tìm version name để hiển thị
          const selectedVersion = versions.find(v => v.id === values.versionId);
          const selectedModel = models.find(m => m.id === selectedVersion?.modelId);
          
          Modal.success({
            title: (
              <Space>
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                {isEditing ? "Cập nhật Color thành công!" : "Tạo Color thành công!"}
              </Space>
            ),
            content: (
              <div style={{ marginTop: 16 }}>
                <Alert
                  message="Thông tin Color"
                  description={
                    <div>
                      <p><strong>Model:</strong> {selectedModel?.modelName || 'N/A'}</p>
                      <p><strong>Version:</strong> {selectedVersion?.versionName || 'N/A'}</p>
                      <p><strong>Tên màu:</strong> {result.data.colorName || values.colorName}</p>
                      <p>
                        <strong>Mã màu:</strong> 
                        <span style={{ 
                          marginLeft: 8,
                          padding: '2px 8px',
                          backgroundColor: values.hexCode,
                          color: values.hexCode === '#FFFFFF' || values.hexCode === '#F8F8FF' ? '#000' : '#fff',
                          borderRadius: 4
                        }}>
                          {values.hexCode}
                        </span>
                      </p>
                      <p><strong>Giá phụ thu:</strong> {values.additionalPrice?.toLocaleString('vi-VN')} ₫</p>
                      {result.data.id && (
                        <p><strong>Color ID (Database):</strong> 
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
        }
        
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

  // Xóa color
  const handleDelete = async (colorId) => {
    setLoading(true);
    try {
      console.log("=== DELETING COLOR ===");
      console.log("Color ID:", colorId);

      const result = await vehicleApi.deleteColor(colorId);
      console.log("Delete result:", result);

      if (result.success) {
        message.success("Xóa color thành công!");
        await loadColors(); // Reload danh sách
      } else {
        console.error("❌ Delete failed:", result.error);
        message.error(result.error || "Không thể xóa color");
      }
    } catch (error) {
      console.error("Error deleting color:", error);
      message.error("Lỗi khi xóa color");
    } finally {
      setLoading(false);
    }
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
      dataIndex: "hexCode",
      key: "hexCode",
      width: 100,
      render: (hexCode, record) => (
        <Space>
          <Avatar
            style={{ backgroundColor: hexCode, border: '1px solid #d9d9d9' }}
            size="small"
          />
          <Text strong>{record.colorName}</Text>
        </Space>
      ),
    },
    {
      title: "Mã màu",
      dataIndex: "hexCode",
      key: "hexCodeText",
      width: 100,
      render: (hexCode) => (
        <Text code copyable style={{ fontSize: 12 }}>
          {hexCode}
        </Text>
      ),
    },
    {
      title: "Version",
      dataIndex: "versionId",
      key: "versionId",
      width: 150,
      render: (versionId) => {
        const version = versions.find(v => v.id === versionId);
        const model = models.find(m => m.id === version?.modelId);
        return (
          <div>
            <Tag color="blue">{model?.modelName || 'N/A'}</Tag>
            <br />
            <Tag color="green">{version?.versionName || `ID: ${versionId?.slice(0, 8)}...`}</Tag>
          </div>
        );
      },
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 120,
      render: (imageUrl) => (
        imageUrl ? (
          <img
            src={imageUrl}
            alt="Color"
            style={{ width: 50, height: 30, objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <Tag color="default">Chưa có</Tag>
        )
      ),
    },
    {
      title: "Giá phụ thu",
      dataIndex: "additionalPrice",
      key: "additionalPrice",
      width: 130,
      render: (price) => (
        <Tag color={price > 0 ? "orange" : "default"}>
          {price ? price.toLocaleString('vi-VN') + ' ₫' : 'Miễn phí'}
        </Tag>
      ),
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
            description="Bạn có chắc chắn muốn xóa color này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="primary" danger size="small" icon={<DeleteOutlined />}>
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
      subTitle="Tạo và quản lý các màu sắc cho từng phiên bản xe"
      extra={[
        <Button
          key="reload"
          icon={<ReloadOutlined />}
          onClick={() => {
            loadColors();
            loadVersions();
            loadModels();
          }}
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
          Tạo Color mới
        </Button>,
      ]}
    >
      {/* Cảnh báo nếu chưa có Version */}
      {versions.length === 0 && (
        <Card style={{ marginBottom: 16 }}>
          <Alert
            message="Chưa có Version trong hệ thống"
            description="Bạn cần tạo ít nhất một Version trước khi tạo Color. Vui lòng vào trang Quản lý Version để tạo Version mới."
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            action={
              <Button size="small" danger>
                Đi đến Quản lý Version
              </Button>
            }
          />
        </Card>
      )}

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Title level={4}>
              <BgColorsOutlined style={{ color: "#1890ff", marginRight: 8 }} />
              Danh sách Màu sắc
            </Title>
            <Text type="secondary">
              Quản lý các màu sắc cho từng phiên bản xe. Tổng cộng: {colors.length} màu
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

      {/* Modal tạo/sửa color */}
      <Modal
        title={isEditing ? "Chỉnh sửa Color" : "Tạo Color mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{
            additionalPrice: 0,
            hexCode: '#FF0000',
          }}
        >
          <Form.Item
            label="Version"
            name="versionId"
            rules={[
              { required: true, message: "Vui lòng chọn Version!" },
            ]}
          >
            <Select
              placeholder="Chọn Version"
              size="large"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {versions.map((version) => {
                const model = models.find(m => m.id === version.modelId);
                return (
                  <Option key={version.id} value={version.id}>
                    {model?.modelName} - {version.versionName}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên màu"
                name="colorName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên màu!" },
                  { min: 2, message: "Tên màu phải có ít nhất 2 ký tự!" },
                  { max: 100, message: "Tên màu không được quá 100 ký tự!" },
                ]}
              >
                <Input
                  placeholder="Ví dụ: Đỏ Cherry, Trắng Ngọc Trai..."
                  size="large"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Mã màu (Hex)"
                name="hexCode"
                rules={[
                  { required: true, message: "Vui lòng nhập mã màu!" },
                  { pattern: /^#[0-9A-Fa-f]{6}$/, message: "Mã màu phải có định dạng #RRGGBB!" },
                ]}
              >
                <Space.Compact>
                  <Input
                    placeholder="#FF0000"
                    size="large"
                    style={{ width: 'calc(100% - 100px)' }}
                  />
                  <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues.hexCode !== curValues.hexCode}>
                    {({ getFieldValue }) => (
                      <div
                        style={{
                          width: 100,
                          height: 40,
                          backgroundColor: getFieldValue('hexCode') || '#FF0000',
                          border: '1px solid #d9d9d9',
                          borderRadius: '0 6px 6px 0',
                        }}
                      />
                    )}
                  </Form.Item>
                </Space.Compact>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Màu phổ biến">
                <Space wrap>
                  {commonColors.map((color) => (
                    <Button
                      key={color.value}
                      size="small"
                      style={{
                        backgroundColor: color.value,
                        color: color.value === '#FFFFFF' || color.value === '#F8F8FF' ? '#000' : '#fff',
                        border: '1px solid #d9d9d9',
                      }}
                      onClick={() => {
                        form.setFieldsValue({
                          colorName: color.label,
                          hexCode: color.value,
                        });
                      }}
                    >
                      {color.label}
                    </Button>
                  ))}
                </Space>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="URL hình ảnh"
                name="imageUrl"
                rules={[
                  { type: 'url', message: "URL không hợp lệ!" },
                ]}
              >
                <Input
                  placeholder="https://example.com/image.jpg"
                  size="large"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Giá phụ thu (VND)"
                name="additionalPrice"
                rules={[
                  { required: true, message: "Vui lòng nhập giá phụ thu!" },
                ]}
              >
                <InputNumber
                  placeholder="0"
                  size="large"
                  style={{ width: "100%" }}
                  min={0}
                  max={1000000000}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

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
                {isEditing ? "Cập nhật" : "Tạo Color"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}

export default ManageColor;