import React, { useState, useEffect } from "react";
import { Layout, App } from "antd";
import NavigationBar from "./Components/NavigationBar";
import HeaderBar from "./Components/HeaderBar";

const { Content } = Layout;

function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <App>
      <div className="min-h-screen bg-gray-50">
        {/* HeaderBar full width - fixed toàn màn hình */}
        <HeaderBar collapsed={collapsed} isMobile={isMobile} />

        <NavigationBar
          collapsed={collapsed}
          onCollapse={setCollapsed}
          isMobile={isMobile}
        />

        {/* Content area - padding top cho header */}
        <div
          style={{
            marginLeft: isMobile ? 0 : collapsed ? 64 : 280,
            transition: "margin-left 0.2s ease",
            minHeight: "100vh",
            paddingTop: "56px", // Chiều cao header
          }}
          className={`${isMobile ? "pt-16" : ""}`}
        >
          <Content className="p-6">{children}</Content>
        </div>

        {/* Mobile overlay khi menu mở */}
        {isMobile && !collapsed && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
            onClick={() => setCollapsed(true)}
          />
        )}
      </div>
    </App>
  );
}

export default AdminLayout;
