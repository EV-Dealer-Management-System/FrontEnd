import React from 'react';
import { Card, Table, Tag, Typography, Button, Space, Tooltip, Divider } from 'antd';
import {
    GiftOutlined,
    PercentageOutlined,
    DollarOutlined,
    CalendarOutlined,
    EditOutlined,
    EyeOutlined,
    DeleteOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    StopOutlined
} from '@ant-design/icons';
import { ConfigProvider } from 'antd';
import viVN from 'antd/lib/locale/vi_VN';

const { Title, Text } = Typography;

function PromotionTable({
    promotions,
    formatCurrency,
    formatDate,
    getPromotionStatus,
    onEdit,
    onView,
    onDelete
}) {

    const columns = [
        {
            title: 'Khuyến mãi',
            dataIndex: 'name',
            key: 'name',
            width: 280,
            render: (text, record) => (
                <div className="py-2">
                    <div className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
                        {text}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-1">
                        {record.description}
                    </div>
                </div>
            ),
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discountType',
            key: 'discountType',
            width: 140,
            align: 'center',
            render: (type, record) => {
                if (type === 0) {
                    return (
                        <div className="text-center">
                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                <DollarOutlined className="text-xs" />
                                {formatCurrency(record.fixedAmount)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Cố định</div>
                        </div>
                    );
                } else {
                    return (
                        <div className="text-center">
                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                {record.percentage}%
                            </div>
                        </div>
                    );
                }
            },
        },
        {
            title: 'Thời gian',
            key: 'duration',
            width: 200,
            render: (_, record) => (
                <div className="py-1">
                    <div className="text-xs text-gray-500 mb-1">Bắt đầu</div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                        {formatDate(record.startDate)}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">Kết thúc</div>
                    <div className="text-sm font-medium text-gray-700">
                        {formatDate(record.endDate)}
                    </div>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            align: 'center',
            render: (_, record) => {
                const status = getPromotionStatus(record.startDate, record.endDate, record.isActive);

                const statusConfig = {
                    'active': {
                        color: 'success',
                        icon: <CheckCircleOutlined />,
                        text: 'Đang chạy'
                    },
                    'upcoming': {
                        color: 'processing',
                        icon: <ClockCircleOutlined />,
                        text: 'Sắp tới'
                    },
                    'expired': {
                        color: 'error',
                        icon: <StopOutlined />,
                        text: 'Hết hạn'
                    },
                    'inactive': {
                        color: 'default',
                        icon: <StopOutlined />,
                        text: 'Tạm dừng'
                    }
                };

                const config = statusConfig[status.status] || statusConfig.inactive;

                return (
                    <Tag
                        color={config.color}
                        icon={config.icon}
                        className="font-medium px-3 py-1"
                    >
                        {config.text}
                    </Tag>
                );
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 130,
            align: 'center',
            render: (date) => (
                <div className="text-center">
                    <div className="text-sm font-medium text-gray-700">
                        {formatDate(date)}
                    </div>
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 140,
            fixed: 'right',
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => onView && onView(record)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-0 rounded-lg"
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => onEdit && onEdit(record)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-0 rounded-lg"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa khuyến mãi">
                        <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => {
                                console.log('Delete button clicked!', record);
                                onDelete && onDelete(record);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-0 rounded-lg"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <ConfigProvider locale={viVN}>
        <Card
            title={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <Title level={4} className="m-0 text-gray-900">
                                Danh sách khuyến mãi
                            </Title>
                        </div>
                    </div>
                    {/* <div className="text-sm text-gray-500">
                        {promotions?.length || 0} khuyến mãi
                    </div> */}
                </div>
            }
            className="shadow-sm border border-gray-200 rounded-lg"
            bodyStyle={{ padding: 0 }}
        >
            <Table
                columns={columns}
                dataSource={promotions}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} khuyến mãi`,
                    pageSizeOptions: ['10', '20', '50'],
                    size: 'small'
                }}
                
                size="small"
                className="promotion-table"
                rowClassName="hover:bg-gray-50 transition-colors duration-150"
            />
        </Card>
        </ConfigProvider>
    );
}

export default PromotionTable;