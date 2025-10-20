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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { vehicleApi } from "../../../../App/EVMAdmin/VehiclesManagement/Vehicles";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const SUPPLY_STATUS_MAP = {
  0: { text: "Có sẵn", color: "green" },
  1: { text: "Hết hàng", color: "red" },
  2: { text: "Sắp ra mắt", color: "blue" },
};

function ManageVersion() {
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState([]);
  const [models, setModels] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadVersions();
    loadModels();
  }, []);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const res = await vehicleApi.getAllVersions();
      if (res.success) {
        setVersions(res.data || []);
      } else {
        message.error(res.error || "Không thể tải versions");
        setVersions([]);
      }
    } catch (e) {
      message.error("Lỗi khi tải versions");
      setVersions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async () => {
    try {
      const res = await vehicleApi.getAllModels();
      if (res.success) {
        setModels(res.data || []);
      } else {
        setModels([]);
      }
    } catch (e) {
      setModels([]);
    }
  };

  const handleCreate = () => {
    if (!models.length) {
      message.warning("Cần tạo Model trước khi tạo Version!");
      return;
    }
    setIsEditing(false);
    setCurrentVersion(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (version) => {
    setIsEditing(true);
    setCurrentVersion(version);
    form.setFieldsValue({
      modelId: version.modelId,
      versionName: version.versionName,
      motorPower: version.motorPower,
      batteryCapacity: version.batteryCapacity,
      rangePerCharge: version.rangePerCharge,
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

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        modelId: values.modelId,
        versionName: values.versionName,
        motorPower: Number(values.motorPower),
        batteryCapacity: Number(values.batteryCapacity),
        rangePerCharge: Number(values.rangePerCharge),
        supplyStatus: Number(values.supplyStatus),
        topSpeed: Number(values.topSpeed),
        weight: Number(values.weight),
        height: Number(values.height),
        productionYear: Number(values.productionYear),
        description: values.description || "",
        isActive: !!values.isActive,
      };

      let res;
      if (isEditing && currentVersion?.id) {
        res = await vehicleApi.updateVersion(currentVersion.id, payload);
      } else {
        res = await vehicleApi.createVersion(payload);
      }

      if (res.success) {
        const modelName =
          models.find((m) => m.id === payload.modelId)?.modelName || "N/A";
        Modal.success({
          title: (
            <Space>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
              {isEditing ? "Cập nhật Version thành công!" : "Tạo Version thành công!"}
            </Space>
          ),
          content: (
            <div style={{ marginTop: 12 }}>
              <p>
                <strong>Model:</strong> {modelName}
              </p>
              <p>
                <strong>Tên Version:</strong> {res.data?.versionName || payload.versionName}
              </p>
              <p>
                <strong>Công suất:</strong> {payload.motorPower} W
              </p>
              <p>
                <strong>Pin:</strong> {payload.batteryCapacity} V
              </p>
              <p>
                <strong>Tầm hoạt động:</strong> {payload.rangePerCharge} km
              </p>
              {res.data?.id && (
                <p>
                  <strong>Version ID:</strong>{" "}
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
        loadVersions();
      } else {
        message.error(res.error || "Không thể lưu version");
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
      const res = await vehicleApi.deleteVersion(id);
      if (res.success) {
        message.success("Xóa version thành công!");
        loadVersions();
      } else {
        message.error(res.error || "Không thể xóa version");
      }
    } catch (e) {
      message.error("Lỗi khi xóa version");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      width: 70,
      align: "center",
      render: (_, __, i) => i + 1,
    },
    {
      title: "Model",
      dataIndex: "modelId",
      width: 220,
      render: (modelId) => {
        const m = models.find((x) => x.id === modelId);
        return <Tag color="blue">{m?.modelName || (modelId ? modelId.slice(0, 8) : "N/A")}</Tag>;
      },
    },
    {
      title: "Version",
      dataIndex: "versionName",
      width: 240,
      render: (t) => (
        <Space>
          <SettingOutlined style={{ color: "#1890ff" }} />
          <Text strong>{t}</Text>
        </Space>
      ),
    },
    {
      title: "Công suất (W)",
      dataIndex: "motorPower",
      width: 140,
      render: (v) => <Tag color="orange">{v}</Tag>,
    },
    {
      title: "Pin (V)",
      dataIndex: "batteryCapacity",
      width: 110,
      render: (v) => <Tag color="green">{v}</Tag>,
    },
    {
      title: "Tầm (km)",
      dataIndex: "rangePerCharge",
      width: 120,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Tốc độ (km/h)",
      dataIndex: "topSpeed",
      width: 140,
      render: (v) => <Tag color="red">{v}</Tag>,
    },
    {
      title: "Nặng (kg)",
      dataIndex: "weight",
      width: 110,
    },
    {
      title: "Cao (mm)",
      dataIndex: "height",
      width: 110,
    },
    {
      title: "Năm SX",
      dataIndex: "productionYear",
      width: 110,
    },
    {
      title: "Cung cấp",
      dataIndex: "supplyStatus",
      width: 130,
      render: (s) => {
        const cfg = SUPPLY_STATUS_MAP[s] || { text: `Mã ${s}`, color: "default" };
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      ellipsis: true,
      render: (t) => <Text type="secondary">{t || "—"}</Text>,
    },
    {
      title: "Thao tác",
      width: 160,
      fixed: "right",
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn chắc chắn muốn xóa version này?"
            onConfirm={() => handleDelete(r.id)}
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
        title: "Quản lý Version Xe Điện",
        subTitle: "Tạo và quản lý các phiên bản xe điện",
        extra: [
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
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Tạo Version mới
          </Button>,
        ],
      }}
    >
      <div className="w-full px-4 md:px-6 lg:px-8 pb-6">
        <Card className="shadow-sm">
          <Row gutter={[16, 8]} style={{ marginBottom: 8 }}>
            <Col span={24}>
              <Title level={4} className="!mb-1">
                <SettingOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                Danh sách Version
              </Title>
              <Text type="secondary">Tổng cộng: {versions.length} phiên bản</Text>
            </Col>
          </Row>
          <Divider className="!mt-2" />
          <Table
            size="middle"
            columns={columns}
            dataSource={versions}
            rowKey="id"
            loading={loading}
            pagination={{
              total: versions.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (t, r) => `${r[0]}-${r[1]} của ${t} phiên bản`,
            }}
            scroll={{ x: "max-content" }}
            sticky
          />
        </Card>
      </div>

      {/* Modal tạo/sửa */}
      <Modal
        title={isEditing ? "Chỉnh sửa Version" : "Tạo Version mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={840}
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
                    (option?.children ?? "")
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {models.map((m) => (
                    <Option key={m.id} value={m.id}>
                      {m.modelName}
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
                  { min: 2, message: "Tối thiểu 2 ký tự" },
                  { max: 100, message: "Tối đa 100 ký tự" },
                ]}
              >
                <Input placeholder="VD: E-Scooter Pro Max 2025" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Công suất (W)"
                name="motorPower"
                rules={[{ required: true, message: "Nhập công suất!" }]}
              >
                <InputNumber min={1} max={100000} style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Dung lượng pin (V)"
                name="batteryCapacity"
                rules={[{ required: true, message: "Nhập dung lượng pin!" }]}
              >
                <InputNumber min={1} max={1000} style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Tầm hoạt động (km)"
                name="rangePerCharge"
                rules={[{ required: true, message: "Nhập tầm hoạt động!" }]}
              >
                <InputNumber min={1} max={2000} style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Tốc độ tối đa (km/h)"
                name="topSpeed"
                rules={[{ required: true, message: "Nhập tốc độ tối đa!" }]}
              >
                <InputNumber min={1} max={400} style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Trọng lượng (kg)"
                name="weight"
                rules={[{ required: true, message: "Nhập trọng lượng!" }]}
              >
                <InputNumber min={1} max={1000} style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Chiều cao (mm)"
                name="height"
                rules={[{ required: true, message: "Nhập chiều cao!" }]}
              >
                <InputNumber min={100} max={2500} style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Năm sản xuất"
                name="productionYear"
                rules={[{ required: true, message: "Nhập năm sản xuất!" }]}
              >
                <InputNumber min={2020} max={2035} style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Trạng thái cung cấp"
                name="supplyStatus"
                rules={[{ required: true, message: "Chọn trạng thái!" }]}
              >
                <Select size="large">
                  <Option value={0}>Có sẵn</Option>
                  <Option value={1}>Hết hàng</Option>
                  <Option value={2}>Sắp ra mắt</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[
              { required: true, message: "Nhập mô tả!" },
              { min: 10, message: "Tối thiểu 10 ký tự" },
              { max: 500, message: "Tối đa 500 ký tự" },
            ]}
          >
            <TextArea rows={4} placeholder="Mô tả chi tiết về phiên bản..." />
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
                {isEditing ? "Cập nhật" : "Tạo Version"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </PageContainer>
  );
}

export default ManageVersion;
