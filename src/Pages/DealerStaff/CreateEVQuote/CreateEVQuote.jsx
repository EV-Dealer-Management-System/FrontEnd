import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { message, Row, Col, Statistic, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CarOutlined, DollarOutlined, ShoppingCartOutlined, GiftOutlined } from '@ant-design/icons';
import DealerStaffLayout from '../../../Components/DealerStaff/DealerStaffLayout';

// Import API functions
import { GetAllEVInventory } from '../../../App/DealerStaff/EVInventory/GetAllEVInventory';
import { GetAllPromotions } from '../../../App/DealerStaff/EVQuotesManagement/GetAllPromotion';
import { CreateEVQuotes } from '../../../App/DealerStaff/EVQuotesManagement/CreateEVQuotes';

// Import components
import PageHeader from './Components/PageHeader';
import VehicleSelection from './Components/VehicleSelection';
import PromotionSelection from './Components/PromotionSelection';
import QuoteDetails from './Components/QuoteDetails';
import SubmitSection from './Components/SubmitSection';
import SuccessModal from './Components/SuccessModal';

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
        colorId: null
    });
    const [selectedPromotionId, setSelectedPromotionId] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState('');

    // State cho modal thành công
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdQuoteData, setCreatedQuoteData] = useState(null);

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
                message.error(response.message || 'Không thể tải danh sách xe điện');
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
            message.error('Lỗi kết nối server. Vui lòng thử lại sau.');
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
            console.error('Error fetching promotions:', error);
            message.error('Lỗi kết nối server. Vui lòng thử lại sau.');
        } finally {
            setLoadingPromotions(false);
        }
    };

    // Tính toán thông tin xe được chọn
    const selectedVehicleInfo = useMemo(() => {
        if (!selectedItems.versionId || !selectedItems.colorId) return null;

        const vehicleItem = inventory.find(
            item => item.versionId === selectedItems.versionId && item.colorId === selectedItems.colorId
        );

        return vehicleItem ? {
            ...vehicleItem,
            maxQuantity: vehicleItem.quantity
        } : null;
    }, [inventory, selectedItems]);

    // Tính toán khuyến mãi được chọn
    const selectedPromotionInfo = useMemo(() => {
        if (!selectedPromotionId) return null;
        return promotions.find(promotion => promotion.id === selectedPromotionId);
    }, [promotions, selectedPromotionId]);

    // Tính toán thống kê dashboard
    const dashboardStats = useMemo(() => {
        const totalVehicles = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const totalPromotions = promotions.length;
        const currentQuoteValue = selectedVehicleInfo ? (selectedVehicleInfo.price || 0) * quantity : 0;

        // Tính discount dựa trên loại khuyến mãi
        let discountAmount = 0;
        if (selectedPromotionInfo) {
            if (selectedPromotionInfo.discountType === 0) {
                // Fixed amount discount
                discountAmount = selectedPromotionInfo.fixedAmount || 0;
            } else {
                // Percentage discount
                discountAmount = (selectedPromotionInfo.percentage || 0) * currentQuoteValue / 100;
            }
        }

        const finalValue = currentQuoteValue - discountAmount;

        return {
            totalVehicles,
            totalPromotions,
            currentQuoteValue,
            discountAmount,
            finalValue
        };
    }, [inventory, promotions, selectedVehicleInfo, selectedPromotionInfo, quantity]);

    // Validation
    const validationErrors = useMemo(() => {
        const errors = [];

        if (!selectedItems.versionId) {
            errors.push('Vui lòng chọn model và phiên bản xe điện');
        }

        if (!selectedItems.colorId) {
            errors.push('Vui lòng chọn màu sắc');
        }

        if (!quantity || quantity < 1) {
            errors.push('Vui lòng nhập số lượng xe (tối thiểu 1)');
        }

        if (selectedVehicleInfo && quantity > selectedVehicleInfo.maxQuantity) {
            errors.push(`Số lượng vượt quá số xe có sẵn (${selectedVehicleInfo.maxQuantity})`);
        }

        return errors;
    }, [selectedItems, quantity, selectedVehicleInfo]);

    const canSubmit = validationErrors.length === 0;

    // Handlers
    const handleVehicleSelectionChange = (selection) => {
        setSelectedItems(selection);
        // Reset quantity khi thay đổi xe
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

    const handleSubmit = async () => {
        if (!canSubmit) {
            message.warning('Vui lòng hoàn thành tất cả thông tin bắt buộc');
            return;
        }

        try {
            setSubmitting(true);

            // Chuẩn bị dữ liệu gửi API
            const quoteData = {
                note: note || '',
                quoteDetails: [
                    {
                        versionId: selectedItems.versionId,
                        colorId: selectedItems.colorId,
                        promotionId: selectedPromotionId || null,
                        quantity: quantity
                    }
                ]
            };

            console.log('Sending quote data:', quoteData);

            const response = await CreateEVQuotes(quoteData);

            if (response && response.isSuccess) {
                // Chuẩn bị thông tin cho modal thành công
                const successData = {
                    vehicleName: selectedVehicleInfo ?
                        `${selectedVehicleInfo.modelName} - ${selectedVehicleInfo.versionName}` : '',
                    colorName: selectedVehicleInfo ? selectedVehicleInfo.colorName : '',
                    quantity: quantity,
                    promotionName: selectedPromotionInfo ? selectedPromotionInfo.name : null
                };

                setCreatedQuoteData(successData);
                setShowSuccessModal(true);

                // Reset form
                handleReset();

                message.success('Tạo báo giá thành công!');
            } else {
                throw new Error(response?.message || 'Tạo báo giá thất bại');
            }
        } catch (error) {
            console.error('Error creating quote:', error);

            // Hiển thị lỗi chi tiết từ API
            if (error.response && error.response.data && error.response.data.message) {
                message.error(`Lỗi: ${error.response.data.message}`);
            } else if (error.message) {
                message.error(`Lỗi: ${error.message}`);
            } else {
                message.error('Có lỗi xảy ra khi tạo báo giá. Vui lòng thử lại.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setSelectedItems({
            versionId: null,
            colorId: null
        });
        setSelectedPromotionId(null);
        setQuantity(1);
        setNote('');
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        setCreatedQuoteData(null);
    };

    const handleViewQuotes = () => {
        handleCloseSuccessModal();
        navigate('/dealer-staff/quotes');
    };

    const handleCreateNew = () => {
        handleCloseSuccessModal();
        handleReset();
    };

    // Get page header configuration
    const headerConfig = PageHeader();

    return (
        <DealerStaffLayout>
            <PageContainer
                title={headerConfig.title}
                subTitle={headerConfig.subTitle}
                extra={headerConfig.extra}
                className="bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen"
            >
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Dashboard Stats Row */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={6}>
                            <ProCard bordered className="shadow-md bg-white rounded-lg">
                                <StatisticCard
                                    statistic={{
                                        title: 'Tổng Xe Có Sẵn',
                                        value: dashboardStats.totalVehicles,
                                        prefix: <CarOutlined className="text-blue-500" />,
                                        valueStyle: { color: '#1890ff' }
                                    }}
                                />
                            </ProCard>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <ProCard bordered className="shadow-md bg-white rounded-lg">
                                <StatisticCard
                                    statistic={{
                                        title: 'Khuyến Mãi',
                                        value: dashboardStats.totalPromotions,
                                        prefix: <GiftOutlined className="text-pink-500" />,
                                        valueStyle: { color: '#eb2f96' }
                                    }}
                                />
                            </ProCard>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <ProCard bordered className="shadow-md bg-white rounded-lg">
                                <StatisticCard
                                    statistic={{
                                        title: 'Giá Trị Báo Giá',
                                        value: dashboardStats.currentQuoteValue,
                                        prefix: <DollarOutlined className="text-green-500" />,
                                        valueStyle: { color: '#52c41a' },
                                        formatter: (value) => new Intl.NumberFormat('vi-VN').format(value),
                                        suffix: 'VNĐ'
                                    }}
                                />
                            </ProCard>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <ProCard bordered className="shadow-md bg-white rounded-lg">
                                <StatisticCard
                                    statistic={{
                                        title: 'Giảm Giá',
                                        value: dashboardStats.discountAmount,
                                        prefix: <ShoppingCartOutlined className="text-orange-500" />,
                                        valueStyle: { color: '#fa8c16' },
                                        formatter: (value) => new Intl.NumberFormat('vi-VN').format(value),
                                        suffix: 'VNĐ'
                                    }}
                                />
                            </ProCard>
                        </Col>
                    </Row>

                    <Divider className="my-8" />

                    {/* Main Form Row */}
                    <Row gutter={[24, 24]}>
                        {/* Left Column - Vehicle and Promotion Selection */}
                        <Col xs={24} xl={14}>
                            <div className="space-y-6">
                                {/* Vehicle Selection Card */}
                                <ProCard
                                    title={
                                        <div className="flex items-center gap-2">
                                            <CarOutlined className="text-blue-600" />
                                            <span>Chọn Xe Điện</span>
                                        </div>
                                    }
                                    bordered
                                    className="shadow-lg bg-white rounded-xl border-0"
                                    headStyle={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        borderRadius: '12px 12px 0 0',
                                        padding: '16px 24px'
                                    }}
                                    bodyStyle={{ padding: '24px' }}
                                >
                                    <VehicleSelection
                                        inventory={inventory}
                                        loadingInventory={loadingInventory}
                                        selectedItems={selectedItems}
                                        onSelectionChange={handleVehicleSelectionChange}
                                    />
                                </ProCard>

                                {/* Promotion Selection Card */}
                                <ProCard
                                    title={
                                        <div className="flex items-center gap-2">
                                            <GiftOutlined className="text-pink-600" />
                                            <span>Chọn Khuyến Mãi</span>
                                        </div>
                                    }
                                    bordered
                                    className="shadow-lg bg-white rounded-xl border-0"
                                    headStyle={{
                                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                        color: 'white',
                                        borderRadius: '12px 12px 0 0',
                                        padding: '16px 24px'
                                    }}
                                    bodyStyle={{ padding: '24px' }}
                                >
                                    <PromotionSelection
                                        promotions={promotions}
                                        loadingPromotions={loadingPromotions}
                                        selectedPromotionId={selectedPromotionId}
                                        onPromotionChange={handlePromotionChange}
                                    />
                                </ProCard>
                            </div>
                        </Col>

                        {/* Right Column - Quote Details and Submit */}
                        <Col xs={24} xl={10}>
                            <div className="space-y-6">
                                {/* Quote Summary Card */}
                                <ProCard
                                    title={
                                        <div className="flex items-center gap-2">
                                            <ShoppingCartOutlined className="text-green-600" />
                                            <span>Tóm Tắt Báo Giá</span>
                                        </div>
                                    }
                                    bordered
                                    className="shadow-lg bg-white rounded-xl border-0"
                                    headStyle={{
                                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                        color: 'white',
                                        borderRadius: '12px 12px 0 0',
                                        padding: '16px 24px'
                                    }}
                                    bodyStyle={{ padding: '24px' }}
                                >
                                    <div className="space-y-4">
                                        <QuoteDetails
                                            quantity={quantity}
                                            onQuantityChange={handleQuantityChange}
                                            note={note}
                                            onNoteChange={handleNoteChange}
                                            maxQuantity={selectedVehicleInfo?.maxQuantity || 0}
                                            selectedVehicle={selectedVehicleInfo ? {
                                                modelName: selectedVehicleInfo.modelName,
                                                versionName: selectedVehicleInfo.versionName,
                                                colorName: selectedVehicleInfo.colorName
                                            } : null}
                                            selectedPromotion={selectedPromotionInfo}
                                        />

                                        {/* Final Price Display */}
                                        {dashboardStats.finalValue > 0 && (
                                            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                                                <Statistic
                                                    title="Giá Trị Cuối Cùng"
                                                    value={dashboardStats.finalValue}
                                                    prefix={<DollarOutlined />}
                                                    suffix="VNĐ"
                                                    formatter={(value) => new Intl.NumberFormat('vi-VN').format(value)}
                                                    valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </ProCard>

                                {/* Submit Section Card */}
                                <ProCard
                                    bordered
                                    className="shadow-lg bg-white rounded-xl border-0"
                                    bodyStyle={{ padding: '24px' }}
                                >
                                    <SubmitSection
                                        onSubmit={handleSubmit}
                                        onReset={handleReset}
                                        loading={submitting}
                                        canSubmit={canSubmit}
                                        validationErrors={validationErrors}
                                    />
                                </ProCard>
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