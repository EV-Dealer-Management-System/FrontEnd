import React from "react";
import { PageContainer } from "@ant-design/pro-components";
import { Card, Typography } from "antd";
import { CarOutlined } from "@ant-design/icons";
import NavigationBar from "../../../Components/Admin/Components/NavigationBar";
import CreateElectricVehicle from "./Components/CreateElectricVehicle";

const { Title } = Typography;

function VehicleManagementSimple() {
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
          <Card>
            <Title level={3}>Quản lý Thông tin Xe Điện</Title>
            <CreateElectricVehicle />
          </Card>
        </PageContainer>
      </div>
    </div>
  );
}

export default VehicleManagementSimple;
