import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    TeamOutlined
} from '@ant-design/icons';

// Component hiển thị thống kê hợp đồng
function ContractStatistics({ contracts }) {
    // Tính toán thống kê
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter(c => c.status === 1).length;
    const inactiveContracts = contracts.filter(c => c.status === 0).length;

    // Đếm số lượng chủ sở hữu unique
    const uniqueOwners = new Set(contracts.map(c => c.ownerBy)).size;

    return (
        <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={12} lg={6}>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="Tổng hợp đồng"
                        value={totalContracts}
                        prefix={<FileTextOutlined className="text-blue-500" />}
                        valueStyle={{ color: '#1890ff' }}
                    />
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="Đang hoạt động"
                        value={activeContracts}
                        prefix={<CheckCircleOutlined className="text-green-500" />}
                        valueStyle={{ color: '#52c41a' }}
                    />
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="Không hoạt động"
                        value={inactiveContracts}
                        prefix={<ClockCircleOutlined className="text-gray-500" />}
                        valueStyle={{ color: '#8c8c8c' }}
                    />
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="Số đại lý"
                        value={uniqueOwners}
                        prefix={<TeamOutlined className="text-purple-500" />}
                        valueStyle={{ color: '#722ed1' }}
                    />
                </Card>
            </Col>
        </Row>
    );
}

export default ContractStatistics;
