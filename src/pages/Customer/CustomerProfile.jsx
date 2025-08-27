import { useEffect, useState } from "react";
import { Button, Card, DatePicker, Form, Input, Descriptions } from "antd";
import dayjs from "dayjs";

function CustomerProfile() {
  const [profile, setProfile] = useState(null);
  const [form] = Form.useForm();
  const onChange = (date, dateString) => {
    console.log(date, dateString);
  };
  const DatePickerDemo = () => <DatePicker onChange={onChange} needConfirm />;

  useEffect(() => {
    const mockData = {
      name: "John Doe",
      date: "2004-05-15",
      email: "johndoe@gmail.com",
      phone: "0123456789",
      address: "123 Main St, City, Country",
    };
    setTimeout(() => {
      setProfile(mockData);
    }, 500);
  }, []);
  const [profileEdit, setProfileEdit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const format = "YYYY-MM-DD";
  const disableDate = (current) => {
    return (
      current &&
      (current < dayjs("1900-01-01") || current > dayjs().endOf("day"))
    );
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="card">
      <Card
        title="Thông tin cá nhân"
        style={{ maxWidth: 1000, margin: "auto" }}
      >
        {isEditing ? (
          <Form
            layout="vertical"
            initialValues={{
              ...profileEdit,
              date: profileEdit.date
                ? dayjs(profileEdit.date, "YYYY-MM-DD")
                : null,
            }}
            onFinish={(values) => {
              const formattedValues = {
                ...values,
                date: values.date ? values.date.format("YYYY-MM-DD") : "",
              };
              setProfile(formattedValues);
              setIsEditing(false);
              alert("Cập nhật thông tin thành công!");
            }}
          >
            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[
                {
                  required: true,
                  min: 3,
                  max: 50,
                  message: "Họ và Tên phải lớn hơn 3 ký tự và nhỏ hơn 50 ký tự",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Ngày Sinh"
              name="date"
              rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
            >
              <DatePicker format={format} disabledDate={disableDate} />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Sai định dạng email",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                {
                  required: true,
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Địa chỉ" name="address">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => setIsEditing(false)}
            >
              Hủy
            </Button>
          </Form>
        ) : (
          <>
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Họ và tên">
                {profile.name}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày Sinh">
                {profile.date}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {profile.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {profile.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {profile.address}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Button
                onClick={() => {
                  setProfileEdit(profile);
                  form.setFieldsValue({
                    ...profile,
                    date: profile.date
                      ? dayjs(profile.date, "YYYY-MM-DD")
                      : null,
                  });
                  setIsEditing(true);
                }}
              >
                Chỉnh sửa
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default CustomerProfile;
