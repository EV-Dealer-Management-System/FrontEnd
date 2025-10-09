import React, { useMemo } from "react";
import { Row, Col } from "antd";
import { StatisticCard } from "@ant-design/pro-components";
import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Column } from "@ant-design/plots";

const { Divider } = StatisticCard;

function BookingStatistics({ bookings }) {
  // Tính toán thống kê
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => {
      const status =
        typeof b.status === "number"
          ? b.status
          : typeof b.status === "string"
          ? b.status.toLowerCase()
          : "";
      return status === 0 || status === "pending";
    }).length;

    const approved = bookings.filter((b) => {
      const status =
        typeof b.status === "number"
          ? b.status
          : typeof b.status === "string"
          ? b.status.toLowerCase()
          : "";
      return status === 1 || status === "approved";
    }).length;

    const rejected = bookings.filter((b) => {
      const status =
        typeof b.status === "number"
          ? b.status
          : typeof b.status === "string"
          ? b.status.toLowerCase()
          : "";
      return status === 2 || status === "rejected";
    }).length;

    const cancelled = bookings.filter((b) => {
      const status =
        typeof b.status === "number"
          ? b.status
          : typeof b.status === "string"
          ? b.status.toLowerCase()
          : "";
      return status === 3 || status === "cancelled";
    }).length;

    const completed = bookings.filter((b) => {
      const status =
        typeof b.status === "number"
          ? b.status
          : typeof b.status === "string"
          ? b.status.toLowerCase()
          : "";
      return status === 4 || status === "completed";
    }).length;

    const totalVehicles = bookings.reduce(
      (sum, b) => sum + (b.totalQuantity || 0),
      0
    );

    return {
      total,
      pending,
      approved,
      rejected,
      cancelled,
      completed,
      totalVehicles,
      successRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
      pendingRate: total > 0 ? ((pending / total) * 100).toFixed(1) : 0,
    };
  }, [bookings]);

  // Dữ liệu cho biểu đồ trạng thái
  const statusChartData = useMemo(
    () =>
      [
        { status: "Chờ xác nhận", value: stats.pending, color: "#faad14" },
        { status: "Đã phê duyệt", value: stats.approved, color: "#52c41a" },
        { status: "Đã từ chối", value: stats.rejected, color: "#ff4d4f" },
        { status: "Đã hủy", value: stats.cancelled, color: "#d9d9d9" },
        { status: "Hoàn thành", value: stats.completed, color: "#1890ff" },
      ].filter((item) => item.value > 0),
    [stats]
  );

  // Dữ liệu cho biểu đồ booking theo ngày (7 ngày gần nhất)
  const dailyBookingsData = useMemo(() => {
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

  const statusChartConfig = {
    data: statusChartData,
    xField: "status",
    yField: "value",
    seriesField: "status",
    color: ({ status }) => {
      const item = statusChartData.find((d) => d.status === status);
      return item?.color || "#1890ff";
    },
    label: {
      position: "top",
      style: {
        fill: "#000",
        opacity: 0.6,
        fontSize: 12,
      },
    },
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
    legend: false,
    height: 200,
    animation: {
      appear: {
        animation: "scale-in-y",
        duration: 800,
      },
    },
  };

  const dailyChartConfig = {
    data: dailyBookingsData,
    xField: "date",
    yField: "count",
    color: "#1890ff",
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
    label: {
      position: "top",
      style: {
        fill: "#000",
        opacity: 0.6,
        fontSize: 12,
      },
    },
    height: 200,
    animation: {
      appear: {
        animation: "scale-in-y",
        duration: 800,
      },
    },
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Thống kê tổng quan - Row 1 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl rounded-2xl overflow-hidden group">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-1 rounded-2xl">
              <StatisticCard
                statistic={{
                  title: (
                    <span className="text-gray-600 font-semibold flex items-center">
                      <CarOutlined className="mr-2" />
                      Tổng Booking
                    </span>
                  ),
                  value: stats.total,
                  valueStyle: {
                    color: "#1890ff",
                    fontSize: "32px",
                    fontWeight: "bold",
                  },
                }}
                chart={
                  <div className="px-4 py-2 bg-blue-50 rounded-lg mt-3">
                    <div className="text-sm text-green-600 font-medium flex items-center justify-between">
                      <span className="flex items-center">
                        <RiseOutlined className="mr-1" />
                        Tổng số xe
                      </span>
                      <span className="font-bold text-lg">
                        {stats.totalVehicles}
                      </span>
                    </div>
                  </div>
                }
                chartPlacement="bottom"
                className="group-hover:shadow-inner"
              />
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl rounded-2xl overflow-hidden group">
            <div className="bg-gradient-to-br from-orange-400 to-orange-500 p-1 rounded-2xl">
              <StatisticCard
                statistic={{
                  title: (
                    <span className="text-gray-600 font-semibold flex items-center">
                      <ClockCircleOutlined className="mr-2" />
                      Chờ Xác Nhận
                    </span>
                  ),
                  value: stats.pending,
                  valueStyle: {
                    color: "#fa8c16",
                    fontSize: "32px",
                    fontWeight: "bold",
                  },
                  description: (
                    <div className="mt-2 px-3 py-1.5 bg-orange-50 rounded-lg inline-block">
                      <span className="text-orange-600 font-semibold text-sm">
                        {stats.pendingRate}% tổng số
                      </span>
                    </div>
                  ),
                }}
                className="group-hover:shadow-inner"
              />
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl rounded-2xl overflow-hidden group">
            <div className="bg-gradient-to-br from-green-400 to-green-500 p-1 rounded-2xl">
              <StatisticCard
                statistic={{
                  title: (
                    <span className="text-gray-600 font-semibold flex items-center">
                      <CheckCircleOutlined className="mr-2" />
                      Đã Phê Duyệt
                    </span>
                  ),
                  value: stats.approved,
                  valueStyle: {
                    color: "#52c41a",
                    fontSize: "32px",
                    fontWeight: "bold",
                  },
                }}
                className="group-hover:shadow-inner"
              />
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl rounded-2xl overflow-hidden group">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-1 rounded-2xl">
              <StatisticCard
                statistic={{
                  title: (
                    <span className="text-gray-600 font-semibold flex items-center">
                      <CheckCircleOutlined className="mr-2" />
                      Hoàn Thành
                    </span>
                  ),
                  value: stats.completed,
                  valueStyle: {
                    color: "#1890ff",
                    fontSize: "32px",
                    fontWeight: "bold",
                  },
                  description: (
                    <div className="mt-2 px-3 py-1.5 bg-blue-50 rounded-lg inline-block">
                      <span className="text-blue-600 font-semibold text-sm">
                        Tỷ lệ {stats.successRate}%
                      </span>
                    </div>
                  ),
                }}
                className="group-hover:shadow-inner"
              />
            </div>
          </div>
        </Col>
      </Row>

      {/* Biểu đồ phân tích */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <div className="transition-all duration-300 hover:shadow-2xl rounded-2xl overflow-hidden">
            <StatisticCard
              title={
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <CheckCircleOutlined className="text-white" />
                  </div>
                  <span className="font-bold text-gray-700">
                    Phân Bố Theo Trạng Thái
                  </span>
                </div>
              }
              chart={
                statusChartData.length > 0 ? (
                  <Column {...statusChartConfig} />
                ) : (
                  <div className="h-52 flex flex-col items-center justify-center text-gray-400">
                    <CarOutlined className="text-6xl mb-3 opacity-30" />
                    <span>Chưa có dữ liệu</span>
                  </div>
                )
              }
              bordered
              className="shadow-lg"
            />
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div className="transition-all duration-300 hover:shadow-2xl rounded-2xl overflow-hidden">
            <StatisticCard
              title={
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <CalendarOutlined className="text-white" />
                  </div>
                  <span className="font-bold text-gray-700">
                    Booking 7 Ngày Gần Nhất
                  </span>
                </div>
              }
              chart={<Column {...dailyChartConfig} />}
              bordered
              className="shadow-lg"
            />
          </div>
        </Col>
      </Row>

      {/* Thống kê bổ sung */}
      <Row gutter={16}>
        <Col span={24}>
          <div className="transition-all duration-300 hover:shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-1 rounded-2xl">
              <StatisticCard.Group className="bg-white rounded-xl">
                <StatisticCard
                  statistic={{
                    title: (
                      <span className="font-semibold text-gray-600">
                        Đã Từ Chối
                      </span>
                    ),
                    value: stats.rejected,
                    valueStyle: { color: "#ff4d4f", fontWeight: "bold" },
                    icon: (
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <CloseCircleOutlined className="text-red-500 text-xl" />
                      </div>
                    ),
                  }}
                />
                <Divider type="vertical" />
                <StatisticCard
                  statistic={{
                    title: (
                      <span className="font-semibold text-gray-600">
                        Đã Hủy
                      </span>
                    ),
                    value: stats.cancelled,
                    valueStyle: { color: "#8c8c8c", fontWeight: "bold" },
                    icon: (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <CloseCircleOutlined className="text-gray-500 text-xl" />
                      </div>
                    ),
                  }}
                />
                <Divider type="vertical" />
                <StatisticCard
                  statistic={{
                    title: (
                      <span className="font-semibold text-gray-600">
                        Tổng Số Xe
                      </span>
                    ),
                    value: stats.totalVehicles,
                    suffix: "xe",
                    valueStyle: { color: "#722ed1", fontWeight: "bold" },
                    icon: (
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <CarOutlined className="text-purple-600 text-xl" />
                      </div>
                    ),
                  }}
                />
                <Divider type="vertical" />
                <StatisticCard
                  statistic={{
                    title: (
                      <span className="font-semibold text-gray-600">
                        Trung Bình
                      </span>
                    ),
                    value:
                      stats.total > 0
                        ? (stats.totalVehicles / stats.total).toFixed(1)
                        : 0,
                    suffix: "xe/booking",
                    valueStyle: { color: "#eb2f96", fontWeight: "bold" },
                    icon: (
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                        <RiseOutlined className="text-pink-500 text-xl" />
                      </div>
                    ),
                  }}
                />
              </StatisticCard.Group>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default BookingStatistics;
