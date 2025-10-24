import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import { ReloadOutlined } from "@ant-design/icons";
import { GetAllEVInventory } from "../../../App/DealerStaff/EVInventory/GetAllEVInventory";
import { GetEVTemplateByVersionAndColor } from "../../../App/DealerStaff/EVInventory/GetEVTemplateByVersionAndColor";
import DealerStaffLayout from "../../../Components/DealerStaff/DealerStaffLayout";

// Components
import StatisticsCards from "./Components/StatisticsCards";
import VehicleGrid from "./Components/VehicleGrid";
import VehicleDetails from "./Components/VehicleDetails";
import EmptyState from "./Components/EmptyState";
import LoadingState from "./Components/LoadingState";
import ErrorState from "./Components/ErrorState";

function EVVersionDetails() {
    const [loading, setLoading] = useState(true);
    const [vehicleTemplates, setVehicleTemplates] = useState([]);
    const [error, setError] = useState(null);

    // State cho popup chi tiết xe
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [selectedVersionId, setSelectedVersionId] = useState(null);

    // Lấy danh sách inventory và template khi component mount
    useEffect(() => {
        fetchAllVehicleData();
    }, []);

    const fetchAllVehicleData = async () => {
        try {
            setLoading(true);
            const response = await GetAllEVInventory();

            if (response.isSuccess && response.result) {
                const inventory = response.result;

                // Lấy thông tin chi tiết cho từng xe
                const templatePromises = inventory.map(async (vehicle) => {
                    try {
                        const templateResponse = await GetEVTemplateByVersionAndColor(
                            vehicle.versionId,
                            vehicle.colorId
                        );

                        if (
                            templateResponse.isSuccess &&
                            templateResponse.result &&
                            templateResponse.result.length > 0
                        ) {
                            const vehicleData = {
                                ...templateResponse.result[0],
                                quantity: vehicle.quantity,
                                versionId: vehicle.versionId,
                            };
                            return vehicleData;
                        }
                        return null;
                    } catch (error) {
                        console.error(
                            `Error fetching template for vehicle ${vehicle.versionId}:`,
                            error
                        );
                        return null;
                    }
                });

                const templates = await Promise.all(templatePromises);
                setVehicleTemplates(templates.filter((t) => t !== null));
            } else {
                setError("Không thể tải danh sách xe từ kho");
            }
        } catch (error) {
            console.error("Error fetching vehicle data:", error);
            setError("Lỗi khi tải danh sách xe từ kho");
        } finally {
            setLoading(false);
        }
    };

    // Xử lý khi click xem chi tiết xe
    const handleViewDetails = (versionId) => {
        setSelectedVersionId(versionId);
        setDetailsVisible(true);
    };

    // Đóng popup chi tiết
    const handleCloseDetails = () => {
        setDetailsVisible(false);
        setSelectedVersionId(null);
    };

    // Format giá tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    // Format số ngắn gọn (165,990,000 -> 165.99 triệu)
    const formatPriceShort = (price) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(2)} triệu`;
        }
        return formatPrice(price);
    };

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState error={error} onRetry={fetchAllVehicleData} />;
    }

    // Tính toán thống kê
    const totalVehicles = vehicleTemplates.length;
    const availableVehicles = vehicleTemplates.filter(
        (v) => v.quantity > 0
    ).length;
    const activeVehicles = vehicleTemplates.filter((v) => v.isActive).length;
    const totalInventory = vehicleTemplates.reduce(
        (sum, v) => sum + v.quantity,
        0
    );

    return (
        <DealerStaffLayout>
            <PageContainer
                title="Danh Sách Xe Điện"
                subTitle={`${totalVehicles} mẫu xe | ${availableVehicles} có sẵn`}
                extra={[
                    <Button
                        key="refresh"
                        onClick={fetchAllVehicleData}
                        type="primary"
                        icon={<ReloadOutlined />}
                    >
                        Làm mới
                    </Button>,
                ]}
            >
                {/* Thống kê */}
                {/* <StatisticsCards
                    totalVehicles={totalVehicles}
                    availableVehicles={availableVehicles}
                    activeVehicles={activeVehicles}
                    totalInventory={totalInventory}
                /> */}

                {/* Danh sách xe */}
                {vehicleTemplates.length === 0 ? (
                    <EmptyState onReload={fetchAllVehicleData} />
                ) : (
                    <VehicleGrid
                        vehicles={vehicleTemplates}
                        formatPriceShort={formatPriceShort}
                        onViewDetails={handleViewDetails}
                    />
                )}

                {/* Popup chi tiết xe */}
                <VehicleDetails
                    visible={detailsVisible}
                    onClose={handleCloseDetails}
                    versionId={selectedVersionId}
                />
            </PageContainer>
        </DealerStaffLayout>
    );
}

export default EVVersionDetails;
