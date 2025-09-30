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
import { UserAddOutlined, ShopOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined, FilePdfOutlined, EditOutlined, CheckOutlined, ClearOutlined, UploadOutlined, PictureOutlined, InfoCircleOutlined } from '@ant-design/icons';
import SignatureCanvas from 'react-signature-canvas';
import { locationApi } from '../../Api/api';
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
        
        {!contractLink && (
          <Alert
            message={<span className="text-yellow-600 font-semibold">⚠️ Không thể tải PDF. Vui lòng thử lại hoặc tải xuống để xem.</span>}
            type="warning"
            className="mb-4"
          />
        )}
        
        {contractSigned && (
          <Alert
                message={<span className="text-green-600 font-semibold">✅ Hợp đồng đã được ký thành công!</span>}
            type="success"
            className="mb-4"
          />
        )}
        
        {/* PDF Display */}
        <div className="mt-6 mb-6">
          <div className="border border-gray-300 rounded-lg overflow-hidden min-h-[750px] h-[calc(100vh-320px)]">
            <iframe 
              src={`https://docs.google.com/gview?url=${encodeURIComponent(contractLink)}&embedded=true`}
              title="Google Docs PDF Viewer"
              className="w-full h-full border-0"
              onError={(e) => {
                console.error('Google Docs Viewer failed to load:', e);
                message.warning('Không thể tải PDF qua Google Docs. Thử tải trực tiếp...');
              }}
            />
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
              title="Xem PDF toàn màn hình"
            >
              Xem toàn màn hình
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


