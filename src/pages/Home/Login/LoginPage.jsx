import { useState } from "react";
import { Input, Button, Card, Typography, Divider, message } from "antd";
import { login } from "../../../App/Home/Login/Login";
import {
  GoogleOutlined,
  FacebookOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
const { Title } = Typography;
function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      message.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    const response = await login(form.username, form.password);   
    console.log(response);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success(`Chào mừng ${form.username}! Đăng nhập thành công!`);
    }, 1500);
  };

  const handleSocialLogin = (type) => {
    message.info(`Đăng nhập với ${type} đang được phát triển!`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur shadow-xl rounded-xl border-0">
        <div className="flex flex-col gap-6 p-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
              <UserOutlined className="text-2xl text-white" />
            </div>
            <Title level={2} className="!m-0 !text-xl !font-bold">
              Chào mừng trở lại!
            </Title>
          </div>

          <div className="space-y-4">
            <Input
              name="username"
              size="large"
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Tên đăng nhập"
              value={form.username}
              onChange={handleChange}
              className="hover:border-blue-400 focus:border-blue-500"
            />
            <Input.Password
              name="password"
              size="large"
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
              className="hover:border-blue-400 focus:border-blue-500"
            />
            
            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              onClick={handleLogin}
              className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow hover:opacity-90"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </div>

          <Divider plain>hoặc</Divider>

          <div className="space-y-3">
            <Button
              size="large"
              block
              icon={<GoogleOutlined />}
              onClick={() => handleSocialLogin("Google")}
              className="border hover:border-blue-400 hover:text-blue-600"
            >
              Đăng nhập với Google
            </Button>
            <Button
              size="large"
              block
              icon={<FacebookOutlined />}
              onClick={() => handleSocialLogin("Facebook")}
              className="bg-[#1877f2] text-white border-0 hover:bg-[#166fe5]"
            >
              Đăng nhập với Facebook
            </Button>
          </div>

          <div className="text-center text-gray-500 text-sm">
            Chưa có tài khoản?{" "}
            <a
              href="/register"
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Đăng ký ngay
            </a>
            
          </div>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;
