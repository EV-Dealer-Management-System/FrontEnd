import React from "react";
import { Card, Statistic, Row, Col, Empty, Divider } from "antd";
import {
  CarOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

/**
 * Component hiển thị tổng quan đơn đặt xe
 * @param {Array} bookingDetails - Danh sách chi tiết đặt xe
 */
function BookingSummary({ bookingDetails = [] }) {
  // Tính tổng số lượng xe
  const totalQuantity = bookingDetails.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  // Tính tổng số loại xe (model khác nhau)
  const uniqueModels = new Set(bookingDetails.map((item) => item.modelId));
  const totalModels = uniqueModels.size;

  // Tính tổng số items
  const totalItems = bookingDetails.length;

  if (totalItems === 0) {
    return (
      <Card
        bordered={false}
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
      >
        <Empty
          description="Chưa có xe nào được thêm"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card
      title={<strong>Tổng quan đơn hàng</strong>}
      bordered={false}
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
    >
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Statistic
            title="Tổng số lượng xe"
            value={totalQuantity}
            prefix={<CarOutlined style={{ color: "#52c41a" }} />}
            suffix="xe"
            valueStyle={{ color: "#52c41a", fontSize: 24 }}
          />
        </Col>
        <Col span={24}>
          <Divider style={{ margin: "8px 0" }} />
        </Col>
        <Col span={12}>
          <Statistic
            title="Số mẫu"
            value={totalModels}
            prefix={<AppstoreOutlined style={{ color: "#1890ff" }} />}
            valueStyle={{ color: "#1890ff", fontSize: 20 }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Số dòng"
            value={totalItems}
            prefix={<ShoppingCartOutlined style={{ color: "#fa8c16" }} />}
            valueStyle={{ color: "#fa8c16", fontSize: 20 }}
          />
        </Col>
      </Row>
    </Card>
  );
}

export default BookingSummary;
