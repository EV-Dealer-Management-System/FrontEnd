import React, { useState, useRef } from 'react';
import { Typography, Modal, Button, Space } from 'antd';
import { ScheduleOutlined, PlusOutlined } from '@ant-design/icons';
import DealerManagerLayout from '../../../Components/DealerManager/DealerManagerLayout';
import CreateAppointmentSetting from './Components/CreateAppointmentSetting';
import GetAvailableAppointment from './Components/GetAvailableAppointment';
import GetAppointmentSetting from './Components/GetAppointmentSetting';

const { Title } = Typography;

const Appointment = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const getAvailableAppointmentRef = useRef(null);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSuccess = () => {
    setIsModalVisible(false);
    // Refresh danh sách slot sau khi tạo thành công
    if (getAvailableAppointmentRef.current) {
      getAvailableAppointmentRef.current.refresh();
    }
  };

  return (
    <DealerManagerLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>
            <ScheduleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Quản Lý Lịch Lái Xe
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={showModal}
            style={{
              backgroundColor: '#52c41a',
              borderColor: '#52c41a',
            }}
          >
            Tạo Slot Lịch
          </Button>
        </div>
        
        <GetAvailableAppointment ref={getAvailableAppointmentRef} />
        
        <div style={{ marginTop: 24 }}>
          <GetAppointmentSetting />
        </div>

        <Modal
          title={
            <Space>
              <ScheduleOutlined style={{ color: '#1890ff' }} />
              <span style={{ fontWeight: 600, fontSize: 18 }}>
                Tạo Slot Lịch Lái Thử
              </span>
            </Space>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={800}
          destroyOnClose
          centered
        >
          <CreateAppointmentSetting onSuccess={handleSuccess} onCancel={handleCancel} />
        </Modal>
      </div>
    </DealerManagerLayout>
  );
};

export default Appointment;

