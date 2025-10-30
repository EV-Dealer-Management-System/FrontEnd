import React, { useMemo } from 'react';
import { Table, Tag, Space, Progress } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import { CarOutlined } from '@ant-design/icons';

function InventoryOverview({ inventoryData, loading }) {

    // Tính toán dữ liệu tổng hợp theo model
    const modelSummary = useMemo(() => {
        if (!inventoryData || !Array.isArray(inventoryData)) return [];

        const modelStats = {};

        inventoryData.forEach(item => {
            const modelName = item.modelName;
            if (!modelStats[modelName]) {
                modelStats[modelName] = {
                    modelName,
                    totalQuantity: 0,
                    versions: new Set(),
                    colors: new Set(),
                    warehouses: new Set()
                };
            }

            modelStats[modelName].totalQuantity += item.quantity;
            modelStats[modelName].versions.add(item.versionName);
            modelStats[modelName].colors.add(item.colorName);

            // Thêm warehouse từ vehicles
            item.vehicles?.forEach(vehicle => {
                modelStats[modelName].warehouses.add(vehicle.warehouseName);
            });
        });

        // Chuyển đổi Set thành số lượng và tạo array
        return Object.values(modelStats).map((item, index) => ({
            key: index + 1,
            ...item,
            versions: item.versions.size,
            colors: item.colors.size,
            warehouses: item.warehouses.size,
            status: item.totalQuantity > 10 ? 'Đầy đủ' :
                item.totalQuantity > 5 ? 'Trung bình' : 'Ít hàng'
        })).sort((a, b) => b.totalQuantity - a.totalQuantity);
    }, [inventoryData]);

    // Tính tổng số xe để tính phần trăm
    const totalVehicles = modelSummary.reduce((sum, item) => sum + item.totalQuantity, 0);

    const columns = [
        {
            title: 'STT',
            dataIndex: 'key',
            key: 'key',
            width: 60,
            align: 'center',
        },
        {
            title: 'Model xe',
            dataIndex: 'modelName',
            key: 'modelName',
            render: (text) => (
                <Space>
                    <CarOutlined className="text-blue-500" />
                    <span className="font-medium">{text}</span>
                </Space>
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'totalQuantity',
            key: 'totalQuantity',
            align: 'center',
            render: (value) => (
                <Tag color="blue" className="font-medium">
                    {value} xe
                </Tag>
            ),
            sorter: (a, b) => a.totalQuantity - b.totalQuantity,
        },
        {
            title: 'Tỷ lệ',
            key: 'percentage',
            align: 'center',
            width: 150,
            render: (_, record) => {
                const percentage = totalVehicles > 0 ?
                    ((record.totalQuantity / totalVehicles) * 100).toFixed(1) : 0;
                return (
                    <Progress
                        percent={percentage}
                        size="small"
                        format={percent => `${percent}%`}
                        strokeColor={
                            percentage > 30 ? '#52c41a' :
                                percentage > 15 ? '#faad14' : '#ff4d4f'
                        }
                    />
                );
            }
        },
        {
            title: 'Phiên bản',
            dataIndex: 'versions',
            key: 'versions',
            align: 'center',
            width: 80,
        },
        {
            title: 'Màu sắc',
            dataIndex: 'colors',
            key: 'colors',
            align: 'center',
            width: 80,
        },
        {
            title: 'Kho',
            dataIndex: 'warehouses',
            key: 'warehouses',
            align: 'center',
            width: 60,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 100,
            render: (status) => {
                const colorMap = {
                    'Đầy đủ': 'success',
                    'Trung bình': 'warning',
                    'Ít hàng': 'error'
                };
                return <Tag color={colorMap[status]}>{status}</Tag>;
            },
        }
    ];

    return (
        <ProCard
            title="Tổng Quan Kho Xe Theo Model"
            className="shadow-sm"
            extra={
                <Tag color="processing">
                    Tổng: {totalVehicles} xe
                </Tag>
            }
        >
            <Table
                columns={columns}
                dataSource={modelSummary}
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    showQuickJumper: true,
                    showTotal: (total) => `Tổng ${total} model xe`,
                }}
                size="middle"
                scroll={{ x: 800 }}
            />
        </ProCard>
    );
}

export default InventoryOverview;