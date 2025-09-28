import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
  Alert,
  Radio,
  Tabs,
  Upload,
  Image
} from 'antd';
import { UserAddOutlined, ShopOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined, FilePdfOutlined, EditOutlined, CheckOutlined, ClearOutlined, UploadOutlined, PictureOutlined, ExpandOutlined } from '@ant-design/icons';
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
  onNewContract,
  viewerLink
}) => {
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const embedUrl = viewerLink || contractLink;
  
  return (
  <>
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
                message={<span className="text-green-600 font-semibold">✅ Hợp đồng đã được ký thành công!</span>}
            type="success"
            className="mb-4"
          />
        )}
        
        {/* PDF Display */}
        <div className="mt-6 mb-6">
          <div className="border border-gray-300 rounded-lg overflow-hidden min-h-[720px] h-[88vh]">
            <object data={embedUrl} type="application/pdf" className="w-full h-full">
              <iframe
                src={embedUrl}
                title="PDF"
                className="w-full h-full border-0"
              />
              <div className="p-4 text-center text-sm text-gray-600">
                Không thể hiển thị PDF trực tiếp. Bạn có thể
                {' '}<a href={contractLink} target="_blank" rel="noreferrer" className="text-blue-600">mở trong tab mới</a>.
              </div>
            </object>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between items-center mt-4">
          <Space>
            <Button 
              type="primary" 
              icon={<PictureOutlined />}
              onClick={() => setPdfModalVisible(true)}
              className="bg-blue-500 border-blue-500 hover:bg-blue-600"
            >
              Xem PDF phóng to
            </Button>
            
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
    
    {/* PDF Viewer Modal */}
    <PDFViewerModal
      visible={pdfModalVisible}
      onCancel={() => setPdfModalVisible(false)}
      contractLink={contractLink}
      contractNo={contractNo}
      viewerLink={viewerLink}
    />
  </>
)};

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

