import React from 'react';
import { ProTable } from '@ant-design/pro-components';
import { Tag, Space, Avatar, Typography, Empty } from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    ManOutlined,
    WomanOutlined,
    CalendarOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
 import {ConfigProvider} from "antd";
import viVN from 'antd/lib/locale/vi_VN';
const { Text } = Typography;

function StaffTable({ dataSource, loading }) {
    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            align: 'center',
            search: false,
            render: (_, __, index) => (
                <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-full">
                    <Text strong className="text-blue-600 text-sm">{index + 1}</Text>
                </div>
            ),
        },
        {
            title: 'Thông tin nhân viên',
            key: 'staff',
            width : 300,
            search: false,
            render: (_, record) => (
                <Space size="middle" className="py-2">
                    <Avatar
                        size={48}
                        icon={<UserOutlined />}
                        className="bg-gradient-to-br from-blue-500 to-purple-600 shadow-md"
                    />
                    <div className="flex flex-col gap-1">
                        <Text strong className="text-base text-gray-800">
                            {record.fullName || 'Chưa cập nhật'}
                        </Text>
                        <Space size={4} className="text-xs">
                            <MailOutlined className="text-blue-500" />
                            <Text className="text-gray-600">{record.email}</Text>
                        </Space>
                    </div>
                </Space>
            ),
        },
        // {
        //     title: 'Số điện thoại',
        //     dataIndex: 'phoneNumber',
        //     key: 'phoneNumber',
        //     align: 'center',
        //     search: false,
        //     render: (phone) => {
        //         if (!phone && phone === '-') {
        //             return (
        //                 <div className="flex items-center justify-center gap-2 text-gray-400">
        //                     <PhoneOutlined />
        //                     <Text type="secondary" className="text-sm">Chưa có</Text>
        //                 </div>
        //             );
        //         }
        //         return (
        //             <Space size={6}>
        //                 <PhoneOutlined className="text-green-500" />
        //                 <Text className="font-medium">{phone}</Text>
        //             </Space>
        //         );
        //     },
        // },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            width : 200,
            search: false,
            ellipsis: true,
            render: (address) => {
                if (!address && address === 'null') {
                    return (
                        <div className="flex items-center gap-2 text-gray-400">
                            <EnvironmentOutlined />
                            <Text type="secondary" className="text-sm">Chưa cập nhật</Text>
                        </div>
                    );
                }
                return (
                    <Space size={6}>
                        <EnvironmentOutlined className="text-orange-500" />
                        <Text className="text-sm">{address}</Text>
                    </Space>
                );
            },
        },
        {
            title: 'Giới tính',
            dataIndex: 'sex',
            key: 'sex',
            align: 'center',
            search: false,
            render: (sex) => {
                // Nếu null hoặc không có giá trị
                if (!sex || sex === null) {
                    return (
                        <Tag icon={<QuestionCircleOutlined />} color="default">
                            Chưa có
                        </Tag>
                    );
                }

                // Kiểm tra giới tính Nam
                const sexLower = sex.toLowerCase().trim();
                const isMale = sexLower === 'male' || sexLower === 'nam' || sexLower === 'man';

                // Chỉ hiển thị Nam hoặc Nữ nếu có giá trị hợp lệ
                if (isMale) {
                    return (
                        <Tag
                            icon={<ManOutlined />}
                            color="blue"
                            className="px-3 py-1"
                        >
                            Nam
                        </Tag>
                    );
                }

                // Nếu có giá trị nhưng không phải Nam, mới hiển thị Nữ
                const isFemale = sexLower === 'female' || sexLower === 'nữ' || sexLower === 'nu' || sexLower === 'woman';
                if (isFemale) {
                    return (
                        <Tag
                            icon={<WomanOutlined />}
                            color="pink"
                            className="px-3 py-1"
                        >
                            Nữ
                        </Tag>
                    );
                }

                // Nếu có giá trị nhưng không xác định được
                return (
                    <Tag icon={<QuestionCircleOutlined />} color="default">
                        Chưa có
                    </Tag>
                );
            },
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'dateOfBirth',
            key: 'dateOfBirth',
            align: 'center',
            search: false,
            render: (dateOfBirth) => {
                if (!dateOfBirth) {
                    return (
                        <div className="flex items-center justify-center gap-2 text-gray-400">
                            <CalendarOutlined />
                            <Text type="secondary" className="text-sm">Chưa có</Text>
                        </div>
                    );
                }
                return (
                    <Space size={6}>
                        <CalendarOutlined className="text-purple-500" />
                        <Text className="text-sm font-medium">
                            {new Date(dateOfBirth).toLocaleDateString('vi-VN')}
                        </Text>
                    </Space>
                );
            },
        },
        {
            title: 'Vai trò',
            key: 'role',
            width : 100,
            align: 'center',
            search: false,
            render: () => (
                <Tag
                    color="processing"
                    icon={<UserOutlined />}
                    className="px-3 py-1 font-medium"
                >
                    EVM Staff
                </Tag>
            ),
        },
    ];

    return (
        <ConfigProvider locale={viVN}>
             <style>{`
                .staff-table .ant-table {
                table-layout: auto !important;   
                width: 100%;
                }
                .staff-table .ant-table-cell {
                white-space: normal !important;  
                word-break: break-word !important;
                }
            `}</style>
        <ProTable
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            rowKey={(record) => record.email}
            search={false}
            pagination={false}
            options={{
                reload: false,
                density: true,
                setting: true,
                fullScreen: true,
            }}
            headerTitle={
                <Space size="middle">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                        <UserOutlined className="text-white text-lg" />
                    </div>
                    <div>
                        <Text strong className="text-base">Danh sách nhân viên EVM</Text>
                        <div className="text-xs text-gray-500">
                            Tổng số: <Text strong className="text-blue-600">{dataSource?.length || 0}</Text> nhân viên
                        </div>
                    </div>
                </Space>
            }
            toolbar={{
                multipleLine: false,
            }}
            locale={{
                emptyText: (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <Space direction="vertical" size={4}>
                                <Text type="secondary">Không có dữ liệu nhân viên</Text>
                                <Text type="secondary" className="text-xs">Vui lòng chọn trang để tải dữ liệu</Text>
                            </Space>
                        }
                    />
                ),
            }}
            rowClassName={(_, index) =>
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            }
            className="staff-table"
        />
        </ConfigProvider>
    );
}

export default StaffTable;
