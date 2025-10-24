import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { message } from 'antd';
import AdminLayout from '../../../Components/Admin/AdminLayout';
import { getAllPromotion } from '../../../App/EVMAdmin/EVPromotion/GetAllPromotion';
import { DeletePromotion } from '../../../App/EVMAdmin/EVPromotion/DeletePromotion';

// Import các components đã tách
import StatisticsCards from './Components/StatisticsCards';
import PromotionTable from './Components/PromotionTable';
import PageHeader from './Components/PageHeader';
import LoadingSpinner from './Components/LoadingSpinner';
import ErrorDisplay from './Components/ErrorDisplay';
import UpdatePromotionForm from './Components/UpdatePromotionForm';
import DeleteConfirmModal from './Components/DeleteConfirmModal';

function GetAllPromotion() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [promotionToDelete, setPromotionToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Fetch promotions data
    const fetchPromotions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllPromotion();

            if (response.isSuccess) {
                console.log('Promotions fetched:', response.result);
                setPromotions(response.result || []);
            } else {
                const errorMsg = response.message || 'Không thể tải danh sách khuyến mãi';
                setError(errorMsg);
                message.error(errorMsg);
            }
        } catch (err) {
            console.error('Error fetching promotions:', err);
            const errorMsg = 'Lỗi kết nối server. Vui lòng thử lại sau.';
            setError(errorMsg);
            message.error('Không thể tải danh sách khuyến mãi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    // Calculate statistics
    const statistics = useMemo(() => {
        const total = promotions.length;
        const now = new Date();

        const active = promotions.filter(p => {
            const start = new Date(p.startDate);
            const end = new Date(p.endDate);
            return p.isActive && now >= start && now <= end;
        }).length;

        const upcoming = promotions.filter(p => {
            const start = new Date(p.startDate);
            return p.isActive && now < start;
        }).length;

        const expired = promotions.filter(p => {
            const end = new Date(p.endDate);
            return now > end;
        }).length;

        return { total, active, upcoming, expired };
    }, [promotions]);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get promotion status
    const getPromotionStatus = (startDate, endDate, isActive) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (!isActive) {
            return { status: 'inactive', text: 'Tạm dừng', color: 'default' };
        }

        if (now < start) {
            return { status: 'upcoming', text: 'Sắp diễn ra', color: 'blue' };
        } else if (now > end) {
            return { status: 'expired', text: 'Đã hết hạn', color: 'red' };
        } else {
            return { status: 'active', text: 'Đang diễn ra', color: 'green' };
        }
    };

    // Handle edit promotion
    const handleEdit = (promotion) => {
        setSelectedPromotion(promotion);
        setShowUpdateModal(true);
    };

    // Handle view promotion details
    const handleView = (promotion) => {
        // TODO: Implement view details modal or navigate to detail page
        console.log('View promotion:', promotion);
        message.info('Chức năng xem chi tiết đang được phát triển');
    };

    // Handle delete promotion
    const handleDelete = (promotion) => {
        console.log('Delete button clicked for promotion:', promotion);
        setPromotionToDelete(promotion);
        setShowDeleteModal(true);
    };

    // Handle confirm delete
    const handleConfirmDelete = async () => {
        if (!promotionToDelete) return;

        try {
            setDeleteLoading(true);
            console.log('Calling DeletePromotion API with ID:', promotionToDelete.id);

            const response = await DeletePromotion(promotionToDelete.id);
            console.log('Delete response:', response);

            if (response.isSuccess) {
                message.success('Xóa khuyến mãi thành công!');
                setShowDeleteModal(false);
                setPromotionToDelete(null);
                fetchPromotions(); // Refresh data
            } else {
                message.error(response.message || 'Không thể xóa khuyến mãi');
            }
        } catch (error) {
            console.error('Error deleting promotion:', error);
            message.error('Lỗi khi xóa khuyến mãi. Vui lòng thử lại sau.');
        } finally {
            setDeleteLoading(false);
        }
    };

    // Handle cancel delete
    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setPromotionToDelete(null);
    };

    // Handle update success
    const handleUpdateSuccess = () => {
        fetchPromotions(); // Refresh data
        message.success('Cập nhật khuyến mãi thành công!');
    };

    // Handle close update modal
    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedPromotion(null);
    };

    // Render loading state
    if (loading) {
        return (
            <AdminLayout>
                <PageContainer title="Quản lý khuyến mãi xe điện">
                    <LoadingSpinner />
                </PageContainer>
            </AdminLayout>
        );
    }

    // Render error state
    if (error) {
        return (
            <AdminLayout>
                <PageContainer title="Quản lý khuyến mãi xe điện">
                    <ErrorDisplay error={error} onRetry={fetchPromotions} />
                </PageContainer>
            </AdminLayout>
        );
    }

    // Get page header configuration
    const headerConfig = PageHeader({ totalPromotions: statistics.total });

    return (
        <AdminLayout>
            <PageContainer
                title={headerConfig.title}
                subTitle={headerConfig.subTitle}
                extra={headerConfig.extra}
                className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen"
            >
                <div className="space-y-6">
                    {/* Statistics Overview */}
                    <StatisticsCards statistics={statistics} />

                    {/* Promotions Data Table */}
                    <PromotionTable
                        promotions={promotions}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        getPromotionStatus={getPromotionStatus}
                        onEdit={handleEdit}
                        onView={handleView}
                        onDelete={handleDelete}
                    />
                </div>

                {/* Update Promotion Modal */}
                <UpdatePromotionForm
                    visible={showUpdateModal}
                    onCancel={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                    promotionData={selectedPromotion}
                />

                {/* Delete Confirmation Modal */}
                <DeleteConfirmModal
                    visible={showDeleteModal}
                    onCancel={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                    promotionData={promotionToDelete}
                    loading={deleteLoading}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                />
            </PageContainer>
        </AdminLayout>
    );
}

export default GetAllPromotion;
