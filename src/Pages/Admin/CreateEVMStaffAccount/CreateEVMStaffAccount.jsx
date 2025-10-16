import React, { useState } from 'react';
import { message, Space, Card, Alert, Collapse, Typography } from 'antd';
import { PageContainer, ProForm, ProFormText, ProCard } from '@ant-design/pro-components';
import {
    UserAddOutlined,
    MailOutlined,
    PhoneOutlined,
    UserOutlined,
    SafetyCertificateOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
    ThunderboltOutlined
} from '@ant-design/icons';
import AdminLayout from '../../../Components/Admin/AdminLayout';
import { EVMStaffAccountService } from '../../../App/EVMAdmin/EVMStaffAccount/CreateEVMStaff';
import SuccessResult from './Components/SuccessResult';

const { Text, Paragraph } = Typography;

function CreateEVMStaffAccount() {
    const [loading, setLoading] = useState(false);
    const [formRef] = ProForm.useForm();
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [createdAccount, setCreatedAccount] = useState(null);

    // Xử lý submit form tạo tài khoản
    const handleSubmit = async (values) => {
        setLoading(true);

        try {
            const response = await EVMStaffAccountService.createStaffAccount(values);

            if (response?.isSuccess) {
                message.success('Tạo tài khoản EVM Staff thành công!');
                setSubmitSuccess(true);
                setCreatedAccount({
                    fullName: values.fullName,
                    email: values.email,
                    phoneNumber: values.PhoneNumber
                });
                formRef.resetFields();
            } else {
                message.error(response?.message || 'Tạo tài khoản thất bại. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Error creating EVM staff account:', error);

            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else if (error.message) {
                message.error(`Lỗi: ${error.message}`);
            } else {
                message.error('Đã xảy ra lỗi khi tạo tài khoản. Vui lòng kiểm tra lại thông tin!');
            }
        } finally {
            setLoading(false);
        }
    };

    // Reset form và quay lại trang tạo tài khoản mới
    const handleCreateAnother = () => {
        setSubmitSuccess(false);
        setCreatedAccount(null);
        formRef.resetFields();
    };

    // Nếu submit thành công, hiển thị kết quả
    if (submitSuccess) {
        return (
            <AdminLayout>
                <PageContainer>
                    <SuccessResult
                        createdAccount={createdAccount}
                        onCreateAnother={handleCreateAnother}
                    />
                </PageContainer>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <PageContainer
                header={{
                    title: (
                        <Space size="middle">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                                <UserAddOutlined className="text-white text-2xl" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800">Tạo tài khoản EVM Staff</div>
                        
                            </div>
                        </Space>
                    ),
                }}
            >
                {/* Hướng dẫn sử dụng */}
                <Alert
                    message="Hướng dẫn tạo tài khoản"
                    description={
                        <div>
                            <Paragraph className="mb-2 text-sm">
                                <Text strong>EVM Staff</Text> là nhân viên của nhà sản xuất xe điện với các quyền hạn:
                            </Paragraph>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircleOutlined className="text-green-500" />
                                    <span>Quản lý danh mục xe điện</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircleOutlined className="text-green-500" />
                                    <span>Tạo hợp đồng với đại lý</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircleOutlined className="text-green-500" />
                                    <span>Phân bổ xe cho đại lý</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircleOutlined className="text-green-500" />
                                    <span>Xem báo cáo doanh số</span>
                                </div>
                            </div>
                        </div>
                    }
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    className="mb-6"
                />

                {/* Form tạo tài khoản */}
                <ProCard className="shadow-sm">
                    <ProForm
                        form={formRef}
                        onFinish={handleSubmit}
                        submitter={{
                            searchConfig: {
                                submitText: 'Tạo tài khoản',
                                resetText: 'Đặt lại',
                            },
                            submitButtonProps: {
                                loading: loading,
                                size: 'large',
                                icon: <UserAddOutlined />,
                            },
                            resetButtonProps: {
                                size: 'large',
                            },
                        }}
                        layout="vertical"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Họ và tên */}
                            <ProFormText
                                name="fullName"
                                label={<Text className="font-medium">Họ và tên đầy đủ</Text>}
                                placeholder="Nhập họ và tên (VD: Nguyễn Văn A)"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập họ và tên!' },
                                    { min: 3, message: 'Họ và tên phải có ít nhất 3 ký tự!' },
                                    { max: 100, message: 'Họ và tên không được vượt quá 100 ký tự!' },
                                    { pattern: /^[a-zA-ZÀ-ỹ\s]+$/, message: 'Chỉ được chứa chữ cái và khoảng trắng!' }
                                ]}
                                fieldProps={{
                                    size: 'large',
                                    prefix: <UserOutlined className="text-gray-400" />,
                                }}
                            />

                            {/* Số điện thoại */}
                            <ProFormText
                                name="PhoneNumber"
                                label={<Text className="font-medium">Số điện thoại</Text>}
                                placeholder="Nhập số điện thoại (VD: 0912345678)"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số!' }
                                ]}
                                fieldProps={{
                                    size: 'large',
                                    prefix: <PhoneOutlined className="text-gray-400" />,
                                }}
                            />
                        </div>

                        {/* Email - full width */}
                        <ProFormText
                            name="email"
                            label={<Text className="font-medium">Email công ty</Text>}
                            placeholder="Nhập email (VD: nguyenvana@evcompany.com)"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' },
                                { max: 100, message: 'Email không được vượt quá 100 ký tự!' }
                            ]}
                            fieldProps={{
                                size: 'large',
                                prefix: <MailOutlined className="text-gray-400" />,
                            }}
                            extra={<Text type="secondary" className="text-xs">Email sẽ được sử dụng để đăng nhập vào hệ thống</Text>}
                        />

                        {/* Lưu ý bảo mật */}
                        <Alert
                            message="Lưu ý bảo mật"
                            description="Mật khẩu sẽ được hệ thống tự động tạo và gửi qua email. Nhân viên cần đổi mật khẩu ngay sau lần đăng nhập đầu tiên."
                            type="warning"
                            showIcon
                            icon={<SafetyCertificateOutlined />}
                            className="mt-4"
                        />
                    </ProForm>
                </ProCard>
            </PageContainer>
        </AdminLayout>
    );
}

export default CreateEVMStaffAccount;
