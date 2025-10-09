import React from 'react';
import {
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CarOutlined
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import BookingStatCard from './BookingStatCard';

// Component section thống kê - Dashboard chuyên nghiệp với Ant Design Pro
function BookingStatsSection({ bookings }) {
  // Helper function để lấy status an toàn (hỗ trợ cả số và string)
  const getStatusSafely = (status) => {
    if (status === null || status === undefined) return '';

    // Nếu status là số (0, 1, 2...), map sang string
    if (typeof status === 'number') {
      const numberStatusMap = {
        0: 'pending',
        1: 'confirmed',
        2: 'completed',
        3: 'cancelled',
        4: 'processing'
      };
      return numberStatusMap[status] || '';
    }

    if (typeof status === 'string') return status.toLowerCase();
    if (typeof status === 'object' && status.value) return String(status.value).toLowerCase();
    return String(status).toLowerCase();
  };

  // Tính toán các giá trị thống kê
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => getStatusSafely(b.status) === 'pending').length;
  const confirmedBookings = bookings.filter(b => {
    const status = getStatusSafely(b.status);
    return status === 'confirmed' || status === 'completed';
  }).length;

  // Tính tổng số lượng xe đặt
  const totalVehicles = bookings.reduce((sum, b) => sum + (b.totalQuantity || 0), 0);

  return (
    <ProCard
      // title="📊 Tổng Quan Đơn Đặt Xe"
      // subTitle="Thống kê đơn đặt xe và tình trạng xử lý"
      // className="mb-8"
      // bordered={false}
      // headerBordered
    >
      <ProCard.Group wrap gutter={[16, 16]}>
        <ProCard colSpan={{ xs: 24, sm: 12, lg: 6 }} bordered={false} hoverable>
          <BookingStatCard
            title="Tổng Đơn Đặt Xe"
            value={totalBookings}
            description="Tổng số đơn đặt xe đã nhận"
            icon={<ShoppingCartOutlined />}
            gradient="bg-white"
            iconColor="text-blue-500"
          />
        </ProCard>

        <ProCard colSpan={{ xs: 24, sm: 12, lg: 6 }} bordered={false} hoverable>
          <BookingStatCard
            title="Đơn Chờ Xử Lý"
            value={pendingBookings}
            description="Đơn đặt xe đang chờ xác nhận"
            icon={<ClockCircleOutlined />}
            gradient="bg-white"
            iconColor="text-orange-500"
          />
        </ProCard>

        <ProCard colSpan={{ xs: 24, sm: 12, lg: 6 }} bordered={false} hoverable>
          <BookingStatCard
            title="Đơn Đã Xác Nhận"
            value={confirmedBookings}
            description="Đơn đặt xe đã được xác nhận"
            icon={<CheckCircleOutlined />}
            gradient="bg-white"
            iconColor="text-green-500"
          />
        </ProCard>

        <ProCard colSpan={{ xs: 24, sm: 12, lg: 6 }} bordered={false} hoverable>
          <BookingStatCard
            title="Tổng Số Xe Đặt"
            value={`${totalVehicles} xe`}
            description="Tổng số lượng xe trong tất cả đơn"
            icon={<CarOutlined />}
            gradient="bg-white"
            iconColor="text-purple-500"
          />
        </ProCard>
      </ProCard.Group>
    </ProCard>
  );
}

export default BookingStatsSection;
