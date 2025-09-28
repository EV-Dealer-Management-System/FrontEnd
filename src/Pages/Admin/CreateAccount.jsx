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
import { UserAddOutlined, ShopOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined, FilePdfOutlined } from '@ant-design/icons';
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
  const [contractLink, setContractLink] = useState(null);
  const [contractNo, setContractNo] = useState(null);
  const [pdfViewerUrl, setPdfViewerUrl] = useState(null);

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
      
      if (result.isSuccess || result.success) {
        message.success('Tạo hợp đồng thành công!');
        
        // Xác định dữ liệu từ response
        let contractData = null;
        
        // Log toàn bộ result để debug
        console.log('Full API response:', JSON.stringify(result, null, 2));
        
        // Phân tích cấu trúc response để lấy downloadUrl và id
        if (result.result?.data) {
          // Cấu trúc từ API: { isSuccess: true, result: { data: { id, downloadUrl } } }
          contractData = result.result.data;
          console.log('Lấy dữ liệu từ result.result.data:', contractData);
        } else if (result.data) {
          // Cấu trúc thay thế: { success: true, data: { id, downloadUrl } }
          contractData = result.data;
          console.log('Lấy dữ liệu từ result.data:', contractData);
        }
        
        if (contractData) {
          // Lấy các trường từ cấu trúc JSON
          const contractId = contractData.id;
          const downloadUrl = contractData.downloadUrl;
          const contractNo = contractData.no;
          
          // Log chi tiết để debug
          console.log('Contract data:', {
            id: contractId,
            no: contractNo,
            downloadUrl: downloadUrl
          });
          
          if (downloadUrl) {
            // Lưu thông tin để hiển thị UI
            setContractLink(downloadUrl);
            setContractNo(contractNo || 'Không xác định');
            
            // Tạo URL cho PDF.js Viewer để hiển thị PDF trực tiếp trên trang
            const pdfJsUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(downloadUrl)}`;
            setPdfViewerUrl(pdfJsUrl);
            
            // Thông báo thành công với tùy chọn đi đến trang gốc
            message.success({
              content: (
                <span>
                  Hợp đồng đã được tạo thành công và sẽ được hiển thị bên dưới!
                </span>
              ),
              duration: 3
            });
          } else {
            message.warning('Không tìm thấy đường dẫn hợp đồng');
            console.error('Download URL không tồn tại trong phản hồi');
          }
        } else {
          message.warning('Không có thông tin hợp đồng trong kết quả trả về');
        }
      } else {
        message.error(result.error || 'Có lỗi khi tạo hợp đồng');
        // Reset thông tin hợp đồng nếu có lỗi
        setContractLink(null);
        setContractNo(null);
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

              {/* Hiển thị hợp đồng trực tiếp trên trang nếu đã tạo thành công */}
              {contractLink && (
                <Row style={{ marginTop: '24px' }}>
                  <Col span={24}>
                    <Card 
                      title={
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          <ShopOutlined style={{ color: '#52c41a', marginRight: '8px' }} /> 
                          Hợp đồng đã được tạo thành công
                        </span>
                      } 
                      style={{ 
                        backgroundColor: '#f6ffed', 
                        borderColor: '#b7eb8f',
                        marginBottom: '24px' 
                      }}
                    >
                      <div>
                        <p><strong>Số hợp đồng:</strong> {contractNo}</p>
                        
                        {/* PDF Viewer iframe sử dụng PDF.js */}
                        <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                          <div style={{ 
                            border: '1px solid #d9d9d9', 
                            borderRadius: '8px', 
                            overflow: 'hidden',
                            height: '600px'
                          }}>
                            <iframe
                              src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(contractLink)}`}
                              title="PDF Viewer"
                              width="100%"
                              height="100%"
                              style={{ border: 'none' }}
                              allowFullScreen
                            />
                          </div>
                        </div>
                        
                        {/* Nút điều khiển */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginTop: '16px' 
                        }}>
                          <Space>
                            <Button 
                              type="primary" 
                              href={contractLink} 
                              target="_blank"
                              icon={<EnvironmentOutlined />}
                              style={{ 
                                backgroundColor: '#52c41a', 
                                borderColor: '#52c41a' 
                              }}
                            >
                              Mở trong trang mới
                            </Button>
                            
                            <Button
                              type="default"
                              icon={<FilePdfOutlined />}
                              onClick={() => {
                                // Tạo và tải xuống PDF
                                const a = document.createElement('a');
                                a.href = contractLink;
                                a.download = `hop-dong-${contractNo || 'dai-ly'}.pdf`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                              }}
                            >
                              Tải hợp đồng PDF
                            </Button>
                          </Space>
                          
                          <Button 
                            onClick={() => {
                              setContractLink(null);
                              setContractNo(null);
                              setPdfViewerUrl(null);
                              form.resetFields();
                            }}
                          >
                            Tạo hợp đồng mới
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              )}
              
              {/* Buttons */}
              <Row justify="center" style={{ marginTop: '32px' }}>
                <Col>
                  <Space size="large">
                    <Button 
                      size="large" 
                      onClick={() => {
                        form.resetFields();
                        setContractLink(null);
                        setContractNo(null);
                      }}
                      style={{ 
                        borderRadius: '8px',
                        minWidth: '120px',
                        height: '48px',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}
                      disabled={contractLink !== null}
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
                      disabled={contractLink !== null}
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
