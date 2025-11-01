import React from 'react';
import { Card, Typography, message } from 'antd';
import { ScheduleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const CreateAppointmentSetting = ({ onSuccess, onCancel }) => {
  const handleSubmit = async (values) => {
    // TODO: Implement API call to create appointment slot
    // const response = await CreateAppointmentSetting.createSlot(values);
    // if (response.isSuccess) {
    //   message.success('Tạo slot thành công!');
    //   onSuccess?.();
    // }
    
    // Temporary: Just show success message
    message.success('Tạo slot thành công!');
    onSuccess?.();
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Title level={4}>
          <ScheduleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          Tạo Slot Lịch Lái Thử
        </Title>
        <Text>Component này sẽ được phát triển để tạo slot lịch lái thử.</Text>
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">
            Form tạo slot sẽ được thêm vào đây. Sau khi tạo thành công, danh sách slot sẽ tự động được làm mới.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default CreateAppointmentSetting;

