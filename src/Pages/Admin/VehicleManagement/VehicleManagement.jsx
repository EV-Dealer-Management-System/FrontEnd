import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, message, Statistic, Space } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import {
  CarOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  BuildOutlined,
  BgColorsOutlined,
  PlusOutlined,
  ReloadOutlined,
  DashboardFilled,
} from "@ant-design/icons";
import NavigationBar from "../../../Components/Admin/Components/NavigationBar";
import ManageModel from "./Components/ModelManagement";
import ManageVersion from "./Components/VersionManagement";
import ColorManagement from "./Components/ColorManagementSimple";
import CreateElectricVehicle from "./Components/CreateElectricVehicle";
import { vehicleApi } from "../../../App/EVMAdmin/VehiclesManagement/Vehicles";

const NAVS = [
  { key: "overview", label: "Tổng quan", icon: <DashboardFilled /> },
  { key: "create", label: "Tạo xe điện", icon: <PlusOutlined /> },
  { key: "models", label: "Quản lý Model", icon: <CarOutlined /> },
  { key: "versions", label: "Quản lý Version", icon: <BuildOutlined /> },
  { key: "colors", label: "Quản lý Màu sắc", icon: <BgColorsOutlined /> },
];

function VehicleManagement() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("overview");
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const result = await vehicleApi.getAllVehicles();
      if (result?.success && Array.isArray(result.data)) {
        setVehicles(result.data);
      } else {
        message.warning("Không thể tải danh sách xe.");
        setVehicles([]);
      }
    } catch (error) {
      console.error("❌ Error loading vehicles:", error);
      message.error("Lỗi khi tải danh sách xe.");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const totalVehicles = vehicles?.length || 0;
  const activeVehicles = vehicles?.filter((v) => v.status === 1)?.length || 0;
  const inactiveVehicles = vehicles?.filter((v) => v.status !== 1)?.length || 0;

  const Overview = () => (
    <>
      <Card
        style={{
          background: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
          border: "none",
          borderRadius: 12,
          color: "white",
          textAlign: "center",
          marginBottom: 12,
        }}
        bodyStyle={{ padding: 14 }}
      >
        <h2 style={{ color: "white", fontSize: 20, marginBottom: 4 }}>
          ⚡ TỔNG QUAN HỆ THỐNG XE ĐIỆN
        </h2>
        <p style={{ color: "rgba(255,255,255,0.75)", marginBottom: 0 }}>
          Cập nhật ngày {new Date().toLocaleDateString("vi-VN")}
        </p>
      </Card>

      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 12 }}>
            <Space align="center">
              <CarOutlined style={{ color: "#1890ff", fontSize: 20 }} />
              <Statistic title="Tổng số xe" value={totalVehicles} />
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 12 }}>
            <Space align="center">
              <ThunderboltOutlined style={{ color: "#52c41a", fontSize: 20 }} />
              <Statistic title="Xe hoạt động" value={activeVehicles} />
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 12 }}>
            <Space align="center">
              <DashboardOutlined style={{ color: "#faad14", fontSize: 20 }} />
              <Statistic title="Xe ngừng hoạt động" value={inactiveVehicles} />
            </Space>
          </Card>
        </Col>
      </Row>

      <div style={{ textAlign: "center", marginTop: 10 }}>
        <Button
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={loadVehicles}
        >
          Tải lại
        </Button>
      </div>
    </>
  );

  const renderBody = () => {
    switch (active) {
      case "overview":
        return <Overview />;
      case "create":
        return <CreateElectricVehicle />;
      case "models":
        return <ManageModel />;
      case "versions":
        return <ManageVersion />;
      case "colors":
        return <ColorManagement />;
      default:
        return <Overview />;
    }
  };

  return (
    <div
      className="flex min-h-screen bg-gray-50"
      style={{ overflowX: "hidden" }} // chặn overflow ngang toàn trang
    >
      <NavigationBar collapsed={collapsed} onCollapse={setCollapsed} />

      <div
        className="flex-1 transition-all duration-200"
        style={{
          marginLeft: collapsed ? 64 : 280,
          minHeight: "100vh",
          overflowX: "hidden", // chặn overflow ngang vùng content
        }}
      >
        <PageContainer
          ghost
          header={{
            title: "Quản lý xe điện",
            subTitle: "Tổng quan, tạo xe, quản lý model/version/màu sắc",
          }}
          // giảm padding trái/phải để có thêm không gian cho nút
          contentStyle={{ paddingInline: 8, paddingBlock: 8 }}
        >
          {/* wrapper full-width, không maxWidth để tránh “bờ vai” 2 bên */}
          <div style={{ width: "100%" }}>
            {/* NAV PILL – wrap, padding nhỏ, không ép minWidth */}
            <Card
              style={{ borderRadius: 12, marginBottom: 10 }}
              bodyStyle={{ padding: 8 }}
            >
              <Space size={[8, 8]} wrap>
                {NAVS.map((item) => {
                  const isActive = active === item.key;
                  return (
                    <Button
                      key={item.key}
                      type={isActive ? "primary" : "default"}
                      shape="round"
                      size="middle"
                      icon={item.icon}
                      onClick={() => setActive(item.key)}
                      style={{
                        fontWeight: isActive ? 600 : 500,
                        boxShadow: isActive
                          ? "0 4px 12px rgba(24,144,255,0.25)"
                          : "none",
                        borderColor: isActive ? "#1677ff" : undefined,
                        paddingInline: 14, // nhỏ gọn
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Space>
            </Card>

            {/* BODY */}
            <div style={{ overflowX: "hidden" }}>{renderBody()}</div>
          </div>
        </PageContainer>
      </div>
    </div>
  );
}

export default VehicleManagement;
