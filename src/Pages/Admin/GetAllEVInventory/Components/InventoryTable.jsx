import React from "react";
import { Table, Card, Spin, Tag, Button } from "antd";
import { CarOutlined, EyeOutlined, ShopOutlined } from "@ant-design/icons";

function InventoryTable({ loading, filteredData, onShowDetail }) {
    // Cấu hình cột cho bảng
    const columns = [
        {
            title: "STT",
            dataIndex: "id",
            key: "id",
            width: 80,
            align: "center",
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: "Tên Model",
            dataIndex: "modelName",
            key: "modelName",
            sorter: (a, b) => a.modelName.localeCompare(b.modelName),
        },
        {
            title: "Phiên Bản",
            dataIndex: "versionName",
            key: "versionName",
            sorter: (a, b) => a.versionName.localeCompare(b.versionName),
        },
        {
            title: "Màu Sắc",
            dataIndex: "colorName",
            key: "colorName",
            width: 120,
            sorter: (a, b) => a.colorName.localeCompare(b.colorName),
        },
        {
            title: "Số Lượng Tổng",
            dataIndex: "quantity",
            key: "quantity",
            width: 120,
            align: "center",
            render: (quantity) => `${quantity} xe`,
            sorter: (a, b) => a.quantity - b.quantity,
        },
        {
            title: "Số Kho Phân Bố",
            key: "warehouseCount",
            width: 120,
            align: "center",
            render: (_, record) => {
                const warehouses = new Set(record.vehicles?.map(v => v.warehouseName) || []);
                return `${warehouses.size} kho`;
            },
            sorter: (a, b) => {
                const aWarehouses = new Set(a.vehicles?.map(v => v.warehouseName) || []).size;
                const bWarehouses = new Set(b.vehicles?.map(v => v.warehouseName) || []).size;
                return aWarehouses - bWarehouses;
            },
        },
        {
            title: "Tình Trạng",
            key: "status",
            width: 100,
            align: "center",
            render: (_, record) => {
                const { quantity } = record;
                if (quantity > 20) {
                    return "Dồi Dào";
                } else if (quantity > 10) {
                    return "Đầy Đủ";
                } else if (quantity > 5) {
                    return "Trung Bình";
                } else if (quantity > 0) {
                    return "Ít";
                } else {
                    return "Hết Hàng";
                }
            },
        },
        {
            title: "Chi Tiết",
            key: "action",
            width: 100,
            align: "center",
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => onShowDetail(record)}
                    size="small"
                >
                    Chi Tiết
                </Button>
            ),
        }
    ];

    return (
        <Card>
            <Spin spinning={loading} tip="Đang tải dữ liệu kho xe...">
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    pagination={{
                        total: filteredData.length,
                        pageSize: 15,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} dòng xe`,
                    }}
                    size="middle"
                    locale={{
                        emptyText: (
                            <div className="text-center py-8">
                                <CarOutlined className="text-4xl text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg">
                                    Chưa có xe trong hệ thống
                                </p>
                            </div>
                        ),
                    }}
                />
            </Spin>
        </Card>
    );
}

export default InventoryTable;