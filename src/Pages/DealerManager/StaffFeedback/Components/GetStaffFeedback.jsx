import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Space, Input, Typography, Image, Button, Modal, App } from 'antd';
import { SearchOutlined, StarOutlined, PlusOutlined } from '@ant-design/icons';
import { GetStaffFeedback } from '../../../../App/DealerManager/StaffFeedbackManage/GetStaffFeedback.js';
import CreateStaffFeedback from './CreateStaffFeedback';

const { Text } = Typography;

const GetStaffFeedbackComponent = () => {
  const { message } = App.useApp(); // Sử dụng hook từ AntdApp
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [createVisible, setCreateVisible] = useState(false);

  useEffect(() => { 
    fetchFeedback(); 
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await GetStaffFeedback.getStaffFeedback();
      if (res?.isSuccess) {
        setData(res.result || []);
      } else {
        message.error(res?.message || 'Không tải được feedback!');
      }
    } catch (err) {
      message.error('Đã xảy ra lỗi khi tải feedback');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      item.dealerName?.toLowerCase().includes(search) ||
      item.feedbackContent?.toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { text: 'Chờ xử lý', color: 'gold' },
      1: { text: 'Đã xử lý', color: 'green' },
      2: { text: 'Đã đóng', color: 'default' },
    };
    const info = statusMap[status] || { text: 'Không xác định', color: 'default' };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const columns = [
    { title: 'STT', dataIndex: 'index', render: (_, __, idx) => idx + 1, align: 'center', width: 60 },
    { title: 'Đại lý', dataIndex: 'dealerName', key: 'dealerName', width: 200, render: (text) => <Text strong>{text}</Text> },
    { title: 'Nội dung', dataIndex: 'feedbackContent', key: 'feedbackContent', ellipsis: true, render: (text) => <Text ellipsis={{ tooltip: text }}>{text || 'Không có nội dung'}</Text> },
    { title: 'Hình ảnh', dataIndex: 'imgUrls', key: 'imgUrls', align: 'center', width: 120, render: (imgUrls) => {
      if (!imgUrls || imgUrls.length === 0) return <Text type="secondary">Không có</Text>;
      return <Space>
        <Image.PreviewGroup>
          {imgUrls.slice(0, 3).map((url, i) => (
            <Image key={i} width={30} height={30} src={url} style={{ objectFit: 'cover', borderRadius: 4 }} />
          ))}
        </Image.PreviewGroup>
        {imgUrls.length > 3 && <Text type="secondary">+{imgUrls.length - 3}</Text>}
      </Space>;
    }},
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 100, render: getStatusBadge, align: 'center' },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (date) => new Date(date).toLocaleDateString('vi-VN'), width: 130 },
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
          <Button onClick={fetchFeedback} loading={loading}>Làm mới</Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateVisible(true)}
          >
            Tạo Feedback
          </Button>
        </Space>
        <Space>
          <StarOutlined style={{ color: '#faad14', fontSize: 18 }} />
          <Text strong>Lịch sử Feedback DealerStaff</Text>
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

      <Modal
        title="Tạo Feedback Mới"
        open={createVisible}
        onCancel={() => setCreateVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <CreateStaffFeedback
          onSuccess={(responseMessage) => {
            console.log('🎯 onSuccess được gọi, message:', responseMessage);
            setCreateVisible(false);
            fetchFeedback();
            // Hiển thị message từ component cha sau khi modal đóng
            setTimeout(() => {
              console.log('⏰ Sau 200ms, gọi message.success');
              try {
                message.success({
                  content: responseMessage || 'Tạo feedback thành công!',
                  duration: 5,
                });
                console.log('✅ message.success đã được gọi');
              } catch (err) {
                console.error('❌ Lỗi khi gọi message.success:', err);
                alert('✅ ' + (responseMessage || 'Tạo feedback thành công!'));
              }
            }, 200);
          }}
          onCancel={() => setCreateVisible(false)}
        />
      </Modal>
    </Card>
  );
};

export default GetStaffFeedbackComponent;

