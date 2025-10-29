import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { 
  Table, 
  Card, 
  Typography, 
  Badge, 
  Space, 
  Button, 
  Tooltip, 
  message,
  Modal,
  Descriptions
} from 'antd';
import { 
  ScheduleOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { GetAllAppointment } from '../../../../App/DealerManager/ScheduleManagement/GetAllAppointment';
import CreateAppointmentForm from './CreateAppointment';

const { Title, Text } = Typography;

const ListAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const showDetailModal = (record) => {
    setSelectedAppointment(record);
    setIsDetailModalOpen(true);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleAppointmentCreated = () => {
    fetchAppointments(); // Refresh list
    setIsModalOpen(false); // Close modal
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await GetAllAppointment.getAllAppointments();
      
      if (response.isSuccess) {
        setAppointments(response.result || []);
      } else {
        message.error(response.message || 'Không thể tải danh sách lịch hẹn');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      message.error('Đã xảy ra lỗi khi tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      // Implement delete logic if API supports it
      message.success('Xóa lịch hẹn thành công');
      fetchAppointments(); // Refresh list
    } catch (error) {
      console.error('Error deleting appointment:', error);
      message.error('Không thể xóa lịch hẹn');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { text: 'Chờ xác nhận', color: 'warning' },
      1: { text: 'Đã xác nhận', color: 'success' },
      2: { text: 'Đã hoàn thành', color: 'default' },
      3: { text: 'Đã hủy', color: 'error' },
    };
    const statusInfo = statusMap[status] || { text: 'Không xác định', color: 'default' };
    return <Badge status={statusInfo.color} text={statusInfo.text} />;
  };

  // Parse datetime từ backend (format: "2025-10-29T08:38:00Z")
  // Backend gửi về local time với suffix "Z", cần parse như local time, không phải UTC
  const parseDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return null;
    // Remove "Z" và parse như local time
    const cleanStr = dateTimeStr.replace('Z', '');
    return moment(cleanStr);
  };

  const formatDateTime = (dateTimeStr) => {
    const dt = parseDateTime(dateTimeStr);
    if (!dt) return '-';
    return dt.format('DD/MM/YYYY HH:mm');
  };

  const formatDate = (dateTimeStr) => {
    const dt = parseDateTime(dateTimeStr);
    if (!dt) return '-';
    return dt.format('DD/MM/YYYY');
  };

  const formatTime = (dateTimeStr) => {
    const dt = parseDateTime(dateTimeStr);
    if (!dt) return '-';
    return dt.format('HH:mm');
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      render: (_, __, index) => index + 1,
      align: 'center',
    },
    {
      title: 'Khách Hàng',
      dataIndex: ['customer', 'customerName'],
      key: 'customerName',
    },
    {
      title: 'Model',
      dataIndex: ['evTemplate', 'modelName'],
      key: 'modelName',
    },
    {
      title: 'Phiên Bản',
      dataIndex: ['evTemplate', 'versionName'],
      key: 'versionName',
    },
    {
      title: 'Màu',
      dataIndex: ['evTemplate', 'colorName'],
      key: 'colorName',
    },
    {
      title: 'Bắt Đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text) => text ? (
        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
          {formatDate(text)}<br/>
          {formatTime(text)}
        </div>
      ) : '-',
    },
    {
      title: 'Kết Thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text) => text ? (
        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
          {formatDate(text)}<br/>
          {formatTime(text)}
        </div>
      ) : '-',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusBadge(status),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              size="small" 
              type="primary" 
              ghost
              onClick={() => showDetailModal(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              type="default"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
              onClick={() => handleDeleteAppointment(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <style>{`
        .responsive-table .ant-table-cell {
          white-space: normal !important;
          word-wrap: break-word !important;
          word-break: break-word !important;
        }
      `}</style>
      
      <div className="text-center mb-4">
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showModal}
          size="large"
        >
          Tạo Lịch Hẹn
        </Button>
      </div>

      <Card
        style={{ width: '100%' }}
        title={
          <Title level={4}>
            <ScheduleOutlined className="mr-2" /> 
            Danh Sách Lịch Hẹn
          </Title>
        }
        extra={
          <Text strong>
            Tổng: {appointments.length} lịch hẹn
          </Text>
        }
        bodyStyle={{ padding: '24px' }}
      >
        <Table 
          columns={columns}
          dataSource={appointments}
          loading={loading}
          rowKey="id"
          scroll={{ y: 600 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: [5, 10, 20, 50],
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} lịch hẹn`,
          }}
          tableLayout="fixed"
          className="responsive-table"
        />
      </Card>

      {/* Modal Tạo Lịch Hẹn */}
      <Modal
        title={
          <Title level={4}>
            <ScheduleOutlined className="mr-2" />
            Tạo Lịch Hẹn Mới
          </Title>
        }
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        destroyOnClose
      >
        <CreateAppointmentForm onAppointmentCreated={handleAppointmentCreated} />
      </Modal>

      {/* Modal Xem Chi Tiết */}
      <Modal
        title={
          <Title level={4}>
            <EyeOutlined className="mr-2" />
            Chi Tiết Lịch Hẹn
          </Title>
        }
        open={isDetailModalOpen}
        onCancel={handleDetailModalClose}
        footer={[
          <Button key="close" onClick={handleDetailModalClose}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedAppointment && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên Đại Lý">
              {selectedAppointment.dealer?.dealerName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Tên Khách Hàng">
              {selectedAppointment.customer?.customerName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Tên Model">
              {selectedAppointment.evTemplate?.modelName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Phiên Bản">
              {selectedAppointment.evTemplate?.versionName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Màu Sắc">
              {selectedAppointment.evTemplate?.colorName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Thời Gian Bắt Đầu">
              {formatDateTime(selectedAppointment.startTime)}
            </Descriptions.Item>
            <Descriptions.Item label="Thời Gian Kết Thúc">
              {formatDateTime(selectedAppointment.endTime)}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng Thái">
              {getStatusBadge(selectedAppointment.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi Chú">
              {selectedAppointment.note || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày Tạo">
              {formatDateTime(selectedAppointment.createdAt)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default ListAppointment;
