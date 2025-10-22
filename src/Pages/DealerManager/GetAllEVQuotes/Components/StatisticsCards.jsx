import React from "react";
import { Row, Col } from "antd";
import { ProCard, StatisticCard } from "@ant-design/pro-components";
import {
    FileTextOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DollarOutlined,
    RiseOutlined,
} from "@ant-design/icons";

function StatisticsCards({ statistics, formatCurrency }) {
    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
                <ProCard
                    bordered
                    className="shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                    <StatisticCard
                        statistic={{
                            title: "Tổng báo giá",
                            value: statistics.total,
                            prefix: <FileTextOutlined className="text-blue-500" />,
                            valueStyle: {
                                color: "#1890ff",
                                fontSize: "32px",
                                fontWeight: "bold",
                            },
                        }}
                        className="bg-gradient-to-br from-blue-50 to-white"
                    />
                </ProCard>
            </Col>

            <Col xs={24} sm={12} lg={8}>
                <ProCard
                    bordered
                    className="shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                    <StatisticCard
                        statistic={{
                            title: "Chờ duyệt",
                            value: statistics.pending,
                            prefix: <ClockCircleOutlined className="text-orange-500" />,
                            valueStyle: {
                                color: "#fa8c16",
                                fontSize: "32px",
                                fontWeight: "bold",
                            },
                        }}
                        className="bg-gradient-to-br from-orange-50 to-white"
                    />
                </ProCard>
            </Col>

            <Col xs={24} sm={12} lg={8}>
                <ProCard
                    bordered
                    className="shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                    <StatisticCard
                        statistic={{
                            title: "Đã duyệt",
                            value: statistics.approved,
                            prefix: <CheckCircleOutlined className="text-green-500" />,
                            valueStyle: {
                                color: "#52c41a",
                                fontSize: "32px",
                                fontWeight: "bold",
                            },
                        }}
                        className="bg-gradient-to-br from-green-50 to-white"
                    />
                </ProCard>
            </Col>

            <Col xs={24} sm={12} lg={8}>
                <ProCard
                    bordered
                    className="shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                    <StatisticCard
                        statistic={{
                            title: "Từ chối",
                            value: statistics.rejected,
                            prefix: <CloseCircleOutlined className="text-red-500" />,
                            valueStyle: {
                                color: "#ff4d4f",
                                fontSize: "32px",
                                fontWeight: "bold",
                            },
                        }}
                        className="bg-gradient-to-br from-red-50 to-white"
                    />
                </ProCard>
            </Col>

            <Col xs={24} sm={12} lg={8}>
                <ProCard
                    bordered
                    className="shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                    <StatisticCard
                        statistic={{
                            title: "Tổng giá trị",
                            value: formatCurrency(statistics.totalAmount),
                            prefix: <DollarOutlined className="text-purple-500" />,
                            valueStyle: {
                                color: "#722ed1",
                                fontSize: "28px",
                                fontWeight: "bold",
                            },
                        }}
                        className="bg-gradient-to-br from-purple-50 to-white"
                    />
                </ProCard>
            </Col>

            <Col xs={24} sm={12} lg={8}>
                <ProCard
                    bordered
                    className="shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                    <StatisticCard
                        statistic={{
                            title: "Giá trị đã duyệt",
                            value: formatCurrency(statistics.approvedAmount),
                            prefix: <RiseOutlined className="text-cyan-500" />,
                            valueStyle: {
                                color: "#13c2c2",
                                fontSize: "28px",
                                fontWeight: "bold",
                            },
                        }}
                        className="bg-gradient-to-br from-cyan-50 to-white"
                    />
                </ProCard>
            </Col>
        </Row>
    );
}

export default StatisticsCards;