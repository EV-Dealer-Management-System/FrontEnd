import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Upload, Select, Spin, Tooltip, App } from 'antd';
import { SendOutlined, PlusOutlined } from '@ant-design/icons';
import { CreateCustomerFeedBack } from '../../../../App/DealerStaff/FeedBackManagement/CreateCustomerFeedBack';
import { UploadFileFeedback } from '../../../../App/DealerStaff/FeedBackManagement/UploadFileFeedback';
import { GetAllCustomer } from '../../../../App/DealerStaff/FeedBackManagement/GetAllCustomer';

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

const CreateFeedBack = ({ onSuccess, onCancel }) => {
  const { message } = App.useApp(); // Sử dụng hook từ AntdApp
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
      const res = await UploadFileFeedback.uploadFileFeedback({
        fileName: `${file.name.replace(/\.[^/.]+$/, '')}.jpg`,
        contentType: 'image/jpeg',
      });
      
      const uploadUrl = res?.result?.uploadUrl || res?.data?.uploadUrl;
      const objectKey = res?.result?.objectKey || res?.data?.objectKey;
      
      if (!uploadUrl || !objectKey) {
        throw new Error("Thiếu uploadUrl hoặc objectKey");
      }

      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": 'image/jpeg' },
        body: file,
      });

      onSuccess({ attachmentKey: objectKey }, file);
      message.success(`${file.name} upload thành công`);
    } catch (e) {
      onError(e);
      message.error(`${file.name} upload thất bại!`);
      console.error('Upload error:', e);
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
      const attachmentKeys = fileList
        .map((file) => file.response?.attachmentKey)
        .filter(Boolean);

      const payload = {
        customerId: values.customerId,
        feedbackContent: values.feedbackContent,
        attachmentKeys,
        status: 0, // Pending - trạng thái mặc định khi tạo mới
      };

      const res = await CreateCustomerFeedBack.createCustomerFeedBack(payload);
      
      if (res?.isSuccess || res?.success) {
        form.resetFields();
        setFileList([]);
        
        const successMessage = res?.message || 'Tạo feedback thành công!';
        onSuccess && onSuccess(successMessage);
        onCancel && onCancel();
      } else {
        message.error(res?.message || res?.error || 'Tạo feedback thất bại');
      }
    } catch (e) {
      message.error('Đã xảy ra lỗi khi tạo feedback. Vui lòng thử lại!');
      console.error('Error creating feedback:', e);
    } finally {
      setSubmitting(false);
    }
  };

  // Kiểm tra xem tất cả ảnh đã upload xong chưa
  const allUploaded = fileList.length === 0 || fileList.every(
    (file) => file.status === 'done' && file.response?.attachmentKey
  );

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

        <Form.Item label="Hình ảnh đính kèm (Tối đa 8 ảnh)">
          <Upload
            listType="picture-card"
            fileList={fileList}
            customRequest={customUpload}
            onChange={handleChange}
            beforeUpload={(file) => {
              const isImage = file.type.startsWith('image/');
              if (!isImage) {
                message.error('Chỉ được upload file ảnh!');
                return Upload.LIST_IGNORE;
              }
              const isLt5M = file.size / 1024 / 1024 < 5;
              if (!isLt5M) {
                message.error('Ảnh phải nhỏ hơn 5MB!');
                return Upload.LIST_IGNORE;
              }
              return true;
            }}
            onRemove={(file) => {
              const index = fileList.indexOf(file);
              const newFileList = fileList.slice();
              newFileList.splice(index, 1);
              setFileList(newFileList);
            }}
          >
            {fileList.length >= 8 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item>
          <Tooltip
            title={!allUploaded ? "Vui lòng đợi tất cả ảnh upload xong" : ""}
          >
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={submitting}
              block
              disabled={!allUploaded || submitting}
            >
              Gửi Feedback
            </Button>
          </Tooltip>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateFeedBack;

