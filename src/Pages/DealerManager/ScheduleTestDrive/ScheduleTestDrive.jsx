import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  TimePicker,
  Switch,
  Button,
  Typography,
  message,
  Divider,
  Space,
  Row,
  Col,
  Alert,
} from "antd";
import { PageContainer } from "@ant-design/pro-components";
import { SettingOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import DealerManagerLayout from "../../../Components/DealerManager/DealerManagerLayout";

const { Text } = Typography;

function ScheduleTestDrive() {
  const [form] = Form.useForm();
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const requestData = {
        managerId: values.managerId,
        dealerId: values.dealerId,
        allowOverlappingAppointments: values.allowOverlappingAppointments,
        maxConcurrentAppointments: values.maxConcurrentAppointments,
        openTime: values.openTime.format("HH:mm:ss"),
        closeTime: values.closeTime.format("HH:mm:ss"),
        minIntervalBetweenAppointments: values.minIntervalBetweenAppointments,
      };

      console.log("➡️ Dữ liệu gửi đi:", requestData);

      // 🔽 Giả lập API response (thay bằng api.post() sau này)
      const response = {
        isSuccess: true,
        message: "Appointment setting created successfully",
        statusCode: 201,
        result: {
          id: "019a1f7e-8267-7dc2-8d47-101d19df08de",
          ...requestData,
          createdAt: "2025-10-26T07:49:35.9547044Z",
        },
      };

      message.success(response.message);
      setApiResponse(response);
    } catch (err) {
      message.error("Đã xảy ra lỗi khi gửi dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DealerManagerLayout>
      <PageContainer
        header={{
          title: "Cài đặt lịch lái thử",
          subTitle: "Thiết lập thông tin đại lý và khung giờ hoạt động",
          breadcrumb: {
            items: [
              { title: "Trang chủ" },
              { title: "Quản lý đại lý" },
              { title: "Đặt lịch lái thử" },
            ],
          },
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card title={<><SettingOutlined /> Cấu hình đặt lịch</>}>
              <Form
                layout="vertical"
                form={form}
                onFinish={handleSubmit}
                initialValues={{
                  managerId: "30e38154-5e12-4741-a651-edf6c8d3137e",
                  dealerId: "5d2d9373-e393-468f-8334-0b31956bed9a",
                  openTime: dayjs("08:00:00", "HH:mm:ss"),
                  closeTime: dayjs("17:00:00", "HH:mm:ss"),
                  minIntervalBetweenAppointments: 30,
                  allowOverlappingAppointments: true,
                  maxConcurrentAppointments: 1,
                }}
              >
                <Form.Item
                  name="managerId"
                  label="Mã người quản lý (managerId)"
                  rules={[{ required: true, message: "Vui lòng nhập managerId" }]}
                >
                  <Input placeholder="Nhập ID người quản lý" />
                </Form.Item>

                <Form.Item
                  name="dealerId"
                  label="Mã đại lý (dealerId)"
                  rules={[{ required: true, message: "Vui lòng nhập dealerId" }]}
                >
                  <Input placeholder="Nhập ID đại lý" />
                </Form.Item>

                <Form.Item
                  name="openTime"
                  label="Giờ mở cửa"
                  rules={[{ required: true, message: "Vui lòng chọn giờ mở cửa" }]}
                >
                  <TimePicker format="HH:mm" style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                  name="closeTime"
                  label="Giờ đóng cửa"
                  rules={[{ required: true, message: "Vui lòng chọn giờ đóng cửa" }]}
                >
                  <TimePicker format="HH:mm" style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                  name="minIntervalBetweenAppointments"
                  label="Khoảng cách giữa các lịch hẹn (phút)"
                >
                  <InputNumber min={15} step={5} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                  name="allowOverlappingAppointments"
                  label="Cho phép chồng lịch"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="maxConcurrentAppointments"
                  label="Số lượng lịch hẹn đồng thời tối đa"
                >
                  <InputNumber min={1} max={10} style={{ width: "100%" }} />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  size="large"
                  loading={loading}
                >
                  Lưu cài đặt
                </Button>
              </Form>
            </Card>
          </Col>

          {/* ✅ Hiển thị phản hồi từ API */}
          <Col xs={24} lg={10}>
            {apiResponse ? (
              <Card title="📦 Kết quả từ API">
                <Alert
                  message={apiResponse.message}
                  type={apiResponse.isSuccess ? "success" : "error"}
                  showIcon
                />
                <Divider />
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                  <Text strong>Status Code:</Text>
                  <Text code>{apiResponse.statusCode}</Text>

                  <Text strong>ID:</Text>
                  <Text code>{apiResponse.result.id}</Text>

                  <Text strong>Manager ID:</Text>
                  <Text code>{apiResponse.result.managerId}</Text>

                  <Text strong>Dealer ID:</Text>
                  <Text code>{apiResponse.result.dealerId}</Text>

                  <Divider />

                  <Text strong>Giờ mở cửa:</Text>
                  <Text>{apiResponse.result.openTime}</Text>

                  <Text strong>Giờ đóng cửa:</Text>
                  <Text>{apiResponse.result.closeTime}</Text>

                  <Text strong>Khoảng cách lịch hẹn:</Text>
                  <Text>{apiResponse.result.minIntervalBetweenAppointments} phút</Text>

                  <Text strong>Cho phép chồng lịch:</Text>
                  <Text>
                    {apiResponse.result.allowOverlappingAppointments ? "Có" : "Không"}
                  </Text>

                  <Text strong>Số lượng lịch đồng thời:</Text>
                  <Text>{apiResponse.result.maxConcurrentAppointments}</Text>

                  <Divider />

                  <Text type="secondary">
                    Ngày tạo:{" "}
                    {dayjs(apiResponse.result.createdAt).format(
                      "YYYY-MM-DD HH:mm:ss"
                    )}
                  </Text>
                </Space>
              </Card>
            ) : (
              <Card>
                <Alert
                  message="Chưa có dữ liệu API — Hãy nhập và lưu cài đặt để xem phản hồi."
                  type="info"
                  showIcon
                />
              </Card>
            )}
          </Col>
        </Row>
      </PageContainer>
    </DealerManagerLayout>
  );
}

export default ScheduleTestDrive;
