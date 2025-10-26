import React from 'react';
import { Modal, Typography, Space, Tag } from 'antd';
import {
    ExclamationCircleOutlined,
    GiftOutlined,
    CalendarOutlined,
    DeleteOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

function DeleteConfirmModal({
    visible,
    onCancel,
    onConfirm,
    promotionData,
    loading = false,
    formatDate,
    formatCurrency
}) {
    if (!promotionData) return null;

    return (
        <Modal
            title={
                <div className="flex items-center gap-3 text-red-600">
                    <ExclamationCircleOutlined className="text-xl" />
                    <span className="text-lg font-semibold">Xác nhận xóa khuyến mãi</span>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            onOk={onConfirm}
            okText="Xóa khuyến mãi"
            cancelText="Hủy bỏ"
            okType="danger"
            confirmLoading={loading}
            width={500}
            className="delete-confirm-modal"
            maskClosable={false}
        >
            <div className="py-4">
                {/* Warning Message */}
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <div>
                            <Text className="text-red-800 font-medium block mb-1">
                                Cảnh báo: Hành động này không thể hoàn tác!
                            </Text>
                            <Text className="text-red-600 text-sm">
                                Khuyến mãi sẽ bị xóa vĩnh viễn khỏi hệ thống.
                            </Text>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Text className="text-gray-700 font-medium">
                        Bạn có chắc chắn muốn xóa khuyến mãi này không?
                    </Text>
                </div>
            </div>
        </Modal>
    );
}

export default DeleteConfirmModal;