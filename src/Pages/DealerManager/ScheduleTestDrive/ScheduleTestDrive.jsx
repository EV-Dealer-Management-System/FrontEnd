import React from 'react';
import { Typography } from 'antd';
import { ScheduleOutlined } from '@ant-design/icons';
import DealerManagerLayout from '../../../Components/DealerManager/DealerManagerLayout';
import ListAppointment from './Components/ListAppointment';
import { ToastProvider } from './Components/ToastContainer';

const { Title } = Typography;

const ScheduleTestDrive = () => {
  return (
    <DealerManagerLayout>
      <ToastProvider>
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
          backgroundColor: '#0A0E1A',
          zIndex: 1
        }}>
          <div style={{ 
            padding: '12px 20px', 
            borderBottom: '1px solid #2A2F3C',
            backgroundColor: '#0A0E1A'
          }}>
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              <ScheduleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              Quản Lý Lịch Hẹn Lái Thử
            </Title>
          </div>
          <div style={{ 
            height: 'calc(100vh - 60px)',
            overflow: 'auto',
            backgroundColor: '#0A0E1A'
          }}>
            <ListAppointment />
          </div>
        </div>
      </ToastProvider>
    </DealerManagerLayout>
  );
};

export default ScheduleTestDrive;
