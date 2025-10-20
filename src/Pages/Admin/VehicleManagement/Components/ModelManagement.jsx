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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CarOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { vehicleApi } from "../../../../App/EVMAdmin/VehiclesManagement/Vehicles";

const { TextArea } = Input;
const { Title, Text } = Typography;

function ManageModel() {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const result = await vehicleApi.getAllModels();
      if (result.success) {
        setModels(result.data || []);
      } else {
        message.error("Không thể tải danh sách model");
        setModels([]);
      }
    } catch (e) {
      message.error("Lỗi khi tải danh sách model");
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsEditing(false);
    setCurrentModel(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (model) => {
    setIsEditing(true);
    setCurrentModel(model);
    form.setFieldsValue({
      modelName: model.modelName,
      description: model.description,
    });
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      let res;
      if (isEditing && currentModel?.id) {
        // BE chỉ nhận field có trong spec -> gửi đúng 2 field
        res = await vehicleApi.updateModel(currentModel.id, {
          modelName: values.modelName,
          description: values.description || "",
        });
      } else {
        res = await vehicleApi.createModel({
          modelName: values.modelName,
          description: values.description || "",
        });
      }

      if (res.success) {
        Modal.success({
          title: (
            <Space>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
              {isEditing ? "Cập nhật Model thành công!" : "Tạo Model thành công!"}
            </Space>
          ),
          content: (
            <div style={{ marginTop: 12 }}>
              <p>
                <strong>Tên model:</strong> {res.data?.modelName || values.modelName}
              </p>
              <p>
                <strong>Mô tả:</strong> {res.data?.description ?? values.description ?? "—"}
              </p>
              {res.data?.id && (
                <p>
                  <strong>Model ID:</strong>{" "}
                  <Text code copyable>
                    {res.data.id}
                  </Text>
                </p>
              )}
            </div>
          ),
        });
        setIsModalVisible(false);
        form.resetFields();
        loadModels();
      } else {
        message.error(res.error || "Thao tác thất bại");
      }
    } catch (e) {
      message.error("Lỗi khi gửi dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await vehicleApi.deleteModel(id);
      if (res.success) {
        message.success("Xóa model thành công!");
        loadModels();
      } else {
        message.error(res.error || "Không thể xóa model");
      }
    } catch (e) {
      message.error("Lỗi khi xóa model");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      width: 70,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên Model",
      dataIndex: "modelName",
      width: 260,
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
      ellipsis: true,
      render: (text) => <Text type="secondary">{text || "Chưa có mô tả"}</Text>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 160,
      render: (date) => (date ? new Date(date).toLocaleDateString("vi-VN") : "N/A"),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      width: 140,
      render: (val) => (
        <Tag color={val ? "success" : "default"}>{val ? "Đang hoạt động" : "Ngừng"}</Tag>
      ),
    },
    {
      title: "Thao tác",
      width: 170,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Xóa model này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      className="!p-0"
      childrenContentStyle={{ padding: 0, margin: 0 }}
      header={{
        title: "Quản lý Model Xe Điện",
        subTitle: "Tạo và quản lý các model xe điện",
        extra: [
          <Button key="reload" icon={<ReloadOutlined />} onClick={loadModels} loading={loading}>
            Tải lại
          </Button>,
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Tạo Model mới
          </Button>,
        ],
      }}
    >
      <div className="w-full px-4 md:px-6 lg:px-8 pb-6">
        <Card className="shadow-sm">
          <Row gutter={[16, 8]} style={{ marginBottom: 8 }}>
            <Col span={24}>
              <Title level={4} className="!mb-1">
                <CarOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                Danh sách Models
              </Title>
              <Text type="secondary">Tổng cộng: {models.length} model</Text>
            </Col>
          </Row>
          <Divider className="!mt-2" />
          <Table
            size="middle"
            columns={columns}
            dataSource={models}
            rowKey="id"
            loading={loading}
            pagination={{
              total: models.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} model`,
            }}
            scroll={{ x: "max-content" }}
            sticky
          />
        </Card>
      </div>

      {/* Modal tạo/sửa */}
      <Modal
        title={isEditing ? "Chỉnh sửa Model" : "Tạo Model mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item
            label="Tên Model"
            name="modelName"
            rules={[
              { required: true, message: "Vui lòng nhập tên model!" },
              { min: 2, message: "Tên model phải có ít nhất 2 ký tự!" },
              { max: 100, message: "Tên model không được quá 100 ký tự!" },
            ]}
          >
            <Input placeholder="VD: E-Scooter Pro Max" size="large" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ max: 1000, message: "Mô tả không được quá 1000 ký tự!" }]}
          >
            <TextArea placeholder="Mô tả chi tiết về model..." rows={4} showCount maxLength={1000} />
          </Form.Item>

          <div style={{ textAlign: "right" }}>
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
          </div>
        </Form>
      </Modal>
    </PageContainer>
  );
}

export default ManageModel;
