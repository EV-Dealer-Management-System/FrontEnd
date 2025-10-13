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
  Switch,
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
  Typography,
  Divider,
  Alert,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { vehicleApi } from "../../../../App/EVMAdmin/VehiclesManagement/Vehicles";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

function ManageVersion() {
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState([]);
  const [models, setModels] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [form] = Form.useForm();

  // Load versions và models khi component mount
  useEffect(() => {
    loadVersions();
    loadModels();
  }, []);

  // Tải danh sách versions
  const loadVersions = async () => {
    setLoading(true);
    try {
      console.log("=== LOADING VERSIONS ===");
      const result = await vehicleApi.getAllVersions();

      if (result.success) {
        console.log("✅ Versions loaded successfully:", result.data);
        setVersions(result.data || []);
      } else {
        console.error("❌ Failed to load versions:", result.error);
        message.error("Không thể tải danh sách version: " + result.error);
        setVersions([]);
      }
    } catch (error) {
      console.error("Error loading versions:", error);
      message.error("Lỗi khi tải danh sách version");
      setVersions([]);
    } finally {
      setLoading(false);
    }
  };

  // Tải danh sách models
  const loadModels = async () => {
    try {
      console.log("=== LOADING MODELS FOR DROPDOWN ===");
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

  // Mở modal tạo version mới
  const handleCreate = () => {
    if (models.length === 0) {
      message.warning("Cần tạo Model trước khi tạo Version!");
      return;
    }

    setIsEditing(false);
    setCurrentVersion(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Mở modal chỉnh sửa version
  const handleEdit = (version) => {
    setIsEditing(true);
    setCurrentVersion(version);
    form.setFieldsValue({
      modelId: version.modelId,
      versionName: version.versionName,
      motorPower: version.motorPower,
      batteryCapacity: version.batteryCapacity,
      rangePerkCharge: version.rangePerkCharge,
      supplyStatus: version.supplyStatus,
      topSpeed: version.topSpeed,
      weight: version.weight,
      height: version.height,
      productionYear: version.productionYear,
      description: version.description,
      isActive: version.isActive,
    });
    setIsModalVisible(true);
  };

  // Xử lý submit form (tạo mới hoặc cập nhật)
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log("=== SUBMITTING VERSION FORM ===");
      console.log("Is editing:", isEditing);
      console.log("Form values:", values);
      console.log("Current version:", currentVersion);

      // Validate modelId tồn tại
      if (!values.modelId) {
        message.error("Vui lòng chọn Model!");
        return;
      }

      // Debug: Log current models state và selected modelId
      console.log("=== VERSION SUBMIT DEBUG ===");
      console.log("Selected modelId:", values.modelId);
      console.log(
        "Available models in state:",
        models.map((m) => ({ id: m.id, name: m.modelName }))
      );
      console.log(
        "Model exists in state?",
        models.some((m) => m.id === values.modelId)
      );

      let result;

      if (isEditing && currentVersion) {
        // Cập nhật version
        console.log("Updating version with ID:", currentVersion.id);
        result = await vehicleApi.updateVersion(currentVersion.id, values);
      } else {
        // Tạo version mới
        console.log("Creating new version");
        result = await vehicleApi.createVersion(values);
      }

      console.log("Submit result:", result);

      if (result.success) {
        message.success(
          isEditing
            ? "Cập nhật version thành công!"
            : "Tạo version mới thành công!"
        );

        // Hiển thị thông tin version vừa tạo/cập nhật
        if (result.data) {
          console.log("✅ Version data:", result.data);

          // Tìm model name để hiển thị
          const selectedModel = models.find((m) => m.id === values.modelId);

          Modal.success({
            title: (
              <Space>
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                {isEditing
                  ? "Cập nhật Version thành công!"
                  : "Tạo Version thành công!"}
              </Space>
            ),
            content: (
              <div style={{ marginTop: 16 }}>
                <Alert
                  message="Thông tin Version"
                  description={
                    <div>
                      <p>
                        <strong>Model:</strong>{" "}
                        {selectedModel?.modelName || "N/A"}
                      </p>
                      <p>
                        <strong>Tên Version:</strong>{" "}
                        {result.data.versionName || values.versionName}
                      </p>
                      <p>
                        <strong>Công suất:</strong> {values.motorPower} W
                      </p>
                      <p>
                        <strong>Dung lượng pin:</strong>{" "}
                        {values.batteryCapacity} V
                      </p>
                      <p>
                        <strong>Tầm hoạt động:</strong> {values.rangePerkCharge}{" "}
                        km
                      </p>
                      {result.data.id && (
                        <p>
                          <strong>Version ID (Database):</strong>
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
        await loadVersions(); // Reload danh sách
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

  // Xóa version
  const handleDelete = async (versionId) => {
    setLoading(true);
    try {
      console.log("=== DELETING VERSION ===");
      console.log("Version ID:", versionId);

      const result = await vehicleApi.deleteVersion(versionId);
      console.log("Delete result:", result);

      if (result.success) {
        message.success("Xóa version thành công!");
        await loadVersions(); // Reload danh sách
      } else {
        console.error("❌ Delete failed:", result.error);
        message.error(result.error || "Không thể xóa version");
      }
    } catch (error) {
      console.error("Error deleting version:", error);
      message.error("Lỗi khi xóa version");
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
      title: "Model",
      dataIndex: "modelId",
      key: "modelId",
      width: 150,
      render: (modelId) => {
        const model = models.find((m) => m.id === modelId);
        return (
          <Tag color="blue">
            {model?.modelName || `ID: ${modelId?.slice(0, 8)}...`}
          </Tag>
        );
      },
    },
    {
      title: "Tên Version",
      dataIndex: "versionName",
      key: "versionName",
      render: (name) => (
        <Space>
          <SettingOutlined style={{ color: "#1890ff" }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: "Công suất",
      dataIndex: "motorPower",
      key: "motorPower",
      width: 100,
      render: (power) => <Tag color="orange">{power} W</Tag>,
    },
    {
      title: "Pin",
      dataIndex: "batteryCapacity",
      key: "batteryCapacity",
      width: 100,
      render: (capacity) => <Tag color="green">{capacity} V</Tag>,
    },
    {
      title: "Tầm hoạt động",
      dataIndex: "rangePerkCharge",
      key: "rangePerkCharge",
      width: 120,
      render: (range) => <Tag color="blue">{range} km</Tag>,
    },
    {
      title: "Tốc độ tối đa",
      dataIndex: "topSpeed",
      key: "topSpeed",
      width: 120,
      render: (speed) => <Tag color="red">{speed} km/h</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Hoạt động" : "Ngừng"}
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
            description="Bạn có chắc chắn muốn xóa version này?"
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
      title="Quản lý Version Xe Điện"
      subTitle="Tạo và quản lý các phiên bản xe điện"
      extra={[
        <Button
          key="reload"
          icon={<ReloadOutlined />}
          onClick={() => {
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
          Tạo Version mới
        </Button>,
      ]}
    >
      {/* Cảnh báo nếu chưa có Model */}
      {models.length === 0 && (
        <Card style={{ marginBottom: 16 }}>
          <Alert
            message="Chưa có Model trong hệ thống"
            description="Bạn cần tạo ít nhất một Model trước khi tạo Version. Vui lòng vào trang Quản lý Model để tạo Model mới."
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            action={
              <Button size="small" danger>
                Đi đến Quản lý Model
              </Button>
            }
          />
        </Card>
      )}

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Title level={4}>
              <SettingOutlined style={{ color: "#1890ff", marginRight: 8 }} />
              Danh sách Version
            </Title>
            <Text type="secondary">
              Quản lý các phiên bản xe điện. Tổng cộng: {versions.length}{" "}
              version
            </Text>
          </Col>
        </Row>

        <Divider />

        <Table
          columns={columns}
          dataSource={versions}
          rowKey="id"
          loading={loading}
          pagination={{
            total: versions.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} version`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal tạo/sửa version */}
      <Modal
        title={isEditing ? "Chỉnh sửa Version" : "Tạo Version mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{
            supplyStatus: 1,
            isActive: true,
            productionYear: new Date().getFullYear(),
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Model"
                name="modelId"
                rules={[{ required: true, message: "Vui lòng chọn Model!" }]}
              >
                <Select
                  placeholder="Chọn Model"
                  size="large"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {models.map((model) => (
                    <Option key={model.id} value={model.id}>
                      {model.modelName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Tên Version"
                name="versionName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên version!" },
                  { min: 2, message: "Tên version phải có ít nhất 2 ký tự!" },
                  {
                    max: 100,
                    message: "Tên version không được quá 100 ký tự!",
                  },
                ]}
              >
                <Input
                  placeholder="Ví dụ: Standard, Plus, Pro..."
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Công suất (W)"
                name="motorPower"
                rules={[
                  { required: true, message: "Vui lòng nhập công suất!" },
                ]}
              >
                <InputNumber
                  placeholder="100"
                  size="large"
                  style={{ width: "100%" }}
                  min={1}
                  max={1000000}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Dung lượng pin (V)"
                name="batteryCapacity"
                rules={[
                  { required: true, message: "Vui lòng nhập dung lượng pin!" },
                ]}
              >
                <InputNumber
                  placeholder="50"
                  size="large"
                  style={{ width: "100%" }}
                  min={1}
                  max={1000}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Tầm hoạt động (km)"
                name="rangePerkCharge"
                rules={[
                  { required: true, message: "Vui lòng nhập tầm hoạt động!" },
                ]}
              >
                <InputNumber
                  placeholder="300"
                  size="large"
                  style={{ width: "100%" }}
                  min={1}
                  max={10000}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Tốc độ tối đa (km/h)"
                name="topSpeed"
                rules={[
                  { required: true, message: "Vui lòng nhập tốc độ tối đa!" },
                ]}
              >
                <InputNumber
                  placeholder="120"
                  size="large"
                  style={{ width: "100%" }}
                  min={1}
                  max={500}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Trọng lượng (kg)"
                name="weight"
                rules={[
                  { required: true, message: "Vui lòng nhập trọng lượng!" },
                ]}
              >
                <InputNumber
                  placeholder="1500"
                  size="large"
                  style={{ width: "100%" }}
                  min={1}
                  max={10000}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Chiều cao (cm)"
                name="height"
                rules={[
                  { required: true, message: "Vui lòng nhập chiều cao!" },
                ]}
              >
                <InputNumber
                  placeholder="1600"
                  size="large"
                  style={{ width: "100%" }}
                  min={1}
                  max={1000}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Năm sản xuất"
                name="productionYear"
                rules={[
                  { required: true, message: "Vui lòng nhập năm sản xuất!" },
                ]}
              >
                <InputNumber
                  size="large"
                  style={{ width: "100%" }}
                  min={2020}
                  max={2030}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Trạng thái cung cấp"
                name="supplyStatus"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select size="large">
                  <Option value={1}>Có sẵn</Option>
                  <Option value={0}>Hết hàng</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Hoạt động"
                name="isActive"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả!" },
              { min: 10, message: "Mô tả phải có ít nhất 10 ký tự!" },
              { max: 500, message: "Mô tả không được quá 500 ký tự!" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Mô tả chi tiết về phiên bản này..."
              size="large"
            />
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
                {isEditing ? "Cập nhật" : "Tạo Version"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}

export default ManageVersion;
