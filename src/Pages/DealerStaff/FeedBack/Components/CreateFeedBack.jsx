import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Upload, Select, message, Spin } from 'antd';
import { SendOutlined, PlusOutlined } from '@ant-design/icons';
import { CreateCustomerFeedBack } from '../../../../App/DealerStaff/FeedBackManagement/CreateCustomerFeedBack';
import { UploadFileFeedback } from '../../../../App/DealerStaff/FeedBackManagement/UploadFileFeedback';
import { GetAllCustomer } from '../../../../App/DealerStaff/FeedBackManagement/GetAllCustomer';

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

const CreateFeedBack = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);
  // State cho khách hàng
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const res = await GetAllCustomer.getAllCustomer();
        if (res?.isSuccess || res?.success) {
          setCustomers(res.result || res.data || []);
        }
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      // 1. Lấy uploadUrl + objectKey từ backend (gửi JSON)
      const res = await UploadFileFeedback.uploadFileFeedback({
        fileName: file.name,
        contentType: file.type,
      });
      const uploadUrl = res?.result?.uploadUrl || res?.data?.uploadUrl;
      const objectKey = res?.result?.objectKey || res?.data?.objectKey;
      if (!uploadUrl || !objectKey) throw new Error("Thiếu uploadUrl hoặc objectKey");

      // 2. Upload file thực tới S3 qua pre-signed URL
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      // Gán key vào response để Antd quản lý đúng
      onSuccess({ attachmentKey: objectKey }, file);
    } catch (e) {
      onError(e);
      message.error("Upload ảnh thất bại!");
      console.error(e);
    }
  };

  const handleChange = ({ fileList: next }) => {
    // Chỉ giữ tối đa 8, fileList này có thể chứa nhiều trường ngoài attachmentKey (được gán lúc upload thành công)
    setFileList(next.slice(0, 8));
  };

  const onFinish = async (values) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Lấy key từ file.response.attachmentKey
      const attachmentKeys = fileList
        .map((file) => file.response?.attachmentKey)
        .filter(Boolean);

      const payload = {
        customerId: values.customerId,
        feedbackContent: values.feedbackContent,
        attachmentKeys,
        status: 1,
      };

      message.loading({ content: 'Đang tạo feedback...', key: 'create', duration: 0 });
      const res = await CreateCustomerFeedBack.createCustomerFeedBack(payload);
      message.destroy('create');
      if (res?.isSuccess || res?.success) {
        message.success(res?.message || 'Tạo feedback thành công');
        form.resetFields();
        setFileList([]);
        onSuccess && onSuccess();
        onCancel && onCancel();
      } else {
        message.error(res?.message || res?.error || 'Tạo feedback thất bại');
      }
    } catch (e) {
      message.destroy('create');
      message.error('Đã xảy ra lỗi. Vui lòng thử lại.');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const allUploaded = fileList.every(file => file.status === 'done' && file.response && file.response.attachmentKey);

  return (
    <Card>
      <Title level={4}>Tạo Feedback Mới</Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="customerId"
          label="Khách hàng"
          rules={[{ required: true, message: 'Vui lòng chọn khách hàng!' }]}
        >
          <Select
            showSearch
            placeholder="Chọn khách hàng"
            optionFilterProp="children"
            loading={loadingCustomers}
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {customers.map((cus) => (
              <Option key={cus.id} value={cus.id}>
                {cus.fullName} {cus.phoneNumber ? `(${cus.phoneNumber})` : ''}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="feedbackContent"
          label="Nội dung Feedback"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
        >
          <TextArea rows={4} placeholder="Nhập nội dung feedback" />
        </Form.Item>

        <Form.Item label="Hình ảnh đính kèm (tối đa 8)">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleChange}
            customRequest={customUpload}
            accept="image/*"
          >
            {fileList.length >= 8 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={submitting}
            block
            disabled={!allUploaded || submitting}
            title={!allUploaded ? 'Vui lòng chờ upload ảnh xong!' : ''}
          >
            Gửi Feedback
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateFeedBack;

