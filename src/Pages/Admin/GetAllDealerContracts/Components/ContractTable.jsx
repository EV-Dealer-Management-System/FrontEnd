import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Tooltip, message } from 'antd';
import { EyeOutlined, FileTextOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { GetAllDealerContract } from '../../../../App/EVMAdmin/DealerContract/GetAllDealerContract';

// Component hiển thị bảng danh sách hợp đồng sẵn sàng (status = 2)
function ContractTable({ onView }) {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Tải danh sách hợp đồng sẵn sàng từ API
    const loadContracts = async () => {
        setLoading(true);
        try {
            // Chỉ lấy hợp đồng có status = 2 (Sẵn sàng)
            const contractList = await GetAllDealerContract.getAllDealerContracts(1, 1000, 2);
            setContracts(contractList);
            console.log('Đã tải danh sách hợp đồng sẵn sàng:', contractList.length);
        } catch (error) {
            console.error('Lỗi khi tải danh sách hợp đồng:', error);
            message.error('Không thể tải danh sách hợp đồng');
        } finally {
            setLoading(false);
        }
    };

    // Load danh sách hợp đồng khi component mount
    useEffect(() => {
        loadContracts();
    }, []);

    // Cấu hình các cột cho bảng
    const columns = [
        {
            title: 'Số hợp đồng',
            dataIndex: 'id',
            key: 'id',
            width: 250,
            render: (contractId) => (
                <Tooltip title={contractId}>
                    <Space>
                        <FileTextOutlined className="text-blue-500" />
                        <span className="font-mono text-xs">{String(contractId).slice(0, 8)}...</span>
                    </Space>
                </Tooltip>
            ),
        },
        {
            title: 'Tên hợp đồng',
            dataIndex: 'name',
            key: 'name',
            width: 300,
            render: (name) => (
                <span className="text-gray-700 font-medium">{name}</span>
            ),
        },
        {
            title: 'Template ID',
            dataIndex: 'templateId',
            key: 'templateId',
            width: 200,
            render: (templateId) => (
                <Tooltip title={templateId}>
                    <span className="font-mono text-xs text-gray-500">
                        {String(templateId).slice(0, 8)}...
                    </span>
                </Tooltip>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status) => (
                <Tag color="cyan" icon={<CheckCircleOutlined />}>
                    Sẵn sàng
                </Tag>
            ),
        },
        {
            title: 'Người tạo',
            dataIndex: 'createdBy',
            key: 'createdBy',
            width: 200,
            render: (createdBy) => (
                <Tooltip title={createdBy}>
                    <span className="font-mono text-xs text-gray-600">
                        {String(createdBy).slice(0, 8)}...
                    </span>
                </Tooltip>
            ),
        },
        {
            title: 'Chủ sở hữu',
            dataIndex: 'ownerBy',
            key: 'ownerBy',
            width: 200,
            render: (ownerBy) => (
                <Tooltip title={ownerBy}>
                    <span className="font-mono text-xs text-gray-600">
                        {String(ownerBy).slice(0, 8)}...
                    </span>
                </Tooltip>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (date) => {
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
            title: 'Storage URL',
            dataIndex: 'storageUrl',
            key: 'storageUrl',
            width: 120,
            render: (storageUrl) => (
                <Tag color={storageUrl ? 'green' : 'default'}>
                    {storageUrl ? 'Có file' : 'Chưa có'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small" direction="vertical">
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => onView(record)}
                        block
                    >
                        Xem chi tiết
                    </Button>

                    {record.storageUrl && (
                        <Button
                            size="small"
                            onClick={() => window.open(record.storageUrl, '_blank')}
                            block
                        >
                            Tải xuống
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="mb-4 px-4 py-2 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                    <CheckCircleOutlined className="mr-2 text-green-500" />
                    Hợp đồng sẵn sàng ký
                </h3>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={loadContracts}
                    loading={loading}
                >
                    Tải lại
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={contracts}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 1000,
                    showSizeChanger: false,
                    showQuickJumper: true,
                    showTotal: (total) => `Tổng ${total} hợp đồng sẵn sàng`,
                }}
                scroll={{ x: 1600 }}
                bordered
                size="middle"
                className="shadow-sm"
            />
        </div>
    );
}

export default ContractTable;
