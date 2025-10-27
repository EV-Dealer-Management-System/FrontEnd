import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import PaymentSuccess from "./Components/PaymentSuccess";
import PaymentFailure from "./Components/PaymentFailure";

const PaymentResponse = () => {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentData, setPaymentData] = useState({});

  useEffect(() => {
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
    const vnp_TransactionStatus = searchParams.get("vnp_TransactionStatus");
    const vnp_Amount = searchParams.get("vnp_Amount");
    const vnp_TransactionNo = searchParams.get("vnp_TransactionNo");
    const vnp_BankCode = searchParams.get("vnp_BankCode");
    const vnp_PayDate = searchParams.get("vnp_PayDate");
    const vnp_OrderInfo = searchParams.get("vnp_OrderInfo");
    const vnp_TxnRef = searchParams.get("vnp_TxnRef");

    setPaymentData({
      amount: vnp_Amount,
      transactionNo: vnp_TransactionNo,
      bankCode: vnp_BankCode,
      payDate: vnp_PayDate,
      orderInfo: vnp_OrderInfo,
      responseCode: vnp_ResponseCode,
      txnRef: vnp_TxnRef,
    });

    // Kiểm tra mã phản hồi (00 = thành công)
    if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
      setPaymentStatus("success");
    } else {
      setPaymentStatus("error");
    }
  }, [searchParams]);

  if (paymentStatus === null) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Card
          style={{
            width: 500,
            textAlign: "center",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            size="large"
          />
          <p style={{ marginTop: 24, fontSize: 16, color: "#666" }}>
            Đang xử lý thanh toán...
          </p>
        </Card>
      </div>
    );
  }

  // Render component thành công hoặc thất bại
  if (paymentStatus === "success") {
    return <PaymentSuccess paymentData={paymentData} />;
  } else {
    return <PaymentFailure paymentData={paymentData} />;
  }
};

export default PaymentResponse;
