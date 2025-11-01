import React from 'react';
import { Card, Statistic, Progress } from 'antd';
import { UserOutlined } from '@ant-design/icons';

function StaffOverview({ staffData, loading }) {

    const totalStaff = staffData?.length || 0;

    return (
        <Card bordered={false} hoverable loading={loading} style={{ marginBottom: 24 }}>
            <Statistic
                title="Tổng Nhân Viên"
                value={totalStaff}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#722ed1' }}
                suffix="người"
            />
            <Progress
                percent={100}
                strokeColor="#722ed1"
                showInfo={false}
                style={{ marginTop: 8 }}
            />
        </Card>
    );
}

export default StaffOverview;
