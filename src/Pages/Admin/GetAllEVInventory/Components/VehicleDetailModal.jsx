import React from "react";
import { Modal, Table, Card, Empty } from "antd";

function VehicleDetailModal({ visible, onClose, vehicle }) {
    if (!vehicle) return null;

    // Cấu trúc dữ liệu cho bảng VIN
    const vinColumns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            width: 60,
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Tên Model",
            key: "modelName",
            width: 150,
            render: () => vehicle.modelName,
        },
        {
            title: "Phiên Bản",
            key: "versionName",
            width: 180,
            render: () => vehicle.versionName,
        },
        {
            title: "Màu Sắc",
            key: "colorName",
            width: 120,
            render: () => vehicle.colorName,
        },
        {
            title: "Tổng Số Lượng",
            key: "quantity",
            width: 120,
            align: "center",
            render: () => `${vehicle.quantity} xe`,
        },
        {
            title: "Số VIN",
            dataIndex: "vin",
            key: "vin",
            width: 140,
        },
        {
            title: "Tên Kho",
            dataIndex: "warehouseName",
            key: "warehouseName",
        },
    ];

    return (
        <Modal
            title="Chi Tiết Xe Trong Kho"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={1200}
            centered
        >
            <Card>
                {vehicle.vehicles && vehicle.vehicles.length > 0 ? (
                    <Table
                        columns={vinColumns}
                        dataSource={vehicle.vehicles.map((car, index) => ({
                            ...car,
                            key: car.vin,
                            index,
                        }))}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: false,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} / ${total} xe`,
                        }}
                        size="middle"
                        scroll={{ x: 1000 }}
                    />
                ) : (
                    <Empty description="Không có thông tin chi tiết về xe" />
                )}
            </Card>
        </Modal>
    );
}

export default VehicleDetailModal;