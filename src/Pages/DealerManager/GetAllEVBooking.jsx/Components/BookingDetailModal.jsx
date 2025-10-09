import React, { useState, useEffect } from "react";
import {
  Modal,
  Descriptions,
  Button,
  Tag,
  Divider,
  Table,
  Card,
  Spin,
} from "antd";
import {
  CarOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { getEVModelById } from "../../../../App/DealerManager/EVBooking/Layouts/GetEVModelByID";
import { getEVVersionById } from "../../../../App/DealerManager/EVBooking/Layouts/GetEVVersionByID";
import { getEVColorById } from "../../../../App/DealerManager/EVBooking/Layouts/GetEVColorByID";

// Component modal chi tiết booking
function BookingDetailModal({
  visible,
  onClose,
  booking,
  loading,
  formatDateTime,
  getStatusTag,
}) {
  // State để lưu thông tin chi tiết đã fetch
  const [detailsData, setDetailsData] = useState([]);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Fetch thông tin chi tiết khi booking thay đổi
  useEffect(() => {
    const fetchDetailsInfo = async () => {
      if (
        !booking ||
        !booking.bookingEVDetails ||
        booking.bookingEVDetails.length === 0
      ) {
        setDetailsData([]);
        return;
      }

      setFetchingDetails(true);
      try {
        const detailsWithNames = await Promise.all(
          booking.bookingEVDetails.map(async (detail) => {
            try {
              // Fetch thông tin model, version, color song song
              const [modelData, versionData, colorData] = await Promise.all([
                detail.version?.modelId
                  ? getEVModelById(detail.version.modelId).catch(() => null)
                  : Promise.resolve(null),
                detail.version?.versionId
                  ? getEVVersionById(detail.version.versionId).catch(() => null)
                  : Promise.resolve(null),
                detail.colorId
                  ? getEVColorById(detail.colorId).catch(() => null)
                  : Promise.resolve(null),
              ]);

              return {
                ...detail,
                modelName:
                  modelData?.result?.modelName || modelData?.modelName || "N/A",
                versionName:
                  versionData?.result?.versionName ||
                  versionData?.versionName ||
                  "N/A",
                colorName:
                  colorData?.result?.colorName || colorData?.colorName || "N/A",
              };
            } catch (error) {
              console.error("Error fetching detail info:", error);
              return {
                ...detail,
                modelName: "N/A",
                versionName: "N/A",
                colorName: "N/A",
              };
            }
          })
        );

        setDetailsData(detailsWithNames);
      } catch (error) {
        console.error("Error fetching booking details info:", error);
        setDetailsData(booking.bookingEVDetails);
      } finally {
        setFetchingDetails(false);
      }
    };

    if (visible && booking) {
      fetchDetailsInfo();
    }
  }, [booking, visible]);

  // Cột cho bảng chi tiết xe
  const detailColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mẫu xe",
      dataIndex: "modelName",
      key: "modelName",
      width: 200,
      render: (text) => (
        <div className="text-sm font-medium text-gray-800">{text || "N/A"}</div>
      ),
    },
    {
      title: "Phiên bản",
      dataIndex: "versionName",
      key: "versionName",
      width: 200,
      render: (text) => (
        <div className="text-sm text-gray-700">{text || "N/A"}</div>
      ),
    },
    {
      title: "Màu sắc",
      dataIndex: "colorName",
      key: "colorName",
      width: 150,
      render: (text) => (
        <div className="text-sm text-gray-700">{text || "N/A"}</div>
      ),
    },
    {
      title: "Số Lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      render: (text) => (
        <Tag color="blue" className="font-semibold">
          {text || 0}
        </Tag>
      ),
    },
    {
      title: "Ngày Giao Dự Kiến",
      dataIndex: "expectedDeliveryDate",
      key: "expectedDeliveryDate",
      width: 160,
      render: (text) =>
        text ? (
          formatDateTime(text)
        ) : (
          <span className="text-gray-400">Chưa có</span>
        ),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center text-lg font-semibold">
          <CarOutlined className="mr-2 text-blue-500" />
          Chi Tiết Booking
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose} size="large">
          Đóng
        </Button>,
      ]}
      width={1400}
      centered
    >
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            tip="Đang tải chi tiết booking..."
            size="large"
          />
        </div>
      )}

      {/* Content when not loading */}
      {!loading && booking && (
        <>
          <Divider className="mt-2" />

          {/* Thông tin chung */}
          <Descriptions bordered column={2} size="middle" className="mt-4">
            <Descriptions.Item
              label={<span className="font-semibold">Mã Booking</span>}
              span={2}
            >
              <span className="text-blue-600 font-mono text-sm break-all">
                {booking.id || "N/A"}
              </span>
            </Descriptions.Item>

            <Descriptions.Item
              label={<span className="font-semibold">Dealer ID</span>}
            >
              <span className="text-gray-600 font-mono text-xs break-all">
                {booking.dealerId || "N/A"}
              </span>
            </Descriptions.Item>

            <Descriptions.Item
              label={<span className="font-semibold">Trạng Thái</span>}
            >
              {getStatusTag(booking.status)}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span className="font-semibold">
                  <CalendarOutlined className="mr-2" />
                  Ngày Đặt
                </span>
              }
            >
              <span className="text-base">
                {formatDateTime(booking.bookingDate)}
              </span>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span className="font-semibold">
                  <UserOutlined className="mr-2" />
                  Người Tạo
                </span>
              }
            >
              <span className="text-base">{booking.createdBy || "N/A"}</span>
            </Descriptions.Item>

            <Descriptions.Item
              label={<span className="font-semibold">Tổng Số Lượng</span>}
              span={2}
            >
              <Tag color="blue" className="text-base font-bold px-3 py-1">
                {booking.totalQuantity || 0} xe
              </Tag>
            </Descriptions.Item>

            {booking.note && (
              <Descriptions.Item
                label={
                  <span className="font-semibold">
                    <FileTextOutlined className="mr-2" />
                    Ghi Chú
                  </span>
                }
                span={2}
              >
                <div className="text-base text-gray-700 whitespace-pre-wrap">
                  {booking.note}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>

          {/* Chi tiết xe đặt */}
          {booking.bookingEVDetails && booking.bookingEVDetails.length > 0 && (
            <Card
              title={
                <span className="font-semibold text-base">
                  <InfoCircleOutlined className="mr-2 text-blue-500" />
                  Chi Tiết Xe Đặt ({booking.bookingEVDetails.length})
                </span>
              }
              className="mt-4 shadow-sm"
              bordered={false}
            >
              <Table
                columns={detailColumns}
                dataSource={detailsData}
                rowKey="id"
                pagination={false}
                scroll={{ x: 900 }}
                size="small"
                loading={fetchingDetails}
              />
            </Card>
          )}
        </>
      )}
    </Modal>
  );
}

export default BookingDetailModal;
