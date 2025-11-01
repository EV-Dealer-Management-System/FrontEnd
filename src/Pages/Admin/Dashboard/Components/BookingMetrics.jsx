import React, { useMemo } from 'react';
import { Statistic } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CarOutlined
} from '@ant-design/icons';

function BookingMetrics({ bookingData, loading }) {

    // Tính toán metrics từ booking data
    const metrics = useMemo(() => {
        if (!bookingData || !Array.isArray(bookingData)) {
            return {
                pending: 0,
                approved: 0,
                completed: 0,
                total: 0
            };
        }

        const total = bookingData.length;
        const pending = bookingData.filter(b => b.status === 1).length;
        const approved = bookingData.filter(b => b.status === 2).length;
        const completed = bookingData.filter(b => b.status === 5).length;

        return { pending, approved, completed, total };
    }, [bookingData]);

    return (
        <ProCard ghost gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <ProCard colSpan={8} bordered hoverable loading={loading}>
                <Statistic
                    title="Chờ Duyệt"
                    value={metrics.pending}
                    valueStyle={{ color: '#fa8c16' }}
                    prefix={<ClockCircleOutlined />}
                    suffix={`/ ${metrics.total}`}
                />
            </ProCard>
            <ProCard colSpan={8} bordered hoverable loading={loading}>
                <Statistic
                    title="Đã Duyệt"
                    value={metrics.approved}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckCircleOutlined />}
                    suffix={`/ ${metrics.total}`}
                />
            </ProCard>
            <ProCard colSpan={8} bordered hoverable loading={loading}>
                <Statistic
                    title="Đã Hoàn Thành"
                    value={metrics.completed}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<CarOutlined />}
                    suffix={`/ ${metrics.total}`}
                />
            </ProCard>
        </ProCard>
    );
}

export default BookingMetrics;
