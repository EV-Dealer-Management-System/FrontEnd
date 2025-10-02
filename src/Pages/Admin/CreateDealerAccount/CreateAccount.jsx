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
  Spin,
  Modal
} from 'antd';
import { UserAddOutlined, ShopOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { locationApi } from '../../../api/api';
import { createAccountApi } from '../../../App/EVMAdmin/CreateDealerAccount/CreateAccount';
import ContractViewer from '../SignContract/Components/ContractViewer';
import SignatureModal from '../SignContract/Components/SignatureModal';
import SmartCAModal from '../SignContract/Components/SmartCAModal';
import AppVerifyModal from '../SignContract/Components/AppVerifyModal';
import useContractSigning from '../SignContract/useContractSigning';

const { Title, Text } = Typography;
const { Option } = Select;

// Custom form field component with consistent styling
const FormField = ({ 
  name, 
  label, 
  icon, 
  rules, 
  children, 
  span = 12,
  required = true // This prop is used in rules if not explicitly provided
}) => (
  <Col xs={24} md={span}>
    <Form.Item
      name={name}
      label={
        <span className="font-semibold text-gray-700 flex items-center">
          {icon && <span className="mr-2 text-blue-500">{icon}</span>}
          {label}
        </span>
      }
      rules={rules || (required ? [{ required: true, message: `${label} là bắt buộc` }] : [])}
    >
      {children}
    </Form.Item>
  </Col>
);

const CreateAccount = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);
  const [contractLink, setContractLink] = useState(null);
  const [contractNo, setContractNo] = useState(null);
  const [contractId, setContractId] = useState(null);
  const [waitingProcessData, setWaitingProcessData] = useState(null);
  
  // Sử dụng custom hook để quản lý logic ký hợp đồng
  const {
    showSignatureModal,
    setShowSignatureModal,
    signingLoading,
    contractSigned,
    signatureCompleted,
    showSmartCAModal,
    setShowSmartCAModal,
    showAppVerifyModal,
    setShowAppVerifyModal,
    handleSignature,
    handleAppVerification,
    resetSigningState
  } = useContractSigning();
  
  // Build a display URL for PDF (use dev proxy to avoid CORS/X-Frame in development)
  const getPdfDisplayUrl = (url) => {
    if (!url) return url;
    try {
      const u = new URL(url);
      const token = u.searchParams.get('token');
      if (import.meta && import.meta.env && import.meta.env.DEV && token) {
        return `/pdf-proxy?token=${encodeURIComponent(token)}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const data = await locationApi.getProvinces();
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

  // Load wards when province changes
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

  // Handle form submission
  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      // Combine address with province and ward information
      const provinceCode = values.province;
      const wardCode = values.ward;
      let fullAddress = values.address || '';

      const selectedProvince = provinces.find(p => p.code === provinceCode);
      const selectedWard = wards.find(w => w.code === wardCode);

      if (selectedWard && selectedProvince) {
        fullAddress = `${fullAddress}, ${selectedWard.name}, ${selectedProvince.name}`.trim().replace(/^,\s+/, '');
        values.address = fullAddress;
        console.log('Địa chỉ đầy đủ đã được cập nhật:', values.address);
      } else {
        console.error('Không thể tìm thấy thông tin phường/xã hoặc tỉnh/thành phố');
      }

      // Validate form data
      const validation = createAccountApi.validateFormData(values);
      if (!validation.isValid) {
        message.error(validation.errors[0]);
        setLoading(false);
        return;
      }

      console.log('Dữ liệu gửi đi:', values);
      
      // Create dealer contract
      const result = await createAccountApi.createDealerContract(values);
      
      if (result.isSuccess || result.success) {
        message.success('Tạo hợp đồng thành công!');
        
        let contractData = null;
        console.log('Full API response:', JSON.stringify(result, null, 2));
        
        if (result.result?.data) {
          contractData = result.result.data;
          console.log('Lấy dữ liệu từ result.result.data:', contractData);
        } else if (result.data) {
          contractData = result.data;
          console.log('Lấy dữ liệu từ result.data:', contractData);
        }
        
        if (contractData) {
          const contractIdFromResponse = contractData.id;
          const downloadUrl = contractData.downloadUrl;
          const contractNo = contractData.no;
          const processId = contractData.waitingProcess?.id || contractIdFromResponse;
          
          console.log('Contract data:', {
            id: contractIdFromResponse,
            no: contractNo,
            downloadUrl: downloadUrl,
            waitingProcessId: contractData.waitingProcess?.id,
            processId: processId,
            waitingProcess: contractData.waitingProcess
          });
          
          setContractId(processId);
          setWaitingProcessData(contractData.waitingProcess);
          
          if (downloadUrl) {
            setContractLink(downloadUrl);
            setContractNo(contractNo || 'Không xác định');
            
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





  // Download PDF
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = contractLink;
    a.download = `hop-dong-${contractNo || 'dai-ly'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Reset form and related state
  const resetForm = () => {
    Modal.confirm({
      title: 'Làm mới biểu mẫu? ',
      content: 'Thao tác này sẽ xóa dữ liệu đã nhập và bắt đầu hợp đồng mới.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => {
        form.resetFields();
        setContractLink(null);
        setContractNo(null);
        setContractId(null);
        setWaitingProcessData(null);
        setWards([]);
        resetSigningState();
        message.success('Đã làm mới biểu mẫu');
      }
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-lg rounded-xl mb-6">
          <Space direction="vertical" size="large" className="w-full">
            {/* Header */}
            <div className="text-center py-5">
              <Title 
                level={2} 
                className="text-blue-500 mb-2 flex items-center justify-center gap-3"
              >
                <UserAddOutlined />
                Tạo Hợp Đồng Đại Lý
              </Title>
              <Text className="text-base text-gray-600">
                Quản lý và tạo hợp đồng cho các đại lý xe điện
              </Text>
            </div>

            <Divider className="my-6" />

            {/* Contract Display */}
            {contractLink && (
              <ContractViewer
                contractLink={contractLink}
                contractNo={contractNo}
                contractSigned={contractSigned}
                onSign={() => setShowSignatureModal(true)}
                onDownload={handleDownload}
                onNewContract={resetForm}
                viewerLink={getPdfDisplayUrl(contractLink)}
              />
            )}

            {/* Form */}
            <Form
              form={form}
              name="dealerForm"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              layout="vertical"
              size="large"
              className="max-w-4xl mx-auto"
            >
              <Row gutter={[24, 16]}>
                <FormField
                  name="brandName"
                  label="Tên Hãng"
                  icon={<ShopOutlined />}
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên hãng!' },
                    { min: 2, message: 'Tên hãng phải có ít nhất 2 ký tự!' }
                  ]}
                >
                  <Input 
                    placeholder="Nhập tên hãng xe điện"
                    className="rounded-lg"
                  />
                </FormField>

                <FormField
                  name="representativeName"
                  label="Họ Tên Quản Lý"
                  icon={<UserAddOutlined />}
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ tên quản lý!' },
                    { min: 2, message: 'Họ tên quản lý phải có ít nhất 2 ký tự!' }
                  ]}
                >
                  <Input 
                    placeholder="Nhập họ tên quản lý"
                    className="rounded-lg"
                  />
                </FormField>

                <FormField
                  name="province"
                  label="Tỉnh/Thành phố"
                  icon={<EnvironmentOutlined />}
                  rules={[
                    { required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }
                  ]}
                >
                  <Select 
                    placeholder="Chọn tỉnh/thành phố"
                    className="rounded-lg"
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
                </FormField>

                <FormField
                  name="ward"
                  label="Phường/Xã"
                  icon={<EnvironmentOutlined />}
                  rules={[
                    { required: true, message: 'Vui lòng chọn phường/xã!' }
                  ]}
                >
                  <Select 
                    placeholder="Chọn phường/xã"
                    className="rounded-lg"
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
                </FormField>

                <FormField
                  name="email"
                  label="Email Quản Lý"
                  icon={<MailOutlined />}
                  rules={[
                    { required: true, message: 'Vui lòng nhập email quản lý!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input 
                    placeholder="Nhập email quản lý"
                    className="rounded-lg"
                  />
                </FormField>

                <FormField
                  name="phone"
                  label="Số Điện Thoại Quản Lý"
                  icon={<PhoneOutlined />}
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
                    className="rounded-lg"
                  />
                </FormField>

                <FormField
                  name="address"
                  label="Địa Chỉ Đại Lý"
                  icon={<EnvironmentOutlined />}
                  span={24}
                  rules={[
                    { required: true, message: 'Vui lòng nhập địa chỉ đại lý!' }
                  ]}
                >
                  <Input.TextArea 
                    placeholder="Nhập địa chỉ đại lý (số nhà, tên đường, ...)"
                    rows={3}
                    className="rounded-lg"
                  />
                </FormField>
              </Row>

              {/* Action Buttons */}
              <Row justify="center" className="mt-8">
                <Col>
                  <Space size="large">
                    <Button 
                      size="large" 
                      onClick={resetForm}
                      className="rounded-lg min-w-32 h-12 text-base font-semibold"
                      disabled={contractLink !== null}
                    >
                      Làm Mới
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      size="large"
                      className="rounded-lg min-w-32 h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 border-none shadow-lg hover:shadow-xl transition-all duration-200"
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

        {/* Signature Modal */}
        <SignatureModal
          visible={showSignatureModal}
          onCancel={() => setShowSignatureModal(false)}
          onSign={(signatureData, signatureDisplayMode) => {
            handleSignature(signatureData, signatureDisplayMode, contractId, waitingProcessData, contractNo);
          }}
          loading={signingLoading}
        />

        {/* SmartCA Modal */}
        <SmartCAModal
          visible={showSmartCAModal}
          onCancel={() => {
            setShowSmartCAModal(false);
          }}
          contractNo={contractNo}
        />

        {/* App Verification Modal */}
        <AppVerifyModal
          visible={showAppVerifyModal}
          onCancel={() => setShowAppVerifyModal(false)}
          onVerify={() => handleAppVerification(contractNo)}
          loading={signingLoading}
          signatureCompleted={signatureCompleted}
        />
      </div>
    </div>
  );
};

export default CreateAccount;