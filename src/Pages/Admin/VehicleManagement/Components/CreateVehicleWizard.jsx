import React from "react";
import { Card, Tabs } from "antd";
import {
  BgColorsOutlined,
  CarOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";

// Import các component quản lý riêng biệt
import ManageModel from "./ModelManagement";
import ManageVersion from "./VersionManagement";
import ManageColor from "./ColorManagementSimple";
import CreateElectricVehicle from "./CreateElectricVehicle";

function CreateVehicleWizard() {
  const items = [
    {
      key: "model",
      label: (
        <span>
          <CarOutlined />
          Quản lý Model
        </span>
      ),
      children: <ManageModel />,
    },
    {
      key: "version",
      label: (
        <span>
          <SettingOutlined />
          Quản lý Version
        </span>
      ),
      children: <ManageVersion />,
    },
    {
      key: "color",
      label: (
        <span>
          <BgColorsOutlined />
          Quản lý Màu sắc
        </span>
      ),
      children: <ManageColor />,
    },
    {
      key: "vehicle",
      label: (
        <span>
          <ThunderboltOutlined />
          Tạo Xe Điện
        </span>
      ),
      children: <CreateElectricVehicle />,
    },
  ];

  return (
    <PageContainer
      title="Quản lý Thông tin Xe Điện"
      subTitle="Quản lý Model, Version và Color của xe điện một cách độc lập"
    >
      <Card>
        <Tabs
          defaultActiveKey="model"
          size="large"
          items={items}
          tabPosition="top"
          animated={{ inkBar: true, tabPane: true }}
        />
      </Card>
    </PageContainer>
  );
}

export default CreateVehicleWizard;
