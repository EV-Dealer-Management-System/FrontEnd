import React from 'react';
import { Form, Input, Button, Space, Divider } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import PasswordStrengthMeter from './PasswordStrengthMeter';

function PasswordForm({
    form,
    loading,
    newPassword,
    setNewPassword,
    onFinish,
    onReset,
    validatePassword,
    validateConfirmPassword
}) {
    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            size="large"
        >
            {/* Mật khẩu hiện tại */}
            <Form.Item
                name="currentPassword"
                label={<span style={{ fontWeight: '500', color: '#262626' }}>Mật khẩu hiện tại</span>}
                rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu hiện tại"
                    autoComplete="current-password"
                    style={{ borderRadius: '8px' }}
                />
            </Form.Item>

            <Divider />

            {/* Mật khẩu mới */}
            <Form.Item
                name="newPassword"
                label={<span style={{ fontWeight: '500', color: '#262626' }}>Mật khẩu mới</span>}
                rules={[
                    { validator: validatePassword }
                ]}
            >
                <div>
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Nhập mật khẩu mới"
                        autoComplete="new-password"
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ borderRadius: '8px' }}
                    />
                    <PasswordStrengthMeter password={newPassword} />
                </div>
            </Form.Item>

            {/* Xác nhận mật khẩu mới */}
            <Form.Item
                name="confirmNewPassword"
                label={<span style={{ fontWeight: '500', color: '#262626' }}>Xác nhận mật khẩu mới</span>}
                dependencies={['newPassword']}
                rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                    { validator: validateConfirmPassword }
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập lại mật khẩu mới"
                    autoComplete="new-password"
                    style={{ borderRadius: '8px' }}
                />
            </Form.Item>

            {/* Buttons */}
            <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button
                        size="large"
                        onClick={onReset}
                        disabled={loading}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        style={{
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(24, 144, 255, 0.3)'
                        }}
                    >
                        {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
}

export default PasswordForm;
