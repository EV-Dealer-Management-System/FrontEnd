import React from 'react';
import { Alert, Typography } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

// Component hiển thị hướng dẫn tạo tài khoản EVM Staff
function InstructionAlert() {
    return (
        <Alert
            message="Hướng dẫn tạo tài khoản EVM Staff"
            description={
                <div>
                    <Paragraph className="mb-2">
                        <Text strong>EVM Staff</Text> là nhân viên của nhà sản xuất xe điện, có quyền:
                    </Paragraph>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Quản lý danh mục xe điện (mẫu xe, phiên bản, màu sắc)</li>
                        <li>Tạo và quản lý hợp đồng với đại lý</li>
                        <li>Phân bổ xe cho các đại lý theo đơn hàng</li>
                        <li>Xem báo cáo doanh số theo khu vực và đại lý</li>
                    </ul>
                    <Paragraph className="mt-3 mb-0">
                        Vui lòng điền đầy đủ thông tin bên dưới để tạo tài khoản mới.
                    </Paragraph>
                </div>
            }
            type="info"
            showIcon
            icon={<UserAddOutlined />}
            className="mb-6 rounded-lg shadow-sm"
        />
    );
}

export default InstructionAlert;
