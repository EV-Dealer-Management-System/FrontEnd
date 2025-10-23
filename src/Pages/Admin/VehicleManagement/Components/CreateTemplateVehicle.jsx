import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Row,
  Col,
  Typography,
  Divider,
  Alert,
  Spin,
  Table,
  Tag,
  Tooltip,
  Badge,
} from "antd";
import {
  PlusOutlined,
  CarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { vehicleApi } from "../../../../App/EVMAdmin/VehiclesManagement/Vehicles";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../../Components/Admin/Components/NavigationBar";

const { Title, Text } = Typography;
const { Option } = Select;

function CreateTemplateVehicle() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // State cho dropdown data
  const [versions, setVersions] = useState([]);
  const [colors, setColors] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [loadingColors, setLoadingColors] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  
  // State để lưu template đã lấy được
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const navigate = useNavigate();

  // Load data khi component mount
  useEffect(() => {
    loadVersions();
    loadColors();
    loadWarehouses();
    fetchAllVehicles();
  }, []);

  // Load tất cả xe
  const fetchAllVehicles = async () => {
    try {
      setTableLoading(true);
      console.log("🔄 [CreateTemplateVehicle] Calling getAllVehicles()...");
      
      const result = await vehicleApi.getAllVehicles();
      
      console.log("📥 [CreateTemplateVehicle] Response:", result);

      if (result.success) {
        // ✅ Lấy data từ response.result (danh sách xe có VIN)
        const vehiclesData = result.result || result.data || [];
        
        console.log(`✅ [CreateTemplateVehicle] Loaded ${vehiclesData.length} vehicles`);
        
        setVehiclesList(vehiclesData);
        
        if (vehiclesData.length === 0) {
          message.info("Chưa có xe nào trong hệ thống.");
        }
      } else {
        console.error("❌ [CreateTemplateVehicle] API Error:", result.error);
        message.error(result.error || "Không thể tải danh sách xe!");
        setVehiclesList([]);
      }
    } catch (error) {
      console.error("❌ [CreateTemplateVehicle] Error fetching vehicles:", error);
      message.error("Có lỗi xảy ra khi tải danh sách xe!");
      setVehiclesList([]);
    } finally {
      setTableLoading(false);
    }
  };

  const loadVersions = async () => {
    try {
      setLoadingVersions(true);
      const result = await vehicleApi.getAllVersions();
      if (result.success) {
        setVersions(result.data || []);
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách version");
    } finally {
      setLoadingVersions(false);
    }
  };

  const loadColors = async () => {
    try {
      setLoadingColors(true);
      const result = await vehicleApi.getAllColors();
      if (result.success) {
        setColors(result.data || []);
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách màu");
    } finally {
      setLoadingColors(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      setLoadingWarehouses(true);
      const result = await vehicleApi.getAllWarehouses();
      if (result.success) {
        setWarehouses(result.data || []);
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách kho");
    } finally {
      setLoadingWarehouses(false);
    }
  };

  // Hàm gọi API lấy template khi chọn version và color
  const handleVersionOrColorChange = async () => {
    const versionId = form.getFieldValue('versionId');
    const colorId = form.getFieldValue('colorId');

    if (!versionId || !colorId) {
      setSelectedTemplate(null);
      return;
    }

    try {
      setLoadingTemplate(true);
      message.loading('Đang tìm template...', 0);
      
      const result = await vehicleApi.getTemplateByVersionAndColor(versionId, colorId);
      message.destroy();

      if (result.success && result.data) {
        setSelectedTemplate(result.data);
        message.success('✅ Đã tìm thấy template!');
      } else {
        setSelectedTemplate(null);
        message.warning('⚠️ Không tìm thấy template. Vui lòng tạo template trước!');
      }
    } catch (error) {
      console.error('❌ Error getting template:', error);
      message.error('Lỗi khi tìm template!');
      setSelectedTemplate(null);
    } finally {
      setLoadingTemplate(false);
    }
  };

  // Handle form submission TẠO MỚI
  const handleCreateVehicle = async (values) => {
    if (!selectedTemplate || !selectedTemplate.id) {
      message.error('❌ Chưa chọn template! Vui lòng chọn Version và Color trước.');
      return;
    }

    try {
      setLoading(true);

      const selectedWarehouse = warehouses.find((w) => w.id === values.warehouseId);

      const vehiclePayload = {
        electricVehicleTemplateId: selectedTemplate.id,
        warehouseId: values.warehouseId,
        vin: values.vin,
        status: values.status || 1,
        vehicleList: [],
        manufactureDate: values.manufactureDate || null,
        importDate: null,
        warrantyExpiryDate: null,
        dealerReceivedDate: values.dealerReceivedDate || null,
      };

      setVehicleData({
        ...vehiclePayload,
        _displayInfo: {
          templateInfo: selectedTemplate,
          warehouseName: selectedWarehouse?.name || "N/A",
          versionName: versions.find(v => v.id === form.getFieldValue('versionId'))?.name || 'N/A',
          colorName: colors.find(c => c.id === form.getFieldValue('colorId'))?.name || 'N/A',
        }
      });
      
      setConfirmModalVisible(true);
    } catch (error) {
      console.error("❌ Error preparing vehicle data:", error);
      message.error("Có lỗi xảy ra khi chuẩn bị dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  // Confirm and submit vehicle
  const confirmCreateVehicle = async () => {
    try {
      setLoading(true);
      setConfirmModalVisible(false);

      const { _displayInfo, ...apiPayload } = vehicleData;

      console.log("📤 [CreateTemplateVehicle] Calling createVehicle() with payload:", apiPayload);
      
      // ✅ ĐÚNG: Gọi API POST /ElectricVehicle/create-vehicle
      const result = await vehicleApi.createVehicle(apiPayload);

      console.log("📥 [CreateTemplateVehicle] createVehicle() response:", result);

      if (result.success || result.isSuccess) {
        message.success(result.message || "✅ Tạo xe thành công!");
        form.resetFields();
        setCreateModalVisible(false);
        setSelectedTemplate(null);
        fetchAllVehicles();
      } else {
        message.error(result.message || result.error || "❌ Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("❌ [CreateTemplateVehicle] Error creating vehicle:", error);
      message.error("Có lỗi xảy ra khi tạo xe!");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit vehicle
  const handleEditVehicle = (record) => {
    setEditingVehicle(record);
    form.setFieldsValue({
      vin: record.vin,
      status: record.status,
      manufactureDate: record.manufactureDate,
      importDate: record.importDate,
      warrantyExpiryDate: record.warrantyExpiryDate,
    });
    setEditModalVisible(true);
  };

  // Submit edit
  const handleSubmitEdit = async (values) => {
    try {
      setLoading(true);

      const updatePayload = {
        vin: values.vin,
        status: values.status,
        manufactureDate: values.manufactureDate || null,
        importDate: values.importDate || null,
        warrantyExpiryDate: values.warrantyExpiryDate || null,
      };

      const result = await vehicleApi.updateVehicle(editingVehicle.id, updatePayload);

      if (result.success) {
        message.success("Cập nhật xe thành công!");
        setEditModalVisible(false);
        form.resetFields();
        fetchAllVehicles();
      } else {
        message.error(result.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("❌ Error updating vehicle:", error);
      message.error("Có lỗi xảy ra khi cập nhật xe!");
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "VIN",
      dataIndex: "vin",
      key: "vin",
      width: 150,
      render: (text) => <Text copyable strong style={{ color: "#1890ff" }}>{text}</Text>,
    },
    {
      title: "Template",
      key: "template",
      render: (_, record) => {
        const template = record.electricVehicleTemplate || {};
        return (
          <div>
            <Text strong>{template.versionName || "N/A"}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {template.modelName || "N/A"}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Kho",
      dataIndex: "warehouseName",
      key: "warehouse",
      render: (text) => <Text>{text || "N/A"}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          1: { color: "success", text: "Khả dụng" },
          2: { color: "processing", text: "Đã bán" },
          3: { color: "warning", text: "Bảo trì" },
          4: { color: "error", text: "Hỏng" },
        };
        const config = statusMap[status] || { color: "default", text: "N/A" };
        return <Badge status={config.color} text={config.text} />;
      },
    },
    {
      title: "Ngày SX",
      dataIndex: "manufactureDate",
      key: "manufactureDate",
      render: (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Tooltip title="Chỉnh sửa">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditVehicle(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Navbar>
      <PageContainer
        header={{
          title: "Tạo Xe Điện",
          subTitle: "Tạo xe điện cụ thể từ template có sẵn",
          breadcrumb: {
            items: [
              { title: "Trang chủ" },
              { title: "Quản lý xe điện" },
              { title: "Tạo xe điện" },
            ],
          },
          extra: [
            <Button
              key="refresh"
              icon={<ReloadOutlined />}
              onClick={fetchAllVehicles}
              loading={tableLoading}
            >
              Làm mới
            </Button>,
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Tạo xe điện mới
            </Button>,
          ],
        }}
      >
        <Alert
          message="Danh sách xe điện đã tạo"
          description={`Hiển thị ${vehiclesList.length} xe. Mỗi xe có VIN riêng và được tạo từ template.`}
          type="info"
          showIcon
          closable
          className="mb-4"
        />

        <Card>
          <Table
            columns={columns}
            dataSource={vehiclesList}
            rowKey="id"
            loading={tableLoading}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} xe`,
            }}
            locale={{
              emptyText: (
                <div className="py-8 text-center">
                  <CarOutlined style={{ fontSize: 48, color: "#ccc" }} />
                  <p className="text-gray-500 mt-2">Chưa có xe nào</p>
                  <Button type="primary" onClick={() => setCreateModalVisible(true)}>
                    Tạo xe đầu tiên
                  </Button>
                </div>
              ),
            }}
          />
        </Card>

        {/* Modal tạo xe mới */}
        <Modal
          title="Tạo xe điện cụ thể"
          open={createModalVisible}
          onCancel={() => {
            setCreateModalVisible(false);
            form.resetFields();
            setSelectedTemplate(null);
          }}
          footer={null}
          width={900}
        >
          <Form form={form} layout="vertical" onFinish={handleCreateVehicle}>
            <Alert
              message="Bước 1: Chọn Version và Color để tìm Template"
              type="warning"
              showIcon
              className="mb-4"
            />

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Chọn Version"
                  name="versionId"
                  rules={[{ required: true, message: "Vui lòng chọn version!" }]}
                >
                  <Select
                    placeholder="Chọn version..."
                    loading={loadingVersions}
                    showSearch
                    onChange={handleVersionOrColorChange}
                  >
                    {versions.map((version) => (
                      <Option key={version.id} value={version.id}>
                        {version.name || version.versionName} - {version.model?.name || 'N/A'}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Chọn Màu sắc"
                  name="colorId"
                  rules={[{ required: true, message: "Vui lòng chọn màu!" }]}
                >
                  <Select
                    placeholder="Chọn màu..."
                    loading={loadingColors}
                    showSearch
                    onChange={handleVersionOrColorChange}
                  >
                    {colors.map((color) => (
                      <Option key={color.id} value={color.id}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              backgroundColor: color.hexCode || "#ccc",
                              borderRadius: "50%",
                              marginRight: 8,
                              border: "1px solid #d9d9d9",
                            }}
                          />
                          {color.name || color.colorName}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {loadingTemplate && (
              <Alert
                message="Đang tìm template..."
                type="info"
                showIcon
                icon={<Spin size="small" />}
                className="mb-4"
              />
            )}

            {selectedTemplate && (
              <Alert
                message="✅ Đã tìm thấy Template!"
                description={
                  <div>
                    <p><strong>Template ID:</strong> <Text code>{selectedTemplate.id}</Text></p>
                    <p><strong>Giá:</strong> {selectedTemplate.price?.toLocaleString('vi-VN')} ₫</p>
                  </div>
                }
                type="success"
                showIcon
                className="mb-4"
              />
            )}

            <Divider />

            <Alert
              message="Bước 2: Nhập thông tin xe"
              type="info"
              showIcon
              className="mb-4"
            />

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Chọn Kho"
                  name="warehouseId"
                  rules={[{ required: true, message: "Vui lòng chọn kho!" }]}
                >
                  <Select
                    placeholder="Chọn kho..."
                    loading={loadingWarehouses}
                    showSearch
                  >
                    {warehouses.map((warehouse) => (
                      <Option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name || warehouse.warehouseName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="VIN (17 ký tự)"
                  name="vin"
                  rules={[
                    { required: true, message: "Vui lòng nhập VIN!" },
                    { len: 17, message: "VIN phải có đúng 17 ký tự!" }
                  ]}
                >
                  <Input placeholder="Nhập VIN" maxLength={17} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Trạng thái"
                  name="status"
                  initialValue={1}
                >
                  <Select>
                    <Option value={1}>Khả dụng</Option>
                    <Option value={2}>Đã bán</Option>
                    <Option value={3}>Bảo trì</Option>
                    <Option value={4}>Hỏng</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Ngày sản xuất" name="manufactureDate">
                  <Input type="datetime-local" />
                </Form.Item>
              </Col>
            </Row>

            <Alert
              message="Import Date và Warranty Date sẽ được set NULL"
              type="info"
              showIcon
              className="mb-4"
            />

            <Divider />

            <Row justify="end" gutter={16}>
              <Col>
                <Button onClick={() => {
                  setCreateModalVisible(false);
                  form.resetFields();
                  setSelectedTemplate(null);
                }}>
                  Hủy
                </Button>
              </Col>
              <Col>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  disabled={!selectedTemplate}
                  icon={<CarOutlined />}
                >
                  Tạo Xe
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* Modal xác nhận */}
        <Modal
          title={
            <div className="text-center">
              <CheckCircleOutlined className="text-green-500 text-2xl mr-2" />
              Xác nhận tạo xe
            </div>
          }
          open={confirmModalVisible}
          onOk={confirmCreateVehicle}
          onCancel={() => setConfirmModalVisible(false)}
          okText="Xác nhận tạo"
          cancelText="Hủy"
          okButtonProps={{ loading }}
        >
          {vehicleData && (
            <div className="space-y-2">
              <p><Text strong>Template ID:</Text> <Text code className="text-xs">{vehicleData.electricVehicleTemplateId}</Text></p>
              <p><Text strong>Version:</Text> {vehicleData._displayInfo?.versionName}</p>
              <p><Text strong>Màu:</Text> {vehicleData._displayInfo?.colorName}</p>
              <p><Text strong>Kho:</Text> {vehicleData._displayInfo?.warehouseName}</p>
              <p><Text strong>VIN:</Text> <Text code>{vehicleData.vin}</Text></p>
              <Divider className="my-2" />
              <Alert
                message="Import Date và Warranty Date sẽ được set NULL"
                type="warning"
                showIcon
              />
            </div>
          )}
        </Modal>

        {/* Modal chỉnh sửa */}
        <Modal
          title="Chỉnh sửa xe"
          open={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={700}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmitEdit}>
            <Form.Item label="VIN" name="vin">
              <Input disabled />
            </Form.Item>

            <Form.Item label="Trạng thái" name="status">
              <Select>
                <Option value={1}>Khả dụng</Option>
                <Option value={2}>Đã bán</Option>
                <Option value={3}>Bảo trì</Option>
                <Option value={4}>Hỏng</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Ngày sản xuất" name="manufactureDate">
              <Input type="datetime-local" />
            </Form.Item>

            <Form.Item label="Ngày nhập khẩu" name="importDate">
              <Input type="datetime-local" />
            </Form.Item>

            <Form.Item label="Ngày hết hạn bảo hành" name="warrantyExpiryDate">
              <Input type="datetime-local" />
            </Form.Item>

            <Divider />

            <Row justify="end" gutter={16}>
              <Col>
                <Button onClick={() => {
                  setEditModalVisible(false);
                  form.resetFields();
                }}>
                  Hủy
                </Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Cập nhật
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal>
      </PageContainer>
    </Navbar>
  );
}

export default CreateTemplateVehicle;
