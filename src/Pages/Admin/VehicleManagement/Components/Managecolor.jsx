import React, { useState } from 'react';
import { Card, Form, Input, Button, Tabs, Space, App, InputNumber, Select } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import api from '../../../../api/api';

// Danh sách màu phổ biến
const commonColors = [
    { label: 'Đỏ', value: '#FF0000' },
    { label: 'Xanh lá', value: '#00FF00' },
    { label: 'Xanh dương', value: '#0000FF' },
    { label: 'Trắng', value: '#FFFFFF' },
    { label: 'Đen', value: '#000000' },
    { label: 'Vàng', value: '#FFFF00' },
    { label: 'Xanh cyan', value: '#00FFFF' },
    { label: 'Tím', value: '#800080' },
    { label: 'Cam', value: '#FFA500' },
    { label: 'Hồng', value: '#FFC0CB' },
    { label: 'Xám', value: '#808080' },
    { label: 'Nâu', value: '#A52A2A' }
];

const Managecolor = () => {
    const [form] = Form.useForm();
    const [searchForm] = Form.useForm();
    const [updateForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [colorData, setColorData] = useState(null);
    const [shouldRefresh, setShouldRefresh] = useState(false);
    const { message } = App.useApp();

    // Xử lý khi chuyển tab
    const handleTabChange = (activeKey) => {
        // Lưu tab hiện tại
        localStorage.setItem('currentColorTab', activeKey);
        
        // Nếu chuyển sang tab search, set mặc định là search by name
        if (activeKey === '2') {
            localStorage.setItem('currentSearchTab', 'name');
        }

        // Nếu có dữ liệu color và đang chuyển sang tab update
        if (colorData && activeKey === '3') {
            localStorage.setItem('colorForUpdate', JSON.stringify(colorData));
        }

        // Chỉ reload khi chuyển từ Create sang Search hoặc ngược lại
        if ((activeKey === '2' && localStorage.getItem('currentColorTab') === '1') ||
            (activeKey === '1' && localStorage.getItem('currentColorTab') === '2')) {
            window.location.reload();
        }
    };

    // Kiểm tra và set dữ liệu khi load trang
    React.useEffect(() => {
        const savedTab = localStorage.getItem('currentColorTab');
        const savedColor = localStorage.getItem('colorForUpdate');

        if (savedColor) {
            const parsedColor = JSON.parse(savedColor);
            setColorData(parsedColor);
            updateForm.setFieldsValue(parsedColor);
            // Chỉ xóa dữ liệu sau khi đã load xong
            if (savedTab !== '3') {
                localStorage.removeItem('colorForUpdate');
            }
        }

        if (savedTab && savedTab !== '3') {
            localStorage.removeItem('currentColorTab');
        }
    }, []);

    // Create Color
    // State để lưu tên color vừa tạo
    const [lastCreatedColor, setLastCreatedColor] = useState('');

    const handleCreateColor = async (values) => {
        try {
            setLoading(true);
            const response = await api.post('ElectricVehicleColor/create-color', values);
            
            if (response.data.isSuccess) {
                message.success({
                    content: `Tạo màu ${values.colorName} thành công! Bạn có thể tìm kiếm để xem thông tin chi tiết.`,
                    duration: 3
                });
                form.resetFields();
                // Không tự động hiển thị kết quả nữa
                setLastCreatedColor(values.colorName);
            } else {
                message.error(response.data.message || 'Lỗi khi tạo màu');
            }
        } catch (error) {
            message.error('Lỗi khi tạo màu: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Search Color by Name
    const handleSearchByName = async (values) => {
        if (!values.colorName?.trim()) {
            message.warning('Vui lòng nhập tên màu cần tìm');
            return;
        }
        try {
            setLoading(true);
            // Log request URL for debugging
            const searchUrl = `ElectricVehicleColor/get-color-by-name/${encodeURIComponent(values.colorName.trim())}`;
            console.log('Searching color with URL:', searchUrl);
            
            const response = await api.get(searchUrl);
            console.log('Search response:', response.data); // Log response for debugging
            
            if (response.data?.isSuccess && response.data.result) {
                setShouldRefresh(false);
                setColorData(response.data.result);
                updateForm.setFieldsValue(response.data.result);
                message.success('Tìm thấy màu');
            } else {
                message.warning(`Không tìm thấy màu với tên "${values.colorName}"`);
                setColorData(null);
                updateForm.resetFields();
            }
        } catch (error) {
            if (error.response?.status === 404) {
                message.warning(`Không tìm thấy màu với tên "${values.colorName}"`);
            } else {
                message.error('Lỗi khi tìm kiếm: ' + (error.response?.data?.message || error.message));
            }
            setColorData(null);
            updateForm.resetFields();
        } finally {
            setLoading(false);
        }
    };

    // Search Color by Code
    const handleSearchByCode = async (values) => {
        try {
            setLoading(true);
            const response = await api.get(`ElectricVehicleColor/get-color-by-code/${values.colorCode}`);
            if (response.data?.isSuccess && response.data.result) {
                setColorData(response.data.result);
                updateForm.setFieldsValue(response.data.result);
                message.success('Tìm thấy màu');
            } else {
                message.warning(`Không tìm thấy màu với mã "${values.colorCode}"`);
                setColorData(null);
                updateForm.resetFields();
            }
        } catch (error) {
            message.error('Lỗi khi tìm kiếm: ' + error.message);
            setColorData(null);
            updateForm.resetFields();
        } finally {
            setLoading(false);
        }
    };

    // Update Color
    const handleUpdateColor = async (values) => {
        try {
            setLoading(true);
            
            // Log chi tiết values để debug
            console.log('=== UPDATE COLOR DEBUG ===');
            console.log('Form values:', values);
            console.log('Color ID:', values.id);
            console.log('Color Name:', values.colorName);
            console.log('Color Code:', values.colorCode);
            console.log('Extra Cost:', values.extraCost);
            
            // Đảm bảo có đủ thông tin cần thiết
            if (!values.id || !values.colorName || !values.colorCode) {
                message.error('Vui lòng điền đầy đủ thông tin!');
                return;
            }

            // Xử lý extraCost - đảm bảo là number
            let extraCostValue = 0;
            if (values.extraCost !== undefined && values.extraCost !== null) {
                extraCostValue = typeof values.extraCost === 'string' ? 
                    parseFloat(values.extraCost.replace(/,/g, '')) || 0 : 
                    Number(values.extraCost) || 0;
            }

            const updateData = {
                colorName: values.colorName.trim(),
                colorCode: values.colorCode.trim(),
                extraCost: extraCostValue
            };

            console.log('Update data being sent:', updateData);
            console.log('API URL:', `ElectricVehicleColor/update-color/${values.id}`);

            const response = await api.put(`ElectricVehicleColor/update-color/${values.id}`, updateData);

            console.log('Update response:', response.data);

            if (response.data?.isSuccess) {
                message.success('Cập nhật màu thành công');
                // Cập nhật colorData và form
                setColorData({ ...values });
                // Xóa dữ liệu trong localStorage
                localStorage.removeItem('colorForUpdate');
            } else {
                console.log('Server returned error:', response.data);
                message.error(response.data?.message || 'Lỗi khi cập nhật màu');
            }
        } catch (error) {
            console.error('=== UPDATE COLOR ERROR ===');
            console.error('Error object:', error);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            console.error('Error headers:', error.response?.headers);
            
            if (error.response?.status === 400) {
                message.error('Lỗi 400 - Dữ liệu không hợp lệ: ' + (error.response?.data?.message || JSON.stringify(error.response?.data)));
            } else if (error.response?.data?.message) {
                message.error('Lỗi khi cập nhật màu: ' + error.response.data.message);
            } else {
                message.error('Lỗi khi cập nhật màu: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // Delete Color
    const handleDeleteColor = async (id) => {
        try {
            setLoading(true);
            const response = await api.delete(`ElectricVehicleColor/delete-color/${id}`);
            if (response.data?.isSuccess) {
                message.success('Xóa màu thành công');
                setColorData(null);
                updateForm.resetFields();
            } else {
                message.error(response.data?.message || 'Lỗi khi xóa màu');
            }
        } catch (error) {
            message.error('Lỗi khi xóa màu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const tabItems = [
        {
            key: '1',
            label: 'Tạo Màu',
            children: (
                <Form form={form} layout="vertical" onFinish={handleCreateColor}>
                    <Form.Item
                        name="colorName"
                        label="Tên Màu"
                        rules={[{ required: true, message: 'Vui lòng nhập tên màu!' }]}
                    >
                        <Input placeholder="Nhập tên màu" />
                    </Form.Item>
                    <Form.Item
                        name="colorCode"
                        label="Mã Màu (Hex Code)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã màu!' },
                            { pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Mã màu phải có định dạng hex (#FFFFFF)!' }
                        ]}
                    >
                        <Input.Group compact>
                            <Select
                                placeholder="Chọn màu phổ biến"
                                style={{ width: '40%' }}
                                onChange={(value) => form.setFieldValue('colorCode', value)}
                                options={commonColors.map(color => ({
                                    label: (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div 
                                                style={{ 
                                                    width: 16, 
                                                    height: 16, 
                                                    backgroundColor: color.value, 
                                                    marginRight: 8,
                                                    border: '1px solid #d9d9d9'
                                                }}
                                            />
                                            {color.label}
                                        </div>
                                    ),
                                    value: color.value
                                }))}
                            />
                            <Input 
                                placeholder="Hoặc nhập mã hex (ví dụ: #FFFFFF)" 
                                maxLength={7}
                                style={{ width: '60%', fontFamily: 'monospace' }}
                            />
                        </Input.Group>
                    </Form.Item>
                    <Form.Item
                        name="extraCost"
                        label="Phí bổ sung"
                        rules={[
                            { required: true, message: 'Vui lòng nhập phí bổ sung!' },
                            { type: 'number', message: 'Phí bổ sung phải là số!' }
                        ]}
                    >
                        <InputNumber 
                            placeholder="Nhập phí bổ sung (VNĐ)" 
                            style={{ width: '100%' }}
                            min={0}
                            step={1000}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Tạo Màu
                        </Button>
                    </Form.Item>
                </Form>
            )
        },
        {
            key: '2',
            label: 'Tìm Kiếm',
            children: (
                <>
                    <Tabs
                        defaultActiveKey={localStorage.getItem('currentSearchTab') || 'name'}
                        onChange={(key) => {
                            localStorage.setItem('currentSearchTab', key);
                            searchForm.resetFields();
                            setColorData(null);
                        }}
                        items={[
                            {
                                key: 'name',
                                label: 'Tìm theo tên',
                                children: (
                                    <Form form={searchForm} layout="vertical" onFinish={handleSearchByName}>
                                        <Form.Item
                                            name="colorName"
                                            label="Tên Màu"
                                            rules={[{ required: true, message: 'Vui lòng nhập tên màu!' }]}
                                        >
                                            <Input placeholder="Nhập tên màu cần tìm" />
                                        </Form.Item>
                                        <Form.Item>
                                            <Button type="primary" htmlType="submit" loading={loading}>
                                                Tìm Kiếm
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                )
                            },
                            {
                                key: 'code',
                                label: 'Tìm theo mã màu',
                                children: (
                                    <Form form={searchForm} layout="vertical" onFinish={handleSearchByCode}>
                                        <Form.Item
                                            name="colorCode"
                                            label="Mã Màu"
                                            rules={[{ required: true, message: 'Vui lòng nhập mã màu!' }]}
                                        >
                                            <Input placeholder="Nhập mã màu cần tìm" />
                                        </Form.Item>
                                        <Form.Item>
                                            <Button type="primary" htmlType="submit" loading={loading}>
                                                Tìm Kiếm
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                )
                            }
                        ]}
                    />
                    {colorData && (
                        <Card title="Kết quả tìm kiếm" style={{ marginTop: 16 }}>
                            <p><strong>ID:</strong> {colorData.id}</p>
                            <p><strong>Tên Màu:</strong> {colorData.colorName}</p>
                            <p>
                                <strong>Mã Màu:</strong> 
                                <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                                    <div 
                                        style={{ 
                                            width: 24, 
                                            height: 24, 
                                            backgroundColor: colorData.colorCode, 
                                            marginRight: 12,
                                            border: '1px solid #d9d9d9',
                                            borderRadius: 4
                                        }}
                                    />
                                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                        {colorData.colorCode}
                                    </span>
                                </div>
                            </p>
                            <p><strong>Phí bổ sung:</strong> {colorData.extraCost ? colorData.extraCost.toLocaleString('vi-VN') + ' VNĐ' : '0 VNĐ'}</p>
                        </Card>
                    )}
                </>
            )
        },
        {
            key: '3',
            label: 'Cập nhật/Xóa',
            children: (
                <Form form={updateForm} layout="vertical" onFinish={handleUpdateColor}>
                    <Form.Item
                        name="id"
                        label="Color ID"
                        rules={[{ required: true, message: 'Vui lòng nhập ID màu!' }]}
                    >
                        <Input disabled={true} placeholder="ID màu" />
                    </Form.Item>
                    <Form.Item
                        name="colorName"
                        label="Tên Màu"
                        rules={[{ required: true, message: 'Vui lòng nhập tên màu!' }]}
                    >
                        <Input disabled={!colorData} placeholder="Tên màu mới" />
                    </Form.Item>
                    <Form.Item
                        name="colorCode"
                        label="Mã Màu (Hex Code)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã màu!' },
                            { pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Mã màu phải có định dạng hex (#FFFFFF)!' }
                        ]}
                    >
                        <Input.Group compact>
                            <Select
                                disabled={!colorData}
                                placeholder="Chọn màu phổ biến"
                                style={{ width: '40%' }}
                                onChange={(value) => updateForm.setFieldValue('colorCode', value)}
                                options={commonColors.map(color => ({
                                    label: (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div 
                                                style={{ 
                                                    width: 16, 
                                                    height: 16, 
                                                    backgroundColor: color.value, 
                                                    marginRight: 8,
                                                    border: '1px solid #d9d9d9'
                                                }}
                                            />
                                            {color.label}
                                        </div>
                                    ),
                                    value: color.value
                                }))}
                            />
                            <Input 
                                disabled={!colorData}
                                placeholder="Hoặc nhập mã hex (ví dụ: #FFFFFF)" 
                                maxLength={7}
                                style={{ width: '60%', fontFamily: 'monospace' }}
                            />
                        </Input.Group>
                    </Form.Item>
                    <Form.Item
                        name="extraCost"
                        label="Phí bổ sung"
                        rules={[
                            { required: true, message: 'Vui lòng nhập phí bổ sung!' },
                            { type: 'number', message: 'Phí bổ sung phải là số!' }
                        ]}
                    >
                        <InputNumber 
                            disabled={!colorData}
                            placeholder="Nhập phí bổ sung (VNĐ)" 
                            style={{ width: '100%' }}
                            min={0}
                            step={1000}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                disabled={!colorData}
                                loading={loading}
                            >
                                Cập nhật
                            </Button>
                            <Button
                                danger
                                onClick={() => handleDeleteColor(colorData?.id)}
                                disabled={!colorData}
                                loading={loading}
                            >
                                Xóa
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            )
        }
    ];

    return (
        <App>
            <PageContainer>
                <Card>
                    <Tabs 
                        defaultActiveKey={localStorage.getItem('currentColorTab') || '1'}
                        items={tabItems} 
                        onChange={handleTabChange}
                    />
                </Card>
            </PageContainer>
        </App>
    );
};

export default Managecolor;
