import React from "react";
import { Modal, Button, Card, Descriptions, Tag } from "antd";
import { InfoCircleOutlined, CarOutlined } from "@ant-design/icons";

function VehicleDetailModal({ visible, onClose, vehicle }) {
    return (
        <Modal
            title={
                <div className="flex items-center gap-3">
                    <InfoCircleOutlined className="text-blue-500 text-xl" />
                    <span className="text-lg font-semibold">Chi Tiết Thông Tin Xe</span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={[
                <Button
                    key="close"
                    type="primary"
                    onClick={onClose}
                    className="bg-blue-500 hover:bg-blue-600"
                >
                    Đóng
                </Button>
            ]}
            width={700}
            className="custom-modal"
        >
            {vehicle && (
                <div className="space-y-4">
                    {/* Thông tin xe */}
                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300">
                        <Descriptions column={1} bordered size="middle">
                            <Descriptions.Item
                                label={<span className="font-semibold text-gray-700">Tên Model</span>}
                            >
                                <span className="text-blue-600 font-bold">{vehicle.modelName}</span>
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={<span className="font-semibold text-gray-700">Phiên Bản</span>}
                            >
                                <span className="font-medium">{vehicle.versionName}</span>
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={<span className="font-semibold text-gray-700">Màu Sắc</span>}
                            >
                                <Tag color="blue" className="px-3 py-1 rounded-full font-medium">
                                    {vehicle.colorName}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={<span className="font-semibold text-gray-700">Số Lượng</span>}
                            >
                                <span
                                    className={`px-3 py-1 rounded-full font-bold ${vehicle.quantity > 5
                                            ? "bg-green-100 text-green-700"
                                            : vehicle.quantity > 0
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {vehicle.quantity} xe
                                </span>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Danh sách số VIN */}
                    <Card
                        title={
                            <span className="text-base font-semibold text-gray-800">
                             Danh Sách Chi Tiết Số VIN ({vehicle.viNs?.length || 0} xe)
                            </span>
                        }
                        className="border-gray-300"
                    >
                        {vehicle.viNs && vehicle.viNs.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                            <th className="px-4 py-3 text-center font-semibold border border-blue-400 w-20">
                                                STT
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold border border-blue-400">
                                                Tên Model
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold border border-blue-400">
                                                Phiên Bản
                                            </th>
                                            <th className="px-4 py-3 text-center font-semibold border border-blue-400">
                                                Màu Sắc
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold border border-blue-400">
                                                Số VIN
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vehicle.viNs.map((vin, index) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-blue-50 transition-colors border-b border-gray-200"
                                            >
                                                <td className="px-4 py-3 text-center border border-gray-200">
                                                    <div className="flex items-center justify-center">
                                                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold text-sm">
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border border-gray-200">
                                                    <span className="font-bold text-blue-600">
                                                        {vehicle.modelName}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 border border-gray-200">
                                                    <span className="font-semibold text-gray-800">
                                                        {vehicle.versionName}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center border border-gray-200">
                                                    <Tag color="blue" className="px-3 py-1 rounded-full font-medium">
                                                        {vehicle.colorName}
                                                    </Tag>
                                                </td>
                                                <td className="px-4 py-3 border border-gray-200">
                                                    <div className="p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded border border-blue-300">
                                                        <code className="font-bold text-blue-700 text-sm tracking-wide">
                                                            {vin}
                                                        </code>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CarOutlined className="text-5xl text-gray-300 mb-3" />
                                <p className="text-gray-500 text-base">Chưa có số VIN cho xe này</p>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </Modal>
    );
}

export default VehicleDetailModal;
