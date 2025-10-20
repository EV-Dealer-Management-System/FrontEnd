import React from 'react';
import { Modal, Result, Button } from 'antd';
import { CheckCircleOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';

function SuccessModal({ visible, onClose, onViewList, onCreateAnother, promotionName }) {
    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            centered
            width={500}
            className="success-modal"
        >
            <Result
                icon={<CheckCircleOutlined className="text-green-500" />}
                status="success"
                title={
                    <span className="text-xl font-semibold text-gray-800">
                        Tạo khuyến mãi thành công!
                    </span>
                }
                subTitle={
                    <div className="text-gray-600">
                        <p className="mb-2">
                            Khuyến mãi <strong className="text-blue-600">"{promotionName}"</strong> đã được tạo thành công.
                        </p>
                        <p>
                            Bạn có thể xem danh sách khuyến mãi hoặc tiếp tục tạo khuyến mãi mới.
                        </p>
                    </div>
                }
                extra={[
                    <div key="actions" className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={onViewList}
                            className="bg-blue-500 hover:bg-blue-600 px-6"
                        >
                            Xem danh sách khuyến mãi
                        </Button>
                        <Button
                            icon={<PlusOutlined />}
                            onClick={onCreateAnother}
                            className="px-6"
                        >
                            Tạo khuyến mãi khác
                        </Button>
                    </div>
                ]}
            />
        </Modal>
    );
}

export default SuccessModal;