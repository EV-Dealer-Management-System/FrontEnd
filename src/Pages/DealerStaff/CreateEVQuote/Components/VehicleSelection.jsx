import React, { useState, useMemo } from 'react';
import {
    ProCard,
    ProFormSelect,
    ProForm,
    ProFormDigit,
    ProDescriptions,
    StatisticCard
} from '@ant-design/pro-components';
import {
    Typography,
    Row,
    Col,
    Spin,
    Empty,
    Button,
    Badge,
    Tag,
    Space,
    Tooltip
} from 'antd';
import {
    CarOutlined,
    PlusOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    ShoppingCartOutlined,
    ThunderboltOutlined,
    BgColorsOutlined
} from '@ant-design/icons';

const { Text } = Typography;

function VehicleSelection({
    inventory,
    loadingInventory,
    selectedItems,
    onSelectionChange
}) {
    const [selectedModel, setSelectedModel] = useState(null);
    const [selectedVersion, setSelectedVersion] = useState(null);

    // Group inventory by model
    const groupedByModel = useMemo(() => {
        return inventory.reduce((acc, item) => {
            if (!acc[item.modelId]) {
                acc[item.modelId] = {
                    modelId: item.modelId,
                    modelName: item.modelName,
                    versions: {}
                };
            }

            if (!acc[item.modelId].versions[item.versionId]) {
                acc[item.modelId].versions[item.versionId] = {
                    versionId: item.versionId,
                    versionName: item.versionName,
                    colors: []
                };
            }

            acc[item.modelId].versions[item.versionId].colors.push({
                colorId: item.colorId,
                colorName: item.colorName,
                quantity: item.quantity
            });

            return acc;
        }, {});
    }, [inventory]);

    const models = Object.values(groupedByModel);
    const versions = selectedModel ? Object.values(groupedByModel[selectedModel]?.versions || {}) : [];
    const colors = selectedVersion ? versions.find(v => v.versionId === selectedVersion)?.colors || [] : [];

    // Handle model selection
    const handleModelChange = (modelId) => {
        setSelectedModel(modelId);
        setSelectedVersion(null);
        onSelectionChange({
            versionId: null,
            colorId: null
        });
    };

    // Handle version selection
    const handleVersionChange = (versionId) => {
        setSelectedVersion(versionId);
        onSelectionChange({
            versionId: versionId,
            colorId: null
        });
    };

    // Handle color selection
    const handleColorChange = (colorId) => {
        onSelectionChange({
            versionId: selectedVersion,
            colorId: colorId
        });
    };



    // Get selected items info
    const selectedInfo = useMemo(() => {
        if (!selectedModel || !selectedVersion || !selectedItems.colorId) return null;

        const model = groupedByModel[selectedModel];
        const version = model?.versions[selectedVersion];
        const color = version?.colors.find(c => c.colorId === selectedItems.colorId);

        return {
            modelName: model?.modelName,
            versionName: version?.versionName,
            colorName: color?.colorName,
            quantity: color?.quantity || 0
        };
    }, [selectedModel, selectedVersion, selectedItems.colorId, groupedByModel]);



    if (loadingInventory) {
        return (
            <ProCard className="min-h-96">
                <div className="flex flex-col items-center justify-center py-16">
                    <Spin size="large" />
                    <p className="mt-4 text-gray-500 text-base">Đang tải thông tin kho xe điện...</p>
                </div>
            </ProCard>
        );
    }

    if (!inventory.length) {
        return (
            <ProCard>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <div className="text-center">
                            <p className="text-gray-500 text-base mb-2">Không có xe điện trong kho</p>
                            <p className="text-gray-400 text-sm">Vui lòng liên hệ quản lý để nhập thêm xe vào kho</p>
                        </div>
                    }
                />
            </ProCard>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <ProCard
                title={
                    <div className="flex items-center gap-2">
                        <CarOutlined className="text-blue-500" />
                        <span className="text-lg font-semibold">Chi tiết đặt xe</span>
                    </div>
                }
                className="shadow-sm"
                extra={
                    <Space>
                        {/* <Badge count={selectedItems.colorId ? 1 : 0} showZero={false}>
                            <Tag icon={<ShoppingCartOutlined />} color="blue">
                                Xe #{selectedItems.colorId || '1'}
                            </Tag>
                        </Badge> */}
                        <Tooltip title="Thông tin chi tiết về xe đã chọn">
                            <InfoCircleOutlined className="text-gray-400" />
                        </Tooltip>
                    </Space>
                }
            >
                <ProForm
                    layout="horizontal"
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                    submitter={false}
                    size="large"
                >
                    <Row gutter={[24, 16]}>
                        <Col span={12}>
                            <ProFormSelect
                                label={
                                    <Space>
                                        <CarOutlined className="text-blue-500" />
                                        <span className="text-red-500">* Mẫu xe</span>
                                    </Space>
                                }
                                name="model"
                                placeholder="Chọn mẫu xe điện"
                                options={models.map(model => ({
                                    label: (
                                        <div className="flex justify-between items-center py-1">
                                            <Space>
                                                <CarOutlined className="text-blue-500" />
                                                <span className="font-medium">{model.modelName}</span>
                                            </Space>
                                            <Tag color="green" size="small">Có sẵn</Tag>
                                        </div>
                                    ),
                                    value: model.modelId
                                }))}
                                fieldProps={{
                                    value: selectedModel,
                                    onChange: handleModelChange,
                                    showSearch: true,
                                    filterOption: (input, option) =>
                                        models.find(m => m.modelId === option.value)?.modelName
                                            ?.toLowerCase().includes(input.toLowerCase()),
                                    style: { borderRadius: '8px' }
                                }}
                                rules={[{ required: true, message: 'Vui lòng chọn mẫu xe!' }]}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormSelect
                                label={
                                    <Space>
                                        <ThunderboltOutlined className="text-orange-500" />
                                        <span className="text-red-500">* Phiên bản</span>
                                    </Space>
                                }
                                name="version"
                                placeholder="Chọn phiên bản xe"
                                options={versions.map(version => ({
                                    label: (
                                        <div className="flex justify-between items-center py-1">
                                            <Space>
                                                <ThunderboltOutlined className="text-orange-500" />
                                                <span className="font-medium">{version.versionName}</span>
                                            </Space>
                                            <Tag color="blue" size="small">2025</Tag>
                                        </div>
                                    ),
                                    value: version.versionId
                                }))}
                                fieldProps={{
                                    value: selectedVersion,
                                    onChange: handleVersionChange,
                                    showSearch: true,
                                    filterOption: (input, option) =>
                                        versions.find(v => v.versionId === option.value)?.versionName
                                            ?.toLowerCase().includes(input.toLowerCase()),
                                    style: { borderRadius: '8px' }
                                }}
                                disabled={!selectedModel}
                                rules={[{ required: true, message: 'Vui lòng chọn phiên bản!' }]}
                            />
                        </Col>
                    </Row>

                    <Row gutter={[24, 16]}>
                        <Col span={12}>
                            <ProFormSelect
                                label={
                                    <Space>
                                        <BgColorsOutlined className="text-purple-500" />
                                        <span className="text-red-500">* Màu xe</span>
                                    </Space>
                                }
                                name="color"
                                placeholder="Chọn màu sắc xe"
                                options={colors.map(color => ({
                                    label: (
                                        <div className="flex justify-between items-center py-1">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded-full border-2 border-gray-300 shadow-sm"
                                                    style={{
                                                        backgroundColor: color.colorName === 'Đen Bóng' ? '#000' :
                                                            color.colorName === 'Trắng' ? '#fff' :
                                                                color.colorName === 'Đỏ' ? '#ff0000' :
                                                                    color.colorName === 'Xanh' ? '#0000ff' : '#ccc'
                                                    }}
                                                />
                                                <span className="font-medium">{color.colorName}</span>
                                            </div>
                                            {/* <Tag
                                                color={color.quantity > 0 ? 'success' : 'error'}
                                                size="small"
                                            >
                                                {color.quantity} xe
                                            </Tag> */}
                                        </div>
                                    ),
                                    value: color.colorId,
                                    disabled: color.quantity === 0
                                }))}
                                fieldProps={{
                                    value: selectedItems.colorId,
                                    onChange: handleColorChange,
                                    showSearch: true,
                                    filterOption: (input, option) =>
                                        colors.find(c => c.colorId === option.value)?.colorName
                                            ?.toLowerCase().includes(input.toLowerCase()),
                                    style: { borderRadius: '8px' }
                                }}
                                disabled={!selectedVersion}
                                rules={[{ required: true, message: 'Vui lòng chọn màu xe!' }]}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormDigit
                                label={
                                    <Space>
                                        <ShoppingCartOutlined className="text-green-500" />
                                        <span className="text-red-500">* Số lượng</span>
                                    </Space>
                                }
                                name="quantity"
                                placeholder="Nhập số lượng xe"
                                min={1}
                                max={selectedInfo?.quantity || 1}
                                fieldProps={{
                                    precision: 0,
                                    style: {
                                        width: '100%',
                                        borderRadius: '8px'
                                    },
                                    controls: true,
                                    changeOnWheel: true
                                }}
                                rules={[
                                    { required: true, message: 'Vui lòng nhập số lượng!' },
                                    { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' }
                                ]}
                            />
                        </Col>
                    </Row>

                    {/* Trạng thái kho hàng */}
                    {selectedInfo && (
                        <Row gutter={16} className="mt-6">
                            <Col span={24}>
                                <StatisticCard
                                    statistic={{
                                        title: 'Tình trạng kho hàng',
                                        value: selectedInfo.quantity,
                                        suffix: 'xe có sẵn',
                                        icon: <CheckCircleOutlined className="text-green-500" />,
                                        valueStyle: { color: '#52c41a', fontSize: '20px' },
                                        description: (
                                            <Space>
                                                <Tag color="success" icon={<CheckCircleOutlined />}>
                                                    Sẵn có
                                                </Tag>
                                                <span className="text-gray-500">
                                                    {selectedInfo.modelName} - {selectedInfo.versionName} - {selectedInfo.colorName}
                                                </span>
                                            </Space>
                                        )
                                    }}
                                    className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm"
                                />
                            </Col>
                        </Row>
                    )}

                    {/* Thông số kỹ thuật */}
                    {/* {selectedInfo && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-700 mb-3">Thông số kỹ thuật</h4>
                            <Row gutter={[24, 12]}>
                                <Col span={8}>
                                    <div className="text-sm">
                                        <div className="text-gray-500">⚡ Công suất</div>
                                        <div className="font-medium">3000 W</div>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div className="text-sm">
                                        <div className="text-gray-500">⏱️ Pin</div>
                                        <div className="font-medium">72 V</div>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div className="text-sm">
                                        <div className="text-gray-500">🏁 Tốc độ</div>
                                        <div className="font-medium">85 km/h</div>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div className="text-sm">
                                        <div className="text-gray-500">🔋 Tầm hoạt động</div>
                                        <div className="font-medium">120 km</div>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div className="text-sm">
                                        <div className="text-gray-500">⚖️ Trọng lượng</div>
                                        <div className="font-medium">78 kg</div>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div className="text-sm">
                                        <div className="text-gray-500">📏 Chiều cao</div>
                                        <div className="font-medium">1120 cm</div>
                                    </div>
                                </Col>
                                <Col span={24}>
                                    <div className="text-sm">
                                        <div className="text-gray-500">📝 Năm sản xuất</div>
                                        <div className="font-medium">2025</div>
                                    </div>
                                </Col>
                            </Row>

                            <div className="mt-4 p-3 bg-white rounded border">
                                <div className="text-sm text-gray-600">
                                    📋 <strong>Mô tả:</strong>
                                    <div className="mt-1 italic">
                                        Phiên bản cao cấp của E-Scooter, pin lithium 72V động cơ mạnh mẽ.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )} */}

                    {/* Nút thêm xe */}
                    <div className="mt-6 text-center">
                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            size="large"
                            className="w-full max-w-md"
                        >
                            + Thêm xe
                        </Button>
                    </div>
                </ProForm>
            </ProCard>
        </div>
    );
} export default VehicleSelection;