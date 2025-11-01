import React, { useState, useEffect, useCallback } from "react";
import { Button, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import AdminLayout from "../../../Components/Admin/AdminLayout";
import { getAllEVInventory } from "../../../App/EVMAdmin/GetAllEVInventory/GetAllEVInventory";
import VehicleDetailModal from "./Components/VehicleDetailModal";
import StatisticsCards from "./Components/StatisticsCards";
import InventoryTable from "./Components/InventoryTable";

function EVMGetAllInventory() {
    const [loading, setLoading] = useState(false);
    const [inventoryData, setInventoryData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    // Fetch dữ liệu kho xe của hãng
    const fetchInventoryData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllEVInventory();

            if (response.isSuccess) {
                // Thêm key cho mỗi item để Table hoạt động tốt
                const dataWithKeys = response.result.map((item, index) => ({
                    ...item,
                    key: index,
                    id: index + 1
                }));

                setInventoryData(dataWithKeys);
                message.success("Tải dữ liệu kho xe hãng thành công!");
            } else {
                message.error(response.message || "Có lỗi xảy ra khi tải dữ liệu");
            }
        } catch (error) {
            console.error("Error fetching company inventory:", error);
            message.error("Không thể tải dữ liệu kho xe. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    }, []);

    // Làm mới dữ liệu
    const handleRefresh = () => {
        fetchInventoryData();
    };

    // Mở modal xem chi tiết
    const showDetailModal = (record) => {
        setSelectedVehicle(record);
        setIsModalVisible(true);
    };

    // Đóng modal
    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedVehicle(null);
    };



    useEffect(() => {
        fetchInventoryData();
    }, [fetchInventoryData]);

    return (
        <AdminLayout>
            <PageContainer
                title="Quản Lý Kho Xe Toàn Hệ Thống"
                subTitle="Theo dõi tổng quan kho xe điện của hãng trên toàn quốc"
                extra={[
                    <Button
                        key="refresh"
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        loading={loading}
                        className="bg-blue-500 hover:bg-blue-600 border-blue-500"
                    >
                        Làm Mới Dữ Liệu
                    </Button>
                ]}
                className="bg-white"
            >
                <div className="space-y-6">
                    {/* Thống kê tổng quan */}
                    <StatisticsCards filteredData={inventoryData} />

                    {/* Bảng dữ liệu */}
                    <InventoryTable
                        loading={loading}
                        filteredData={inventoryData}
                        onShowDetail={showDetailModal}
                    />
                </div>
            </PageContainer>

            {/* Modal hiển thị chi tiết số VIN và phân bố kho */}
            <VehicleDetailModal
                visible={isModalVisible}
                onClose={handleCloseModal}
                vehicle={selectedVehicle}
            />
        </AdminLayout>
    );
}

export default EVMGetAllInventory;