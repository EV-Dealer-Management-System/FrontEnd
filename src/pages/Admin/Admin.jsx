import React, { useState } from "react";
import { Table, Card, Modal } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  FileSearchOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const Admin = () => {
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  // Dummy data
  const users = [
    { key: 1, name: "Duong Le", email: "duong@example.com" },
    { key: 2, name: "Ngoc Thach", email: "thach@example.com" },
    { key: 3, name: "Bao Ngoc", email: "ngoc@example.com" },
  ];

  const staff = [
    { key: 1, name: "Admin 1", role: "Manager" },
    { key: 2, name: "Admin 2", role: "Moderator" },
  ];

  const logs = [
    { key: 1, action: "User login", time: "2025-08-28 08:30" },
    { key: 2, action: "Staff created account", time: "2025-08-28 09:15" },
    { key: 3, action: "User updated profile", time: "2025-08-28 10:00" },
  ];

  const handleLogout = () => {
    // Xử lý logout ở đây
    console.log("Đăng xuất thành công");
    // Thông thường sẽ chuyển hướng đến trang login hoặc xóa token
    setIsLogoutModalVisible(false);
  };

  const showLogoutConfirm = () => {
    setIsLogoutModalVisible(true);
  };

  const handleCancel = () => {
    setIsLogoutModalVisible(false);
  };

  const renderContent = () => {
    switch (selectedKey) {
      case "dashboard":
        return (
          <Card title="📊 Dashboard" style={{ width: "100%" }}>
            <p>Welcome to the Admin Dashboard!</p>
          </Card>
        );
      case "users":
        return (
          <Card title="👤 Users" style={{ width: "100%" }}>
            <Table
              dataSource={users}
              columns={[
                { title: "Name", dataIndex: "name", key: "name" },
                { title: "Email", dataIndex: "email", key: "email" },
              ]}
              pagination={false}
            />
          </Card>
        );
      case "staff":
        return (
          <Card title="🧑‍💼 Staff" style={{ width: "100%" }}>
            <Table
              dataSource={staff}
              columns={[
                { title: "Name", dataIndex: "name", key: "name" },
                { title: "Role", dataIndex: "role", key: "role" },
              ]}
              pagination={false}
            />
          </Card>
        );
      case "logs":
        return (
          <Card title="📜 Logs" style={{ width: "100%" }}>
            <Table
              dataSource={logs}
              columns={[
                { title: "Action", dataIndex: "action", key: "action" },
                { title: "Time", dataIndex: "time", key: "time" },
              ]}
              pagination={false}
            />
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* CSS trực tiếp để đảm bảo hiển thị đúng */}
      <style>
        {`
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          }
        `}
      </style>

      {/* Modal xác nhận logout */}
      <Modal
        title="Xác nhận đăng xuất"
        visible={isLogoutModalVisible}
        onOk={handleLogout}
        onCancel={handleCancel}
        okText="Đăng xuất"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn đăng xuất không?</p>
      </Modal>

      {/* Sidebar */}
      <aside
        style={{
          width: "250px",
          backgroundColor: "#1f2937",
          color: "white",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          justifyContent: "space-between", // Để nút logout nằm ở cuối
        }}
      >
        <div>
          <div
            style={{
              height: "64px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: "bold",
              borderBottom: "1px solid #374151",
            }}
          >
            Admin Panel
          </div>
          <nav style={{ padding: "8px", overflowY: "auto" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  backgroundColor:
                    selectedKey === "dashboard" ? "#2563eb" : "transparent",
                  marginBottom: "8px",
                }}
                onClick={() => setSelectedKey("dashboard")}
              >
                <DashboardOutlined />
                <span>Dashboard</span>
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  backgroundColor:
                    selectedKey === "users" ? "#2563eb" : "transparent",
                  marginBottom: "8px",
                }}
                onClick={() => setSelectedKey("users")}
              >
                <UserOutlined />
                <span>Users</span>
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  backgroundColor:
                    selectedKey === "staff" ? "#2563eb" : "transparent",
                  marginBottom: "8px",
                }}
                onClick={() => setSelectedKey("staff")}
              >
                <TeamOutlined />
                <span>Staff</span>
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  backgroundColor:
                    selectedKey === "logs" ? "#2563eb" : "transparent",
                  marginBottom: "8px",
                }}
                onClick={() => setSelectedKey("logs")}
              >
                <FileSearchOutlined />
                <span>Logs</span>
              </li>
            </ul>
          </nav>
        </div>

        {/* Nút Logout */}
        <div style={{ padding: "8px", borderTop: "1px solid #374151" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              color: "#ef4444",
              marginBottom: "8px",
            }}
            onClick={showLogoutConfirm}
          >
            <LogoutOutlined />
            <span>Đăng xuất</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Header */}
        <header
          style={{
            height: "64px",
            backgroundColor: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          Admin Dashboard
        </header>

        {/* Content */}
        <main
          style={{
            flex: 1,
            backgroundColor: "#f3f4f6",
            padding: "24px",
            overflow: "auto",
          }}
        >
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Admin;
