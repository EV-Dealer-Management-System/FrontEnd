import React, { useMemo } from 'react';
import { Card, Row, Col } from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CarOutlined
} from '@ant-design/icons';

function BookingStatusCards({ bookingData, loading }) {

    // Tính toán số lượng booking theo trạng thái
    const statusCounts = useMemo(() => {
        if (!bookingData || !Array.isArray(bookingData)) {
            return { pending: 0, approved: 0, completed: 0 };
        }

        const pending = bookingData.filter(b => b.status === 0).length;
        const approved = bookingData.filter(b => b.status === 1).length;
        const completed = bookingData.filter(b => b.status >= 4).length;
        const total = bookingData.length;

        return { pending, approved, completed, total };
    }, [bookingData]);

    const cards = [
        {
            title: 'Chờ Duyệt',
            count: statusCounts.pending,
            total: statusCounts.total,
            icon: <ClockCircleOutlined className="text-5xl" />,
            color: 'orange',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600',
            borderColor: 'border-orange-200'
        },
        {
            title: 'Đã Duyệt',
            count: statusCounts.approved,
            total: statusCounts.total,
            icon: <CheckCircleOutlined className="text-5xl" />,
            color: 'green',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            borderColor: 'border-green-200'
        },
        {
            title: 'Đã Hoàn Thành',
            count: statusCounts.completed,
            total: statusCounts.total,
            icon: <CarOutlined className="text-5xl" />,
            color: 'blue',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            borderColor: 'border-blue-200'
        },
        // {
        //     title: 'Đã Hủy',
        //     count: statusCounts.canceled,
        //     total: statusCounts.total,
        //     icon: <CarOutlined className="text-5xl" />,
        //     color: 'gray',
        //     bgColor: 'bg-gray-50',
        //     textColor: 'text-gray-600',
        //     borderColor: 'border-gray-200'

        // }
    ];

    return (
        <Row gutter={[16, 16]} className="mb-6">
            {cards.map((card, index) => (
                <Col xs={24} sm={8} key={index}>
                    <Card
                        className={`border-2 ${card.borderColor} shadow-md hover:shadow-lg transition-all duration-300`}
                        bodyStyle={{ padding: '32px 24px' }}
                        loading={loading}
                    >
                        <div className="text-center">
                            <div className={card.textColor}>
                                {card.icon}
                            </div>
                            <div className="mt-4">
                                <div className={`text-4xl font-bold ${card.textColor}`}>
                                    {card.count} <span className="text-2xl text-gray-400">/ {card.total}</span>
                                </div>
                                <div className="text-gray-500 text-sm mt-2 font-medium">
                                    {card.title}
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
}

export default BookingStatusCards;