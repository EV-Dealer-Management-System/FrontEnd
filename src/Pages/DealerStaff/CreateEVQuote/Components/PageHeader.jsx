import React from 'react';
import { Typography } from 'antd';
import {
    FileTextOutlined,
    CarOutlined
} from '@ant-design/icons';

const { Text } = Typography;

function PageHeader() {
    return {
        title: (
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileTextOutlined className="text-white text-xl" />
                </div>
               
            </div>
        ),
        subTitle: (
            <div className="flex items-center gap-2 mt-2">
                <span className="text-gray-500">
                    Điền thông tin chi tiết để tạo báo giá chính xác cho khách hàng
                </span>
            </div>
        ),
        extra: (
            <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200 shadow-md">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-green-500 rounded-lg flex items-center justify-center">
                    <CarOutlined className="text-white text-sm" />
                </div>
                <div>
                    <Text strong className="text-gray-700 text-base">
                        Báo giá xe điện
                    </Text>
                    <div className="text-xs text-gray-500">
                        Hệ thống quản lý đại lý
                    </div>
                </div>
            </div>
        )
    };
}

export default PageHeader;