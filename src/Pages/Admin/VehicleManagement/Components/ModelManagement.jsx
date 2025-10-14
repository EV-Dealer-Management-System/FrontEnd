import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
  Typography,
  Divider,
  Alert,
  Image,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CarOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { vehicleApi } from "../../../../App/EVMAdmin/VehiclesManagement/Vehicles";

const { TextArea } = Input;
const { Title, Text } = Typography;

function ManageModel() {
  console.log("🚗 ManageModel component rendering...");

  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [form] = Form.useForm();

  // Load models khi component mount
  useEffect(() => {
    loadModels();
  }, []);

  // Tải danh sách models
  const loadModels = async () => {
    setLoading(true);
    try {
      console.log("=== LOADING MODELS ===");
      const result = await vehicleApi.getAllModels();

      if (result.success) {
        console.log("✅ Models loaded successfully:", result.data);
        setModels(result.data || []);
      } else {
        console.error("❌ Failed to load models:", result.error);
        message.error("Không thể tải danh sách model: " + result.error);
        setModels([]);
      }
    } catch (error) {
      console.error("Error loading models:", error);
      message.error("Lỗi khi tải danh sách model");
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  // Mở modal tạo model mới
  const handleCreate = () => {
    setIsEditing(false);
    setCurrentModel(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Mở modal chỉnh sửa model
  const handleEdit = (model) => {
    setIsEditing(true);
    setCurrentModel(model);
    form.setFieldsValue({
      modelName: model.modelName,
      description: model.description,
      imageUrl: model.imageUrl,
    });
    setIsModalVisible(true);
  };

  // Xử lý submit form (tạo mới hoặc cập nhật)
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log("=== SUBMITTING MODEL FORM ===");
      console.log("Is editing:", isEditing);
      console.log("Form values:", values);
      console.log("Current model:", currentModel);

      let result;

      if (isEditing && currentModel) {
        // Cập nhật model
        console.log("Updating model with ID:", currentModel.id);
        result = await vehicleApi.updateModel(currentModel.id, values);
      } else {
        // Tạo model mới
        console.log("Creating new model");
        result = await vehicleApi.createModel(values);
      }

      console.log("Submit result:", result);

      if (result.success) {
        message.success(
          isEditing ? "Cập nhật model thành công!" : "Tạo model mới thành công!"
        );

        // Hiển thị thông tin model vừa tạo/cập nhật
        if (result.data) {
          console.log("✅ Model data:", result.data);

          Modal.success({
            title: (
              <Space>
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                {isEditing
                  ? "Cập nhật Model thành công!"
                  : "Tạo Model thành công!"}
              </Space>
            ),
            content: (
              <div style={{ marginTop: 16 }}>
                <Alert
                  message="Thông tin Model"
                  description={
                    <div>
                      <p>
                        <strong>Tên model:</strong>{" "}
                        {result.data.modelName || values.modelName}
                      </p>
                      <p>
                        <strong>Mô tả:</strong>{" "}
                        {result.data.description || values.description}
                      </p>
                      {(result.data.imageUrl || values.imageUrl) && (
                        <p>
                          <strong>Hình ảnh:</strong>{" "}
                          <a
                            href={result.data.imageUrl || values.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Xem hình
                          </a>
                        </p>
                      )}
                      {result.data.id && (
                        <p>
                          <strong>Model ID (Database):</strong>
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
        await loadModels(); // Reload danh sách
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

  // Xóa model
  const handleDelete = async (modelId) => {
    setLoading(true);
    try {
      console.log("=== DELETING MODEL ===");
      console.log("Model ID:", modelId);

      const result = await vehicleApi.deleteModel(modelId);
      console.log("Delete result:", result);

      if (result.success) {
        message.success("Xóa model thành công!");
        await loadModels(); // Reload danh sách
      } else {
        console.error("❌ Delete failed:", result.error);
        message.error(result.error || "Không thể xóa model");
      }
    } catch (error) {
      console.error("Error deleting model:", error);
      message.error("Lỗi khi xóa model");
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
      title: "Tên Model",
      dataIndex: "modelName",
      key: "modelName",
      width: 200,
      render: (text) => (
        <Space>
          <CarOutlined style={{ color: "#1890ff" }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => (
        <Text type="secondary" ellipsis>
          {text || "Chưa có mô tả"}
        </Text>
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 120,
      render: (imageUrl) =>
        imageUrl ? (
          <Image
            src={imageUrl}
            alt="Model"
            width={80}
            height={50}
            style={{ objectFit: "cover", borderRadius: 4 }}
          />
        ) : (
          <Tag color="default">Chưa có</Tag>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
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
            description="Bạn có chắc chắn muốn xóa model này? Điều này sẽ xóa tất cả versions và colors liên quan."
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
      title="Quản lý Model Xe Điện"
      subTitle="Tạo và quản lý các model xe điện trong hệ thống"
      extra={[
        <Button
          key="reload"
          icon={<ReloadOutlined />}
          onClick={loadModels}
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
          Tạo Model mới
        </Button>,
      ]}
    >
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Title level={4}>
              <CarOutlined style={{ color: "#1890ff", marginRight: 8 }} />
              Danh sách Models
            </Title>
            <Text type="secondary">
              Quản lý các model xe điện. Tổng cộng: {models.length} model
            </Text>
          </Col>
        </Row>

        <Divider />

        <Table
          columns={columns}
          dataSource={models}
          rowKey="id"
          loading={loading}
          pagination={{
            total: models.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} model`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal tạo/sửa model */}
      <Modal
        title={isEditing ? "Chỉnh sửa Model" : "Tạo Model mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            label="Tên Model"
            name="modelName"
            rules={[
              { required: true, message: "Vui lòng nhập tên model!" },
              { min: 2, message: "Tên model phải có ít nhất 2 ký tự!" },
              { max: 100, message: "Tên model không được quá 100 ký tự!" },
            ]}
          >
            <Input
              placeholder="Ví dụ: Tesla Model 3, VinFast VF8..."
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ max: 1000, message: "Mô tả không được quá 1000 ký tự!" }]}
          >
            <TextArea
              placeholder="Mô tả chi tiết về model xe..."
              rows={4}
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item
            label="URL hình ảnh"
            name="imageUrl"
            rules={[{ type: "url", message: "URL không hợp lệ!" }]}
          >
            <Input placeholder="https://example.com/image.jpg" size="large" />
          </Form.Item>

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
                {isEditing ? "Cập nhật" : "Tạo Model"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}

export default ManageModel;
