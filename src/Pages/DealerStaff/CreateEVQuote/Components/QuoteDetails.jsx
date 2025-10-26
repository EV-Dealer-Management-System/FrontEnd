import React from "react";
import { ProCard } from "@ant-design/pro-components";
import {
  Input,
  Typography,
  Alert,
  Row,
  Col,
  Statistic,
  Space,
  Divider,
} from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CarOutlined,
  GiftOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { TextArea } = Input;

function QuoteDetails({
  quantity,
  note,
  onNoteChange,
  maxQuantity,
  selectedVehicle,
  selectedPromotion,
}) {
  return (
    <ProCard
      title={
        <Space>
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
          <Text strong>Chi tiết báo giá</Text>
        </Space>
      }
      bordered
      headerBordered
    >
      {selectedVehicle ? (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Thông tin xe */}
          <div>
            <div style={{ marginBottom: 12 }}>
              <Space>
                <CarOutlined style={{ color: "#1890ff", fontSize: 16 }} />
                <Text strong style={{ fontSize: 15 }}>
                  Thông tin xe
                </Text>
              </Space>
            </div>
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Space direction="vertical" size={2}>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Model
                  </Text>
                  <Text strong style={{ fontSize: 14 }}>
                    {selectedVehicle.modelName}
                  </Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size={2}>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Phiên bản
                  </Text>
                  <Text strong style={{ fontSize: 14 }}>
                    {selectedVehicle.versionName}
                  </Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size={2}>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Màu sắc
                  </Text>
                  <Text strong style={{ fontSize: 14 }}>
                    {selectedVehicle.colorName}
                  </Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size={2}>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Số lượng
                  </Text>
                  <Text strong style={{ fontSize: 16, color: "#52c41a" }}>
                    {quantity || 0} xe
                  </Text>
                </Space>
              </Col>
            </Row>
          </div>

          {/* Số lượng đặt hàng */}
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f0f5ff",
              borderRadius: 8,
              border: "1px solid #91d5ff",
            }}
          >
            <Row gutter={24} align="middle">
              <Col span={12}>
                <Statistic
                  title={
                    <Text strong style={{ fontSize: 14 }}>
                      Số lượng đặt hàng
                    </Text>
                  }
                  value={quantity || 0}
                  suffix="xe"
                  valueStyle={{ color: "#1890ff", fontSize: 24 }}
                />
              </Col>
              <Col span={12}>
                <div style={{ textAlign: "center" }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Tối đa có sẵn: {maxQuantity} xe
                  </Text>
                </div>
              </Col>
            </Row>
          </div>

          <Divider style={{ margin: 0 }} />

          {/* Khuyến mãi */}
          {selectedPromotion && (
            <>
              <div>
                <div style={{ marginBottom: 12 }}>
                  <Space>
                    <GiftOutlined style={{ color: "#fa8c16", fontSize: 16 }} />
                    <Text strong style={{ fontSize: 15 }}>
                      Khuyến mãi áp dụng
                    </Text>
                  </Space>
                </div>
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#fff7e6",
                    border: "1px solid #ffd591",
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 14, color: "#d46b08" }}>
                    🎁 {selectedPromotion.name}
                  </Text>
                </div>
              </div>
              <Divider style={{ margin: 0 }} />
            </>
          )}

          {/* Ghi chú */}
          <div>
            <div style={{ marginBottom: 12 }}>
              <Space>
                <FileTextOutlined style={{ color: "#722ed1", fontSize: 16 }} />
                <Text strong style={{ fontSize: 15 }}>
                  Ghi chú
                </Text>
              </Space>
            </div>
            <TextArea
              placeholder="Nhập ghi chú cho báo giá (tùy chọn)&#10;VD: Yêu cầu giao hàng, thông tin liên hệ..."
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={4}
              showCount
              maxLength={300}
              style={{ resize: "none" }}
            />
          </div>
        </Space>
      ) : (
        <Alert
          message="Chưa có thông tin"
          description="Vui lòng chọn xe điện, màu sắc và số lượng ở bước trước để xem chi tiết báo giá."
          type="info"
          showIcon
        />
      )}
    </ProCard>
  );
}

export default QuoteDetails;
