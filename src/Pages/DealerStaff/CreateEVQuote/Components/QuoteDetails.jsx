import React from 'react';
import { Card, InputNumber, Input, Typography, Alert, Row, Col, Statistic } from 'antd';
import {
    NumberOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    CarOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

function QuoteDetails({
    quantity,
    onQuantityChange,
    note,
    onNoteChange,
    maxQuantity,
    selectedVehicle,
    selectedPromotion
}) {
    return (
        <div className="space-y-4">
            {/* Quantity Input */}
            <Card
                title={
                    <div className="flex items-center gap-2">
                        <NumberOutlined className="text-orange-500" />
                        <span className="text-base font-semibold">Số lượng đặt hàng</span>
                    </div>
                }
                className="shadow-sm border border-gray-200 rounded-lg"
                size="small"
            >
                <div className="space-y-3">
                    <InputNumber
                        placeholder="Nhập số lượng xe cần báo giá"
                        size="large"
                        min={1}
                        max={maxQuantity}
                        value={quantity}
                        onChange={onQuantityChange}
                        className="w-full"
                        controls={{
                            upIcon: '+',
                            downIcon: '-'
                        }}
                        addonAfter="xe"
                    />

                    {maxQuantity > 0 && (
                        <div className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                            <Text type="secondary">Tối đa có sẵn: {maxQuantity} xe</Text>
                            {quantity > maxQuantity && (
                                <Text type="danger" className="font-medium">
                                    Vượt quá số lượng!
                                </Text>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            {/* Note Input */}
            <Card
                title={
                    <div className="flex items-center gap-2">
                        <FileTextOutlined className="text-purple-500" />
                        <span className="text-base font-semibold">Ghi chú</span>
                    </div>
                }
                className="shadow-sm border border-gray-200 rounded-lg"
                size="small"
            >
                <TextArea
                    placeholder="Ghi chú cho báo giá (tùy chọn)&#10;VD: Yêu cầu giao hàng, thông tin liên hệ..."
                    value={note}
                    onChange={(e) => onNoteChange(e.target.value)}
                    rows={3}
                    showCount
                    maxLength={300}
                    className="resize-none"
                />
            </Card>

            {/* Quote Summary */}
            <Card
                title={
                    <div className="flex items-center gap-2">
                        <CheckCircleOutlined className="text-green-500" />
                        <span className="text-base font-semibold">Tóm tắt báo giá</span>
                    </div>
                }
                className="shadow-sm border border-gray-200 rounded-lg"
                size="small"
            >
                {selectedVehicle ? (
                    <div className="space-y-4">
                        {/* Vehicle Info */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                                <CarOutlined className="text-blue-600" />
                                <Text strong className="text-blue-900">Thông tin xe</Text>
                            </div>
                            <Row gutter={[8, 8]}>
                                <Col span={12}>
                                    <div className="text-xs text-gray-600">Model</div>
                                    <div className="font-medium text-sm">{selectedVehicle.modelName}</div>
                                </Col>
                                <Col span={12}>
                                    <div className="text-xs text-gray-600">Phiên bản</div>
                                    <div className="font-medium text-sm">{selectedVehicle.versionName}</div>
                                </Col>
                                <Col span={12}>
                                    <div className="text-xs text-gray-600">Màu sắc</div>
                                    <div className="font-medium text-sm">{selectedVehicle.colorName}</div>
                                </Col>
                                <Col span={12}>
                                    <div className="text-xs text-gray-600">Số lượng</div>
                                    <div className="font-bold text-green-600 text-base">{quantity || 0} xe</div>
                                </Col>
                            </Row>
                        </div>

                        {/* Promotion Info */}
                        {selectedPromotion && (
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg border border-orange-200">
                                <Text strong className="text-orange-900 block mb-1">🎁 Khuyến mãi áp dụng</Text>
                                <Text className="text-orange-700 text-sm">{selectedPromotion.name}</Text>
                            </div>
                        )}

                        {/* Note Info */}
                        {note && (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <Text strong className="text-gray-700 block mb-1">📝 Ghi chú</Text>
                                <Text className="text-gray-600 text-sm">{note}</Text>
                            </div>
                        )}

                        {/* Summary Stats */}
                        <Row gutter={16} className="mt-4">
                            <Col span={12}>
                                <Statistic
                                    title="Tổng số xe"
                                    value={quantity || 0}
                                    suffix="xe"
                                    valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Còn lại kho"
                                    value={maxQuantity - (quantity || 0)}
                                    suffix="xe"
                                    valueStyle={{
                                        color: (maxQuantity - (quantity || 0)) > 0 ? '#52c41a' : '#ff4d4f',
                                        fontSize: '18px'
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                ) : (
                    <Alert
                        message="Chưa hoàn thành"
                        description="Vui lòng chọn xe điện và màu sắc để xem tóm tắt báo giá."
                        type="info"
                        showIcon
                        className="border-0"
                    />
                )}
            </Card>
        </div>
    );
}

export default QuoteDetails;