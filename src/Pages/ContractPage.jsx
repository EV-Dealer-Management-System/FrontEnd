import React, { useState, useEffect, useRef } from 'react';
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
  Tag,
  Radio,
  Upload,
  Select,
  Tabs,
  Image
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
  PictureOutlined,
  UploadOutlined,
  CheckOutlined,
  ReloadOutlined,
  ClearOutlined
} from '@ant-design/icons';
import SignatureCanvas from 'react-signature-canvas';
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
  const [pdfLoading, setPdfLoading] = useState(false);
  
  // Signature states
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showAppVerifyModal, setShowAppVerifyModal] = useState(false);
  const [signatureCompleted, setSignatureCompleted] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);
  const [signatureDisplayMode, setSignatureDisplayMode] = useState(2);
  const [signatureMethod, setSignatureMethod] = useState('draw');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageBase64, setUploadedImageBase64] = useState('');
  const signatureRef = useRef(null);

  // SignatureCanvas sẽ được khởi tạo tự động qua ref

  // Lấy thông tin hợp đồng bằng processCode
  const getContractInfo = async (processCode) => {
    try {
      setLoading(true);
      
      const result = await contractService.handleGetContractInfo(processCode);
      
      if (result.success) {
        console.log('Contract info received:', {
          processId: result.data.processId,
          downloadUrl: result.data.downloadUrl,
          processedByUserId: result.data.processedByUserId,
          fullData: result.data
        });
        
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
        // Sử dụng dữ liệu gốc thay vì format để tránh mất thông tin
        const finalData = result.data;
        setSmartCAInfo(finalData);
        
        // Kiểm tra tính hợp lệ
        const isValid = contractService.isSmartCAValid(finalData);
        
        console.log('CheckSmartCA result:', {
          original: result.data,
          finalData: finalData,
          isValid: isValid,
          hasDefaultSmartCa: !!finalData?.defaultSmartCa,
          defaultSmartCaValid: finalData?.defaultSmartCa?.isValid,
          certificatesCount: finalData?.userCertificates?.length || 0,
          validCertificates: finalData?.userCertificates?.filter(cert => cert.isValid).length || 0
        });
        
        if (!isValid) {
          setCurrentStep(2);
          message.warning('Tài khoản chưa có SmartCA hợp lệ. Vui lòng thêm SmartCA để tiếp tục.');
        } else {
          setCurrentStep(3);
          message.success('✅ SmartCA đã sẵn sàng để ký hợp đồng!');
        }
      } else {
        message.error(result.error);
        setCurrentStep(2); // Về bước thêm SmartCA nếu có lỗi
      }
    } catch (error) {
      console.error('Error in checkSmartCA:', error);
      message.error('Có lỗi xảy ra khi kiểm tra SmartCA.');
      setCurrentStep(2);
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
      
      console.log('Add SmartCA result:', result);
      
      if (result.success) {
        console.log('Add SmartCA success, result data:', result.data);
        
        // Hiển thị thông báo thành công
        message.success(result.message);
        setSmartCAModalVisible(false);
        
        // Cập nhật smartCAInfo với dữ liệu mới từ API response
        setSmartCAInfo(result.data);
        
        // Kiểm tra tính hợp lệ bằng contractService
        const isValid = contractService.isSmartCAValid(result.data);
        console.log('SmartCA validity after add:', isValid);
        
        if (isValid) {
          // Nếu SmartCA hợp lệ, chuyển sang bước ký
          setCurrentStep(3);
          message.success('🎉 SmartCA đã sẵn sàng! Bạn có thể ký hợp đồng ngay bây giờ.', 4);
        } else {
          // Nếu chưa hợp lệ, vẫn ở bước 2 và refresh sau
          setCurrentStep(2);
          message.warning('SmartCA đã được thêm nhưng chưa sẵn sàng. Đang kiểm tra lại...', 3);
          
          // Refresh lại thông tin sau 3 giây
          setTimeout(async () => {
            console.log('Refreshing SmartCA info after delay...');
            await checkSmartCA(contractInfo.processedByUserId);
          }, 3000);
        }
        
      } else {
        // Hiển thị lỗi cụ thể từ API
        const errorMessage = result.error || 'Thêm SmartCA thất bại';
        message.error(errorMessage);
        
        // Log chi tiết để debug
        console.error('Add SmartCA failed:', {
          error: result.error,
          fullResult: result
        });
      }
    } catch (error) {
      console.error('Exception in addSmartCA:', error);
      message.error('Có lỗi không mong muốn khi thêm SmartCA.');
    } finally {
      setAddingSmartCA(false);
    }
  };

  // Bắt đầu quy trình ký hợp đồng (mở signature modal)
  const signContract = async () => {
    if (!contractService.isSmartCAValid(smartCAInfo)) {
      message.error('SmartCA chưa sẵn sàng. Vui lòng thêm SmartCA trước khi ký!');
      return;
    }
    
    setShowSignatureModal(true);
  };

  // Ký hợp đồng điện tử (Step 1)
  const handleDigitalSignature = async () => {
    // Kiểm tra chữ ký dựa trên method và display mode
    if (signatureDisplayMode === 2) {
      if (signatureMethod === 'draw') {
        if (!signatureRef.current || signatureRef.current.isEmpty()) {
          message.error('Vui lòng vẽ chữ ký của bạn!');
          return;
        }
      } else if (signatureMethod === 'upload') {
        if (!uploadedImageBase64) {
          message.error('Vui lòng tải lên ảnh chữ ký hoặc logo!');
          return;
        }
      }
    } else if (signatureDisplayMode === 3) {
      // Kiểm tra cả ảnh upload và chữ ký vẽ tay cho chế độ kết hợp
      if (!uploadedImageBase64) {
        message.error('Vui lòng tải lên ảnh để kết hợp với chữ ký!');
        return;
      }
      if (!signatureRef.current || signatureRef.current.isEmpty()) {
        message.error('Vui lòng vẽ chữ ký để kết hợp với ảnh!');
        return;
      }
    }

    setSigningLoading(true);
    setShowSignatureModal(false);
    
    try {
      // Lấy signature data
      let signatureDataURL = '';
      try {
        const signatureData = getSignatureData();
        
        if (signatureDisplayMode === 3 && signatureData instanceof Promise) {
          console.log('Processing combined signature...');
          signatureDataURL = await signatureData;
          console.log('Combined signature completed:', signatureDataURL ? 'Success' : 'Failed');
        } else {
          signatureDataURL = signatureData;
        }
        
        if (!signatureDataURL) {
          message.error('Không thể lấy dữ liệu chữ ký. Vui lòng thử lại!');
          setSigningLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error getting signature data:', error);
        message.error(`Lỗi xử lý chữ ký: ${error.message}`);
        setSigningLoading(false);
        return;
      }
      
      // Gọi API ký điện tử
      const result = await contractService.handleDigitalSignature({
        processId: contractInfo.processId,
        reason: "Ký hợp đồng điện tử",
        signatureImage: signatureDataURL,
        signatureDisplayMode: signatureDisplayMode,
        waitingProcess: contractInfo.waitingProcess || { id: contractInfo.processId }
      });
      
      console.log('Digital signature result:', result);
      
      if (result.success) {
        setSignatureCompleted(true);
        setShowAppVerifyModal(true);
        message.success('Ký điện tử thành công! Vui lòng xác thực.');
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error in digital signature:', error);
      message.error('Có lỗi không mong muốn khi ký điện tử');
    } finally {
      setSigningLoading(false);
    }
  };

  // Xác thực ứng dụng (Step 2)
  const handleAppVerification = async () => {
    if (!signatureCompleted) {
      message.error('Vui lòng hoàn thành ký điện tử trước!');
      return;
    }

    setSigningLoading(true);
    try {
      const result = await contractService.handleAppVerification({
        processId: contractInfo.processId
      });
      
      if (result.success) {
        setShowAppVerifyModal(false);
        setContractSigned(true);
        setCurrentStep(4);
        
        // Hiển thị popup thành công
        Modal.success({
          title: (
            <span className="text-green-600 font-semibold flex items-center">
              <CheckCircleOutlined className="mr-2" />
              Ký Hợp Đồng Hoàn Tất!
            </span>
          ),
          content: (
            <div className="py-4">
              <div className="text-base mb-3">🎉 Hợp đồng đã được ký và xác thực thành công!</div>
              <div className="text-sm text-gray-600">
                Process ID: <strong>{contractInfo.processId?.substring(0, 8)}...</strong>
              </div>
              <div className="text-sm text-gray-600">
                Trạng thái: <strong className="text-green-600">Đã ký và xác thực ✅</strong>
              </div>
            </div>
          ),
          okText: 'Đóng',
          centered: true,
          width: 450,
          okButtonProps: {
            className: 'bg-green-500 border-green-500 hover:bg-green-600'
          }
        });
        
        message.success('Xác thực thành công! Hợp đồng đã hoàn tất.');
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error in app verification:', error);
      message.error('Có lỗi khi xác thực từ ứng dụng');
    } finally {
      setSigningLoading(false);
    }
  };

  // Tải PDF preview
  const loadPDFPreview = async () => {
    if (!contractInfo?.downloadUrl) return;
    
    setPdfLoading(true);
    try {
      console.log('Loading PDF preview for URL:', contractInfo.downloadUrl);
      
      // Thử sử dụng downloadUrl trực tiếp trước
      setPdfBlob(contractInfo.downloadUrl);
      
      // Nếu muốn thử preview API, uncomment đoạn code dưới
      /*
      // Lấy token từ downloadUrl
      const urlParams = new URLSearchParams(contractInfo.downloadUrl.split('?')[1]);
      const token = urlParams.get('token');
      
      if (token) {
        const result = await contractService.handleGetPreviewPDF(token);
        
        if (result.success) {
          setPdfBlob(result.url);
        } else {
          console.warn('Preview API failed, using downloadUrl directly');
          setPdfBlob(contractInfo.downloadUrl);
        }
      } else {
        // Nếu không có token, sử dụng downloadUrl trực tiếp
        setPdfBlob(contractInfo.downloadUrl);
      }
      */
      
    } catch (error) {
      console.error('Error loading PDF:', error);
      // Fallback: sử dụng downloadUrl trực tiếp
      setPdfBlob(contractInfo.downloadUrl);
      message.warning('Sử dụng link PDF gốc do không thể tải preview');
    } finally {
      setPdfLoading(false);
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
    setPdfLoading(false);
    setSignatureCompleted(false);
    setContractSigned(false);
    setShowSignatureModal(false);
    setShowAppVerifyModal(false);
    clearAllSignatureData();
  };

  // Utility functions cho signature handling
  
  // Function xử lý upload ảnh
  const handleImageUpload = (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done' || info.file.status === 'error') {
      // Lấy file gốc
      const file = info.file.originFileObj || info.file;
      
      // Đọc file thành base64
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImageBase64(reader.result);
        setUploadedImage(file);
        message.success('Tải ảnh thành công!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Function kiểm tra file upload
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Bạn chỉ có thể tải lên file JPG/PNG!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Kích thước ảnh phải nhỏ hơn 5MB!');
      return false;
    }
    
    return true;
  };

  // Function kết hợp ảnh upload và chữ ký vẽ tay thành một ảnh
  const getCombinedSignatureData = () => {
    if (!uploadedImageBase64 || !signatureRef.current || signatureRef.current.isEmpty()) {
      return null;
    }

    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const uploadedImg = document.createElement('img');
        uploadedImg.onload = () => {
          try {
            const signatureDataURL = getSignatureAsFullDataURL();
            if (!signatureDataURL) {
              reject(new Error('Không thể lấy dữ liệu chữ ký'));
              return;
            }
            
            const signatureImg = document.createElement('img');
            
            signatureImg.onload = () => {
              try {
                const padding = 20;
                const maxWidth = Math.max(uploadedImg.width, signatureImg.width);
                const totalHeight = uploadedImg.height + signatureImg.height + padding;
                
                canvas.width = maxWidth;
                canvas.height = totalHeight;
                
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                const uploadX = (maxWidth - uploadedImg.width) / 2;
                ctx.drawImage(uploadedImg, uploadX, 0, uploadedImg.width, uploadedImg.height);
                
                const signatureX = (maxWidth - signatureImg.width) / 2;
                const signatureY = uploadedImg.height + padding;
                ctx.drawImage(signatureImg, signatureX, signatureY, signatureImg.width, signatureImg.height);
                
                const combinedDataURL = canvas.toDataURL('image/png', 1.0);
                resolve(combinedDataURL);
              } catch (error) {
                reject(error);
              }
            };
            
            signatureImg.onerror = () => reject(new Error('Không thể load ảnh chữ ký'));
            signatureImg.src = signatureDataURL;
          } catch (error) {
            reject(error);
          }
        };
        
        uploadedImg.onerror = () => reject(new Error('Không thể load ảnh upload'));
        
        if (!uploadedImageBase64.startsWith('data:image/')) {
          reject(new Error('Định dạng ảnh upload không hợp lệ'));
          return;
        }
        
        uploadedImg.src = uploadedImageBase64;
      } catch (error) {
        reject(error);
      }
    });
  };

  // Function lấy signature data từ method được chọn
  const getSignatureData = () => {
    if (signatureDisplayMode === 3) {
      return getCombinedSignatureData();
    } else if (signatureMethod === 'upload') {
      return uploadedImageBase64;
    } else {
      return getSignatureAsFullDataURL();
    }
  };

  // Helper function để chuyển đổi signature thành PNG base64 với format đầy đủ
  const getSignatureAsFullDataURL = () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      return null;
    }
    
    try {
      // Sử dụng method toDataURL trực tiếp thay vì getTrimmedCanvas
      return signatureRef.current.toDataURL('image/png');
    } catch (error) {
      console.error('Error getting signature data:', error);
      return null;
    }
  };

  // Clear chữ ký
  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  // Clear uploaded image
  const clearUploadedImage = () => {
    setUploadedImage(null);
    setUploadedImageBase64('');
  };

  // Clear tất cả signature data
  const clearAllSignatureData = () => {
    clearSignature();
    clearUploadedImage();
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
                      loading={pdfLoading}
                      onClick={() => {
                        loadPDFPreview();
                        setPdfModalVisible(true);
                      }}
                      className="bg-red-500 hover:bg-red-600 border-red-500"
                    >
                      {pdfLoading ? 'Đang tải...' : 'Xem PDF'}
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

        {/* Signature Modal */}
        <SignatureModal
          visible={showSignatureModal}
          onCancel={() => setShowSignatureModal(false)}
          onSubmit={handleDigitalSignature}
          loading={signingLoading}
          signatureDisplayMode={signatureDisplayMode}
          setSignatureDisplayMode={setSignatureDisplayMode}
          signatureMethod={signatureMethod}
          setSignatureMethod={setSignatureMethod}
          signatureRef={signatureRef}
          uploadedImage={uploadedImage}
          uploadedImageBase64={uploadedImageBase64}
          handleImageUpload={handleImageUpload}
          beforeUpload={beforeUpload}
          clearSignature={clearSignature}
          clearUploadedImage={clearUploadedImage}
          clearAllSignatureData={clearAllSignatureData}
        />

        {/* App Verification Modal */}
        <AppVerificationModal
          visible={showAppVerifyModal}
          onCancel={() => setShowAppVerifyModal(false)}
          onSubmit={handleAppVerification}
          loading={signingLoading}
        />
      </div>
    </div>
  );
}

