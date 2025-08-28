import { useState, useEffect } from "react";
import { Input, Button, Card, Typography, Divider, message, Form, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import {
  GoogleOutlined,
  FacebookOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleRegister = (values) => {
    if (!values.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      form.setFields([{
        name: 'email',
        errors: ['Email không hợp lệ!']
      }]);
      return;
    }

    if (values.password !== values.confirmPassword) {
      form.setFields([{
        name: 'confirmPassword',
        errors: ['Mật khẩu xác nhận không khớp!']
      }]);
      return;
    }

    setLoading(true);
    // Simulating registration process
    setTimeout(() => {
      setLoading(false);
      message.success("Đăng ký thành công! Vui lòng xác thực email.");
      navigate('/mailconfirm'); // Chuyển hướng sang trang xác thực email
    }, 1500);
  };

  
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error("Vui lòng kiểm tra lại thông tin!");
  };
  
  // const handleSocialRegister = (type) => {
  //   message.info(`Đăng ký với ${type} đang được phát triển!`);
  // };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-6 sm:py-12">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]" />
        <div className="absolute left-20 bottom-40 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500 opacity-20 blur-[100px]" />
        <div className="absolute right-20 top-40 -z-10 h-[400px] w-[400px] rounded-full bg-purple-500 opacity-20 blur-[100px]" />
      </div>

      <Card
        className={`w-full max-w-md mx-4 bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl border-0 transform transition-all duration-500 ${
          animate ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-6 p-8">
          <div className="text-center">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-50 animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:rotate-12 transition-all duration-300 cursor-pointer">
                <UserOutlined className="text-3xl text-white" />
              </div>
            </div>
            <Title
              level={2}
              className="!m-0 !text-2xl !font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Tạo tài khoản mới
            </Title>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={handleRegister}
            onFinishFailed={onFinishFailed}
            className="space-y-4"
            initialValues={{ remember: true }}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input
                size="large"
                prefix={<UserOutlined className="text-gray-400 transition-colors group-hover:text-blue-500" />}
                placeholder="Tên đăng nhập"
                className="h-12 rounded-xl border-2 hover:border-blue-400 focus:border-blue-500 transition-all shadow-sm group-hover:shadow"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input
                size="large"
                prefix={<MailOutlined className="text-gray-400 transition-colors group-hover:text-blue-500" />}
                placeholder="Email"
                className="h-12 rounded-xl border-2 hover:border-blue-400 focus:border-blue-500 transition-all shadow-sm group-hover:shadow"
              />
            </Form.Item>

            <Form.Item
              name="phone"
            >
              <Input
                size="large"
                prefix={<PhoneOutlined className="text-gray-400 transition-colors group-hover:text-blue-500" />}
                placeholder="Số điện thoại (tùy chọn)"
                className="h-12 rounded-xl border-2 hover:border-blue-400 focus:border-blue-500 transition-all shadow-sm group-hover:shadow"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-gray-400 transition-colors group-hover:text-blue-500" />}
                placeholder="Mật khẩu"
                className="h-12 rounded-xl border-2 hover:border-blue-400 focus:border-blue-500 transition-all shadow-sm group-hover:shadow"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-gray-400 transition-colors group-hover:text-blue-500" />}
                placeholder="Xác nhận mật khẩu"
                className="h-12 rounded-xl border-2 hover:border-blue-400 focus:border-blue-500 transition-all shadow-sm group-hover:shadow"
              />
            </Form.Item>

            <Form.Item
              name="remember"
              valuePropName="checked"
            >
              <Checkbox>Ghi nhớ tài khoản</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                size="large"
                block
                htmlType="submit"
                loading={loading}
                className="h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-base font-semibold"
              >
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </Button>
            </Form.Item>
          </Form>

          <Divider className="!my-2">
            <span className="text-gray-400 text-sm px-4 bg-white">hoặc</span>
          </Divider>
{/* 
          <div className="space-y-4">
            <Button
              size="large"
              block
              icon={<GoogleOutlined />}
              onClick={() => handleSocialRegister("Google")}
              className="h-12 rounded-xl border-2 hover:border-blue-400 hover:text-blue-600 hover:scale-[1.02] transition-all duration-200 shadow-sm hover:shadow"
            >
              Đăng ký với Google
            </Button>
            <Button
              size="large"
              block
              icon={<FacebookOutlined />}
              onClick={() => handleSocialRegister("Facebook")}
              className="h-12 rounded-xl bg-[#1877f2] text-white border-0 hover:bg-[#166fe5] hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Đăng ký với Facebook
            </Button>
          </div> */}


          <div className="text-center text-gray-500 text-sm">
            Đã có tài khoản?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-semibold hover:opacity-80 transition-opacity"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default RegisterPage;
