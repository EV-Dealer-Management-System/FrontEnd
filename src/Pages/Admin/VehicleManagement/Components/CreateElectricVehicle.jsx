import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Tag,
  Row,
  Col,
  Typography,
  Divider,
  Alert,
  Steps,
  Upload,
  Image,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CarOutlined,
  ReloadOutlined,
  EyeOutlined,
  ZoomInOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { vehicleApi } from "../../../../App/EVMAdmin/VehiclesManagement/Vehicles";

const { Title, Text } = Typography;
const { Option } = Select;

/** ---- Helpers: normalize API & extract error ---- */
const normalizeApi = (res) => ({
  success: res?.success ?? res?.isSuccess ?? false,
  data: res?.data ?? res?.result,
  message: res?.message ?? res?.error ?? "",
});
const extractErrorMessage = (err) => {
  // Axios error shape
  const status = err?.response?.status;
  const serverMsg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message;

  // Validation errors array/object
  const errorsObj = err?.response?.data?.errors;
  if (errorsObj && typeof errorsObj === "object") {
    try {
      const parts = [];
      Object.keys(errorsObj).forEach((k) => {
        const v = errorsObj[k];
        if (Array.isArray(v)) parts.push(...v);
        else if (typeof v === "string") parts.push(v);
      });
      if (parts.length) return parts.join("\n");
    } catch {}
  }

  if (err?.code === "ECONNABORTED") return "Yêu cầu bị timeout. Vui lòng thử lại.";
  if (status === 400) return serverMsg || "Yêu cầu không hợp lệ (400).";
  if (status === 401) return "Chưa được xác thực (401).";
  if (status === 403) return "Không có quyền thực hiện (403).";
  if (status === 404) return "Không tìm thấy tài nguyên (404).";
  if (status === 500) return serverMsg || "Lỗi máy chủ (500).";
  return serverMsg || "Đã xảy ra lỗi không xác định.";
};

