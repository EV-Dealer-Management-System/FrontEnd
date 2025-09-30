import React from 'react';
import { Modal, Button, Space } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

// App Verification Modal - Step 2
const AppVerifyModal = ({ 
  visible, 
  onCancel, 
  onVerify, 
  loading,
  signatureCompleted 
}) => {
  return (
    <Modal
      title={
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <CheckOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
          Bước 2/2: Xác Thực Trên Ứng Dụng
        </span>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
      centered
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{
          border: '2px dashed #52c41a',
          borderRadius: '8px',
          padding: '24px',
          backgroundColor: '#f6ffed',
          marginBottom: '24px'
        }}>
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: '1px solid #d9d9d9'
          }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              🔒 Trạng thái hiện tại:
            </div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#52c41a' }}>
              ✓ Ký SmartCA hoàn tất
            </div>
          </div>
        </div>

        <Space size="large">
          <Button
            onClick={onCancel}
            style={{ minWidth: '120px' }}
          >
            Hủy
          </Button>
          
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={onVerify}
            loading={loading}
            disabled={!signatureCompleted}
            style={{ 
              minWidth: '120px',
              backgroundColor: '#52c41a',
              borderColor: '#52c41a'
            }}
          >
            {loading ? 'Đang xác thực...' : 'OK'}
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default AppVerifyModal;