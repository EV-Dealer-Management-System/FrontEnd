import React from 'react';
import { Modal, Descriptions, Tag, Space } from 'antd';
import {
    FileTextOutlined,
    UserOutlined,
    CalendarOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

// Component hiển thị chi tiết hợp đồng trong modal
function ContractDetailModal({ visible, contract, onClose }) {
    if (!contract) return null;

    // Định dạng trạng thái
    const statusConfig = {
        1: { color: 'success', icon: <CheckCircleOutlined />, text: 'Hoạt động' },
        0: { color: 'default', icon: null, text: 'Không hoạt động' },
    };
    const status = statusConfig[contract.status] || statusConfig[0];

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
            footer={null}
            width={700}
        >
            <Descriptions bordered column={1} className="mt-4">
                <Descriptions.Item
                    label={
                        <Space>
                            <FileTextOutlined />
                            <span>Mã hợp đồng</span>
                        </Space>
                    }
                >
                    <span className="font-mono text-sm">{String(contract.id || '')}</span>
                </Descriptions.Item>

                <Descriptions.Item
                    label={
                        <Space>
                            <FileTextOutlined />
                            <span>Mã Template</span>
                        </Space>
                    }
                >
                    <span className="font-mono text-sm">{String(contract.templateId || '')}</span>
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái">
                    <Tag color={status.color} icon={status.icon}>
                        {status.text}
                    </Tag>
                </Descriptions.Item>

                <Descriptions.Item
                    label={
                        <Space>
                            <CalendarOutlined />
                            <span>Ngày tạo</span>
                        </Space>
                    }
                >
                    {new Date(contract.createdAt).toLocaleString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    })}
                </Descriptions.Item>

                <Descriptions.Item
                    label={
                        <Space>
                            <UserOutlined />
                            <span>Người tạo</span>
                        </Space>
                    }
                >
                    <span className="font-mono text-sm">{String(contract.createdBy || '')}</span>
                </Descriptions.Item>

                <Descriptions.Item
                    label={
                        <Space>
                            <UserOutlined />
                            <span>Chủ sở hữu (Đại lý)</span>
                        </Space>
                    }
                >
                    <span className="font-mono text-sm">{String(contract.ownerBy || '')}</span>
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
}

export default ContractDetailModal;
