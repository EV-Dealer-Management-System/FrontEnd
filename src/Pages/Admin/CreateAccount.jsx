import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Row, 
  Col, 
  message, 
  Select,
  Space,
  Typography,
  Divider,
  Spin
} from 'antd';
import { UserAddOutlined, ShopOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { locationApi } from '../../api/api';
import { createAccountApi } from '../../App/EVMAdmin/CreateAccount';

const { Title, Text } = Typography;
const { Option } = Select;

const CreateAccount = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);

  // Load danh sách tỉnh/thành phố khi component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const data = await locationApi.getProvinces();
        // API trả về array của provinces
        setProvinces(data);
      } catch (error) {
        message.error('Không thể tải danh sách tỉnh/thành phố');
        console.error('Error loading provinces:', error);
      } finally {
        setLoadingProvinces(false);
      }
    };

    loadProvinces();
  }, []);

  // Load phường/xã khi chọn tỉnh/thành phố (API v2 bỏ quận/huyện)
  const handleProvinceChange = async (provinceCode) => {
    if (!provinceCode) {
      setWards([]);
      form.setFieldsValue({ ward: undefined });
      return;
    }

    try {
      setLoadingWards(true);
      const data = await locationApi.getWards(provinceCode);
      setWards(data);
      form.setFieldsValue({ ward: undefined });
    } catch (error) {
      message.error('Không thể tải danh sách phường/xã');
      console.error('Error loading wards:', error);
    } finally {
      setLoadingWards(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      // Kết hợp địa chỉ với thông tin tỉnh/thành phố và phường/xã
      const provinceCode = values.province;
      const wardCode = values.ward;
      let fullAddress = values.address || '';

      // Tìm tên phường/xã và tỉnh/thành phố từ mã code
      const selectedProvince = provinces.find(p => p.code === provinceCode);
      const selectedWard = wards.find(w => w.code === wardCode);

      // Kết hợp địa chỉ với tên phường/xã và tỉnh/thành phố
      if (selectedWard && selectedProvince) {
        fullAddress = `${fullAddress}, ${selectedWard.name}, ${selectedProvince.name}`.trim().replace(/^,\s+/, '');
        
        // Ghi đè trường địa chỉ bằng địa chỉ đầy đủ
        values.address = fullAddress;
        
        console.log('Địa chỉ đầy đủ đã được cập nhật:', values.address);
      } else {
        console.error('Không thể tìm thấy thông tin phường/xã hoặc tỉnh/thành phố');
      }

      // Validate dữ liệu trước khi gửi
      const validation = createAccountApi.validateFormData(values);
      if (!validation.isValid) {
        message.error(validation.errors[0]);
        setLoading(false);
        return;
      }

      // Log giá trị trước khi gửi để kiểm tra
      console.log('Dữ liệu gửi đi:', values);
      
      // Gọi API tạo hợp đồng đại lý
      const result = await createAccountApi.createDealerContract(values);
      
      if (result.success) {
        message.success(result.message);
        form.resetFields();
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      message.error('Có lỗi không mong muốn xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Vui lòng kiểm tra lại thông tin đã nhập');
  };

  return (
    <div style={{ 
      padding: '24px', 
      background: '#f0f2f5', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Card 
          style={{ 
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '12px',
            marginBottom: '24px'
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Title level={2} style={{ 
                color: '#1890ff', 
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}>
                <UserAddOutlined />
                Tạo Hợp Đồng Đại Lý
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Quản lý và tạo hợp đồng cho các đại lý xe điện
              </Text>
            </div>

            <Divider style={{ margin: '24px 0' }} />

            <Form
              form={form}
              name="dealerForm"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              layout="vertical"
              size="large"
              style={{ maxWidth: '800px', margin: '0 auto' }}
            >
              <Row gutter={[24, 16]}>
                {/* Tên Hãng */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="brandName"
                    label={
                      <span style={{ fontWeight: '600', color: '#262626' }}>
                        <ShopOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Tên Hãng
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Vui lòng nhập tên hãng!' },
                      { min: 2, message: 'Tên hãng phải có ít nhất 2 ký tự!' }
                    ]}
                  >
                    <Input 
                      placeholder="Nhập tên hãng xe điện"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                </Col>

                {/* Tên Quản Lý */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="representativeName"
                    label={
                      <span style={{ fontWeight: '600', color: '#262626' }}>
                        <UserAddOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Họ Tên Quản Lý
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Vui lòng nhập họ tên quản lý!' },
                      { min: 2, message: 'Họ tên quản lý phải có ít nhất 2 ký tự!' }
                    ]}
                  >
                    <Input 
                      placeholder="Nhập họ tên quản lý"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                </Col>

                {/* Tỉnh/Thành phố */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="province"
                    label={
                      <span style={{ fontWeight: '600', color: '#262626' }}>
                        <EnvironmentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Tỉnh/Thành phố
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }
                    ]}
                  >
                    <Select 
                      placeholder="Chọn tỉnh/thành phố"
                      style={{ borderRadius: '8px' }}
                      showSearch
                      loading={loadingProvinces}
                      onChange={handleProvinceChange}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      notFoundContent={loadingProvinces ? <Spin size="small" /> : 'Không tìm thấy tỉnh/thành phố'}
                    >
                      {provinces.map(province => (
                        <Option key={province.code} value={province.code}>
                          {province.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                {/* Phường/Xã */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="ward"
                    label={
                      <span style={{ fontWeight: '600', color: '#262626' }}>
                        <EnvironmentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Phường/Xã
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Vui lòng chọn phường/xã!' }
                    ]}
                  >
                    <Select 
                      placeholder="Chọn phường/xã"
                      style={{ borderRadius: '8px' }}
                      showSearch
                      loading={loadingWards}
                      disabled={wards.length === 0}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      notFoundContent={loadingWards ? <Spin size="small" /> : 'Không tìm thấy phường/xã'}
                    >
                      {wards.map(ward => (
                        <Option key={ward.code} value={ward.code}>
                          {ward.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                {/* Email Quản Lý */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label={
                      <span style={{ fontWeight: '600', color: '#262626' }}>
                        <MailOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Email Quản Lý
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Vui lòng nhập email quản lý!' },
                      { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                  >
                    <Input 
                      placeholder="Nhập email quản lý"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                </Col>

                {/* Số điện thoại Quản Lý */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label={
                      <span style={{ fontWeight: '600', color: '#262626' }}>
                        <PhoneOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Số Điện Thoại Quản Lý
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Vui lòng nhập số điện thoại quản lý!' },
                      { 
                        pattern: /^0[1-9]{9}$/, 
                        message: 'Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số!' 
                      }
                    ]}
                  >
                    <Input 
                      placeholder="Nhập số điện thoại quản lý (bắt đầu bằng 0)"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                </Col>

                {/* Địa chỉ Đại Lý */}
                <Col xs={24}>
                  <Form.Item
                    name="address"
                    label={
                      <span style={{ fontWeight: '600', color: '#262626' }}>
                        <EnvironmentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Địa Chỉ Đại Lý
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Vui lòng nhập địa chỉ đại lý!' }
                    ]}
                  >
                    <Input.TextArea 
                      placeholder="Nhập địa chỉ đại lý (số nhà, tên đường, ...)"
                      rows={3}
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Buttons */}
              <Row justify="center" style={{ marginTop: '32px' }}>
                <Col>
                  <Space size="large">
                    <Button 
                      size="large" 
                      onClick={() => form.resetFields()}
                      style={{ 
                        borderRadius: '8px',
                        minWidth: '120px',
                        height: '48px',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}
                    >
                      Làm Mới
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      size="large"
                      style={{ 
                        borderRadius: '8px',
                        minWidth: '120px',
                        height: '48px',
                        fontSize: '16px',
                        fontWeight: '600',
                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
                      }}
                    >
                      {loading ? 'Đang tạo...' : 'Tiếp Theo'}
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default CreateAccount;
