import React from 'react';
import { Card, Table, Tag, Badge, Typography, Button, Space, Tooltip } from 'antd';
import {
    GiftOutlined,
    PercentageOutlined,
    DollarOutlined,
    CalendarOutlined,
    EditOutlined,
    EyeOutlined
} from '@ant-design/icons';

const { Title } = Typography;

function PromotionTable({
    promotions,
    formatCurrency,
    formatDate,
    getPromotionStatus,
    onEdit,
    onView
}) {

    const columns = [
        {
            title: 'Tên khuyến mãi',
            dataIndex: 'name',
            key: 'name',
            width: 300,
            render: (text, record) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                        <GiftOutlined className="text-white text-lg" />
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-base mb-1">{text}</div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                            {record.description}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Loại giảm giá',
            dataIndex: 'discountType',
            key: 'discountType',
            width: 200,
            render: (type, record) => {
                if (type === 0) {
                    return (
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <DollarOutlined className="text-white text-sm" />
                            </div>
                            <div>
                                <div className="font-semibold text-green-700 text-sm">Giảm cố định</div>
                                <div className="text-lg font-bold text-green-800">
                                    {formatCurrency(record.fixedAmount)}
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                <PercentageOutlined className="text-white text-sm" />
                            </div>
                            <div>
                                <div className="font-semibold text-orange-700 text-sm">Giảm theo %</div>
                                <div className="text-lg font-bold text-orange-800">
                                    {record.percentage}%
                                </div>
                            </div>
                        </div>
                    );
                }
            },
        },
        {
            title: 'Thời gian áp dụng',
            key: 'duration',
            width: 280,
            render: (_, record) => (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                        <CalendarOutlined className="text-blue-500" />
                        <div>
                            <span className="text-xs text-gray-600 block">Bắt đầu</span>
                            <span className="font-medium text-blue-700 text-sm">
                                {formatDate(record.startDate)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded-md">
                        <CalendarOutlined className="text-red-500" />
                        <div>
                            <span className="text-xs text-gray-600 block">Kết thúc</span>
                            <span className="font-medium text-red-700 text-sm">
                                {formatDate(record.endDate)}
                            </span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 150,
            render: (_, record) => {
                const status = getPromotionStatus(record.startDate, record.endDate, record.isActive);
                const statusConfig = {
                    'active': {
                        badgeStatus: 'processing',
                        tagColor: 'green',
                        bgColor: 'bg-green-50',
                        borderColor: 'border-green-200'
                    },
                    'upcoming': {
                        badgeStatus: 'default',
                        tagColor: 'blue',
                        bgColor: 'bg-blue-50',
                        borderColor: 'border-blue-200'
                    },
                    'expired': {
                        badgeStatus: 'error',
                        tagColor: 'red',
                        bgColor: 'bg-red-50',
                        borderColor: 'border-red-200'
                    },
                    'inactive': {
                        badgeStatus: 'default',
                        tagColor: 'default',
                        bgColor: 'bg-gray-50',
                        borderColor: 'border-gray-200'
                    }
                };

                const config = statusConfig[status.status] || statusConfig.inactive;

                return (
                    <div className={`p-3 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
                        <Badge
                            status={config.badgeStatus}
                            text={
                                <Tag color={config.tagColor} className="font-medium border-0">
                                    {status.text}
                                </Tag>
                            }
                        />
                    </div>
                );
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            render: (date) => (
                <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Ngày tạo</div>
                    <div className="font-medium text-gray-800 text-sm">
                        {formatDate(date)}
                    </div>
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => onView && onView(record)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => onEdit && onEdit(record)}
                            className="text-green-500 hover:text-green-700 hover:bg-green-50"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title={
                <div className="flex items-center gap-3 py-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <GiftOutlined className="text-white text-lg" />
                    </div>
                    <div>
                        <Title level={4} className="m-0 text-gray-800">
                            Danh sách khuyến mãi xe điện
                        </Title>
                        <p className="text-sm text-gray-500 m-0 mt-1">
                            Quản lý và theo dõi tất cả chương trình khuyến mãi
                        </p>
                    </div>
                </div>
            }
            className="shadow-lg border-0 rounded-xl overflow-hidden"
            bodyStyle={{ padding: 0 }}
        >
            <Table
                columns={columns}
                dataSource={promotions}
                rowKey="id"
                pagination={{
                    pageSize: 8,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `Hiển thị ${range[0]}-${range[1]} của ${total} khuyến mãi`,
                    pageSizeOptions: ['5', '8', '10', '20'],
                }}
                scroll={{ x: 1200 }}
                className="promotion-table"
                rowClassName={(record, index) =>
                    `${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors duration-200`
                }
                size="middle"
            />
        </Card>
    );
}

export default PromotionTable;