// PDF Viewer Modal component - Hiển thị PDF giống Adobe Acrobat
const PDFViewerModal = ({ 
  visible, 
  onCancel, 
  contractLink, 
  contractNo,
  viewerLink 
}) => {
  const [currentService, setCurrentService] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  const services = [
    {
      name: "Google Docs Viewer",
      url: `https://docs.google.com/gview?url=${encodeURIComponent(contractLink)}&embedded=true`,
    },
    {
      name: "PDF.js Viewer", 
      url: `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(contractLink)}`,
    },
    {
      name: "Original PDF",
      url: contractLink,
    }
  ];

  const currentUrl = viewerLink || services[currentService].url;
  
  const handleServiceChange = () => {
    setCurrentService((prev) => (prev + 1) % services.length);
    setImageError(false);
  };
  
  return (
    <Modal
      title={
        <div className="flex items-center justify-between bg-gray-100 -mx-6 -mt-4 px-6 py-3 border-b">
          <span className="flex items-center">
            <FilePdfOutlined className="text-red-500 mr-2" />
            <span className="font-medium">{contractNo}</span>
          </span>
          <div className="flex items-center space-x-2">
            <Button size="small" onClick={handleServiceChange} className="text-xs">
              Viewer: {services[currentService].name}
            </Button>
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
          href={contractLink} 
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
      <div className="w-full h-full flex flex-col" style={{ backgroundColor: '#525659' }}>
        {/* PDF Display - Acrobat Style */}
        <div 
          className="flex-1 overflow-auto flex justify-center"
          style={{
            backgroundColor: '#525659',
            padding: '20px 0'
          }}
        >
          <div className="bg-white shadow-lg" style={{ maxWidth: '100%' }}>
            {currentService === 2 ? (
              // Hiển thị PDF trực tiếp
              <object 
                data={currentUrl} 
                type="application/pdf" 
                style={{ 
                  width: '100%', 
                  height: '85vh',
                  minWidth: '800px',
                  display: 'block'
                }}
                onError={() => setImageError(true)}
              >
                <iframe
                  src={currentUrl}
                  title={`Hợp đồng ${contractNo}`}
                  style={{ 
                    width: '100%', 
                    height: '85vh',
                    minWidth: '800px',
                    border: 'none',
                    display: 'block'
                  }}
                  onError={() => setImageError(true)}
                />
                <div className="p-8 text-center text-gray-600 bg-white">
                  <FilePdfOutlined className="text-4xl text-red-500 mb-4" />
                  <p className="text-lg mb-4">Không thể hiển thị PDF trực tiếp</p>
                  <Button 
                    type="primary" 
                    icon={<EnvironmentOutlined />}
                    href={contractLink} 
                    target="_blank"
                    className="bg-blue-500 border-blue-500"
                  >
                    Mở trong tab mới
                  </Button>
                </div>
              </object>
            ) : (
              // Hiển thị qua iframe với các service viewer
              <iframe
                src={currentUrl}
                title={`Hợp đồng ${contractNo}`}
                style={{ 
                  width: '100%', 
                  height: '85vh',
                  minWidth: '800px',
                  border: 'none',
                  display: 'block'
                }}
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
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
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signingLoading, setSigningLoading] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);
  const [signatureDisplayMode, setSignatureDisplayMode] = useState(2); // 1: Chỉ văn bản, 2: Văn bản và hình ảnh, 3: Chỉ hình ảnh
  const [signatureMethod, setSignatureMethod] = useState('draw'); // 'draw' hoặc 'upload'
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageBase64, setUploadedImageBase64] = useState('');
  const signatureRef = useRef(null);

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
    } catch (e) {
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

  // Handle contract signing
  const handleSignContract = async () => {
    // Kiểm tra chữ ký dựa trên method và display mode
    if (signatureDisplayMode === 2 || signatureDisplayMode === 3) {
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
    }

    setSigningLoading(true);
    try {
      // Lấy signature data dựa trên method được chọn
      let signatureDataURL = '';
      if (signatureDisplayMode === 2 || signatureDisplayMode === 3) {
        signatureDataURL = getSignatureData();
        
        if (!signatureDataURL) {
          message.error('Không thể lấy dữ liệu chữ ký. Vui lòng thử lại!');
          setSigningLoading(false);
          return;
        }
      }
      
      const signContractApi = SignContract();
      
      const signData = {
        waitingProcess: waitingProcessData,
        reason: "Ký hợp đồng đại lý",
        reject: false,
        signatureImage: signatureDataURL,
        signingPage: 0,
        signingPosition: "10,110,202,200",
        signatureText: "Chữ ký điện tử",
        fontSize: 14,
        showReason: true,
        confirmTermsConditions: true,
        signatureDisplayMode: signatureDisplayMode // Sử dụng giá trị được chọn
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
      
      // Kiểm tra response theo cấu trúc mới: statusCode 200 và isSuccess true
      if (result && result.statusCode === 200 && result.isSuccess) {
        // Hiển thị thông báo từ API
        const apiMessage = result.message || 'Ký hợp đồng thành công!';
        message.success(apiMessage);
        
        setContractSigned(true);
        setShowSignatureModal(false);
        
        // Lấy dữ liệu hợp đồng đã ký từ result.result.data
        const signedContractData = result.result?.data;
        
        if (signedContractData && signedContractData.downloadUrl) {
          const newDownloadUrl = signedContractData.downloadUrl;
          const newContractNo = signedContractData.no || contractNo;
          const contractId = signedContractData.id;
          const contractStatus = signedContractData.status?.description || 'Processing';
          
          console.log('Updating contract with signed version:', {
            id: contractId,
            status: contractStatus,
            oldUrl: contractLink,
            newUrl: newDownloadUrl,
            contractNo: newContractNo,
            fileSize: signedContractData.file?.size,
            fileName: signedContractData.file?.name
          });
          
          // Cập nhật link hợp đồng với phiên bản đã ký
          setContractLink(newDownloadUrl);
          setContractNo(newContractNo);
          
          // Hiển thị thông báo chi tiết về việc ký thành công
          message.success({
            content: (
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  ✅ {apiMessage}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Hợp đồng số: {newContractNo} | Trạng thái: {contractStatus}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Đang hiển thị phiên bản đã ký
                </div>
              </div>
            ),
            duration: 5
          });
        } else {
          // API thành công nhưng không có downloadUrl
          message.warning('Ký hợp đồng thành công nhưng không tìm thấy link tải về');
        }
      } else {
        // Xử lý lỗi - hiển thị message từ API nếu có
        const errorMessage = result?.message || 
                           result?.result?.messages?.[0] || 
                           'Có lỗi khi ký hợp đồng';
        message.error(errorMessage);
        
        console.error('Sign contract failed:', {
          statusCode: result?.statusCode,
          isSuccess: result?.isSuccess,
          message: result?.message,
          apiMessages: result?.result?.messages
        });
      }
    } catch (error) {
      console.error('Error signing contract:', error);
      message.error('Có lỗi không mong muốn khi ký hợp đồng');
    } finally {
      setSigningLoading(false);
    }
  };

  // Function xử lý upload ảnh
  const handleImageUpload = (info) => {
    const { file } = info;
    
    if (file.status === 'done' || file.type) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setUploadedImageBase64(base64);
        setUploadedImage(file);
        message.success('Ảnh đã được tải lên thành công!');
      };
      reader.readAsDataURL(file.originFileObj || file);
    }
  };

  // Function kiểm tra file upload
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ có thể tải lên file ảnh!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Kích thước ảnh phải nhỏ hơn 5MB!');
      return false;
    }
    
    return true;
  };

  // Function lấy signature data từ method được chọn
  const getSignatureData = () => {
    if (signatureMethod === 'upload') {
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
    
    // Lấy canvas element
    const canvas = signatureRef.current.getCanvas();
    
    // Tạo một canvas mới với nền trắng để đảm bảo PNG có nền trắng
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
  
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);
    
    // Chuyển thành PNG base64 với format đầy đủ: data:image/png;base64,iVBORw0KGgoAAAA...
    const dataURL = tempCanvas.toDataURL('image/png', 1.0); // Chất lượng cao nhất
    return dataURL; // Trả về format đầy đủ bao gồm prefix
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
        setContractSigned(false);
        setShowSignatureModal(false);
        setSigningLoading(false);
        setSignatureDisplayMode(2);
        setSignatureMethod('draw');
        setUploadedImage(null);
        setUploadedImageBase64('');
        setWards([]);
        clearAllSignatureData();
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
              <ContractDisplay
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
        <Modal
          title={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <EditOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
              Ký Hợp Đồng Điện Tử
            </span>
          }
          open={showSignatureModal}
          onCancel={() => setShowSignatureModal(false)}
          footer={null}
          width={600}
          centered
        >
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Alert
              message="Vui lòng chọn loại chữ ký và vẽ chữ ký của bạn trong khung bên dưới"
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
                  <Radio value={1}>
                    <span style={{ fontWeight: '500' }}>Chỉ văn bản</span>
                    <div style={{ fontSize: '12px', color: '#666', marginLeft: '24px' }}>
                      Hiển thị chữ ký dưới dạng văn bản "Chữ ký điện tử"
                    </div>
                  </Radio>
                  <Radio value={2}>
                    <span style={{ fontWeight: '500' }}>Văn bản và hình ảnh</span>
                    <div style={{ fontSize: '12px', color: '#666', marginLeft: '24px' }}>
                      Hiển thị cả văn bản và hình ảnh chữ ký bạn vẽ
                    </div>
                  </Radio>
                  <Radio value={3}>
                    <span style={{ fontWeight: '500' }}>Chỉ hình ảnh</span>
                    <div style={{ fontSize: '12px', color: '#666', marginLeft: '24px' }}>
                      Chỉ hiển thị hình ảnh chữ ký bạn vẽ
                    </div>
                  </Radio>
                </Space>
              </Radio.Group>
            </div>
            
            {/* Tabs cho việc vẽ chữ ký hoặc upload ảnh - chỉ hiển thị khi cần hình ảnh */}
            {(signatureDisplayMode === 2 || signatureDisplayMode === 3) && (
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
            
            {/* Thông báo khi chọn chỉ văn bản */}
            {signatureDisplayMode === 1 && (
              <div style={{
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#f9f9f9',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '16px', color: '#1890ff', marginBottom: '8px' }}>
                  📝 Chế độ chỉ văn bản
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Chữ ký sẽ hiển thị dưới dạng văn bản "Chữ ký điện tử" trên hợp đồng
                </div>
              </div>
            )}

            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              marginBottom: '16px',
              textAlign: 'left'
            }}>
              <strong>Lưu ý:</strong> 
              {signatureMethod === 'draw' 
                ? ' Chữ ký vẽ tay sẽ được chuyển đổi thành định dạng PNG base64'
                : ' Ảnh upload sẽ được chuyển đổi thành định dạng base64'
              } để gửi lên server
            </div>

            <Space size="large">
              {(signatureDisplayMode === 2 || signatureDisplayMode === 3) && (
                <Button
                  icon={<ClearOutlined />}
                  onClick={clearAllSignatureData}
                  style={{ minWidth: '100px' }}
                >
                  Xóa tất cả
                </Button>
              )}
              
              <Button
                onClick={() => setShowSignatureModal(false)}
                style={{ minWidth: '100px' }}
              >
                Hủy
              </Button>
              
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleSignContract}
                loading={signingLoading}
                style={{ 
                  minWidth: '100px',
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a'
                }}
              >
                {signingLoading ? 'Đang ký...' : 'Ký Hợp Đồng'}
              </Button>
            </Space>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CreateAccount;