// Component hiển thị thông tin SmartCA
const SmartCACard = ({ smartCAInfo, contractService, onAddSmartCA, onSign, signingLoading }) => {
  const isValid = contractService.isSmartCAValid(smartCAInfo);
  
  // Kiểm tra thông tin chi tiết SmartCA
  const hasDefaultSmartCA = smartCAInfo?.defaultSmartCa && smartCAInfo.defaultSmartCa.isValid;
  const validCertificates = smartCAInfo?.userCertificates?.filter(cert => cert.isValid) || [];
  const totalCertificates = smartCAInfo?.userCertificates?.length || 0;
  
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
              text={isValid ? "Sẵn sàng ký" : "Chưa sẵn sàng"}
            />
          </div>
          <div className="flex justify-between">
            <Text strong>Tên:</Text>
            <Text>{smartCAInfo.name || 'N/A'}</Text>
          </div>
          <div className="flex justify-between">
            <Text strong>Email:</Text>
            <Text>{smartCAInfo.email || 'N/A'}</Text>
          </div>
          <div className="flex justify-between">
            <Text strong>Số điện thoại:</Text>
            <Text>{smartCAInfo.phone || 'N/A'}</Text>
          </div>
          <div className="flex justify-between">
            <Text strong>Chứng chỉ hợp lệ:</Text>
            <Text className={validCertificates.length > 0 ? 'text-green-600 font-semibold' : 'text-red-500'}>
              {validCertificates.length}/{totalCertificates}
            </Text>
          </div>
          
          {/* Hiển thị thông tin SmartCA mặc định nếu có */}
          {hasDefaultSmartCA && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
              <div className="text-xs text-green-600 font-semibold mb-1">✅ SmartCA Mặc Định</div>
              <div className="text-sm">
                <div><strong>Tên:</strong> {smartCAInfo.defaultSmartCa.name}</div>
                <div><strong>CCCD:</strong> {smartCAInfo.defaultSmartCa.uid}</div>
                <div><strong>Hết hạn:</strong> {new Date(smartCAInfo.defaultSmartCa.validTo).toLocaleDateString('vi-VN')}</div>
              </div>
            </div>
          )}
          
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
              <Button
                type="primary"
                size="large"
                loading={signingLoading}
                onClick={onSign}
                className="w-full bg-green-500 hover:bg-green-600 border-green-500"
                icon={<EditOutlined />}
              >
                {signingLoading ? 'Đang ký...' : 'Ký Hợp Đồng'}
              </Button>
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

