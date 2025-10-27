import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  InputNumber,
  Switch,
  TimePicker,
  message,
  Typography,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { CreateAppointment } from "../../../../App/DealerManager/ScheduleManagement/CreateAppointment";
import { GetAllAppointment } from "../../../../App/DealerManager/ScheduleManagement/GetAllAppointment";
import Navbar from "../../../../Components/DealerManager/Components/NavigationBar";
import { vehicleApi } from "../../../../App/EVMAdmin/VehiclesManagement/Vehicles";
const { Text, Title } = Typography;

function ManageAppointmentSetting() {
  const [loading, setLoading] = useState(false);
  const [appointmentSettings, setAppointmentSettings] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const result = await GetAllAppointment.getAllAppointments();
      if (result.isSuccess) {
        setAppointmentSettings(result.result || []);
      } else {
        message.error(
          result.message || "Không thể tải danh sách cài đặt lịch hẹn"
        );
      }
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    const formData = {
      allowOverlappingAppointments: values.allowOverlappingAppointments,
      maxConcurrentAppointments: values.maxConcurrentAppointments,
      openTime: values.openTime.format("HH:mm:ss"),
      closeTime: values.closeTime.format("HH:mm:ss"),
      minIntervalBetweenAppointments: values.minIntervalBetweenAppointments,
    };

    setLoading(true);
    try {
      const res = await CreateAppointment.createAppointment(formData);
      if (res.isSuccess) {
        Modal.success({
          title: (
            <Space>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
              Tạo cấu hình lịch hẹn thành công!
            </Space>
          ),
          content: (
            <div style={{ marginTop: 12 }}>
              <p>
                <strong>Giờ mở cửa:</strong> {formData.openTime}
              </p>
              <p>
                <strong>Giờ đóng cửa:</strong> {formData.closeTime}
              </p>
              <p>
                <strong>Tối đa lịch cùng lúc:</strong>{" "}
                {formData.maxConcurrentAppointments}
              </p>
              <p>
                <strong>Cho phép trùng giờ:</strong>{" "}
                {formData.allowOverlappingAppointments ? "Có" : "Không"}
              </p>
            </div>
          ),
        });
        setIsModalVisible(false);
        loadAppointments();
      } else {
        message.error(res.message || "Không thể tạo cấu hình lịch hẹn");
      }
    } catch (e) {
      message.error("Lỗi khi gửi dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      align: "center",
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mở cửa",
      dataIndex: "openTime",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Đóng cửa",
      dataIndex: "closeTime",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Tối đa lịch cùng lúc",
      dataIndex: "maxConcurrentAppointments",
      align: "center",
    },
    {
      title: "Cho phép trùng giờ",
      dataIndex: "allowOverlappingAppointments",
      align: "center",
      render: (val) => (val ? "✅ Có" : "❌ Không"),
    },
    {
      title: "Khoảng cách giữa các lịch (phút)",
      dataIndex: "minIntervalBetweenAppointments",
      align: "center",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 180,
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
  ];

  return (
    <PageContainer
      header={{
        title: "Quản lý cấu hình lịch hẹn",
        subTitle: "Tạo và xem các thiết lập lịch hẹn trong hệ thống",
        extra: [
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={loadAppointments}
            loading={loading}
          >
            Tải lại
          </Button>,
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Tạo cấu hình mới
          </Button>,
        ],
      }}
    >
      <div className="w-full px-4 md:px-6 lg:px-8 pb-6">
        <Card className="shadow-sm">
          <Title level={4}>
            <ClockCircleOutlined style={{ color: "#1890ff", marginRight: 8 }} />
            Danh sách cấu hình lịch hẹn
          </Title>
          <Divider />
          <Table
            columns={columns}
            dataSource={appointmentSettings}
            rowKey="id"
            loading={loading}
            pagination={{
              total: appointmentSettings.length,
              pageSize: 10,
              showTotal: (total) => `Tổng cộng ${total} cấu hình`,
            }}
          />
        </Card>
      </div>

      {/* Modal tạo cấu hình */}
      <Modal
        title="Tạo cấu hình lịch hẹn"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="openTime"
            label="Giờ mở cửa"
            rules={[{ required: true, message: "Vui lòng chọn giờ mở cửa!" }]}
          >
            <TimePicker format="HH:mm" className="w-full" />
          </Form.Item>

          <Form.Item
            name="closeTime"
            label="Giờ đóng cửa"
            rules={[{ required: true, message: "Vui lòng chọn giờ đóng cửa!" }]}
          >
            <TimePicker format="HH:mm" className="w-full" />
          </Form.Item>

          <Form.Item
            name="maxConcurrentAppointments"
            label="Số lịch hẹn tối đa cùng lúc"
            rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item
            name="minIntervalBetweenAppointments"
            label="Khoảng cách giữa các lịch (phút)"
            rules={[{ required: true, message: "Vui lòng nhập khoảng cách!" }]}
          >
            <InputNumber min={5} className="w-full" />
          </Form.Item>

          <Form.Item
            name="allowOverlappingAppointments"
            label="Cho phép trùng lịch hẹn"
            valuePropName="checked"
          >
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo cấu hình
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </PageContainer>
  );
}

export default ManageAppointmentSetting;
