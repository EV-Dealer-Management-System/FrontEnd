import React from 'react';
import { Typography } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import DealerManagerLayout from '../../../Components/DealerManager/DealerManagerLayout';
import GetStaffFeedback from './Components/GetStaffFeedback';

const { Title } = Typography;

const FeedbackDealerStaff = () => {
  return (
    <DealerManagerLayout>
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
                    Quản Lý Feedback Dealer Staff
                  </Title>
                </div>
        <div style={{ 
          height: 'calc(100vh - 80px)',
          overflow: 'auto',
          padding: '24px'
        }}>
          <GetStaffFeedback />
        </div>
      </div>
    </DealerManagerLayout>
  );
};

export default FeedbackDealerStaff;
