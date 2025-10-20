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
  Upload,
  Spin,
} from "antd";
import {
  PlusOutlined,
  CarOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { vehicleApi } from "../../../../App/EVMAdmin/VehiclesManagement/Vehicles";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../../Components/Admin/Components/NavigationBar";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function CreateTemplateVehicle() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [templateData, setTemplateData] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [uploadedAttachments, setUploadedAttachments] = useState([]);
  const navigate = useNavigate();

  // Upload configuration
  const uploadProps = {
    name: "files",
    multiple: true,
    fileList,
    beforeUpload: (file) => {
      // Kiểm tra định dạng file
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error(`${file.name} không phải là file hình ảnh!`);
        return Upload.LIST_IGNORE;
      }

      // Kiểm tra kích thước file (5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error(`${file.name} phải nhỏ hơn 5MB!`);
        return Upload.LIST_IGNORE;
      }

      return false; // Prevent auto upload
    },
    onChange: (info) => {
      setFileList(info.fileList);
    },
    onRemove: (file) => {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
    },
  };

  // Upload attachments function
  const uploadAttachments = async (files) => {
    if (!files || files.length === 0) return [];

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file.originFileObj || file);
    });

    try {
      const response = await vehicleApi.uploadAttachments(formData);
      if (response.success) {
        return response.data.attachmentKeys || [];
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Lỗi upload hình ảnh: " + error.message);
      return [];
    }
  };

  // Handle form submission
  const handleCreateTemplate = async (values) => {
    try {
      setLoading(true);

      console.log("=== CREATE TEMPLATE VEHICLE DEBUG ===");
      console.log("📝 Form values:", values);
      console.log("📎 File list:", fileList);

      // Upload attachments first
      let attachmentKeys = [];
      if (fileList.length > 0) {
        message.loading("Đang upload hình ảnh...", 0);
        attachmentKeys = await uploadAttachments(fileList);
        message.destroy();

        if (attachmentKeys.length === 0) {
          message.warning("Không có file nào được upload thành công!");
        } else {
          message.success(
            `Upload thành công ${attachmentKeys.length} hình ảnh!`
          );
        }
      }

      // Prepare template data theo API format
      const templatePayload = {
        versionId: values.versionId,
        colorId: values.colorId,
        price: Number(values.price),
        description: values.description,
        attachmentKeys: attachmentKeys,
        isActive: true,
      };

      console.log("📤 Template payload:", templatePayload);
      setTemplateData(templatePayload);
      setConfirmModalVisible(true);
    } catch (error) {
      console.error("❌ Error preparing template data:", error);
      message.error("Có lỗi xảy ra khi chuẩn bị dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  // Confirm and submit template
  const confirmCreateTemplate = async () => {
    try {
      setLoading(true);
      setConfirmModalVisible(false);

      console.log("🚀 Submitting template data:", templateData);

      const result = await vehicleApi.createTemplateVehicle(templateData);

      if (result.success) {
        message.success(result.message || "Tạo mẫu xe thành công!");

        // Reset form
        form.resetFields();
        setFileList([]);
        setUploadedAttachments([]);

        // Navigate back to vehicle management
        setTimeout(() => {
          navigate("/admin/vehicle-management");
        }, 1500);
      } else {
        message.error(result.message || "Có lỗi xảy ra khi tạo mẫu xe!");
      }
    } catch (error) {
      console.error("❌ Error creating template:", error);
      message.error("Có lỗi xảy ra khi tạo mẫu xe!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Navbar>
      <Spin spinning={loading} tip="Đang xử lý...">
        <PageContainer
          header={{
            title: "Tạo mẫu xe điện",
            subTitle: "Tạo template cho các dòng xe điện",
            breadcrumb: {
              items: [
                { title: "Trang chủ" },
                {
                  title: "Quản lý xe điện",
                  path: "/admin/vehicle-management",
                },
                { title: "Tạo mẫu xe" },
              ],
            },
            extra: [
              <Button
                key="back"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/admin/vehicle-management")}
              >
                Quay lại
              </Button>,
            ],
          }}
          content={
            <Alert
              message="Tạo mẫu xe điện"
              description="Tạo template chung cho dòng xe, sau đó có thể tạo nhiều xe cụ thể từ template này."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          }
        >
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateTemplate}
              size="large"
            >
              <Row gutter={24}>
                {/* Version ID */}
                <Col span={12}>
                  <Form.Item
                    label="Version ID"
                    name="versionId"
                    rules={[
                      { required: true, message: "Vui lòng nhập Version ID!" },
                      {
                        pattern:
                          /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i,
                        message: "Version ID phải là UUID hợp lệ!",
                      },
                    ]}
                    extra="Định dạng UUID (ví dụ: 3fa85f64-5717-4562-b3fc-2c963f66afa6)"
                  >
                    <Input
                      placeholder="Nhập Version ID (UUID)"
                      style={{ fontFamily: "monospace" }}
                    />
                  </Form.Item>
                </Col>

                {/* Color ID */}
                <Col span={12}>
                  <Form.Item
                    label="Color ID"
                    name="colorId"
                    rules={[
                      { required: true, message: "Vui lòng nhập Color ID!" },
                      {
                        pattern:
                          /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i,
                        message: "Color ID phải là UUID hợp lệ!",
                      },
                    ]}
                    extra="Định dạng UUID (ví dụ: 3fa85f64-5717-4562-b3fc-2c963f66afa6)"
                  >
                    <Input
                      placeholder="Nhập Color ID (UUID)"
                      style={{ fontFamily: "monospace" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Price */}
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="Giá (VNĐ)"
                    name="price"
                    rules={[
                      { required: true, message: "Vui lòng nhập giá!" },
                      {
                        type: "number",
                        min: 0,
                        message: "Giá phải lớn hơn 0!",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Nhập giá xe"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      min={0}
                      step={1000000}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Description */}
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    label="Mô tả"
                    name="description"
                    rules={[
                      { required: true, message: "Vui lòng nhập mô tả!" },
                      {
                        max: 1000,
                        message: "Mô tả không được quá 1000 ký tự!",
                      },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Nhập mô tả chi tiết về mẫu xe điện này..."
                      showCount
                      maxLength={1000}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Upload Images */}
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item label="Hình ảnh mẫu xe">
                    <Upload.Dragger {...uploadProps}>
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined
                          style={{ fontSize: 48, color: "#1890ff" }}
                        />
                      </p>
                      <p className="ant-upload-text">
                        Kéo thả hình ảnh vào đây hoặc click để chọn
                      </p>
                      <p className="ant-upload-hint">
                        Hỗ trợ upload nhiều file. Chỉ chấp nhận file hình ảnh
                        (.jpg, .png, .gif)
                        <br />
                        Kích thước file tối đa: 5MB
                      </p>
                    </Upload.Dragger>

                    {fileList.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <Text strong>Đã chọn {fileList.length} file:</Text>
                        <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                          {fileList.map((file) => (
                            <li key={file.uid} style={{ marginBottom: 4 }}>
                              <Text>{file.name}</Text>
                              <Text type="secondary" style={{ marginLeft: 8 }}>
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </Text>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              {/* Action Buttons */}
              <Row justify="end" gutter={16}>
                <Col>
                  <Button
                    size="large"
                    onClick={() => navigate("/admin/vehicle-management")}
                  >
                    Hủy bỏ
                  </Button>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    icon={<CarOutlined />}
                    loading={loading}
                  >
                    Tạo mẫu xe điện
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* Confirmation Modal */}
          <Modal
            title={
              <div style={{ textAlign: "center" }}>
                <CheckCircleOutlined
                  style={{ color: "#52c41a", fontSize: 24, marginRight: 8 }}
                />
                Xác nhận tạo mẫu xe điện
              </div>
            }
            open={confirmModalVisible}
            onOk={confirmCreateTemplate}
            onCancel={() => setConfirmModalVisible(false)}
            okText="Xác nhận tạo"
            cancelText="Hủy bỏ"
            okButtonProps={{
              loading: loading,
              size: "large",
              type: "primary",
            }}
            cancelButtonProps={{ size: "large" }}
            width={600}
          >
            <div style={{ padding: "20px 0" }}>
              <Alert
                message="Thông tin mẫu xe sẽ được tạo"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              {templateData && (
                <div>
                  <Row gutter={[16, 8]}>
                    <Col span={8}>
                      <Text strong>Version ID:</Text>
                    </Col>
                    <Col span={16}>
                      <Text code style={{ fontSize: 12 }}>
                        {templateData.versionId}
                      </Text>
                    </Col>

                    <Col span={8}>
                      <Text strong>Color ID:</Text>
                    </Col>
                    <Col span={16}>
                      <Text code style={{ fontSize: 12 }}>
                        {templateData.colorId}
                      </Text>
                    </Col>

                    <Col span={8}>
                      <Text strong>Giá:</Text>
                    </Col>
                    <Col span={16}>
                      <Text strong style={{ color: "#f5222d" }}>
                        {templateData.price?.toLocaleString()} VNĐ
                      </Text>
                    </Col>

                    <Col span={8}>
                      <Text strong>Mô tả:</Text>
                    </Col>
                    <Col span={16}>
                      <Text>{templateData.description}</Text>
                    </Col>

                    <Col span={8}>
                      <Text strong>Hình ảnh:</Text>
                    </Col>
                    <Col span={16}>
                      <Text>
                        {templateData.attachmentKeys?.length || 0} file đã
                        upload
                      </Text>
                    </Col>
                  </Row>
                </div>
              )}
            </div>
          </Modal>
        </PageContainer>
      </Spin>
    </Navbar>
  );
}

export default CreateTemplateVehicle;
