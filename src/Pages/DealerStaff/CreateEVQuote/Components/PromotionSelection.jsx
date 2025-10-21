import React, { useMemo } from 'react';
import {
    ProCard,
    ProFormSelect,
    ProDescriptions
} from '@ant-design/pro-components';
import {
    Tag,
    Empty,
    Spin,
    Typography
} from 'antd';
import {
    GiftOutlined,
    PercentageOutlined,
    DollarOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

function PromotionSelection({
    promotions,
    loadingPromotions,
    selectedPromotionId,
    onPromotionChange
}) {
    // Format tiền tệ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
    };

    // Lọc khuyến mãi đang hoạt động
    const activePromotions = useMemo(() => {
        const now = new Date();

        return promotions.filter(promotion => {
            if (!promotion.isActive) return false;

            const start = new Date(promotion.startDate);
            const end = new Date(promotion.endDate);

            return now >= start && now <= end;
        });
    }, [promotions]);

    // Tạo options cho ProFormSelect
    const promotionOptions = useMemo(() => {
        return activePromotions.map(promotion => ({
            label: (
                <div className="flex justify-between items-center py-1">
                    <div className="flex-1">
                        <div className="font-medium text-gray-900">{promotion.name}</div>
                        <div className="text-xs text-gray-500">{promotion.description}</div>
                    </div>
                    <div className="ml-2">
                        {promotion.discountType === 0 ? (
                            <Tag color="green" icon={<DollarOutlined />}>
                                {formatCurrency(promotion.fixedAmount)}
                            </Tag>
                        ) : (
                            <Tag color="blue" icon={<PercentageOutlined />}>
                                {promotion.percentage}%
                            </Tag>
                        )}
                    </div>
                </div>
            ),
            value: promotion.id,
            promotion: promotion
        }));
    }, [activePromotions]);

    // Khuyến mãi đã chọn
    const selectedPromotion = useMemo(() => {
        if (!selectedPromotionId) return null;
        return activePromotions.find(p => p.id === selectedPromotionId);
    }, [activePromotions, selectedPromotionId]);

    if (loadingPromotions) {
        return (
            <ProCard>
                <div className="text-center py-8">
                    <Spin size="large" tip="Đang tải khuyến mãi..." />
                </div>
            </ProCard>
        );
    }

    return (
        <ProCard
            title={
                <div className="flex items-center gap-2">
                    <GiftOutlined className="text-orange-500" />
                    <span>Chọn Khuyến Mãi</span>
                    <Tag color="blue">{activePromotions.length} có sẵn</Tag>
                </div>
            }
            className="mb-4"
        >
            {activePromotions.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không có khuyến mãi nào đang hoạt động"
                />
            ) : (
                <div className="space-y-4">
                    <ProFormSelect
                        name="promotionId"
                        placeholder="Chọn khuyến mãi (tùy chọn)"
                        options={promotionOptions}
                        fieldProps={{
                            value: selectedPromotionId,
                            onChange: onPromotionChange,
                            allowClear: true,
                            showSearch: true,
                            size: 'large',
                            filterOption: (input, option) =>
                                option?.promotion?.name?.toLowerCase().includes(input.toLowerCase())
                        }}
                        rules={[]}
                    />

                    {/* Hiển thị thông tin khuyến mãi đã chọn */}
                    {selectedPromotion && (
                        <ProCard
                            size="small"
                            className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"
                        >
                            <ProDescriptions
                                column={1}
                                size="small"
                                dataSource={selectedPromotion}
                                columns={[
                                    {
                                        title: '🎁 Khuyến mãi được chọn',
                                        dataIndex: 'name',
                                        render: (text) => (
                                            <Text strong className="text-orange-900 text-base">
                                                {text}
                                            </Text>
                                        )
                                    },
                                    {
                                        title: 'Mô tả',
                                        dataIndex: 'description',
                                        render: (text) => (
                                            <Text className="text-orange-700">
                                                {text}
                                            </Text>
                                        )
                                    },
                                    {
                                        title: 'Giá trị giảm',
                                        dataIndex: 'discountType',
                                        render: (type, record) => (
                                            <div className="flex items-center gap-2">
                                                <CheckCircleOutlined className="text-green-500" />
                                                {type === 0 ? (
                                                    <Tag color="green" icon={<DollarOutlined />} className="text-sm">
                                                        Giảm {formatCurrency(record.fixedAmount)}
                                                    </Tag>
                                                ) : (
                                                    <Tag color="blue" icon={<PercentageOutlined />} className="text-sm">
                                                        Giảm {record.percentage}%
                                                    </Tag>
                                                )}
                                            </div>
                                        )
                                    }
                                ]}
                            />
                        </ProCard>
                    )}
                </div>
            )}
        </ProCard>
    );
}

export default PromotionSelection;