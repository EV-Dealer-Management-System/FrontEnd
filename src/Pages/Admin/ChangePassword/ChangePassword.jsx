import React, { useState, useCallback } from 'react';
import { Card, Form, Space, Typography } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import AdminLayout from '../../../Components/Admin/AdminLayout';
import SecurityRequirements from './Components/SecurityRequirements';
import PasswordForm from './Components/PasswordForm';
import SecurityNotice from './Components/SecurityNotice';
import ResultModal from './Components/ResultModal';
import { changePassword } from '../../../utils/auth';

const { Title, Text } = Typography;

function ChangePassword() {
    const [form] = Form.useForm();
    const [newPassword, setNewPassword] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('success'); // 'success' | 'error'
    const [modalMessage, setModalMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Validate mật khẩu mạnh
    const validatePassword = useCallback((_, value) => {
        if (!value) {
            return Promise.reject(new Error('Vui lòng nhập mật khẩu mới!'));
        }
        if (value.length < 8) {
            return Promise.reject(new Error('Mật khẩu phải có ít nhất 8 ký tự!'));
        }
        if (!/(?=.*[a-z])/.test(value)) {
            return Promise.reject(new Error('Mật khẩu phải có ít nhất 1 chữ thường!'));
        }
        if (!/(?=.*[A-Z])/.test(value)) {
            return Promise.reject(new Error('Mật khẩu phải có ít nhất 1 chữ hoa!'));
        }
        if (!/(?=.*\d)/.test(value)) {
            return Promise.reject(new Error('Mật khẩu phải có ít nhất 1 chữ số!'));
        }
        return Promise.resolve();
    }, []);

    // Validate xác nhận mật khẩu
    const validateConfirmPassword = useCallback((_, value) => {
        const newPassword = form.getFieldValue('newPassword');
        if (value && value !== newPassword) {
            return Promise.reject(new Error('Xác nhận mật khẩu không khớp!'));
        }
        return Promise.resolve();
    }, [form]);

    // Xử lý đổi mật khẩu
    const handleChangePassword = useCallback(async (values, callbacks = {}) => {
        const { onSuccess, onError } = callbacks;

        try {
            setLoading(true);
            const { currentPassword, newPassword, confirmNewPassword } = values;
            const response = await changePassword(currentPassword, newPassword, confirmNewPassword);
            if (response) {
                onSuccess && onSuccess('Đổi mật khẩu thành công! Mật khẩu của bạn đã được thay đổi.');
            }
        } catch (error) {
            console.error('Lỗi đổi mật khẩu:', error);
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Đổi mật khẩu thất bại. Vui lòng thử lại!';

            onError && onError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // Xử lý submit form
    const onFinish = async (values) => {
        await handleChangePassword(values, {
            onSuccess: (message) => {
                setModalType('success');
                setModalMessage(message);
                setModalVisible(true);
                form.resetFields();
                setNewPassword('');
            },
            onError: (errorMessage) => {
                setModalType('error');
                setModalMessage(errorMessage);
                setModalVisible(true);
            }
        });
    };

    // Đóng modal
    const handleModalClose = () => {
        setModalVisible(false);
        setModalMessage('');
    };

    // Reset form
    const handleReset = () => {
        form.resetFields();
        setNewPassword('');
    };

    return (
        <AdminLayout>
            <div style={{ padding: '16px' }}>
                <PageContainer
                    header={{
                        title: 'Đổi Mật Khẩu',
                        breadcrumb: {
                            items: [
                                { title: 'Trang chủ' },
                                { title: 'Cài đặt hệ thống' },
                                { title: 'Đổi mật khẩu' }
                            ]
                        }
                    }}
                    content={
                        <div style={{ marginBottom: '16px' }}>
                            <Text type="secondary">
                                Để đảm bảo bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh và thay đổi định kỳ.
                            </Text>
                        </div>
                    }
                >
                    <div style={{ maxWidth: '768px', margin: '0 auto' }}>
                        <Card
                            title={
                                <Space>
                                    <SafetyOutlined style={{ color: 'white' }} />
                                    <span style={{ color: 'white', fontWeight: '600' }}>Thay đổi mật khẩu</span>
                                </Space>
                            }
                            style={{
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                            }}
                            headStyle={{
                                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                borderRadius: '12px 12px 0 0',
                                borderBottom: '1px solid #f0f0f0'
                            }}
                        >
                            <SecurityRequirements />
                            <PasswordForm
                                form={form}
                                loading={loading}
                                newPassword={newPassword}
                                setNewPassword={setNewPassword}
                                onFinish={onFinish}
                                onReset={handleReset}
                                validatePassword={validatePassword}
                                validateConfirmPassword={validateConfirmPassword}
                            />

                            {/* Lưu ý bảo mật */}
                            <SecurityNotice />
                        </Card>
                    </div>
                </PageContainer>

                {/* Modal thông báo kết quả */}
                <ResultModal
                    visible={modalVisible}
                    type={modalType}
                    message={modalMessage}
                    onClose={handleModalClose}
                />
            </div>
        </AdminLayout>
    );
}

export default ChangePassword;
