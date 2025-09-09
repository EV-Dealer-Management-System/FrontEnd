import React from "react";
import { Button, Avatar, Dropdown } from "antd";
import { ProLayout } from "@ant-design/pro-components";
import { HomeOutlined, LoginOutlined, UserAddOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const menuRoutes = [
  { path: "/", name: "Trang chủ", icon: <HomeOutlined /> },
];

const Header = ({ children, title = "Hệ thống quản lý dịch vụ" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Đồng bộ với ProtectedRoute: xác định trạng thái đăng nhập theo jwt_token
  const isLoggedIn = !!localStorage.getItem('jwt_token');

  const profileMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ cá nhân",
      onClick: () => navigate("/customer/profile")
    },
    {
      type: "divider"
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: () => {
        // Xóa JWT token khỏi localStorage
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('userFullName');
        // Chuyển về trang chủ
        navigate("/");
      }
    }
  ];

  const renderUserActions = () => {
    if (isLoggedIn) {
      // Đã đăng nhập: hiển thị menu người dùng
      const userFullName = localStorage.getItem('userFullName') || 'Người dùng';
      return [
        <Dropdown
          key="user-menu"
          menu={{ items: profileMenuItems }}
          placement="bottomRight"
          arrow
        >
          <Button type="text" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{userFullName}</span>
          </Button>
        </Dropdown>
      ];
    }
    // Chưa đăng nhập: hiển thị nút Login/Register
    return [
      <Button key="login" onClick={() => navigate('/login')} icon={<LoginOutlined />}>
        Đăng nhập
      </Button>,
      <Button key="register" type="primary" onClick={() => navigate('/register')} icon={<UserAddOutlined />}>
        Đăng ký
      </Button>
    ];
  };

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
        actionsRender={renderUserActions}
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