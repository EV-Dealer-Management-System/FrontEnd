import React from 'react';
import { Card, Result, Button } from 'antd';
import {
    ExclamationCircleOutlined,
    ReloadOutlined
} from '@ant-design/icons';

function ErrorDisplay({
    error = "Có lỗi xảy ra",
    onRetry,
    className = ""
}) {
    return (
        <Card className={`shadow-sm border border-gray-200 rounded-lg ${className}`}>
            <Result
                status="error"
                icon={<ExclamationCircleOutlined className="text-red-500" />}
                title="Lỗi tải dữ liệu"
                subTitle={error}
                extra={
                    onRetry && (
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={onRetry}
                            className="bg-blue-500 hover:bg-blue-600"
                        >
                            Thử lại
                        </Button>
                    )
                }
            />
        </Card>
    );
}

export default ErrorDisplay;