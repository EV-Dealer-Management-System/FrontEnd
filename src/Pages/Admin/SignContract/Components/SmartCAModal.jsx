import React from 'react';
import { Modal, Button, Alert } from 'antd';
import { EditOutlined } from '@ant-design/icons';

// VNPT SmartCA Modal - Signing Process
const SmartCAModal = ({ 
  visible, 
  onCancel, 
  contractNo
}) => {
  return (
    <Modal
      title={
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <EditOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
          Đang Thực Hiện Ký Điện Tử
        </span>
      }
      open={visible}
      onCancel={() => {
        onCancel();
      }}
      footer={null}
      width={500}
      centered
      closable={true}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Alert
          message={
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                📱 Vui lòng mở ứng dụng VNPT SmartCA để tiếp tục
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Hệ thống đang chờ bạn xác nhận ký điện tử trên ứng dụng
              </div>
            </div>
          }
          type="info"
          style={{ marginBottom: '24px', textAlign: 'left' }}
        />
        
        <div style={{
          border: '2px dashed #1890ff',
          borderRadius: '8px',
          padding: '24px',
          backgroundColor: '#f0f8ff',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#1890ff', marginBottom: '12px' }}>
            VNPT SmartCA
          </div>
          <div style={{ fontSize: '14px', color: '#666', textAlign: 'left', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Các bước thực hiện:</strong>
            </div>
            <div style={{ marginBottom: '6px' }}>1. Mở ứng dụng <strong>VNPT SmartCA</strong> trên điện thoại</div>
            <div style={{ marginBottom: '6px' }}>2. Tìm thông báo ký điện tử cho hợp đồng số: <strong style={{ color: '#1890ff' }}>{contractNo}</strong></div>
            <div style={{ marginBottom: '6px' }}>3. Nhập mật khẩu hoặc xác thực sinh trắc học</div>
            <div style={{ marginBottom: '6px' }}>4. Xác nhận ký điện tử trong ứng dụng</div>
          </div>
          
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fff7e6',
            borderRadius: '6px',
            border: '1px solid #ffd591'
          }}>
            <div style={{ fontSize: '14px', color: '#fa8c16', textAlign: 'center' }}>
              <span style={{ marginRight: '8px' }}>⏳</span>
              <strong>Đang chờ xác nhận từ VNPT SmartCA...</strong>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
          💡 <strong>Lưu ý:</strong> Nếu không nhận được thông báo trong ứng dụng, vui lòng kiểm tra kết nối internet và thử lại.
        </div>

        <Button
          onClick={onCancel}
          style={{ minWidth: '120px' }}
        >
          Hủy Ký
        </Button>
      </div>
    </Modal>
  );
};

export default SmartCAModal;