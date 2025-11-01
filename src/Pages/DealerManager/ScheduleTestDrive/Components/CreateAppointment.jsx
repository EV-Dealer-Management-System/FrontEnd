import React, { useState, useEffect } from "react";
import moment from "moment";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Typography,
  Spin,
  Image,
  Row,
  Col,
  Card,
  Tag,
} from "antd";
import { ScheduleOutlined, ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { CreateAppointment } from "../../../../App/DealerManager/ScheduleManagement/CreateAppointment";
import { GetAllCustomers } from "../../../../App/DealerManager/ScheduleManagement/GetAllCustomers";
import { GetAllTemplates } from "../../../../App/DealerManager/ScheduleManagement/GetAllTemplates";
import { GetAvailableAppointments } from "../../../../App/DealerManager/ScheduleManagement/GetAvailableAppointments";
import { useToast } from "./ToastContainer";

const { Text } = Typography;
const { Option } = Select;

const CreateAppointmentForm = ({ onAppointmentCreated }) => {
  const toast = useToast();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

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

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    
    if (!date) {
      setAvailableSlots([]);
      return;
    }

    try {
      setSlotsLoading(true);
      
      // Format date theo yêu cầu của backend: 2025-10-30T00:00:00Z
      const formattedDate = date.format('YYYY-MM-DD') + 'T00:00:00Z';
      console.log('📅 Fetching slots for date:', formattedDate);
      
      const response = await GetAvailableAppointments.getAvailableAppointments(formattedDate);
      
      console.log('📥 Response:', response);
      
      if (response.isSuccess) {
        setAvailableSlots(response.result || []);
        console.log('✅ Available slots:', response.result);
      } else {
        toast.error(response.message || "Không thể tải khung giờ có sẵn");
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast.error("Đã xảy ra lỗi khi tải khung giờ");
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleSubmit = async (values) => {
    console.log("🚀 handleSubmit called with values:", values);
    
    try {
      setLoading(true);
      console.log("⏳ Loading state set to true");

            // Validate: Phải chọn ngày
            if (!selectedDate) {
              console.log("❌ Validation failed: No date selected");
              toast.error("Vui lòng chọn ngày hẹn!");
              setLoading(false);
              return;
            }

            // Validate: Phải chọn khung giờ
            if (!selectedSlot) {
              console.log("❌ Validation failed: No slot selected");
              toast.error("Vui lòng chọn khung giờ!");
              setLoading(false);
              return;
            }
      
      console.log("✅ Validation passed");

      // Tạo startTime và endTime từ selectedDate và selectedSlot
      const year = selectedDate.year();
      const month = selectedDate.month(); // 0-11
      const day = selectedDate.date();
      
      // Parse time từ slot (format: "HH:mm:ss")
      const startTimeParts = selectedSlot.openTime.split(':');
      const endTimeParts = selectedSlot.closeTime.split(':');
      
      // Tạo moment object với date và time cụ thể
      let startTime = moment({
        year: year,
        month: month,
        day: day,
        hour: parseInt(startTimeParts[0]),
        minute: parseInt(startTimeParts[1]),
        second: parseInt(startTimeParts[2] || 0)
      });
      
      let endTime = moment({
        year: year,
        month: month,
        day: day,
        hour: parseInt(endTimeParts[0]),
        minute: parseInt(endTimeParts[1]),
        second: parseInt(endTimeParts[2] || 0)
      });

      console.log("📅 Selected Date:", selectedDate.format("YYYY-MM-DD"));
      console.log("🕐 Selected Slot:", selectedSlot);
      console.log("⏰ Start Time:", startTime.format("YYYY-MM-DD HH:mm:ss"));
      console.log("⏰ End Time:", endTime.format("YYYY-MM-DD HH:mm:ss"));
      
      // Format thành ISO string với local timezone (YYYY-MM-DDTHH:mm:ss.sssZ)
      // Sử dụng format ISO để backend parse đúng
      const startTimeISO = startTime.format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
      const endTimeISO = endTime.format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
      
      console.log("🌍 Start Time (ISO):", startTimeISO);
      console.log("🌍 End Time (ISO):", endTimeISO);

      // Format datetime to ISO 8601
      const formattedData = {
        customerId: values.customerId,
        evTemplateId: values.evTemplateId,
        startTime: startTimeISO,
        endTime: endTimeISO,
        note: values.note || null,
        status: values.status || 1,
      };

      console.log(
        "📤 Formatted Appointment Data:",
        JSON.stringify(formattedData, null, 2)
      );

      console.log("🔄 Calling API...");
      const response = await CreateAppointment.createAppointment(formattedData);

      console.log("📥 Response received:", response);
      console.log("📥 Response.isSuccess:", response?.isSuccess);
      console.log("📥 Response.message:", response?.message);

      if (response && response.isSuccess) {
        console.log("✅ Success branch");
        const successMessage = response.message || "Đặt lịch hẹn thành công!";
        console.log("💬 Showing success message:", successMessage);
        
        toast.success(successMessage);
        
        form.resetFields();
        setSelectedTemplate(null);
        setSelectedDate(null);
        setSelectedSlot(null);
        setAvailableSlots([]);

        // Callback để refresh danh sách nếu được truyền
        if (onAppointmentCreated) {
          onAppointmentCreated();
        }
      } else {
        console.log("❌ Error branch - isSuccess is false");
        const errorMessage = response?.message || "Đặt lịch hẹn thất bại!";
        console.log("💬 Showing error message:", errorMessage);
        
        toast.error(`Đặt lịch thất bại: ${errorMessage}`);
      }
    } catch (error) {
      console.error("❌❌❌ EXCEPTION CAUGHT:", error);
      console.error("Error type:", typeof error);
      console.error("Error.response:", error.response);
      console.error("Error.request:", error.request);
      console.error("Error.message:", error.message);

      // Xử lý chi tiết các loại lỗi
      if (error.response) {
        console.log("🔴 Error response branch");
        // Lỗi từ server
        const errorData = error.response.data;
        const errorMessage =
          errorData?.message ||
          errorData?.error ||
          errorData?.title ||
          "Lỗi từ máy chủ";
        
        console.log("💬 Showing error message:", errorMessage);
        toast.error(`Đặt lịch thất bại: ${errorMessage}`);
        
        // Log chi tiết để debug
        console.error("Error response data:", errorData);
      } else if (error.request) {
        console.log("🔴 Error request branch");
        // Lỗi kết nối
        const errorMsg = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
        toast.error(`Đặt lịch thất bại: ${errorMsg}`);
      } else {
        console.log("🔴 Error other branch");
        // Lỗi khác
        const errorMessage = error.message || "Lỗi không xác định";
        toast.error(`Đặt lịch thất bại: ${errorMessage}`);
      }
    } finally {
      console.log("🏁 Finally block - setting loading to false");
      setLoading(false);
    }
  };

  return (
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
          label="Chọn Ngày Hẹn"
          required
        >
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày hẹn"
            style={{ width: "100%" }}
            disabledDate={(current) => {
              // Không cho chọn ngày trong quá khứ
              return current && current < moment().startOf('day');
            }}
          />
        </Form.Item>

        {selectedDate && (
          <Form.Item label="Chọn Khung Giờ" required>
            {slotsLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin tip="Đang tải khung giờ..." />
              </div>
            ) : availableSlots.length > 0 ? (
              <Row gutter={[8, 8]}>
                {availableSlots.map((slot, index) => (
                  <Col span={12} key={index}>
                    <Card
                      size="small"
                      hoverable={slot.isAvailable}
                      onClick={() => slot.isAvailable && handleSlotSelect(slot)}
                      style={{
                        cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                        border: selectedSlot === slot ? '2px solid #1890ff' : '1px solid #d9d9d9',
                        backgroundColor: !slot.isAvailable ? '#f5f5f5' : 
                                       selectedSlot === slot ? '#e6f7ff' : 'white',
                        opacity: slot.isAvailable ? 1 : 0.6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <ClockCircleOutlined style={{ marginRight: 8, fontSize: 16 }} />
                          <Text strong>
                            {slot.openTime?.substring(0, 5)} - {slot.closeTime?.substring(0, 5)}
                          </Text>
                        </div>
                        {slot.isAvailable ? (
                          selectedSlot === slot ? (
                            <CheckCircleOutlined style={{ color: '#1890ff', fontSize: 18 }} />
                          ) : (
                            <Tag color="green">Có sẵn</Tag>
                          )
                        ) : (
                          <Tag color="red">Đã đặt</Tag>
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                Không có khung giờ nào trong ngày này
              </div>
            )}
          </Form.Item>
        )}

        {selectedSlot && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <Text strong className="block mb-2">
              ✓ Đã Chọn Khung Giờ
            </Text>
            <Text>
              {selectedDate.format("DD/MM/YYYY")} từ {selectedSlot.openTime?.substring(0, 5)} đến {selectedSlot.closeTime?.substring(0, 5)}
            </Text>
          </div>
        )}

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
  );
};

export default CreateAppointmentForm;
