import React from 'react';
import { Typography, Card } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import DealerStaffLayout from '../../../Components/DealerStaff/DealerStaffLayout';
import GetAllFeedBack from './Components/GetAllFeedBack';

const { Title } = Typography;

const FeedBack = () => {
  return (
    <DealerStaffLayout>
      <div style={{ 
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
            Quản Lý Feedback
          </Title>
        </div>
        <div style={{ 
          height: 'calc(100vh - 80px)',
          overflow: 'auto',
          padding: '24px'
        }}>
          <GetAllFeedBack />
        </div>
      </div>
    </DealerStaffLayout>
  );
};

export default FeedBack;

