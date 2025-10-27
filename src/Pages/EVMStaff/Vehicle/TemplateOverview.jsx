import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Image,
  Typography,
  Badge,
  Tag,
  Space,
  Spin,
  message,
  Empty,
  Button,
  Divider,
} from "antd";
import {
  ReloadOutlined,
  CarOutlined,
  DollarOutlined,
  BgColorsOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { vehicleApi } from "../../../App/EVMAdmin/VehiclesManagement/Vehicles";
import EVMStaffLayout from "../../../Components/EVMStaff/EVMStaffLayout";

const { Title, Text, Paragraph } = Typography;

function TemplateOverview() {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    loadAllTemplates();
  }, []);

  const loadAllTemplates = async () => {
    try {
      setLoading(true);
      const result = await vehicleApi.getAllTemplateVehicles();

      console.log("📥 Template API Response:", result);

      if (result.success) {
        const templatesData = result.data || [];
        console.log("✅ Loaded templates:", templatesData);
        setTemplates(templatesData);

        if (templatesData.length === 0) {
          message.info("Chưa có template nào.");
        }
      } else {
        message.error(result.error || "Không thể tải danh sách templates!");
        setTemplates([]);
      }
    } catch (error) {
      console.error("❌ Error loading templates:", error);
      message.error("Lỗi khi tải danh sách templates!");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy status text và color
  const getStatusConfig = (status) => {
    const statusMap = {
      1: { text: "Có sẵn", color: "success" },
      2: { text: "Hết hàng", color: "error" },
      3: { text: "Ngừng sản xuất", color: "default" },
    };
    return statusMap[status] || { text: "Không xác định", color: "default" };
  };

  return (
    <EVMStaffLayout>
      <div className="w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={3} className="m-0">
              <CarOutlined className="mr-2 text-blue-500" />
              🚗 Tổng quan Template Xe Điện
            </Title>
            <Text type="secondary">
              Danh sách tất cả các template xe điện có sẵn
            </Text>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadAllTemplates}
            loading={loading}
            size="large"
          >
            Tải lại
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Spin size="large" tip="Đang tải danh sách templates..." />
          </div>
        )}

        {/* Empty State */}
        {!loading && templates.length === 0 && (
          <Card className="text-center py-20">
            <Empty description="Chưa có template nào" />
          </Card>
        )}

        {/* Template Grid */}
        {!loading && templates.length > 0 && (
          <>
            <div className="mb-4">
              <Text strong className="text-lg">
                Tổng số: {templates.length} templates
              </Text>
            </div>

            <Row gutter={[24, 24]}>
              {templates.map((template) => {
                // Lấy thông tin từ template
                const version = template.version || {};
                const color = template.color || {};
                const model = version.model || {};
                
                // Debug: Log để kiểm tra structure
                console.log("Template data:", template);
                console.log("Color data:", color);
                console.log("Color hex:", color.hexCode, color.colorCode);

                const statusConfig = getStatusConfig(template.status);

                // Lấy hình ảnh đầu tiên từ imgUrl array
                const firstImage =
                  Array.isArray(template.imgUrl) && template.imgUrl.length > 0
                    ? template.imgUrl[0]
                    : "https://via.placeholder.com/400x300?text=No+Image";

                return (
                  <Col xs={24} sm={12} lg={8} xl={6} key={template.id}>
                    <Card
                      hoverable
                      className="h-full shadow-md hover:shadow-xl transition-shadow"
                      cover={
                        <div className="relative">
                          <Image
                            src={firstImage}
                            alt={template.name || "Template"}
                            height={200}
                            className="object-cover w-full"
                            preview={{
                              mask: "Xem ảnh",
                            }}
                            fallback="https://via.placeholder.com/400x300?text=Error"
                          />
                          {/* Badge trạng thái trên ảnh */}
                          <div className="absolute top-2 right-2">
                            <Badge
                              status={statusConfig.color}
                              text={
                                <Text
                                  strong
                                  className="bg-white px-2 py-1 rounded shadow"
                                >
                                  {statusConfig.text}
                                </Text>
                              }
                            />
                          </div>
                        </div>
                      }
                    >
                      {/* Model / Version */}
                      <div className="mb-3">
                        <Text strong className="text-lg block mb-1">
                          {version.versionName || template.versionName || "N/A"}
                        </Text>
                        <Text type="secondary" className="text-sm">
                          {model.modelName || template.modelName || "N/A"}
                        </Text>
                      </div>

                      <Divider className="my-3" />

                      {/* Giá bán */}
                      <div className="mb-3">
                        <Space>
                          <DollarOutlined className="text-green-600" />
                          <Text strong className="text-green-600 text-lg">
                            {template.price
                              ? template.price.toLocaleString("vi-VN") + " ₫"
                              : "Liên hệ"}
                          </Text>
                        </Space>
                      </div>

                      {/* Màu sắc */}
                      <div className="mb-3">
                        <Space align="center">
                          <BgColorsOutlined className="text-blue-500" />
                          <Text strong>Màu:</Text>
                          <Space size={4}>
                            <div
                              className="inline-block w-5 h-5 rounded-full border-2 border-gray-300"
                              style={{
                                backgroundColor:
                                  color.hexCode || color.colorCode || "#ccc",
                              }}
                              title={color.colorName || "N/A"}
                            />
                            <Text>{color.colorName || "N/A"}</Text>
                          </Space>
                        </Space>
                      </div>

                      {/* Mô tả */}
                      {template.description && (
                        <div className="mb-2">
                          <Space align="start">
                            <InfoCircleOutlined className="text-gray-500 mt-1" />
                            <div>
                              <Text strong className="block mb-1">
                                Mô tả:
                              </Text>
                              <Paragraph
                                ellipsis={{ rows: 2, expandable: true }}
                                className="text-sm text-gray-600 mb-0"
                              >
                                {template.description}
                              </Paragraph>
                            </div>
                          </Space>
                        </div>
                      )}

                      {/* Template ID */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Text type="secondary" className="text-xs block">
                          ID: <Text code className="text-xs">{template.id}</Text>
                        </Text>
                      </div>

                      {/* Số lượng ảnh */}
                      {Array.isArray(template.imgUrl) &&
                        template.imgUrl.length > 1 && (
                          <div className="mt-2">
                            <Tag color="blue">
                              {template.imgUrl.length} ảnh
                            </Tag>
                          </div>
                        )}
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </>
        )}
      </div>
    </EVMStaffLayout>
  );
}

export default TemplateOverview;
