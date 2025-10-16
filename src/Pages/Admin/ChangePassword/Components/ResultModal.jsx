import React from 'react';
import { Modal, Space } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

function ResultModal({
    open,
    type,
    message,
    onClose
}) {
    return (
        <Modal
            title={
                <Space>
                    {type === 'success' ?
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} /> :
                        <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
                    }
                    <span>{type === 'success' ? 'Thành công' : 'Lỗi'}</span>
                </Space>
            }
            open={open}
            onOk={onClose}
            onCancel={onClose}
            okText="Đóng"
            cancelButtonProps={{ style: { display: 'none' } }}
            centered
            width={450}
            okButtonProps={{
                style: {
                    background: type === 'success' ? '#52c41a' : '#ff4d4f',
                    borderColor: type === 'success' ? '#52c41a' : '#ff4d4f',
                    borderRadius: '6px'
                }
            }}
        >
            <div style={{ padding: '16px 0' }}>
                <p style={{
                    fontSize: '16px',
                    color: '#262626',
                    margin: 0,
                    lineHeight: '1.5'
                }}>
                    {message}
                </p>
                {type === 'success' && (
                    <p style={{
                        fontSize: '14px',
                        color: '#8c8c8c',
                        margin: '12px 0 0 0',
                        lineHeight: '1.4'
                    }}>
                        Vui lòng sử dụng mật khẩu mới cho lần đăng nhập tiếp theo.
                    </p>
                )}
            </div>
        </Modal>
    );
}

export default ResultModal;