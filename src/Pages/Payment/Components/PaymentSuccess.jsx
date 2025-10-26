import React from "react";
import { Card, Typography, Row, Col } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";

const { Title, Text } = Typography;

function PaymentSuccess({ paymentData }) {
  const formatAmount = (amount) => {
    if (!amount) return "0 VND";
    return `${parseInt(amount / 100).toLocaleString("vi-VN")} VND`;
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString.length !== 14) return dateString;
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(8, 10);
    const minute = dateString.substring(10, 12);
    const second = dateString.substring(12, 14);
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  const InfoRow = ({ label, value, valueStyle = {} }) => (
    <Row style={{ marginBottom: 20 }}>
      <Col span={12}>
        <Text style={{ color: "#666", fontSize: 14 }}>{label}</Text>
      </Col>
      <Col span={12} style={{ textAlign: "right" }}>
        <Text style={{ color: "#000", fontSize: 14, ...valueStyle }}>
          {value}
        </Text>
      </Col>
    </Row>
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Card
        style={{
          maxWidth: 560,
          width: "100%",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        bodyStyle={{ padding: "48px 40px" }}
      >
        {/* Icon và tiêu đề */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <CheckCircleFilled
            style={{ fontSize: 72, color: "#52c41a", marginBottom: 16 }}
          />
          <Title
            level={3}
            style={{
              color: "#52c41a",
              marginBottom: 0,
              fontWeight: 500,
              fontSize: 22,
            }}
          >
            Giao Dịch Thanh Toán Thành Công
          </Title>
        </div>

        {/* Tiêu đề thông tin */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Text
            style={{
              color: "#999",
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.5px",
            }}
          >
            THÔNG TIN GIAO DỊCH
          </Text>
        </div>

        {/* Thông tin chi tiết */}
        <div style={{ marginBottom: 8 }}>
          <InfoRow label="Cổng thanh toán" value="VNPay" />
          <InfoRow
            label="Mã đơn hàng"
            value={paymentData.txnRef || paymentData.transactionNo || "N/A"}
          />
          <InfoRow
            label="Số tiền thanh toán"
            value={formatAmount(paymentData.amount)}
            valueStyle={{ fontWeight: 500 }}
          />
          {paymentData.payDate && (
            <InfoRow
              label="Thời gian giao dịch"
              value={formatDate(paymentData.payDate)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

export default PaymentSuccess;
