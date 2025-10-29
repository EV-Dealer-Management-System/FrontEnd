import React from 'react';
import { Typography } from 'antd';
import { ScheduleOutlined } from '@ant-design/icons';
import DealerManagerLayout from '../../../Components/DealerManager/DealerManagerLayout';
import ListAppointment from './Components/ListAppointment';

const { Title } = Typography;

const ScheduleTestDrive = () => {
  return (
    <DealerManagerLayout>
      <div style={{ padding: '16px', width: '100%', maxWidth: '100%' }}>
        <div style={{ marginBottom: '16px' }}>
          <Title level={3}>
            <ScheduleOutlined className="mr-2 text-blue-600" />
            Quản Lý Lịch Hẹn Lái Thử
          </Title>
        </div>
        <ListAppointment />
      </div>
    </DealerManagerLayout>
  );
};

export default ScheduleTestDrive;
