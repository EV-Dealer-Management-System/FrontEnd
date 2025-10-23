import React from "react";
import { Alert, Button } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import DealerStaffLayout from "../../../../Components/DealerStaff/DealerStaffLayout";

function ErrorState({ error, onRetry }) {
  return (
    <DealerStaffLayout>
      <PageContainer title="Danh Sách Xe Điện">
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={onRetry} type="primary" size="small">
              Thử lại
            </Button>
          }
        />
      </PageContainer>
    </DealerStaffLayout>
  );
}

export default ErrorState;
