import React from "react";
import { ProCard } from "@ant-design/pro-components";
import { Tag } from "antd";
import { Pie } from "@ant-design/charts";

function StatusDistributionChart({ data, total }) {
    return (
        <ProCard
            title="Phân Bố Trạng Thái"
            bordered
            headerBordered
            extra={<Tag color="blue">Tổng: {total}</Tag>}
        >
            {data.length > 0 ? (
                <Pie
                    data={data}
                    angleField="value"
                    colorField="type"
                    radius={0.8}
                    innerRadius={0.6}
                    label={{
                        type: "inner",
                        offset: "-50%",
                        content: "{value}",
                        style: {
                            textAlign: "center",
                            fontSize: 14,
                            fill: "#fff",
                        },
                    }}
                    legend={{
                        position: "bottom",
                    }}
                    statistic={{
                        title: {
                            content: "Tổng",
                            style: { fontSize: 14 },
                        },
                        content: {
                            value: total,
                            style: { fontSize: 24 },
                        },
                    }}
                    height={280}
                />
            ) : (
                <div
                    style={{
                        height: 280,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#8c8c8c",
                    }}
                >
                    Chưa có dữ liệu
                </div>
            )}
        </ProCard>
    );
}

export default StatusDistributionChart;
