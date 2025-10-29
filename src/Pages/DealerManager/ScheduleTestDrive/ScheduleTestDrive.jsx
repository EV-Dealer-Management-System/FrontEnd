import React, { useState } from 'react';
import { Row, Col, Card, Typography } from 'antd';
import { ScheduleOutlined } from '@ant-design/icons';
import DealerManagerLayout from '../../../Components/DealerManager/DealerManagerLayout';
import CreateAppointmentForm from './Components/CreateAppointment';
import ListAppointment from './Components/ListAppointment';

const { Title } = Typography;

const ScheduleTestDrive = () => {
  const [refreshList, setRefreshList] = useState(0);

  const handleAppointmentCreated = () => {
    // Trigger list refresh by changing the key
    setRefreshList(prev => prev + 1);
  };

  return (
    <DealerManagerLayout>
      <div className="p-6">
        <Card 
          title={
            <Title level={3}>
              <ScheduleOutlined className="mr-2 text-blue-600" />
              Quản Lý Lịch Hẹn Lái Thử
            </Title>
          }
        >
          <Row gutter={[24, 24]}>
            {/* Form Tạo Lịch Hẹn */}
            <Col xs={24} lg={8}>
              <CreateAppointmentForm 
                onAppointmentCreated={handleAppointmentCreated} 
              />
            </Col>

            {/* Danh Sách Lịch Hẹn */}
            <Col xs={24} lg={16}>
              <ListAppointment key={refreshList} />
            </Col>
          </Row>
        </Card>
      </div>
    </DealerManagerLayout>
  );
};

export default ScheduleTestDrive;
