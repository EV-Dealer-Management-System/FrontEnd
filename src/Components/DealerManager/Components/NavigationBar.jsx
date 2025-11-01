import React, { useState } from "react";
import { Button, Badge, Space, Typography, Tooltip, message } from "antd";
import { ProLayout, ProConfigProvider } from "@ant-design/pro-components";
import {
  UserAddOutlined,
  FileTextOutlined,
  DashboardOutlined,
  SettingOutlined,
  TeamOutlined,
  ShopOutlined,
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
  ShoppingCartOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  ScheduleOutlined,
  CommentOutlined // Icon feedback
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

  // Menu items cho Dealer Manager với Pro Layout structure
  const route = {
    path: "/dealer",
    routes: [
      {
        path: "/dealer-manager",
        name: "Tổng quan",
        icon: <DashboardOutlined />,
        component: "./Dashboard",
      },
      {
        path: "/dealer/sales",
        name: "Quản lý bán hàng",
        icon: <ShoppingCartOutlined />,
        routes: [
          {
            path: "/dealer/sales/orders",
            name: "Đơn hàng",
            icon: <FileTextOutlined />,
            component: "./Orders",
          },
          {
            path: "/dealer-manager/ev/all-ev-quotes",
            name: "Đơn báo giá xe",
            icon: <DollarOutlined />,
            component: "./EVQuotes",
          },
          // {
          //   path: "/dealer/sales/create-order",
          //   name: "Tạo đơn hàng mới",
          //   icon: <UserAddOutlined />,
          //   component: "./CreateOrder",
          // },
          // {
          //   path: "/dealer/sales/customers",
          //   name: "Quản lý khách hàng",
          //   icon: <TeamOutlined />,
          //   component: "./Customers",
          // },
        ],
      },
      {
        path: "/dealer/inventory",
        name: "Kho xe",
        icon: <ThunderboltOutlined />,
        routes: [
          {
            path: "/dealer-manager/ev/inventory",
            name: "Xe trong kho",
            icon: <DatabaseOutlined />,
            component: "./Inventory",
          },
          {
            path: "/dealer-manager/ev/ev-booking",
            name: "Yêu cầu nhập hàng",
            icon: <DeploymentUnitOutlined />,
            component: "./InventoryRequest",
          },
          {
            path: "/dealer-manager/ev/all-ev-booking",
            name: "Lịch sử đặt xe",
            icon: <GlobalOutlined />,
            component: "./InventoryHistory",
          },
        ],
      },
      {
        path: "/dealer-manager/staff",
        name: "Quản lý nhân viên",
        icon: <TeamOutlined />,
        routes: [
          {
            path: "/dealer-manager/staff/staff-list",
            name: "Danh sách nhân viên",
            icon: <TeamOutlined />,
            component: "./StaffList",
          },
          {
            path: "/dealer-manager/staff/create-dealer-staff-account",
            name: "Tạo tài khoản nhân viên",
            icon: <LineChartOutlined />,
            component: "./StaffPerformance",
          },
        ],
      },
      {
        path: "/dealer-manager/customers",
        name: "Quản lý khách hàng",
        icon: <TeamOutlined />,
        routes: [
          {
            path: "/dealer-manager/customers/get-all-customers",
            name: "Danh sách khách hàng",
            icon: <TeamOutlined />,
            component: "./CustomerList",
          },
          {
            path: "/dealer-manager/customers/create-customer",
            name: "Tạo khách hàng mới",
            icon: <LineChartOutlined />,
            component: "./StaffPerformance",
          },
        ],
      },
      {
        path: "/dealer/reports",
        name: "Báo cáo & Thống kê",
        icon: <BarChartOutlined />,
        routes: [
          {
            path: "/dealer/reports/sales",
            name: "Báo cáo bán hàng",
            icon: <LineChartOutlined />,
            component: "./SalesReport",
          },
          {
            path: "/dealer/reports/revenue",
            name: "Báo cáo doanh thu",
            icon: <DollarOutlined />,
            component: "./RevenueReport",
          },
          {
            path: "/dealer/reports/inventory",
            name: "Báo cáo tồn kho",
            icon: <DatabaseOutlined />,
            component: "./InventoryReport",
          },
        ],
      },
      {
        path: "/dealer/settings",
        name: "Cài đặt",
        icon: <SettingOutlined />,
        component: "./Settings",
        routes: [
          {
            path: "/dealer-manager/settings/change-password",
            name: "Đổi mật khẩu",
            icon: <SolutionOutlined />,
            component: "./ChangePassword",
          },
        ],
      },
      {
        path: "/dealer-manager/customer-feedback",
        name: "Feedback Customer",
        icon: <CommentOutlined />,
        routes: [
          {
            path: "/dealer-manager/customer-feedback/all",
            name: "Quản lý Feedback Customer",
            icon: <CommentOutlined />,
            component: "./ManageCusFeedback/UpdateStatusCustomerFeedback",
          },
        ],
      },
      {
        path: "/dealer-manager/appointment",
        name: "Quản Lý Lịch Lái Xe",
        icon: <ScheduleOutlined />,
        routes: [
          {
            path: "/dealer-manager/appointment",
            name: "Quản lý Khung giờ lịch",
            icon: <ScheduleOutlined />,
            component: "./AppointmentSetting/Appointment",
          },
        ],
      },
      {
        path: "/dealer-manager/staff-feedback",
        name: "Feedback DealerStaff",
        icon: <CommentOutlined />,
        routes: [
          {
            path: "/dealer-manager/staff-feedback/all",
            name: "Quản lý Feedback DealerStaff",
            icon: <CommentOutlined />,
            component: "./StaffFeedback/FeedbackDealerStaff",
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
              location.pathname === "/dealer"
                ? "/dealer/dashboard"
                : location.pathname,
          }}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          fixSiderbar
          siderWidth={280}
          collapsedWidth={64}
          logo={
            <div className="flex items-center gap-2">
              <ShopOutlined className="text-2xl text-blue-500" />
              {!collapsed && (
                <Text strong className="text-lg text-gray-800">
                  Quản lý Đại lý
                </Text>
              )}
            </div>
          }
          title="Dealer Manager"
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
                  } else if (item.path === "/dealer/dashboard") {
                    navigate("/dealer");
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
              location.pathname === "/dealer"
                ? "/dealer/dashboard"
                : location.pathname,
            ],
            defaultOpenKeys: ["/dealer/sales"],
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
