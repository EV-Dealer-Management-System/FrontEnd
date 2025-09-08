<<<<<<< Updated upstream
import React, { useState } from "react";
import { Table, Card, Modal } from "antd";
=======
import React, { useState, useEffect } from "react";
import { Table, Card, Modal, Spin } from "antd";
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
  // ✅ State API
  const [totalCustomer, setTotalCustomer] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [errorCustomer, setErrorCustomer] = useState(null);

  // ✅ Gọi API khi load trang
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(
          "https://74fa78739c29.ngrok-free.app/api/DashBoard/total-customer",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
               "ngrok-skip-browser-warning": "true", 
            },
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        // 📥 Đọc raw text
        const text = await res.text();
        console.log("📥 Raw response:", text);

        // 🔧 Fix: parse chuỗi JSON thủ công
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("❌ Không parse được JSON: " + text.slice(0, 200));
        }

        console.log("✅ API data:", data);

        if (data.isSuccess) {
          setTotalCustomer(data.result); // 👉 lấy đúng giá trị "result"
          setErrorCustomer(null);
        } else {
          setErrorCustomer(data.message || "API trả về thất bại");
        }
      } catch (error) {
        console.error("🚨 Fetch error:", error.message);
        setErrorCustomer(error.message);
      } finally {
        setLoadingCustomer(false);
      }
    };

    fetchCustomer();
  }, []);

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    // Xử lý logout ở đây
    console.log("Đăng xuất thành công");
    // Thông thường sẽ chuyển hướng đến trang login hoặc xóa token
    setIsLogoutModalVisible(false);
  };

  const showLogoutConfirm = () => {
    setIsLogoutModalVisible(true);
  };

  const handleCancel = () => {
=======
    console.log("Đăng xuất thành công");
>>>>>>> Stashed changes
    setIsLogoutModalVisible(false);
  };

  const renderContent = () => {
    switch (selectedKey) {
      case "dashboard":
        return (
          <Card title="📊 Dashboard" style={{ width: "100%" }}>
            <p>Welcome to the Admin Dashboard!</p>
<<<<<<< Updated upstream
=======
            {loadingCustomer ? (
              <Spin tip="Đang tải số lượng khách hàng..." />
            ) : errorCustomer ? (
              <p style={{ color: "red" }}>❌ Lỗi: {errorCustomer}</p>
            ) : (
              <p>
                ✅ Tổng số khách hàng:{" "}
                <strong style={{ fontSize: "18px", color: "#2563eb" }}>
                  {totalCustomer}
                </strong>
              </p>
            )}
>>>>>>> Stashed changes
          </Card>
        );
      case "users":
        return (
<<<<<<< Updated upstream
          <Card title="👤 Users" style={{ width: "100%" }}>
=======
          <Card title="👤 Users">
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
          <Card title="🧑‍💼 Staff" style={{ width: "100%" }}>
=======
          <Card title="🧑‍💼 Staff">
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
          <Card title="📜 Logs" style={{ width: "100%" }}>
=======
          <Card title="📜 Logs">
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* Modal Logout */}
      <Modal
        title="Xác nhận đăng xuất"
        open={isLogoutModalVisible}
        onOk={handleLogout}
        onCancel={() => setIsLogoutModalVisible(false)}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
          flexShrink: 0,
          justifyContent: "space-between", // Để nút logout nằm ở cuối
=======
          justifyContent: "space-between",
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
          <nav style={{ padding: "8px", overflowY: "auto" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "4px",
=======
          <nav style={{ padding: "8px" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li
                style={{
                  padding: "10px 16px",
                  borderRadius: "6px",
>>>>>>> Stashed changes
                  cursor: "pointer",
                  backgroundColor:
                    selectedKey === "dashboard" ? "#2563eb" : "transparent",
                  marginBottom: "8px",
                }}
                onClick={() => setSelectedKey("dashboard")}
              >
<<<<<<< Updated upstream
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
=======
                <DashboardOutlined /> Dashboard
              </li>
              <li
                style={{
                  padding: "10px 16px",
                  borderRadius: "6px",
>>>>>>> Stashed changes
                  cursor: "pointer",
                  backgroundColor:
                    selectedKey === "users" ? "#2563eb" : "transparent",
                  marginBottom: "8px",
                }}
                onClick={() => setSelectedKey("users")}
              >
<<<<<<< Updated upstream
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
=======
                <UserOutlined /> Users
              </li>
              <li
                style={{
                  padding: "10px 16px",
                  borderRadius: "6px",
>>>>>>> Stashed changes
                  cursor: "pointer",
                  backgroundColor:
                    selectedKey === "staff" ? "#2563eb" : "transparent",
                  marginBottom: "8px",
                }}
                onClick={() => setSelectedKey("staff")}
              >
<<<<<<< Updated upstream
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
=======
                <TeamOutlined /> Staff
              </li>
              <li
                style={{
                  padding: "10px 16px",
                  borderRadius: "6px",
>>>>>>> Stashed changes
                  cursor: "pointer",
                  backgroundColor:
                    selectedKey === "logs" ? "#2563eb" : "transparent",
                  marginBottom: "8px",
                }}
                onClick={() => setSelectedKey("logs")}
              >
<<<<<<< Updated upstream
                <FileSearchOutlined />
                <span>Logs</span>
=======
                <FileSearchOutlined /> Logs
>>>>>>> Stashed changes
              </li>
            </ul>
          </nav>
        </div>

<<<<<<< Updated upstream
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
=======
        <div style={{ padding: "8px", borderTop: "1px solid #374151" }}>
          <div
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              color: "#ef4444",
            }}
            onClick={() => setIsLogoutModalVisible(true)}
          >
            <LogoutOutlined /> Đăng xuất
>>>>>>> Stashed changes
          </div>
        </div>
      </aside>

      {/* Main content */}
<<<<<<< Updated upstream
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Header */}
=======
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
        {/* Content */}
=======
>>>>>>> Stashed changes
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
