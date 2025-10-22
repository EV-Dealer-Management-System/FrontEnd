import React from "react";
import { Result, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

function ErrorDisplay({ error, onRetry }) {
    return (
        <Result
            status="error"
            title="Không thể tải dữ liệu"
            subTitle={
                error || "Đã xảy ra lỗi khi tải danh sách báo giá. Vui lòng thử lại."
            }
            extra={
                <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={onRetry}
                    size="large"
                >
                    Thử lại
                </Button>
            }
        />
    );
}

export default ErrorDisplay;