import React, { useState, useEffect, useMemo } from "react";
import {
  message,
  Layout,
  Tag,
  Row,
  Col,
  Card,
  Progress,
  Statistic,
} from "antd";
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
  TrophyOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { getAllEVBookings } from "../../../App/DealerManager/EVBooking/GetAllEVBooking";
import { getBookingById } from "../../../App/DealerManager/EVBooking/GetBookingByID";
import NavigationBar from "../../../Components/DealerManager/Components/NavigationBar";
import BookingFilters from "./Components/BookingFilters";
import BookingTable from "./Components/BookingTable";
import BookingDetailDrawer from "./Components/BookingDetailDrawer";
import StatusDistributionChart from "./Components/StatusDistributionChart";
import TrendChart from "./Components/TrendChart";
import {ConfigProvider} from "antd";
import viVN from 'antd/lib/locale/vi_VN';

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
      draft: bookings.filter((b) => getStatus(b) === 0).length,      // Draft = 0
      pending: bookings.filter((b) => getStatus(b) === 1).length,    // Pending = 1
      approved: bookings.filter((b) => getStatus(b) === 2).length,   // Approved = 2
      rejected: bookings.filter((b) => getStatus(b) === 3).length,   // Rejected = 3
      cancelled: bookings.filter((b) => getStatus(b) === 4).length,  // Cancelled = 4
      completed: bookings.filter((b) => getStatus(b) === 5).length,  // Completed = 5
      totalVehicles: bookings.reduce(
        (sum, b) => sum + (b.totalQuantity || 0),
        0
      ),
    };

    // Tính tỷ lệ phê duyệt
    stats.approvalRate =
      stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0;

    // Tính tỷ lệ hoàn thành
    stats.completionRate =
      stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0;

    // Tính trung bình xe/booking
    stats.avgVehiclesPerBooking =
      stats.total > 0 ? (stats.totalVehicles / stats.total).toFixed(1) : 0;

    return stats;
  }, [bookings]);

  // Dữ liệu cho biểu đồ phân bố trạng thái
  const statusChartData = useMemo(() => {
    return [
      { type: "Bản Nháp", value: statistics.draft, color: "#8c8c8c" },
      { type: "Chờ Duyệt", value: statistics.pending, color: "#fa8c16" },
      { type: "Đã Duyệt", value: statistics.approved, color: "#52c41a" },
      { type: "Hoàn Thành", value: statistics.completed, color: "#1890ff" },
      { type: "Từ Chối", value: statistics.rejected, color: "#ff4d4f" },
    ].filter((item) => item.value > 0);
  }, [statistics]);

  // Dữ liệu cho biểu đồ xu hướng 7 ngày
  const trendChartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    return last7Days.map((date) => {
      const count = bookings.filter((b) => {
        if (!b.bookingDate) return false;
        const bookingDate = new Date(b.bookingDate).toISOString().split("T")[0];
        return bookingDate === date;
      }).length;

      return {
        date: new Date(date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        count,
      };
    });
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
    // Mapping theo BookingStatus enum: Draft=0, Pending=1, Approved=2, Rejected=3, Cancelled=4, Completed=5
    const statusMap = {
      0: { color: "default", text: "Bản Nháp" },
      1: { color: "orange", text: "Chờ Duyệt" },
      2: { color: "green", text: "Đã Duyệt" },
      3: { color: "red", text: "Từ Chối" },
      4: { color: "default", text: "Đã Hủy" },
      5: { color: "blue", text: "Hoàn Thành" },
    };

    const statusInfo = statusMap[status] || {
      color: "default",
      text: "Không xác định",
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

      // Filter by active tab (status) - Updated mapping theo enum BookingStatus
      if (activeTab && activeTab !== "all") {
        const statusMap = {
          draft: 0,      // Draft = 0
          pending: 1,    // Pending = 1 
          approved: 2,   // Approved = 2
          rejected: 3,   // Rejected = 3
          cancelled: 4,  // Cancelled = 4
          completed: 5,  // Completed = 5
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
    <Layout className="min-h-screen" style={{ background: "#f0f2f5" }}>
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
        <Content style={{ margin: "24px 16px" }}>
          <PageContainer
            header={{
              title: (
                <span style={{ fontSize: 24, fontWeight: 600 }}>
                  Dashboard Đại Lý Xe Máy Điện
                </span>
              ),
              subTitle: (
                <span style={{ fontSize: 14, color: "#8c8c8c" }}>
                  Quản lý booking và theo dõi hiệu suất bán hàng
                </span>
              ),
              ghost: false,
              extra: [
                <Tag
                  key="pending"
                  color="orange"
                  icon={<ClockCircleOutlined />}
                >
                  {statistics.pending} Chờ Duyệt
                </Tag>,
              ],
            }}
          >
            {/* KPI Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} hoverable>
                  <Statistic
                    title="Tổng Booking"
                    value={statistics.total}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                  <Progress
                    percent={100}
                    strokeColor="#1890ff"
                    showInfo={false}
                    style={{ marginTop: 8 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} hoverable>
                  <Statistic
                    title="Tổng Số Xe"
                    value={statistics.totalVehicles}
                    prefix={<CarOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                    suffix="xe"
                  />
                  <Progress
                    percent={100}
                    strokeColor="#52c41a"
                    showInfo={false}
                    style={{ marginTop: 8 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} hoverable>
                  <Statistic
                    title="Tỷ Lệ Phê Duyệt"
                    value={statistics.approvalRate}
                    prefix={<TrophyOutlined />}
                    suffix="%"
                    valueStyle={{ color: "#faad14" }}
                  />
                  <Progress
                    percent={statistics.approvalRate}
                    strokeColor="#faad14"
                    showInfo={false}
                    style={{ marginTop: 8 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} hoverable>
                  <Statistic
                    title="TB Xe/Booking"
                    value={statistics.avgVehiclesPerBooking}
                    prefix={<ThunderboltOutlined />}
                    valueStyle={{ color: "#722ed1" }}
                    suffix="xe"
                  />
                  <Progress
                    percent={Math.min(
                      statistics.avgVehiclesPerBooking * 10,
                      100
                    )}
                    strokeColor="#722ed1"
                    showInfo={false}
                    style={{ marginTop: 8 }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Charts Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} lg={12}>
                <StatusDistributionChart
                  data={statusChartData}
                  total={statistics.total}
                />
              </Col>

              <Col xs={24} lg={12}>
                <TrendChart data={trendChartData} />
              </Col>
            </Row>

            {/* Performance Metrics */}
            <ProCard ghost gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <ProCard colSpan={8} bordered>
                <Statistic
                  title="Chờ Duyệt"
                  value={statistics.pending}
                  valueStyle={{ color: "#fa8c16" }}
                  prefix={<ClockCircleOutlined />}
                  suffix={`/ ${statistics.total}`}
                />
              </ProCard>
              <ProCard colSpan={8} bordered>
                <Statistic
                  title="Đã Duyệt"
                  value={statistics.approved}
                  valueStyle={{ color: "#52c41a" }}
                  prefix={<CheckCircleOutlined />}
                  suffix={`/ ${statistics.total}`}
                />
              </ProCard>
              <ProCard colSpan={8} bordered>
                <Statistic
                  title="Hoàn Thành"
                  value={statistics.completed}
                  valueStyle={{ color: "#1890ff" }}
                  prefix={<CarOutlined />}
                  suffix={`/ ${statistics.total}`}
                />
              </ProCard>
            </ProCard>

            {/* Filters */}
            <ProCard style={{ marginBottom: 16 }} bordered>
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

            <ConfigProvider locale={viVN}>
              {/* Booking Table */}
              <ProCard
                title="Danh Sách Booking"
                bordered
                headerBordered
              extra={<Tag color="blue">{filteredBookings.length} booking</Tag>}
            >
              <BookingTable
                dataSource={filteredBookings}
                loading={loading}
                onViewDetail={handleViewDetail}
                formatDateTime={formatDateTime}
                onStatusUpdate={fetchBookings}
              />
            </ProCard>
            </ConfigProvider>
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
