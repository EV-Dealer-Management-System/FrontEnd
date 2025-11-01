import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Upload, Tooltip, App } from 'antd';
import { SendOutlined, PlusOutlined } from '@ant-design/icons';
import { CreateStaffFeedBack } from '../../../../App/DealerManager/StaffFeedbackManage/CreateStaffFeedBack';
import { UploadFileDealerFeedback } from '../../../../App/DealerManager/StaffFeedbackManage/UploadFileDealerFeedback';

const { TextArea } = Input;
const { Title } = Typography;

const CreateStaffFeedback = ({ onSuccess, onCancel }) => {
  const { message } = App.useApp(); // Sử dụng hook từ AntdApp
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);

  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      // Lấy uploadUrl + objectKey từ backend
      const res = await UploadFileDealerFeedback.uploadFileDealerFeedback({
        fileName: `${file.name.replace(/\.[^/.]+$/, '')}.png`, // Đổi extension thành .png
        contentType: 'image/jpeg', // contentType là image/jpeg
      });
      
      const uploadUrl = res?.result?.uploadUrl || res?.data?.uploadUrl;
      const objectKey = res?.result?.objectKey || res?.data?.objectKey;
      
      if (!uploadUrl || !objectKey) {
        throw new Error("Thiếu uploadUrl hoặc objectKey");
      }

      // Upload file thực tới S3 qua pre-signed URL
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": 'image/jpeg' },
        body: file,
      });

      // Gán key vào response để Antd quản lý đúng
      onSuccess({ attachmentKey: objectKey }, file);
      message.success({
        content: `${file.name} upload thành công`,
        duration: 2,
        style: { zIndex: 9999 },
      });
    } catch (e) {
      onError(e);
      message.error({
        content: `${file.name} upload thất bại!`,
        duration: 3,
        style: { zIndex: 9999 },
      });
      console.error('Upload error:', e);
    }
  };

  const handleChange = ({ fileList: next }) => {
    // Chỉ giữ tối đa 8 ảnh
    setFileList(next.slice(0, 8));
  };

  const onFinish = async (values) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Lấy attachmentKeys từ file.response.attachmentKey
      const attachmentKeys = fileList
        .map((file) => file.response?.attachmentKey)
        .filter(Boolean);

      const payload = {
        feedbackContent: values.feedbackContent,
        attachmentKeys,
        status: 0, // Mặc định là "Chờ xử lý" cho dealer staff feedback
      };

      const res = await CreateStaffFeedBack.createStaffFeedBack(payload);
      
      if (res?.isSuccess || res?.success) {
        // Reset form
        form.resetFields();
        setFileList([]);
        
        // Gọi callback onSuccess với message từ API
        const successMessage = res?.message || 'Tạo feedback thành công! Feedback của bạn đã được gửi.';
        onSuccess && onSuccess(successMessage);
        onCancel && onCancel();
      } else {
        message.error({
          content: res?.message || res?.error || 'Tạo feedback thất bại. Vui lòng thử lại!',
          duration: 4,
        });
      }
    } catch (e) {
      message.error({
        content: 'Đã xảy ra lỗi khi tạo feedback. Vui lòng thử lại!',
        duration: 3,
      });
      console.error('Error creating feedback:', e);
    } finally {
      setSubmitting(false);
    }
  };

  // Kiểm tra xem tất cả ảnh đã upload xong chưa
  const allUploaded = fileList.length === 0 || fileList.every(
    (file) => file.status === 'done' && file.response?.attachmentKey
  );

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
    </div>
  );

  return (
    <Card>
      <Title level={4}>Tạo Feedback Mới</Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Nội dung Feedback"
          name="feedbackContent"
          rules={[
            { required: true, message: 'Vui lòng nhập nội dung feedback!' },
            { min: 10, message: 'Nội dung phải có ít nhất 10 ký tự!' }
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Nhập nội dung feedback của bạn..."
            showCount
            maxLength={500}
          />
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
            {fileList.length >= 8 ? null : uploadButton}
          </Upload>
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            {onCancel && (
              <Button onClick={onCancel} disabled={submitting}>
                Hủy
              </Button>
            )}
            <Tooltip
              title={!allUploaded ? "Vui lòng đợi tất cả ảnh upload xong" : ""}
            >
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={submitting}
                disabled={!allUploaded || submitting}
              >
                Gửi Feedback
              </Button>
            </Tooltip>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateStaffFeedback;

