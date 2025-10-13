import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Tooltip, Spin, Progress } from 'antd';
import { EyeOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { GetDealerContractByID } from '../../../../App/EVMAdmin/GetAllDealerContract/GetDealerContractByID';

// Component hiển thị bảng danh sách hợp đồng
function ContractTable({ contracts, loading, onView }) {
    const [contractStatuses, setContractStatuses] = useState({});
    const [statusLoading, setStatusLoading] = useState({});

    // Lấy trạng thái chi tiết của hợp đồng
    const loadContractStatus = async (contractId) => {
        if (contractStatuses[contractId] || statusLoading[contractId]) return;

        setStatusLoading(prev => ({ ...prev, [contractId]: true }));

        try {
            const contractDetail = await GetDealerContractByID.getDealerContractByID(contractId);
            if (contractDetail) {
                setContractStatuses(prev => ({
                    ...prev,
                    [contractId]: {
                        id: contractDetail.id,
                        no: contractDetail.no,
                        subject: contractDetail.subject,
                        status: contractDetail.status,
                        waitingProcess: contractDetail.waitingProcess,
                        processes: contractDetail.processes || [],
                        contractValue: contractDetail.contractValue,
                        completedDate: contractDetail.completedDate,
                        downloadUrl: contractDetail.downloadUrl
                    }
                }));
            }
        } catch (error) {
            console.error('Lỗi khi tải trạng thái hợp đồng:', error);
        } finally {
            setStatusLoading(prev => ({ ...prev, [contractId]: false }));
        }
    };

    // Load status cho tất cả contracts khi component mount
    useEffect(() => {
        if (contracts && contracts.length > 0) {
            contracts.forEach(contract => {
                if (contract.id && !contractStatuses[contract.id]) {
                    loadContractStatus(contract.id);
                }
            });
        }
    }, [contracts]);

    // Định dạng trạng thái hợp đồng chi tiết
    const getDetailedStatusConfig = (contractId) => {
        const statusDetail = contractStatuses[contractId];

        if (!statusDetail) {
            return {
                color: 'default',
                icon: <ClockCircleOutlined />,
                text: 'Đang tải...',
                canSign: false
            };
        }

        const { status, waitingProcess } = statusDetail;

        // Kiểm tra có thể ký hợp đồng không - status = 2 (Ready) và có waitingProcess với status = 1 (Waiting)
        const canSign = status?.value === 2 && waitingProcess?.status?.value === 1;

        const configs = {
            1: {
                color: 'processing',
                icon: <ClockCircleOutlined />,
                text: 'Chờ xử lý',
                canSign: false
            },
            2: {
                color: 'cyan',
                icon: <CheckCircleOutlined />,
                text: canSign ? 'Sẵn sàng ký' : 'Sẵn sàng',
                canSign
            },
            3: {
                color: 'success',
                icon: <CheckCircleOutlined />,
                text: 'Hoàn thành',
                canSign: false
            },
            0: {
                color: 'error',
                icon: <ExclamationCircleOutlined />,
                text: 'Hủy',
                canSign: false
            },
        };

        return configs[status?.value] || {
            color: 'default',
            icon: null,
            text: 'Không xác định',
            canSign: false
        };
    };

    // Tính tiến độ ký hợp đồng
    const getSigningProgress = (contractId) => {
        const statusDetail = contractStatuses[contractId];
        if (!statusDetail?.processes || statusDetail.processes.length === 0) {
            return { percent: 0, completed: 0, total: 0 };
        }

        const total = statusDetail.processes.length;
        const completed = statusDetail.processes.filter(p => p.status?.value !== 1).length;
        const percent = Math.round((completed / total) * 100);

        return { percent, completed, total };
    };

    // Cấu hình các cột cho bảng
    const columns = [
        {
            title: 'Số hợp đồng',
            dataIndex: 'id',
            key: 'id',
            width: 200,
            ellipsis: true,
            render: (contractId) => {
                const statusDetail = contractStatuses[contractId];
                const contractNo = statusDetail?.no;

                if (contractNo) {
                    return (
                        <Space direction="vertical" size="small">
                            <Space>
                                <FileTextOutlined className="text-blue-500" />
                                <span className="font-semibold text-blue-600">{contractNo}</span>
                            </Space>
                            <span className="font-mono text-xs text-gray-500">
                                {String(contractId).slice(0, 8)}...
                            </span>
                        </Space>
                    );
                }

                return (
                    <Tooltip title={contractId}>
                        <Space>
                            <FileTextOutlined className="text-blue-500" />
                            <span className="font-mono text-xs">{String(contractId).slice(0, 8)}...</span>
                        </Space>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Chủ đề hợp đồng',
            dataIndex: 'id',
            key: 'subject',
            width: 200,
            render: (contractId) => {
                const statusDetail = contractStatuses[contractId];
                const subject = statusDetail?.subject;

                return (
                    <span className="text-gray-700">
                        {subject || 'Đang tải...'}
                    </span>
                );
            },
        },
        {
            title: 'Trạng thái hệ thống',
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
            title: 'Trạng thái hợp đồng',
            dataIndex: 'id',
            key: 'contractStatus',
            width: 280,
            render: (contractId) => {
                const isLoading = statusLoading[contractId];
                const statusConfig = getDetailedStatusConfig(contractId);
                const statusDetail = contractStatuses[contractId];
                const progress = getSigningProgress(contractId);

                if (isLoading) {
                    return (
                        <Space>
                            <Spin size="small" />
                            <span className="text-gray-500">Đang tải...</span>
                        </Space>
                    );
                }

                return (
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        {/* Trạng thái chính */}
                        <Tag
                            color={statusConfig.color}
                            icon={statusConfig.icon}
                            className={statusConfig.canSign ? 'animate-pulse' : ''}
                        >
                            {statusConfig.text}
                        </Tag>

                        {/* Thông tin bước ký đang chờ */}
                        {statusDetail?.waitingProcess && (
                            <div className="text-xs bg-blue-50 p-2 rounded border-l-2 border-blue-300">
                                {/* <div className="font-medium text-blue-700">
                                    Bước {statusDetail.waitingProcess.orderNo}: {statusDetail.waitingProcess.accessPermission?.description}
                                </div>
                                <div className="text-gray-600 mt-1">
                                    Trang {statusDetail.waitingProcess.pageSign} - Vị trí: {statusDetail.waitingProcess.position}
                                </div> */}
                                <div className="text-gray-600">
                                    Trạng thái: {statusDetail.waitingProcess.status?.description}
                                </div>
                            </div>
                        )}

                        {/* Tiến độ ký hợp đồng */}
                        {progress.total > 0 && (
                            <div className="w-full">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-gray-600">Tiến độ ký:</span>
                                    <span className="text-xs font-medium">{progress.completed}/{progress.total}</span>
                                </div>
                                <Progress
                                    percent={progress.percent}
                                    size="small"
                                    status={progress.percent === 100 ? 'success' : 'active'}
                                    showInfo={false}
                                />
                            </div>
                        )}

                        {/* Indicator cho hợp đồng có thể ký */}
                        {statusConfig.canSign && (
                            <Tag color="green" icon={<EditOutlined />} size="small">
                                Có thể ký ngay
                            </Tag>
                        )}

                        {/* Hiển thị ngày hoàn thành nếu có */}
                        {statusDetail?.completedDate && (
                            <div className="text-xs text-green-600">
                                Hoàn thành: {new Date(statusDetail.completedDate).toLocaleDateString('vi-VN')}
                            </div>
                        )}
                    </Space>
                );
            },
        },
        {
            title: 'Người xử lý',
            dataIndex: 'id',
            key: 'processedBy',
            width: 150,
            render: (contractId) => {
                const statusDetail = contractStatuses[contractId];
                const waitingProcess = statusDetail?.waitingProcess;

                if (waitingProcess?.processedByUserId) {
                    return (
                        <Space>
                            <UserOutlined className="text-gray-500" />
                            <span className="text-xs">
                                User ID: {waitingProcess.processedByUserId}
                            </span>
                        </Space>
                    );
                }

                return <span className="text-gray-400">-</span>;
            },
        },
        {
            title: 'Giá trị hợp đồng',
            dataIndex: 'id',
            key: 'contractValue',
            width: 150,
            render: (contractId) => {
                const statusDetail = contractStatuses[contractId];
                const contractValue = statusDetail?.contractValue;

                if (contractValue) {
                    return (
                        <span className="text-green-600 font-semibold">
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(contractValue)}
                        </span>
                    );
                }

                return <span className="text-gray-400">Chưa có</span>;
            },
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
            render: (_, record) => {
                const statusDetail = contractStatuses[record.id];

                return (
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

                        {/* Nút tải xuống nếu có URL */}
                        {statusDetail?.downloadUrl && (
                            <Button
                                size="small"
                                onClick={() => window.open(statusDetail.downloadUrl, '_blank')}
                                block
                            >
                                Tải xuống
                            </Button>
                        )}
                    </Space>
                );
            },
        },
    ];
    // Lọc chỉ hiển thị hợp đồng có status = 2
    const getReadyContracts = () => {
        if (!contracts) return [];

        return contracts.filter(contract => {
            const statusDetail = contractStatuses[contract.id];
            return statusDetail?.status?.value === 2;
        });
    };

    return (
        <div>
            <div className="mb-4 px-4 py-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                    <FileTextOutlined className="mr-2 text-blue-500" />
                    Danh sách hợp đồng sẵn sàng
                </h3>
            </div>
            <Table
                columns={columns}
                dataSource={getReadyContracts()}
                rowKey="id"
                loading={loading}
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `Tổng ${total} hợp đồng sẵn sàng`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }}
                scroll={{ x: 1800 }}
                bordered
                size="middle"
                rowClassName={(record) => {
                    const statusConfig = getDetailedStatusConfig(record.id);
                    return statusConfig.canSign ? 'bg-green-50' : '';
                }}
            />
        </div>
    );
}

export default ContractTable;
