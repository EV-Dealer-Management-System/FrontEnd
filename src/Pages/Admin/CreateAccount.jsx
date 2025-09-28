import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Card, Row, Col, message, Select, Space, Typography, Divider, Spin, Modal, Alert } from 'antd';
import { UserAddOutlined, ShopOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined, FilePdfOutlined, EditOutlined, CheckOutlined, ClearOutlined } from '@ant-design/icons';
import SignatureCanvas from 'react-signature-canvas';
import { locationApi } from '../../api/api';
import { createAccountApi } from '../../App/EVMAdmin/CreateAccount';
import { SignContract } from '../../App/EVMAdmin/SignContract';

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
  required = true 
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
      rules={rules}
    >
      {children}
    </Form.Item>
  </Col>
);

// Contract display component
const ContractDisplay = ({ 
  contractLink, 
  contractNo, 
  contractSigned, 
  onSign, 
  onDownload, 
  onNewContract 
}) => (
  <Card 
    className="bg-green-50 border-green-200 mb-6"
    title={
      <span className="flex items-center text-green-600">
        <ShopOutlined className="mr-2" />
        Hợp đồng đã được tạo thành công
      </span>
    }
  >
    <div className="space-y-4">
      <p><strong>Số hợp đồng:</strong> {contractNo}</p>
      
      {contractSigned && (
        <Alert
          message={
            <span className="text-green-600 font-semibold">
              ✅ Hợp đồng đã được ký thành công!
            </span>
          }
          type="success"
          className="mb-4"
        />
      )}
      
      {/* PDF Viewer */}
      <div className="mt-6 mb-6">
        <div className="border border-gray-300 rounded-lg overflow-hidden h-96">
          <iframe
            src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(contractLink)}`}
            title="PDF Viewer"
            className="w-full h-full border-0"
            allowFullScreen
          />
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between items-center mt-4">
        <Space>
          <Button 
            type="primary" 
            href={contractLink} 
            target="_blank"
            icon={<EnvironmentOutlined />}
            className="bg-green-500 border-green-500 hover:bg-green-600"
          >
            Mở trong trang mới
          </Button>
          
          <Button
            type="default"
            icon={<FilePdfOutlined />}
            onClick={onDownload}
          >
            Tải hợp đồng PDF
          </Button>

          {!contractSigned && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={onSign}
              className="bg-blue-500 border-blue-500 hover:bg-blue-600"
            >
              Ký Hợp Đồng
            </Button>
          )}

          {contractSigned && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              disabled
              className="bg-green-500 border-green-500"
            >
              Đã Ký
            </Button>
          )}
        </Space>
        
        <Button onClick={onNewContract}>
          Tạo hợp đồng mới
        </Button>
      </div>
    </div>
  </Card>
);

// Signature modal component
const SignatureModal = ({ 
  visible, 
  onCancel, 
  onSign, 
  onClear, 
  loading,
  signatureRef
}) => {
  const clearSignature = () => {
    if (signatureRef && signatureRef.current) {
      signatureRef.current.clear();
    }
    onClear();
  };

  return (
    <Modal
      title={
        <span className="flex items-center">
          <EditOutlined className="text-blue-500 mr-2" />
          Ký Hợp Đồng Điện Tử
        </span>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      centered
    >
      <div className="text-center py-5">
        <Alert
          message="Vui lòng vẽ chữ ký của bạn trong khung bên dưới"
          type="info"
          className="mb-5"
        />
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-50 mb-5">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              width: 500,
              height: 200,
              className: 'signature-canvas',
              style: {
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                backgroundColor: 'white'
              }
            }}
            backgroundColor="white"
            penColor="black"
            dotSize={2}
            minWidth={1}
            maxWidth={3}
            velocityFilterWeight={0.7}
          />
        </div>

        <div className="text-xs text-gray-600 mb-4 text-left">
          <strong>Lưu ý:</strong> Chữ ký sẽ được chuyển đổi thành định dạng <code>data:image/png;base64,...</code> để gửi lên server
        </div>

        <Space size="large">
          <Button
            icon={<ClearOutlined />}
            onClick={clearSignature}
            className="min-w-24"
          >
            Xóa
          </Button>
          
          <Button
            onClick={onCancel}
            className="min-w-24"
          >
            Hủy
          </Button>
          
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={onSign}
            loading={loading}
            className="min-w-24 bg-green-500 border-green-500 hover:bg-green-600"
          >
            {loading ? 'Đang ký...' : 'Ký Hợp Đồng'}
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

const CreateAccount = () => {
  const [form] = Form.useForm();
  const signatureRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);
  const [contractLink, setContractLink] = useState(null);
  const [contractNo, setContractNo] = useState(null);
  const [contractId, setContractId] = useState(null);
  const [waitingProcessData, setWaitingProcessData] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signingLoading, setSigningLoading] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);

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

  // Handle contract signing
  const handleSignContract = async () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      message.error('Vui lòng vẽ chữ ký của bạn!');
      return;
    }

    setSigningLoading(true);
    try {
      const signatureDataURL = getSignatureAsFullDataURL(signatureRef.current);
      
      if (!signatureDataURL) {
        message.error('Không thể tạo chữ ký. Vui lòng thử lại!');
        setSigningLoading(false);
        return;
      }
      
      const signContractApi = SignContract();
      
      const signData = {
        waitingProcess: waitingProcessData,
        reason: "Ký hợp đồng đại lý",
        reject: false,
        signatureImage: signatureDataURL,
        signingPage: 0,
        signingPosition: "bottom-right",
        signatureText: "Test Signature",
        fontSize: 12,
        showReason: true,
        confirmTermsConditions: true
      };

      console.log('Signature data format:', {
        fullDataURL: signatureDataURL.substring(0, 100) + '...',
        dataURLLength: signatureDataURL.length,
        processId: contractId,
        waitingProcess: waitingProcessData,
        hasCorrectPrefix: signatureDataURL.startsWith('data:image/png;base64,')
      });

      const result = await signContractApi.handleSignContract(signData);
      
      console.log('Sign contract API result:', JSON.stringify(result, null, 2));
      
      if (result && (result.isSuccess || result.success)) {
        message.success('Ký hợp đồng thành công!');
        setContractSigned(true);
        setShowSignatureModal(false);
        
        let signedContractData = null;
        
        if (result.result?.data) {
          signedContractData = result.result.data;
        } else if (result.data) {
          signedContractData = result.data;
        }
        
        if (signedContractData && signedContractData.downloadUrl) {
          const newDownloadUrl = signedContractData.downloadUrl;
          const newContractNo = signedContractData.no || contractNo;
          
          console.log('Updating contract with signed version:', {
            oldUrl: contractLink,
            newUrl: newDownloadUrl,
            contractNo: newContractNo
          });          
          setContractLink(newDownloadUrl);
          setContractNo(newContractNo);
          
          message.success({
            content: (
              <span>
                Hợp đồng đã được ký thành công! Đang hiển thị phiên bản đã ký.
              </span>
            ),
            duration: 4
          });
        }
      } else {
        message.error('Có lỗi khi ký hợp đồng');
      }
    } catch (error) {
      console.error('Error signing contract:', error);
      message.error('Có lỗi không mong muốn khi ký hợp đồng');
    } finally {
      setSigningLoading(false);
    }
  };

  // Helper function to convert signature to PNG base64
  const getSignatureAsFullDataURL = (sigRefCurrent) => {
    if (!sigRefCurrent || sigRefCurrent.isEmpty()) {
      return null;
    }
    
    const canvas = sigRefCurrent.getCanvas();
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
  
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);
    
    const dataURL = tempCanvas.toDataURL('image/png', 1.0);
    return dataURL;
  };

  // Reset form and contract data
  const resetForm = () => {
    form.resetFields();
    setContractLink(null);
    setContractNo(null);
    setContractId(null);
    setWaitingProcessData(null);
    setContractSigned(false);
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
              <ContractDisplay
                contractLink={contractLink}
                contractNo={contractNo}
                contractSigned={contractSigned}
                onSign={() => setShowSignatureModal(true)}
                onDownload={handleDownload}
                onNewContract={resetForm}
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
          onSign={handleSignContract}
          onClear={() => {}}
          loading={signingLoading}
          signatureRef={signatureRef}
        />
      </div>
    </div>
  );
};

export default CreateAccount;