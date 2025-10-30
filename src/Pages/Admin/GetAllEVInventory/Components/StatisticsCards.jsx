import React from "react";
import { Card, Statistic, Row, Col } from "antd";
import { CarOutlined, ShopOutlined } from "@ant-design/icons";

function StatisticsCards({ filteredData }) {
    // Tính toán thống kê tổng quan
    const totalVehicles = filteredData.reduce((sum, item) => sum + item.quantity, 0);
    const totalModels = new Set(filteredData.map(item => item.modelName)).size;
    const totalVersions = new Set(filteredData.map(item => item.versionName)).size;

    // Thống kê theo kho
    const warehouseStats = filteredData.reduce((acc, item) => {
        item.vehicles?.forEach(vehicle => {
            if (!acc[vehicle.warehouseName]) {
                acc[vehicle.warehouseName] = 0;
            }
            acc[vehicle.warehouseName]++;
        });
        return acc;
    }, {});
    const totalWarehouses = Object.keys(warehouseStats).length;

    return (
        <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
                <Card className="text-center border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="Tổng Số Xe"
                        value={totalVehicles}
                        prefix={<CarOutlined className="text-blue-500" />}
                        valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card className="text-center border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="Số Model"
                        value={totalModels}
                        valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 'bold' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card className="text-center border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="Số Phiên Bản"
                        value={totalVersions}
                        valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 'bold' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card className="text-center border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="Số Kho"
                        value={totalWarehouses}
                        prefix={<ShopOutlined className="text-orange-500" />}
                        valueStyle={{ color: '#fa8c16', fontSize: '28px', fontWeight: 'bold' }}
                    />
                </Card>
            </Col>
        </Row>
    );
}

export default StatisticsCards;