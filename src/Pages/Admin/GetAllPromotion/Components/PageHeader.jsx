import React from 'react';
import { Typography } from 'antd';
import {
    ThunderboltOutlined,
    FireOutlined
} from '@ant-design/icons';

const { Text } = Typography;

function PageHeader({ totalPromotions }) {
    return {
        title: (
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ThunderboltOutlined className="text-white text-xl" />
                </div>
                <div>
                    {/* <h1 className="text-2xl font-bold text-gray-800 m-0">
                        Dashboard Khuyến Mãi Xe Điện
                    </h1>
                    <p className="text-gray-600 m-0 mt-1">
                        Hệ thống quản lý chương trình khuyến mãi toàn diện
                    </p> */}
                </div>
            </div>
        ),
        subTitle: (
            <div className="flex items-center gap-2 mt-2">
                <span className="text-gray-500">
                    Quản lý tất cả chương trình khuyến mãi cho xe điện
                </span>
            </div>
        ),
        extra: (
            <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200 shadow-md">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                    <FireOutlined className="text-white text-sm" />
                </div>
                <div>
                    <Text strong className="text-gray-700 text-base">
                        Tổng cộng {totalPromotions} chương trình
                    </Text>
                    <div className="text-xs text-gray-500">
                        Đang hoạt động và theo dõi
                    </div>
                </div>
            </div>
        )
    };
}

export default PageHeader;