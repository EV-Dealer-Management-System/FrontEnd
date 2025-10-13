import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Space, Spin, Button, message } from 'antd';
import {
    FileTextOutlined,
    UserOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    DownloadOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    EditOutlined
} from '@ant-design/icons';
import { GetDealerContractByID } from '../../../../App/EVMAdmin/GetAllDealerContract/GetDealerContractByID';
import useContractSigning from '../../SignContract/useContractSigning';
import SignatureModal from '../../SignContract/Components/SignatureModal';
import SmartCAModal from '../../SignContract/Components/SmartCAModal';
import AppVerifyModal from '../../SignContract/Components/AppVerifyModal';

// Component hiển thị chi tiết hợp đồng trong modal
function ContractDetailModal({ visible, contractId, onClose }) {
    const [loading, setLoading] = useState(false);
    const [contractDetail, setContractDetail] = useState(null);

    // Hook quản lý ký hợp đồng
    const {
        showSignatureModal,
        setShowSignatureModal,
        signingLoading,
        signatureCompleted,
        showSmartCAModal,
        setShowSmartCAModal,
        showAppVerifyModal,
        setShowAppVerifyModal,
        handleSignature,
        handleAppVerification,
        resetSigningState
    } = useContractSigning();

    // Tải chi tiết hợp đồng khi modal mở
    useEffect(() => {
        const loadContractDetail = async () => {
            if (!visible || !contractId) return;

            setLoading(true);
            try {
                const result = await GetDealerContractByID.getDealerContractByID(contractId);
                console.log('API result:', result); // Debug log
                if (result) {
                    // API trả về result trực tiếp, không phải result.data
                    setContractDetail(result);
                } else {
                    message.error('Không thể tải chi tiết hợp đồng');
                }
            } catch (error) {
                console.error('Lỗi khi tải chi tiết hợp đồng:', error);
                message.error('Có lỗi xảy ra khi tải chi tiết hợp đồng');
            } finally {
                setLoading(false);
            }
        };

        loadContractDetail();
    }, [visible, contractId]);

    // Reset dữ liệu khi đóng modal
    useEffect(() => {
        if (!visible) {
            setContractDetail(null);
        }
    }, [visible]);

    // Định dạng trạng thái hợp đồng
    const getStatusConfig = (status) => {
        const configs = {
            1: { color: 'processing', icon: <ClockCircleOutlined />, text: 'Chờ xử lý' },
            2: { color: 'success', icon: <CheckCircleOutlined />, text: 'Sẵn sàng' },
            3: { color: 'success', icon: <CheckCircleOutlined />, text: 'Hoàn thành' },
            0: { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Hủy' },
        };
        return configs[status?.value] || { color: 'default', icon: null, text: 'Không xác định' };
    };

    // Xử lý tải xuống hợp đồng
    const handleDownload = () => {
        if (contractDetail?.downloadUrl) {
            window.open(contractDetail.downloadUrl, '_blank');
        }
    };

    // Kiểm tra xem có thể ký hợp đồng không
    const canSignContract = () => {
        return contractDetail?.status?.value === 2 && contractDetail?.waitingProcess?.status?.value === 1;
    };

    // Xử lý bắt đầu ký hợp đồng
    const handleStartSigning = () => {
        if (!contractDetail?.waitingProcess) {
            message.error('Không tìm thấy thông tin tiến trình ký hợp đồng');
            return;
        }
        setShowSignatureModal(true);
    };

    // Reset signing state khi đóng modal
    useEffect(() => {
        if (!visible) {
            resetSigningState();
        }
    }, [visible, resetSigningState]);

    // Reload contract detail sau khi ký thành công
    const handleContractSigned = () => {
        // Reload lại chi tiết hợp đồng để cập nhật trạng thái mới
        if (contractId) {
            const loadContractDetail = async () => {
                try {
                    const result = await GetDealerContractByID.getDealerContractByID(contractId);
                    if (result) {
                        setContractDetail(result);
                        message.success('Đã cập nhật trạng thái hợp đồng mới!');
                    }
                } catch (error) {
                    console.error('Lỗi khi reload hợp đồng:', error);
                }
            };
            loadContractDetail();
        }
    };

    if (!visible) return null;

    const status = contractDetail ? getStatusConfig(contractDetail.status) : null;

    return (
        <Modal
            title={
                <Space>
                    <FileTextOutlined className="text-blue-500" />
                    <span>Chi tiết hợp đồng</span>
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={
                <Space>
                    {contractDetail?.downloadUrl && (
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={handleDownload}
                        >
                            Tải xuống hợp đồng
                        </Button>
                    )}



                    {canSignContract() && (
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={handleStartSigning}
                            loading={signingLoading}
                        >
                            Ký hợp đồng
                        </Button>
                    )}

                    <Button onClick={onClose}>
                        Đóng
                    </Button>
                </Space>
            }
            width={800}
        >
            <Spin spinning={loading}>
                {contractDetail ? (
                    <Descriptions bordered column={1} className="mt-4">
                        <Descriptions.Item
                            label={
                                <Space>
                                    <FileTextOutlined />
                                    <span>ID hợp đồng</span>
                                </Space>
                            }
                        >
                            <span className="font-mono text-sm">{contractDetail.id || ''}</span>
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={
                                <Space>
                                    <FileTextOutlined />
                                    <span>Số hợp đồng</span>
                                </Space>
                            }
                        >
                            <span className="font-semibold text-blue-600">{contractDetail.no || ''}</span>
                        </Descriptions.Item>

                        <Descriptions.Item label="Chủ đề">
                            <span className="text-gray-700">{contractDetail.subject || ''}</span>
                        </Descriptions.Item>

                        <Descriptions.Item label="Trạng thái">
                            <Space direction="vertical" size="small">
                                {status && (
                                    <Tag color={status.color} icon={status.icon}>
                                        {status.text}
                                    </Tag>
                                )}
                                {canSignContract() && (
                                    <Tag color="green" icon={<EditOutlined />}>
                                        Có thể ký hợp đồng
                                    </Tag>
                                )}
                            </Space>
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={
                                <Space>
                                    <CalendarOutlined />
                                    <span>Ngày tạo</span>
                                </Space>
                            }
                        >
                            {contractDetail.createdDate ?
                                new Date(contractDetail.createdDate).toLocaleString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }) : 'Không có thông tin'
                            }
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={
                                <Space>
                                    <CalendarOutlined />
                                    <span>Ngày cập nhật cuối</span>
                                </Space>
                            }
                        >
                            {contractDetail.lastModifiedDate ?
                                new Date(contractDetail.lastModifiedDate).toLocaleString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }) : 'Không có thông tin'
                            }
                        </Descriptions.Item>

                        {contractDetail.completedDate && (
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <CheckCircleOutlined />
                                        <span>Ngày hoàn thành</span>
                                    </Space>
                                }
                            >
                                {new Date(contractDetail.completedDate).toLocaleString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </Descriptions.Item>
                        )}

                        {contractDetail.contractValue && (
                            <Descriptions.Item label="Giá trị hợp đồng">
                                <span className="text-green-600 font-semibold">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(contractDetail.contractValue)}
                                </span>
                            </Descriptions.Item>
                        )}

                        {contractDetail.customerCode && (
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <UserOutlined />
                                        <span>Mã khách hàng</span>
                                    </Space>
                                }
                            >
                                <span className="font-mono text-sm">{contractDetail.customerCode}</span>
                            </Descriptions.Item>
                        )}

                        {contractDetail.waitingProcess && (
                            <Descriptions.Item label="Tiến trình đang chờ">
                                <Space direction="vertical" size="small">
                                    <Tag color="processing">
                                        Bước {contractDetail.waitingProcess.orderNo} - {contractDetail.waitingProcess.status.description}
                                    </Tag>
                                    {/* <div className="text-sm text-gray-600">
                                        <span>Process ID: </span>
                                        <span className="font-mono text-xs">{contractDetail.waitingProcess.id}</span>
                                    </div> */}
                                    {/* <div className="text-sm text-gray-600">
                                        <span>Vị trí ký: {contractDetail.waitingProcess.position} (Trang {contractDetail.waitingProcess.pageSign})</span>
                                    </div> */}
                                </Space>
                            </Descriptions.Item>
                        )}

                        {contractDetail.processes && contractDetail.processes.length > 0 && (
                            <Descriptions.Item label="Các bước xử lý">
                                <Space direction="vertical" size="small" className="w-full">
                                    {contractDetail.processes.map((process) => (
                                        <div key={process.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <span>Bước {process.orderNo}: {process.accessPermission.description}</span>
                                            <Tag color={process.status.value === 1 ? 'processing' : 'success'}>
                                                {process.status.description}
                                            </Tag>
                                        </div>
                                    ))}
                                </Space>
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        Không có dữ liệu hợp đồng
                    </div>
                )}
            </Spin>

            {/* Modal ký hợp đồng */}
            <SignatureModal
                visible={showSignatureModal}
                onCancel={() => setShowSignatureModal(false)}
                onSign={(signatureData, signatureDisplayMode) =>
                    handleSignature(
                        signatureData,
                        signatureDisplayMode,
                        contractDetail?.waitingProcess?.id,
                        contractDetail?.waitingProcess,
                        contractDetail?.downloadUrl,
                        contractDetail?.waitingProcess?.position,
                        contractDetail?.waitingProcess?.pageSign
                    )
                }
                loading={signingLoading}
            />

            {/* Modal SmartCA */}
            <SmartCAModal
                visible={showSmartCAModal}
                onCancel={() => setShowSmartCAModal(false)}
                contractNo={contractDetail?.no}
            />

            {/* Modal xác thực ứng dụng */}
            <AppVerifyModal
                visible={showAppVerifyModal}
                onCancel={() => setShowAppVerifyModal(false)}
                onVerify={() => {
                    handleAppVerification(contractDetail?.no);
                    handleContractSigned();
                }}
                loading={signingLoading}
                signatureCompleted={signatureCompleted}
            />

        </Modal>
    );
}

export default ContractDetailModal;
