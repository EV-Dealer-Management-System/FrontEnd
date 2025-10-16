import React from 'react';
import { Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';

const { Title } = Typography;

function SecurityRequirements() {
    return (
        <div style={{
            background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)',
            padding: '16px',
            borderRadius: '8px',
            borderLeft: '4px solid #1890ff',
            marginBottom: '24px'
        }}>
            <Title level={5} style={{ marginBottom: '8px', color: '#262626' }}>
                <LockOutlined style={{ marginRight: '8px' }} />
                Yêu cầu mật khẩu mạnh:
            </Title>
            <ul style={{ margin: '0', paddingLeft: '16px', color: '#6c757d', fontSize: '13px' }}>
                <li>• Ít nhất 8 ký tự</li>
                <li>• Có ít nhất 1 chữ thường (a-z)</li>
                <li>• Có ít nhất 1 chữ hoa (A-Z)</li>
                <li>• Có ít nhất 1 chữ số (0-9)</li>
                <li>• Không sử dụng thông tin cá nhân dễ đoán</li>
            </ul>
        </div>
    );
}

export default SecurityRequirements;
