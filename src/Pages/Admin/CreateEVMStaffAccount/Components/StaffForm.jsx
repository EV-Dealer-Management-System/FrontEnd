import React from 'react';
import { Card, Space, Typography, Alert } from 'antd';
import {
    ProForm,
    ProFormText,
} from '@ant-design/pro-components';
import {
    UserAddOutlined,
    MailOutlined,
    PhoneOutlined,
    UserOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

// Component form tạo tài khoản EVM Staff
function StaffForm({ formRef, onFinish, loading }) {
    return (
        <Card
            className="shadow-md rounded-lg max-w-4xl mx-auto border-0"
            bodyStyle={{ padding: '32px' }}
        >
            <div className="mb-6">
                <Space align="center" size="middle">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                        <UserAddOutlined className="text-2xl text-blue-600" />
                    </div>
                    <div>
                        <Text className="text-xl font-semibold text-gray-800">
                            Thông tin tài khoản
                        </Text>
                        <div className="text-sm text-gray-500 mt-1">
                            Điền đầy đủ thông tin để tạo tài khoản EVM Staff mới
                        </div>
                    </div>
                </Space>
            </div>

            <ProForm
                form={formRef}
                onFinish={onFinish}
                submitter={{
                    searchConfig: {
                        submitText: 'Tạo tài khoản',
                        resetText: 'Đặt lại',
                    },
                    submitButtonProps: {
                        loading: loading,
                        size: 'large',
                        icon: <UserAddOutlined />,
                        className: 'bg-blue-600 hover:bg-blue-700 border-0 h-11 px-8 rounded-lg font-medium',
                    },
                    resetButtonProps: {
                        size: 'large',
                        className: 'h-11 px-8 rounded-lg font-medium',
                    },
                    render: (props, doms) => {
                        return (
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                                {doms.reverse()}
                            </div>
                        );
                    },
                }}
                layout="vertical"
            >
                <div className="grid grid-cols-1 gap-6">
                    {/* Họ và tên */}
                    <ProFormText
                        name="fullName"
                        label={
                            <Text className="text-base font-medium text-gray-700">
                                Họ và tên đầy đủ
                            </Text>
                        }
                        placeholder="Nhập họ và tên đầy đủ (VD: Nguyễn Văn A)"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập họ và tên!'
                            },
                            {
                                min: 3,
                                message: 'Họ và tên phải có ít nhất 3 ký tự!'
                            },
                            {
                                max: 100,
                                message: 'Họ và tên không được vượt quá 100 ký tự!'
                            },
                            {
                                pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                                message: 'Họ và tên chỉ được chứa chữ cái và khoảng trắng!'
                            }
                        ]}
                        fieldProps={{
                            size: 'large',
                            prefix: <UserOutlined className="text-gray-400" />,
                            className: 'rounded-lg',
                        }}
                    />

                    {/* Email */}
                    <ProFormText
                        name="email"
                        label={
                            <Text className="text-base font-medium text-gray-700">
                                Email công ty
                            </Text>
                        }
                        placeholder="Nhập email công ty (VD: nguyenvana@evcompany.com)"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập email!'
                            },
                            {
                                type: 'email',
                                message: 'Email không hợp lệ! Vui lòng nhập đúng định dạng.'
                            },
                            {
                                max: 100,
                                message: 'Email không được vượt quá 100 ký tự!'
                            }
                        ]}
                        fieldProps={{
                            size: 'large',
                            prefix: <MailOutlined className="text-gray-400" />,
                            className: 'rounded-lg',
                        }}
                    />

                    {/* Số điện thoại */}
                    <ProFormText
                        name="PhoneNumber"
                        label={
                            <Text className="text-base font-medium text-gray-700">
                                Số điện thoại
                            </Text>
                        }
                        placeholder="Nhập số điện thoại (VD: 0912345678)"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập số điện thoại!'
                            },
                            {
                                pattern: /^[0-9]{10,11}$/,
                                message: 'Số điện thoại phải có 10-11 chữ số!'
                            }
                        ]}
                        fieldProps={{
                            size: 'large',
                            prefix: <PhoneOutlined className="text-gray-400" />,
                            className: 'rounded-lg',
                        }}
                        extra={
                            <Text type="secondary" className="text-sm">
                                Số điện thoại dùng để liên hệ và xác thực
                            </Text>
                        }
                    />
                </div>

                {/* Lưu ý bảo mật */}
                <Alert
                    message="Lưu ý bảo mật"
                    description="Mật khẩu sẽ được hệ thống tự động tạo và gửi qua email. Nhân viên cần đổi mật khẩu ngay sau lần đăng nhập đầu tiên."
                    type="warning"
                    showIcon
                    className="mt-6 rounded-lg"
                />
            </ProForm>
    
        </Card>
    );
}

export default StaffForm;
