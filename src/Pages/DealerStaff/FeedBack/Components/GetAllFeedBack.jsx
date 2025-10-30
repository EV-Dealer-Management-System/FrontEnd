import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Tag, Space, Input, Typography, message, Image, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, StarOutlined, PictureOutlined } from '@ant-design/icons';
import { GetAllCustomerFeedBack } from '../../../../App/DealerStaff/FeedBackManagement/GetAllCustomerFeedBack';
import CreateFeedBack from './CreateFeedBack';

const { Text } = Typography;

const GetAllFeedBack = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [createVisible, setCreateVisible] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await GetAllCustomerFeedBack.getAllCustomerFeedBacks();
      
      if (response.isSuccess) {
        setData(response.result || []);
      } else {
        message.error(response.message || 'Không thể tải danh sách feedback');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      message.error('Đã xảy ra lỗi khi tải danh sách feedback');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { text: 'Chờ xử lý', color: 'gold' },
      1: { text: 'Đã xử lý', color: 'green' },
      2: { text: 'Đã đóng', color: 'default' },
    };
    const statusInfo = statusMap[status] || { text: 'Không xác định', color: 'default' };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const filteredData = data.filter(item => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      item.customerName?.toLowerCase().includes(search) ||
      item.customerEmail?.toLowerCase().includes(search) ||
      item.customerPhone?.includes(search) ||
      item.feedbackContent?.toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      render: (_, __, index) => index + 1,
      align: 'center',
      width: 60,
    },
    {
      title: 'Khách Hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 180,
      render: (text, record) => (
        <div>
          <div><Text strong>{text || 'N/A'}</Text></div>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{record.customerPhone || 'N/A'}</Text></div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'customerEmail',
      key: 'customerEmail',
      width: 200,
      ellipsis: true,
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
      width: 100,
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
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
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
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input
            placeholder="Tìm kiếm theo tên, email, SĐT..."
            prefix={<SearchOutlined />}
            style={{ width: 350 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Button onClick={fetchFeedbacks} loading={loading}>
            Làm mới
          </Button>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateVisible(true)}>
          Tạo Feedback Mới
        </Button>
      </div>

      <Card
        title={
          <Space>
            <StarOutlined style={{ color: '#faad14' }} />
            <Text strong>Danh Sách Feedback</Text>
          </Space>
        }
        extra={
          <Space>
            <Text type="secondary">
              Hiển thị: {filteredData.length} / {data.length} feedback
            </Text>
          </Space>
        }
      >
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
        />
      </Card>
      <Modal
        open={createVisible}
        onCancel={() => setCreateVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
        title="Tạo Feedback"
      >
        <CreateFeedBack onSuccess={fetchFeedbacks} onCancel={() => setCreateVisible(false)} />
      </Modal>
    </>
  );
};

export default GetAllFeedBack;

