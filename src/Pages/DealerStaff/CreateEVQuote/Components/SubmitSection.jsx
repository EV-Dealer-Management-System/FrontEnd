import React from 'react';
import { Card, Button, Space, Alert } from 'antd';
import {
    SaveOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';

function SubmitSection({
    onSubmit,
    onReset,
    loading,
    canSubmit,
    validationErrors
}) {
    return (
        <Card className="shadow-sm border border-gray-200 rounded-lg">
            <div className="space-y-4">
                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                    <Alert
                        message="Vui lòng hoàn thành thông tin"
                        description={
                            <ul className="list-disc list-inside mt-2">
                                {validationErrors.map((error, index) => (
                                    <li key={index} className="text-sm">{error}</li>
                                ))}
                            </ul>
                        }
                        type="warning"
                        icon={<ExclamationCircleOutlined />}
                        showIcon
                    />
                )}

                {/* Success Message */}
                {canSubmit && validationErrors.length === 0 && (
                    <Alert
                        message="Sẵn sàng tạo báo giá"
                        description="Tất cả thông tin đã được nhập đầy đủ. Bạn có thể tạo báo giá ngay bây giờ."
                        type="success"
                        icon={<CheckCircleOutlined />}
                        showIcon
                    />
                )}

                {/* Action Buttons */}
                <div className="flex justify-center">
                    <Space size="large">
                        <Button
                            size="large"
                            icon={<ReloadOutlined />}
                            onClick={onReset}
                            className="min-w-[120px] h-12 border-gray-300 hover:border-gray-400"
                        >
                            Làm mới
                        </Button>

                        <Button
                            type="primary"
                            size="large"
                            icon={<SaveOutlined />}
                            onClick={onSubmit}
                            loading={loading}
                            disabled={!canSubmit}
                            className="min-w-[180px] h-12 bg-gradient-to-r from-blue-500 to-green-500 border-0 hover:from-blue-600 hover:to-green-600 shadow-lg"
                        >
                            {loading ? 'Đang tạo báo giá...' : 'Tạo báo giá'}
                        </Button>
                    </Space>
                </div>

                {/* Help Text */}
                <div className="text-center text-sm text-gray-500 mt-4">
                    Báo giá sẽ được lưu vào hệ thống và có thể xem lại trong danh sách báo giá
                </div>
            </div>
        </Card>
    );
}

export default SubmitSection;