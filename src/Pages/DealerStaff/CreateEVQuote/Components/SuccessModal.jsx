import React from 'react';
import { Modal, Result, Button, Space, Typography } from 'antd';
import {
    CheckCircleOutlined,
    FileTextOutlined,
    CarOutlined
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

function SuccessModal({
    visible,
    onClose,
    onViewQuotes,
    onCreateNew,
    quoteData
}) {
    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
            centered
            destroyOnClose
            className="success-modal"
        >
            <Result
                icon={
                    <div className="text-6xl">
                        <CheckCircleOutlined className="text-green-500" />
                    </div>
                }
                title={
                    <div className="text-2xl font-bold text-gray-800 mb-2">
                        Tạo báo giá thành công!
                    </div>
                }
                subTitle={
                    <div className="space-y-4">
                        <Paragraph className="text-gray-600 text-base">
                            Báo giá xe điện đã được tạo và lưu vào hệ thống thành công.
                        </Paragraph>

                        {quoteData && (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CarOutlined className="text-green-600" />
                                        <Text strong className="text-green-800">
                                            Thông tin báo giá:
                                        </Text>
                                    </div>

                                    <div className="ml-6 space-y-1">
                                        <div className="flex justify-between">
                                            <Text>Xe điện:</Text>
                                            <Text strong>{quoteData.vehicleName}</Text>
                                        </div>
                                        <div className="flex justify-between">
                                            <Text>Màu sắc:</Text>
                                            <Text strong>{quoteData.colorName}</Text>
                                        </div>
                                        <div className="flex justify-between">
                                            <Text>Số lượng:</Text>
                                            <Text strong>{quoteData.quantity} xe</Text>
                                        </div>
                                        {quoteData.promotionName && (
                                            <div className="flex justify-between">
                                                <Text>Khuyến mãi:</Text>
                                                <Text strong className="text-orange-600">
                                                    {quoteData.promotionName}
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                }
                extra={
                    <div className="flex justify-center mt-6">
                        <Space size="large">
                            <Button
                                size="large"
                                icon={<FileTextOutlined />}
                                onClick={onViewQuotes}
                                className="min-w-[160px] h-12"
                            >
                                Xem danh sách báo giá
                            </Button>

                            <Button
                                type="primary"
                                size="large"
                                icon={<CarOutlined />}
                                onClick={onCreateNew}
                                className="min-w-[160px] h-12 bg-gradient-to-r from-blue-500 to-green-500 border-0"
                            >
                                Tạo báo giá mới
                            </Button>
                        </Space>
                    </div>
                }
            />
        </Modal>
    );
}

export default SuccessModal;