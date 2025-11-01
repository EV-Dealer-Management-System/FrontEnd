import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Table, Card, message, Spin, Tag, Input, Button, Space, Statistic, Row, Col, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { GetAvailableSlot } from '../../../../App/DealerManager/AppointmentSetting/GetAvailableSlot';

const { Search } = Input;
const { Title } = Typography;

const GetAvailableAppointment = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredSlots, setFilteredSlots] = useState([]);

  // Fetch dữ liệu slot có sẵn
  const fetchSlots = async () => {
    setLoading(true);
    try {
      const response = await GetAvailableSlot.getAvailableSlot();
      
      if (response.isSuccess) {
        const slotsData = (response.result || []).map((slot, index) => ({
          ...slot,
          key: index,
        }));
        setSlots(slotsData);
        setFilteredSlots(slotsData);
        message.success('Tải danh sách slot thành công!');
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi tải dữ liệu');
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
      dataIndex: 'key',
      key: 'key',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
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
  ];


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

