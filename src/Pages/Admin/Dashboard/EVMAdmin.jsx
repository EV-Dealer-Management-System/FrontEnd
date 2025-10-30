import React, { useState, useEffect } from 'react';
import { Button, message, Spin } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { ReloadOutlined, DashboardOutlined } from '@ant-design/icons';
import AdminLayout from '../../../Components/Admin/AdminLayout';
import { getAllEVInventory } from '../../../App/EVMAdmin/Dashboard/GetAllEVCInventory';
import { getAllEVBookings } from '../../../App/EVMAdmin/Dashboard/GetAllEVBooking';
import { EVMStaffAccountService } from '../../../App/EVMAdmin/Dashboard/GetAllEVMStaff';
import { GetAllEVDealer } from '../../../App/EVMAdmin/Dashboard/GetAllEVDealer';
import { getAllEVInventories } from '../../../App/EVMAdmin/Dashboard/GetAllEVCInventories';

// Import các components con
import DashboardStats from './Components/DashboardStats';
import BookingCharts from './Components/BookingCharts';
import BookingMetrics from './Components/BookingMetrics';
import InventoryOverview from './Components/InventoryOverview';

function EVMAdmin() {
  const [loading, setLoading] = useState(false);
  const [inventoryData, setInventoryData] = useState([]);
  const [bookingData, setBookingData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [dealerData, setDealerData] = useState([]);
  const [warehouseData, setWarehouseData] = useState([]);

  // Fetch dữ liệu từ API
  const fetchData = async () => {
    try {
      setLoading(true);

      // Gọi song song 5 API
      const [inventoryResponse, bookingResponse, staffResponse, dealerResponse, warehouseResponse] = await Promise.all([
        getAllEVInventory(),
        getAllEVBookings(),
        EVMStaffAccountService.getAllStaffAccounts({}),
        GetAllEVDealer({ pageSize: 1000 }),
        getAllEVInventories()
      ]);

      // Xử lý dữ liệu inventory
      if (inventoryResponse?.isSuccess && inventoryResponse?.result) {
        setInventoryData(inventoryResponse.result);
      }

      // Xử lý dữ liệu booking
      if (bookingResponse?.isSuccess && bookingResponse?.result?.data) {
        setBookingData(bookingResponse.result.data);
      }

      // Xử lý dữ liệu staff
      if (staffResponse?.isSuccess && staffResponse?.result) {
        console.log('Staff Data:', staffResponse.result);
        setStaffData(staffResponse.result);
      } else {
        console.log('Staff Response Error:', staffResponse);
      }

      // Xử lý dữ liệu dealer
      if (dealerResponse?.isSuccess && dealerResponse?.result?.data) {
        console.log('Dealer Data:', dealerResponse.result.data);
        setDealerData(dealerResponse.result.data);
      } else {
        console.log('Dealer Response Error:', dealerResponse);
      }

      // Xử lý dữ liệu warehouse/kho
      if (warehouseResponse?.isSuccess && warehouseResponse?.result) {
        console.log('Warehouse Data:', warehouseResponse.result);
        setWarehouseData(warehouseResponse.result);
      } else {
        console.log('Warehouse Response Error:', warehouseResponse);
      }

    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
      message.error('Không thể tải dữ liệu dashboard. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Xử lý refresh dữ liệu
  const handleRefresh = () => {
    fetchData();
  };

  return (
    <AdminLayout>
      <style>
        {`
          .ant-layout-content {
            padding: 0 !important;
            margin: 0 !important;
          }
          .ant-pro-page-container {
            padding: 0 !important;
            margin: 0 !important;
          }
          .ant-pro-page-container-children-content {
            padding: 0 !important;
            margin: 0 !important;
          }
          .ant-pro-grid-content {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .ant-pro-page-container .ant-pro-page-container-warp {
            padding: 0 !important;
            margin: 0 !important;
          }
        `}
      </style>
      <div style={{ margin: 0, padding: 0 }}>
        <PageContainer
          title={
            <div className="flex items-center">
              <DashboardOutlined className="mr-2 text-blue-500" />
              Dashboard Quản Lý Xe Điện
            </div>
          }
          subTitle="Tổng quan hệ thống quản lý bán xe điện cho hãng"
          extra={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              Làm mới dữ liệu
            </Button>
          }
        >
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" />
            </div>
          )}

          {!loading && (
            <div>
              {/* Thống kê tổng quan - 4 KPI cards với Statistic và Progress */}
              <DashboardStats
                inventoryData={inventoryData}
                bookingData={bookingData}
                staffData={staffData}
                dealerData={dealerData}
                warehouseData={warehouseData}
                loading={loading}
              />

              {/* Biểu đồ tròn (Phân bố trạng thái) và Biểu đồ cột (Xu hướng 7 ngày) */}
              <BookingCharts
                bookingData={bookingData}
                loading={loading}
              />

              {/* Performance Metrics - Pending/Approved/Completed với ProCard */}
              <BookingMetrics
                bookingData={bookingData}
                loading={loading}
              />

              {/* Tổng quan kho xe */}
              <InventoryOverview
                inventoryData={inventoryData}
                loading={loading}
              />
            </div>
          )}
        </PageContainer>
      </div>
    </AdminLayout>
  );
}

export default EVMAdmin;
