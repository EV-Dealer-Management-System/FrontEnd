import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  message, 
  Row, 
  Col, 
  Typography, 
  Spin, 
  Modal, 
  Alert,
  Space,
  Divider,
  Badge,
  Steps,
  Tag
} from 'antd';
import { 
  FileTextOutlined, 
  SafetyOutlined, 
  EditOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FilePdfOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { ContractService } from '../App/Home/Contract';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

function ContractPage() {
  const [form] = Form.useForm();
  const contractService = ContractService();
  
  // States
  const [loading, setLoading] = useState(false);
  const [contractInfo, setContractInfo] = useState(null);
  const [smartCAInfo, setSmartCAInfo] = useState(null);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [smartCAModalVisible, setSmartCAModalVisible] = useState(false);
  const [signingLoading, setSigningLoading] = useState(false);
  const [addingSmartCA, setAddingSmartCA] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [pdfBlob, setPdfBlob] = useState(null);

  // Lấy thông tin hợp đồng bằng processCode
  const getContractInfo = async (processCode) => {
    try {
      setLoading(true);
      
      const result = await contractService.handleGetContractInfo(processCode);
      
      if (result.success) {
        setContractInfo(result.data);
        setCurrentStep(1);
        
        // Kiểm tra SmartCA sau khi có thông tin hợp đồng
        await checkSmartCA(result.data.processedByUserId);
        
        message.success('Lấy thông tin hợp đồng thành công!');
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error in getContractInfo:', error);
      message.error('Có lỗi xảy ra khi lấy thông tin hợp đồng.');
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra thông tin SmartCA
  const checkSmartCA = async (userId) => {
    try {
      const result = await contractService.handleCheckSmartCA(userId);
      
      if (result.success) {
        setSmartCAInfo(result.data);
        
        if (!contractService.isSmartCAValid(result.data)) {
          setCurrentStep(2);
          message.warning('Tài khoản chưa có SmartCA hợp lệ. Vui lòng thêm SmartCA để tiếp tục.');
        } else {
          setCurrentStep(3);
          message.success('SmartCA đã sẵn sàng để ký hợp đồng!');
        }
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error in checkSmartCA:', error);
      message.error('Có lỗi xảy ra khi kiểm tra SmartCA.');
    }
  };

  // Thêm SmartCA
  const addSmartCA = async (values) => {
    try {
      setAddingSmartCA(true);
      
      const result = await contractService.handleAddSmartCA({
        userId: contractInfo.processedByUserId,
        userName: values.cccd,
        serialNumber: values.serialNumber,
        accessToken: contractInfo.accessToken
      });
      
      if (result.success) {
        setSmartCAInfo(result.data);
        setSmartCAModalVisible(false);
        setCurrentStep(3);
        message.success(result.message);
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error in addSmartCA:', error);
      message.error('Có lỗi xảy ra khi thêm SmartCA.');
    } finally {
      setAddingSmartCA(false);
    }
  };

  // Ký hợp đồng
  const signContract = async (values) => {
    try {
      setSigningLoading(true);

      const result = await contractService.handleSignContract({
        processId: contractInfo.processId,
        reason: values.reason,
        otp: values.otp,
        signatureText: values.signatureText,
        accessToken: contractInfo.accessToken
      });
      
      if (result.success) {
        setCurrentStep(4);
        message.success(result.message);
        
        // Cập nhật thông tin hợp đồng sau khi ký
        setContractInfo(prev => ({
          ...prev,
          ...result.data
        }));
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error in signContract:', error);
      message.error('Có lỗi xảy ra khi ký hợp đồng.');
    } finally {
      setSigningLoading(false);
    }
  };

  // Tải PDF preview
  const loadPDFPreview = async () => {
    if (!contractInfo?.downloadUrl) return;
    
    try {
      // Lấy token từ downloadUrl
      const urlParams = new URLSearchParams(contractInfo.downloadUrl.split('?')[1]);
      const token = urlParams.get('token');
      
      const result = await contractService.handleGetPreviewPDF(token);
      
      if (result.success) {
        setPdfBlob(result.url);
      } else {
        message.error('Không thể tải PDF preview');
      }
    } catch (error) {
      console.error('Error loading PDF:', error);
      message.error('Có lỗi khi tải PDF');
    }
  };

  // Submit form processCode
  const onFinish = async (values) => {
    await getContractInfo(values.processCode);
  };

  // Reset form và trạng thái
  const resetForm = () => {
    form.resetFields();
    setContractInfo(null);
    setSmartCAInfo(null);
    setCurrentStep(0);
    setPdfBlob(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2} className="flex items-center justify-center mb-2">
            <SafetyOutlined className="text-blue-500 mr-3" />
            Ký Hợp Đồng Điện Tử
          </Title>
          <Text className="text-gray-600">
            Nhập mã process để xem và ký hợp đồng một cách an toàn
          </Text>
        </div>

        {/* Steps Progress */}
        <Card className="mb-6">
          <Steps current={currentStep} className="mb-4">
            <Step title="Nhập mã process" icon={<FileTextOutlined />} />
            <Step title="Xem hợp đồng" icon={<FilePdfOutlined />} />
            <Step title="Kiểm tra SmartCA" icon={<SafetyOutlined />} />
            <Step title="Ký hợp đồng" icon={<EditOutlined />} />
            <Step title="Hoàn thành" icon={<CheckCircleOutlined />} />
          </Steps>
        </Card>

        {/* Form nhập processCode */}
        {currentStep === 0 && (
          <Card 
            title={
              <span className="flex items-center">
                <FileTextOutlined className="text-blue-500 mr-2" />
                Nhập Mã Process
              </span>
            }
            className="mb-6"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={18}>
                  <Form.Item
                    name="processCode"
                    label="Mã Process"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mã process!' },
                      { 
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          const validation = contractService.validateProcessCode(value);
                          return validation.valid ? Promise.resolve() : Promise.reject(new Error(validation.message));
                        }
                      }
                    ]}
                  >
                    <Input
                      placeholder="Nhập mã process (ví dụ: 550702)"
                      size="large"
                      prefix={<FileTextOutlined className="text-gray-400" />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item label=" " className="mb-0">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      Lấy thông tin
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        )}

        {/* Hiển thị thông tin hợp đồng */}
        {contractInfo && (
          <Row gutter={[16, 16]} className="mb-6">
            {/* Thông tin hợp đồng */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span className="flex items-center">
                    <FilePdfOutlined className="text-red-500 mr-2" />
                    Thông Tin Hợp Đồng
                  </span>
                }
                extra={
                  <Button onClick={resetForm} size="small" icon={<ReloadOutlined />}>
                    Nhập mã khác
                  </Button>
                }
              >
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Text strong>Process ID:</Text>
                    <Text className="text-gray-600 font-mono text-sm">
                      {contractInfo.processId?.substring(0, 8)}...
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text strong>User ID:</Text>
                    <Text className="text-gray-600">{contractInfo.processedByUserId}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text strong>Trạng thái:</Text>
                    <Tag color="green">Sẵn sàng</Tag>
                  </div>
                  
                  <Divider className="my-3" />
                  
                  <Space className="w-full flex-wrap">
                    <Button
                      type="primary"
                      icon={<FilePdfOutlined />}
                      onClick={() => {
                        loadPDFPreview();
                        setPdfModalVisible(true);
                      }}
                      className="bg-red-500 hover:bg-red-600 border-red-500"
                    >
                      Xem PDF
                    </Button>
                    <Button
                      href={contractInfo.downloadUrl}
                      target="_blank"
                      icon={<FilePdfOutlined />}
                    >
                      Tải xuống
                    </Button>
                  </Space>
                </div>
              </Card>
            </Col>

            {/* Thông tin SmartCA */}
            <Col xs={24} lg={12}>
              <SmartCACard 
                smartCAInfo={smartCAInfo}
                contractService={contractService}
                onAddSmartCA={() => setSmartCAModalVisible(true)}
                onSign={signContract}
                signingLoading={signingLoading}
              />
            </Col>
          </Row>
        )}

        {/* Kết quả sau khi ký */}
        {currentStep === 4 && (
          <Card className="mb-6">
            <div className="text-center py-8">
              <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
              <Title level={3} className="text-green-600 mb-2">
                Ký Hợp Đồng Thành Công!
              </Title>
              <Paragraph className="text-gray-600 mb-6">
                Hợp đồng đã được ký thành công. Bạn có thể tải xuống bản hợp đồng đã ký.
              </Paragraph>
              <Space>
                <Button 
                  type="primary" 
                  size="large"
                  href={contractInfo?.downloadUrl}
                  target="_blank"
                  icon={<FilePdfOutlined />}
                  className="bg-green-500 hover:bg-green-600 border-green-500"
                >
                  Tải hợp đồng đã ký
                </Button>
                <Button size="large" onClick={resetForm}>
                  Ký hợp đồng mới
                </Button>
              </Space>
            </div>
          </Card>
        )}

        {/* PDF Modal */}
        <PDFModal
          visible={pdfModalVisible}
          onCancel={() => setPdfModalVisible(false)}
          contractInfo={contractInfo}
          pdfBlob={pdfBlob}
        />

        {/* SmartCA Modal */}
        <SmartCAModal
          visible={smartCAModalVisible}
          onCancel={() => setSmartCAModalVisible(false)}
          onSubmit={addSmartCA}
          loading={addingSmartCA}
          contractService={contractService}
        />
      </div>
    </div>
  );
}

// Component hiển thị thông tin SmartCA
const SmartCACard = ({ smartCAInfo, contractService, onAddSmartCA, onSign, signingLoading }) => {
  const isValid = contractService.isSmartCAValid(smartCAInfo);
  
  return (
    <Card
      title={
        <span className="flex items-center">
          <SafetyOutlined className="text-green-500 mr-2" />
          Thông Tin SmartCA
        </span>
      }
    >
      {smartCAInfo ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Text strong>Trạng thái:</Text>
            <Badge 
              status={isValid ? "success" : "error"}
              text={isValid ? "Hợp lệ" : "Chưa hợp lệ"}
            />
          </div>
          <div className="flex justify-between">
            <Text strong>Tên:</Text>
            <Text>{smartCAInfo.name}</Text>
          </div>
          <div className="flex justify-between">
            <Text strong>Email:</Text>
            <Text>{smartCAInfo.email}</Text>
          </div>
          <div className="flex justify-between">
            <Text strong>Số điện thoại:</Text>
            <Text>{smartCAInfo.phone}</Text>
          </div>
          <div className="flex justify-between">
            <Text strong>Chứng chỉ:</Text>
            <Text>{smartCAInfo.userCertificates?.length || 0} chứng chỉ</Text>
          </div>
          
          {!isValid && (
            <div className="mt-4">
              <Alert
                message="SmartCA chưa sẵn sàng"
                description="Bạn cần thêm SmartCA để có thể ký hợp đồng"
                type="warning"
                showIcon
                className="mb-3"
              />
              <Button
                type="primary"
                danger
                icon={<SafetyOutlined />}
                onClick={onAddSmartCA}
                className="w-full"
              >
                Thêm SmartCA
              </Button>
            </div>
          )}

          {isValid && (
            <div className="mt-4">
              <Alert
                message="SmartCA sẵn sàng"
                description="Bạn có thể ký hợp đồng ngay bây giờ"
                type="success"
                showIcon
                className="mb-3"
              />
              <SigningForm onSign={onSign} loading={signingLoading} contractService={contractService} />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Spin />
          <p className="mt-2 text-gray-500">Đang kiểm tra SmartCA...</p>
        </div>
      )}
    </Card>
  );
};

// Component form ký hợp đồng
const SigningForm = ({ onSign, loading, contractService }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    onSign(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      autoComplete="off"
    >
      <Form.Item
        name="reason"
        label="Lý do ký"
      >
        <Input.TextArea
          placeholder="Đồng ý ký hợp đồng (tùy chọn)"
          rows={2}
        />
      </Form.Item>

      <Form.Item
        name="otp"
        label="Mã OTP"
        rules={[
          { required: true, message: 'Vui lòng nhập mã OTP!' },
          { 
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              const validation = contractService.validateOTP(value);
              return validation.valid ? Promise.resolve() : Promise.reject(new Error(validation.message));
            }
          }
        ]}
      >
        <Input
          placeholder="Nhập mã OTP từ email/SMS"
          maxLength={6}
        />
      </Form.Item>

      <Form.Item
        name="signatureText"
        label="Chữ ký văn bản (tùy chọn)"
      >
        <Input
          placeholder="Văn bản hiển thị cùng chữ ký"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          className="w-full bg-green-500 hover:bg-green-600 border-green-500"
          icon={<EditOutlined />}
        >
          {loading ? 'Đang ký...' : 'Ký Hợp Đồng'}
        </Button>
      </Form.Item>
    </Form>
  );
};

// Component modal PDF
const PDFModal = ({ visible, onCancel, contractInfo, pdfBlob }) => {
  if (!contractInfo) return null;

  return (
    <Modal
      title={
        <span className="flex items-center">
          <FilePdfOutlined className="text-red-500 mr-2" />
          Xem Hợp Đồng
        </span>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
        <Button 
          key="download" 
          type="primary" 
          href={contractInfo.downloadUrl}
          target="_blank"
          className="bg-red-500 border-red-500 hover:bg-red-600"
        >
          Tải xuống PDF
        </Button>
      ]}
      width="98vw"
      style={{ top: 10 }}
      styles={{
        body: { 
          height: 'calc(95vh - 120px)', 
          padding: '0',
          backgroundColor: '#525659'
        }
      }}
      destroyOnClose={true}
    >
      <div 
        className="w-full h-full flex justify-center overflow-auto"
        style={{
          backgroundColor: '#525659',
          padding: '20px 0'
        }}
      >
        <div className="bg-white shadow-lg" style={{ maxWidth: '100%' }}>
          {pdfBlob ? (
            <iframe
              src={pdfBlob}
              title="Hợp đồng"
              style={{ 
                width: '100%', 
                height: '85vh',
                minWidth: '800px',
                border: 'none',
                display: 'block'
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <Spin size="large" />
              <span className="ml-3 text-gray-600">Đang tải PDF...</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

// Component modal thêm SmartCA
const SmartCAModal = ({ visible, onCancel, onSubmit, loading, contractService }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  return (
    <Modal
      title={
        <span className="flex items-center">
          <SafetyOutlined className="text-green-500 mr-2" />
          Thêm SmartCA
        </span>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose={true}
    >
      <Alert
        message="Thêm SmartCA để ký hợp đồng"
        description="Nhập số CCCD để thêm SmartCA. Serial number là tùy chọn."
        type="info"
        className="mb-4"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="cccd"
          label="Số CCCD/CMND"
          rules={[
            { required: true, message: 'Vui lòng nhập số CCCD!' },
            { 
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                const validation = contractService.validateCCCD(value);
                return validation.valid ? Promise.resolve() : Promise.reject(new Error(validation.message));
              }
            }
          ]}
        >
          <Input
            placeholder="Nhập số CCCD (12 số)"
            prefix={<IdcardOutlined className="text-gray-400" />}
            maxLength={12}
          />
        </Form.Item>

        <Form.Item
          name="serialNumber"
          label="Serial Number (tùy chọn)"
        >
          <Input
            placeholder="Nhập serial number nếu có"
            prefix={<SafetyOutlined className="text-gray-400" />}
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Space className="w-full flex justify-end">
            <Button onClick={onCancel}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-green-500 hover:bg-green-600 border-green-500"
            >
              {loading ? 'Đang thêm...' : 'Thêm SmartCA'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ContractPage;
