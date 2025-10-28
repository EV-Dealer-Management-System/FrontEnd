import React, { useState, useEffect } from "react";
import moment from "moment";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  message,
  Card,
  Typography,
  Spin,
  Image,
} from "antd";
import { PlusOutlined, ScheduleOutlined } from "@ant-design/icons";
import { CreateAppointment } from "../../../../App/DealerManager/ScheduleManagement/CreateAppointment";
import { GetAllCustomers } from "../../../../App/DealerManager/ScheduleManagement/GetAllCustomers";
import { GetAllTemplates } from "../../../../App/DealerManager/ScheduleManagement/GetAllTemplates";

const { Title, Text } = Typography;
const { Option } = Select;

const CreateAppointmentForm = ({ onAppointmentCreated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Fetch customers and templates on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setCustomerLoading(true);
        setTemplateLoading(true);

        const [customersResponse, templatesResponse] = await Promise.all([
          GetAllCustomers.getAllCustomers(),
          GetAllTemplates.getAllTemplates(),
        ]);

        if (customersResponse.isSuccess) {
          setCustomers(customersResponse.result || []);
        } else {
          message.error(
            customersResponse.message || "Không thể tải danh sách khách hàng"
          );
        }

        if (templatesResponse.isSuccess) {
          setTemplates(templatesResponse.result || []);
        } else {
          message.error(
            templatesResponse.message || "Không thể tải danh sách template"
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Đã xảy ra lỗi khi tải dữ liệu");
      } finally {
        setCustomerLoading(false);
        setTemplateLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTemplateChange = (templateId) => {
    const template = templates.find((t) => t.id === templateId);
    setSelectedTemplate(template);
  };

  // Hàm validate và điều chỉnh thời gian
  const validateAndAdjustTime = (momentTime) => {
    const openTime = moment().hours(8).minutes(0).seconds(0);
    const closeTime = moment().hours(17).minutes(0).seconds(0);

    // Nếu thời gian trước giờ mở cửa, điều chỉnh về giờ mở cửa
    if (momentTime.isBefore(openTime)) {
      return openTime;
    }

    // Nếu thời gian sau giờ đóng cửa, điều chỉnh về giờ đóng cửa
    if (momentTime.isAfter(closeTime)) {
      return closeTime;
    }

    return momentTime;
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Điều chỉnh thời gian
      const adjustedStartTime = validateAndAdjustTime(values.startTime);
      const adjustedEndTime = validateAndAdjustTime(values.endTime);

      // Format datetime to ISO 8601
      const formattedData = {
        customerId: values.customerId,
        evTemplateId: values.evTemplateId,
        startTime: adjustedStartTime.toISOString(),
        endTime: adjustedEndTime.toISOString(),
        note: values.note || null,
        status: values.status || 1,
      };

      console.log(
        "📤 Formatted Appointment Data:",
        JSON.stringify(formattedData, null, 2)
      );

      const response = await CreateAppointment.createAppointment(formattedData);

      if (response.isSuccess) {
        message.success("Tạo lịch hẹn thành công!");
        form.resetFields();
        setSelectedTemplate(null);

        // Callback để refresh danh sách nếu được truyền
        if (onAppointmentCreated) {
          onAppointmentCreated();
        }
      } else {
        message.error(response.message || "Không thể tạo lịch hẹn");
      }
    } catch (error) {
      console.error("❌ Error creating appointment:", error);

      // Xử lý chi tiết các loại lỗi
      if (error.response) {
        // Lỗi từ server
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          "Lỗi từ máy chủ";
        message.error(errorMessage);
      } else if (error.request) {
        // Lỗi kết nối
        message.error(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng."
        );
      } else {
        // Lỗi khác
        message.error(error.message || "Đã xảy ra lỗi không xác định");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        <Title level={4}>
          <ScheduleOutlined className="mr-2" />
          Tạo Lịch Hẹn Mới
        </Title>
      }
      extra={
        <Button type="link" icon={<PlusOutlined />}>
          Thêm
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: 1, // Mặc định trạng thái hoạt động
        }}
      >
        <Form.Item
          name="customerId"
          label="Khách Hàng"
          rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
        >
          <Select
            placeholder="Chọn khách hàng"
            showSearch
            loading={customerLoading}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            notFoundContent={customerLoading ? <Spin size="small" /> : null}
          >
            {customers.map((customer) => (
              <Option key={customer.id} value={customer.id}>
                {customer.fullName} - {customer.phoneNumber}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="evTemplateId"
          label="Template Xe"
          rules={[{ required: true, message: "Vui lòng chọn template xe" }]}
        >
          <Select
            placeholder="Chọn template xe"
            showSearch
            loading={templateLoading}
            onChange={handleTemplateChange}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            notFoundContent={templateLoading ? <Spin size="small" /> : null}
          >
            {templates.map((template) => (
              <Option key={template.id} value={template.id}>
                {template.version?.versionName} - {template.version?.modelName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedTemplate && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <Text strong className="block mb-2">
              Chi Tiết Template
            </Text>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Text type="secondary" className="block">
                  Phiên Bản:
                </Text>
                <Text strong>{selectedTemplate.version?.versionName}</Text>
              </div>
              <div>
                <Text type="secondary" className="block">
                  Mẫu Xe:
                </Text>
                <Text strong>{selectedTemplate.version?.modelName}</Text>
              </div>
              <div>
                <Text type="secondary" className="block">
                  Màu Sắc:
                </Text>
                <Text strong>{selectedTemplate.color?.colorName}</Text>
              </div>
              {selectedTemplate.imgUrl && (
                <div>
                  <Text type="secondary" className="block mb-1">
                    Hình Ảnh:
                  </Text>
                  <Image
                    src={selectedTemplate.imgUrl[0]}
                    width={100}
                    height={100}
                    className="object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <Form.Item
          name="startTime"
          label="Thời Gian Bắt Đầu"
          rules={[
            { required: true, message: "Vui lòng chọn thời gian bắt đầu" },
          ]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="Chọn thời gian bắt đầu"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          name="endTime"
          label="Thời Gian Kết Thúc"
          rules={[
            { required: true, message: "Vui lòng chọn thời gian kết thúc" },
          ]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="Chọn thời gian kết thúc"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item name="note" label="Ghi Chú">
          <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
        </Form.Item>

        <Form.Item name="status" label="Trạng Thái">
          <Select placeholder="Chọn trạng thái">
            <Option value={1}>
              <span className="mr-2"></span>Hoạt Động
            </Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<ScheduleOutlined />}
            loading={loading}
            block
          >
            Tạo Lịch Hẹn
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateAppointmentForm;