function CreateElectricVehicle() {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [models, setModels] = useState([]);
  const [versions, setVersions] = useState([]);
  const [colors, setColors] = useState([]);
  const [filteredVersions, setFilteredVersions] = useState([]);

  const [form] = Form.useForm();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Upload state
  const [uploadedImages, setUploadedImages] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [v, m, ver, c] = await Promise.all([
        vehicleApi.getAllVehicles(),
        vehicleApi.getAllModels(),
        vehicleApi.getAllVersions(),
        vehicleApi.getAllColors(),
      ]);
      const nv = normalizeApi(v);
      const nm = normalizeApi(m);
      const nver = normalizeApi(ver);
      const nc = normalizeApi(c);

      if (!nv.success) message.warning(nv.message || "Không thể tải xe.");
      if (!nm.success) message.warning(nm.message || "Không thể tải model.");
      if (!nver.success) message.warning(nver.message || "Không thể tải version.");
      if (!nc.success) message.warning(nc.message || "Không thể tải màu.");

      setVehicles(nv.data || []);
      setModels(nm.data || []);
      setVersions(nver.data || []);
      setColors(nc.data || []);
    } catch (err) {
      message.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xác nhận xóa xe",
      content: "Bạn có chắc chắn muốn xóa xe này?",
      okButtonProps: { danger: true },
      onOk: async () => {
        setLoading(true);
        try {
          const res = await vehicleApi.deleteVehicle(id);
          const n = normalizeApi(res);
          if (n.success) {
            message.success(n.message || "Đã xóa xe thành công");
            await loadAll();
          } else {
            message.error(n.message || "Xóa xe thất bại");
          }
        } catch (err) {
          message.error(extractErrorMessage(err));
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: "STT",
      width: 80,
      fixed: "left",
      align: "center",
      render: (_, __, i) => i + 1,
    },
    {
      title: "Model",
      dataIndex: ["version", "modelName"],
      width: 220,
      render: (text) => <Text ellipsis={{ tooltip: text }}>{text || "N/A"}</Text>,
    },
    {
      title: "Version",
      dataIndex: ["version", "versionName"],
      width: 220,
      render: (v) => (
        <Tag color="blue" style={{ maxWidth: 200 }} ellipsis={{ tooltip: v }}>
          {v || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      width: 220,
      render: (c) => (
        <Space>
          <span
            style={{
              width: 18,
              height: 18,
              background: c?.colorCode || "#eee",
              borderRadius: "50%",
              border: "1px solid #d9d9d9",
              display: "inline-block",
            }}
          />
          <span>{c?.colorName || "N/A"}</span>
        </Space>
      ),
    },
    {
      title: "Giá (VND)",
      dataIndex: "price",
      width: 160,
      render: (p) =>
        typeof p === "number" ? (
          <Text strong>{p.toLocaleString("vi-VN")} ₫</Text>
        ) : (
          <Text type="secondary">N/A</Text>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 160,
      render: (s) => (
        <Tag color={s === 1 ? "success" : "error"}>
          {s === 1 ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      width: 180,
      fixed: "right",
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedVehicle(r);
              setIsViewModalVisible(true);
            }}
          >
            Xem
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(r.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleCreateModal = () => {
    form.resetFields();
    setUploadedImages([]);
    setCurrentStep(0);
    setIsCreateModalVisible(true);
  };

  const customUpload = ({ onSuccess }) => setTimeout(() => onSuccess("ok"), 100);

  const handleImageChange = ({ fileList }) => {
    let list = [...fileList];
    if (list.length > 8) {
      message.warning("Chỉ được upload tối đa 8 hình ảnh!");
      list = list.slice(0, 8);
    }
    setUploadedImages(list);
  };

  const handlePreview = async (file) => {
    setPreviewImage(file.thumbUrl || file.url);
    setPreviewVisible(true);
  };

  const steps = [{ title: "Thông tin xe & hình ảnh" }, { title: "Xác nhận thông tin" }];

  const next = () => {
    form
      .validateFields()
      .then(() => setCurrentStep((s) => s + 1))
      .catch(() => message.warning("Vui lòng nhập đủ thông tin"));
  };

  const prev = () => setCurrentStep((s) => s - 1);

  const handleSubmit = async () => {
    if (loading) return; // tránh double submit
    setLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      // 1) Upload ảnh
      message.loading({ content: "Đang upload ảnh lên S3...", key: "uploading", duration: 0 });
      let attachmentKeys = [];
      try {
        const uploadPromises = uploadedImages.map((f) =>
          vehicleApi.uploadImageAndGetKey(f.originFileObj)
        );
        attachmentKeys = (await Promise.all(uploadPromises)).filter(Boolean);
        message.success({
          content: `Upload thành công ${attachmentKeys.length} ảnh!`,
          key: "uploading",
          duration: 1.2,
        });
      } catch (err) {
        message.destroy("uploading");
        throw err; // đẩy lên catch ngoài
      }

      // 2) Tạo template vehicle
      const payload = {
        versionId: values.versionId,
        colorId: values.colorId,
        price: Number(values.costPrice),
        description: values.description || "New EV Template from FE",
        attachmentKeys,
      };

      console.log("📤 FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

      message.loading({ content: "Đang tạo xe mẫu...", key: "creatingVehicle", duration: 0 });
      const res = await vehicleApi.createVehicle(payload);
      message.destroy("creatingVehicle");

      const n = normalizeApi(res);
      if (n.success) {
        message.success(n.message || "🎉 Tạo xe mẫu thành công!");
        setIsCreateModalVisible(false);
        setCurrentStep(0);
        await loadAll();
      } else {
        message.error(n.message || "Không thể tạo xe");
      }
    } catch (err) {
      message.destroy("uploading");
      message.destroy("creatingVehicle");
      message.error(extractErrorMessage(err));
      console.error("CREATE VEHICLE ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      className="!p-0"
      childrenContentStyle={{ padding: 0, margin: 0 }}
      header={{
        title: "Tạo & Quản lý Xe Điện",
        subTitle: "Quản lý xe điện, model, version và màu sắc",
        breadcrumb: undefined,
        extra: [
          <Button key="reload" icon={<ReloadOutlined />} onClick={loadAll} loading={loading}>
            Tải lại
          </Button>,
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={handleCreateModal}>
            Tạo Xe Điện
          </Button>,
        ],
      }}
    >
      <div className="w-full px-4 md:px-6 lg:px-8 pb-6">
        <Card className="!px-0 shadow-sm">
          <div className="px-4 md:px-6 pt-4">
            <Title level={4} className="!mb-2">
              <CarOutlined style={{ color: "#1890ff", marginRight: 8 }} />
              Danh sách Xe Điện
            </Title>
            <Divider className="!mt-3" />
          </div>

          <div className="px-2 md:px-4">
            <Table
              size="middle"
              columns={columns}
              dataSource={vehicles}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10, showTotal: (t) => `${t} xe` }}
              scroll={{ x: "max-content" }}
              sticky
            />
          </div>
        </Card>
      </div>

      {/* Modal tạo xe */}
      <Modal
        open={isCreateModalVisible}
        title="Tạo xe điện mới"
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={980}
        destroyOnClose
      >
        <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} />
        <Form form={form} layout="vertical" onFinish={handleSubmit} preserve>
          {currentStep === 0 && (
            <>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Model"
                    name="modelId"
                    rules={[{ required: true, message: "Chọn model" }]}
                  >
                    <Select
                      placeholder="Chọn model"
                      onChange={(id) => {
                        const list = versions.filter((v) => v.modelId === id);
                        setFilteredVersions(list);
                        form.setFieldValue("versionId", null);
                      }}
                      showSearch
                      optionFilterProp="children"
                    >
                      {models.map((m) => (
                        <Option key={m.id} value={m.id}>
                          {m.modelName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Version"
                    name="versionId"
                    rules={[{ required: true, message: "Chọn version" }]}
                  >
                    <Select placeholder="Chọn version" showSearch optionFilterProp="children">
                      {filteredVersions.map((v) => (
                        <Option key={v.id} value={v.id}>
                          {v.versionName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Màu sắc"
                    name="colorId"
                    rules={[{ required: true, message: "Chọn màu sắc" }]}
                  >
                    <Select placeholder="Chọn màu" showSearch optionFilterProp="children">
                      {colors.map((c) => (
                        <Option key={c.id} value={c.id}>
                          <Space>
                            <span
                              style={{
                                width: 16,
                                height: 16,
                                background: c.colorCode,
                                borderRadius: "50%",
                                border: "1px solid #d9d9d9",
                                display: "inline-block",
                              }}
                            />
                            {c.colorName}
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Giá (VND)"
                    name="costPrice"
                    rules={[{ required: true, message: "Nhập giá xe" }]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item label="Mô tả" name="description">
                    <textarea
                      rows={3}
                      className="w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mô tả về xe / template..."
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={
                  <div className="flex items-center justify-between">
                    <span>Hình ảnh xe (tối đa 8)</span>
                    <span className="text-gray-500 text-sm">
                      Đã chọn: <b>{uploadedImages.length}</b>/8
                    </span>
                  </div>
                }
              >
                <Upload
                  listType="picture-card"
                  fileList={uploadedImages}
                  onChange={handleImageChange}
                  onPreview={handlePreview}
                  customRequest={customUpload}
                  accept="image/*"
                >
                  {uploadedImages.length >= 8 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
                <div className="text-xs text-gray-500">Mỗi ảnh &lt; 5MB. Tối đa 8 ảnh.</div>
              </Form.Item>
            </>
          )}

          {currentStep === 1 && (
            <Card>
              <Alert
                type="info"
                showIcon
                message="Xác nhận thông tin trước khi tạo xe"
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                <Col span={12}>
                  <p>
                    <strong>Model:</strong>{" "}
                    {models.find((m) => m.id === form.getFieldValue("modelId"))?.modelName || "—"}
                  </p>
                  <p>
                    <strong>Version:</strong>{" "}
                    {versions.find((v) => v.id === form.getFieldValue("versionId"))?.versionName}
                  </p>
                  <p>
                    <strong>Màu sắc:</strong>{" "}
                    {colors.find((c) => c.id === form.getFieldValue("colorId"))?.colorName || "—"}
                  </p>
                  <p>
                    <strong>Giá:</strong>{" "}
                    {(form.getFieldValue("costPrice") || 0).toLocaleString("vi-VN")} ₫
                  </p>
                  <p>
                    <strong>Mô tả:</strong>{" "}
                    {form.getFieldValue("description") || <span className="text-gray-400">—</span>}
                  </p>
                </Col>
                <Col span={12}>
                  {uploadedImages.length > 0 && (
                    <>
                      <strong>Ảnh đã chọn:</strong>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                          marginTop: 8,
                        }}
                      >
                        {uploadedImages.map((f, i) => (
                          <div
                            key={i}
                            style={{ position: "relative", cursor: "pointer" }}
                            onClick={() => {
                              setPreviewImage(f.thumbUrl || f.url);
                              setPreviewVisible(true);
                            }}
                          >
                            <img
                              src={f.thumbUrl || f.url}
                              alt={`img-${i}`}
                              style={{
                                width: 90,
                                height: 90,
                                borderRadius: 8,
                                objectFit: "cover",
                                border: "1px solid #d9d9d9",
                              }}
                            />
                            <ZoomInOutlined
                              style={{
                                position: "absolute",
                                bottom: 6,
                                right: 6,
                                color: "#fff",
                                fontSize: 14,
                                textShadow: "0 0 4px rgba(0,0,0,0.5)",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </Col>
              </Row>
            </Card>
          )}

          <Divider />
          <div className="text-right">
            <Space>
              {currentStep > 0 && (
                <Button onClick={prev} disabled={loading}>
                  Quay lại
                </Button>
              )}
              {currentStep < 1 && (
                <Button type="primary" onClick={next} disabled={loading}>
                  Tiếp theo
                </Button>
              )}
              {currentStep === 1 && (
                <Button type="primary" htmlType="submit" loading={loading}>
                  Tạo Xe
                </Button>
              )}
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal xem ảnh lớn */}
      <Modal open={previewVisible} footer={null} onCancel={() => setPreviewVisible(false)} width={800}>
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>

      {/* Modal xem chi tiết xe */}
      <Modal
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        title="Chi tiết xe điện"
        footer={null}
        width={920}
      >
        {selectedVehicle && (
          <Card>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p>
                  <strong>Model:</strong> {selectedVehicle.version?.modelName}
                </p>
                <p>
                  <strong>Version:</strong> {selectedVehicle.version?.versionName}
                </p>
                <p>
                  <strong>Màu sắc:</strong> {selectedVehicle.color?.colorName}
                </p>
                <p>
                  <strong>Giá:</strong>{" "}
                  {typeof selectedVehicle.price === "number"
                    ? `${selectedVehicle.price.toLocaleString("vi-VN")} ₫`
                    : "—"}
                </p>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  <Tag color={selectedVehicle.status === 1 ? "success" : "error"}>
                    {selectedVehicle.status === 1 ? "Hoạt động" : "Không hoạt động"}
                  </Tag>
                </p>
                <p>
                  <strong>Mô tả:</strong> {selectedVehicle.description || "—"}
                </p>
              </Col>

              <Col span={12}>
                {selectedVehicle.imgUrl?.length > 0 ? (
                  <>
                    <strong>Hình ảnh xe ({selectedVehicle.imgUrl.length}):</strong>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                        gap: 10,
                        marginTop: 10,
                      }}
                    >
                      <Image.PreviewGroup
                        items={selectedVehicle.imgUrl.map((url) => ({ src: url, alt: "Xe điện" }))}
                      >
                        {selectedVehicle.imgUrl.map((url, i) => (
                          <Image
                            key={i}
                            src={url}
                            alt={`Xe ${i + 1}`}
                            style={{
                              width: "100%",
                              height: 110,
                              objectFit: "cover",
                              borderRadius: 10,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                              cursor: "pointer",
                            }}
                          />
                        ))}
                      </Image.PreviewGroup>
                    </div>
                  </>
                ) : (
                  <Tag color="default">Không có ảnh</Tag>
                )}
              </Col>
            </Row>
          </Card>
        )}
      </Modal>
    </PageContainer>
  );
}

export default CreateElectricVehicle;
