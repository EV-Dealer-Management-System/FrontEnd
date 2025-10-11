import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Typography, Space, message, Spin, Result, Slider, Row, Col } from 'antd';
import { FilePdfOutlined, DownloadOutlined, ArrowLeftOutlined, ReloadOutlined, EyeOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import PDFModal from '../Admin/SignContract/Components/PDF/PDFModal';
import PDFViewer from '../Admin/SignContract/Components/PDF/PDFViewer';

const { Title, Text } = Typography;

function ContractView() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // States for PDF handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [contractToken, setContractToken] = useState(null);
  const [contractInfo, setContractInfo] = useState({
    fileName: 'hop-dong.pdf',
    title: 'Hợp đồng điện tử'
  });
  
  // PDF Modal and Inline viewer states
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [showInlineViewer, setShowInlineViewer] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.5);

  // Extract token from URL - tham khảo từ ContractPage.jsx
  const extractTokenFromUrl = useCallback(() => {
    try {
      const urlParams = new URLSearchParams(location.search);
      const urlMatch = urlParams.get('Url') || urlParams.get('url');
      const url = urlMatch ? urlMatch : null;
      if (!url) {
        throw new Error('Không tìm thấy URL trong URL');
      }

      return url;
    } catch (error) {
      console.error('Error extracting URL:', error);
      return null;
    }
  }, [location.search]);

  // Load PDF preview từ API /EContract/preview - tham khảo từ ContractPage.jsx
  const loadPdfPreview = useCallback(async (token) => {
    if (!token) {
      setError('Token không hợp lệ');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading PDF with token:', token);
      
      // Gọi API qua backend proxy để tránh CORS - giống ContractPage
      const response = await api.get('/EContract/preview', {
        params: { token },
        responseType: 'blob',
        timeout: 30000
      });
      
      if (response.status === 200) {
        // Tạo blob URL từ PDF binary data
        const pdfBlobData = new Blob([response.data], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(pdfBlobData);
        
        // Cleanup old blob URL
        if (pdfBlobUrl) {
          URL.revokeObjectURL(pdfBlobUrl);
        }
        
        setPdfBlob(pdfBlobData);
        setPdfBlobUrl(blobUrl);
        
        // Set contract info
        setContractInfo({
          fileName: `hop-dong-${token.substring(0, 8)}.pdf`,
          title: `Hợp đồng điện tử - ${token.substring(0, 8)}...`
        });
        
        console.log('✅ PDF loaded successfully');
        return true;
      } else {
        throw new Error('API trả về status không hợp lệ');
      }
    } catch (error) {
      console.error('Error loading PDF preview:', error);
      
      let errorMessage = 'Không thể tải PDF';
      if (error.response?.status === 404) {
        errorMessage = 'Hợp đồng không tồn tại hoặc đã hết hạn';
      } else if (error.response?.status === 401) {
        errorMessage = 'Token không hợp lệ hoặc đã hết hạn';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Timeout - Vui lòng thử lại';
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [pdfBlobUrl]);

  // Download PDF file
  const handleDownload = useCallback(() => {
    if (!pdfBlobUrl || !pdfBlob) {
      message.warning('Không có file PDF để tải xuống');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = pdfBlobUrl;
      link.download = contractInfo.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('Đang tải file PDF...');
    } catch (error) {
      console.error('Download error:', error);
      message.error('Có lỗi khi tải file');
    }
  }, [pdfBlobUrl, pdfBlob, contractInfo.fileName]);

  // Open PDF in new tab
  const handleOpenInNewTab = useCallback(() => {
    if (!pdfBlobUrl) {
      message.warning('Không có PDF để mở');
      return;
    }

    try {
      window.open(pdfBlobUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Open in new tab error:', error);
      message.error('Có lỗi khi mở PDF');
    }
  }, [pdfBlobUrl]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1.5);
  }, []);

  // Retry loading
  const handleRetry = useCallback(() => {
    if (contractToken) {
      loadPdfPreview(contractToken);
    }
  }, [contractToken, loadPdfPreview]);

  // Initialize - extract token and load PDF
  useEffect(() => {
    const url = extractTokenFromUrl();

    if (!url) {
      setError('URL không chứa token hợp lệ');
      setLoading(false);
      return;
    }
    const decodedUrl = decodeURIComponent(url);
    setContractToken(decodedUrl);
    loadPdfPreview(decodedUrl);
  }, [location.search]);

  // Cleanup blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center p-8 max-w-md">
          <Spin size="large" />
          <div className="mt-4">
            <Title level={4} className="text-gray-700">Đang tải hợp đồng...</Title>
            <Text className="text-gray-500">Vui lòng đợi trong giây lát</Text>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center p-8 max-w-md">
          <Result
            status="error"
            title="Không thể tải hợp đồng"
            subTitle={error}
            extra={[
              <Button type="primary" key="retry" onClick={handleRetry} icon={<ReloadOutlined />}>
                Thử lại
              </Button>,
              <Button key="back" onClick={() => navigate('/')}>
                Về trang chủ
              </Button>
            ]}
          />
        </Card>
      </div>
    );
  }

  // Success state - PDF loaded
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className={`mx-auto px-4 ${showInlineViewer ? 'max-w-7xl' : 'max-w-4xl'}`}>
        {/* Header */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/')}
                className="mr-4"
              >
                Quay lại
              </Button>
              <div>
                <Title level={3} className="mb-1 flex items-center">
                  <FilePdfOutlined className="text-red-500 mr-3" />
                  {contractInfo.title}
                </Title>
                <Text className="text-gray-600">
                  Xem và tải xuống hợp đồng điện tử
                </Text>
              </div>
            </div>
          </div>
        </Card>
 {/* Contract Info */}
        <Card title="Thông tin hợp đồng">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Text strong>Tên file:</Text>
              <Text className="text-gray-600 font-mono">{contractInfo.fileName}</Text>
            </div>
            <div className="flex justify-between">
              <Text strong>Trạng thái:</Text>
              <Text className="text-green-600 font-semibold">✅ Sẵn sàng xem</Text>
            </div>
          </div>
        </Card>
        {/* PDF Actions */}
        <Card className="mb-6">
          <div className="text-center py-6">
            <FilePdfOutlined className="text-6xl text-red-400 mb-4" />
            <Title level={4} className="mb-4">Hợp đồng đã sẵn sàng</Title>
            
            
            <Space size="large" wrap>
              <Button
                type="primary"
                size="large"
                icon={<EyeOutlined />}
                onClick={() => setShowInlineViewer(!showInlineViewer)}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {showInlineViewer ? 'Ẩn PDF' : 'Xem PDF'}
              </Button>
              
             
              
              <Button
                size="large"
                icon={<FilePdfOutlined />}
                onClick={handleOpenInNewTab}
              >
                Mở tab mới
              </Button>
              
              <Button
                type="primary"
                size="large"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                className="bg-green-500 hover:bg-green-600"
              >
                Tải xuống
              </Button>
            </Space>
          </div>
        </Card>

        {/* Inline PDF Viewer */}
        {showInlineViewer && pdfBlobUrl && (
          <Card 
            title={
              <div className="flex items-center justify-between">
                <span>PDF Viewer</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    Zoom: {Math.round(zoomLevel * 100)}%
                  </span>
                  <Space>
                    <Button 
                      size="small" 
                      icon={<ZoomOutOutlined />} 
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 0.5}
                    />
                    <Button 
                      size="small" 
                      onClick={handleZoomReset}
                      type={zoomLevel === 1.5 ? 'primary' : 'default'}
                    >
                      150%
                    </Button>
                    <Button 
                      size="small" 
                      icon={<ZoomInOutlined />} 
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 3.0}
                    />
                  </Space>
                </div>
              </div>
            }
            className="mb-6"
          >
            {/* Zoom Slider */}
            <div className="mb-4 px-4">
              <Row align="middle" gutter={16}>
                <Col span={2}>
                  <span className="text-xs text-gray-500">50%</span>
                </Col>
                <Col span={20}>
                  <Slider
                    min={0.5}
                    max={3.0}
                    step={0.25}
                    value={zoomLevel}
                    onChange={setZoomLevel}
                    tooltip={{
                      formatter: (value) => `${Math.round(value * 100)}%`
                    }}
                  />
                </Col>
                <Col span={2} className="text-right">
                  <span className="text-xs text-gray-500">300%</span>
                </Col>
              </Row>
            </div>
            
            {/* PDF Viewer Container */}
            <div className="border rounded-lg bg-white max-h-[80vh] overflow-auto flex justify-center">
              <PDFViewer
                contractNo={contractToken?.substring(0, 8) || 'PDF'}
                pdfUrl={pdfBlobUrl}
                showAllPages={true}
                scale={zoomLevel}
              />
            </div>
          </Card>
        )}

       

        {/* PDF Modal */}
        
      </div>
    </div>
  );
}

export default ContractView;