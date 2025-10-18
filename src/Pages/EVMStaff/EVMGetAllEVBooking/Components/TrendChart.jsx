import React from "react";
import { ProCard } from "@ant-design/pro-components";
import { Tag } from "antd";
import { Column } from "@ant-design/charts";

function TrendChart({ data }) {
  return (
    <ProCard
      title="Xu Hướng 7 Ngày Gần Nhất"
      bordered
      headerBordered
      extra={<Tag color="green">Booking mới</Tag>}
    >
      <Column
        data={data}
        xField="date"
        yField="count"
        color="#1890ff"
        columnStyle={{
          radius: [8, 8, 0, 0],
        }}
        label={{
          position: "top",
          style: {
            fill: "#000",
            opacity: 0.6,
          },
        }}
        height={280}
      />
    </ProCard>
  );
}

export default TrendChart;
