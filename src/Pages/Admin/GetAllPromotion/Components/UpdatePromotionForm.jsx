import React, { useState, useEffect } from 'react';
import {
    ProForm,
    ProFormText,
    ProFormTextArea,
    ProFormDigit,
    ProFormSelect,
    ProFormDateTimePicker
} from '@ant-design/pro-components';
import { Modal, message, Spin } from 'antd';
import { updatePromotion } from '../../../../App/EVMAdmin/EVPromotion/UpdatePromotion';
import { getAllEVTemplates } from '../../../../App/EVMAdmin/EVPromotion/Layouts/GetAllEVTemplate';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

function UpdatePromotionForm({ visible, onCancel, onSuccess, promotionData }) {
    const [form] = ProForm.useForm();
    const [loading, setLoading] = useState(false);
    const [evTemplates, setEvTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [selectedModel, setSelectedModel] = useState(null);
    const [filteredVersions, setFilteredVersions] = useState([]);

    // Fetch EV Templates khi component mount
    useEffect(() => {
        if (visible) {
            fetchEVTemplates();

            // Pre-fill form với dữ liệu hiện tại
            if (promotionData) {
                const applyToAll = !promotionData.modelId && !promotionData.versionId;

                form.setFieldsValue({
                    name: promotionData.name,
                    description: promotionData.description,
                    discountType: promotionData.discountType,
                    percentage: promotionData.percentage,
                    fixedAmount: promotionData.fixedAmount,
                    applyToAll: applyToAll,
                    modelId: promotionData.modelId,
                    versionId: promotionData.versionId,
                    startDate: promotionData.startDate ? dayjs(promotionData.startDate) : null,
                    endDate: promotionData.endDate ? dayjs(promotionData.endDate) : null,
                    isActive: promotionData.isActive
                });

                // Set selected model để hiển thị versions
                if (promotionData.modelId) {
                    setSelectedModel(promotionData.modelId);
                }
            }
        }
    }, [visible, promotionData, form]);

    // Cập nhật filtered versions khi có templates và selected model
    useEffect(() => {
        if (selectedModel && evTemplates.length > 0) {
            const versions = getVersionsByModel(selectedModel);
            setFilteredVersions(versions);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedModel, evTemplates]);

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

    // Convert date object to ISO string
    const convertToISOString = (dateValue) => {
        if (!dateValue) return new Date().toISOString();

        console.log('Converting date:', dateValue, 'Type:', typeof dateValue);

        // Nếu là string với format DD/MM/YYYY HH:mm
        if (typeof dateValue === 'string' && dateValue.includes('/')) {
            try {
                // Parse format "DD/MM/YYYY HH:mm" thành dayjs object
                const dayjsDate = dayjs(dateValue, 'DD/MM/YYYY HH:mm');
                if (dayjsDate.isValid()) {
                    const isoString = dayjsDate.toISOString();
                    console.log('String DD/MM/YYYY parsed to ISO:', isoString);
                    return isoString;
                }
            } catch (error) {
                console.error('Error parsing DD/MM/YYYY format:', error);
            }
        }

        // Nếu là dayjs object
        if (dateValue && typeof dateValue.toISOString === 'function') {
            try {
                const isoString = dateValue.toISOString();
                console.log('Dayjs to ISO directly:', isoString);
                return isoString;
            } catch (error) {
                console.error('Error converting dayjs to ISO:', error);
            }
        }

        // Nếu là dayjs object với method format
        if (dateValue && typeof dateValue.format === 'function') {
            try {
                const isoString = dateValue.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
                console.log('Dayjs formatted to ISO:', isoString);
                return isoString;
            } catch (error) {
                console.error('Error converting dayjs format to ISO:', error);
            }
        }

        // Nếu là dayjs object với toDate method
        if (dateValue && typeof dateValue.toDate === 'function') {
            try {
                const convertedDate = dateValue.toDate();
                console.log('Dayjs converted to Date:', convertedDate);
                return convertedDate.toISOString();
            } catch (error) {
                console.error('Error converting dayjs to Date:', error);
            }
        }

        // Nếu là Date object
        if (dateValue instanceof Date) {
            try {
                if (isNaN(dateValue.getTime())) {
                    throw new Error('Invalid Date object');
                }
                console.log('Date object to ISO:', dateValue.toISOString());
                return dateValue.toISOString();
            } catch (error) {
                console.error('Error converting Date to ISO:', error);
            }
        }

        // Nếu là string khác, thử parse bình thường
        if (typeof dateValue === 'string') {
            try {
                const parsedDate = new Date(dateValue);
                if (isNaN(parsedDate.getTime())) {
                    throw new Error('Invalid date string');
                }
                console.log('String parsed to Date:', parsedDate.toISOString());
                return parsedDate.toISOString();
            } catch (error) {
                console.error('Error converting date string:', error);
            }
        }

        // Fallback: return current date
        console.log('Using fallback current date');
        return new Date().toISOString();
    };

    // Xử lý submit form
    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            console.log('Form values:', values);

            // Convert dates và validate
            const startDateISO = convertToISOString(values.startDate);
            const endDateISO = convertToISOString(values.endDate);

            // Validate dates
            const startDateObj = new Date(startDateISO);
            const endDateObj = new Date(endDateISO);
            const nowObj = new Date();

            // Validate start date < end date
            if (startDateObj >= endDateObj) {
                message.error('Ngày bắt đầu phải trước ngày kết thúc!');
                return;
            }

            // Validate cả 2 ngày phải trong tương lai
            if (startDateObj <= nowObj) {
                message.error('Ngày bắt đầu phải là thời điểm trong tương lai!');
                return;
            }

            if (endDateObj <= nowObj) {
                message.error('Ngày kết thúc phải là thời điểm trong tương lai!');
                return;
            }

            console.log('Start Date:', startDateISO);
            console.log('End Date:', endDateISO);
            console.log('Validation passed - Start < End:', startDateObj < endDateObj);

            // Chuẩn bị dữ liệu gửi API theo đúng format yêu cầu
            const promotionUpdateData = {
                name: String(values.name || ''),
                description: String(values.description || ''),
                percentage: values.discountType === 1 ? Number(values.percentage || 0) : 0,
                fixedAmount: values.discountType === 0 ? Number(values.fixedAmount || 0) : 0,
                modelId: values.applyToAll ? null : (values.modelId || null),
                versionId: values.applyToAll ? null : (values.versionId || null),
                discountType: Number(values.discountType),
                startDate: startDateISO,
                endDate: endDateISO,
                createdAt: promotionData?.createdAt || new Date().toISOString(),
                isActive: Boolean(values.isActive !== undefined ? values.isActive : true)
            };

            console.log('Promotion data to send:', promotionUpdateData);
            console.log('Promotion ID:', promotionData?.promotionId || promotionData?.id);

            // Lấy promotionId từ data (có thể là promotionId hoặc id)
            const promotionId = promotionData?.promotionId || promotionData?.id;

            if (!promotionId) {
                throw new Error('Không tìm thấy ID của khuyến mãi');
            }

            const response = await updatePromotion(promotionId, promotionUpdateData);

            if (response) {
                message.success('Cập nhật khuyến mãi thành công!');
                form.resetFields();
                onSuccess();
                onCancel();
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật khuyến mãi:', error);

            // Hiển thị lỗi chi tiết từ API
            if (error.response && error.response.data && error.response.data.message) {
                message.error(`Lỗi: ${error.response.data.message}`);
            } else if (error.message) {
                message.error(`Lỗi: ${error.message}`);
            } else {
                message.error('Có lỗi xảy ra khi cập nhật khuyến mãi');
            }
        } finally {
            setLoading(false);
        }
    };

    // Xử lý đóng modal
    const handleCancel = () => {
        form.resetFields();
        setSelectedModel(null);
        setFilteredVersions([]);
        onCancel();
    };

    return (
        <Modal
            title="Cập Nhật Khuyến Mãi"
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={800}
            destroyOnClose
            className="update-promotion-modal"
        >
            <Spin spinning={loadingTemplates} tip="Đang tải dữ liệu...">
                <ProForm
                    form={form}
                    onFinish={handleSubmit}
                    layout="vertical"
                    submitter={{
                        searchConfig: {
                            resetText: 'Hủy',
                            submitText: 'Cập nhật',
                        },
                        resetButtonProps: {
                            onClick: handleCancel,
                        },
                        submitButtonProps: {
                            loading: loading,
                            className: 'bg-blue-500 hover:bg-blue-600',
                        },
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

                        {/* Xe điện áp dụng và thời gian */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Xe điện áp dụng
                            </h3>

                            <ProFormSelect
                                name="applyToAll"
                                label="Phạm vi áp dụng"
                                placeholder="Chọn phạm vi áp dụng khuyến mãi"
                                options={[
                                    { label: 'Áp dụng cho xe cụ thể', value: false },
                                    { label: 'Áp dụng cho toàn bộ xe điện', value: true }
                                ]}
                                rules={[
                                    { required: true, message: 'Vui lòng chọn phạm vi áp dụng!' }
                                ]}
                                fieldProps={{
                                    onChange: (value) => handleApplyToAllChange(value),
                                    className: 'rounded-lg'
                                }}
                            />

                            <ProForm.Item noStyle shouldUpdate>
                                {(form) => {
                                    const applyToAllValue = form.getFieldValue('applyToAll');

                                    if (applyToAllValue === false) {
                                        return (
                                            <>
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
                                                        onChange: handleModelChange,
                                                        className: 'rounded-lg'
                                                    }}
                                                />

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
                                            </>
                                        );
                                    } else if (applyToAllValue === true) {
                                        return (
                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-blue-700 font-medium">
                                                    🎯 Khuyến mãi này sẽ áp dụng cho tất cả xe điện
                                                </p>
                                                <p className="text-blue-600 text-sm mt-1">
                                                    Không cần chọn model hay phiên bản cụ thể
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            </ProForm.Item>

                            <div className="mt-6">
                                <h4 className="text-md font-medium text-gray-700 mb-3">
                                    Thời gian áp dụng
                                </h4>

                                <div className="grid grid-cols-1 gap-4">
                                    <ProFormDateTimePicker
                                        name="startDate"
                                        label="Ngày bắt đầu"
                                        placeholder="Chọn ngày bắt đầu"
                                        rules={[
                                            { required: true, message: 'Vui lòng chọn ngày bắt đầu!' },
                                            {
                                                validator(_, value) {
                                                    if (!value) return Promise.resolve();
                                                    const now = dayjs();
                                                    if (value.isAfter(now)) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Ngày bắt đầu phải là thời điểm trong tương lai!'));
                                                },
                                            }
                                        ]}
                                        fieldProps={{
                                            className: 'rounded-lg w-full',
                                            format: 'DD/MM/YYYY HH:mm',
                                            showTime: { format: 'HH:mm' },
                                            disabledDate: (current) => {
                                                // Disable tất cả ngày trong quá khứ
                                                return current && current < dayjs().startOf('day');
                                            },
                                            disabledTime: (current) => {
                                                // Nếu là ngày hôm nay, disable giờ trong quá khứ
                                                if (current && current.isSame(dayjs(), 'day')) {
                                                    const now = dayjs();
                                                    return {
                                                        disabledHours: () => {
                                                            const hours = [];
                                                            for (let i = 0; i < now.hour(); i++) {
                                                                hours.push(i);
                                                            }
                                                            return hours;
                                                        },
                                                        disabledMinutes: (hour) => {
                                                            if (hour === now.hour()) {
                                                                const minutes = [];
                                                                for (let i = 0; i <= now.minute(); i++) {
                                                                    minutes.push(i);
                                                                }
                                                                return minutes;
                                                            }
                                                            return [];
                                                        }
                                                    };
                                                }
                                                return {};
                                            }
                                        }}
                                    />

                                    <ProFormDateTimePicker
                                        name="endDate"
                                        label="Ngày kết thúc"
                                        placeholder="Chọn ngày kết thúc"
                                        rules={[
                                            { required: true, message: 'Vui lòng chọn ngày kết thúc!' },
                                            {
                                                validator(_, value) {
                                                    if (!value) return Promise.resolve();
                                                    const now = dayjs();
                                                    if (value.isAfter(now)) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Ngày kết thúc phải là thời điểm trong tương lai!'));
                                                },
                                            },
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
                                            disabledDate: (current) => {
                                                // Disable tất cả ngày trong quá khứ
                                                return current && current < dayjs().startOf('day');
                                            },
                                            disabledTime: (current) => {
                                                // Nếu là ngày hôm nay, disable giờ trong quá khứ
                                                if (current && current.isSame(dayjs(), 'day')) {
                                                    const now = dayjs();
                                                    return {
                                                        disabledHours: () => {
                                                            const hours = [];
                                                            for (let i = 0; i < now.hour(); i++) {
                                                                hours.push(i);
                                                            }
                                                            return hours;
                                                        },
                                                        disabledMinutes: (hour) => {
                                                            if (hour === now.hour()) {
                                                                const minutes = [];
                                                                for (let i = 0; i <= now.minute(); i++) {
                                                                    minutes.push(i);
                                                                }
                                                                return minutes;
                                                            }
                                                            return [];
                                                        }
                                                    };
                                                }
                                                return {};
                                            }
                                        }}
                                    />
                                </div>

                                <div className="mt-4">
                                    <ProFormSelect
                                        name="isActive"
                                        label="Trạng thái"
                                        placeholder="Chọn trạng thái khuyến mãi"
                                        options={[
                                            { value: true, label: 'Kích hoạt' },
                                            { value: false, label: 'Tạm dừng' }
                                        ]}
                                        fieldProps={{
                                            className: 'rounded-lg'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </ProForm>
            </Spin>
        </Modal>
    );
}

export default UpdatePromotionForm;
