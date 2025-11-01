import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Space, Input, Typography, Image, Button, Select, App } from 'antd';
import { SearchOutlined, StarOutlined } from '@ant-design/icons';
import { GetStaffFeedback } from '../../../../App/DealerManager/StaffFeedbackManage/GetStaffFeedback';
import { UpdateStatusCustomerFeedback } from '../../../../App/DealerManager/ManageCustomerFeedback/UpdateStatusCustomerFeedback';

const { Text } = Typography;
const { Option } = Select;

const ManageDealerStaffFeedback = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await GetStaffFeedback.getStaffFeedback();
      
      if (response?.isSuccess) {
        // Lọc bỏ các item không có id và chỉ lấy những item hợp lệ
        const validData = (response.result || []).filter(item => item && item.id);
        setData(validData);
      } else {
        message.error(response?.message || 'Không thể tải danh sách feedback');
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching dealer staff feedbacks:', error);
      message.error('Đã xảy ra lỗi khi tải danh sách feedback');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (feedbackId, newStatus) => {
    try {
      setUpdatingId(feedbackId);
      const response = await UpdateStatusCustomerFeedback.updateStatusCustomerFeedback(feedbackId, newStatus);

      if (response?.isSuccess || response?.success) {
        message.success('Cập nhật trạng thái thành công!');
        fetchFeedbacks();
      } else {
        message.error(response?.message || 'Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Đã xảy ra lỗi khi cập nhật trạng thái');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { text: 'Chờ xử lý', color: 'gold' },
      1: { text: 'Đã chấp nhận', color: 'cyan' },
      2: { text: 'Đã từ chối', color: 'red' },
      3: { text: 'Đã trả lời', color: 'green' },
      4: { text: 'Đã hủy', color: 'default' },
    };
    const statusInfo = statusMap[status] || { text: 'Không xác định', color: 'default' };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const filteredData = data.filter(item => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      item.dealerName?.toLowerCase().includes(search) ||
      item.feedbackContent?.toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      title: 'STT',
      key: 'index',
      align: 'center',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Đại lý',
      dataIndex: 'dealerName',
      key: 'dealerName',
      width: 200,
      render: (text) => <Text strong>{text || 'N/A'}</Text>,
    },
    {
      title: 'Nội dung',
      dataIndex: 'feedbackContent',
      key: 'feedbackContent',
      ellipsis: true,
      render: (text) => (
        <Text ellipsis={{ tooltip: text }}>{text || 'Không có nội dung'}</Text>
      ),
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'imgUrls',
      key: 'imgUrls',
      align: 'center',
      width: 120,
      render: (imgUrls) => {
        if (!imgUrls || imgUrls.length === 0) {
          return <Text type="secondary">Không có</Text>;
        }
        return (
          <Space>
            <Image.PreviewGroup>
              {imgUrls.slice(0, 3).map((url, index) => (
                <Image
                  key={index}
                  width={30}
                  height={30}
                  src={url}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
              ))}
            </Image.PreviewGroup>
            {imgUrls.length > 3 && <Text type="secondary">+{imgUrls.length - 3}</Text>}
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      render: (status) => getStatusBadge(status),
    },
    {
      title: 'Cập nhật trạng thái',
      key: 'updateStatus',
      align: 'center',
      width: 180,
      render: (_, record) => (
        <Select
          value={record.status}
          onChange={(value) => handleUpdateStatus(record.id, value)}
          loading={updatingId === record.id}
          disabled={updatingId === record.id}
          style={{ width: 150 }}
        >
          <Option value={0}>Chờ xử lý</Option>
          <Option value={1}>Đã chấp nhận</Option>
          <Option value={2}>Đã từ chối</Option>
          <Option value={3}>Đã trả lời</Option>
          <Option value={4}>Đã hủy</Option>
        </Select>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input
            placeholder="Tìm kiếm theo tên đại lý, nội dung..."
            prefix={<SearchOutlined />}
            style={{ width: 350 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Button onClick={fetchFeedbacks} loading={loading}>Làm mới</Button>
        </Space>
        <Space>
          <StarOutlined style={{ color: '#faad14', fontSize: 18 }} />
          <Text strong>Quản lý Feedback Dealer Staff</Text>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: [10, 20, 50, 100],
          defaultPageSize: 10,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} feedback`,
        }}
        scroll={{ x: true }}
      />
    </Card>
  );
};

export default ManageDealerStaffFeedback;
