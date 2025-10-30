import React from 'react';
import { Row, Col, Card } from 'antd';
import {
    CarOutlined,
    CalendarOutlined,
    ShopOutlined,
    BarChartOutlined,
    FileTextOutlined,
    SettingOutlined
} from '@ant-design/icons';

function QuickActions() {

    const actions = [
        {
            title: 'Quản lý kho xe',
            description: 'Xem chi tiết kho xe và phân bổ',
            icon: <CarOutlined className="text-3xl text-blue-500" />,
            color: 'blue',
            href: '/admin/inventory',
            gradient: 'from-blue-50 to-blue-100'
        },
        {
            title: 'Quản lý booking',
            description: 'Xem và xử lý đơn đặt xe',
            icon: <CalendarOutlined className="text-3xl text-green-500" />,
            color: 'green',
            href: '/admin/bookings',
            gradient: 'from-green-50 to-green-100'
        },
        {
            title: 'Quản lý đại lý',
            description: 'Thông tin đại lý và hợp đồng',
            icon: <ShopOutlined className="text-3xl text-purple-500" />,
            color: 'purple',
            href: '/admin/dealers',
            gradient: 'from-purple-50 to-purple-100'
        },
        {
            title: 'Báo cáo thống kê',
            description: 'Xem báo cáo chi tiết',
            icon: <BarChartOutlined className="text-3xl text-orange-500" />,
            color: 'orange',
            href: '/admin/reports',
            gradient: 'from-orange-50 to-orange-100'
        },
        {
            title: 'Quản lý hợp đồng',
            description: 'Xem và ký hợp đồng',
            icon: <FileTextOutlined className="text-3xl text-cyan-500" />,
            color: 'cyan',
            href: '/admin/contracts',
            gradient: 'from-cyan-50 to-cyan-100'
        },
        {
            title: 'Cài đặt hệ thống',
            description: 'Cấu hình và thiết lập',
            icon: <SettingOutlined className="text-3xl text-gray-500" />,
            color: 'gray',
            href: '/admin/settings',
            gradient: 'from-gray-50 to-gray-100'
        }
    ];

    const handleActionClick = (href) => {
        // Kiểm tra nếu là đường dẫn hợp lệ thì chuyển hướng
        if (href && href.startsWith('/admin/')) {
            // Có thể thêm logic điều hướng ở đây
            console.log(`Chuyển đến: ${href}`);
            // window.location.href = href; // Tạm comment để tránh lỗi
        }
    };

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <SettingOutlined className="mr-2" />
                Thao tác nhanh
            </h3>

            <Row gutter={[16, 16]}>
                {actions.map((action, index) => (
                    <Col xs={24} sm={12} lg={8} key={index}>
                        <Card
                            className={`
                cursor-pointer transform transition-all duration-200 
                hover:scale-105 hover:shadow-lg border-0
                bg-gradient-to-br ${action.gradient}
                h-32 flex flex-col justify-center
              `}
                            onClick={() => handleActionClick(action.href)}
                            hoverable
                            bodyStyle={{
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                height: '100%'
                            }}
                        >
                            <div className="mb-2">
                                {action.icon}
                            </div>
                            <div className="font-medium text-gray-800 text-base mb-1">
                                {action.title}
                            </div>
                            <div className="text-gray-600 text-sm">
                                {action.description}
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default QuickActions;