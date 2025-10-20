import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import {
    GiftOutlined,
    FireOutlined,
    CalendarOutlined
} from '@ant-design/icons';

function StatisticsCards({ statistics }) {
    const statisticsConfig = [
        {
            title: 'Tổng khuyến mãi',
            value: statistics.total,
            icon: <GiftOutlined className="text-blue-600" />,
            gradient: 'from-blue-50 to-blue-100',
            textColor: 'text-blue-700',
            valueColor: '#1890ff'
        },
        {
            title: 'Đang hoạt động',
            value: statistics.active,
            icon: <FireOutlined className="text-green-600" />,
            gradient: 'from-green-50 to-green-100',
            textColor: 'text-green-700',
            valueColor: '#52c41a'
        },
        {
            title: 'Sắp diễn ra',
            value: statistics.upcoming,
            icon: <CalendarOutlined className="text-orange-600" />,
            gradient: 'from-orange-50 to-orange-100',
            textColor: 'text-orange-700',
            valueColor: '#fa8c16'
        },
        {
            title: 'Đã hết hạn',
            value: statistics.expired,
            icon: <CalendarOutlined className="text-red-600" />,
            gradient: 'from-red-50 to-red-100',
            textColor: 'text-red-700',
            valueColor: '#ff4d4f'
        }
    ];

    return (
        <Row gutter={[16, 16]} className="mb-6">
            {statisticsConfig.map((stat, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                    <Card className={`border-0 shadow-lg bg-gradient-to-r ${stat.gradient} hover:shadow-xl transition-shadow duration-300`}>
                        <Statistic
                            title={<span className={`${stat.textColor} font-medium`}>{stat.title}</span>}
                            value={stat.value}
                            prefix={stat.icon}
                            valueStyle={{
                                color: stat.valueColor,
                                fontSize: '24px',
                                fontWeight: 'bold'
                            }}
                        />
                    </Card>
                </Col>
            ))}
        </Row>
    );
}

export default StatisticsCards;