import React from 'react';
import { Spin } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';

function LoadingSpinner() {
    return (
        <div className="flex flex-col justify-center items-center h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
            <div className="mb-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <ThunderboltOutlined className="text-white text-2xl" />
            </div>
            <Spin
                size="large"
                indicator={
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                }
            />
            <p className="mt-4 text-gray-600 font-medium">
                Đang tải danh sách khuyến mãi...
            </p>
        </div>
    );
}

export default LoadingSpinner;