import React from "react";
import { Modal, Button, Result } from "antd";
import { MailOutlined, CheckCircleOutlined } from "@ant-design/icons";

function EContractSuccessModal({ visible, onClose }) {
    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={500}
            centered
            closable={false}
        >
            <Result
                status="success"
                icon={
                    <div className="flex justify-center">
                        <CheckCircleOutlined className="text-green-500 text-6xl" />
                    </div>
                }
                title={
                    <div className="text-xl font-semibold mt-4">
                        Tạo E-Contract Thành Công!
                    </div>
                }
                subTitle={
                    <div className="text-center mt-4 space-y-3">
                        <div className="flex items-center justify-center gap-2 text-lg">
                            <MailOutlined className="text-blue-500 text-2xl" />
                            <span className="font-medium text-gray-700">
                                Vui lòng kiểm tra email
                            </span>
                        </div>
                        <p className="text-gray-600 text-base">
                            Hợp đồng xác nhận booking đã được gửi đến email của bạn.
                            <br />
                            Vui lòng kiểm tra hộp thư và thực hiện ký điện tử.
                        </p>
                    </div>
                }
                extra={[
                    <Button
                        type="primary"
                        size="large"
                        onClick={onClose}
                        className="mt-4"
                        style={{
                            height: 48,
                            minWidth: 120,
                            borderRadius: 6,
                            fontWeight: 600,
                        }}
                    >
                        Đã hiểu
                    </Button>,
                ]}
            />
        </Modal>
    );
}

export default EContractSuccessModal;
