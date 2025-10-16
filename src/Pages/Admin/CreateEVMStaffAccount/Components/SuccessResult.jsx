import React from 'react';
import { Card, Result, Button, Space, Typography } from 'antd';
import {
    CheckCircleOutlined,
    UserAddOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

// Component hiển thị kết quả tạo tài khoản thành công
function SuccessResult({ createdAccount, onCreateAnother }) {
    return (
        <Card className="shadow-md rounded-lg max-w-4xl mx-auto border-0">
            <Result
                status="success"
                icon={
                    <div className="mb-4">
                        <CheckCircleOutlined className="text-green-500" style={{ fontSize: 72 }} />
                    </div>
                }
                title={
                    <Text className="text-2xl font-bold text-gray-800">
                        Tạo tài khoản thành công!
                    </Text>
                }
                subTitle={
                    <Space direction="vertical" size="small" className="mt-4">
                        <Text className="text-base text-gray-600">
                            Tài khoản EVM Staff đã được tạo và thông tin đăng nhập đã được gửi qua email.
                        </Text>
                        <Text type="secondary">
                            Nhân viên cần kiểm tra email để nhận mật khẩu và đăng nhập lần đầu.
                        </Text>
                    </Space>
                }
                extra={
                    <Space size="middle" className="mt-8">
                        <Button
                            type="primary"
                            size="large"
                            icon={<UserAddOutlined />}
                            onClick={onCreateAnother}
                            className="bg-blue-600 hover:bg-blue-700 border-0 h-11 px-8 rounded-lg font-medium"
                        >
                            Tạo tài khoản khác
                        </Button>
                        <Button
                            size="large"
                            onClick={() => window.location.href = '/admin/staff/evm-staff'}
                            className="h-11 px-8 rounded-lg font-medium"
                        >
                            Xem danh sách nhân viên
                        </Button>
                    </Space>
                }
            >
                {/* Thông tin tài khoản vừa tạo */}
                {createdAccount && (
                    <Card
                        className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm"
                        bodyStyle={{ padding: '24px' }}
                    >
                        <div className="mb-4">
                            <Text className="text-lg font-semibold text-gray-800">
                                Thông tin tài khoản vừa tạo
                            </Text>
                        </div>
                        <Space direction="vertical" size="middle" className="w-full">
                            <div className="flex justify-between items-center py-3 border-b border-blue-200">
                                <Text type="secondary" className="text-base">Họ và tên:</Text>
                                <Text strong className="text-base text-gray-800">
                                    {createdAccount.fullName}
                                </Text>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-blue-200">
                                <Text type="secondary" className="text-base">Email:</Text>
                                <Text strong className="text-base text-gray-800">
                                    {createdAccount.email}
                                </Text>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <Text type="secondary" className="text-base">Số điện thoại:</Text>
                                <Text strong className="text-base text-gray-800">
                                    {createdAccount.phoneNumber}
                                </Text>
                            </div>
                        </Space>
                    </Card>
                )}
            </Result>
        </Card>
    );
}

export default SuccessResult;
