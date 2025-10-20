import React from 'react';
import { Alert, Button } from 'antd';
import {
    ExclamationCircleOutlined,
    ReloadOutlined
} from '@ant-design/icons';

function ErrorDisplay({ error, onRetry }) {
    return (
        <div className="max-w-2xl mx-auto">
            <Alert
                message={
                    <div className="flex items-center gap-3">
                        <ExclamationCircleOutlined className="text-red-500 text-xl" />
                        <span className="font-semibold text-lg">Lỗi tải dữ liệu khuyến mãi</span>
                    </div>
                }
                description={
                    <div className="mt-3">
                        <p className="text-gray-700 mb-4">{error}</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={onRetry}
                                className="bg-blue-500 hover:bg-blue-600 border-0"
                            >
                                Thử lại
                            </Button>
                            <Button
                                onClick={() => window.location.reload()}
                                className="border-gray-300"
                            >
                                Tải lại trang
                            </Button>
                        </div>
                    </div>
                }
                type="error"
                showIcon={false}
                className="border-2 border-red-200 bg-red-50 rounded-xl shadow-lg"
            />
        </div>
    );
}

export default ErrorDisplay;