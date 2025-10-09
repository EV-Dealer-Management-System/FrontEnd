import React, { useState, useEffect, useMemo } from "react";
import { message, Layout, Tag, Tabs, Badge } from "antd";
import {
  PageContainer,
  ProCard,
  StatisticCard,
} from "@ant-design/pro-components";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { getAllEVBookings } from "../../../App/DealerManager/EVBooking/GetAllEVBooking";
import { getBookingById } from "../../../App/DealerManager/EVBooking/GetBookingByID";
import NavigationBar from "../../../Components/DealerManager/Components/NavigationBar";
import BookingFilters from "./Components/BookingFilters";
import BookingTable from "./Components/BookingTable";
import BookingDetailDrawer from "./Components/BookingDetailDrawer";

const { Content } = Layout;

function GetAllEVBooking() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Xử lý responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load danh sách booking khi component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Lấy danh sách booking từ API
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await getAllEVBookings();

      if (response && response.isSuccess) {
        const data = response.result || response.data || [];
        const bookingsList = Array.isArray(data) ? data : [];

        // Map data để thêm thông tin từ bookingEVDetails
        const enhancedBookings = bookingsList.map((booking) => {
          // Tính tổng số lượng xe từ bookingEVDetails
          const totalQuantity =
            booking.bookingEVDetails?.reduce(
              (sum, detail) => sum + (detail.quantity || 0),
              0
            ) ||
            booking.totalQuantity ||
            0;

          // Tính tổng giá trị
          const totalAmount =
            booking.bookingEVDetails?.reduce(
              (sum, detail) => sum + (detail.totalPrice || 0),
              0
            ) ||
            booking.totalAmount ||
            0;

          return {
            ...booking,
            totalQuantity,
            totalAmount,
            // Giữ nguyên bookingEVDetails để hiển thị chi tiết
            bookingEVDetails: booking.bookingEVDetails || [],
          };
        });

        setBookings(enhancedBookings);
        message.success(`Đã tải ${enhancedBookings.length} booking thành công`);
      } else {
        message.error(response?.message || "Không thể tải danh sách booking");
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Có lỗi khi tải danh sách booking");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Xem chi tiết booking
  const handleViewDetail = async (record) => {
    setDetailDrawerVisible(true);
    setDetailLoading(true);
    setSelectedBooking(null); // Reset trước khi fetch

    try {
      const response = await getBookingById(record.id);

      if (response && response.isSuccess) {
        setSelectedBooking(response.result);
      } else {
        message.error(response?.message || "Không thể tải chi tiết booking");
        setDetailDrawerVisible(false);
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      message.error("Có lỗi khi tải chi tiết booking");
      setDetailDrawerVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Reset bộ lọc
  const handleResetFilters = () => {
    setSearchText("");
    setActiveTab("all");
    setDateRange(null);
  };

  // Tính toán thống kê
  const statistics = useMemo(() => {
    const getStatus = (booking) => {
      if (typeof booking.status === "number") return booking.status;
      return 0;
    };

    const stats = {
      total: bookings.length,
      pending: bookings.filter((b) => getStatus(b) === 0).length,
      approved: bookings.filter((b) => getStatus(b) === 1).length,
      rejected: bookings.filter((b) => getStatus(b) === 2).length,
      cancelled: bookings.filter((b) => getStatus(b) === 3).length,
      completed: bookings.filter((b) => getStatus(b) === 4).length,
      totalVehicles: bookings.reduce(
        (sum, b) => sum + (b.totalQuantity || 0),
        0
      ),
    };

    return stats;
  }, [bookings]);

  // Format ngày giờ
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Format tiền tệ
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Hiển thị trạng thái booking
  const getStatusTag = (status) => {
    let statusValue = "";
    if (status === null || status === undefined) {
      statusValue = "";
    } else if (typeof status === "number") {
      const numberStatusMap = {
        0: "pending",
        1: "approved",
        2: "rejected",
        3: "cancelled",
        4: "completed",
      };
      statusValue = numberStatusMap[status] || "";
    } else if (typeof status === "string") {
      statusValue = status.toLowerCase();
    } else if (typeof status === "object" && status.value !== undefined) {
      statusValue = String(status.value).toLowerCase();
    } else {
      statusValue = String(status).toLowerCase();
    }

    const statusMap = {
      pending: { color: "orange", text: "Chờ xác nhận" },
      approved: { color: "green", text: "Đã phê duyệt" },
      rejected: { color: "red", text: "Đã từ chối" },
      cancelled: { color: "default", text: "Đã hủy" },
      completed: { color: "blue", text: "Hoàn thành" },
    };

    const statusInfo = statusMap[statusValue] || {
      color: "default",
      text: status || "Không xác định",
    };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  // Lọc dữ liệu
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Filter by search text
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const toString = (value) => {
          if (!value) return "";
          if (typeof value === "string") return value;
          if (typeof value === "object" && value.value !== undefined)
            return String(value.value);
          return String(value);
        };

        const matchesSearch =
          toString(booking.id).toLowerCase().includes(searchLower) ||
          toString(booking.dealerId).toLowerCase().includes(searchLower) ||
          toString(booking.createdBy).toLowerCase().includes(searchLower) ||
          toString(booking.note).toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Filter by active tab (status)
      if (activeTab && activeTab !== "all") {
        const statusMap = {
          pending: 0,
          approved: 1,
          rejected: 2,
          cancelled: 3,
          completed: 4,
        };
        const filterStatusValue = statusMap[activeTab];
        const bookingStatus =
          typeof booking.status === "number" ? booking.status : 0;

        if (bookingStatus !== filterStatusValue) return false;
      }

      // Filter by date range
      if (dateRange && dateRange[0] && dateRange[1]) {
        const bookingDate = new Date(booking.bookingDate);
        const startDate = dateRange[0].startOf("day").toDate();
        const endDate = dateRange[1].endOf("day").toDate();

        if (bookingDate < startDate || bookingDate > endDate) return false;
      }

      return true;
    });
  }, [bookings, searchText, activeTab, dateRange]);

  return (
    <Layout className="min-h-screen bg-gray-50">
      <NavigationBar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        isMobile={isMobile}
      />
      <Layout
        className="transition-all duration-200"
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 64 : 280,
        }}
      >
        <Content style={{ margin: "16px" }}>
          <PageContainer
            header={{
              title: "Quản Lý Booking",
              subTitle: "Duyệt và theo dõi đơn đặt xe",
              ghost: true,
            }}
          >
            {/* Thống kê tổng quan - Gọn gàng hơn */}
            <ProCard ghost gutter={[16, 16]} style={{ marginBlockEnd: 16 }}>
              <ProCard colSpan={6}>
                <StatisticCard
                  statistic={{
                    title: "Tổng Booking",
                    value: statistics.total,
                    icon: <FileTextOutlined style={{ color: "#1890ff" }} />,
                  }}
                  chart={
                    <div
                      style={{ fontSize: 12, color: "#8c8c8c", marginTop: 8 }}
                    >
                      {statistics.totalVehicles} xe
                    </div>
                  }
                  chartPlacement="bottom"
                />
              </ProCard>
              <ProCard colSpan={6}>
                <StatisticCard
                  statistic={{
                    title: "Chờ Duyệt",
                    value: statistics.pending,
                    valueStyle: { color: "#fa8c16" },
                    icon: <ClockCircleOutlined style={{ color: "#fa8c16" }} />,
                  }}
                />
              </ProCard>
              <ProCard colSpan={6}>
                <StatisticCard
                  statistic={{
                    title: "Đã Phê Duyệt",
                    value: statistics.approved,
                    valueStyle: { color: "#52c41a" },
                    icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
                  }}
                />
              </ProCard>
              <ProCard colSpan={6}>
                <StatisticCard
                  statistic={{
                    title: "Hoàn Thành",
                    value: statistics.completed,
                    valueStyle: { color: "#1890ff" },
                    icon: <CarOutlined style={{ color: "#1890ff" }} />,
                  }}
                />
              </ProCard>
            </ProCard>

            {/* Bộ lọc - Gọn gàng hơn */}
            <ProCard style={{ marginBlockEnd: 16 }}>
              <BookingFilters
                searchText={searchText}
                onSearchChange={setSearchText}
                statusFilter={activeTab}
                onStatusFilterChange={setActiveTab}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onReset={handleResetFilters}
                onReload={fetchBookings}
                loading={loading}
              />
            </ProCard>

            {/* Tabs để phân loại theo trạng thái */}
            <ProCard>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                type="card"
                items={[
                  {
                    key: "all",
                    label: (
                      <span>
                        Tất cả <Badge count={statistics.total} showZero />
                      </span>
                    ),
                    children: (
                      <BookingTable
                        dataSource={filteredBookings}
                        loading={loading}
                        onViewDetail={handleViewDetail}
                        formatDateTime={formatDateTime}
                        onStatusUpdate={fetchBookings}
                      />
                    ),
                  },
                  {
                    key: "pending",
                    label: (
                      <span>
                        <ClockCircleOutlined /> Chờ Duyệt{" "}
                        <Badge
                          count={statistics.pending}
                          style={{ backgroundColor: "#fa8c16" }}
                        />
                      </span>
                    ),
                    children: (
                      <BookingTable
                        dataSource={filteredBookings}
                        loading={loading}
                        onViewDetail={handleViewDetail}
                        formatDateTime={formatDateTime}
                        onStatusUpdate={fetchBookings}
                      />
                    ),
                  },
                  {
                    key: "approved",
                    label: (
                      <span>
                        <CheckCircleOutlined /> Đã Duyệt{" "}
                        <Badge
                          count={statistics.approved}
                          style={{ backgroundColor: "#52c41a" }}
                        />
                      </span>
                    ),
                    children: (
                      <BookingTable
                        dataSource={filteredBookings}
                        loading={loading}
                        onViewDetail={handleViewDetail}
                        formatDateTime={formatDateTime}
                        onStatusUpdate={fetchBookings}
                      />
                    ),
                  },
                  {
                    key: "completed",
                    label: (
                      <span>
                        <CarOutlined /> Hoàn Thành{" "}
                        <Badge
                          count={statistics.completed}
                          style={{ backgroundColor: "#1890ff" }}
                        />
                      </span>
                    ),
                    children: (
                      <BookingTable
                        dataSource={filteredBookings}
                        loading={loading}
                        onViewDetail={handleViewDetail}
                        formatDateTime={formatDateTime}
                        onStatusUpdate={fetchBookings}
                      />
                    ),
                  },
                  {
                    key: "rejected",
                    label: (
                      <span>
                        <CloseCircleOutlined /> Đã Từ Chối{" "}
                        <Badge
                          count={statistics.rejected}
                          style={{ backgroundColor: "#ff4d4f" }}
                        />
                      </span>
                    ),
                    children: (
                      <BookingTable
                        dataSource={filteredBookings}
                        loading={loading}
                        onViewDetail={handleViewDetail}
                        formatDateTime={formatDateTime}
                        onStatusUpdate={fetchBookings}
                      />
                    ),
                  },
                ]}
              />
            </ProCard>
          </PageContainer>
        </Content>
      </Layout>

      {/* Drawer chi tiết */}
      <BookingDetailDrawer
        visible={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        booking={selectedBooking}
        loading={detailLoading}
        formatDateTime={formatDateTime}
        formatCurrency={formatCurrency}
        getStatusTag={getStatusTag}
      />
    </Layout>
  );
}

export default GetAllEVBooking;
