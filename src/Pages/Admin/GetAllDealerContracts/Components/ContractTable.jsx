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
            title: 'Tên hợp đồng',
            dataIndex: 'name',
            key: 'name',
            width: 300,
            render: (name) => (
                <span className="text-gray-700 font-medium">{name}</span>
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
            dataIndex: 'createdName',
            key: 'createdName',
            width: 200,
            render: (createdName) => (
                <Tooltip title={createdName}>
                    <span className="font-mono text-xs text-gray-600">
                        {String(createdName)}
                    </span>
                </Tooltip>
            ),
        },
        {
            title: 'Chủ sở hữu',
            dataIndex: 'ownerName',
            key: 'ownerName',
            width: 200,
            render: (ownerName) => (
                <Tooltip title={ownerName}>
                    <span className="font-mono text-xs text-gray-600">
                        {String(ownerName)}...
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
            <style>
                {`
                .contract-table .ant-table {
                    table-layout: auto !important;
                    width: 100%;
                }
                .contract-table .ant-table-cell {
                    white-space: normal !important;
                    word-break: break-word !important;
                    text-overflow: ellipsis;
                }
                .contract-table {
                    overflow-x: auto;
                }
                `}
            </style>
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
            <div className="contract-table" >
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
                bordered
                size="middle"
                className="shadow-sm"
            />
            </div>
        </div>
    );
}

export default ContractTable;
