import React from 'react';
import { Typography } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import DealerManagerLayout from '../../../Components/DealerManager/DealerManagerLayout';
import ManageCustomerFeedback from './Components/ManageCustomerFeedback';

const { Title } = Typography;

const UpdateStatusCustomerFeedback = () => {
  return (
    <DealerManagerLayout>
      <style>{`
        .customer-feedback-container {
          left: 280px !important;
          width: calc(100vw - 280px) !important;
          transition: left 0.2s ease, width 0.2s ease;
        }
        
        @media (max-width: 767px) {
          .customer-feedback-container {
            left: 0 !important;
            width: 100vw !important;
          }
        }
        
        /* Khi navbar collapsed (64px) */
        body:has(.ant-pro-sider[style*="width: 64px"]) .customer-feedback-container {
          left: 64px !important;
          width: calc(100vw - 64px) !important;
        }
      `}</style>
      <div
        className="customer-feedback-container"
        style={{
          position: 'fixed',
          top: 0,
          left: 280,
          right: 0,
          bottom: 0,
          width: 'calc(100vw - 280px)',
          height: '100vh',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#f0f2f5',
          zIndex: 1
        }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #d9d9d9',
          backgroundColor: '#fff'
        }}>
          <Title level={3} style={{ margin: 0 }}>
            <CommentOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Quản Lý Feedback Customer
          </Title>
        </div>
        <div style={{
          height: 'calc(100vh - 80px)',
          overflow: 'auto',
          padding: '24px'
        }}>
          <ManageCustomerFeedback />
        </div>
      </div>
    </DealerManagerLayout>
  );
};

export default UpdateStatusCustomerFeedback;

