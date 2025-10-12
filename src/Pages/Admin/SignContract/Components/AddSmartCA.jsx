import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { SmartCAService } from '../../../../App/EVMAdmin/SignContractEVM/SmartCA';

// Component để thêm SmartCA
function AddSmartCA({ visible, onCancel, onSuccess, contractInfo }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const smartCAService = SmartCAService();

  // Xử lý submit form với logic thực tế
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Validate CCCD
      const cccdValidation = smartCAService.validateCCCD(values.cccd);
      if (!cccdValidation.valid) {
        message.error(cccdValidation.message);
        return;
      }
      
      // Chuẩn bị data để thêm SmartCA
      const addSmartCAData = {
        userId: contractInfo?.userId || localStorage.getItem('userId') || '1', // Fallback userId
        userName: values.cccd, // Sử dụng CCCD làm userName
        serialNumber: values.serialNumber || null,
        accessToken: contractInfo?.accessToken || localStorage.getItem('jwt_token') // Sử dụng token từ contractInfo hoặc localStorage
      };
      
      console.log('Adding SmartCA with data:', addSmartCAData);
      
      // Gọi API thêm SmartCA
      const result = await smartCAService.handleAddSmartCA(addSmartCAData);
      
      if (result.success) {
        message.success(result.message || 'Thêm SmartCA thành công!');
        form.resetFields();
        onSuccess && onSuccess({
          ...values,
          smartCAData: result.data,
          hasValidSmartCA: result.hasValidSmartCA
        });
      } else {
        message.error(result.error || 'Có lỗi khi thêm SmartCA');
      }
      
    } catch (error) {
      console.error('Lỗi khi thêm SmartCA:', error);
      message.error('Có lỗi không mong muốn khi thêm SmartCA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title="Thêm SmartCA"
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Thêm"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="cccd"
          label="CCCD/CMND"
          rules={[
            { required: true, message: 'Vui lòng nhập CCCD/CMND' },
            { pattern: /^[0-9]{9,12}$/, message: 'CCCD/CMND phải từ 9-12 chữ số' }
          ]}
        >
          <Input placeholder="Nhập CCCD/CMND (9-12 chữ số)" maxLength={12} />
        </Form.Item>
        <Form.Item name="serialNumber" label="Serial Number (tuỳ chọn)">
          <Input placeholder="Serial Number nếu có" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default AddSmartCA;