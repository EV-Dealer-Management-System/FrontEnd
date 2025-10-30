import React, { useState, useEffect, useMemo } from 'react';
import moment from 'moment';
import 'moment/locale/vi';
import { 
  Card, 
  Typography, 
  Badge, 
  Space, 
  Button, 
  Input,
  Select,
  Row,
  Col,
  Tag,
  Empty,
  Avatar,
  Tooltip,
  Modal,
  Descriptions
} from 'antd';
import { 
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
  CalendarOutlined,
  CarOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { GetAllAppointment } from '../../../../App/DealerManager/ScheduleManagement/GetAllAppointment';
import { useToast } from './ToastContainer';

const { Title, Text } = Typography;
const { Option } = Select;

moment.locale('vi');

const CalendarView = () => {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Time slots from 8:00 to 17:00
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', 
    '12:00', '13:00', '14:00', '15:00', 
    '16:00', '17:00'
  ];

  useEffect(() => {
    fetchAppointments();
  }, []);

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

  const parseDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return null;
    const cleanStr = dateTimeStr.replace('Z', '');
    return moment(cleanStr);
  };

  const formatDateTime = (dateTimeStr) => {
    const dt = parseDateTime(dateTimeStr);
    if (!dt) return '-';
    return dt.format('DD/MM/YYYY HH:mm');
  };

  const formatTime = (dateTimeStr) => {
    const dt = parseDateTime(dateTimeStr);
    if (!dt) return '-';
    return dt.format('HH:mm');
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      1: { text: 'Chờ xác nhận', color: 'gold', bgColor: '#FEF3E2' },
      2: { text: 'Đã duyệt', color: 'blue', bgColor: '#E6F0FF' },
      3: { text: 'Hoàn thành', color: 'green', bgColor: '#E8F5E9' },
      4: { text: 'Đã hủy', color: 'red', bgColor: '#FFEBEE' },
    };
    return statusMap[status] || { text: 'Không xác định', color: 'default', bgColor: '#F5F5F5' };
  };

  // Statistics
  const stats = useMemo(() => {
    return {
      pending: appointments.filter(a => a.status === 1).length,
      approved: appointments.filter(a => a.status === 2).length,
      completed: appointments.filter(a => a.status === 3).length,
      cancelled: appointments.filter(a => a.status === 4).length,
    };
  }, [appointments]);

  // Filter appointments for selected date
  const dayAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const aptDate = parseDateTime(apt.startTime);
      if (!aptDate) return false;
      
      const isSameDay = aptDate.isSame(selectedDate, 'day');
      
      // Apply filters
      let matches = isSameDay;
      
      if (statusFilter !== 'all') {
        matches = matches && apt.status === parseInt(statusFilter);
      }
      
      if (modelFilter !== 'all') {
        matches = matches && apt.evTemplate?.modelName === modelFilter;
      }
      
      if (searchText) {
        const search = searchText.toLowerCase();
        matches = matches && (
          apt.customer?.customerName?.toLowerCase().includes(search) ||
          apt.customer?.phoneNumber?.includes(search) ||
          apt.evTemplate?.modelName?.toLowerCase().includes(search) ||
          apt.evTemplate?.versionName?.toLowerCase().includes(search)
        );
      }
      
      return matches;
    });
  }, [appointments, selectedDate, statusFilter, modelFilter, searchText]);

  // Get unique models for filter
  const models = useMemo(() => {
    const uniqueModels = [...new Set(appointments.map(a => a.evTemplate?.modelName).filter(Boolean))];
    return uniqueModels;
  }, [appointments]);

  // Get appointments by time slot
  const getAppointmentsForSlot = (timeSlot) => {
    return dayAppointments.filter(apt => {
      const startTime = parseDateTime(apt.startTime);
      if (!startTime) return false;
      const slotHour = timeSlot.split(':')[0];
      return startTime.format('HH') === slotHour;
    });
  };

  const handlePrevDay = () => {
    setSelectedDate(prev => moment(prev).subtract(1, 'day'));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => moment(prev).add(1, 'day'));
  };

  const handleToday = () => {
    setSelectedDate(moment());
  };

  const showDetailModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <div style={{ padding: '16px 20px', backgroundColor: '#f0f2f5', minHeight: '100%', width: '100%' }}>
      {/* Filter Bar */}
      <Card 
        style={{ 
          marginBottom: 12, 
          borderRadius: 8,
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)'
        }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tên KH / sđt / email / biển"
              prefix={<SearchOutlined style={{ color: '#666' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ 
                backgroundColor: '#fafafa',
                border: '1px solid #d9d9d9',
                color: '#262626'
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              value={selectedDate.format('DD/MM/YYYY')}
              prefix={<CalendarOutlined style={{ color: '#666' }} />}
              readOnly
              style={{ 
                backgroundColor: '#fafafa',
                border: '1px solid #d9d9d9',
                color: '#262626'
              }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              placeholder="Trạng thái"
            >
              <Option value="all">Tất cả</Option>
              <Option value="1">Chờ xác nhận</Option>
              <Option value="2">Đã duyệt</Option>
              <Option value="3">Hoàn thành</Option>
              <Option value="4">Đã hủy</Option>
            </Select>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Select
              value="all"
              style={{ width: '100%' }}
              placeholder="Showroom"
              disabled
            >
              <Option value="all">Tất cả</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              value={modelFilter}
              onChange={setModelFilter}
              style={{ width: '100%' }}
              placeholder="Mẫu xe"
            >
              <Option value="all">Tất cả</Option>
              {models.map(model => (
                <Option key={model} value={model}>{model}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card 
            style={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)'
            }}
            bodyStyle={{ padding: '10px' }}
          >
            <Space direction="vertical" size={0}>
              <Text style={{ color: '#8c8c8c', fontSize: 12 }}>Chờ xác nhận</Text>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Title level={2} style={{ margin: 0, color: '#262626' }}>{stats.pending}</Title>
                <div style={{ 
                  backgroundColor: '#FEF3E2',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  color: '#F59E0B'
                }}>
                  +0%
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card 
            style={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)'
            }}
            bodyStyle={{ padding: '10px' }}
          >
            <Space direction="vertical" size={0}>
              <Text style={{ color: '#8c8c8c', fontSize: 12 }}>Đã duyệt</Text>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Title level={2} style={{ margin: 0, color: '#262626' }}>{stats.approved}</Title>
                <div style={{ 
                  backgroundColor: '#E6F0FF',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  color: '#2563EB'
                }}>
                  +0%
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card 
            style={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)'
            }}
            bodyStyle={{ padding: '10px' }}
          >
            <Space direction="vertical" size={0}>
              <Text style={{ color: '#8c8c8c', fontSize: 12 }}>Hoàn thành</Text>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Title level={2} style={{ margin: 0, color: '#262626' }}>{stats.completed}</Title>
                <div style={{ 
                  backgroundColor: '#E8F5E9',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  color: '#16A34A'
                }}>
                  +1%
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card 
            style={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)'
            }}
            bodyStyle={{ padding: '10px' }}
          >
            <Space direction="vertical" size={0}>
              <Text style={{ color: '#8c8c8c', fontSize: 12 }}>Đã hủy</Text>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Title level={2} style={{ margin: 0, color: '#262626' }}>{stats.cancelled}</Title>
                <div style={{ 
                  backgroundColor: '#FFEBEE',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  color: '#DC2626'
                }}>
                  +0%
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Calendar Schedule */}
        <Col xs={24} lg={17} xl={18}>
          <Card 
            style={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              height: 'calc(100vh - 280px)',
              minHeight: 450,
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)'
            }}
            bodyStyle={{ padding: '12px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                <Space>
                  <ClockCircleOutlined style={{ color: '#1890ff' }} />
                  <Text strong style={{ color: '#262626', fontSize: 15 }}>
                    Lịch theo khung giờ • {selectedDate.format('dddd, DD/MM')}
                  </Text>
                </Space>
                <Space size={4}>
                  <Button 
                    icon={<LeftOutlined />} 
                    onClick={handlePrevDay}
                    size="small"
                    style={{ 
                      backgroundColor: '#1E2330',
                      border: '1px solid #2A2F3C',
                      color: '#fff'
                    }}
                  />
                  <Button 
                    onClick={handleToday}
                    size="small"
                    style={{ 
                      backgroundColor: '#1E2330',
                      border: '1px solid #2A2F3C',
                      color: '#fff'
                    }}
                  >
                    Hôm nay
                  </Button>
                  <Button 
                    icon={<RightOutlined />} 
                    onClick={handleNextDay}
                    size="small"
                    style={{ 
                      backgroundColor: '#1E2330',
                      border: '1px solid #2A2F3C',
                      color: '#fff'
                    }}
                  />
                </Space>
              </div>
            }
          >
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {timeSlots.map(timeSlot => {
                const slotAppointments = getAppointmentsForSlot(timeSlot);
                return (
                  <div 
                    key={timeSlot}
                    style={{ 
                      display: 'flex',
                      borderBottom: '1px solid #f0f0f0',
                      padding: '8px 0',
                      minHeight: 50
                    }}
                  >
                    {/* Time */}
                    <div style={{ 
                      width: 70,
                      flexShrink: 0,
                      color: '#8c8c8c',
                      fontSize: 13,
                      paddingTop: 4,
                      fontWeight: 500
                    }}>
                      {timeSlot}
                    </div>

                    {/* Appointments */}
                    <div style={{ flex: 1 }}>
                      {slotAppointments.length === 0 ? (
                        <div style={{ 
                          color: '#bfbfbf',
                          fontSize: 13,
                          padding: '4px 0'
                        }}>
                          -
                        </div>
                      ) : (
                        <Space direction="vertical" style={{ width: '100%' }} size={6}>
                          {slotAppointments.map(apt => {
                            const statusInfo = getStatusInfo(apt.status);
                            return (
                              <div
                                key={apt.id}
                                style={{
                                  backgroundColor: statusInfo.bgColor,
                                  padding: '6px 10px',
                                  borderRadius: 6,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onClick={() => showDetailModal(apt)}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Space size={6}>
                                    <CarOutlined style={{ color: statusInfo.color, fontSize: 14 }} />
                                    <Text strong style={{ color: '#000', fontSize: 13 }}>
                                      {apt.evTemplate?.versionName || 'N/A'}
                                    </Text>
                                  </Space>
                                  <Tag color={statusInfo.color} style={{ margin: 0, fontSize: 11, padding: '0 6px' }}>
                                    {statusInfo.text}
                                  </Tag>
                                </div>
                                <div style={{ marginTop: 3, fontSize: 11, color: '#555' }}>
                                  <UserOutlined style={{ fontSize: 10 }} /> {apt.customer?.customerName} • {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                                </div>
                              </div>
                            );
                          })}
                        </Space>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {dayAppointments.length === 0 && !loading && (
              <Empty 
                description="Không có lịch hẹn nào trong ngày này"
                style={{ marginTop: 40 }}
              />
            )}
          </Card>
        </Col>

        {/* Vehicle List Sidebar */}
        <Col xs={24} lg={7} xl={6}>
          <Card 
            style={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              height: 'calc(100vh - 280px)',
              minHeight: 450,
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)'
            }}
            bodyStyle={{ padding: '12px', height: '100%', display: 'flex', flexDirection: 'column' }}
            title={
              <Space style={{ padding: '4px 0' }}>
                <CarOutlined style={{ color: '#1890ff' }} />
                <Text strong style={{ color: '#262626', fontSize: 15 }}>Xế & Tình trạng</Text>
              </Space>
            }
          >
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                {dayAppointments.map(apt => {
                  const statusInfo = getStatusInfo(apt.status);
                  return (
                    <Card
                      key={apt.id}
                      size="small"
                      style={{
                        backgroundColor: '#fafafa',
                        border: '1px solid #e8e8e8',
                        borderRadius: 6,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      hoverable
                      onClick={() => showDetailModal(apt)}
                      bodyStyle={{ padding: '10px' }}
                    >
                      <Space direction="vertical" size={3} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Space size={4}>
                            <CarOutlined style={{ color: '#1890ff', fontSize: 13 }} />
                            <Text strong style={{ color: '#262626', fontSize: 12 }}>
                              {apt.evTemplate?.versionName || 'N/A'}
                            </Text>
                          </Space>
                          <Tag color={statusInfo.color} style={{ margin: 0, fontSize: 10, padding: '0 4px' }}>
                            {statusInfo.text}
                          </Tag>
                        </div>
                        <Text style={{ color: '#8c8c8c', fontSize: 10 }}>
                          {apt.evTemplate?.modelName} • {apt.evTemplate?.colorName}
                        </Text>
                        <Text style={{ color: '#8c8c8c', fontSize: 10 }}>
                          <ClockCircleOutlined style={{ fontSize: 9 }} /> {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                        </Text>
                        <Text style={{ color: '#8c8c8c', fontSize: 10 }}>
                          <UserOutlined style={{ fontSize: 9 }} /> {apt.customer?.customerName}
                        </Text>
                      </Space>
                    </Card>
                  );
                })}

                {dayAppointments.length === 0 && !loading && (
                  <Empty 
                    description="Không có lịch hẹn"
                    style={{ marginTop: 40 }}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <Text strong>Chi Tiết Lịch Hẹn</Text>
          </Space>
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
            <Descriptions.Item label="Số Điện Thoại">
              {selectedAppointment.customer?.phoneNumber || '-'}
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
              <Tag color={getStatusInfo(selectedAppointment.status).color}>
                {getStatusInfo(selectedAppointment.status).text}
              </Tag>
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
    </div>
  );
};

export default CalendarView;

