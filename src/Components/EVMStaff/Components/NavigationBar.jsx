import React, { useState } from "react";
import { Button, Badge, Space, Typography, Tooltip, message } from "antd";
import { ProLayout, ProConfigProvider } from "@ant-design/pro-components";
import {
  FileTextOutlined,
  DashboardOutlined,
  SettingOutlined,
  TeamOutlined,
  ShopOutlined,
  BarChartOutlined,
  LogoutOutlined,
  FileAddOutlined,
  FileSyncOutlined,
  FileProtectOutlined,
  BankOutlined,
  AuditOutlined,
  ContainerOutlined,
  ThunderboltOutlined,
  CarOutlined,
  PlusOutlined,
  EyeOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
const { Text } = Typography;

function NavigationBar({ collapsed: propCollapsed, onCollapse, isMobile }) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sử dụng collapsed từ props hoặc internal state
  const collapsed =
    propCollapsed !== undefined ? propCollapsed : internalCollapsed;
  const setCollapsed = onCollapse || setInternalCollapsed;

  // Hàm xử lý logout
  const handleLogout = () => {
    // Xóa JWT token khỏi localStorage
    localStorage.removeItem("jwt_token");
    // Xóa thông tin user nếu có
    localStorage.removeItem("user");
    localStorage.removeItem("userFullName");
    localStorage.removeItem("refresh_token");
    // Hiển thị thông báo logout thành công
    message.success("Đăng xuất thành công!");
    // Chuyển về trang login
    navigate("/");
  };

  // Menu items cho EVM Staff với Pro Layout structure
  const route = {
    path: "/evm-staff",
    routes: [
      {
        path: "/evm-staff/dashboard",
        name: "Tổng quan",
        icon: <DashboardOutlined />,
        component: "./Dashboard",
      },
      {
        path: "/evm-staff/vehicles",
        name: "Quản lý xe",
        icon: <CarOutlined />,
        routes: [
          {
            path: "/evm-staff/vehicles/template-overview",
            name: "Tổng quan Templates",
            icon: <EyeOutlined />,
            component: "./TemplateOverview",
          },
          {
            path: "/evm-staff/vehicles/create-vehicle",
            name: "Tạo xe",
            icon: <PlusOutlined />,
            component: "./CreateVehicle",
          },
        ],
      },
      {
        path: "/evm-staff/contracts",
        name: "Quản lý hợp đồng",
        icon: <FileTextOutlined />,
        routes: [
          {
            path: "/evm-staff/contracts/create-contract",
            name: "Tạo hợp đồng mới",
            icon: <FileAddOutlined />,
            component: "",
          },
          {
            path: "/evm-staff/contracts/view-all-dealer-contracts",
            name: "Quản lý hợp đồng Đại lý",
            icon: <FileTextOutlined />,
            component: "./GetAllContract",
          },
          // {
          //     path: "/evm-staff/contracts/edit",
          //     name: "Chỉnh sửa hợp đồng",
          //     icon: <FileSyncOutlined />,
          //     component: "./EditContract",
          // },
          // {
          //     path: "/evm-staff/contracts/verify",
          //     name: "Xác nhận hợp đồng",
          //     icon: <FileProtectOutlined />,
          //     component: "./VerifyContract",
          // },
          // {
          //     path: "/evm-staff/contracts/all",
          //     name: "Danh sách hợp đồng",
          //     icon: <ContainerOutlined />,
          //     component: "./ContractsList",
          // },
        ],
      },
      {
        path: "/evm-staff/dealers",
        name: "Quản lý đại lý",
        icon: <ShopOutlined />,
        routes: [
          {
            path: "/evm-staff/ev/get-all-ev-booking",
            name: "Danh sách Booking",
            icon: <BankOutlined />,
            component: "./DealersList",
          },
          {
            path: "/evm-staff/dealers/performance",
            name: "Hiệu suất đại lý",
            icon: <BarChartOutlined />,
            component: "./DealerPerformance",
          },
          // {
          //     path: "/evm-staff/dealers/audit",
          //     name: "Kiểm tra tuân thủ",
          //     icon: <AuditOutlined />,
          //     component: "./DealerAudit",
          // },
        ],
      },
      {
        path: "/evm-staff/dealer-feedback",
        name: "Dealer's Feedback",
        icon: <CommentOutlined />,
        routes: [
          {
            path: "/evm-staff/dealer-feedback/all",
            name: "Quản lý Dealer's Feedback",
            icon: <CommentOutlined />,
            component: "./StaffFeedbackManage/UpdateStatusStaffFeedback",
          },
        ],
      },
      {
        path: "/evm-staff/settings",
        name: "Cài đặt",
        icon: <SettingOutlined />,
        component: "./Settings",
        routes: [
          {
            path: "/evm-staff/settings/change-password",
            name: "Đổi mật khẩu",
            icon: <ThunderboltOutlined />,
            component: "./ChangePassword",
          },
        ],
      },
      {
        path: "/",
        name: "Đăng Xuất",
        icon: <LogoutOutlined />,
        component: "./Logout",
      },
    ],
  };

  return (
    <ProConfigProvider hashed={false}>
      <div
        style={{
          height: "100vh",
          width: collapsed ? 64 : 280,
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: isMobile ? 1000 : 100,
          transition: "all 0.2s ease",
          transform:
            isMobile && collapsed ? "translateX(-100%)" : "translateX(0)",
        }}
      >
        <ProLayout
          route={route}
          location={{
            pathname:
              location.pathname === "/evm-staff"
                ? "/evm-staff/dashboard"
                : location.pathname,
          }}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          fixSiderbar
          siderWidth={280}
          collapsedWidth={64}
          logo={
            <div className="flex items-center gap-2">
              <ThunderboltOutlined className="text-2xl text-blue-500" />
              {!collapsed && (
                <Text strong className="text-lg text-gray-800">
                  EVM Staff Portal
                </Text>
              )}
            </div>
          }
          title="EVM Staff"
          layout="side"
          navTheme="light"
          headerTheme="light"
          primaryColor="#1890ff"
          siderMenuType="sub"
          menuHeaderRender={(logo) => (
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">{logo}</div>
            </div>
          )}
          menuItemRender={(item, dom) => (
            <div
              onClick={() => {
                if (item.path) {
                  if (item.path === "/") {
                    // Xử lý logout
                    handleLogout();
                  } else if (item.path === "/evm-staff/dashboard") {
                    navigate("/evm-staff");
                  } else {
                    navigate(item.path);
                  }
                }
              }}
              className="cursor-pointer"
            >
              {dom}
            </div>
          )}
          rightContentRender={() => <div className="flex items-center"></div>}
          avatarProps={{
            size: "small",
            render: (props, dom) => dom,
          }}
          menuProps={{
            selectedKeys: [
              location.pathname === "/evm-staff"
                ? "/evm-staff/dashboard"
                : location.pathname,
            ],
            defaultOpenKeys: ["/evm-staff/contracts"],
          }}
          style={{
            backgroundColor: "#fff",
            boxShadow: "2px 0 8px 0 rgba(29,35,41,.05)",
          }}
        >
          {/* Content sẽ được render bởi parent component */}
        </ProLayout>
      </div>
    </ProConfigProvider>
  );
}

export default NavigationBar;
