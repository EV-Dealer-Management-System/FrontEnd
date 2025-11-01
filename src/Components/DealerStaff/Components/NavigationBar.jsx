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
  PlusOutlined,
  ThunderboltOutlined,
  ScheduleOutlined
} from "@ant-design/icons";
import { CommentOutlined } from "@ant-design/icons";
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

  // Menu items cho Dealer Staff với Pro Layout structure
  const route = {
    path: "/dealer-staff",
    routes: [
      {
        path: "/dealer-staff",
        name: "Tổng quan",
        icon: <DashboardOutlined />,
        component: "./Dashboard",
      },
      {
        path: "/dealer-staff/quotes",
        name: "Báo giá",
        icon: <ShoppingCartOutlined />,
        routes: [
          {
            path: "/dealer-staff/quotes/create-quote",
            name: "Tạo báo giá",
            icon: <FileTextOutlined />,
            component: "./CreateQuote",
          },
          {
            path: "/dealer-staff/quotes/all-quotes",
            name: "Danh sách báo giá",
            icon: <PlusOutlined />,
            component: "./AllQuotes",
          },
        ],
      },
      {
        path: "/dealer-staff/customers",
        name: "Khách hàng",
        icon: <TeamOutlined />,
        routes: [
          {
            path: "/dealer-staff/customers/get-all-ev-customers",
            name: "Danh sách khách hàng",
            icon: <TeamOutlined />,
            component: "./GetAllEVCustomer",
          },
          {
            path: "/dealer-staff/customers/create-ev-customer",
            name: "Thêm khách hàng",
            icon: <UserAddOutlined />,
            component: "./AddCustomer",
          },
          {
            path: "/dealer-staff/customers/test-drive",
            name: "Lịch lái thử",
            icon: <ThunderboltOutlined />,
            component: "./TestDrive",
          },
        ],
      },
      {
        path: "/dealer-staff/ev",
        name: "Kho xe đại lý",
        icon: <ThunderboltOutlined />,
        routes: [
          {
            path: "/dealer-staff/ev/inventory",
            name: "Số lượng xe trong kho",
            icon: <DatabaseOutlined />,
            component: "./VehicleCatalog",
          },
          {
            path: "/dealer-staff/ev/version-details",
            name: "Mẫu xe và chi tiết",
            icon: <GlobalOutlined />,
            component: "./EVVersionDetails",
          },
        ],
      },
      {
        path: "/dealer-staff/schedule",
        name: "Quản lý Lịch hẹn",
        icon: <ScheduleOutlined />,
        routes: [
          {
            path: "/dealer-staff/schedule/test-drive",
            name: "Lịch hẹn lái thử",
            icon: <ScheduleOutlined />,
            component: "./ScheduleTestDrive",
          }
        ],
      },
      {
        path: "/dealer-staff/feedback",
        name: "Feedback",
        icon: <CommentOutlined />,
        routes: [
          {
            path: "/dealer-staff/feedback/all",
            name: "Customer Feedback",
            icon: <CommentOutlined />,
            component: "./FeedbackList",
          },
        ],
      },
      {
        path: "/dealer-staff/reports",
        name: "Báo cáo",
        icon: <BarChartOutlined />,
        routes: [
          {
            path: "/dealer-staff/reports/my-sales",
            name: "Doanh số của tôi",
            icon: <LineChartOutlined />,
            component: "./MySalesReport",
          },
          {
            path: "/dealer-staff/reports/commission",
            name: "Hoa hồng",
            icon: <DollarOutlined />,
            component: "./CommissionReport",
          },
        ],
      },
      {
        path: "/dealer-staff/settings",
        name: "Cài đặt",
        icon: <SettingOutlined />,
        component: "./Settings",
        routes: [
          {
            path: "/dealer-staff/settings/profile",
            name: "Thông tin cá nhân",
            icon: <SolutionOutlined />,
            component: "./Profile",
          },
          {
            path: "/dealer-staff/settings/change-password",
            name: "Đổi mật khẩu",
            icon: <SolutionOutlined />,
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
            pathname: location.pathname,
          }}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          fixSiderbar
          siderWidth={280}
          collapsedWidth={64}
          logo={
            <div className="flex items-center gap-2">
              <ShopOutlined className="text-2xl text-green-500" />
              {!collapsed && (
                <Text strong className="text-lg text-gray-800">
                  EV Dealer Staff Portal
                </Text>
              )}
            </div>
          }
          title="Dealer Staff"
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
            selectedKeys: [location.pathname],
            defaultOpenKeys: ["/dealer-staff/sales"],
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
