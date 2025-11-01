import React, { useState, useEffect, useMemo } from "react";
import { PageContainer } from "@ant-design/pro-components";
import {
  message,
  Card,
  Form,
  Row,
  Col,
  Steps,
  Button,
  Divider,
  Typography,
  Space,
  Alert,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  CarOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import DealerStaffLayout from "../../../Components/DealerStaff/DealerStaffLayout";

// Import API functions
import { GetAllEVInventory } from "../../../App/DealerStaff/EVInventory/GetAllEVInventory";
import { GetAllPromotions } from "../../../App/DealerStaff/EVQuotesManagement/GetAllPromotion";
import { CreateEVQuotes } from "../../../App/DealerStaff/EVQuotesManagement/CreateEVQuotes";

// Import components
import VehicleSelection from "./Components/VehicleSelection.jsx";
import PromotionSelection from "./Components/PromotionSelection.jsx";
import QuoteDetails from "./Components/QuoteDetails.jsx";
import ConfirmationStep from "./Components/ConfirmationStep.jsx";
import SuccessModal from "./Components/SuccessModal.jsx";

const { Title, Text } = Typography;

function CreateEVQuote() {
  // State quản lý dữ liệu
  const [inventory, setInventory] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State cho form data - Đổi từ single vehicle sang danh sách nhiều xe
  const [vehicleList, setVehicleList] = useState([
    {
      id: Date.now(),
      modelId: null,
      versionId: null,
      colorId: null,
      quantity: 1,
      promotionId: null,
    },
  ]);
  const [note, setNote] = useState("");

  // State cho modal thành công
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdQuoteData, setCreatedQuoteData] = useState(null);

  // State cho steps
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  const navigate = useNavigate();

  // Fetch dữ liệu inventory khi component mount
  useEffect(() => {
    fetchInventory();
    fetchPromotions();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoadingInventory(true);
      const response = await GetAllEVInventory();

      if (response.isSuccess) {
        setInventory(response.result || []);
      } else {
        message.error(response.message || "Không thể tải danh sách xe điện");
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      message.error("Lỗi kết nối server. Vui lòng thử lại sau.");
    } finally {
      setLoadingInventory(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      setLoadingPromotions(true);
      const response = await GetAllPromotions();

      // API đã được cập nhật để trả về trực tiếp mảng promotions
      setPromotions(response || []);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      message.error("Lỗi kết nối server. Vui lòng thử lại sau.");
    } finally {
      setLoadingPromotions(false);
    }
  };

  // Tính toán thống kê dashboard
  const dashboardStats = useMemo(() => {
    const totalVehicles = inventory.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    const totalPromotions = promotions.length;

    // Tính tổng số lượng xe trong báo giá
    const totalQuoteQuantity = vehicleList.reduce(
      (sum, vehicle) => sum + (vehicle.quantity || 0),
      0
    );

    // Tính tổng giá trị (cần giá từ inventory)
    const currentQuoteValue = vehicleList.reduce((sum, vehicle) => {
      const inventoryItem = inventory.find(
        (item) =>
          item.versionId === vehicle.versionId &&
          item.colorId === vehicle.colorId
      );
      const price = inventoryItem?.price || 0;
      return sum + price * (vehicle.quantity || 0);
    }, 0);

    // Tính tổng discount
    let discountAmount = 0;
    vehicleList.forEach((vehicle) => {
      if (vehicle.promotionId) {
        const promotion = promotions.find((p) => p.id === vehicle.promotionId);
        if (promotion) {
          const inventoryItem = inventory.find(
            (item) =>
              item.versionId === vehicle.versionId &&
              item.colorId === vehicle.colorId
          );
          const price = inventoryItem?.price || 0;
          const itemTotal = price * (vehicle.quantity || 0);

          if (promotion.discountType === 0) {
            discountAmount += promotion.fixedAmount || 0;
          } else {
            discountAmount += ((promotion.percentage || 0) * itemTotal) / 100;
          }
        }
      }
    });

    const finalValue = currentQuoteValue - discountAmount;

    return {
      totalVehicles,
      totalPromotions,
      totalQuoteQuantity,
      currentQuoteValue,
      discountAmount,
      finalValue,
    };
  }, [inventory, promotions, vehicleList]);

  // Validation
  const validationErrors = useMemo(() => {
    const errors = [];

    // Kiểm tra có ít nhất 1 xe
    if (vehicleList.length === 0) {
      errors.push("Vui lòng thêm ít nhất 1 xe vào báo giá");
      return errors;
    }

    // Kiểm tra từng xe trong danh sách
    vehicleList.forEach((vehicle, index) => {
      if (!vehicle.versionId) {
        errors.push(`Xe #${index + 1}: Chưa chọn model và phiên bản`);
      }

      if (!vehicle.colorId) {
        errors.push(`Xe #${index + 1}: Chưa chọn màu sắc`);
      }

      if (!vehicle.quantity || vehicle.quantity < 1) {
        errors.push(`Xe #${index + 1}: Số lượng phải lớn hơn 0`);
      }

      // Kiểm tra số lượng có sẵn
      const inventoryItem = inventory.find(
        (item) =>
          item.versionId === vehicle.versionId &&
          item.colorId === vehicle.colorId
      );

      if (inventoryItem && vehicle.quantity > inventoryItem.quantity) {
        errors.push(
          `Xe #${index + 1}: Số lượng vượt quá tồn kho (${inventoryItem.quantity
          } xe)`
        );
      }
    });

    return errors;
  }, [vehicleList, inventory]);

  const canSubmit = validationErrors.length === 0;

  // Steps configuration
  const steps = [
    {
      title: "Chọn xe",
      icon: <CarOutlined />,
      description: "Chọn model và màu sắc xe điện",
    },
    {
      title: "Khuyến mãi",
      icon: <GiftOutlined />,
      description: "Áp dụng chương trình khuyến mãi",
    },
    {
      title: "Chi tiết",
      icon: <FileTextOutlined />,
      description: "Nhập số lượng và ghi chú",
    },
    {
      title: "Xác nhận",
      icon: <CheckCircleOutlined />,
      description: "Xem lại và tạo báo giá",
    },
  ];

  // Handlers
  const handleVehicleListChange = (newList) => {
    setVehicleList(newList);
  };

  const handlePromotionChange = (vehicleId, promotionId) => {
    setVehicleList(
      vehicleList.map((v) =>
        v.id === vehicleId ? { ...v, promotionId: promotionId } : v
      )
    );
  };

  const handleNoteChange = (value) => {
    setNote(value);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        // Bước 1: Kiểm tra có ít nhất 1 xe hợp lệ
        return vehicleList.some((v) => v.versionId && v.colorId && v.quantity > 0);
      case 1:
        return true; // Khuyến mãi là optional
      case 2:
        return true; // Ghi chú là optional
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      message.warning("Vui lòng hoàn thành tất cả thông tin bắt buộc");
      return;
    }

    try {
      setSubmitting(true);

      // Chuẩn bị dữ liệu gửi API - quoteDetails là mảng các xe
      const quoteData = {
        note: note || "",
        quoteDetails: vehicleList
          .filter((v) => v.versionId && v.colorId && v.quantity > 0)
          .map((vehicle) => ({
            versionId: vehicle.versionId,
            colorId: vehicle.colorId,
            promotionId: vehicle.promotionId || null,
            quantity: vehicle.quantity,
          })),
      };

      console.log("Sending quote data:", quoteData);

      const response = await CreateEVQuotes(quoteData);

      if (response && response.isSuccess) {
        console.log("Quote created successfully:", response.result);

        // Lấy dữ liệu từ response
        const quoteResult = response.result || {};
        const quoteDetails = quoteResult.quoteDetails || [];

        // Chuẩn bị dữ liệu cho modal hiển thị
        const successData = {
          quoteId: quoteResult.id,
          totalAmount: quoteResult.totalAmount || 0,
          totalVehicles: quoteDetails.length,
          totalQuantity: quoteDetails.reduce((sum, item) => sum + (item.quantity || 0), 0),
          totalPrice: quoteResult.totalAmount || 0, // Lấy từ totalAmount của quote
          note: quoteResult.note || "",
          createdAt: quoteResult.createdAt,
          quoteDetails: quoteDetails.map((detail) => ({
            vehicleName: detail.version
              ? `${detail.version.modelName} - ${detail.version.versionName}`
              : "N/A",
            colorName: detail.color?.colorName || "N/A",
            quantity: detail.quantity || 0,
            promotionName: detail.promotion?.promotionName || null,
            unitPrice: detail.unitPrice || 0,
            totalPrice: detail.totalPrice || 0,
          })),
        };

        console.log("Success data prepared:", successData);

        setCreatedQuoteData(successData);
        setShowSuccessModal(true);

        // Reset form
        handleReset();

        message.success("Tạo báo giá thành công!");
      } else {
        throw new Error(response?.message || "Tạo báo giá thất bại");
      }
    } catch (error) {
      console.error("Error creating quote:", error);

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message.error(`Lỗi: ${error.response.data.message}`);
      } else if (error.message) {
        message.error(`Lỗi: ${error.message}`);
      } else {
        message.error("Có lỗi xảy ra khi tạo báo giá. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setVehicleList([
      {
        id: Date.now(),
        modelId: null,
        versionId: null,
        colorId: null,
        quantity: 1,
        promotionId: null,
      },
    ]);
    setNote("");
    setCurrentStep(0);
    form.resetFields();
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setCreatedQuoteData(null);
  };

  const handleViewQuotes = () => {
    handleCloseSuccessModal();
    navigate("/dealer-staff/quotes/all-quotes");
  };

  const handleCreateNew = () => {
    handleCloseSuccessModal();
    handleReset();
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="border-0 shadow-sm">
            <VehicleSelection
              inventory={inventory}
              loadingInventory={loadingInventory}
              vehicleList={vehicleList}
              onVehicleListChange={handleVehicleListChange}
            />
          </Card>
        );
      case 1:
        return (
          <Card className="border-0 shadow-sm">
            <PromotionSelection
              promotions={promotions}
              loadingPromotions={loadingPromotions}
              vehicleList={vehicleList}
              onPromotionChange={handlePromotionChange}
              inventory={inventory}
            />
          </Card>
        );
      case 2:
        return (
          <Card className="border-0 shadow-sm">
            <QuoteDetails
              vehicleList={vehicleList}
              note={note}
              onNoteChange={handleNoteChange}
              inventory={inventory}
              promotions={promotions}
            />
          </Card>
        );
      case 3:
        return (
          <Card className="border-0 shadow-sm">
            <ConfirmationStep
              vehicleList={vehicleList}
              inventory={inventory}
              promotions={promotions}
              note={note}
              dashboardStats={dashboardStats}
              validationErrors={validationErrors}
            />
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <DealerStaffLayout>
      <PageContainer
        title={
          <Space>
            <FileTextOutlined className="text-blue-600" />
            <span>Tạo báo giá xe điện</span>
          </Space>
        }
        subTitle="Tạo báo giá mới cho khách hàng"
        extra={
          <Button
            onClick={() => navigate("/dealer-staff/quotes/all-quotes")}
            icon={<ArrowLeftOutlined />}
          >
            Quay lại danh sách
          </Button>
        }
        className="bg-gray-50 min-h-screen"
      >
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <Card className="mb-6 shadow-sm">
            <Steps current={currentStep} items={steps} className="mb-0" />
          </Card>

          <Row gutter={[24, 24]}>
            {/* Main Content */}
            <Col xs={24} xl={16}>
              {renderStepContent()}

              {/* Navigation Buttons */}
              <Card className="mt-4 border-0 shadow-sm">
                <div className="flex justify-between">
                  <Button
                    size="large"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    icon={<ArrowLeftOutlined />}
                  >
                    Quay lại
                  </Button>

                  <Space>
                    <Button
                      size="large"
                      onClick={handleReset}
                      disabled={submitting}
                    >
                      Làm mới
                    </Button>

                    {currentStep < steps.length - 1 ? (
                      <Button
                        type="primary"
                        size="large"
                        onClick={handleNext}
                        disabled={!canGoNext()}
                        icon={<ArrowRightOutlined />}
                      >
                        Tiếp tục
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        size="large"
                        onClick={handleSubmit}
                        loading={submitting}
                        disabled={!canSubmit}
                        icon={<CheckCircleOutlined />}
                      >
                        Tạo báo giá
                      </Button>
                    )}
                  </Space>
                </div>
              </Card>
            </Col>

            {/* Sidebar - Quick Stats & Summary */}
            <Col xs={24} xl={8}>
              <div className="sticky top-4 space-y-4">
                {/* Quick Stats */}
                <Card title="Thống kê nhanh" className="shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {dashboardStats.totalVehicles}
                      </div>
                      <div className="text-sm text-gray-600">Xe có sẵn</div>
                    </div>
                    <div className="text-center p-3 bg-pink-50 rounded-lg">
                      <div className="text-2xl font-bold text-pink-600">
                        {dashboardStats.totalPromotions}
                      </div>
                      <div className="text-sm text-gray-600">Khuyến mãi</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {dashboardStats.totalQuoteQuantity}
                      </div>
                      <div className="text-sm text-gray-600">Tổng số xe báo giá</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {vehicleList.filter((v) => v.versionId && v.colorId).length}
                      </div>
                      <div className="text-sm text-gray-600">Loại xe</div>
                    </div>
                  </div>
                </Card>

                {/* Price Summary */}
                {dashboardStats.finalValue > 0 && (
                  <Card title="Tóm tắt giá" className="shadow-sm">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {new Intl.NumberFormat("vi-VN").format(
                          dashboardStats.finalValue
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mb-4">VNĐ</div>

                      {dashboardStats.discountAmount > 0 && (
                        <div className="space-y-1 pt-3 border-t border-gray-200">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Giá gốc:</span>
                            <span className="text-gray-800">
                              {new Intl.NumberFormat("vi-VN").format(
                                dashboardStats.currentQuoteValue
                              )}{" "}
                              VNĐ
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Giảm giá:</span>
                            <span className="text-orange-600 font-medium">
                              -
                              {new Intl.NumberFormat("vi-VN").format(
                                dashboardStats.discountAmount
                              )}{" "}
                              VNĐ
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Progress Info */}
                <Card title="Tiến trình" className="shadow-sm">
                  <div className="space-y-3">
                    {steps.map((step, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-2 rounded-lg ${index === currentStep
                          ? "bg-blue-50 border border-blue-200"
                          : index < currentStep
                            ? "bg-green-50"
                            : "bg-gray-50"
                          }`}
                      >
                        <div
                          className={`text-lg ${index === currentStep
                            ? "text-blue-600"
                            : index < currentStep
                              ? "text-green-600"
                              : "text-gray-400"
                            }`}
                        >
                          {step.icon}
                        </div>
                        <div>
                          <div
                            className={`font-medium ${index === currentStep
                              ? "text-blue-800"
                              : index < currentStep
                                ? "text-green-800"
                                : "text-gray-600"
                              }`}
                          >
                            {step.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {step.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </Col>
          </Row>
        </div>

        {/* Success Modal */}
        <SuccessModal
          visible={showSuccessModal}
          onClose={handleCloseSuccessModal}
          onViewQuotes={handleViewQuotes}
          onCreateNew={handleCreateNew}
          quoteData={createdQuoteData}
        />
      </PageContainer>
    </DealerStaffLayout>
  );
}

export default CreateEVQuote;
