import React, { useState } from 'react';
import { Card, Form, Input, Button, Tabs, Space, App } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import api from '../../../../api/api';

const Managemodel = () => {
    const [form] = Form.useForm();
    const [searchForm] = Form.useForm();
    const [updateForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [modelData, setModelData] = useState(null);
    const [shouldRefresh, setShouldRefresh] = useState(false);
    const { message } = App.useApp();

    // Xử lý khi chuyển tab
    const handleTabChange = (activeKey) => {
        // Lưu tab hiện tại
        localStorage.setItem('currentModelTab', activeKey);
        
        // Nếu chuyển sang tab search, set mặc định là search by name
        if (activeKey === '2') {
            localStorage.setItem('currentSearchTab', 'name');
        }

        // Nếu có dữ liệu model và đang chuyển sang tab update
        if (modelData && activeKey === '3') {
            localStorage.setItem('modelForUpdate', JSON.stringify(modelData));
        }

        // Chỉ reload khi chuyển từ Create sang Search hoặc ngược lại
        if ((activeKey === '2' && localStorage.getItem('currentModelTab') === '1') ||
            (activeKey === '1' && localStorage.getItem('currentModelTab') === '2')) {
            window.location.reload();
        }
    };

    // Kiểm tra và set dữ liệu khi load trang
    React.useEffect(() => {
        const savedTab = localStorage.getItem('currentModelTab');
        const savedModel = localStorage.getItem('modelForUpdate');

        if (savedModel) {
            const parsedModel = JSON.parse(savedModel);
            setModelData(parsedModel);
            updateForm.setFieldsValue(parsedModel);
            // Chỉ xóa dữ liệu sau khi đã load xong
            if (savedTab !== '3') {
                localStorage.removeItem('modelForUpdate');
            }
        }

        if (savedTab && savedTab !== '3') {
            localStorage.removeItem('currentModelTab');
        }
    }, []);

    // Create Model
    // State để lưu tên model vừa tạo
    const [lastCreatedModel, setLastCreatedModel] = useState('');

    const handleCreateModel = async (values) => {
        try {
            setLoading(true);
            const response = await api.post('ElectricVehicleModel/create-model', values);
            
            if (response.data.isSuccess) {
                message.success({
                    content: `Tạo model ${values.modelName} thành công! Bạn có thể tìm kiếm để xem thông tin chi tiết.`,
                    duration: 3
                });
                form.resetFields();
                // Không tự động hiển thị kết quả nữa
                setLastCreatedModel(values.modelName);
            } else {
                message.error(response.data.message || 'Lỗi khi tạo model');
            }
        } catch (error) {
            message.error('Lỗi khi tạo model: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Search Model by Name
    const handleSearchByName = async (values) => {
        if (!values.modelName?.trim()) {
            message.warning('Vui lòng nhập tên model cần tìm');
            return;
        }
        try {
            setLoading(true);
            // Log request URL for debugging
            const searchUrl = `ElectricVehicleModel/get-model-by-name/${encodeURIComponent(values.modelName.trim())}`;
            console.log('Searching model with URL:', searchUrl);
            
            const response = await api.get(searchUrl);
            console.log('Search response:', response.data); // Log response for debugging
            
            if (response.data?.isSuccess && response.data.result) {
                setShouldRefresh(false);
                setModelData(response.data.result);
                updateForm.setFieldsValue(response.data.result);
                message.success('Tìm thấy model');
            } else {
                message.warning(`Không tìm thấy model với tên "${values.modelName}"`);
                setModelData(null);
                updateForm.resetFields();
            }
        } catch (error) {
            if (error.response?.status === 404) {
                message.warning(`Không tìm thấy model với tên "${values.modelName}"`);
            } else {
                message.error('Lỗi khi tìm kiếm: ' + (error.response?.data?.message || error.message));
            }
            setModelData(null);
            updateForm.resetFields();
        } finally {
            setLoading(false);
        }
    };

    // Search Model by ID
    const handleSearchById = async (values) => {
        try {
            setLoading(true);
            const response = await api.get(`ElectricVehicleModel/get-model-by-id/${values.id}`);
            if (response.data?.isSuccess && response.data.result) {
                setModelData(response.data.result);
                updateForm.setFieldsValue(response.data.result);
                message.success('Tìm thấy model');
            } else {
                message.warning(`Không tìm thấy model với ID "${values.id}"`);
                setModelData(null);
                updateForm.resetFields();
            }
        } catch (error) {
            message.error('Lỗi khi tìm kiếm: ' + error.message);
            setModelData(null);
            updateForm.resetFields();
        } finally {
            setLoading(false);
        }
    };

    // Update Model
    const handleUpdateModel = async (values) => {
        try {
            setLoading(true);
            
            // Đảm bảo có đủ thông tin cần thiết
            if (!values.id || !values.modelName || !values.description) {
                message.error('Vui lòng điền đầy đủ thông tin!');
                return;
            }

            const updateData = {
                modelName: values.modelName,
                description: values.description
            };

            console.log('Cập nhật model với dữ liệu:', updateData);

            const response = await api.put(`ElectricVehicleModel/update-model/${values.id}`, updateData);

            if (response.data?.isSuccess) {
                message.success('Cập nhật model thành công');
                // Cập nhật modelData và form
                setModelData({ ...values });
                // Xóa dữ liệu trong localStorage
                localStorage.removeItem('modelForUpdate');
            } else {
                message.error(response.data?.message || 'Lỗi khi cập nhật model');
            }
        } catch (error) {
            console.error('Lỗi cập nhật:', error);
            message.error('Lỗi khi cập nhật model: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Delete Model
    const handleDeleteModel = async (id) => {
        try {
            setLoading(true);
            const response = await api.delete(`ElectricVehicleModel/delete-model/${id}`);
            if (response.data?.isSuccess) {
                message.success('Xóa model thành công');
                setModelData(null);
                updateForm.resetFields();
            } else {
                message.error(response.data?.message || 'Lỗi khi xóa model');
            }
        } catch (error) {
            message.error('Lỗi khi xóa model: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const tabItems = [
        {
            key: '1',
            label: 'Tạo Model',
            children: (
                <Form form={form} layout="vertical" onFinish={handleCreateModel}>
                    <Form.Item
                        name="modelName"
                        label="Tên Model"
                        rules={[{ required: true, message: 'Vui lòng nhập tên model!' }]}
                    >
                        <Input placeholder="Nhập tên model" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả model!' }]}
                    >
                        <Input.TextArea placeholder="Nhập mô tả về model" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Tạo Model
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
                            setModelData(null);
                        }}
                        items={[
                            {
                                key: 'name',
                                label: 'Tìm theo tên',
                                children: (
                                    <Form form={searchForm} layout="vertical" onFinish={handleSearchByName}>
                                        <Form.Item
                                            name="modelName"
                                            label="Tên Model"
                                            rules={[{ required: true, message: 'Vui lòng nhập tên model!' }]}
                                        >
                                            <Input placeholder="Nhập tên model cần tìm" />
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
                                            label="Model ID"
                                            rules={[{ required: true, message: 'Vui lòng nhập ID model!' }]}
                                        >
                                            <Input placeholder="Nhập ID model cần tìm" />
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
                    {modelData && (
                        <Card title="Kết quả tìm kiếm" style={{ marginTop: 16 }}>
                            <p><strong>ID:</strong> {modelData.id}</p>
                            <p><strong>Tên Model:</strong> {modelData.modelName}</p>
                            <p><strong>Mô tả:</strong> {modelData.description}</p>
                        </Card>
                    )}
                </>
            )
        },
        {
            key: '3',
            label: 'Cập nhật/Xóa',
            children: (
                <Form form={updateForm} layout="vertical" onFinish={handleUpdateModel}>
                    <Form.Item
                        name="id"
                        label="Model ID"
                        rules={[{ required: true, message: 'Vui lòng nhập ID model!' }]}
                    >
                        <Input disabled={true} placeholder="ID model" />
                    </Form.Item>
                    <Form.Item
                        name="modelName"
                        label="Tên Model"
                        rules={[{ required: true, message: 'Vui lòng nhập tên model!' }]}
                    >
                        <Input disabled={!modelData} placeholder="Tên model mới" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả model!' }]}
                    >
                        <Input.TextArea disabled={!modelData} placeholder="Nhập mô tả về model" />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                disabled={!modelData}
                                loading={loading}
                            >
                                Cập nhật
                            </Button>
                            <Button
                                danger
                                onClick={() => handleDeleteModel(modelData?.id)}
                                disabled={!modelData}
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
                        defaultActiveKey={localStorage.getItem('currentModelTab') || '1'}
                        items={tabItems} 
                        onChange={handleTabChange}
                    />
                </Card>
            </PageContainer>
        </App>
    );
};

export default Managemodel;