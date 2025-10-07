import React, { useState } from 'react';
import { Card, Form, Input, Button, Tabs, Space, App, InputNumber } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import api from '../../../../api/api';

const Manageversion = () => {
    const [form] = Form.useForm();
    const [searchForm] = Form.useForm();
    const [updateForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [versionData, setVersionData] = useState(null);
    const [shouldRefresh, setShouldRefresh] = useState(false);
    const { message } = App.useApp();

    // Xử lý khi chuyển tab
    const handleTabChange = (activeKey) => {
        // Lưu tab hiện tại
        localStorage.setItem('currentVersionTab', activeKey);
        
        // Nếu chuyển sang tab search, set mặc định là search by name
        if (activeKey === '2') {
            localStorage.setItem('currentSearchTab', 'name');
        }

        // Nếu có dữ liệu version và đang chuyển sang tab update
        if (versionData && activeKey === '3') {
            localStorage.setItem('versionForUpdate', JSON.stringify(versionData));
        }

        // Chỉ reload khi chuyển từ Create sang Search hoặc ngược lại
        if ((activeKey === '2' && localStorage.getItem('currentVersionTab') === '1') ||
            (activeKey === '1' && localStorage.getItem('currentVersionTab') === '2')) {
            window.location.reload();
        }
    };


    // Kiểm tra và set dữ liệu khi load trang
    React.useEffect(() => {
        const savedTab = localStorage.getItem('currentVersionTab');
        const savedVersion = localStorage.getItem('versionForUpdate');

        if (savedVersion) {
            const parsedVersion = JSON.parse(savedVersion);
            setVersionData(parsedVersion);
            updateForm.setFieldsValue(parsedVersion);
            // Chỉ xóa dữ liệu sau khi đã load xong
            if (savedTab !== '3') {
                localStorage.removeItem('versionForUpdate');
            }
        }

        if (savedTab && savedTab !== '3') {
            localStorage.removeItem('currentVersionTab');
        }
    }, []);

    // Create Version
    // State để lưu tên version vừa tạo
    const [lastCreatedVersion, setLastCreatedVersion] = useState('');

    const handleCreateVersion = async (values) => {
        try {
            setLoading(true);
            const response = await api.post('ElectricVehicleVersion/create-version', values);
            
            if (response.data.isSuccess) {
                message.success({
                    content: `Tạo version ${values.versionName} thành công! Bạn có thể tìm kiếm để xem thông tin chi tiết.`,
                    duration: 3
                });
                form.resetFields();
                // Không tự động hiển thị kết quả nữa
                setLastCreatedVersion(values.versionName);
            } else {
                message.error(response.data.message || 'Lỗi khi tạo version');
            }
        } catch (error) {
            message.error('Lỗi khi tạo version: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Search Version by Name
    const handleSearchByName = async (values) => {
        if (!values.versionName?.trim()) {
            message.warning('Vui lòng nhập tên version cần tìm');
            return;
        }
        try {
            setLoading(true);
            // Log request URL for debugging
            const searchUrl = `ElectricVehicleVersion/get-version-by-name/${encodeURIComponent(values.versionName.trim())}`;
            console.log('Searching version with URL:', searchUrl);
            
            const response = await api.get(searchUrl);
            console.log('Search response:', response.data); // Log response for debugging
            
            if (response.data?.isSuccess && response.data.result) {
                setShouldRefresh(false);
                setVersionData(response.data.result);
                updateForm.setFieldsValue(response.data.result);
                message.success('Tìm thấy version');
            } else {
                message.warning(`Không tìm thấy version với tên "${values.versionName}"`);
                setVersionData(null);
                updateForm.resetFields();
            }
        } catch (error) {
            if (error.response?.status === 404) {
                message.warning(`Không tìm thấy version với tên "${values.versionName}"`);
            } else {
                message.error('Lỗi khi tìm kiếm: ' + (error.response?.data?.message || error.message));
            }
            setVersionData(null);
            updateForm.resetFields();
        } finally {
            setLoading(false);
        }
    };

    // Search Version by ID
    const handleSearchById = async (values) => {
        try {
            setLoading(true);
            const response = await api.get(`ElectricVehicleVersion/get-version-by-id/${values.id}`);
            if (response.data?.isSuccess && response.data.result) {
                setVersionData(response.data.result);
                updateForm.setFieldsValue(response.data.result);
                message.success('Tìm thấy version');
            } else {
                message.warning(`Không tìm thấy version với ID "${values.id}"`);
                setVersionData(null);
                updateForm.resetFields();
            }
        } catch (error) {
            message.error('Lỗi khi tìm kiếm: ' + error.message);
            setVersionData(null);
            updateForm.resetFields();
        } finally {
            setLoading(false);
        }
    };

    // Update Version
    const handleUpdateVersion = async (values) => {
        try {
            setLoading(true);
            
            // Đảm bảo có đủ thông tin cần thiết
            if (!values.id || !values.versionName || !values.description) {
                message.error('Vui lòng điền đầy đủ thông tin!');
                return;
            }

            const updateData = {
                versionName: values.versionName,
                motorPower: values.motorPower || 0,
                batteryCapacity: values.batteryCapacity || 0,
                rangePerCharge: values.rangePerCharge || 0,
                supplyStatus: values.supplyStatus || 0,
                topSpeed: values.topSpeed || 0,
                weight: values.weight || 0,
                height: values.height || 0,
                description: values.description
            };

            console.log('Cập nhật version với dữ liệu:', updateData);

            const response = await api.put(`ElectricVehicleVersion/update-version/${values.id}`, updateData);

            if (response.data?.isSuccess) {
                message.success('Cập nhật version thành công');
                // Cập nhật versionData và form
                setVersionData({ ...values });
                // Xóa dữ liệu trong localStorage
                localStorage.removeItem('versionForUpdate');
            } else {
                message.error(response.data?.message || 'Lỗi khi cập nhật version');
            }
        } catch (error) {
            console.error('Lỗi cập nhật:', error);
            message.error('Lỗi khi cập nhật version: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Delete Version
    const handleDeleteVersion = async (id) => {
        try {
            setLoading(true);
            const response = await api.delete(`ElectricVehicleVersion/delete-version/${id}`);
            if (response.data?.isSuccess) {
                message.success('Xóa version thành công');
                setVersionData(null);
                updateForm.resetFields();
            } else {
                message.error(response.data?.message || 'Lỗi khi xóa version');
            }
        } catch (error) {
            message.error('Lỗi khi xóa version: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const tabItems = [
        {
            key: '1',
            label: 'Tạo Version',
            children: (
                <Form form={form} layout="vertical" onFinish={handleCreateVersion}>
                    <Form.Item
                        name="modelId"
                        label="Model ID"
                        rules={[{ required: true, message: 'Vui lòng nhập Model ID!' }]}
                    >
                        <Input placeholder="Nhập Model ID (UUID)" />
                    </Form.Item>
                    <Form.Item
                        name="versionName"
                        label="Tên Version"
                        rules={[{ required: true, message: 'Vui lòng nhập tên version!' }]}
                    >
                        <Input placeholder="Nhập tên version" />
                    </Form.Item>
                    <Form.Item
                        name="motorPower"
                        label="Công suất động cơ (kW)"
                        rules={[{ required: true, message: 'Vui lòng nhập công suất động cơ!' }]}
                    >
                        <InputNumber 
                            placeholder="Nhập công suất động cơ" 
                            style={{ width: '100%' }}
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item
                        name="batteryCapacity"
                        label="Dung lượng pin (kWh)"
                        rules={[{ required: true, message: 'Vui lòng nhập dung lượng pin!' }]}
                    >
                        <InputNumber 
                            placeholder="Nhập dung lượng pin" 
                            style={{ width: '100%' }}
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item
                        name="rangePerCharge"
                        label="Tầm hoạt động (km)"
                        rules={[{ required: true, message: 'Vui lòng nhập tầm hoạt động!' }]}
                    >
                        <InputNumber 
                            placeholder="Nhập tầm hoạt động" 
                            style={{ width: '100%' }}
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item
                        name="supplyStatus"
                        label="Trạng thái cung cấp"
                        rules={[{ required: true, message: 'Vui lòng nhập trạng thái cung cấp!' }]}
                    >
                        <InputNumber 
                            placeholder="Nhập trạng thái cung cấp (0: Có sẵn, 1: Hết hàng, 2: Ngừng sản xuất)" 
                            style={{ width: '100%' }}
                            min={0}
                            max={2}
                        />
                    </Form.Item>
                    <Form.Item
                        name="topSpeed"
                        label="Tốc độ tối đa (km/h)"
                        rules={[{ required: true, message: 'Vui lòng nhập tốc độ tối đa!' }]}
                    >
                        <InputNumber 
                            placeholder="Nhập tốc độ tối đa" 
                            style={{ width: '100%' }}
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item
                        name="weight"
                        label="Trọng lượng (kg)"
                        rules={[{ required: true, message: 'Vui lòng nhập trọng lượng!' }]}
                    >
                        <InputNumber 
                            placeholder="Nhập trọng lượng" 
                            style={{ width: '100%' }}
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item
                        name="height"
                        label="Chiều cao (cm)"
                        rules={[{ required: true, message: 'Vui lòng nhập chiều cao!' }]}
                    >
                        <InputNumber 
                            placeholder="Nhập chiều cao" 
                            style={{ width: '100%' }}
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item
                        name="productionYear"
                        label="Năm sản xuất"
                        rules={[{ required: true, message: 'Vui lòng nhập năm sản xuất!' }]}
                    >
                        <InputNumber 
                            placeholder="Nhập năm sản xuất" 
                            style={{ width: '100%' }}
                            min={2000}
                            max={new Date().getFullYear() + 1}
                        />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả version!' }]}
                    >
                        <Input.TextArea placeholder="Nhập mô tả về version" rows={3} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Tạo Version
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
                            setVersionData(null);
                        }}
                        items={[
                            {
                                key: 'name',
                                label: 'Tìm theo tên',
                                children: (
                                    <Form form={searchForm} layout="vertical" onFinish={handleSearchByName}>
                                        <Form.Item
                                            name="versionName"
                                            label="Tên Version"
                                            rules={[{ required: true, message: 'Vui lòng nhập tên version!' }]}
                                        >
                                            <Input placeholder="Nhập tên version cần tìm" />
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
                                key: 'id',
                                label: 'Tìm theo ID',
                                children: (
                                    <Form form={searchForm} layout="vertical" onFinish={handleSearchById}>
                                        <Form.Item
                                            name="id"
                                            label="Version ID"
                                            rules={[{ required: true, message: 'Vui lòng nhập ID version!' }]}
                                        >
                                            <Input placeholder="Nhập ID version cần tìm" />
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
                    {versionData && (
                        <Card title="Kết quả tìm kiếm" style={{ marginTop: 16 }}>
                            <p><strong>ID:</strong> {versionData.id}</p>
                            <p><strong>Tên Version:</strong> {versionData.versionName}</p>
                            <p><strong>Model ID:</strong> {versionData.modelId}</p>
                            <p><strong>Công suất động cơ:</strong> {versionData.motorPower} kW</p>
                            <p><strong>Dung lượng pin:</strong> {versionData.batteryCapacity} kWh</p>
                            <p><strong>Tầm hoạt động:</strong> {versionData.rangePerCharge} km</p>
                            <p><strong>Trạng thái cung cấp:</strong> {
                                versionData.supplyStatus === 0 ? 'Có sẵn' :
                                versionData.supplyStatus === 1 ? 'Hết hàng' : 'Ngừng sản xuất'
                            }</p>
                            <p><strong>Tốc độ tối đa:</strong> {versionData.topSpeed} km/h</p>
                            <p><strong>Trọng lượng:</strong> {versionData.weight} kg</p>
                            <p><strong>Chiều cao:</strong> {versionData.height} cm</p>
                            <p><strong>Năm sản xuất:</strong> {versionData.productionYear}</p>
                            <p><strong>Mô tả:</strong> {versionData.description}</p>
                        </Card>
                    )}
                </>
            )
        },
        {
            key: '3',
            label: 'Cập nhật/Xóa',
            children: (
                <Form form={updateForm} layout="vertical" onFinish={handleUpdateVersion}>
                    <Form.Item
                        name="id"
                        label="Version ID"
                        rules={[{ required: true, message: 'Vui lòng nhập ID version!' }]}
                    >
                        <Input disabled={true} placeholder="ID version" />
                    </Form.Item>
                    <Form.Item
                        name="versionName"
                        label="Tên Version"
                        rules={[{ required: true, message: 'Vui lòng nhập tên version!' }]}
                    >
                        <Input disabled={!versionData} placeholder="Tên version mới" />
                    </Form.Item>
                    <Form.Item
                        name="motorPower"
                        label="Công suất động cơ (kW)"
                        rules={[{ required: true, message: 'Vui lòng nhập công suất động cơ!' }]}
                    >
                        <InputNumber 
                            disabled={!versionData}
                            placeholder="Nhập công suất động cơ" 
                            style={{ width: '100%' }}
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item
                        name="batteryCapacity"
                        label="Dung lượng pin (kWh)"
                        rules={[{ required: true, message: 'Vui lòng nhập dung lượng pin!' }]}
                    >
                        <InputNumber 
                            disabled={!versionData}
                            placeholder="Nhập dung lượng pin" 
                            style={{ width: '100%' }}
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item
                        name="rangePerCharge"
                        label="Tầm hoạt động (km)"
                        rules={[{ required: true, message: 'Vui lòng nhập tầm hoạt động!' }]}
                    >
                        <InputNumber 
                            disabled={!versionData}
                            placeholder="Nhập tầm hoạt động" 
                            style={{ width: '100%' }}
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item
                        name="supplyStatus"
                        label="Trạng thái cung cấp"
                        rules={[{ required: true, message: 'Vui lòng nhập trạng thái cung cấp!' }]}
                    >
                        <InputNumber 
                            disabled={!versionData}
                            placeholder="Nhập trạng thái cung cấp (0: Có sẵn, 1: Hết hàng, 2: Ngừng sản xuất)" 
                            style={{ width: '100%' }}
                            min={0}
                            max={2}
                        />
                    </Form.Item>
                    <Form.Item
                        name="topSpeed"
                        label="Tốc độ tối đa (km/h)"
                        rules={[{ required: true, message: 'Vui lòng nhập tốc độ tối đa!' }]}
                    >
                        <InputNumber 
                            disabled={!versionData}
                            placeholder="Nhập tốc độ tối đa" 
                            style={{ width: '100%' }}
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item
                        name="weight"
                        label="Trọng lượng (kg)"
                        rules={[{ required: true, message: 'Vui lòng nhập trọng lượng!' }]}
                    >
                        <InputNumber 
                            disabled={!versionData}
                            placeholder="Nhập trọng lượng" 
                            style={{ width: '100%' }}
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item
                        name="height"
                        label="Chiều cao (cm)"
                        rules={[{ required: true, message: 'Vui lòng nhập chiều cao!' }]}
                    >
                        <InputNumber 
                            disabled={!versionData}
                            placeholder="Nhập chiều cao" 
                            style={{ width: '100%' }}
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả version!' }]}
                    >
                        <Input.TextArea disabled={!versionData} placeholder="Nhập mô tả về version" rows={3} />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                disabled={!versionData}
                                loading={loading}
                            >
                                Cập nhật
                            </Button>
                            <Button
                                danger
                                onClick={() => handleDeleteVersion(versionData?.id)}
                                disabled={!versionData}
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
                        defaultActiveKey={localStorage.getItem('currentVersionTab') || '1'}
                        items={tabItems} 
                        onChange={handleTabChange}
                    />
                </Card>
            </PageContainer>
        </App>
    );
};

export default Manageversion;
