import React, { useRef, useState, useEffect } from "react";
import {
  PageContainer,
  ProForm,
  ProFormSelect,
  ProFormTextArea,
  ProFormDigit,
  ProFormList,
} from "@ant-design/pro-components";
import { App, Card } from "antd";
import { createEVBooking } from "../../../App/DealerManager/EVBooking/EVBooking";
import DealerManagerLayout from "../../../Components/DealerManager/DealerManagerLayout";
import getAllEVModels from "../../../App/DealerManager/EVBooking/layouts/getAllEVModel";
import getAllEVVersion from "../../../App/DealerManager/EVBooking/layouts/GetAllEVVersion";
import getAllEVColors from "../../../App/DealerManager/EVBooking/layouts/GetAllEVColor";

function EVBooking() {
  const { modal } = App.useApp();
  const formRef = useRef();
  const [models, setModels] = useState([]);
  const [versions, setVersions] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const modelData = await getAllEVModels();
        console.log("Received model data:", modelData);
        const mappedModels = modelData.result.map(model => ({
          label: model.modelName,
          value: model.id,
        }));
        console.log("Mapped models:", mappedModels);
        setModels(mappedModels);
      } catch (error) {
        console.error("Error fetching models:", error);
        modal.error({
          title: "Lỗi",
          content: "Không thể tải danh sách mẫu xe",
        });
      }
    };
    fetchModels();
  }, []);


  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const versionData = await getAllEVVersion();
        console.log("Received version data:", versionData);
        const mappedVersions = versionData.result.map(version => ({
          label: version.versionName,
          value: version.id,
          modelId: version.modelId
        }));
        console.log("Mapped versions:", mappedVersions);
        setVersions(mappedVersions);
      } catch (error) {
        console.error("Error fetching versions:", error);
        modal.error({
          title: "Lỗi",
          content: "Không thể tải danh sách phiên bản xe",
        });
      }
    };
    fetchVersions();
  }, []);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const colorData = await getAllEVColors();
        console.log("Received color data:", colorData);
        const mappedColors = colorData.result.map(color => ({
          label: color.colorName,
          value: color.id,
          extraCost: color.extraCost
        }));
        console.log("Mapped colors:", mappedColors);
        setColors(mappedColors);
      } catch (error) {
        console.error("Error fetching colors:", error);
        modal.error({
          title: "Lỗi",
          content: "Không thể tải danh sách màu xe",
        });
      }
    };
    fetchColors();
  }, []);

  // Xử lý khi submit form
  const handleSubmit = async (values) => {
    try {
      // Gọi API tạo đơn đặt xe
      await createEVBooking(
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
                {/* Model Selection */}
                <ProFormSelect
                  name="modelId"
                  label="Mẫu xe"
                  width="md"
                  options={models}
                  placeholder="Chọn mẫu xe"
                  rules={[{ required: true, message: "Vui lòng chọn mẫu xe" }]}
                  fieldProps={{
                    onChange: (modelId, option, info) => {
                      const currentIndex = info?.field?.slice(-1)[0];

                      // Cập nhật selectedModelId
                      setSelectedModelId(modelId);

                      // Reset version khi thay đổi model
                      formRef.current?.setFields([{
                        name: ['bookingDetails', currentIndex, 'versionId'],
                        value: undefined
                      }]);

                      // In ra thông tin debug
                      console.log("Selected modelId:", modelId);
                      const availableVersions = versions.filter(v => v.modelId === modelId);
                      console.log("Available versions for this model:", availableVersions);
                    }
                  }}
                />

                {/* Version Selection */}
                <ProFormSelect
                  name="versionId"
                  label="Phiên bản"
                  width="md"
                  options={versions.filter(v => {
                    const index = formRef.current?.getFieldValue('bookingDetails')?.findIndex((item, idx) =>
                      item.modelId === formRef.current?.getFieldValue(['bookingDetails', idx, 'modelId'])
                    );
                    const modelId = formRef.current?.getFieldValue(['bookingDetails', index, 'modelId']);
                    console.log("Filtering for modelId:", modelId);
                    return v.modelId === modelId;
                  })}
                  placeholder="Chọn phiên bản"
                  rules={[{ required: true, message: "Vui lòng chọn phiên bản" }]}
                  dependencies={['bookingDetails']}
                />

                {/* Color Selection */}
                <ProFormSelect
                  name="colorId"
                  label="Màu xe"
                  width="md"
                  options={colors}
                  placeholder="Chọn màu xe"
                  rules={[{ required: true, message: "Vui lòng chọn màu xe" }]}
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
