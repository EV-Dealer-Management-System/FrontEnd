import React from "react";
import { PageContainer } from "@ant-design/pro-components";
import { Card, Typography, Alert } from "antd";
import { CarOutlined } from "@ant-design/icons";
import NavigationBar from "../../../Components/Admin/Components/NavigationBar";
import CreateVehicleWizard from "./Components/CreateVehicleWizard";

const { Title } = Typography;

function VehicleManagementTest() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <NavigationBar />
      <div style={{ marginLeft: 280, flex: 1, padding: 24 }}>
        <PageContainer
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CarOutlined style={{ color: "#1890ff" }} />
              <span>Quản lý Xe Điện</span>
            </div>
          }
          subTitle="Hệ thống quản lý toàn diện cho xe điện - Model, Version, Color"
        >
          <Alert
            message="✅ Trang Vehicle Management đã hoạt động!"
            description="Route /admin/vehicle-management đã được thiết lập thành công. Bạn có thể quản lý Model, Version và Color của xe điện tại đây."
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card>
            <Title level={3}>Quản lý Thông tin Xe Điện</Title>
            <CreateVehicleWizard />
          </Card>
        </PageContainer>
      </div>
    </div>
  );
}

export default VehicleManagementTest;
