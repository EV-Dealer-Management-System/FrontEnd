import React from 'react';
import { Card, Select, Button, Space, Typography, Statistic, Row, Col } from 'antd';
import {
    ThunderboltOutlined,
    FileTextOutlined,
    DatabaseOutlined,
    ReloadOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

function FilterBar({ selectedPage, onPageChange, onApply, loading }) {
    return (
        <Card bordered={false} className="mb-4">
            <Row gutter={[16, 16]}>
                {/* Statistics */}
                <Col xs={24} sm={8}>
                    <Statistic
                        title="Trang hiện tại"
                        value={selectedPage}
                        suffix="/ 10"
                        prefix={<DatabaseOutlined />}
                        valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                    />
                </Col>
                <Col xs={24} sm={8}>
                    <Statistic
                        title="Kích thước trang"
                        value={1000}
                        suffix="records"
                        prefix={<FileTextOutlined />}
                        valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                    />
                </Col>
                <Col xs={24} sm={8}>
                    <Statistic
                        title="Tổng số trang"
                        value={10}
                        suffix="trang"
                        prefix={<ThunderboltOutlined />}
                        valueStyle={{ color: '#722ed1', fontSize: '20px' }}
                    />
                </Col>

                {/* Divider */}
                <Col span={24}>
                    <div className="border-t border-gray-100 my-2" />
                </Col>

                {/* Controls */}
                <Col xs={24} lg={16}>
                    <Space direction="vertical" className="w-full" size={8}>
                        <Text type="secondary" className="text-xs">Chọn trang dữ liệu</Text>
                        <Select
                            value={selectedPage}
                            onChange={onPageChange}
                            className="w-full"
                            size="large"
                            placeholder="Chọn trang"
                            showSearch
                            optionFilterProp="children"
                        >
                            {[...Array(10)].map((_, index) => (
                                <Option key={index + 1} value={index + 1}>
                                    Trang {index + 1} - 1000 nhân viên
                                </Option>
                            ))}
                        </Select>
                    </Space>
                </Col>
                <Col xs={24} lg={8}>
                    <Space direction="vertical" className="w-full" size={8}>
                        <Text type="secondary" className="text-xs">Hành động</Text>
                        <Button
                            type="primary"
                            size="large"
                            block
                            onClick={onApply}
                            loading={loading}
                            icon={<ReloadOutlined />}
                        >
                            {loading ? 'Đang tải...' : 'Tải dữ liệu'}
                        </Button>
                    </Space>
                </Col>
            </Row>
        </Card>
    );
}

export default FilterBar;