// PDF Viewer Modal component - Hiển thị PDF giống Adobe Acrobat
const PDFViewerModal = ({ 
  visible, 
  onCancel, 
  contractLink, 
  contractNo,
  viewerLink 
}) => {
  const [currentService, setCurrentService] = useState(0); // Default to Google Docs Viewer
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
            <Button 
              type="primary" 
              size="small" 
              danger 
              onClick={onCancel}
              className="text-xs"
            >
              Thoát Toàn Màn Hình
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
      width="100vw"
      style={{ 
        top: 0,
        margin: 0,
        padding: 0,
        maxWidth: '100vw'
      }}
      styles={{
        header: {
          padding: '10px 16px',
          background: '#333',
          color: 'white',
          borderBottom: '1px solid #222'
        },
        body: { 
          height: 'calc(100vh - 110px)', 
          padding: '0',
          backgroundColor: '#525659',
          overflow: 'hidden'
        },
        mask: {
          backgroundColor: 'rgba(0,0,0,0.85)'
        },
        wrapper: {
          maxWidth: '100vw'
        },
        content: {
          padding: 0
        }
      }}
      destroyOnClose={true}
    >
      <div className="w-full h-full flex flex-col" style={{ backgroundColor: '#525659' }}>
        {/* PDF Display - Acrobat Style Fullscreen */}
        <div 
          className="flex-1 overflow-hidden flex justify-center"
          style={{
            backgroundColor: '#525659',
            padding: '0'
          }}
        >
          <div className="bg-white shadow-lg" style={{ width: '100%', height: '100%', maxWidth: '100%', display: 'flex', justifyContent: 'center' }}>
            {currentService === 2 ? (
              // Hiển thị PDF trực tiếp - sử dụng iframe với Mozilla PDF.js nếu browser không hỗ trợ
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
                  src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(contractLink)}`}
                  title={`Hợp đồng ${contractNo}`}
                  style={{ 
                    width: '100%', 
                    height: '90vh',
                    minWidth: '100%',
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
                  height: '90vh',
                  minWidth: '100%',
                  maxWidth: '100%',
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
      <div className="flex justify-between items-center text-gray-300 text-xs px-4 py-2" style={{ backgroundColor: '#333', borderTop: '1px solid #222' }}>
        <div className="flex items-center">
          <span className="mr-2">💡</span>
          <span>Sử dụng scroll để xem toàn bộ tài liệu</span>
        </div>
        <div>
          <span>Hợp đồng số: <strong>{contractNo}</strong></span>
        </div>
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
  const [signatureDisplayMode, setSignatureDisplayMode] = useState(2); // 2: Văn bản và hình ảnh, 3: Kết hợp ảnh và chữ ký
  const [signatureMethod, setSignatureMethod] = useState('draw'); // 'draw' hoặc 'upload'
  const [uploadedImageBase64, setUploadedImageBase64] = useState('');
  const [showAppVerifyModal, setShowAppVerifyModal] = useState(false);
  const [signatureCompleted, setSignatureCompleted] = useState(false);
  const [showSmartCAModal, setShowSmartCAModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
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

  // Handle digital signature (Step 1)
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

    try {
      // Lấy signature data dựa trên method được chọn
      let signatureDataURL = '';
      try {
        const signatureData = getSignatureData();
        
        // Xử lý async cho combined signature
        if (signatureDisplayMode === 3 && signatureData instanceof Promise) {
          console.log('Processing combined signature...');
          signatureDataURL = await signatureData;
          console.log('Combined signature completed:', signatureDataURL ? 'Success' : 'Failed');
        } else {
          signatureDataURL = signatureData;
        }
        
        if (!signatureDataURL) {
          message.error('Không thể lấy dữ liệu chữ ký. Vui lòng thử lại!');
          return;
        }

        // Set preview image
        setPreviewImage(signatureDataURL);
        
        // Tiến hành ký trực tiếp
        handleSignature(signatureDataURL);
        
      } catch (error) {
        console.error('Error getting signature data:', error);
        message.error(`Lỗi xử lý chữ ký: ${error.message}`);
        return;
      }
    } catch (error) {
      console.error('Error in digital signature:', error);
      message.error('Có lỗi không mong muốn khi ký điện tử');
    }
  };

  // Handle signature directly
  const handleSignature = async (signatureData) => {
    try {
      if (!contractId || !previewImage) {
        message.error('Không thể xác nhận vị trí chữ ký. Thiếu thông tin hợp đồng hoặc chữ ký.');
        return;
      }

      // Chuyển sang trạng thái xác thực
      setShowSignatureModal(false);
      setSigningLoading(true);
      setShowSmartCAModal(true);
      
      const signContractApi = SignContract();
      
      // Sử dụng vị trí cố định thay vì chọn vị trí
      const positionString = "32,472,202,562";
      
      console.log('Signature position:', positionString);
      
      const signData = {
        waitingProcess: waitingProcessData,
        reason: "Ký hợp đồng đại lý",
        reject: false,
        signatureImage: signatureData,
        signingPage: 0,
        signingPosition: positionString,
        signatureText: "EVM COMPANY",
        fontSize: 14,
        showReason: true,
        confirmTermsConditions: true,
        signatureDisplayMode: signatureDisplayMode // Sử dụng giá trị được chọn
      };

      console.log('Signature data format:', {
        fullDataURL: previewImage.substring(0, 100) + '...',
        dataURLLength: previewImage.length,
        processId: contractId,
        waitingProcess: waitingProcessData,
        hasCorrectPrefix: previewImage.startsWith('data:image/png;base64,'),
        position: positionString
      });

      const result = await signContractApi.handleSignContract(signData);
      
      console.log('Digital signature result:', JSON.stringify(result, null, 2));
      
      // Ký điện tử thành công, chuyển sang bước xác thực app
      if (result && result.statusCode === 200 && result.isSuccess) {
        setSignatureCompleted(true);
        setShowSmartCAModal(false);
        setShowAppVerifyModal(true);
        message.success('Ký điện tử thành công! Vui lòng xác thực trên ứng dụng.');
      } else {
        // Xử lý lỗi ký điện tử
        const errorMessage = result?.message || 
                           result?.result?.messages?.[0] || 
                           'Có lỗi khi ký điện tử';
        message.error(errorMessage);
        setShowSmartCAModal(false);
      }
    } catch (error) {
      console.error('Error in digital signature:', error);
      message.error('Có lỗi không mong muốn khi ký điện tử');
      setShowSmartCAModal(false);
    } finally {
      setSigningLoading(false);
    }
  };

  // Handle app verification (Step 2)
  const handleAppVerification = async () => {
    if (!signatureCompleted) {
      message.error('Vui lòng hoàn thành ký điện tử trước!');
      return;
    }
    
    setSigningLoading(true);
    try {
      setShowAppVerifyModal(false);
      setContractSigned(true);
      // Hiển thị popup thành công cuối cùng
      Modal.success({
        title: (
          <span className="text-green-600 font-semibold flex items-center">
            <CheckOutlined className="mr-2" />
            Ký Hợp Đồng Hoàn Tất!
          </span>
        ),
        content: (
          <div className="py-4">
            <div className="text-base mb-3">🎉 Hợp đồng đã được ký và xác thực thành công!</div>
            <div className="text-sm text-gray-600">
              Hợp đồng số: <strong>{contractNo}</strong>
            </div>
            <div className="text-sm text-gray-600">
              Trạng thái: <strong className="text-green-600">Đã ký và xác thực ✅</strong>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Hợp đồng đã được hoàn tất với chữ ký điện tử và xác thực từ ứng dụng
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
    } catch (error) {
      console.error('Error in app verification:', error);
      message.error('Có lỗi khi xác thực từ ứng dụng');
    } finally {
      setSigningLoading(false);
    }
  };



  // Function xử lý upload ảnh
  const handleImageUpload = (info) => {
    const { file } = info;
    
    // Xử lý file khi upload thành công hoặc khi có file type
    if (file.status === 'done' || file.type) {
      const fileToRead = file.originFileObj || file;
      
      if (fileToRead) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target.result;
          console.log('Image uploaded and converted to base64:', {
            fileName: fileToRead.name,
            fileSize: fileToRead.size,
            fileType: fileToRead.type,
            base64Prefix: base64.substring(0, 50) + '...'
          });
          setUploadedImageBase64(base64);
          message.success('Ảnh đã được tải lên thành công!');
        };
        reader.onerror = () => {
          message.error('Lỗi khi đọc file ảnh!');
        };
        reader.readAsDataURL(fileToRead);
      }
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

  // Function kết hợp ảnh upload và chữ ký vẽ tay thành một ảnh
  const getCombinedSignatureData = () => {
    if (!uploadedImageBase64 || !signatureRef.current || signatureRef.current.isEmpty()) {
      return null;
    }

    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Tạo ảnh từ uploaded image - sử dụng document.createElement
        const uploadedImg = document.createElement('img');
        uploadedImg.onload = () => {
          try {
            // Lấy signature data trước
            const signatureDataURL = getSignatureAsFullDataURL();
            if (!signatureDataURL) {
              reject(new Error('Không thể lấy dữ liệu chữ ký'));
              return;
            }
            
            // Tạo ảnh từ signature canvas
            const signatureImg = document.createElement('img');
            
            signatureImg.onload = () => {
              try {
                // Tính toán kích thước canvas kết hợp
                const padding = 20;
                const maxWidth = Math.max(uploadedImg.width, signatureImg.width);
                const totalHeight = uploadedImg.height + signatureImg.height + padding;
                
                canvas.width = maxWidth;
                canvas.height = totalHeight;
                
                // Vẽ nền trắng
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Vẽ ảnh upload ở trên (căn giữa)
                const uploadX = (maxWidth - uploadedImg.width) / 2;
                ctx.drawImage(uploadedImg, uploadX, 0, uploadedImg.width, uploadedImg.height);
                
                // Vẽ chữ ký ở dưới (căn giữa)
                const signatureX = (maxWidth - signatureImg.width) / 2;
                const signatureY = uploadedImg.height + padding;
                ctx.drawImage(signatureImg, signatureX, signatureY, signatureImg.width, signatureImg.height);
                
                // Chuyển thành base64 và trả về
                const combinedDataURL = canvas.toDataURL('image/png', 1.0);
                console.log('Combined signature created successfully:', {
                  uploadedImgSize: `${uploadedImg.width}x${uploadedImg.height}`,
                  signatureImgSize: `${signatureImg.width}x${signatureImg.height}`,
                  canvasSize: `${canvas.width}x${canvas.height}`,
                  dataURLPrefix: combinedDataURL.substring(0, 50) + '...'
                });
                resolve(combinedDataURL);
              } catch (error) {
                console.error('Error drawing combined signature:', error);
                reject(error);
              }
            };
            
            signatureImg.onerror = () => {
              reject(new Error('Không thể load ảnh chữ ký'));
            };
            
            signatureImg.src = signatureDataURL;
          } catch (error) {
            console.error('Error processing signature:', error);
            reject(error);
          }
        };
        
        uploadedImg.onerror = () => {
          reject(new Error('Không thể load ảnh upload'));
        };
        
        // Đảm bảo uploadedImageBase64 có định dạng đúng
        if (!uploadedImageBase64.startsWith('data:image/')) {
          reject(new Error('Định dạng ảnh upload không hợp lệ'));
          return;
        }
        
        uploadedImg.src = uploadedImageBase64;
      } catch (error) {
        console.error('Error in getCombinedSignatureData:', error);
        reject(error);
      }
    });
  };

  // Function lấy signature data từ method được chọn
  const getSignatureData = () => {
    if (signatureDisplayMode === 3) {
      // Trả về promise cho combined signature
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
        setShowAppVerifyModal(false);
        setShowSmartCAModal(false);
        setSignatureCompleted(false);
        setSigningLoading(false);
        setSignatureDisplayMode(2);
        setSignatureMethod('draw');
        setUploadedImageBase64('');
        setWards([]);

        setPreviewImage(null);
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
                          // Fake upload success to prevent HTTP request
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
                onClick={() => setShowSignatureModal(false)}
                style={{ minWidth: '100px' }}
              >
                Hủy
              </Button>
              
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleDigitalSignature}
                loading={signingLoading}
                style={{ 
                  minWidth: '100px',
                  backgroundColor: '#1890ff',
                  borderColor: '#1890ff'
                }}
              >
                {signingLoading ? 'Đang ký...' : 'Ký Điện Tử'}
              </Button>
            </Space>
          </div>
        </Modal>

        {/* VNPT SmartCA Modal - Signing Process */}
        <Modal
          title={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <EditOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
              Đang Thực Hiện Ký Điện Tử
            </span>
          }
          open={showSmartCAModal}
          onCancel={() => {
            setShowSmartCAModal(false);
            setSigningLoading(false);
          }}
          footer={null}
          width={500}
          centered
          closable={true}
        >
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Alert
              message={
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    📱 Vui lòng mở ứng dụng VNPT SmartCA để tiếp tục
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Hệ thống đang chờ bạn xác nhận ký điện tử trên ứng dụng
                  </div>
                </div>
              }
              type="info"
              style={{ marginBottom: '24px', textAlign: 'left' }}
            />
            
            <div style={{
              border: '2px dashed #1890ff',
              borderRadius: '8px',
              padding: '24px',
              backgroundColor: '#f0f8ff',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#1890ff', marginBottom: '12px' }}>
                VNPT SmartCA
              </div>
              <div style={{ fontSize: '14px', color: '#666', textAlign: 'left', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Các bước thực hiện:</strong>
                </div>
                <div style={{ marginBottom: '6px' }}>1. Mở ứng dụng <strong>VNPT SmartCA</strong> trên điện thoại</div>
                <div style={{ marginBottom: '6px' }}>2. Tìm thông báo ký điện tử cho hợp đồng số: <strong style={{ color: '#1890ff' }}>{contractNo}</strong></div>
                <div style={{ marginBottom: '6px' }}>3. Nhập mật khẩu hoặc xác thực sinh trắc học</div>
                <div style={{ marginBottom: '6px' }}>4. Xác nhận ký điện tử trong ứng dụng</div>
              </div>
              
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#fff7e6',
                borderRadius: '6px',
                border: '1px solid #ffd591'
              }}>
                <div style={{ fontSize: '14px', color: '#fa8c16', textAlign: 'center' }}>
                  <span style={{ marginRight: '8px' }}>⏳</span>
                  <strong>Đang chờ xác nhận từ VNPT SmartCA...</strong>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
              💡 <strong>Lưu ý:</strong> Nếu không nhận được thông báo trong ứng dụng, vui lòng kiểm tra kết nối internet và thử lại.
            </div>

            <Button
              onClick={() => {
                setShowSmartCAModal(false);
                setSigningLoading(false);
              }}
              style={{ minWidth: '120px' }}
            >
              Hủy Ký
            </Button>
          </div>
        </Modal>

        
        {/* App Verification Modal - Step 2 */}
        <Modal
          title={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <CheckOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
              Bước 2/2: Xác Thực Trên Ứng Dụng
            </span>
          }
          open={showAppVerifyModal}
          onCancel={() => setShowAppVerifyModal(false)}
          footer={null}
          width={500}
          centered
        >
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Alert
              message={
                <div>          
                </div>
              }
              type="success"
              style={{ marginBottom: '24px', textAlign: 'left' }}
            />
            
            <div style={{
              border: '2px dashed #52c41a',
              borderRadius: '8px',
              padding: '24px',
              backgroundColor: '#f6ffed',
              marginBottom: '24px'
            }}>
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#fff',
                borderRadius: '6px',
                border: '1px solid #d9d9d9'
              }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  🔒 Trạng thái hiện tại:
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#52c41a' }}>
                  ✓ Ký SmartCA hoàn tất
                </div>
              </div>
            </div>

            <Space size="large">
              <Button
                onClick={() => setShowAppVerifyModal(false)}
                style={{ minWidth: '120px' }}
              >
                Hủy
              </Button>
              
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleAppVerification}
                loading={signingLoading}
                style={{ 
                  minWidth: '120px',
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a'
                }}
              >
                {signingLoading ? 'Đang xác thực...' : 'OK'}
              </Button>
            </Space>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CreateAccount;