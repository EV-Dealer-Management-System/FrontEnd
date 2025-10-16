import React from 'react';
import { Modal, Space, Typography } from 'antd';
import { CheckCircleOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function SuccessModal({
    open,
    onClose,
    email
}) {
    return (
        <Modal
            title={
                <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <span>Gửi email thành công</span>
                </Space>
            }
            open={open}
            onOk={onClose}
            onCancel={onClose}
            okText="Đóng"
            cancelButtonProps={{ style: { display: 'none' } }}
            centered
            width={480}
            okButtonProps={{
                style: {
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    borderColor: '#1890ff',
                    borderRadius: '6px'
                }
            }}
        >
            <div style={{
                padding: '24px 0',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '16px' }}>
                    <MailOutlined
                        style={{
                            fontSize: '48px',
                            color: '#1890ff',
                            marginBottom: '16px'
                        }}
                    />
                </div>

                <Title level={4} style={{ color: '#262626', marginBottom: '8px' }}>
                    Email đã được gửi!
                </Title>

                <Text style={{
                    fontSize: '16px',
                    color: '#595959',
                    display: 'block',
                    marginBottom: '16px'
                }}>
                    Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến:
                </Text>

                <Text
                    strong
                    style={{
                        fontSize: '16px',
                        color: '#1890ff',
                        display: 'block',
                        marginBottom: '16px'
                    }}
                >
                    {email}
                </Text>

                <div style={{
                    background: '#e6f7ff',
                    border: '1px solid #91d5ff',
                    borderRadius: '6px',
                    padding: '12px',
                    marginTop: '16px'
                }}>
                    <Text style={{
                        fontSize: '14px',
                        color: '#595959',
                        lineHeight: '1.5'
                    }}>
                        💡 <strong>Lưu ý:</strong> Vui lòng kiểm tra hộp thư đến và thư mục spam.
                        Link đặt lại mật khẩu có hiệu lực trong 15 phút.
                    </Text>
                </div>
            </div>
        </Modal>
    );
}

export default SuccessModal;