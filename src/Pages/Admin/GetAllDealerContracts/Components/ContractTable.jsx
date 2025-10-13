import React from 'react';
import { Table, Tag, Space, Button, Tooltip } from 'antd';
import { EyeOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';

// Component hiển thị bảng danh sách hợp đồng
function ContractTable({ contracts, loading, onView }) {
    // Cấu hình các cột cho bảng
    const columns = [
        {
            title: 'Mã hợp đồng',
            dataIndex: 'id',
            key: 'id',
            width: 250,
            ellipsis: true,
            render: (text) => {
                const idStr = String(text || '');
                return (
                    <Tooltip title={idStr}>
                        <Space>
                            <FileTextOutlined className="text-blue-500" />
                            <span className="font-mono text-xs">{idStr.slice(0, 8)}...</span>
                        </Space>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Mã Template',
            dataIndex: 'templateId',
            key: 'templateId',
            width: 250,
            ellipsis: true,
            render: (text) => {
                const templateStr = String(text || '');
                return (
                    <span className="font-mono text-xs text-gray-600">{templateStr.slice(0, 8)}...</span>
                );
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            filters: [
                { text: 'Chứng từ mới', value: 1 },
                { text: 'Sẵn sàng', value: 2 },
                { text: 'Đang xử lý', value: 3 },
                { text: 'Đã hoàn tất', value: 4 },
                { text: 'Đang hiệu chỉnh', value: 5 },
                { text: 'Đã hủy', value: -3 },
                { text: 'Đã xóa', value: -2 },
                { text: 'Đã bị từ chối', value: -1 },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => {
                // Hiển thị trạng thái chứng từ
                const statusConfig = {
                    1: { color: 'blue', icon: <FileTextOutlined />, text: 'Chứng từ mới' },
                    2: { color: 'cyan', icon: <CheckCircleOutlined />, text: 'Sẵn sàng' },
                    3: { color: 'processing', icon: null, text: 'Đang xử lý' },
                    4: { color: 'success', icon: <CheckCircleOutlined />, text: 'Đã hoàn tất' },
                    5: { color: 'warning', icon: null, text: 'Đang hiệu chỉnh' },
                    '-3': { color: 'default', icon: null, text: 'Đã hủy' },
                    '-2': { color: 'default', icon: null, text: 'Đã xóa' },
                    '-1': { color: 'error', icon: null, text: 'Đã bị từ chối' },
                };
                const config = statusConfig[status] || { color: 'default', icon: null, text: 'Không xác định' };
                return (
                    <Tag color={config.color} icon={config.icon}>
                        {config.text}
                    </Tag>
                );
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (date) => {
                // Định dạng ngày tháng
                return new Date(date).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                });
            },
        },
        {
            title: 'Người tạo',
            dataIndex: 'createdBy',
            key: 'createdBy',
            width: 200,
            ellipsis: true,
            render: (text) => {
                const createdByStr = String(text || '');
                return (
                    <span className="font-mono text-xs text-gray-600">{createdByStr.slice(0, 8)}...</span>
                );
            },
        },
        {
            title: 'Chủ sở hữu',
            dataIndex: 'ownerBy',
            key: 'ownerBy',
            width: 200,
            ellipsis: true,
            render: (text) => {
                const ownerByStr = String(text || '');
                return (
                    <span className="font-mono text-xs text-gray-600">{ownerByStr.slice(0, 8)}...</span>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => onView(record)}
                        >
                            Xem
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="mb-4 px-4 py-2 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700">Danh sách hợp đồng đại lý</h3>
            </div>
            <Table
                columns={columns}
                dataSource={contracts}
                rowKey="id"
                loading={loading}
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `Tổng ${total} hợp đồng`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }}
                scroll={{ x: 1400 }}
                bordered
                size="middle"
            />
        </div>
    );
}

export default ContractTable;
