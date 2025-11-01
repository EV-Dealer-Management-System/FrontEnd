import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Switch, Button, Space, message, Card, Typography, TimePicker } from 'antd';
import { ScheduleOutlined } from '@ant-design/icons';
import { UpdateAppointmentSetting } from '../../../../App/DealerManager/AppointmentSetting/UpdateAppointmentSetting';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const UpdateAppointmentSettingForm = ({ appointmentId, initialValues, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      // Chuyển đổi time string thành dayjs object cho TimePicker
      const formValues = {
        ...initialValues,
        openTime: initialValues.openTime ? dayjs(initialValues.openTime, 'HH:mm:ss') : null,
        closeTime: initialValues.closeTime ? dayjs(initialValues.closeTime, 'HH:mm:ss') : null,
      };
      form.setFieldsValue(formValues);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Chuyển đổi dayjs về string format
      const submitData = {
        allowOverlappingAppointments: values.allowOverlappingAppointments,
        maxConcurrentAppointments: values.maxConcurrentAppointments,
        openTime: values.openTime ? values.openTime.format('HH:mm:ss') : null,
        closeTime: values.closeTime ? values.closeTime.format('HH:mm:ss') : null,
        minIntervalBetweenAppointments: values.minIntervalBetweenAppointments || 0,
        breakTimeBetweenAppointments: values.breakTimeBetweenAppointments || 0,
      };

      const response = await UpdateAppointmentSetting.updateAppointmentSetting(appointmentId, submitData);

      if (response.isSuccess) {
        message.success('Cập nhật appointment setting thành công!');
        onSuccess?.();
      } else {
        message.error(response.message || 'Cập nhật appointment setting thất bại');
      }
    } catch (error) {
      console.error('Error updating appointment setting:', error);
      message.error('Đã xảy ra lỗi khi cập nhật appointment setting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Title level={4}>
          <ScheduleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          Cập Nhật Appointment Setting
        </Title>
        <Text type="secondary">
          Điều chỉnh các thiết lập cho appointment setting này.
        </Text>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          allowOverlappingAppointments: true,
          maxConcurrentAppointments: 1,
          minIntervalBetweenAppointments: 0,
          breakTimeBetweenAppointments: 0,
        }}
      >
        <Form.Item
          name="allowOverlappingAppointments"
          label="Cho phép Lịch hẹn Trùng nhau"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="maxConcurrentAppointments"
          label="Số Lượng Lịch hẹn Đồng thời Tối đa"
          rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
        >
          <InputNumber
            min={1}
            max={100}
            style={{ width: '100%' }}
            placeholder="Nhập số lượng lịch hẹn đồng thời tối đa"
          />
        </Form.Item>

        <Form.Item
          name="openTime"
          label="Giờ Mở Cửa"
          rules={[{ required: true, message: 'Vui lòng chọn giờ mở cửa' }]}
        >
          <TimePicker
            format="HH:mm:ss"
            style={{ width: '100%' }}
            placeholder="Chọn giờ mở cửa"
          />
        </Form.Item>

        <Form.Item
          name="closeTime"
          label="Giờ Đóng Cửa"
          rules={[{ required: true, message: 'Vui lòng chọn giờ đóng cửa' }]}
        >
          <TimePicker
            format="HH:mm:ss"
            style={{ width: '100%' }}
            placeholder="Chọn giờ đóng cửa"
          />
        </Form.Item>

        <Form.Item
          name="minIntervalBetweenAppointments"
          label="Khoảng Thời gian Tối thiểu Giữa các Lịch hẹn (phút)"
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            placeholder="Nhập khoảng thời gian tối thiểu (phút)"
          />
        </Form.Item>

        <Form.Item
          name="breakTimeBetweenAppointments"
          label="Thời gian Nghỉ Giữa các Lịch hẹn (phút)"
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            placeholder="Nhập thời gian nghỉ (phút)"
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Cập Nhật
            </Button>
            <Button onClick={onCancel}>
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UpdateAppointmentSettingForm;