// Component modal chữ ký điện tử - Giống y hệt CreateAccount.jsx
const SignatureModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  loading,
  signatureDisplayMode,
  setSignatureDisplayMode,
  signatureMethod,
  setSignatureMethod,
  signatureRef,
  uploadedImage,
  uploadedImageBase64,
  handleImageUpload,
  beforeUpload,
  clearSignature,
  clearUploadedImage,
  clearAllSignatureData
}) => {
  return (
    <Modal
      title={
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <EditOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
          Ký Hợp Đồng Điện Tử
        </span>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      centered
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Alert
          message="Bước 1/2: Vui lòng thực hiện ký điện tử trước"
          type="info"
          style={{ marginBottom: '20px' }}
        />
        
        {/* Tùy chọn loại chữ ký */}
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <Text strong style={{ marginBottom: '8px', display: 'block' }}>Chọn loại chữ ký:</Text>
          <Radio.Group 
            value={signatureDisplayMode} 
            onChange={(e) => setSignatureDisplayMode(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio value={2}>
                <span style={{ fontWeight: '500' }}>Văn bản hoặc hình ảnh</span>
                <div style={{ fontSize: '12px', color: '#666', marginLeft: '24px' }}>
                  Hiển thị văn bản hoặc hình ảnh chữ ký bạn vẽ
                </div>
              </Radio>
              <Radio value={3}>
                <span style={{ fontWeight: '500' }}>Kết hợp ảnh và chữ ký</span>
                <div style={{ fontSize: '12px', color: '#666', marginLeft: '24px' }}>
                  Kết hợp ảnh upload (trên) và chữ ký vẽ tay (dưới) thành một
                </div>
              </Radio>
            </Space>
          </Radio.Group>
        </div>
        
        {/* Tabs cho việc vẽ chữ ký hoặc upload ảnh - chỉ hiển thị khi cần hình ảnh */}
        {signatureDisplayMode === 2 && (
          <div style={{ marginBottom: '20px' }}>
            <Tabs 
              activeKey={signatureMethod} 
              onChange={setSignatureMethod}
              items={[
                {
                  key: 'draw',
                  label: (
                    <span>
                      <EditOutlined />
                      Vẽ Chữ Ký
                    </span>
                  ),
                  children: (
                    <div style={{
                      border: '2px dashed #d9d9d9',
                      borderRadius: '8px',
                      padding: '10px',
                      backgroundColor: '#fafafa'
                    }}>
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
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#666', 
                        marginTop: '8px',
                        textAlign: 'center'
                      }}>
                        Vẽ chữ ký của bạn trong khung trên
                      </div>
                    </div>
                  )
                },
                {
                  key: 'upload',
                  label: (
                    <span>
                      <UploadOutlined />
                      Upload Ảnh
                    </span>
                  ),
                  children: (
                    <div style={{
                      border: '2px dashed #d9d9d9',
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: '#fafafa',
                      textAlign: 'center',
                      minHeight: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      {!uploadedImageBase64 ? (
                        <Upload.Dragger
                          name="signature"
                          multiple={false}
                          onChange={handleImageUpload}
                          beforeUpload={beforeUpload}
                          showUploadList={false}
                          customRequest={({ onSuccess }) => {
                            // Fake upload success to prevent HTTP request
                            setTimeout(() => {
                              onSuccess();
                            }, 0);
                          }}
                          style={{
                            width: '100%',
                            border: 'none',
                            backgroundColor: 'transparent'
                          }}
                        >
                          <p className="ant-upload-drag-icon">
                            <PictureOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                          </p>
                          <p className="ant-upload-text" style={{ fontSize: '16px', fontWeight: '500' }}>
                            Kéo thả ảnh vào đây hoặc click để chọn
                          </p>
                          <p className="ant-upload-hint" style={{ color: '#666' }}>
                            Hỗ trợ các định dạng: JPG, PNG, GIF. Tối đa 5MB
                          </p>
                        </Upload.Dragger>
                      ) : (
                        <div style={{ width: '100%' }}>
                          <div style={{ marginBottom: '16px' }}>
                            <Image
                              src={uploadedImageBase64}
                              alt="Signature Preview"
                              style={{ 
                                maxWidth: '300px', 
                                maxHeight: '150px',
                                border: '1px solid #d9d9d9',
                                borderRadius: '4px'
                              }}
                            />
                          </div>
                          <Button 
                            icon={<ClearOutlined />}
                            onClick={clearUploadedImage}
                            type="dashed"
                          >
                            Xóa ảnh và chọn lại
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                }
              ]}
            />
          </div>
        )}
        
        {/* Giao diện cho chế độ kết hợp ảnh và chữ ký */}
        {signatureDisplayMode === 3 && (
          <div style={{ marginBottom: '20px' }}>
            <Alert
              message="Chế độ kết hợp: Vui lòng cung cấp cả ảnh và chữ ký"
              type="warning"
              style={{ marginBottom: '16px' }}
            />
            
            {/* Upload ảnh */}
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>1. Tải lên ảnh (sẽ hiển thị ở trên):</Text>
              <div style={{
                border: '2px dashed #d9d9d9',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#fafafa',
                textAlign: 'center'
              }}>
                {!uploadedImageBase64 ? (
                  <Upload.Dragger
                    name="signature"
                    multiple={false}
                    onChange={handleImageUpload}
                    beforeUpload={beforeUpload}
                    showUploadList={false}
                    customRequest={({ onSuccess }) => {
                      setTimeout(() => {
                        onSuccess();
                      }, 0);
                    }}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent'
                    }}
                  >
                    <p className="ant-upload-drag-icon">
                      <PictureOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                    </p>
                    <p className="ant-upload-text">Tải lên ảnh logo/hình ảnh</p>
                    <p className="ant-upload-hint">JPG, PNG, GIF - Tối đa 5MB</p>
                  </Upload.Dragger>
                ) : (
                  <div>
                    <Image
                      src={uploadedImageBase64}
                      alt="Logo Preview"
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '100px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '4px'
                      }}
                    />
                    <div style={{ marginTop: '8px' }}>
                      <Button 
                        icon={<ClearOutlined />}
                        onClick={clearUploadedImage}
                        size="small"
                        type="dashed"
                      >
                        Thay đổi ảnh
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Vẽ chữ ký */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>2. Vẽ chữ ký (sẽ hiển thị ở dưới):</Text>
              <div style={{
                border: '2px dashed #d9d9d9',
                borderRadius: '8px',
                padding: '10px',
                backgroundColor: '#fafafa'
              }}>
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    width: 500,
                    height: 150,
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
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginTop: '8px',
                  textAlign: 'center'
                }}>
                  Vẽ chữ ký của bạn trong khung trên
                </div>
              </div>
            </div>
            
            {/* Preview kết hợp nếu cả hai đều có */}
            {uploadedImageBase64 && signatureRef.current && !signatureRef.current.isEmpty() && (
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Text style={{ fontSize: '12px', color: '#1890ff' }}>✅ Sẵn sàng kết hợp: Ảnh (trên) + Chữ ký (dưới)</Text>
              </div>
            )}
          </div>
        )}
        
        <div style={{ 
          fontSize: '12px', 
          color: '#666', 
          marginBottom: '16px',
          textAlign: 'left'
        }}>
          <strong>Lưu ý:</strong> 
          {signatureDisplayMode === 3 
            ? ' Ảnh và chữ ký sẽ được kết hợp thành một ảnh PNG base64'
            : signatureMethod === 'draw' 
              ? ' Chữ ký vẽ tay sẽ được chuyển đổi thành định dạng PNG base64'
              : ' Ảnh upload sẽ được chuyển đổi thành định dạng base64'
          } để gửi lên server
        </div>

        <Space size="large">
          <Button
            icon={<ClearOutlined />}
            onClick={clearAllSignatureData}
            style={{ minWidth: '100px' }}
          >
            Xóa tất cả
          </Button>
          
          <Button
            onClick={onCancel}
            style={{ minWidth: '100px' }}
          >
            Hủy
          </Button>
          
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={onSubmit}
            loading={loading}
            style={{ 
              minWidth: '100px',
              backgroundColor: '#1890ff',
              borderColor: '#1890ff'
            }}
          >
            {loading ? 'Đang ký...' : 'Ký Điện Tử'}
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

// Component modal xác thực ứng dụng
const AppVerificationModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  loading 
}) => {
  return (
    <Modal
      title={
        <span className="flex items-center text-green-600">
          <CheckOutlined className="mr-2" />
          Xác Thực Ứng Dụng
        </span>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading}
          onClick={onSubmit}
          className="bg-green-500 border-green-500 hover:bg-green-600"
        >
          Xác Thực Hoàn Tất
        </Button>
      ]}
      width={500}
      centered
    >
      <div className="text-center py-6">
        <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
        <Title level={4} className="mb-4">Ký điện tử thành công!</Title>
        <Paragraph className="text-gray-600 mb-6">
          Vui lòng xác nhận trên ứng dụng di động để hoàn tất quy trình ký hợp đồng.
        </Paragraph>
        <Alert
          message="Chờ xác thực"
          description="Kiểm tra ứng dụng di động và thực hiện xác thực để hoàn tất."
          type="info"
          showIcon
        />
      </div>
    </Modal>
  );
};

