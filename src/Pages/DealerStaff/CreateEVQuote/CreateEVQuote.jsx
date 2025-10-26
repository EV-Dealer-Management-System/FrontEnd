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

  // State cho form data
  const [selectedItems, setSelectedItems] = useState({
    versionId: null,
    colorId: null,
  });
  const [selectedPromotionId, setSelectedPromotionId] = useState(null);
  const [quantity, setQuantity] = useState(1);
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

  // Tính toán thông tin xe được chọn
  const selectedVehicleInfo = useMemo(() => {
    if (!selectedItems.versionId || !selectedItems.colorId) return null;

    const vehicleItem = inventory.find(
      (item) =>
        item.versionId === selectedItems.versionId &&
        item.colorId === selectedItems.colorId
    );

    return vehicleItem
      ? {
        ...vehicleItem,
        maxQuantity: vehicleItem.quantity,
      }
      : null;
  }, [inventory, selectedItems]);

  // Tính toán khuyến mãi được chọn
  const selectedPromotionInfo = useMemo(() => {
    if (!selectedPromotionId) return null;
    return promotions.find((promotion) => promotion.id === selectedPromotionId);
  }, [promotions, selectedPromotionId]);

  // Tính toán thống kê dashboard
  const dashboardStats = useMemo(() => {
    const totalVehicles = inventory.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    const totalPromotions = promotions.length;
    const currentQuoteValue = selectedVehicleInfo
      ? (selectedVehicleInfo.price || 0) * quantity
      : 0;

    // Tính discount dựa trên loại khuyến mãi
    let discountAmount = 0;
    if (selectedPromotionInfo) {
      if (selectedPromotionInfo.discountType === 0) {
        // Fixed amount discount
        discountAmount = selectedPromotionInfo.fixedAmount || 0;
      } else {
        // Percentage discount
        discountAmount =
          ((selectedPromotionInfo.percentage || 0) * currentQuoteValue) / 100;
      }
    }

    const finalValue = currentQuoteValue - discountAmount;

    return {
      totalVehicles,
      totalPromotions,
      currentQuoteValue,
      discountAmount,
      finalValue,
    };
  }, [
    inventory,
    promotions,
    selectedVehicleInfo,
    selectedPromotionInfo,
    quantity,
  ]);

  // Validation
  const validationErrors = useMemo(() => {
    const errors = [];

    if (!selectedItems.versionId) {
      errors.push("Vui lòng chọn model và phiên bản xe điện");
    }

    if (!selectedItems.colorId) {
      errors.push("Vui lòng chọn màu sắc");
    }

    if (!quantity || quantity < 1) {
      errors.push("Vui lòng nhập số lượng xe (tối thiểu 1)");
    }

    if (selectedVehicleInfo && quantity > selectedVehicleInfo.maxQuantity) {
      errors.push(
        `Số lượng vượt quá số xe có sẵn (${selectedVehicleInfo.maxQuantity})`
      );
    }

    return errors;
  }, [selectedItems, quantity, selectedVehicleInfo]);

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
  const handleVehicleSelectionChange = (selection) => {
    setSelectedItems(selection);
    setQuantity(1);
  };

  const handlePromotionChange = (promotionId) => {
    setSelectedPromotionId(promotionId);
  };

  const handleQuantityChange = (value) => {
    setQuantity(value);
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
        return selectedItems.versionId && selectedItems.colorId;
      case 1:
        return true; // Khuyến mãi là optional
      case 2:
        return (
          quantity > 0 && quantity <= (selectedVehicleInfo?.maxQuantity || 0)
        );
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

      // Chuẩn bị dữ liệu gửi API
      const quoteData = {
        note: note || "",
        quoteDetails: [
          {
            versionId: selectedItems.versionId,
            colorId: selectedItems.colorId,
            promotionId: selectedPromotionId || null,
            quantity: quantity,
          },
        ],
      };

      console.log("Sending quote data:", quoteData);

      const response = await CreateEVQuotes(quoteData);

      if (response && response.isSuccess) {
        // Lấy thông tin từ API response
        const quoteDetail = response.result?.quoteDetails?.[0];

        // Chuẩn bị thông tin cho modal thành công
        const successData = {
          vehicleName: quoteDetail?.version
            ? `${quoteDetail.version.modelName} - ${quoteDetail.version.versionName}`
            : selectedVehicleInfo
              ? `${selectedVehicleInfo.modelName} - ${selectedVehicleInfo.versionName}`
              : "",
          colorName:
            quoteDetail?.color?.colorName ||
            (selectedVehicleInfo ? selectedVehicleInfo.colorName : ""),
          quantity: quoteDetail?.quantity || quantity,
          promotionName:
            quoteDetail?.promotion?.promotionName ||
            (selectedPromotionInfo ? selectedPromotionInfo.name : null),
          promotionType: selectedPromotionInfo?.discountType ?? null,
          promotionValue:
            selectedPromotionInfo?.discountType === 0
              ? selectedPromotionInfo?.fixedAmount
              : selectedPromotionInfo?.percentage,
          unitPrice: quoteDetail?.unitPrice || null,
          totalPrice: quoteDetail?.totalPrice || null,
        };

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

      // Hiển thị lỗi chi tiết từ API
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
    setSelectedItems({
      versionId: null,
      colorId: null,
    });
    setSelectedPromotionId(null);
    setQuantity(1);
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
              selectedItems={selectedItems}
              onSelectionChange={handleVehicleSelectionChange}
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
            />
          </Card>
        );
      case 1:
        return (
          <Card className="border-0 shadow-sm">
            <PromotionSelection
              promotions={promotions}
              loadingPromotions={loadingPromotions}
              selectedPromotionId={selectedPromotionId}
              onPromotionChange={handlePromotionChange}
              modelId={selectedVehicleInfo?.modelId}
              versionId={selectedItems.versionId}
            />
          </Card>
        );
      case 2:
        return (
          <Card className="border-0 shadow-sm">
            <QuoteDetails
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              note={note}
              onNoteChange={handleNoteChange}
              maxQuantity={selectedVehicleInfo?.maxQuantity || 0}
              selectedVehicle={
                selectedVehicleInfo
                  ? {
                    modelName: selectedVehicleInfo.modelName,
                    versionName: selectedVehicleInfo.versionName,
                    colorName: selectedVehicleInfo.colorName,
                  }
                  : null
              }
              selectedPromotion={selectedPromotionInfo}
            />
          </Card>
        );
      case 3:
        return (
          <Card className="border-0 shadow-sm">
            <ConfirmationStep
              selectedVehicle={
                selectedVehicleInfo
                  ? {
                    modelName: selectedVehicleInfo.modelName,
                    versionName: selectedVehicleInfo.versionName,
                    colorName: selectedVehicleInfo.colorName,
                  }
                  : null
              }
              quantity={quantity}
              selectedPromotion={selectedPromotionInfo}
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
