import React, { useState, useEffect, useCallback } from "react";
import { Table, Card, message, Spin, Tag, Input, Button, Space, Statistic, Row, Col } from "antd";
import { SearchOutlined, ReloadOutlined, CarOutlined, EyeOutlined } from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import DealerManagerLayout from "../../../Components/DealerManager/DealerManagerLayout";
import { GetEVDealerInventory } from "../../../App/DealerManager/EVInventory/GetEVDealerInventory";
import VehicleDetailModal from "./Components/VehicleDetailModal";

const { Search } = Input;

function GetAllEVInventory() {
    const [loading, setLoading] = useState(false);
    const [inventoryData, setInventoryData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    // Lấy dealerId từ localStorage (giả sử được lưu khi đăng nhập)
    const dealerId = localStorage.getItem("dealerId") || "1"; // fallback cho demo

    // Fetch dữ liệu kho xe
    const fetchInventoryData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await GetEVDealerInventory(dealerId);

            if (response.isSuccess) {
                // Thêm key cho mỗi item để Table hoạt động tốt
                const dataWithKeys = response.result.map((item, index) => ({
                    ...item,
                    key: index,
                    id: index + 1
                }));

                setInventoryData(dataWithKeys);
                setFilteredData(dataWithKeys);
                message.success("Tải dữ liệu kho xe thành công!");
            } else {
                message.error(response.message || "Có lỗi xảy ra khi tải dữ liệu");
            }
        } catch (error) {
            console.error("Error fetching inventory:", error);
            message.error("Không thể tải dữ liệu kho xe. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    }, [dealerId]);    // Tìm kiếm
    const handleSearch = (value) => {
        setSearchText(value);
        if (!value) {
            setFilteredData(inventoryData);
        } else {
            const filtered = inventoryData.filter(item =>
                item.modelName.toLowerCase().includes(value.toLowerCase()) ||
                item.versionName.toLowerCase().includes(value.toLowerCase()) ||
                item.colorName.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredData(filtered);
        }
    };

    // Làm mới dữ liệu
    const handleRefresh = () => {
        setSearchText("");
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

    // Tính toán thống kê
    const totalVehicles = filteredData.reduce((sum, item) => sum + item.quantity, 0);
    const totalModels = new Set(filteredData.map(item => item.modelName)).size;
    const totalVersions = new Set(filteredData.map(item => item.versionName)).size;

    // Cấu hình cột cho bảng
    const columns = [
        {
            title: "STT",
            dataIndex: "id",
            key: "id",
            width: 60,
            className: "text-center font-medium",
        },
        {
            title: "Tên Model",
            dataIndex: "modelName",
            key: "modelName",
            className: "font-medium text-blue-600",
            sorter: (a, b) => a.modelName.localeCompare(b.modelName),
        },
        {
            title: "Phiên Bản",
            dataIndex: "versionName",
            key: "versionName",
            className: "text-gray-700",
            sorter: (a, b) => a.versionName.localeCompare(b.versionName),
        },
        {
            title: "Màu Sắc",
            dataIndex: "colorName",
            key: "colorName",
            render: (color) => (
                <Tag color="blue" className="px-3 py-1 rounded-full font-medium">
                    {color}
                </Tag>
            ),
            sorter: (a, b) => a.colorName.localeCompare(b.colorName),
        },
        {
            title: "Số Lượng",
            dataIndex: "quantity",
            key: "quantity",
            render: (quantity) => (
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full font-bold ${quantity > 5 ? 'bg-green-100 text-green-700' :
                        quantity > 0 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {quantity} xe
                    </span>
                </div>
            ),
            sorter: (a, b) => a.quantity - b.quantity,
        },
        {
            title: "Trạng Thái",
            key: "status",
            render: (_, record) => {
                const { quantity } = record;
                if (quantity > 5) {
                    return <Tag color="success">Còn Nhiều</Tag>;
                } else if (quantity > 0) {
                    return <Tag color="warning">Sắp Hết</Tag>;
                } else {
                    return <Tag color="error">Hết Hàng</Tag>;
                }
            },
        },
        {
            title: "Số Vin",
            key: "viNs",
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => showDetailModal(record)}
                    className="bg-blue-500 hover:bg-blue-600"
                >
                    Xem Chi Tiết
                </Button>
            ),
        }
    ];

    useEffect(() => {
        fetchInventoryData();
    }, [fetchInventoryData]); return (
        <DealerManagerLayout>
            <PageContainer
                title="Quản Lý Kho Xe"
                subTitle="Theo dõi số lượng xe điện trong kho đại lý"
                extra={[
                    <Button
                        key="refresh"
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        loading={loading}
                        className="bg-blue-500 hover:bg-blue-600"
                    >
                        Làm Mới
                    </Button>
                ]}
                className="bg-white"
            >
                <div className="space-y-6">
                    {/* Thống kê tổng quan */}
                    <Row gutter={[16, 16]} className="mb-6">
                        <Col xs={24} sm={8}>
                            <Card className="text-center border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                                <Statistic
                                    title="Tổng Số Xe"
                                    value={totalVehicles}
                                    prefix={<CarOutlined className="text-blue-500" />}
                                    valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card className="text-center border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                                <Statistic
                                    title="Số Model"
                                    value={totalModels}
                                    valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 'bold' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card className="text-center border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                                <Statistic
                                    title="Số Phiên Bản"
                                    value={totalVersions}
                                    valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 'bold' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Tìm kiếm */}
                    <Card className="shadow-sm border border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800 m-0">
                                Danh Sách Xe Trong Kho
                            </h3>
                            <Search
                                placeholder="Tìm kiếm theo tên model, phiên bản hoặc màu sắc..."
                                allowClear
                                enterButton={<SearchOutlined />}
                                size="large"
                                value={searchText}
                                onChange={(e) => handleSearch(e.target.value)}
                                onSearch={handleSearch}
                                className="max-w-md"
                            />
                        </div>
                    </Card>

                    {/* Bảng dữ liệu */}
                    <Card className="shadow-lg border border-gray-200">
                        <Spin spinning={loading} tip="Đang tải dữ liệu...">
                            <Table
                                columns={columns}
                                dataSource={filteredData}
                                pagination={{
                                    total: filteredData.length,
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total, range) =>
                                        `${range[0]}-${range[1]} của ${total} xe`,
                                    className: "text-center",
                                }}
                                scroll={{ x: 800 }}
                                className="custom-table"
                                locale={{
                                    emptyText: (
                                        <div className="text-center py-8">
                                            <CarOutlined className="text-4xl text-gray-300 mb-4" />
                                            <p className="text-gray-500 text-lg">
                                                {searchText ? "Không tìm thấy xe nào" : "Chưa có xe trong kho"}
                                            </p>
                                        </div>
                                    ),
                                }}
                            />
                        </Spin>
                    </Card>
                </div>
            </PageContainer>

            {/* Modal hiển thị chi tiết số VIN */}
            <VehicleDetailModal
                visible={isModalVisible}
                onClose={handleCloseModal}
                vehicle={selectedVehicle}
            />

            <style jsx>{`
        .custom-table .ant-table-thead > tr > th {
          background-color: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
          font-weight: 600;
          color: #334155;
        }
        
        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: #f1f5f9;
        }
        
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9;
        }
      `}</style>
        </DealerManagerLayout>
    );
}

export default GetAllEVInventory;
