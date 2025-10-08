import React, { useRef } from "react";
import {
  PageContainer,
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormList,
} from "@ant-design/pro-components";
import { App, Card } from "antd";
import { createEVBooking } from "../../../App/DealerManager/EVBooking/EVBooking";
import DealerManagerLayout from "../../../Components/DealerManager/DealerManagerLayout";

function EVBooking() {
  const { modal } = App.useApp();
  const formRef = useRef();

  // Xử lý khi submit form
  const handleSubmit = async (values) => {
    try {
      // Gọi API tạo đơn đặt xe
      await createEVBooking(
        values.dealerId,
        values.note,
        values.bookingDetails
      );

      console.log("✅ API call thành công, chuẩn bị hiển thị modal...");

      // Hiển thị modal popup với tích xanh
      modal.success({
        title: "Đặt xe thành công!",
        content: "Đơn đặt xe của bạn đã được tạo thành công.",
        okText: "Đóng",
        onOk: () => {
          // Reset form khi đóng modal
          formRef.current?.resetFields();
        },
      });

      console.log("✅ Modal.success() đã được gọi!");

      return true;
    } catch (error) {
      // Hiển thị modal lỗi với dấu X đỏ
      modal.error({
        title: "Đặt xe thất bại",
        content: error.response?.data?.message || error.message,
        okText: "Đóng",
      });
      return false;
    }
  };

  return (
    <DealerManagerLayout>
      <PageContainer
        title="Đặt xe từ nhà sản xuất"
        subTitle="Tạo đơn đặt xe điện mới"
      >
        <Card>
          <ProForm
            formRef={formRef}
            onFinish={handleSubmit}
            submitter={{
              searchConfig: {
                submitText: "Tạo đơn đặt xe",
                resetText: "Làm mới",
              },
            }}
          >
            {/* Thông tin đại lý */}
            <ProFormText
              name="dealerId"
              label="ID Đại lý"
              placeholder="Nhập ID đại lý (UUID)"
              rules={[{ required: true, message: "Vui lòng nhập ID đại lý" }]}
              tooltip="ID của đại lý được cấp bởi hệ thống"
            />

            {/* Ghi chú đơn hàng */}
            <ProFormTextArea
              name="note"
              label="Ghi chú"
              placeholder="Nhập ghi chú cho đơn đặt xe"
              rules={[{ required: true, message: "Vui lòng nhập ghi chú" }]}
            />

            {/* Danh sách chi tiết đặt xe */}
            <ProFormList
              name="bookingDetails"
              label="Chi tiết đặt xe"
              creatorButtonProps={{
                creatorButtonText: "Thêm xe",
              }}
              min={1}
              copyIconProps={false}
              deleteIconProps={{
                tooltipText: "Xóa",
              }}
            >
              <ProForm.Group>
                {/* ID phiên bản xe */}
                <ProFormText
                  name="versionId"
                  label="ID Phiên bản xe"
                  placeholder="Nhập ID phiên bản (UUID)"
                  width="md"
                  rules={[
                    { required: true, message: "Vui lòng nhập ID phiên bản" },
                  ]}
                  tooltip="ID phiên bản xe trong hệ thống"
                />

                {/* ID màu xe */}
                <ProFormText
                  name="colorId"
                  label="ID Màu xe"
                  placeholder="Nhập ID màu (UUID)"
                  width="md"
                  rules={[{ required: true, message: "Vui lòng nhập ID màu" }]}
                  tooltip="ID màu xe trong hệ thống"
                />

                {/* Số lượng */}
                <ProFormDigit
                  name="quantity"
                  label="Số lượng"
                  placeholder="Nhập số lượng"
                  width="sm"
                  min={1}
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượng" },
                  ]}
                  fieldProps={{
                    precision: 0,
                  }}
                />
              </ProForm.Group>
            </ProFormList>
          </ProForm>
        </Card>
      </PageContainer>
    </DealerManagerLayout>
  );
}

export default EVBooking;
