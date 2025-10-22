import React, { useState } from "react";
import { Button, Badge, Space, Typography, Tooltip, message } from "antd";
import { ProLayout, ProConfigProvider } from "@ant-design/pro-components";
import {
  LockOutlined,
  UserOutlined,
  UserAddOutlined,
  FileTextOutlined,
  DashboardOutlined,
  SettingOutlined,
  TeamOutlined,
  ShopOutlined,
  CarOutlined,
  BarChartOutlined,
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DatabaseOutlined,
  DeploymentUnitOutlined,
  SolutionOutlined,
  LineChartOutlined,
  GlobalOutlined,
  QuestionCircleOutlined,
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
    // Hiển thị thông báo logout thành công
    message.success("Đăng xuất thành công!");
    // Chuyển về trang login
    navigate("/");
  };

  // Menu items cho EVM Admin với Pro Layout structure
  const route = {
    path: "/admin",
    routes: [
      {
        path: "/admin/dashboard",
        name: "Tổng quan",
        icon: <DashboardOutlined />,
        component: "./Dashboard",
      },
      {
        path: "/admin/dealer",
        name: "Quản lý đại lý",
        icon: <ShopOutlined />,
        routes: [
          // {
          //   path: "/admin/dealer/create-account",
          //   name: "Tạo tài khoản đại lý",
          //   icon: <UserAddOutlined />,
          //   component: "./CreateAccount",
          // },
          {
            path: "/admin/dealer/list",
            name: "Danh sách đại lý",
            icon: <TeamOutlined />,
            component: "./DealerList",
          },
          // {
          //   path: '/admin/dealer/create-contract',
          //   name: 'Tạo hợp đồng đại lý',
          //   icon: <FileTextOutlined />,
          //   component: './CreateContract',
          // },
          {
            path: "/admin/dealer/contracts",
            name: "Hợp đồng đại lý",
            icon: <FileTextOutlined />,
            component: "./DealerContracts",
          },

          // {
          //   path: "/admin/dealer/promotions",
          //   name: "Quản lý khuyến Mãi ",
          //   icon: <LineChartOutlined />,
          //   component: "./DealerPerformance",
          // },
          {
            path: "/admin/booking-signing",
            name: "Hợp đồng đặt xe",
            icon: <FileTextOutlined />,
            component: "./BookingContract",
          }
        ],
      },
      {
        path: "/admin/vehicle",
        name: "Quản lý xe điện",
        icon: <CarOutlined />,
        routes: [
          {
            path: "/admin/vehicle-management",
            name: "Danh mục xe",
            icon: <DatabaseOutlined />,
            component: "./VehicleCatalog",
          },
          {
            path: "/admin/inventory-management",
            name: "Kho xe",
            icon: <DeploymentUnitOutlined />,
            component: "./InventoryManagement",
          },
          {
            path: "/admin/vehicle/allocation",
            name: "Phân bổ xe cho đại lý",
            icon: <GlobalOutlined />,
            component: "./VehicleAllocation",
          },
        ],
      },
      {
        path: "/admin/staff",
        name: "Quản lý nhân viên",
        icon: <TeamOutlined />,
        routes: [
          {
            path: "/admin/staff/evm-staff",
            name: "Danh sách nhân viên ",
            icon: <UserOutlined />,
            component: "./EVMStaffList",
          },
          {
            path: "/admin/staff/create-evm-staff",
            name: "Tạo tài khoản nhân viên",
            icon: <UserAddOutlined />,
            component: "./CreateEVMStaff",
          },
        ],
      },
      {
        path: "/admin/promotions",
        name: "Quản lý khuyến mãi",
        icon: <ShopOutlined />,
        routes: [
          {
            path: "/admin/promotions/all-promotions",
            name: "Danh sách khuyến mãi",
            icon: <TeamOutlined />,
            component: "./PromotionList",
          },
          {
            path: "/admin/promotions/create-promotion",
            name: "Tạo khuyến mãi",
            icon: <FileTextOutlined />,
            component: "./CreatePromotion",
          },

          // {
          //   path: "/admin/dealer/promotions",
          //   name: "Quản lý khuyến Mãi ",
          //   icon: <LineChartOutlined />,
          //   component: "./DealerPerformance",
          // },
        ],
      },
      {
        path: "/admin/reports",
        name: "Báo cáo & Phân tích",
        icon: <BarChartOutlined />,
        routes: [
          {
            path: "/admin/reports/sales",
            name: "Báo cáo bán hàng",
            icon: <LineChartOutlined />,
            component: "./SalesReport",
          },
          {
            path: "/admin/reports/inventory",
            name: "Báo cáo tồn kho",
            icon: <DatabaseOutlined />,
            component: "./InventoryReport",
          },
          {
            path: "/admin/reports/forecast",
            name: "Dự báo AI",
            icon: <SolutionOutlined />,
            component: "./AIForecast",
          },
        ],
      },
      {
        path: "/admin/settings",
        name: "Cài đặt hệ thống",
        icon: <SettingOutlined />,
        component: "./Settings",
        routes: [
          {
            path: "/admin/settings/change-password",
            name: "Đổi mật khẩu",
            icon: <LockOutlined />,
            component: "./ChangePassword",
          },
          {
            path: "/admin/settings/user-management",
            name: "Quản lý người dùng",
            icon: <UserOutlined />,
            component: "./UserManagement",
          },
          {
            path: "/admin/settings/template-editor",
            name: "Sửa Hợp đồng",
            icon: <FileTextOutlined />,
            component: "./TemplateEditorPage",
          },
        ],
      },
      {
        path: "/",
        name: "Đăng Xuất",
        icon: <LogoutOutlined />,
        component: "./Settings",
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
              location.pathname === "/admin"
                ? "/admin/dashboard"
                : location.pathname,
          }}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          fixSiderbar
          siderWidth={280}
          collapsedWidth={64}
          logo={
            <div className="flex items-center gap-2">
              <CarOutlined className="text-2xl text-blue-500" />
              {!collapsed && (
                <Text strong className="text-lg text-gray-800">
                  EV Management System
                </Text>
              )}
            </div>
          }
          title="EV Dealer Management"
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
                  } else if (item.path === "/admin/dashboard") {
                    navigate("/admin");
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
              location.pathname === "/admin"
                ? "/admin/dashboard"
                : location.pathname,
            ],
            defaultOpenKeys: ["/admin/dealer"],
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
