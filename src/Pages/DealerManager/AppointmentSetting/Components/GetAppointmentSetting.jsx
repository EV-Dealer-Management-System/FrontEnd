import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Space, message, Spin, Typography, Modal } from 'antd';
import { EditOutlined, ReloadOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { GetAppointmentSetting } from '../../../../App/DealerManager/AppointmentSetting/GetAppointmentSetting';
import { GetAppointmentById } from '../../../../App/DealerManager/AppointmentSetting/GetAppointmentById';
import UpdateAppointmentSettingForm from './UpdateAppointmentSettingForm';

const { Title, Text } = Typography;

const GetAppointmentSettingComponent = () => {
  const [loading, setLoading] = useState(false);
  const [setting, setSetting] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [editFormLoading, setEditFormLoading] = useState(false);

  // Fetch dữ liệu appointment setting
  const fetchSetting = async () => {
    setLoading(true);
    try {
      const response = await GetAppointmentSetting.getAppointmentSetting();
      
      if (response.isSuccess && response.result) {
        setSetting(response.result);
      } else {
        message.error(response.message || 'Không thể tải thông tin appointment setting');
        setSetting(null);
      }
    } catch (error) {
      console.error('Error fetching appointment setting:', error);
      message.error('Đã xảy ra lỗi khi tải thông tin appointment setting');
      setSetting(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetting();
  }, []);

  // Xử lý sửa appointment setting
  const handleEdit = async () => {
    if (!setting || !setting.id) {
      message.error('Không có appointment setting ID để sửa');
      return;
    }

    try {
      setEditFormLoading(true);
      setIsEditModalVisible(true);
      
      // Lấy thông tin chi tiết appointment setting theo ID
      const response = await GetAppointmentById.getAppointmentById(setting.id);
      
      if (response.isSuccess) {
        setSelectedSetting({
          ...response.result,
          id: setting.id
        });
      } else {
        message.error(response.message || 'Không thể tải thông tin appointment setting');
        setIsEditModalVisible(false);
      }
    } catch (error) {
      console.error('Error fetching appointment setting:', error);
      message.error('Đã xảy ra lỗi khi tải thông tin appointment setting');
      setIsEditModalVisible(false);
    } finally {
      setEditFormLoading(false);
    }
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    setSelectedSetting(null);
  };

  const handleEditSuccess = () => {
    handleEditModalClose();
    fetchSetting(); // Refresh danh sách sau khi cập nhật thành công
  };

  // Format time từ "08:00:00" thành "08:00"
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>
          <ClockCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          Cấu Hình Appointment Setting
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchSetting}
            loading={loading}
          >
            Làm Mới
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEdit}
            disabled={!setting || !setting.id}
          >
            Sửa
          </Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        {setting ? (
          <Card>
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Cho phép Lịch hẹn Trùng nhau">
                {setting.allowOverlappingAppointments ? (
                  <Text type="success">Có</Text>
                ) : (
                  <Text type="danger">Không</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Số Lượng Lịch hẹn Đồng thời Tối đa">
                {setting.maxConcurrentAppointments || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Giờ Mở Cửa">
                {formatTime(setting.openTime) || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Giờ Đóng Cửa">
                {formatTime(setting.closeTime) || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Khoảng Thời gian Tối thiểu Giữa các Lịch hẹn (phút)">
                {setting.minIntervalBetweenAppointments || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian Nghỉ Giữa các Lịch hẹn (phút)">
                {setting.breakTimeBetweenAppointments || 0}
              </Descriptions.Item>
              {setting.createdAt && (
                <Descriptions.Item label="Ngày Tạo">
                  {new Date(setting.createdAt).toLocaleString('vi-VN')}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        ) : (
          <Card>
            <Text type="secondary">Không có dữ liệu appointment setting</Text>
          </Card>
        )}
      </Spin>

      {/* Modal Sửa Appointment Setting */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: '#1890ff' }} />
            <span style={{ fontWeight: 600, fontSize: 18 }}>
              Sửa Appointment Setting
            </span>
          </Space>
        }
        open={isEditModalVisible}
        onCancel={handleEditModalClose}
        footer={null}
        width={800}
        destroyOnClose
        centered
      >
        <Spin spinning={editFormLoading}>
          {selectedSetting && (
            <UpdateAppointmentSettingForm
              appointmentId={selectedSetting.id}
              initialValues={selectedSetting}
              onSuccess={handleEditSuccess}
              onCancel={handleEditModalClose}
            />
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default GetAppointmentSettingComponent;

