import React from "react";
import { Empty, Button } from "antd";
import { ProCard } from "@ant-design/pro-components";

function EmptyState({ onReload }) {
  return (
    <ProCard>
      <Empty description="Không có xe trong kho">
        <Button type="primary" onClick={onReload}>
          Tải lại
        </Button>
      </Empty>
    </ProCard>
  );
}

export default EmptyState;
