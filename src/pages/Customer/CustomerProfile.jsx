import { useEffect, useState } from "react";
import { Button, Card, DatePicker, Form, Input, Descriptions, Select, message } from "antd";
import dayjs from "dayjs";
import { PageContainer } from "@ant-design/pro-components";
import Navbar from "../../components/Navbar";
import { getProfile } from "../../app/User/Profile";

function CustomerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const onChange = (date, dateString) => {
    console.log(date, dateString);
  };
  const DatePickerDemo = () => <DatePicker onChange={onChange} needConfirm />;


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data.result);
      } catch (err) {
        console.log(err);
        message.error("Không tải được hồ sơ khách hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);
  /* useEffect(() => {
  //   const mockData = {
  //     name: "John Doe",
  //     date: "2004-05-15",
  //     email: "johndoe@gmail.com",
  //     phone: "0123456789",
  //     address: "123 Main St, City, Country",
  //   };
    setTimeout(() => {
      setProfile(mockData);
    }, 500);
  }, []); */
  const [profileEdit, setProfileEdit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const format = "YYYY-MM-DD";
  const disableDate = (current) => {
    return (
      current &&
      (current < dayjs("1900-01-01") || current > dayjs().endOf("day"))
    );
  };

  if (loading) return <div>Loading...</div>;
  if (!profile){
 

   return <div>Không tải được hồ sơ khách hàng</div>;
  }

  return (
    <Header title="Hồ sơ khách hàng">
      <PageContainer breadcrumb={false}>
        <div style={{
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 60%)",
          padding: "32px 16px",
          boxSizing: "border-box",
        }}>
          <div style={{ maxWidth: 1040, margin: "0 auto" }}>
            <h1
              style={{
                margin: 0,
                marginBottom: 16,
                fontSize: 28,
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: 0.2,
              }}
            >
              Thông tin khách hàng
            </h1>
            <p style={{ marginTop: 0, marginBottom: 16, color: "#475569" }}>
              Cập nhật và quản lý hồ sơ của bạn.
            </p>
            <Card
              title="Thông tin cá nhân"
              style={{
                borderRadius: 14,
                border: "1px solid #e5e7eb",
                boxShadow: "0 10px 20px -10px rgba(2,6,23,0.15)",
                maxWidth: 720,
                margin: "0 auto",
              }}
              headStyle={{
                borderBottom: "1px solid #f1f5f9",
                fontWeight: 600,
              }}
              bodyStyle={{ padding: 20 }}
            >
              {isEditing ? (
                <Form
                  layout="vertical"
                  style={{ maxWidth: 640, margin: "0 auto" }}
                  initialValues={{
                    ...profileEdit,
                    dateOfBirth: profileEdit.dateOfBirth
                      ? dayjs(profileEdit.dateOfBirth, "YYYY-MM-DD")
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
                    name="fullName"
                    rules={[
                      {
                        required: true,
                        min: 3,
                        max: 50,
                        message: "Họ và Tên phải lớn hơn 3 ký tự và nhỏ hơn 50 ký tự",
                      },
                    ]}
                  >
                    <Input.TextArea autoSize={{ minRows: 1, maxRows: 2 }} style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }} />
                  </Form.Item>
                  <Form.Item
                    label="Giới tính"
                    name="sex"
                    rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
                  >
                    <Select options={[{ label: "Nam", value: "Nam" }, { label: "Nữ", value: "Nữ" }]} />
                  </Form.Item>
                  <Form.Item
                    label="Ngày Sinh"
                    name="dateOfBirth"
                    style={{ textAlign: "left" }}
                    rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
                  >
                    <DatePicker format={format} disabledDate={disableDate} style={{ width: "100%" }} />
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
                    <Input.TextArea autoSize={{ minRows: 1, maxRows: 2 }} style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }} />
                  </Form.Item>
                  {/* <Form.Item
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
                    <Input.TextArea autoSize={{ minRows: 1, maxRows: 2 }} style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }} />
                  </Form.Item> */}
                  <Form.Item label="Địa chỉ" name="address">
                    <Input.TextArea rows={2} autoSize={{ minRows: 2, maxRows: 4 }} style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }} />
                  </Form.Item>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button type="primary" htmlType="submit">
                      Lưu
                    </Button>
                    <Button onClick={() => setIsEditing(false)}>Hủy</Button>
                  </div>
                </Form>
              ) : (
                <>
                  <Descriptions column={1} bordered size="middle">
                    <Descriptions.Item label="Họ và tên">
                      {profile.fullName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giới tính">
                      {profile.sex||"Chưa có giới tính"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày Sinh">
                      {profile.dateOfBirth||"Chưa có ngày sinh"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {profile.email}
                    </Descriptions.Item>
                    {/* <Descriptions.Item label="Số điện thoại">
                      {profile.phone}
                    </Descriptions.Item> */}
                    <Descriptions.Item label="Địa chỉ">
                      {profile.address||"Chưa có địa chỉ"}
                    </Descriptions.Item>
                  </Descriptions>
                  <div style={{ marginTop: 16, textAlign: "right" }}>
                    <Button
                      onClick={() => {
                        setProfileEdit(profile);
                        form.setFieldsValue({
                          ...profile,
                          dateOfBirth: profile.dateOfBirth
                            ? dayjs(profile.dateOfBirth, "YYYY-MM-DD")
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
        </div>
      </PageContainer>
    </Header>
  );
}

export default CustomerProfile;
