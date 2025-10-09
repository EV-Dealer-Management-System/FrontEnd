import React from 'react';
import { Modal, Descriptions, Button, Tag, Divider, Table, Card } from 'antd';
import {
  CarOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

// Component modal chi tiết booking
function BookingDetailModal({
  visible,
  onClose,
  booking,
  formatDateTime,
  getStatusTag
}) {
  if (!booking) return null;

  // Cột cho bảng chi tiết xe
  const detailColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      title: 'Version ID',
      dataIndex: ['version', 'versionId'],
      key: 'versionId',
      width: 200,
      render: (text) => (
        <span className="text-xs text-gray-600 font-mono">
          {text ? text.substring(0, 13) + '...' : 'N/A'}
        </span>
      )
    },
    {
      title: 'Model ID',
      dataIndex: ['version', 'modelId'],
      key: 'modelId',
      width: 200,
      render: (text) => (
        <span className="text-xs text-gray-600 font-mono">
          {text ? text.substring(0, 13) + '...' : 'N/A'}
        </span>
      )
    },
    {
      title: 'Color ID',
      dataIndex: 'colorId',
      key: 'colorId',
      width: 200,
      render: (text) => (
        <span className="text-xs text-gray-600 font-mono">
          {text ? text.substring(0, 13) + '...' : 'N/A'}
        </span>
      )
    },
    {
      title: 'Số Lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
      render: (text) => <Tag color="blue" className="font-semibold">{text || 0}</Tag>
    },
    {
      title: 'Ngày Giao Dự Kiến',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      width: 160,
      render: (text) => text ? formatDateTime(text) : <span className="text-gray-400">Chưa có</span>
    }
  ];

  return (
    <Modal
      title={
        <div className="flex items-center text-lg font-semibold">
          <CarOutlined className="mr-2 text-blue-500" />
          Chi Tiết Booking
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose} size="large">
          Đóng
        </Button>
      ]}
      width={1000}
      centered
    >
      <Divider className="mt-2" />

      {/* Thông tin chung */}
      <Descriptions bordered column={2} size="middle" className="mt-4">
        <Descriptions.Item
          label={<span className="font-semibold">Mã Booking</span>}
          span={2}
        >
          <span className="text-blue-600 font-mono text-sm">
            {booking.id || 'N/A'}
          </span>
        </Descriptions.Item>

        <Descriptions.Item
          label={<span className="font-semibold">Dealer ID</span>}
        >
          <span className="text-gray-600 font-mono text-xs">
            {booking.dealerId ? booking.dealerId.substring(0, 20) + '...' : 'N/A'}
          </span>
        </Descriptions.Item>

        <Descriptions.Item
          label={<span className="font-semibold">Trạng Thái</span>}
        >
          {getStatusTag(booking.status)}
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <span className="font-semibold">
              <CalendarOutlined className="mr-2" />
              Ngày Đặt
            </span>
          }
        >
          <span className="text-base">{formatDateTime(booking.bookingDate)}</span>
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <span className="font-semibold">
              <UserOutlined className="mr-2" />
              Người Tạo
            </span>
          }
        >
          <span className="text-base">{booking.createdBy || 'N/A'}</span>
        </Descriptions.Item>

        <Descriptions.Item
          label={<span className="font-semibold">Tổng Số Lượng</span>}
          span={2}
        >
          <Tag color="blue" className="text-base font-bold px-3 py-1">
            {booking.totalQuantity || 0} xe
          </Tag>
        </Descriptions.Item>

        {booking.note && (
          <Descriptions.Item
            label={
              <span className="font-semibold">
                <FileTextOutlined className="mr-2" />
                Ghi Chú
              </span>
            }
            span={2}
          >
            <div className="text-base text-gray-700 whitespace-pre-wrap">
              {booking.note}
            </div>
          </Descriptions.Item>
        )}
      </Descriptions>

      {/* Chi tiết xe đặt */}
      {booking.bookingEVDetails && booking.bookingEVDetails.length > 0 && (
        <Card
          title={
            <span className="font-semibold text-base">
              <InfoCircleOutlined className="mr-2 text-blue-500" />
              Chi Tiết Xe Đặt ({booking.bookingEVDetails.length})
            </span>
          }
          className="mt-4 shadow-sm"
          bordered={false}
        >
          <Table
            columns={detailColumns}
            dataSource={booking.bookingEVDetails}
            rowKey="id"
            pagination={false}
            scroll={{ x: 900 }}
            size="small"
          />
        </Card>
      )}
    </Modal>
  );
}

export default BookingDetailModal;
