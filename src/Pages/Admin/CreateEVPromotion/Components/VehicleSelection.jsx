import React from 'react';
import { ProForm, ProFormSelect, ProFormDateTimePicker, ProFormRadio } from '@ant-design/pro-components';

function VehicleSelection({
    uniqueModels,
    filteredVersions,
    selectedModel,
    onModelChange,
    onApplyToAllChange
}) {
    return (
        <>
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
                    onChange: (value) => onApplyToAllChange(value),
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
                                    options={uniqueModels}
                                    rules={[
                                        { required: true, message: 'Vui lòng chọn model xe điện!' }
                                    ]}
                                    fieldProps={{
                                        showSearch: true,
                                        filterOption: (input, option) =>
                                            option?.label?.toLowerCase().includes(input.toLowerCase()),
                                        onChange: onModelChange,
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            showTime: { format: 'HH:mm' }
                        }}
                    />

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
                            showTime: { format: 'HH:mm' }
                        }}
                    />
                </div>
            </div>
        </>
    );
}

export default VehicleSelection;