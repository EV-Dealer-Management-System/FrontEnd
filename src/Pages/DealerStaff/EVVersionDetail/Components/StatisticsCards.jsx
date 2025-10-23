import React from "react";
import { Row, Col } from "antd";
import { StatisticCard } from "@ant-design/pro-components";

function StatisticsCards({
  totalVehicles,
  availableVehicles,
  activeVehicles,
  totalInventory,
}) {
  return (
    <Row gutter={[12, 12]} className="mb-4">
      <Col xs={12} sm={6}>
        <StatisticCard
          statistic={{
            title: "Tổng xe",
            value: totalVehicles,
            valueStyle: { fontSize: "20px", color: "#1890ff" },
          }}
          className="rounded-lg"
        />
      </Col>
      <Col xs={12} sm={6}>
        <StatisticCard
          statistic={{
            title: "Có sẵn",
            value: availableVehicles,
            valueStyle: { fontSize: "20px", color: "#52c41a" },
          }}
          className="rounded-lg"
        />
      </Col>
      <Col xs={12} sm={6}>
        <StatisticCard
          statistic={{
            title: "Kinh doanh",
            value: activeVehicles,
            valueStyle: { fontSize: "20px", color: "#722ed1" },
          }}
          className="rounded-lg"
        />
      </Col>
      <Col xs={12} sm={6}>
        <StatisticCard
          statistic={{
            title: "Tồn kho",
            value: totalInventory,
            suffix: "xe",
            valueStyle: { fontSize: "20px", color: "#fa8c16" },
          }}
          className="rounded-lg"
        />
      </Col>
    </Row>
  );
}

export default StatisticsCards;
