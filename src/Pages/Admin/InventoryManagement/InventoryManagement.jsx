import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Row,
  Col,
  Typography,
  Tag,
  Spin,
  Alert,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  ShopOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { Inventory } from "../../../App/EVMAdmin/VehiclesManagement/Inventory";
import NavigationBar from "../../../Components/Admin/Components/NavigationBar";

const { Title, Text } = Typography;
const { TextArea } = Input;

function InventoryManagement() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inventories, setInventories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();

  // Load data khi component mount
  useEffect(() => {
    loadInventories();
  }, []);

  // Load danh sách kho
  const loadInventories = async () => {
    try {
      setLoading(true);
      const response = await Inventory.getAllEVCInventory();

      console.log("📦 Inventory API Response:", response);

      // Kiểm tra cấu trúc response từ API
      if (response && response.result && Array.isArray(response.result)) {
        setInventories(response.result);
        message.success(`Tải thành công ${response.result.length} kho!`);
      } else if (response && response.data && Array.isArray(response.data)) {
        setInventories(response.data);
        message.success(`Tải thành công ${response.data.length} kho!`);
      } else if (response && Array.isArray(response)) {
        setInventories(response);
        message.success(`Tải thành công ${response.length} kho!`);
      } else {
        console.warn("⚠️ Unexpected response structure:", response);
        setInventories([]);
        message.warning("Không có dữ liệu kho!");
      }
    } catch (error) {
      console.error("Error loading inventories:", error);
      message.error("Lỗi khi tải danh sách kho: " + error.message);
      setInventories([]);
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị modal tạo mới
  const showCreateModal = () => {
    setEditingRecord(null);
    setIsModalVisible(true);
    form.resetFields();
    form.setFieldsValue({ isActive: true }); // Default active
  };

  // Hiển thị modal chỉnh sửa
  const showEditModal = (record) => {
    setEditingRecord(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      name: record.name,
      location: record.location,
      description: record.description,
      isActive: record.isActive,
    });
  };

  // Hiển thị modal xem chi tiết
  const showViewModal = (record) => {
    setSelectedRecord(record);
    setIsViewModalVisible(true);
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      console.log("Form values:", values);

      if (editingRecord) {
        // Cập nhật (nếu có API update)
        message.info("Chức năng cập nhật sẽ được thêm sau!");
      } else {
        // Tạo mới
        const result = await Inventory.createInventory(values);
        console.log("Create result:", result);

        message.success("Tạo kho thành công!");
        setIsModalVisible(false);
        form.resetFields();
        loadInventories(); // Reload data
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Có lỗi xảy ra: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Columns cho bảng
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
      align: "center",
    },
    {
      title: "Tên kho",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Text strong style={{ color: "#1890ff" }}>
          {text || "N/A"}
        </Text>
      ),
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
      render: (text) => text || "N/A",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text || "Không có mô tả"}
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      align: "center",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Ngừng hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString("vi-VN");
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => showViewModal(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => message.info("Chức năng xóa sẽ được thêm sau!")}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <NavigationBar collapsed={collapsed} onCollapse={setCollapsed} />

      {/* Main Content */}
      <div
        className="flex-1 transition-all duration-200"
        style={{
          marginLeft: collapsed ? 64 : 280,
          minHeight: "100vh",
        }}
      >
        <PageContainer
          header={{
            title: "Quản lý kho xe điện",
            subTitle: "Quản lý danh sách và thông tin các kho chứa xe điện",
            breadcrumb: {
              items: [{ title: "Trang chủ" }, { title: "Quản lý kho" }],
            },
            extra: [
              <Button
                key="refresh"
                icon={<ReloadOutlined />}
                onClick={loadInventories}
                loading={loading}
              >
                Làm mới
              </Button>,
              <Button
                key="create"
                type="primary"
                icon={<PlusOutlined />}
                onClick={showCreateModal}
              >
                Tạo kho mới
              </Button>,
            ],
          }}
          content={
            <Alert
              message="Quản lý kho xe điện"
              description="Tạo và quản lý các kho chứa xe điện, theo dõi trạng thái và thông tin kho."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          }
        >
          <Card>
            <Table
              columns={columns}
              dataSource={inventories}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} kho`,
              }}
              scroll={{ x: 800 }}
            />
          </Card>

          {/* Modal tạo/sửa kho */}
          <Modal
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <ShopOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                {editingRecord ? "Chỉnh sửa kho" : "Tạo kho mới"}
              </div>
            }
            open={isModalVisible}
            onCancel={() => {
              setIsModalVisible(false);
              form.resetFields();
            }}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={600}
            okText={editingRecord ? "Cập nhật" : "Tạo kho"}
            cancelText="Hủy bỏ"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              size="large"
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Tên kho"
                    name="name"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên kho!" },
                      { min: 2, message: "Tên kho phải có ít nhất 2 ký tự!" },
                      {
                        max: 100,
                        message: "Tên kho không được quá 100 ký tự!",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nhập tên kho (VD: Kho Hà Nội, Kho TP.HCM)"
                      prefix={<ShopOutlined />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Địa điểm"
                    name="location"
                    rules={[
                      { required: true, message: "Vui lòng nhập địa điểm!" },
                      { min: 5, message: "Địa điểm phải có ít nhất 5 ký tự!" },
                      {
                        max: 200,
                        message: "Địa điểm không được quá 200 ký tự!",
                      },
                    ]}
                  >
                    <Input placeholder="Nhập địa điểm kho (VD: 123 Nguyễn Văn A, Quận 1, TP.HCM)" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Mô tả"
                    name="description"
                    rules={[
                      { max: 500, message: "Mô tả không được quá 500 ký tự!" },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Nhập mô tả về kho (không bắt buộc)"
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Trạng thái hoạt động"
                    name="isActive"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Hoạt động"
                      unCheckedChildren="Tạm ngừng"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>

          {/* Modal xem chi tiết */}
          <Modal
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <EyeOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                Chi tiết kho
              </div>
            }
            open={isViewModalVisible}
            onCancel={() => setIsViewModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                Đóng
              </Button>,
            ]}
            width={600}
          >
            {selectedRecord && (
              <div style={{ padding: "16px 0" }}>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Text strong>Tên kho:</Text>
                  </Col>
                  <Col span={16}>
                    <Text>{selectedRecord.name}</Text>
                  </Col>

                  <Col span={8}>
                    <Text strong>Địa điểm:</Text>
                  </Col>
                  <Col span={16}>
                    <Text>{selectedRecord.location}</Text>
                  </Col>

                  <Col span={8}>
                    <Text strong>Mô tả:</Text>
                  </Col>
                  <Col span={16}>
                    <Text>
                      {selectedRecord.description || "Không có mô tả"}
                    </Text>
                  </Col>

                  <Col span={8}>
                    <Text strong>Trạng thái:</Text>
                  </Col>
                  <Col span={16}>
                    <Tag color={selectedRecord.isActive ? "green" : "red"}>
                      {selectedRecord.isActive
                        ? "Hoạt động"
                        : "Ngừng hoạt động"}
                    </Tag>
                  </Col>

                  <Col span={8}>
                    <Text strong>Ngày tạo:</Text>
                  </Col>
                  <Col span={16}>
                    <Text>
                      {selectedRecord.createdAt
                        ? new Date(selectedRecord.createdAt).toLocaleString(
                            "vi-VN"
                          )
                        : "N/A"}
                    </Text>
                  </Col>
                </Row>
              </div>
            )}
          </Modal>
        </PageContainer>
      </div>
    </div>
  );
}

export default InventoryManagement;
