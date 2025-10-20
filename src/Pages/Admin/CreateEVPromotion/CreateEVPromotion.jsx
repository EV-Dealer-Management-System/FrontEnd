import React, { useState, useEffect } from 'react';
import {
    PageContainer,
    ProForm,
    ProFormText,
    ProFormTextArea,
    ProFormDigit,
    ProFormSelect,
    ProFormDateTimePicker,
    ProFormRadio
} from '@ant-design/pro-components';
import { Card, message, Spin, Button, Space } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAllEVTemplates } from '../../../App/EVMAdmin/EVPromotion/Layouts/GetAllEVTemplate';
import { createPromotion } from '../../../App/EVMAdmin/EVPromotion/CreatePromotion';
import AdminLayout from '../../../Components/Admin/AdminLayout';
import VehicleSelection from './Components/VehicleSelection';
import SuccessModal from './components/SuccessModal';

function CreateEVPromotion() {
    const navigate = useNavigate();
    const [form] = ProForm.useForm();
    const [loading, setLoading] = useState(false);
    const [evTemplates, setEvTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [selectedModel, setSelectedModel] = useState(null);
    const [filteredVersions, setFilteredVersions] = useState([]);
    const [applyToAll, setApplyToAll] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [promotionName, setPromotionName] = useState('');

    // Lấy danh sách EV Templates khi component mount
    useEffect(() => {
        fetchEVTemplates();
    }, []);

    const fetchEVTemplates = async () => {
        try {
            setLoadingTemplates(true);
            const response = await getAllEVTemplates();

            if (response.isSuccess) {
                setEvTemplates(response.result);
            } else {
                message.error('Không thể tải danh sách xe điện');
            }
        } catch (error) {
            console.error('Lỗi khi tải EV templates:', error);
            message.error('Có lỗi xảy ra khi tải danh sách xe điện');
        } finally {
            setLoadingTemplates(false);
        }
    };

    // Tạo danh sách models duy nhất
    const getUniqueModels = () => {
        const uniqueModels = [];
        const modelMap = new Map();

        evTemplates.forEach(template => {
            const modelId = template.version.modelId;
            if (!modelMap.has(modelId)) {
                modelMap.set(modelId, {
                    value: modelId,
                    label: template.version.modelName,
                    modelName: template.version.modelName
                });
                uniqueModels.push(modelMap.get(modelId));
            }
        });

        return uniqueModels;
    };

    // Lấy versions theo model được chọn
    const getVersionsByModel = (modelId) => {
        const versions = [];
        const versionMap = new Map();

        evTemplates.forEach(template => {
            if (template.version.modelId === modelId) {
                const versionId = template.version.versionId;
                if (!versionMap.has(versionId)) {
                    versionMap.set(versionId, {
                        value: versionId,
                        label: template.version.versionName,
                        versionName: template.version.versionName
                    });
                    versions.push(versionMap.get(versionId));
                }
            }
        });

        return versions;
    };

    // Xử lý khi thay đổi model
    const handleModelChange = (value) => {
        setSelectedModel(value);
        const versions = getVersionsByModel(value);
        setFilteredVersions(versions);

        // Reset version selection
        form.setFieldsValue({ versionId: undefined });
    };

    // Xử lý khi thay đổi option áp dụng toàn bộ
    const handleApplyToAllChange = (value) => {
        setApplyToAll(value);
        if (value) {
            // Reset model và version khi chọn áp dụng toàn bộ
            setSelectedModel(null);
            setFilteredVersions([]);
            form.setFieldsValue({
                modelId: undefined,
                versionId: undefined
            });
        }
    };

    // Xử lý submit form
    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            // Log để debug
            console.log('Form values:', values);

            // Function để convert date string từ DD/MM/YYYY HH:mm sang ISO string
            const convertToISOString = (dateString) => {
                if (!dateString) return new Date().toISOString();

                // Parse format "21/10/2025 19:00" thành Date object
                const [datePart, timePart] = dateString.split(' ');
                const [day, month, year] = datePart.split('/');
                const [hour, minute] = timePart.split(':');

                // Tạo Date object (month - 1 vì month trong Date constructor bắt đầu từ 0)
                const date = new Date(year, month - 1, day, hour, minute);
                return date.toISOString();
            };

            // Chuẩn bị dữ liệu gửi API
            const promotionData = {
                name: values.name,
                description: values.description,
                percentage: values.discountType === 1 ? Number(values.percentage || 0) : 0,
                fixedAmount: values.discountType === 0 ? Number(values.fixedAmount || 0) : 0,
                modelId: values.applyToAll ? null : values.modelId,
                versionId: values.applyToAll ? null : values.versionId,
                discountType: Number(values.discountType),
                startDate: convertToISOString(values.startDate),
                endDate: convertToISOString(values.endDate),
                createdAt: new Date().toISOString(),
                isActive: true
            };            // Log để debug
            console.log('Promotion data to send:', promotionData);

            const response = await createPromotion(promotionData);

            if (response) {
                // Lưu tên khuyến mãi để hiển thị trong popup
                setPromotionName(values.name);

                // Hiển thị popup thành công thay vì message
                setShowSuccessModal(true);

                // Reset form
                form.resetFields();
                setSelectedModel(null);
                setFilteredVersions([]);
                setApplyToAll(false);
            }
        } catch (error) {
            console.error('Lỗi khi tạo khuyến mãi:', error);

            // Hiển thị lỗi chi tiết từ API
            if (error.response && error.response.data && error.response.data.message) {
                message.error(`Lỗi: ${error.response.data.message}`);
            } else if (error.message) {
                message.error(`Lỗi: ${error.message}`);
            } else {
                message.error('Có lỗi xảy ra khi tạo khuyến mãi');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handler cho success modal
    const handleViewPromotionList = () => {
        setShowSuccessModal(false);
        navigate('/admin/promotions/all-promotions');
    };

    const handleCreateAnother = () => {
        setShowSuccessModal(false);
        // Form đã được reset, chỉ cần đóng modal
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
    };

    return (
        <AdminLayout>
            <PageContainer
                title="Tạo Khuyến Mãi Xe Điện"
                subTitle="Tạo chương trình khuyến mãi cho xe điện"
                extra={[
                    <Button
                        key="back"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/admin/promotions/create-promotion')}
                        className="bg-gray-100 hover:bg-gray-200"
                    >
                        Quay lại
                    </Button>
                ]}
                className="min-h-screen bg-gray-50"
            >
                <Card className="shadow-md">
                    <Spin spinning={loadingTemplates} tip="Đang tải danh sách xe điện...">
                        <ProForm
                            form={form}
                            onFinish={handleSubmit}
                            layout="vertical"
                            submitter={{
                                render: (props) => (
                                    <div className="flex justify-end gap-4 pt-6">
                                        <Button
                                            onClick={() => form.resetFields()}
                                            className="px-6"
                                        >
                                            Đặt lại
                                        </Button>
                                        <Button
                                            type="primary"
                                            loading={loading}
                                            onClick={() => props.form?.submit?.()}
                                            icon={<PlusOutlined />}
                                            className="px-6 bg-blue-500 hover:bg-blue-600"
                                        >
                                            Tạo khuyến mãi
                                        </Button>
                                    </div>
                                ),
                            }}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Thông tin cơ bản */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Thông tin khuyến mãi
                                    </h3>

                                    <ProFormText
                                        name="name"
                                        label="Tên khuyến mãi"
                                        placeholder="Nhập tên chương trình khuyến mãi"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập tên khuyến mãi!' },
                                            { min: 5, message: 'Tên khuyến mãi phải có ít nhất 5 ký tự!' }
                                        ]}
                                        fieldProps={{
                                            className: 'rounded-lg'
                                        }}
                                    />

                                    <ProFormTextArea
                                        name="description"
                                        label="Mô tả"
                                        placeholder="Nhập mô tả chi tiết về chương trình khuyến mãi"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập mô tả!' }
                                        ]}
                                        fieldProps={{
                                            rows: 4,
                                            className: 'rounded-lg'
                                        }}
                                    />

                                    <ProFormSelect
                                        name="discountType"
                                        label="Loại giảm giá"
                                        placeholder="Chọn loại giảm giá"
                                        options={[
                                            { value: 0, label: 'Giảm số tiền cố định (VNĐ)' },
                                            { value: 1, label: 'Giảm theo phần trăm (%)' }
                                        ]}
                                        rules={[
                                            { required: true, message: 'Vui lòng chọn loại giảm giá!' }
                                        ]}
                                        fieldProps={{
                                            className: 'rounded-lg'
                                        }}
                                    />

                                    <ProForm.Item noStyle shouldUpdate>
                                        {(form) => {
                                            const discountType = form.getFieldValue('discountType');

                                            if (discountType === 0) {
                                                return (
                                                    <ProFormDigit
                                                        name="fixedAmount"
                                                        label="Số tiền giảm (VNĐ)"
                                                        placeholder="Nhập số tiền giảm"
                                                        min={1000}
                                                        rules={[
                                                            { required: true, message: 'Vui lòng nhập số tiền giảm!' }
                                                        ]}
                                                        fieldProps={{
                                                            className: 'rounded-lg w-full',
                                                            formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                                            parser: (value) => value.replace(/\$\s?|(,*)/g, ''),
                                                            addonAfter: 'VNĐ'
                                                        }}
                                                    />
                                                );
                                            } else if (discountType === 1) {
                                                return (
                                                    <ProFormDigit
                                                        name="percentage"
                                                        label="Phần trăm giảm giá (%)"
                                                        placeholder="Nhập phần trăm giảm giá"
                                                        min={1}
                                                        max={100}
                                                        rules={[
                                                            { required: true, message: 'Vui lòng nhập phần trăm giảm giá!' }
                                                        ]}
                                                        fieldProps={{
                                                            className: 'rounded-lg w-full',
                                                            addonAfter: '%'
                                                        }}
                                                    />
                                                );
                                            }
                                            return null;
                                        }}
                                    </ProForm.Item>
                                </div>

                                {/* Vehicle Selection Component */}
                                <div className="space-y-4">
                                    <VehicleSelection
                                        uniqueModels={getUniqueModels()}
                                        filteredVersions={filteredVersions}
                                        selectedModel={selectedModel}
                                        onModelChange={handleModelChange}
                                        onApplyToAllChange={handleApplyToAllChange}
                                    />
                                </div>
                            </div>
                        </ProForm>
                    </Spin>
                </Card>
            </PageContainer>

            {/* Success Modal */}
            <SuccessModal
                visible={showSuccessModal}
                onClose={handleCloseSuccessModal}
                onViewList={handleViewPromotionList}
                onCreateAnother={handleCreateAnother}
                promotionName={promotionName}
            />
        </AdminLayout>
    );
}

export default CreateEVPromotion;
