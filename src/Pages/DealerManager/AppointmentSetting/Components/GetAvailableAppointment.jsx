import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Table, Card, message, Spin, Tag, Input, Button, Space, Statistic, Row, Col, Typography, Modal } from 'antd';
import { SearchOutlined, ReloadOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons';
import { GetAvailableSlot } from '../../../../App/DealerManager/AppointmentSetting/GetAvailableSlot';
import { GetAllAppointment } from '../../../../App/DealerManager/ScheduleManagement/GetAllAppointment';
import { GetAppointmentById } from '../../../../App/DealerManager/AppointmentSetting/GetAppointmentById';
import UpdateAppointmentSettingForm from './UpdateAppointmentSettingForm';

const { Search } = Input;
const { Title } = Typography;

const GetAvailableAppointment = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editFormLoading, setEditFormLoading] = useState(false);

  // Fetch dữ liệu slot có sẵn và lấy appointment setting IDs từ appointments
  const fetchSlots = async () => {
    setLoading(true);
    try {
      // Lấy cả available slots và appointments để có appointmentSettingId
      const [slotsResponse, appointmentsResponse] = await Promise.all([
        GetAvailableSlot.getAvailableSlot(),
        GetAllAppointment.getAllAppointments().catch(() => ({ isSuccess: false, result: [] }))
      ]);
      
      if (slotsResponse.isSuccess) {
        const slots = slotsResponse.result || [];
        
        // Tạo map từ openTime/closeTime đến appointmentSettingId từ appointments
        let appointmentSettingMap = {};
        let uniqueAppointmentSettingIds = new Set();
        
        if (appointmentsResponse.isSuccess && appointmentsResponse.result) {
          appointmentsResponse.result.forEach(apt => {
            // Kiểm tra xem appointment có appointmentSettingId không
            if (apt.appointmentSettingId) {
              uniqueAppointmentSettingIds.add(apt.appointmentSettingId);
              
              // Map theo thời gian nếu có
              if (apt.startTime && apt.endTime) {
                // Extract time từ ISO string: "2025-10-30T08:00:00Z" -> "08:00:00"
                const startTime = apt.startTime.includes('T') 
                  ? apt.startTime.substring(apt.startTime.indexOf('T') + 1, apt.startTime.indexOf('T') + 9)
                  : apt.startTime;
                const endTime = apt.endTime.includes('T')
                  ? apt.endTime.substring(apt.endTime.indexOf('T') + 1, apt.endTime.indexOf('T') + 9)
                  : apt.endTime;
                
                if (startTime && endTime) {
                  const timeKey = `${startTime}-${endTime}`;
                  appointmentSettingMap[timeKey] = apt.appointmentSettingId;
                }
              }
            }
          });
        }
        
        // Chuyển Set thành Array để dễ xử lý
        const appointmentSettingIds = Array.from(uniqueAppointmentSettingIds);
        
        const slotsData = slots.map((slot, index) => {
          // Tìm appointmentSettingId từ map dựa trên openTime và closeTime
          const timeKey = `${slot.openTime}-${slot.closeTime}`;
          let appointmentSettingId = appointmentSettingMap[timeKey];
          
          // Nếu không tìm thấy trong map, thử lấy từ slot object hoặc dùng index
          if (!appointmentSettingId) {
            appointmentSettingId = slot.appointmentSettingId || slot.id;
            
            // Nếu vẫn không có, thử dùng appointmentSettingId từ appointments (nếu có)
            if (!appointmentSettingId && appointmentSettingIds.length > index) {
              appointmentSettingId = appointmentSettingIds[index];
            }
          }
          
          return {
            ...slot,
            key: appointmentSettingId || `slot-${index}`,
            id: appointmentSettingId || null,
            appointmentSettingId: appointmentSettingId || null
          };
        });
        
        setSlots(slotsData);
        setFilteredSlots(slotsData);
        message.success('Tải danh sách slot thành công!');
      } else {
        message.error(slotsResponse.message || 'Có lỗi xảy ra khi tải dữ liệu');
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      message.error('Không thể tải danh sách slot. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // Expose refresh method to parent component
  useImperativeHandle(ref, () => ({
    refresh: () => {
      fetchSlots();
    }
  }));

  // Tìm kiếm
  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setFilteredSlots(slots);
    } else {
      const filtered = slots.filter(slot => {
        const timeRange = `${slot.openTime} - ${slot.closeTime}`;
        return timeRange.toLowerCase().includes(value.toLowerCase());
      });
      setFilteredSlots(filtered);
    }
  };

  // Làm mới dữ liệu
  const handleRefresh = () => {
    setSearchText('');
    fetchSlots();
  };

  // Tính toán thống kê
  const totalSlots = filteredSlots.length;
  const availableSlots = filteredSlots.filter(slot => slot.isAvailable === true).length;
  const unavailableSlots = filteredSlots.filter(slot => slot.isAvailable === false).length;

  // Format time từ "08:00:00" thành "08:00"
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  };

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      align: 'center',
      className: 'text-center font-medium',
    },
    {
      title: 'Khung Giờ',
      key: 'timeRange',
      render: (_, record) => (
        <Space size="small">
          <ClockCircleOutlined className="text-blue-500" />
          <span className="font-medium text-gray-800">
            {formatTime(record.openTime)} - {formatTime(record.closeTime)}
          </span>
        </Space>
      ),
      sorter: (a, b) => {
        const aStart = a.openTime || '00:00:00';
        const bStart = b.openTime || '00:00:00';
        return aStart.localeCompare(bStart);
      },
    },
    {
      title: 'Giờ Bắt Đầu',
      dataIndex: 'openTime',
      key: 'openTime',
      render: (time) => (
        <span className="text-gray-700">{formatTime(time)}</span>
      ),
      sorter: (a, b) => {
        const aStart = a.openTime || '00:00:00';
        const bStart = b.openTime || '00:00:00';
        return aStart.localeCompare(bStart);
      },
    },
    {
      title: 'Giờ Kết Thúc',
      dataIndex: 'closeTime',
      key: 'closeTime',
      render: (time) => (
        <span className="text-gray-700">{formatTime(time)}</span>
      ),
      sorter: (a, b) => {
        const aEnd = a.closeTime || '00:00:00';
        const bEnd = b.closeTime || '00:00:00';
        return aEnd.localeCompare(bEnd);
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      render: (isAvailable) => {
        if (isAvailable === true) {
          return (
            <Tag 
              icon={<CheckCircleOutlined />} 
              color="success"
              className="px-3 py-1"
            >
              Có Sẵn
            </Tag>
          );
        } else {
          return (
            <Tag 
              icon={<CloseCircleOutlined />} 
              color="error"
              className="px-3 py-1"
            >
              Đã Đặt
            </Tag>
          );
        }
      },
      filters: [
        { text: 'Có Sẵn', value: true },
        { text: 'Đã Đặt', value: false },
      ],
      onFilter: (value, record) => record.isAvailable === value,
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      align: 'center',
      width: 120,
      render: (_, record) => {
        const appointmentSettingId = record.appointmentSettingId || record.id;
        return (
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            disabled={!appointmentSettingId}
          >
            Sửa
          </Button>
        );
      },
    },
  ];

  // Xử lý sửa appointment setting
  const handleEdit = async (record) => {
    // Lấy appointmentSettingId từ record
    const appointmentSettingId = record.appointmentSettingId || record.id;
    
    if (!appointmentSettingId) {
      message.error('Slot này không có appointment setting ID để sửa');
      return;
    }

    try {
      setEditFormLoading(true);
      setIsEditModalVisible(true);
      
      // Lấy thông tin chi tiết appointment setting theo ID
      const response = await GetAppointmentById.getAppointmentById(appointmentSettingId);
      
      if (response.isSuccess) {
        setSelectedAppointment({
          ...response.result,
          id: appointmentSettingId
        });
      } else {
        message.error(response.message || 'Không thể tải thông tin appointment setting');
        setIsEditModalVisible(false);
      }
    } catch (error) {
      console.error('Error fetching appointment setting:', error);
      message.error('Đã xảy ra lỗi khi tải thông tin appointment setting');
      setIsEditModalVisible(false);
    } finally {
      setEditFormLoading(false);
    }
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    setSelectedAppointment(null);
  };

  const handleEditSuccess = () => {
    handleEditModalClose();
    fetchSlots(); // Refresh danh sách sau khi cập nhật thành công
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>
          <ClockCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          Danh Sách Slot Lịch Lái Thử
        </Title>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Làm Mới
        </Button>
      </div>
        <div className="space-y-6">
          {/* Thống kê tổng quan */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={8}>
              <Card className="text-center border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title="Tổng Số Slot"
                  value={totalSlots}
                  prefix={<ClockCircleOutlined className="text-blue-500" />}
                  valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="text-center border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title="Slot Có Sẵn"
                  value={availableSlots}
                  prefix={<CheckCircleOutlined className="text-green-500" />}
                  valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="text-center border border-red-200 shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title="Slot Đã Đặt"
                  value={unavailableSlots}
                  prefix={<CloseCircleOutlined className="text-red-500" />}
                  valueStyle={{ color: '#f5222d', fontSize: '28px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Tìm kiếm */}
          <Card className="shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">
                Tìm kiếm slot
              </span>
              <Search
                placeholder="Tìm kiếm theo khung giờ..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                onSearch={handleSearch}
                className="max-w-md"
              />
            </div>
          </Card>

          {/* Bảng dữ liệu */}
          <Card className="shadow-lg border border-gray-200">
            <Spin spinning={loading} tip="Đang tải dữ liệu...">
              <Table
                columns={columns}
                dataSource={filteredSlots}
                pagination={{
                  total: filteredSlots.length,
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} slot`,
                  className: 'text-center',
                }}
                scroll={{ x: 800 }}
                className="custom-table"
                locale={{
                  emptyText: (
                    <div className="text-center py-8">
                      <ClockCircleOutlined className="text-4xl text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg">
                        {searchText ? 'Không tìm thấy slot nào' : 'Chưa có slot nào'}
                      </p>
                    </div>
                  ),
                }}
              />
            </Spin>
          </Card>
        </div>

        {/* Modal Sửa Appointment Setting */}
        <Modal
          title={
            <Space>
              <EditOutlined style={{ color: '#1890ff' }} />
              <span style={{ fontWeight: 600, fontSize: 18 }}>
                Sửa Appointment Setting
              </span>
            </Space>
          }
          open={isEditModalVisible}
          onCancel={handleEditModalClose}
          footer={null}
          width={800}
          destroyOnClose
          centered
        >
          <Spin spinning={editFormLoading}>
            {selectedAppointment && (
              <UpdateAppointmentSettingForm
                appointmentId={selectedAppointment.id}
                initialValues={selectedAppointment}
                onSuccess={handleEditSuccess}
                onCancel={handleEditModalClose}
              />
            )}
          </Spin>
        </Modal>

        <style jsx>{`
          .custom-table .ant-table-thead > tr > th {
            background-color: #f8fafc;
            border-bottom: 2px solid #e2e8f0;
            font-weight: 600;
            color: #334155;
          }
          
          .custom-table .ant-table-tbody > tr:hover > td {
            background-color: #f1f5f9;
          }
          
          .custom-table .ant-table-tbody > tr > td {
            border-bottom: 1px solid #f1f5f9;
          }
        `}</style>
    </div>
  );
});

GetAvailableAppointment.displayName = 'GetAvailableAppointment';

export default GetAvailableAppointment;

