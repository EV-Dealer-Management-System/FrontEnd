import React from 'react';
import { Form, Input, Button, Rate, Card, Typography } from 'antd';
import { SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title } = Typography;

const CreateFeedBack = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Feedback submitted:', values);
    // TODO: Gọi API tạo feedback
  };

  return (
    <Card>
      <Title level={4}>Tạo Feedback Mới</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="customerName"
          label="Tên Khách Hàng"
          rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
        >
          <Input placeholder="Nhập tên khách hàng" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>

        <Form.Item
          name="phoneNumber"
          label="Số Điện Thoại"
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item
          name="subject"
          label="Chủ Đề"
          rules={[{ required: true, message: 'Vui lòng nhập chủ đề!' }]}
        >
          <Input placeholder="Nhập chủ đề feedback" />
        </Form.Item>

        <Form.Item
          name="message"
          label="Nội Dung"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
        >
          <TextArea rows={4} placeholder="Nhập nội dung feedback" />
        </Form.Item>

        <Form.Item
          name="rating"
          label="Đánh Giá"
          rules={[{ required: true, message: 'Vui lòng chọn đánh giá!' }]}
        >
          <Rate />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SendOutlined />} block>
            Gửi Feedback
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateFeedBack;