// Component modal PDF - Sử dụng Google Docs Viewer để bypass X-Frame-Options
const PDFModal = ({ visible, onCancel, contractInfo, pdfBlob }) => {
  const [imageError, setImageError] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  
  // Reset states khi modal mở/đóng - HOOKS PHẢI LUÔN ĐƯỢC GỌI TRƯỚC
  React.useEffect(() => {
    if (visible && contractInfo) {
      setPdfLoading(true);
      setImageError(false);
    }
  }, [visible, contractInfo]);

  // Early return AFTER hooks
  if (!contractInfo) return null;

  const contractLink = pdfBlob || contractInfo.downloadUrl;
  const contractNo = contractInfo.processId?.substring(0, 8) + '...' || 'Hợp đồng';
  
  // Chỉ sử dụng Google Docs Viewer để tránh lỗi X-Frame-Options
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(contractLink)}&embedded=true`;

  return (
    <Modal
      title={
        <div className="flex items-center justify-between bg-gray-100 -mx-6 -mt-4 px-6 py-3 border-b">
          <span className="flex items-center">
            <FilePdfOutlined className="text-red-500 mr-2" />
            <span className="font-medium">{contractNo}</span>
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Google Docs Viewer</span>
            {imageError && <span className="text-red-500 text-xs">❌ Lỗi tải</span>}
          </div>
        </div>
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
          icon={<FilePdfOutlined />}
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
      destroyOnClose={false} // Không destroy để tránh lỗi khi mở lại
      forceRender={true} // Force render để đảm bảo content được tạo
    >
      <div className="w-full h-full flex flex-col" style={{ backgroundColor: '#525659' }}>
        {/* PDF Display - Acrobat Style */}
        <div 
          className="flex-1 overflow-auto flex justify-center"
          style={{
            backgroundColor: '#525659',
            padding: '20px 0'
          }}
        >
          <div className="bg-white shadow-lg relative" style={{ maxWidth: '100%' }}>
            {/* Loading indicator */}
            {pdfLoading && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                <div className="text-center">
                  <Spin size="large" />
                  <p className="mt-4 text-gray-600 text-lg">Đang tải PDF...</p>
                  <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát</p>
                </div>
              </div>
            )}
            
            {/* Chỉ sử dụng Google Docs Viewer */}
            <iframe
              key={visible ? 'pdf-frame' : 'hidden'} // Force re-render khi mở lại
              src={viewerUrl}
              title={`Hợp đồng ${contractNo}`}
              style={{ 
                width: '100%', 
                height: '85vh',
                minWidth: '800px',
                border: 'none',
                display: 'block',
                opacity: pdfLoading ? 0 : 1,
                transition: 'opacity 0.3s ease'
              }}
              onError={() => {
                console.error('PDF iframe load error');
                setImageError(true);
                setPdfLoading(false);
              }}
              onLoad={() => {
                console.log('PDF iframe loaded successfully');
                setImageError(false);
                // Delay một chút để Google Docs Viewer render content
                setTimeout(() => {
                  setPdfLoading(false);
                }, 1500);
              }}
            />
            
            {/* Fallback nếu Google Docs Viewer không tải được */}
            {imageError && (
              <div className="p-8 text-center text-gray-600 bg-white">
                <FilePdfOutlined className="text-4xl text-red-500 mb-4" />
                <p className="text-lg mb-4">Không thể hiển thị PDF qua Google Docs Viewer</p>
                <Button 
                  type="primary" 
                  icon={<FilePdfOutlined />}
                  href={contractLink} 
                  target="_blank"
                  className="bg-blue-500 border-blue-500"
                >
                  Mở trong tab mới
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Hướng dẫn sử dụng - Acrobat style */}
      <div className="text-center text-gray-300 text-xs py-2" style={{ backgroundColor: '#525659' }}>
        <p>💡 PDF Viewer - Sử dụng scroll để xem toàn bộ tài liệu</p>
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
