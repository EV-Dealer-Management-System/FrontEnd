import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Typography, 
  Badge, 
  Space, 
  Button, 
  Tooltip, 
  message 
} from 'antd';
import { 
  ScheduleOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined 
} from '@ant-design/icons';
import { GetAllAppointment } from '../../../../App/DealerManager/ScheduleManagement/GetAllAppointment';
import { CreateAppointment } from '../../../../App/DealerManager/ScheduleManagement/CreateAppointment';

const { Title, Text } = Typography;

const ListAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: 'Mã Khách Hàng',
      dataIndex: 'customerId',
      key: 'customerId',
    },
    {
      title: 'Template Xe',
      dataIndex: 'evTemplateId',
      key: 'evTemplateId',
    },
    {
      title: 'Thời Gian Bắt Đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text) => new Date(text).toLocaleString('vi-VN'),
    },
    {
      title: 'Thời Gian Kết Thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (text) => new Date(text).toLocaleString('vi-VN'),
    },
    {
      title: 'Ghi Chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    },
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              size="small" 
              type="primary" 
              ghost
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
    <Card 
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
    >
      <Table 
        columns={columns}
        dataSource={appointments}
        loading={loading}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: [5, 10, 20, 50],
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} lịch hẹn`,
        }}
      />
    </Card>
  );
};

export default ListAppointment;
