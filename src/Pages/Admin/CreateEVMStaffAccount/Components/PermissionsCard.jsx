import React from 'react';
import { Card, Space, Typography, Divider } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ShoppingOutlined,
    FileTextOutlined,
    AppstoreOutlined,
    BarChartOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

// Component hiển thị danh sách quyền hạn của EVM Staff
function PermissionsCard() {
    const permissions = [
        {
            icon: <AppstoreOutlined className="text-blue-500 text-lg" />,
            title: 'Quản lý sản phẩm',
            description: 'Thêm/sửa/xóa thông tin xe điện, phiên bản, màu sắc',
            allowed: true,
        },
        {
            icon: <FileTextOutlined className="text-green-500 text-lg" />,
            title: 'Quản lý hợp đồng',
            description: 'Tạo và quản lý hợp đồng phân phối với đại lý',
            allowed: true,
        },
        {
            icon: <ShoppingOutlined className="text-purple-500 text-lg" />,
            title: 'Phân bổ tồn kho',
            description: 'Phân bổ xe từ kho chung cho các đại lý',
            allowed: true,
        },
        {
            icon: <BarChartOutlined className="text-orange-500 text-lg" />,
            title: 'Báo cáo và phân tích',
            description: 'Xem báo cáo doanh số, tồn kho theo khu vực',
            allowed: true,
        },
    ];

    return (
        <Card
            className="shadow-md rounded-lg max-w-4xl mx-auto mt-6 border-0"
            bodyStyle={{ padding: '32px' }}
        >
            <div className="mb-6">
                <Text className="text-xl font-semibold text-gray-800">
                    Quyền hạn của EVM Staff
                </Text>
                <div className="text-sm text-gray-500 mt-1">
                    Danh sách các quyền và chức năng mà EVM Staff có thể thực hiện
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissions.map((permission, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm flex-shrink-0">
                            {permission.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Text strong className="text-base text-gray-800">
                                    {permission.title}
                                </Text>
                                {permission.allowed && (
                                    <CheckCircleOutlined className="text-green-500 text-sm" />
                                )}
                            </div>
                            <Text type="secondary" className="text-sm">
                                {permission.description}
                            </Text>
                        </div>
                    </div>
                ))}
            </div>

            <Divider className="my-6" />

            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg flex-shrink-0">
                    <CloseCircleOutlined className="text-red-500 text-lg" />
                </div>
                <div className="flex-1">
                    <Text strong className="text-base text-gray-800">
                        Không có quyền
                    </Text>
                    <div className="text-sm text-gray-600 mt-1">
                        Tạo tài khoản Admin, xóa dữ liệu hệ thống, thay đổi cấu hình quan trọng
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default PermissionsCard;
