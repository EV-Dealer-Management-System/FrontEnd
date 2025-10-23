import React, { useState, useEffect } from 'react';
import {
    PageContainer,
    ProForm,
    ProFormText,
    ProFormTextArea,
    ProFormDigit,
    ProFormSelect,
    ProFormDateTimePicker,
    ProCard,
    StepsForm,
    ProFormRadio,
    ProDescriptions
} from '@ant-design/pro-components';
import {
    Card,
    message,
    Spin,
    Button,
    Space,
    Typography,
    Steps,
    Tag,
    Divider,
    Row,
    Col,
    Alert,
    Statistic
} from 'antd';
import {
    PlusOutlined,
    ArrowLeftOutlined,
    TagOutlined,
    PercentageOutlined,
    CarOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAllEVTemplates } from '../../../App/EVMAdmin/EVPromotion/Layouts/GetAllEVTemplate';
import { createPromotion } from '../../../App/EVMAdmin/EVPromotion/CreatePromotion';
import AdminLayout from '../../../Components/Admin/AdminLayout';
import VehicleSelection from './Components/VehicleSelection';
import SuccessModal from './Components/SuccessModal';

function CreateEVPromotion() {
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(false);
    const [evTemplates, setEvTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [selectedModel, setSelectedModel] = useState(null);
    const [filteredVersions, setFilteredVersions] = useState([]);
    const [formValues, setFormValues] = useState({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [promotionName, setPromotionName] = useState('');
    const { Title, Text } = Typography;

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
                message.success('Đã tải danh sách xe điện thành công');
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
    const handleModelChange = (value, form) => {
        setSelectedModel(value);
        const versions = getVersionsByModel(value);
        setFilteredVersions(versions);

        // Reset version selection
        form.setFieldsValue({ versionId: undefined });
    };

    // Xử lý khi thay đổi option áp dụng toàn bộ
    const handleApplyToAllChange = (value, form) => {
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

                // Nếu dateString đã là Date object
                if (dateString instanceof Date) {
                    return dateString.toISOString();
                }

                // Nếu dateString là moment object
                if (dateString && typeof dateString === 'object' && dateString.format) {
                    return dateString.toDate().toISOString();
                }

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
            };

            // Log để debug
            console.log('Promotion data to send:', promotionData);

            const response = await createPromotion(promotionData);

            if (response) {
                // Lưu tên khuyến mãi để hiển thị trong popup
                setPromotionName(values.name);

                // Hiển thị popup thành công thay vì message
                setShowSuccessModal(true);

                // Reset form và state
                setSelectedModel(null);
                setFilteredVersions([]);
                return true; // Return true để StepsForm biết là thành công
            }
            return false;
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
            return false;
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

    // Render xem trước khuyến mãi
    const renderPromotionPreview = (values) => {
        // Xử lý loại giảm giá
        let discountTypeLabel = 'Chưa chọn';
        if (values.discountType === 0) {
            discountTypeLabel = <Tag color="green">Giảm số tiền cố định</Tag>;
        } else if (values.discountType === 1) {
            discountTypeLabel = <Tag color="blue">Giảm theo phần trăm</Tag>;
        }

        // Xử lý giá trị giảm giá
        let discountValue = 'Chưa nhập';
        if (values.discountType === 0 && values.fixedAmount) {
            const amount = Number(values.fixedAmount);
            if (!isNaN(amount)) {
                discountValue = `${amount.toLocaleString('vi-VN')} VNĐ`;
            }
        } else if (values.discountType === 1 && values.percentage) {
            const percent = Number(values.percentage);
            if (!isNaN(percent)) {
                discountValue = `${percent}%`;
            }
        }

 
    };

    return (
        <AdminLayout>
            <PageContainer
                title={
                    <div className="flex items-center">
                        <TagOutlined className="mr-2 text-blue-500" />
                        <span>Tạo Khuyến Mãi Xe Điện</span>
                    </div>
                }
                subTitle="Tạo chương trình khuyến mãi cho xe điện"
                extra={[
                    <Button
                        key="back"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/admin/promotions/all-promotions')}
                        className="bg-gray-100 hover:bg-gray-200"
                    >
                        Quay lại danh sách
                    </Button>
                ]}
                className="min-h-screen bg-gray-50"
            >
                {loadingTemplates ? (
                    <Card className="shadow-md">
                        <div className="flex justify-center items-center py-12">
                            <Spin size="large" tip="Đang tải danh sách xe điện..." />
                        </div>
                    </Card>
                ) : (
                    <StepsForm
                        onFinish={handleSubmit}
                        submitter={{
                            render: (props) => {
                                const { step, onSubmit, onPre } = props;
                                return [
                                    <Button
                                        key="pre"
                                        onClick={onPre}
                                        disabled={step === 0}
                                        className="mr-2"
                                    >
                                        Quay lại
                                    </Button>,
                                    step === 2 ? (
                                        <Button
                                            key="submit"
                                            type="primary"
                                            loading={loading}
                                            onClick={onSubmit}
                                            icon={<PlusOutlined />}
                                            className="px-6 bg-blue-500 hover:bg-blue-600"
                                        >
                                            Tạo khuyến mãi
                                        </Button>
                                    ) : (
                                        <Button
                                            key="next"
                                            type="primary"
                                            onClick={props.onSubmit}
                                            className="bg-blue-500 hover:bg-blue-600"
                                        >
                                            Tiếp theo
                                        </Button>
                                    ),
                                ];
                            },
                        }}
                        formProps={{
                            validateMessages: {
                                required: 'Vui lòng nhập ${label}',
                                types: {
                                    number: '${label} phải là số hợp lệ',
                                },
                                number: {
                                    min: '${label} không được nhỏ hơn ${min}',
                                    max: '${label} không được lớn hơn ${max}',
                                },
                            },
                        }}
                        stepsProps={{
                            className: 'mb-6',
                            labelPlacement: 'vertical',
                        }}
                        onValuesChange={(changedValues, allValues) => {
                            console.log('Form values changed:', allValues);
                            setFormValues({ ...allValues });
                        }}
                    >
                        <StepsForm.StepForm
                            name="base"
                            title="Thông tin cơ bản"
                            stepProps={{
                                icon: <TagOutlined />,
                            }}
                        >
                            <ProCard title="Thông tin cơ bản khuyến mãi" className="shadow-md mb-6" bordered headerBordered>
                                <Alert
                                    message="Thông tin quan trọng"
                                    description="Thông tin này sẽ được hiển thị cho khách hàng và nhân viên đại lý."
                                    type="info"
                                    showIcon
                                    className="mb-6"
                                />
                                <Row gutter={24}>
                                    <Col xs={24} md={24}>
                                        <ProFormText
                                            name="name"
                                            label="Tên khuyến mãi"
                                            placeholder="Nhập tên chương trình khuyến mãi"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập tên khuyến mãi!' },
                                                { min: 5, message: 'Tên khuyến mãi phải có ít nhất 5 ký tự!' }
                                            ]}
                                            fieldProps={{
                                                size: 'large',
                                                prefix: <TagOutlined className="text-blue-500" />,
                                                className: 'rounded-lg'
                                            }}
                                        />
                                    </Col>
                                    <Col xs={24} md={24} className="mt-4">
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
                                    </Col>
                                </Row>
                            </ProCard>
                        </StepsForm.StepForm>

                        <StepsForm.StepForm
                            name="discount"
                            title="Giá trị giảm giá"
                            stepProps={{
                                icon: <PercentageOutlined />,
                            }}
                        >
                            <ProCard title="Thông tin giảm giá" className="shadow-md mb-6" bordered headerBordered>
                                <Row gutter={24}>
                                    <Col xs={24} md={24} className="mb-4">
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
                                    </Col>
                                    <Col xs={24} md={24}>
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
                                                                size: 'large',
                                                                className: 'rounded-lg w-full',
                                                                formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                                                parser: (value) => value.replace(/\$\s?|(,*)/g, ''),
                                                                addonAfter: 'VNĐ',
                                                                prefix: <TagOutlined className="text-red-500" />
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
                                                                size: 'large',
                                                                className: 'rounded-lg w-full',
                                                                addonAfter: '%',
                                                                prefix: <PercentageOutlined className="text-red-500" />
                                                            }}
                                                        />
                                                    );
                                                }
                                                return null;
                                            }}
                                        </ProForm.Item>
                                    </Col>
                                </Row>
                            </ProCard>

                            <ProCard title="Thời gian áp dụng" className="shadow-md" bordered headerBordered>
                                <Row gutter={24}>
                                    <Col xs={24} md={12}>
                                        <ProFormDateTimePicker
                                            name="startDate"
                                            label="Ngày bắt đầu"
                                            placeholder="Chọn ngày bắt đầu"
                                            rules={[
                                                { required: true, message: 'Vui lòng chọn ngày bắt đầu!' }
                                            ]}
                                            fieldProps={{
                                                className: 'rounded-lg w-full',
                                                format: 'DD/MM/YYYY HH:mm',
                                                showTime: { format: 'HH:mm' },
                                                size: 'large',
                                                style: { width: '100%' },
                                                disabledDate: (current) => {
                                                    // Disable dates before today
                                                    return current && current < new Date().setHours(0, 0, 0, 0);
                                                }
                                            }}
                                        />
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <ProFormDateTimePicker
                                            name="endDate"
                                            label="Ngày kết thúc"
                                            placeholder="Chọn ngày kết thúc"
                                            rules={[
                                                { required: true, message: 'Vui lòng chọn ngày kết thúc!' },
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        const startDate = getFieldValue('startDate');
                                                        if (!value || !startDate || value.isAfter(startDate)) {
                                                            return Promise.resolve();
                                                        }
                                                        return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu!'));
                                                    },
                                                }),
                                            ]}
                                            fieldProps={{
                                                className: 'rounded-lg w-full',
                                                format: 'DD/MM/YYYY HH:mm',
                                                showTime: { format: 'HH:mm' },
                                                size: 'large',
                                                style: { width: '100%' }
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </ProCard>
                        </StepsForm.StepForm>

                        <StepsForm.StepForm
                            name="vehicle"
                            title="Xe áp dụng"
                            stepProps={{
                                icon: <CarOutlined />,
                            }}
                        >
                            <ProCard title="Chọn xe điện áp dụng" className="shadow-md mb-6" bordered headerBordered>
                                <ProForm.Item
                                    name="applyToAll"
                                    label="Phạm vi áp dụng"
                                    rules={[{ required: true, message: 'Vui lòng chọn phạm vi áp dụng!' }]}
                                >
                                    <ProFormRadio.Group
                                        options={[
                                            {
                                                label: 'Áp dụng cho toàn bộ xe điện',
                                                value: true
                                            },
                                            {
                                                label: 'Áp dụng cho xe cụ thể',
                                                value: false
                                            },
                                        ]}
                                        fieldProps={{
                                            onChange: (e) => {
                                                const value = e.target.value;
                                                const form = e.target.form;
                                                handleApplyToAllChange(value, form ? {
                                                    setFieldsValue: (values) => {
                                                        Object.entries(values).forEach(([key, val]) => {
                                                            const field = form.elements[key];
                                                            if (field) field.value = val || '';
                                                        });
                                                    }
                                                } : null);
                                            }
                                        }}
                                    />
                                </ProForm.Item>

                                <div className="mt-4">
                                    <ProForm.Item noStyle shouldUpdate>
                                        {(form) => {
                                            const applyToAllValue = form.getFieldValue('applyToAll');

                                            if (applyToAllValue === false) {
                                                return (
                                                    <Row gutter={24}>
                                                        <Col xs={24} md={12}>
                                                            <ProFormSelect
                                                                name="modelId"
                                                                label="Model xe điện"
                                                                placeholder="Chọn model xe điện"
                                                                options={getUniqueModels()}
                                                                rules={[
                                                                    { required: true, message: 'Vui lòng chọn model xe điện!' }
                                                                ]}
                                                                fieldProps={{
                                                                    showSearch: true,
                                                                    filterOption: (input, option) =>
                                                                        option?.label?.toLowerCase().includes(input.toLowerCase()),
                                                                    onChange: (value) => handleModelChange(value, form),
                                                                    className: 'rounded-lg'
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col xs={24} md={12}>
                                                            <ProFormSelect
                                                                name="versionId"
                                                                label="Phiên bản"
                                                                placeholder="Chọn phiên bản xe"
                                                                options={filteredVersions}
                                                                disabled={!selectedModel}
                                                                rules={[
                                                                    { required: true, message: 'Vui lòng chọn phiên bản xe!' }
                                                                ]}
                                                                fieldProps={{
                                                                    showSearch: true,
                                                                    filterOption: (input, option) =>
                                                                        option?.label?.toLowerCase().includes(input.toLowerCase()),
                                                                    className: 'rounded-lg'
                                                                }}
                                                            />
                                                        </Col>
                                                    </Row>
                                                );
                                            } else if (applyToAllValue === true) {
                                                return (
                                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                        <div className="flex items-center">
                                                            <InfoCircleOutlined className="text-blue-500 text-xl mr-2" />
                                                            <p className="text-blue-700 font-medium">
                                                                Khuyến mãi này sẽ áp dụng cho tất cả xe điện
                                                            </p>
                                                        </div>
                                                        <p className="text-blue-600 text-sm mt-2 ml-6">
                                                            Không cần chọn model hay phiên bản cụ thể
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    </ProForm.Item>
                                </div>
                            </ProCard>

                            <ProForm.Item noStyle shouldUpdate={() => {
                                // Luôn cập nhật khi bất kỳ trường nào thay đổi
                                return true;
                            }}>
                                {(form) => {
                                    // Kết hợp giá trị từ form và formValues để đảm bảo dữ liệu luôn mới nhất
                                    const currentValues = form.getFieldsValue();
                                    const combinedValues = { ...formValues, ...currentValues };
                                    return renderPromotionPreview(combinedValues);
                                }}
                            </ProForm.Item>
                        </StepsForm.StepForm>
                    </StepsForm>
                )}

                {/* Success Modal */}
                <SuccessModal
                    visible={showSuccessModal}
                    onClose={handleCloseSuccessModal}
                    onViewList={handleViewPromotionList}
                    onCreateAnother={handleCreateAnother}
                    promotionName={promotionName}
                />
            </PageContainer>
        </AdminLayout>
    );
}

export default CreateEVPromotion;
