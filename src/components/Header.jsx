import React from "react";
import { Button } from "antd";
import { ProLayout } from "@ant-design/pro-components";
import { HomeOutlined, LoginOutlined, UserAddOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const menuRoutes = [
  { path: "/", name: "Trang chủ", icon: <HomeOutlined /> },
];

const Header = ({ children, title = "Hệ thống quản lý dịch vụ" }) => {
  const navigate = useNavigate();

  return (
    <div style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)", minHeight: "100vh" }}>
      <ProLayout
        title={title}
        route={{ routes: menuRoutes }}
        logo={() => (
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: "#1677ff",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 14,
          }}>SW</div>
        )}
        layout="top"
        fixedHeader
        actionsRender={() => [
          <Button key="login" onClick={() => navigate('/login')} icon={<LoginOutlined />}>Đăng nhập</Button>,
          <Button key="register" type="primary" onClick={() => navigate('/register')} icon={<UserAddOutlined />}>Đăng ký</Button>,
        ]}
        menuItemRender={(item, dom) => (
          <a onClick={() => item.path && navigate(item.path)}>{dom}</a>
        )}
        footerRender={() => (
          <div style={{ textAlign: "center", color: "#64748b", padding: "12px 0" }}>
            ©2024 Created by Your Company
          </div>
        )}
        token={{
          header: { colorTextMenu: "#0f172a" },
        }}
      >
        {children}
      </ProLayout>
    </div>
  );
};

export default Header; 