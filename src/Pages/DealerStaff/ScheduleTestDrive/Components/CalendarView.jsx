import React, { useState, useEffect, useMemo } from 'react';
import moment from 'moment';
import 'moment/locale/vi';
import {
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
  Tooltip,
  Modal,
  Descriptions
} from 'antd';
import {
  ProCard,
  StatisticCard
} from '@ant-design/pro-components';
import {
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
  CalendarOutlined,
  CarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { GetAllAppointment } from '../../../../App/DealerManager/ScheduleManagement/GetAllAppointment';
import { useToast } from './ToastContainer';

const { Title, Text } = Typography;
const { Option } = Select;
const { Divider } = StatisticCard;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div style={{ padding: 0, backgroundColor: '#f0f2f5', minHeight: '100%', width: '100%' }}>
      {/* Filter Bar */}
      <ProCard
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '16px' }}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm khách hàng, SĐT..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              value={selectedDate.format('DD/MM/YYYY')}
              prefix={<CalendarOutlined />}
              readOnly
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
      </ProCard>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: 'Chờ xác nhận',
              value: stats.pending,
              valueStyle: { color: '#F59E0B' },
            }}
            chart={
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FEF3E2 0%, #FDE68A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ClockCircleOutlined style={{ fontSize: 20, color: '#F59E0B' }} />
              </div>
            }
            chartPlacement="left"
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: 'Đã duyệt',
              value: stats.approved,
              valueStyle: { color: '#2563EB' },
            }}
            chart={
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #E6F0FF 0%, #BFDBFE 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CalendarOutlined style={{ fontSize: 20, color: '#2563EB' }} />
              </div>
            }
            chartPlacement="left"
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: 'Hoàn thành',
              value: stats.completed,
              valueStyle: { color: '#16A34A' },
            }}
            chart={
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #E8F5E9 0%, #A7F3D0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CarOutlined style={{ fontSize: 20, color: '#16A34A' }} />
              </div>
            }
            chartPlacement="left"
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: 'Đã hủy',
              value: stats.cancelled,
              valueStyle: { color: '#DC2626' },
            }}
            chart={
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFEBEE 0%, #FECACA 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ClockCircleOutlined style={{ fontSize: 20, color: '#DC2626' }} />
              </div>
            }
            chartPlacement="left"
          />
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Calendar Schedule */}
        <Col xs={24} lg={17} xl={18}>
          <ProCard
            title={
              <Space>
                <ClockCircleOutlined style={{ color: '#1890ff' }} />
                <Text strong>
                  Lịch theo khung giờ • {selectedDate.format('dddd, DD/MM')}
                </Text>
              </Space>
            }
            extra={
              <Space size={8}>
                <Button
                  icon={<LeftOutlined />}
                  onClick={handlePrevDay}
                  size="small"
                />
                <Button
                  onClick={handleToday}
                  size="small"
                  type="primary"
                >
                  Hôm nay
                </Button>
                <Button
                  icon={<RightOutlined />}
                  onClick={handleNextDay}
                  size="small"
                />
              </Space>
            }
            style={{ height: 'calc(100vh - 400px)', minHeight: 500 }}
            bodyStyle={{ padding: '16px', height: 'calc(100% - 57px)', overflowY: 'auto' }}
          >
            {timeSlots.map(timeSlot => {
              const slotAppointments = getAppointmentsForSlot(timeSlot);
              return (
                <div
                  key={timeSlot}
                  style={{
                    display: 'flex',
                    borderBottom: '1px solid #f0f0f0',
                    padding: '12px 0',
                    minHeight: 60
                  }}
                >
                  {/* Time */}
                  <div style={{
                    width: 80,
                    flexShrink: 0,
                    color: '#8c8c8c',
                    fontSize: 14,
                    paddingTop: 4,
                    fontWeight: 500
                  }}>
                    {timeSlot}
                  </div>

                  {/* Appointments */}
                  <div style={{ flex: 1 }}>
                    {slotAppointments.length === 0 ? (
                      <div style={{
                        color: '#d9d9d9',
                        fontSize: 13,
                        padding: '8px 0',
                        fontStyle: 'italic'
                      }}>
                        Trống
                      </div>
                    ) : (
                      <Space direction="vertical" style={{ width: '100%' }} size={8}>
                        {slotAppointments.map(apt => {
                          const statusInfo = getStatusInfo(apt.status);
                          return (
                            <ProCard
                              key={apt.id}
                              hoverable
                              bordered
                              style={{
                                background: statusInfo.bgColor,
                                borderLeft: `4px solid ${statusInfo.color}`,
                                cursor: 'pointer',
                              }}
                              bodyStyle={{ padding: '12px' }}
                              onClick={() => showDetailModal(apt)}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Space size={8}>
                                  <CarOutlined style={{ color: statusInfo.color, fontSize: 16 }} />
                                  <div>
                                    <Text strong style={{ display: 'block', fontSize: 14 }}>
                                      {apt.evTemplate?.versionName || 'N/A'}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      <UserOutlined style={{ fontSize: 11 }} /> {apt.customer?.customerName}
                                    </Text>
                                  </div>
                                </Space>
                                <Space direction="vertical" align="end" size={4}>
                                  <Tag color={statusInfo.color} style={{ margin: 0 }}>
                                    {statusInfo.text}
                                  </Tag>
                                  <Text type="secondary" style={{ fontSize: 11 }}>
                                    {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                                  </Text>
                                </Space>
                              </div>
                            </ProCard>
                          );
                        })}
                      </Space>
                    )}
                  </div>
                </div>
              );
            })}

            {dayAppointments.length === 0 && !loading && (
              <Empty
                description="Không có lịch hẹn nào trong ngày này"
                style={{ marginTop: 60 }}
              />
            )}
          </ProCard>
        </Col>

        {/* Vehicle List Sidebar */}
        <Col xs={24} lg={7} xl={6}>
          <ProCard
            title={
              <Space>
                <CarOutlined style={{ color: '#1890ff' }} />
                <Text strong>Danh sách lịch hẹn</Text>
              </Space>
            }
            style={{ height: 'calc(100vh - 400px)', minHeight: 500 }}
            bodyStyle={{ padding: '12px', height: 'calc(100% - 57px)', overflowY: 'auto' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {dayAppointments.map(apt => {
                const statusInfo = getStatusInfo(apt.status);
                return (
                  <ProCard
                    key={apt.id}
                    hoverable
                    bordered
                    size="small"
                    style={{
                      borderLeft: `3px solid ${statusInfo.color}`,
                      cursor: 'pointer',
                    }}
                    bodyStyle={{ padding: '12px' }}
                    onClick={() => showDetailModal(apt)}
                  >
                    <Space direction="vertical" size={6} style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Space size={4}>
                          <CarOutlined style={{ color: statusInfo.color, fontSize: 14 }} />
                          <Text strong style={{ fontSize: 13 }}>
                            {apt.evTemplate?.versionName || 'N/A'}
                          </Text>
                        </Space>
                        <Tag color={statusInfo.color} style={{ margin: 0, fontSize: 11 }}>
                          {statusInfo.text}
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {apt.evTemplate?.modelName} • {apt.evTemplate?.colorName}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        <ClockCircleOutlined style={{ fontSize: 10 }} /> {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        <UserOutlined style={{ fontSize: 10 }} /> {apt.customer?.customerName}
                      </Text>
                    </Space>
                  </ProCard>
                );
              })}

              {dayAppointments.length === 0 && !loading && (
                <Empty
                  description="Không có lịch hẹn"
                  style={{ marginTop: 60 }}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Space>
          </ProCard>
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

