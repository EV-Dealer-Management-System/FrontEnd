import React from 'react';
import { Typography } from 'antd';
import { ScheduleOutlined } from '@ant-design/icons';
import DealerStaffLayout from '../../../Components/DealerStaff/DealerStaffLayout';
import ListAppointment from './Components/ListAppointment';
import { ToastProvider } from './Components/ToastContainer';

const { Title } = Typography;

const ScheduleTestDrive = () => {
  return (
    <DealerStaffLayout>
      <style>{`
        .schedule-page-container {
          left: 280px !important;
          transition: left 0.2s ease;
        }
        
        @media (max-width: 767px) {
          .schedule-page-container {
            left: 0 !important;
          }
        }
        
        /* Khi navbar collapsed (64px) */
        body:has(.ant-pro-sider[style*="width: 64px"]) .schedule-page-container {
          left: 64px !important;
        }
      `}</style>
      <div
        className="schedule-page-container"
        style={{
          position: 'fixed',
          top: 0,
          left: 280,
          right: 0,
          bottom: 0,
          backgroundColor: '#f0f2f5',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 1
        }}>
        <ToastProvider>
          <div style={{
            padding: '12px 20px',
            borderBottom: '1px solid #d9d9d9',
            backgroundColor: '#ffffff',
            flexShrink: 0
          }}>
            <Title level={4} style={{ margin: 0, color: '#262626' }}>
              <ScheduleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              Quản Lý Lịch Hẹn Lái Thử
            </Title>
          </div>
          <div style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#f0f2f5'
          }}>
            <ListAppointment />
          </div>
        </ToastProvider>
      </div>
    </DealerStaffLayout>
  );
}; export default ScheduleTestDrive;
