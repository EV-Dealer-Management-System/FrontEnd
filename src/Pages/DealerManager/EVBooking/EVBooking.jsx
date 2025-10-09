import React, { useRef, useState, useEffect } from "react";
import {
  PageContainer,
  ProForm,
  ProFormTextArea,
  ProFormList,
} from "@ant-design/pro-components";
import { App, Card, Row, Col, Space } from "antd";
import { createEVBooking } from "../../../App/DealerManager/EVBooking/EVBooking";
import DealerManagerLayout from "../../../Components/DealerManager/DealerManagerLayout";
import getAllEVModels from "../../../App/DealerManager/EVBooking/layouts/getAllEVModel";
import getAllEVVersion from "../../../App/DealerManager/EVBooking/layouts/GetAllEVVersion";
import getAllEVColors from "../../../App/DealerManager/EVBooking/layouts/GetAllEVColor";
import VehicleSelector from "./Components/VehicleSelector";
import BookingSummary from "./Components/BookingSummary";
import BookingItemCard from "./Components/BookingItemCard";

function EVBooking() {
  const { modal } = App.useApp();
  const formRef = useRef();
  const [models, setModels] = useState([]);
  const [versions, setVersions] = useState([]);
  const [colors, setColors] = useState([]);
  const [bookingDetails, setBookingDetails] = useState([]);

  // Lấy danh sách mẫu xe
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const modelData = await getAllEVModels();
        const mappedModels = modelData.result.map((model) => ({
          label: model.modelName,
          value: model.id,
        }));
        setModels(mappedModels);
      } catch {
        modal.error({
          title: "Lỗi",
          content: "Không thể tải danh sách mẫu xe",
        });
      }
    };
    fetchModels();
  }, [modal]);

  // Lấy danh sách phiên bản xe
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const versionData = await getAllEVVersion();
        const mappedVersions = versionData.result.map((version) => ({
          label: version.versionName,
          value: version.id,
          modelId: version.modelId,
          // Thông tin chi tiết để hiển thị
          motorPower: version.motorPower,
          batteryCapacity: version.batteryCapacity,
          rangePerCharge: version.rangePerCharge,
          topSpeed: version.topSpeed,
          weight: version.weight,
          height: version.height,
          productionYear: version.productionYear,
          description: version.description,
          supplyStatus: version.supplyStatus,
        }));
        setVersions(mappedVersions);
      } catch {
        modal.error({
          title: "Lỗi",
          content: "Không thể tải danh sách phiên bản xe",
        });
      }
    };
    fetchVersions();
  }, [modal]);

  // Lấy danh sách màu xe
  useEffect(() => {
    const fetchColors = async () => {
      try {
        const colorData = await getAllEVColors();
        const mappedColors = colorData.result.map((color) => ({
          label: color.colorName,
          value: color.id,
          extraCost: color.extraCost,
        }));
        setColors(mappedColors);
      } catch {
        modal.error({
          title: "Lỗi",
          content: "Không thể tải danh sách màu xe",
        });
      }
    };
    fetchColors();
  }, [modal]);

  // Xử lý khi thay đổi model
  const handleModelChange = (modelId, index) => {
    // Reset version khi thay đổi model
    formRef.current?.setFields([
      {
        name: ["bookingDetails", index, "versionId"],
        value: undefined,
      },
    ]);
  };

  // Xử lý khi submit form
  const handleSubmit = async (values) => {
    try {
      // Gọi API tạo đơn đặt xe
      await createEVBooking(values.note, values.bookingDetails);

      // Hiển thị modal thành công
      modal.success({
        title: "Đặt xe thành công!",
        content: "Đơn đặt xe của bạn đã được tạo thành công.",
        okText: "Đóng",
        onOk: () => {
          // Reset form và bookingDetails khi đóng modal
          formRef.current?.resetFields();
          setBookingDetails([]);
        },
      });

      return true;
    } catch (error) {
      // Hiển thị modal lỗi
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
        subTitle="Tạo đơn đặt xe điện mới từ đại lý lên hãng"
      >
        <ProForm
          formRef={formRef}
          onFinish={handleSubmit}
          onValuesChange={(changedValues, allValues) => {
            // Cập nhật bookingDetails để hiển thị summary
            if (allValues.bookingDetails) {
              setBookingDetails(allValues.bookingDetails);
            }
          }}
          submitter={{
            searchConfig: {
              submitText: "Tạo đơn đặt xe",
              resetText: "Làm mới",
            },
            submitButtonProps: {
              size: "large",
            },
            resetButtonProps: {
              size: "large",
            },
          }}
        >
          <Row gutter={[24, 24]}>
            {/* Cột trái: Form nhập liệu */}
            <Col xs={24} lg={16}>
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                {/* Danh sách chi tiết đặt xe */}
                <Card
                  title={<strong>Chi tiết đặt xe</strong>}
                  bordered={false}
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                >
                  <ProFormList
                    name="bookingDetails"
                    creatorButtonProps={{
                      creatorButtonText: "+ Thêm xe",
                      type: "dashed",
                      size: "large",
                      block: true,
                    }}
                    min={1}
                    copyIconProps={false}
                    deleteIconProps={{
                      tooltipText: "Xóa",
                    }}
                    itemRender={({ action }, { index }) => (
                      <div style={{ position: "relative", marginBottom: 12 }}>
                        <VehicleSelector
                          models={models}
                          versions={versions}
                          colors={colors}
                          onModelChange={handleModelChange}
                          formRef={formRef}
                          index={index}
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            zIndex: 1,
                          }}
                        >
                          {action}
                        </div>
                      </div>
                    )}
                  >
                    {/* VehicleSelector sẽ được render qua itemRender */}
                  </ProFormList>
                </Card>

                {/* Ghi chú đơn hàng */}
                <Card
                  title={<strong>Thông tin chung</strong>}
                  bordered={false}
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                >
                  <ProFormTextArea
                    name="note"
                    label="Ghi chú đơn hàng"
                    placeholder="Nhập ghi chú, yêu cầu đặc biệt hoặc lưu ý cho đơn đặt xe..."
                    rules={[
                      { required: true, message: "Vui lòng nhập ghi chú" },
                    ]}
                    fieldProps={{
                      rows: 4,
                      showCount: true,
                      maxLength: 500,
                    }}
                  />
                </Card>
              </Space>
            </Col>

            {/* Cột phải: Tổng quan và preview */}
            <Col xs={24} lg={8}>
              <div
                style={{
                  position: "sticky",
                  top: 24,
                }}
              >
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  {/* Tổng quan đơn hàng */}
                  <BookingSummary bookingDetails={bookingDetails} />

                  {/* Danh sách xe đã chọn */}
                  {bookingDetails.length > 0 && (
                    <Card
                      title={<strong>Danh sách xe đã chọn</strong>}
                      bordered={false}
                      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                    >
                      <div style={{ maxHeight: 400, overflowY: "auto" }}>
                        {bookingDetails.map((item, index) => (
                          <BookingItemCard
                            key={index}
                            item={item}
                            models={models}
                            versions={versions}
                            colors={colors}
                          />
                        ))}
                      </div>
                    </Card>
                  )}
                </Space>
              </div>
            </Col>
          </Row>
        </ProForm>
      </PageContainer>
    </DealerManagerLayout>
  );
}

export default EVBooking;
