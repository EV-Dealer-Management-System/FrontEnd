import React from "react";
import { Alert, Space, Typography } from "antd";
import { InfoCircleOutlined, WarningOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

function AvailableQuantityAlert({ availableQuantity }) {
    // Không hiển thị gì nếu chưa có dữ liệu
    if (availableQuantity === null || availableQuantity === undefined) {
        return null;
    }

    // Xác định loại thông báo và nội dung
    const isAvailable = availableQuantity > 0;
    const alertType = isAvailable ? "info" : "error"; // Đổi từ "warning" sang "error" để có màu đỏ

    // Icon và màu sắc tùy theo trạng thái
    const icon = isAvailable ? (
        <CheckCircleOutlined style={{ color: "#52c41a" }} />
    ) : (
        <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
    );

    const message = isAvailable
        ? ` Còn ${availableQuantity} xe trong kho hãng`
        : "Xe hiện đã hết";

    return (
        <Alert
            message={
                <Space size={4}>
                    {icon}
                    <Text strong style={{ fontSize: 15 }}>
                        {message}
                    </Text>
                </Space>
            }
            type={alertType}
            showIcon={false}
            style={{
                marginBottom: 0,
                padding: "4px 12px",
                borderRadius: 4,
            }}
        />
    );
}

export default AvailableQuantityAlert;
