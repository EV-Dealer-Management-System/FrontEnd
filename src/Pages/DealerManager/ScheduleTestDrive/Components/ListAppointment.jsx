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
  Modal,
  Descriptions,
  Select,
  Tabs,
  Segmented
} from 'antd';
import { 
  ScheduleOutlined, 
  EditOutlined, 
  EyeOutlined,
  PlusOutlined,
  CalendarOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { GetAllAppointment } from '../../../../App/DealerManager/ScheduleManagement/GetAllAppointment';
import { UpdateAppointment } from '../../../../App/DealerManager/ScheduleManagement/UpdateAppointment';
import CreateAppointmentForm from './CreateAppointment';
import CalendarView from './CalendarView';
import { useToast } from './ToastContainer';

const { Title, Text } = Typography;
const { Option } = Select;

const ListAppointment = () => {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'

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

  const showEditModal = (record) => {
    setSelectedAppointment(record);
    setNewStatus(record.status);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedAppointment(null);
    setNewStatus(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedAppointment || newStatus === null) {
      toast.warning('Vui lòng chọn trạng thái!');
      return;
    }

    try {
      setUpdating(true);
      const response = await UpdateAppointment.updateAppointmentStatus(
        selectedAppointment.id,
        newStatus
      );

      if (response.isSuccess || response.statusCode === 200) {
        const successMessage = response.message || 'Cập nhật trạng thái thành công!';
        toast.success(successMessage);
        handleEditModalClose();
        fetchAppointments(); // Refresh list
      } else {
        const errorMessage = response.message || 'Cập nhật trạng thái thất bại!';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật trạng thái';
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
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
        toast.error(response.message || 'Không thể tải danh sách lịch hẹn');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Đã xảy ra lỗi khi tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      1: { text: 'Hoạt động', color: 'success' },      // Active
      2: { text: 'Đã hoàn thành', color: 'default' },   // Completed
      3: { text: 'Đã hủy', color: 'error' },            // Canceled
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
          <Tooltip title="Sửa trạng thái">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              type="default"
              onClick={() => showEditModal(record)}
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
        .view-mode-segmented .ant-segmented-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16,
        padding: '0 20px'
      }}>
        <Segmented
          value={viewMode}
          onChange={setViewMode}
          options={[
            {
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CalendarOutlined />
                  Lịch
                </span>
              ),
              value: 'calendar',
            },
            {
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <UnorderedListOutlined />
                  Danh sách
                </span>
              ),
              value: 'list',
            },
          ]}
          size="large"
          className="view-mode-segmented"
        />
        
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showModal}
          size="large"
        >
          Tạo Lịch Hẹn
        </Button>
      </div>

      {viewMode === 'calendar' ? (
        <CalendarView />
      ) : (
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
      )}

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

      {/* Modal Sửa Trạng Thái */}
      <Modal
        title={
          <Title level={4}>
            <EditOutlined className="mr-2" />
            Cập Nhật Trạng Thái Lịch Hẹn
          </Title>
        }
        open={isEditModalOpen}
        onCancel={handleEditModalClose}
        footer={[
          <Button key="cancel" onClick={handleEditModalClose}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={updating}
            onClick={handleUpdateStatus}
          >
            Cập Nhật
          </Button>
        ]}
        width={500}
      >
        {selectedAppointment && (
          <div>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <Text strong className="block mb-2">
                Thông Tin Lịch Hẹn
              </Text>
              <div>
                <Text type="secondary">Khách hàng: </Text>
                <Text strong>{selectedAppointment.customer?.customerName}</Text>
              </div>
              <div>
                <Text type="secondary">Thời gian: </Text>
                <Text strong>
                  {formatDateTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}
                </Text>
              </div>
            </div>

            <div>
              <Text strong className="block mb-2">
                Chọn Trạng Thái Mới <span style={{ color: 'red' }}>*</span>
              </Text>
              <Select
                value={newStatus}
                onChange={setNewStatus}
                style={{ width: '100%' }}
                placeholder="Chọn trạng thái"
              >
                <Option value={1}>
                  <Badge status="success" text="Hoạt Động (Active)" />
                </Option>
                <Option value={2}>
                  <Badge status="default" text="Đã Hoàn Thành (Completed)" />
                </Option>
                <Option value={3}>
                  <Badge status="error" text="Đã Hủy (Canceled)" />
                </Option>
              </Select>
            </div>

            {newStatus !== null && (
              <div className="mt-3 p-2 bg-gray-50 rounded">
                <Text type="secondary">Trạng thái hiện tại: </Text>
                {getStatusBadge(selectedAppointment.status)}
                <br />
                <Text type="secondary">Trạng thái mới: </Text>
                {getStatusBadge(newStatus)}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default ListAppointment;
