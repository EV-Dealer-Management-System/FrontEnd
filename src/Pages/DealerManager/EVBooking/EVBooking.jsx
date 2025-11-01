import React, { useRef, useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import {
  PageContainer,
  ProForm,
  ProFormTextArea,
  ProFormList,
} from "@ant-design/pro-components";
import { App, Card, Row, Col, Space } from "antd";
import { createEVBooking } from "../../../App/DealerManager/EVBooking/EVBooking";
import { EVBookingConfirmEContract } from "../../../App/DealerManager/EVBooking/EVBookingConfirm";
import DealerManagerLayout from "../../../Components/DealerManager/DealerManagerLayout";
import getAllEVModels from "../../../App/DealerManager/EVBooking/Layouts/GetAllEVModel";
import getAllEVVersionByModelID from "../../../App/DealerManager/EVBooking/Layouts/GetAllEVVersionByModelID";
import { getEVColorbyModelAndVersion } from "../../../App/DealerManager/EVBooking/Layouts/GetEVColorbyModelAndVersion";

import VehicleSelector from "./Components/VehicleSelector";
import BookingSummary from "./Components/BookingSummary";
import BookingItemCard from "./Components/BookingItemCard";
import { getEVAvailableQuantity } from "../../../App/DealerManager/EVBooking/Layouts/GetEVAvailableQuantity";

function EVBooking() {
  const { modal } = App.useApp();
  const formRef = useRef();
  const [models, setModels] = useState([]);
  const [versions, setVersions] = useState([]);
  const [colorsCache, setColorsCache] = useState({});
  const [bookingDetails, setBookingDetails] = useState([]);
  const [availableQuantities, setAvailableQuantities] = useState({}); // Lưu số lượng có sẵn theo key: modelId_versionId_colorId

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL}/notificationHub`, {
        accessTokenFactory: () => localStorage.getItem("jwt_token"),
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.on(
      "ReceiveElectricVehicleQuantityUpdate",
      (versionId, colorId, quantity) => {
        setAvailableQuantities((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((key) => {
            if (key.includes(versionId) && key.includes(colorId)) {
              updated[key] = quantity;
            }
          });
          return updated;
        });
      }
    );

    connection
      .start()
      .then(() => console.log("✅ Connected to SignalR hub"))
      .catch((err) => console.error("❌ Lỗi kết nối SignalR:", err));

    return () => {
      connection.stop();
    };
  }, []);

  // Lấy danh sách mẫu xe và phiên bản
  useEffect(() => {
    const fetchModelsAndVersions = async () => {
      try {
        // 1. Lấy danh sách models
        const modelData = await getAllEVModels();
        const mappedModels = modelData.result.map((model) => ({
          label: model.modelName,
          value: model.id,
        }));
        setModels(mappedModels);

        // 2. Lấy versions cho từng model
        const allVersions = [];
        for (const model of modelData.result) {
          try {
            const versionData = await getAllEVVersionByModelID(model.id);
            if (versionData && versionData.result) {
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
              allVersions.push(...mappedVersions);
            }
          } catch (error) {
            console.error(`Lỗi khi lấy versions cho model ${model.id}:`, error);
          }
        }
        setVersions(allVersions);
      } catch {
        modal.error({
          title: "Lỗi",
          content: "Không thể tải danh sách mẫu xe",
        });
      }
    };
    fetchModelsAndVersions();
  }, [modal]);

  // Xử lý khi thay đổi model
  const handleModelChange = (modelId, index) => {
    // Reset version và color khi thay đổi model
    formRef.current?.setFields([
      {
        name: ["bookingDetails", index, "versionId"],
        value: undefined,
      },
      {
        name: ["bookingDetails", index, "colorId"],
        value: undefined,
      },
    ]);
  };

  const handleVersionChange = async (versionId, modelId, index) => {
    try {

      formRef.current?.setFields([
        {
          name: ["bookingDetails", index, "colorId"],
          value: undefined,
        },
      ]);

      const cacheKey = `${modelId}_${versionId}`;

      if (!colorsCache[cacheKey]) {
        const colorData = await getEVColorbyModelAndVersion(modelId, versionId);

        if (colorData && colorData.result) {
          const mappedColors = colorData.result.map((color) => ({
            label: color.colorName,
            value: color.id,
            extraCost: color.extraCost,
          }));

          // Lưu vào cache
          setColorsCache((prev) => ({
            ...prev,
            [cacheKey]: mappedColors,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching colors:", error);
      modal.error({
        title: "Lỗi",
        content: "Không thể tải danh sách màu xe",
      });
    }
  };
  const handleColorChange = async (colorId, modelId, versionId) => {
    try {
      const quantityKey = `${modelId}_${versionId}_${colorId}`;

      if (!availableQuantities[quantityKey]) {
        const quantityData = await getEVAvailableQuantity(
          modelId,
          versionId,
          colorId
        );

        if (quantityData && quantityData.result !== undefined) {
          setAvailableQuantities((prev) => ({
            ...prev,
            [quantityKey]: quantityData.result,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching available quantity:", error);
      modal.error({
        title: "Lỗi",
        content: "Không thể tải số lượng xe có sẵn",
      });
    }
  };

  const handleSubmit = async (values) => {
    try {
      const bookingResponse = await createEVBooking(values.note, values.bookingDetails);

      const bookingId = bookingResponse?.data?.result?.id || bookingResponse?.result?.id;

      if (!bookingId) {

        throw new Error("Không thể lấy bookingId từ response");

      }
      try {
        await EVBookingConfirmEContract(bookingId);
        console.log("E-contract confirmed successfully for booking:", bookingId);
      } catch (confirmError) {
        console.error("Lỗi khi confirm e-contract:", confirmError); 
      }

      modal.success({
        title: "Đặt xe thành công!",
        content: "Đơn đặt xe của bạn đã được tạo thành công và e-contract đã được xác nhận. Vui lòng check mail để tiến hành kí hợp đồng",
        okText: "Đóng",
        onOk: () => {
          formRef.current?.resetFields();
          setBookingDetails([]);
        },
      });

      return true;
    } catch (error) {
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
                          colorsCache={colorsCache}
                          availableQuantities={availableQuantities}
                          onModelChange={handleModelChange}
                          onVersionChange={handleVersionChange}
                          onColorChange={handleColorChange}
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
                            colorsCache={colorsCache}
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
