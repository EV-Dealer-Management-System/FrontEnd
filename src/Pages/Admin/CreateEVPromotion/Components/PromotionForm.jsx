import React from 'react';
import { ProForm, ProFormText, ProFormTextArea, ProFormSelect, ProFormDigit } from '@ant-design/pro-components';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

function PromotionForm({ form, loading, onSubmit }) {
    return (
        <ProForm
            form={form}
            onFinish={onSubmit}
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

                {/* Placeholder cho Vehicle Selection - sẽ được render từ component cha */}
                <div className="space-y-4">
                    {/* Content sẽ được truyền vào từ parent component */}
                </div>
            </div>
        </ProForm>
    );
}

export default PromotionForm;