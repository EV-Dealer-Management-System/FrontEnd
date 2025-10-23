import React from "react";
import { Spin, Typography } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import DealerStaffLayout from "../../../../Components/DealerStaff/DealerStaffLayout";

const { Text } = Typography;

function LoadingState() {
  return (
    <DealerStaffLayout>
      <PageContainer title="Danh Sách Xe Điện">
        <div className="flex flex-col justify-center items-center h-64">
          <Spin size="large" />
          <Text className="mt-4 text-gray-500">Đang tải thông tin xe...</Text>
        </div>
      </PageContainer>
    </DealerStaffLayout>
  );
}

export default LoadingState;
