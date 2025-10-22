import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import {
  Table,
  Button,
  Select,
  Input,
  Space,
  Tag,
  Row,
  Col,
  Typography,
  Card
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  FileTextOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import DealerManagerLayout from '../../../Components/DealerManager/DealerManagerLayout';

// Import components
import useBookingList from './Components/useBookingList';
import useBookingContract from './Components/useBookingContract';
import BookingDetailsDrawer from './Components/BookingDetailsDrawer';

const { Search } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

function BookingManagementPage() {
  // State quản lý UI
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);

  // Hooks
  const { bookings, loading, filters, updateFilter, reload } = useBookingList();
  const bookingContract = useBookingContract();

  // Hàm xử lý xem chi tiết booking
  const handleViewBooking = async (booking) => {
    try {
      setSelectedBooking(booking);
      setDetailDrawerVisible(true);
    } catch (error) {
      console.error('Error viewing booking:', error);
    }
  };

  // Render trạng thái booking
  const renderStatus = (booking) => {
    const { label, color } = booking.statusInfo;
    return <Tag color={color}>{label}</Tag>;
  };

  // Render thông tin xe
  const renderVehicleInfo = (bookingEVDetails) => {
    if (!bookingEVDetails || bookingEVDetails.length === 0) {
      return <Text type="secondary">Không có thông tin xe</Text>;
    }

    return (
      <div className="space-y-1">
        {bookingEVDetails.map((detail, index) => (
          <div key={index} className="text-sm">
            <Text>Xe {index + 1}: </Text>
            <Text strong>Model {detail.version?.modelId?.substring(0, 8)}...</Text>
            <Text className="ml-2">SL: {detail.quantity}</Text>
          </div>
        ))}
      </div>
    );
  };

  // Cấu hình columns table
  const columns = [
    {
      title: 'ID Booking',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      responsive: ['md'],
      render: (id) => (
        <Text className="font-mono text-xs">
          {id?.substring(0, 8)}...
        </Text>
      ),
    },
    {
      title: 'Ngày booking',
      dataIndex: 'bookingDate',
      key: 'bookingDate',
      width: 140,
      responsive: ['lg'],
      render: (date) => (
        <div className="text-sm">
          <CalendarOutlined className="mr-1 text-blue-500" />
          {dayjs(date).format('DD/MM/YYYY')}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (_, booking) => renderStatus(booking),
    },
    {
      title: 'Thông tin xe',
      dataIndex: 'bookingEVDetails',
      key: 'vehicleInfo',
      width: 200,
      responsive: ['xl'],
      render: renderVehicleInfo,
    },
    {
      title: 'Tổng số lượng',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 100,
      responsive: ['md'],
      align: 'center',
      render: (qty) => (
        <Tag color="blue">{qty} xe</Tag>
      ),
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (note) => (
        <Text type="secondary" className="text-sm">
          {note || 'Không có ghi chú'}
        </Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, booking) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewBooking(booking)}
          >
            Xem
          </Button>
          {booking.statusInfo.canSign && (
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleViewBooking(booking)}
            >
              Ký
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Thống kê nhanh
  const getQuickStats = () => {
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 1 || b.status === 2).length,
      inProgress: bookings.filter(b => b.status === 3).length,
      completed: bookings.filter(b => b.status === 4).length
    };
    return stats;
  };

  const stats = getQuickStats();

  return (
    <DealerManagerLayout>
    <PageContainer
      title="Quản lý Booking"
      subTitle="Xem và ký hợp đồng booking từ đại lý"
      extra={[
        <FileTextOutlined key="icon" className="text-2xl text-blue-500" />
      ]}
    >
      {/* Quick Stats */}
      <Row gutter={[12, 12]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-gray-600">Tổng booking</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <div className="text-gray-600">Chờ ký</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <div className="text-gray-600">Đang xử lý</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-gray-600">Hoàn thành</div>
          </Card>
        </Col>
      </Row>

      {/* Filter Section */}
      <Card className="mb-6">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Tìm theo ID, ghi chú, người tạo"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => updateFilter('status', value)}
              allowClear
            >
              <Option value={0}>Nháp</Option>
              <Option value={1}>Chờ xử lý (Có thể ký)</Option>
              <Option value={2}>Chờ xử lý (Có thể ký)</Option>
              <Option value={3}>Đang xử lý</Option>
              <Option value={4}>Thành công</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8} lg={12} className="flex justify-end">
            <Button onClick={reload}>
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Booking Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} booking`,
          }}
        />
      </Card>

      {/* Booking Details Drawer */}
      <BookingDetailsDrawer
        visible={detailDrawerVisible}
        onClose={() => {
          setDetailDrawerVisible(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onSignSuccess={() => {
          reload(); // Reload danh sách sau khi ký thành công
        }}
      />
    </PageContainer>
    </DealerManagerLayout>
  );
}

export default BookingManagementPage;