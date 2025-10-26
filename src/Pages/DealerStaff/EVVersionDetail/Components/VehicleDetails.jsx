import React, { useState, useEffect, useCallback } from "react";
import {
    Modal,
    Row,
    Col,
    Card,
    Descriptions,
    Tag,
    Spin,
    Alert,
    Typography,
    Divider,
    Space,
    Statistic,
} from "antd";
import { ProCard } from "@ant-design/pro-components";
import {
    CarOutlined,
    ThunderboltOutlined,
    DashboardOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    StopOutlined,
    ExperimentOutlined,
    ToolOutlined,
    VerticalAlignMiddleOutlined,
} from "@ant-design/icons";
import { getEVVersionById } from "../../../../App/DealerStaff/EVInventory/GetEVVersionByID";

const { Title, Text } = Typography;

function VehicleDetails({ visible, onClose, versionId }) {
    const [loading, setLoading] = useState(false);
    const [versionData, setVersionData] = useState(null);
    const [error, setError] = useState(null);

    const fetchVersionDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getEVVersionById(versionId);

            if (response.isSuccess) {
                setVersionData(response.result);
            } else {
                setError(response.message || "Không thể tải thông tin chi tiết xe");
            }
        } catch (error) {
            console.error("Error fetching version details:", error);
            setError("Lỗi khi tải thông tin chi tiết xe");
        } finally {
            setLoading(false);
        }
    }, [versionId]);

    // Fetch dữ liệu chi tiết xe khi mở modal
    useEffect(() => {
        if (visible && versionId) {
            fetchVersionDetails();
        }
    }, [visible, versionId, fetchVersionDetails]);

    const resetModal = () => {
        setVersionData(null);
        setError(null);
        onClose();
    };

    // Format thông số kỹ thuật
    const formatMotorPower = (power) => `${power?.toLocaleString()} W`;
    const formatBatteryCapacity = (capacity) => `${capacity} Ah`;
    const formatRange = (range) => `${range} km`;
    const formatSpeed = (speed) => `${speed} km/h`;
    const formatWeight = (weight) => `${weight} kg`;
    const formatHeight = (height) => `${height} mm`;

    return (
        <Modal
            title={
                <Space>
                    <CarOutlined className="text-blue-500" />
                    <span>Chi Tiết Thông Số Xe</span>
                </Space>
            }
            open={visible}
            onCancel={resetModal}
            footer={null}
            width={900}
            centered
            destroyOnClose
        >
            {loading && (
                <div className="flex justify-center items-center py-8">
                    <Spin size="large" tip="Đang tải thông tin xe..." />
                </div>
            )}

            {error && (
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                    className="mb-4"
                />
            )}

            {versionData && !loading && (
                <div className="space-y-6">
                    {/* Header thông tin cơ bản */}
                    <ProCard className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
                        <Row align="middle" gutter={[16, 16]}>
                            <Col xs={24} sm={16}>
                                <Title level={4} className="mb-2 text-blue-600">
                                    {versionData.versionName}
                                </Title>
                                <Text type="secondary" className="text-base">
                                    ID: {versionData.id}
                                </Text>
                            </Col>
                            <Col xs={24} sm={8} className="text-right">
                                <Tag
                                    icon={versionData.isActive ? <CheckCircleOutlined /> : <StopOutlined />}
                                    color={versionData.isActive ? "success" : "default"}
                                    className="px-3 py-1 text-sm"
                                >
                                    {versionData.isActive ? "Đang kinh doanh" : "Ngừng kinh doanh"}
                                </Tag>
                                <div className="mt-2">
                                    <Tag icon={<CalendarOutlined />} color="blue">
                                        Năm SX: {versionData.productionYear}
                                    </Tag>
                                </div>
                            </Col>
                        </Row>
                    </ProCard>

                    {/* Thông số kỹ thuật chính */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={6}>
                            <ProCard className="text-center h-full">
                                <Statistic
                                    title="Công suất động cơ"
                                    value={versionData.motorPower}
                                    suffix="W"
                                    prefix={<ThunderboltOutlined className="text-orange-500" />}
                                    valueStyle={{ color: "#f56500" }}
                                />
                            </ProCard>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <ProCard className="text-center h-full">
                                <Statistic
                                    title="Dung lượng pin"
                                    value={versionData.batteryCapacity}
                                    suffix="Ah"
                                    prefix={<ExperimentOutlined className="text-green-500" />}
                                    valueStyle={{ color: "#52c41a" }}
                                />
                            </ProCard>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <ProCard className="text-center h-full">
                                <Statistic
                                    title="Tầm di chuyển"
                                    value={versionData.rangePerCharge}
                                    suffix="km"
                                    prefix={<CarOutlined className="text-blue-500" />}
                                    valueStyle={{ color: "#1890ff" }}
                                />
                            </ProCard>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <ProCard className="text-center h-full">
                                <Statistic
                                    title="Tốc độ tối đa"
                                    value={versionData.topSpeed}
                                    suffix="km/h"
                                    prefix={<DashboardOutlined className="text-red-500" />}
                                    valueStyle={{ color: "#ff4d4f" }}
                                />
                            </ProCard>
                        </Col>
                    </Row>

                    {/* Thông tin chi tiết */}
                    <ProCard title="Thông Số Kỹ Thuật Chi Tiết">
                        <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered>
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <ThunderboltOutlined className="text-orange-500" />
                                        Công suất động cơ
                                    </Space>
                                }
                            >
                                <Text strong className="text-orange-600">
                                    {formatMotorPower(versionData.motorPower)}
                                </Text>
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <Space>
                                        <ExperimentOutlined className="text-green-500" />
                                        Dung lượng pin
                                    </Space>
                                }
                            >
                                <Text strong className="text-green-600">
                                    {formatBatteryCapacity(versionData.batteryCapacity)}
                                </Text>
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <Space>
                                        <CarOutlined className="text-blue-500" />
                                        Tầm di chuyển
                                    </Space>
                                }
                            >
                                <Text strong className="text-blue-600">
                                    {formatRange(versionData.rangePerCharge)}
                                </Text>
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <Space>
                                        <DashboardOutlined className="text-red-500" />
                                        Tốc độ tối đa
                                    </Space>
                                }
                            >
                                <Text strong className="text-red-600">
                                    {formatSpeed(versionData.topSpeed)}
                                </Text>
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <Space>
                                        <ToolOutlined className="text-purple-500" />
                                        Trọng lượng
                                    </Space>
                                }
                            >
                                <Text strong className="text-purple-600">
                                    {formatWeight(versionData.weight)}
                                </Text>
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <Space>
                                        <VerticalAlignMiddleOutlined className="text-cyan-500" />
                                        Chiều cao
                                    </Space>
                                }
                            >
                                <Text strong className="text-cyan-600">
                                    {formatHeight(versionData.height)}
                                </Text>
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <Space>
                                        <CalendarOutlined className="text-blue-500" />
                                        Năm sản xuất
                                    </Space>
                                }
                                span={2}
                            >
                                <Text strong className="text-blue-600">
                                    {versionData.productionYear}
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </ProCard>

                    {/* Mô tả sản phẩm */}
                    {versionData.description && (
                        <ProCard title="Mô Tả Sản Phẩm">
                            <Text className="text-gray-700 leading-relaxed">
                                {versionData.description}
                            </Text>
                        </ProCard>
                    )}
                </div>
            )}
        </Modal>
    );
}

export default VehicleDetails;