import React, { useState, useCallback, useEffect, use } from 'react';
import { Card, Form, Input, Button, Row, Col, Typography, Steps, Space, Tag, Divider, Modal, message } from 'antd';
import { FileTextOutlined, SafetyOutlined, EditOutlined, CheckCircleOutlined, FilePdfOutlined, ReloadOutlined, DownloadOutlined, ClockCircleOutlined, InfoCircleOutlined, CrownOutlined } from '@ant-design/icons';
import { useLocation } from "react-router-dom";
// Reuse service
import { ContractService } from '../../App/Home/SignContractCustomer';

import api from '../../api/api';

// Reuse components từ CreateAccount
import SignatureModal from '../Admin/SignContract/Components/SignatureModal';
import PDFModal from '../Admin/SignContract/Components/PDF/PDFModal';
import SmartCAModal from '../Admin/SignContract/Components/SmartCAModal';
import SmartCASelector from '../Admin/SignContract/Components/SmartCASelector';
import AddSmartCA from '../Admin/SignContract/Components/AddSmartCA';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

function ContractPage() {
  const [form] = Form.useForm();
  const contractService = ContractService();

  // States chính
  const [loading, setLoading] = useState(false);
  const [contractInfo, setContractInfo] = useState(null);
  const [smartCAInfo, setSmartCAInfo] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // PDF viewer - Phase 4: Sử dụng PDFModal với blob handling
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);  
  // New states cho blob handling như CreateContract
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  // Flow ký
  const [signingLoading, setSigningLoading] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);

  // Modal Thêm SmartCA
  const [smartCAVisible, setSmartCAVisible] = useState(false);
  const [addingSmartCA, setAddingSmartCA] = useState(false);
  const [smartCAForm] = Form.useForm();

  // States SmartCA Selector
  const [showSmartCAModal, setShowSmartCAModal] = useState(false);
  const [showSmartCASelector, setShowSmartCASelector] = useState(false);
  const [showExistingSmartCASelector, setShowExistingSmartCASelector] = useState(false);
  const [selectedSmartCA, setSelectedSmartCA] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const processCode = urlParams.get('processCode');

    //Nếu Url có processCode thì tự động điền và submit
    if (processCode) {
      form.setFieldsValue({ processCode });
      getContractInfo(processCode, { silent: true });
    }
  }, [location.search]);

  // Revoke PDF preview URL
  const revokePdfPreviewUrl = useCallback(() => {
    setPdfPreviewUrl(prevUrl => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      return null;
    });
  }, []);

  // Load PDF preview từ API /EContract/preview - theo CreateContract pattern
  const loadPdfPreview = useCallback(async (downloadUrl) => {
    if (!downloadUrl) return null;
    
    setPdfLoading(true);
    try {
      // Extract token từ downloadUrl (không decode)
      const tokenMatch = downloadUrl;
      const token = tokenMatch ? tokenMatch : null;

      if (!token) {
        console.log('Không tìm thấy token, dùng link gốc');
        return downloadUrl;
      }

      // Gọi API qua backend proxy để tránh CORS
    const response = await api.get(`/EContract/preview?`, {
      params: { downloadUrl },        // cách này sạch hơn so với nối string
      responseType: 'blob'
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
        
        // Backward compatibility với existing code
        setPdfPreviewUrl(blobUrl);
        
        return blobUrl;
      } else {
        return null; // Không fallback về downloadUrl để tránh CORS
      }
    } catch (error) {
      console.error('Error loading PDF preview:', error);
      return null; // Không fallback về downloadUrl để tránh CORS
    } finally {
      setPdfLoading(false);
    }
  }, [pdfBlobUrl]);

  // Build a display URL for PDF (ưu tiên blob URL, không thì null để tránh CORS)
  const getPdfDisplayUrl = useCallback(() => {
    // Ưu tiên sử dụng blob URL đã load từ preview API
    if (pdfBlobUrl) {
      return pdfBlobUrl;
    }
    
    // Backward compatibility với existing pdfPreviewUrl
    if (pdfPreviewUrl) {
      return pdfPreviewUrl;
    }
    
    // Không dùng trực tiếp downloadUrl để tránh CORS
    return null;
  }, [pdfBlobUrl, pdfPreviewUrl]);

  // Cleanup function cho PDF blob URLs
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  useEffect(() => () => revokePdfPreviewUrl(), [revokePdfPreviewUrl]);

  function showCertificateSelector() {
    if (smartCAInfo) {
      const certificates = getAllCertificatesFromData(smartCAInfo);
      if (certificates.length > 0) {
        setShowExistingSmartCASelector(true);
      } else {
        message.warning('Không có chứng thư số hợp lệ để chọn');
      }
    } else {
      message.warning('Chưa có SmartCA trong hệ thống');
    }
  }

  // Lấy thông tin hợp đồng theo processCode
  async function getContractInfo(processCode, options = {}) {
    try {
      setLoading(true);
      const result = await contractService.handleGetContractInfo(processCode);
      if (result.success) {
        setContractInfo(result.data);
        setCurrentStep(1);
        await checkSmartCA(result.data.processedByUserId);
        await loadPdfPreview(result.data.downloadUrl, { silent: true });
        if (!options.silent) {
          message.success('Lấy thông tin hợp đồng thành công!');
        }
      } else {
        message.error(result.error || 'Không lấy được thông tin hợp đồng');
      }
    } catch (e) {
      message.error('Có lỗi khi lấy thông tin hợp đồng');
    } finally {
      setLoading(false);
    }
  }

    // Kiểm tra SmartCA của user
    async function checkSmartCA(userId) {
    try {
      const result = await contractService.handleCheckSmartCA(userId);
      if (result.success) {
        setSmartCAInfo(result.data);
        const ok = contractService.isSmartCAValid(result.data);
        setCurrentStep(ok ? 3 : 2);
        if (ok) message.success('SmartCA đã sẵn sàng để ký!');
      } else {
        setCurrentStep(2);
        message.error(result.error || 'Không kiểm tra được SmartCA');
      }
    } catch (e) {
      setCurrentStep(2);
      message.error('Có lỗi khi kiểm tra SmartCA');
    }
  }

  // Ép reload PDF bằng cache-busting
  async function refreshPdfCache(reason = '') {
    if (!contractInfo?.downloadUrl) return;
    await loadPdfPreview(contractInfo.downloadUrl, {
      forceRefresh: true,
      silent: reason === 'toggle'
    });
  }

  // Cải thiện PDF handling functions theo CreateContract pattern
  async function togglePDFViewer() {
    if (!contractInfo?.downloadUrl) {
      message.warning('Không có link PDF');
      return;
    }

    const displayUrl = getPdfDisplayUrl();
    if (!displayUrl) {
      // Thử load preview một lần nữa
      const previewUrl = await loadPdfPreview(contractInfo.downloadUrl);
      if (!previewUrl) {
        message.warning('Không thể tải PDF preview. Vui lòng sử dụng "Mở tab mới"');
        return;
      }
    }
    setPdfModalVisible(true);
  }

  async function openPdfInNewTab() {
    if (!contractInfo?.downloadUrl) {
      message.warning('Không có link PDF');
      return;
    }

    const url = getPdfDisplayUrl();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback: mở VNPT link trực tiếp
      window.open(contractInfo.downloadUrl, '_blank', 'noopener,noreferrer');
      message.info('PDF đã được mở trong tab mới');
    }
  }

  async function downloadPdfFile() {
    if (!contractInfo?.downloadUrl) {
      message.warning('Không có file PDF để tải xuống');
      return;
    }

    const url = getPdfDisplayUrl();
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${contractInfo?.processId?.substring(0, 8) || 'hop-dong'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('Đang tải file PDF...');
    } else {
      // Fallback: mở trong tab mới
      window.open(contractInfo.downloadUrl, '_blank');
      message.info('PDF đã được mở trong tab mới để tải xuống');
    }
  }

  // Nhận dữ liệu chữ ký từ SignatureModal và gọi API ký
  async function handleSignatureFromModal(signatureDataURL, displayMode = 2) {
    if (!contractInfo?.processId || !contractInfo?.accessToken) {
      message.error('Thiếu thông tin process hoặc token để ký.');
      return;
    }

    if (!selectedSmartCA) {
      message.error('Vui lòng chọn chứng thư số để ký.');
      return;
    }
    
    setSigningLoading(true);
    setShowSignatureModal(false);
    setShowSmartCAModal(true);
    
    try {
      const result = await contractService.handleDigitalSignature({
        processId: contractInfo.processId,
        reason: 'Ký hợp đồng điện tử',
        signatureImage: signatureDataURL,
        signatureDisplayMode: displayMode,
        accessToken: contractInfo.accessToken,
        contractInfo: contractInfo  // Truyền contractInfo để lấy position và pageSign
      });
      
      setShowSmartCAModal(false);
      
      if (result.success) {
        setCurrentStep(4);
        setContractSigned(true);
        await refreshPdfCache('afterSign');
        
        Modal.success({
          title: (
            <span className="text-green-600 font-semibold flex items-center">
              <CheckCircleOutlined className="mr-2" />
              Ký Hợp Đồng Thành Công!
            </span>
          ),
          content: (
            <div className="py-4">
              <div className="text-base mb-3">🎉 Hợp đồng đã được ký thành công!</div>
              <div className="text-sm text-gray-600">
                Process ID: <strong>{contractInfo.processId?.substring(0, 8)}...</strong>
              </div>
              <div className="text-sm text-gray-600">
                Trạng thái: <strong className="text-green-600">Đã ký thành công ✅</strong>
              </div>
            </div>
          ),
          okText: 'Đóng',
          centered: true,
          width: 450,
          okButtonProps: { className: 'bg-green-500 border-green-500 hover:bg-green-600' }
        });
        message.success('Ký hợp đồng thành công!');
      } else {
        message.error(result.error || 'Ký thất bại.');
      }
    } catch (e) {
      setShowSmartCAModal(false);
      message.error('Có lỗi không mong muốn khi ký điện tử');
    } finally {
      setSigningLoading(false);
    }
  }



  // Submit form
  async function onFinish(values) {
    await getContractInfo(values.processCode, { silent: false });
  }

  // Reset flow
  function resetForm() {
    form.resetFields();
    setContractInfo(null);
    setSmartCAInfo(null);
    setCurrentStep(0);
    revokePdfPreviewUrl();
    setPdfLoading(false);
    setPdfModalVisible(false);
    setContractSigned(false);
    setShowSignatureModal(false);
    setShowSmartCAModal(false);
    setSigningLoading(false);
    setShowSmartCASelector(false);
    setSelectedSmartCA(null);
  }

  // Mở modal nhập thông tin SmartCA
  function openAddSmartCA() {
    smartCAForm.resetFields();
    setSmartCAVisible(true);
  }

  // Submit thêm SmartCA
  async function submitSmartCA() {
    if (!contractInfo?.processedByUserId || !contractInfo?.accessToken) {
      message.error('Thiếu thông tin user/token để thêm SmartCA');
      return;
    }
    try {
      const values = await smartCAForm.validateFields();
      setAddingSmartCA(true);

      const result = await contractService.handleAddSmartCA({
        userId: contractInfo.processedByUserId,
        userName: values.cccd,
        serialNumber: values.serialNumber,
        accessToken: contractInfo.accessToken
      });

      if (result.success) {
        message.success(result.message || 'Thêm SmartCA thành công');
        setSmartCAInfo(result.data);
        setSmartCAVisible(false);

        const certificates = getAllCertificatesFromData(result.data);
        if (certificates.length > 0) {
          setShowSmartCASelector(true);
        } else {
          message.warning('Không có chứng thư số hợp lệ để sử dụng');
        }
      } else {
        message.error(result.error || 'Thêm SmartCA thất bại');
      }
    } catch (e) {
      if (!e?.errorFields) {
        message.error('Có lỗi khi thêm SmartCA');
      }
    } finally {
      setAddingSmartCA(false);
    }
  }

  // Lấy tất cả certificates từ smartCA data
  function getAllCertificatesFromData(smartCAData) {
    const certificates = [];
    
    if (smartCAData?.defaultSmartCa) {
      certificates.push({
        ...smartCAData.defaultSmartCa,
        isDefault: true
      });
    }
    
    if (smartCAData?.userCertificates?.length > 0) {
      smartCAData.userCertificates.forEach(cert => {
        if (!certificates.find(c => c.id === cert.id)) {
          certificates.push({
            ...cert,
            isDefault: false
          });
        }
      });
    }
    
    const validCertificates = certificates.filter(cert => {
      const isNotExpired = !isExpired(cert.validTo);
      const hasValidStatus = cert.status?.value === 1 || cert.isValid === true;
      return isNotExpired && hasValidStatus;
    });
    
    return validCertificates;
  }

  // Kiểm tra certificate hết hạn
  function isExpired(validTo) {
    if (!validTo) return false;
    try {
      return new Date(validTo) < new Date();
    } catch {
      return false;
    }
  }

  // Xử lý chọn SmartCA certificate (API call đã được xử lý trong SmartCASelector)
  function handleSelectSmartCA(certificate) {
    setSelectedSmartCA(certificate);
    setShowSmartCASelector(false);
    setShowExistingSmartCASelector(false);
    setCurrentStep(3);
    message.success(`Đã chọn chứng thư: ${certificate.commonName}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2} className="flex items-center justify-center mb-2">
            <SafetyOutlined className="text-blue-500 mr-3" />
            Ký Hợp Đồng Điện Tử
          </Title>
          <Text className="text-gray-600">Nhập mã process để xem và ký hợp đồng</Text>
        </div>

        {/* Steps */}
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
            title={<span className="flex items-center"><FileTextOutlined className="text-blue-500 mr-2" />Nhập Mã Process</span>}
            className="mb-6"
          >
            <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={18}>
                  <Form.Item
                    name="processCode"
                    label="Mã Process"
                    rules={[{ required: true, message: 'Vui lòng nhập mã process!' }]}
                  >
                    <Input placeholder="Nhập mã process" size="large" prefix={<FileTextOutlined className="text-gray-400" />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item label=" " className="mb-0">
                    <Button type="primary" htmlType="submit" loading={loading} size="large" className="w-full bg-blue-500 hover:bg-blue-600">
                      Lấy thông tin
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        )}

        {/* Thông tin hợp đồng + SmartCA */}
        {contractInfo && (
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} lg={12}>
              <Card
                title={<span className="flex items-center"><FilePdfOutlined className="text-red-500 mr-2" />Thông Tin Hợp Đồng</span>}
                extra={<Button onClick={resetForm} size="small" icon={<ReloadOutlined />}>Nhập mã khác</Button>}
              >
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Text strong>Process ID:</Text>
                    <Text className="text-gray-600 font-mono text-sm">{contractInfo.processId?.substring(0, 8)}...</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text strong>User ID:</Text>
                    <Text className="text-gray-600">{contractInfo.processedByUserId}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text strong>Trạng thái:</Text>
                    <Tag color={contractSigned ? 'green' : 'blue'}>{contractSigned ? 'Đã ký' : 'Chưa ký'}</Tag>
                  </div>

                  <Divider className="my-3" />
                  
                  {/* Fallback UI khi không có PDF preview */}
                  {!getPdfDisplayUrl() && contractInfo?.downloadUrl && (
                    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg mb-4">
                      <FilePdfOutlined className="text-6xl mb-4 text-blue-400" />
                      <p className="text-lg mb-4 text-gray-700">PDF Preview không khả dụng</p>
                      <Button 
                        type="primary" 
                        icon={<DownloadOutlined />}
                        onClick={() => window.open(contractInfo.downloadUrl, '_blank')}
                        size="large"
                      >
                        Mở PDF trong tab mới
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">
                        Nhấn để xem PDF trên trang VNPT
                      </p>
                    </div>
                  )}
                  
                  <Space>
                    <Button
                      type="primary"
                      icon={<FilePdfOutlined />}
                      onClick={togglePDFViewer}
                      className="bg-blue-500 hover:bg-blue-600 border-blue-500"
                      disabled={!getPdfDisplayUrl()}
                    >
                      Xem PDF
                    </Button>

                    <Button 
                      onClick={openPdfInNewTab} 
                      loading={pdfLoading} 
                      icon={<FilePdfOutlined />}
                    >
                      Mở tab mới
                    </Button>
                  </Space>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <SmartCACard
                smartCAInfo={smartCAInfo}
                onAddSmartCA={openAddSmartCA}
                onSign={() => setShowSignatureModal(true)}
                signingLoading={signingLoading}
                contractSigned={contractSigned}
                selectedSmartCA={selectedSmartCA}
                onSelectCertificate={showCertificateSelector}
              />
            </Col>
          </Row>
        )}

        {/* Sau khi hoàn tất */}
        {currentStep === 4 && (
          <Card className="mb-6">
            <div className="text-center py-8">
              <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
              <Title level={3} className="text-green-600 mb-2">Ký Hợp Đồng Thành Công!</Title>
              <Paragraph className="text-gray-600 mb-6">Bạn có thể tải hợp đồng đã ký.</Paragraph>
              <Space>
                <Button type="primary" size="large" onClick={downloadPdfFile} loading={pdfLoading} icon={<FilePdfOutlined />} className="bg-green-500 hover:bg-green-600 border-green-500">
                  Tải hợp đồng đã ký
                </Button>
                <Button size="large" onClick={resetForm}>Ký hợp đồng khác</Button>
              </Space>
            </div>
          </Card>
        )}

        {/* PDF Modal for contract viewing */}
        <PDFModal
          visible={pdfModalVisible}
          onClose={() => setPdfModalVisible(false)}
          contractNo={`${contractInfo?.processId?.slice(0, 8) || 'HĐ'}...`}
          pdfUrl={getPdfDisplayUrl()}
          title={`Hợp đồng ${contractInfo?.processId?.slice(0, 8) || 'HĐ'}...`}
        />

        {/* Signature Modal */}
        <SignatureModal
          visible={showSignatureModal}
          onCancel={() => setShowSignatureModal(false)}
          onSign={handleSignatureFromModal}
          loading={signingLoading}
        />



        {/* Modal Thêm SmartCA - sử dụng component nghiệp vụ */}
        <AddSmartCA
          visible={smartCAVisible}
          onCancel={() => setSmartCAVisible(false)}
          onSuccess={(result) => {
            setSmartCAInfo(result.smartCAData);
            setSmartCAVisible(false);
            // Nếu có chứng thư hợp lệ thì mở selector
            if (result.hasValidSmartCA) {
              setShowSmartCASelector(true);
            }
          }}
          contractInfo={{
            userId: contractInfo?.processedByUserId,
            accessToken: contractInfo?.accessToken
          }}
        />

        {/* SmartCA Modal chờ ký điện tử */}
        <SmartCAModal
          visible={showSmartCAModal}
          onCancel={() => {
            setShowSmartCAModal(false);
            setSigningLoading(false);
          }}
          contractNo={contractInfo?.processId?.substring(0, 8) || 'HĐ-Unknown'}
        />

        {/* SmartCA Selector Modal */}
        <SmartCASelector
          visible={showSmartCASelector}
          onCancel={() => setShowSmartCASelector(false)}
          onSelect={handleSelectSmartCA}
          smartCAData={smartCAInfo}
          loading={signingLoading}
          currentSelectedId={selectedSmartCA?.id}
          contractService={contractService}
          userId={contractInfo?.processedByUserId}
        />

        {/* SmartCA Selector Modal cho existing SmartCA */}
        <SmartCASelector
          visible={showExistingSmartCASelector}
          onCancel={() => setShowExistingSmartCASelector(false)}
          onSelect={handleSelectSmartCA}
          smartCAData={smartCAInfo}
          loading={signingLoading}
          isExistingSmartCA={true}
          currentSelectedId={selectedSmartCA?.id}
          contractService={contractService}
          userId={contractInfo?.processedByUserId}
        />
      </div>
    </div>
  );

  }
// Component hiển thị thông tin SmartCA với giao diện cải tiến
const SmartCACard = ({ smartCAInfo, onAddSmartCA, onSign, signingLoading, contractSigned, selectedSmartCA, onSelectCertificate }) => {
  const hasSmartCA = !!smartCAInfo?.defaultSmartCa || 
    (smartCAInfo?.userCertificates && smartCAInfo.userCertificates.length > 0);
  
  const ready = !!selectedSmartCA;

  return (
    <Card
      title={
        <span className="flex items-center">
          <SafetyOutlined className="text-blue-500 mr-2" />
          SmartCA
        </span>
      }
      extra={
        ready ? (
          <Tag color="green" icon={<CheckCircleOutlined />} className="animate-pulse">
            Sẵn sàng
          </Tag>
        ) : (
          <Tag color="orange" icon={<ClockCircleOutlined />}>
            Chưa sẵn sàng
          </Tag>
        )
      }
      className="shadow-md"
    >
      {!hasSmartCA ? (
        <div className="text-center p-4">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 text-yellow-700 rounded-lg p-4 mb-4 shadow-sm">
            <div className="font-semibold text-base flex items-center justify-center mb-2">
              <InfoCircleOutlined className="mr-2" />
              SmartCA chưa sẵn sàng
            </div>
            <div className="text-sm">Bạn cần thêm SmartCA để có thể ký hợp đồng điện tử</div>
          </div>
          <Button 
            type="primary" 
            danger 
            onClick={onAddSmartCA} 
            disabled={contractSigned}
            size="large"
            className="bg-red-500 hover:bg-red-600 border-red-500 shadow-md"
          >
            <SafetyOutlined className="mr-2" />
            Thêm SmartCA
          </Button>
        </div>
      ) : !ready ? (
        <div className="text-center p-4">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-700 rounded-lg p-4 mb-4 shadow-sm">
            <div className="font-semibold text-base flex items-center justify-center mb-2">
              <CheckCircleOutlined className="mr-2" />
              Đã có SmartCA trong hệ thống
            </div>
            <div className="text-sm">Vui lòng chọn chứng thư số để tiếp tục ký hợp đồng</div>
          </div>
          <Space size="middle">
            <Button 
              type="primary" 
              onClick={onSelectCertificate} 
              disabled={contractSigned}
              size="large"
              className="bg-blue-500 hover:bg-blue-600 border-blue-500 shadow-md"
            >
              <SafetyOutlined className="mr-2" />
              Chọn Chứng Thư
            </Button>
            <Button 
              onClick={onAddSmartCA} 
              disabled={contractSigned}
              size="large"
              className="shadow-md"
            >
              Thêm SmartCA Khác
            </Button>
          </Space>
        </div>
      ) : (
        <div className="text-center p-4">
          <div className={`
            ${contractSigned 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700'
            } 
            border rounded-lg p-4 mb-4 shadow-sm
          `}>
            <div className="font-semibold text-base flex items-center justify-center mb-2">
              <CheckCircleOutlined className="mr-2" />
              {contractSigned ? "Đã ký thành công" : "SmartCA sẵn sàng"}
            </div>
            <div className="text-sm space-y-1">
              <div><strong>Chứng thư:</strong> {selectedSmartCA.commonName}</div>
              <div><strong>UID:</strong> {selectedSmartCA.uid}</div>
              {selectedSmartCA.isDefault && (
                <Tag color="gold" size="small" className="mt-1">
                  <CrownOutlined className="mr-1" />
                  Chứng thư mặc định
                </Tag>
              )}
            </div>
          </div>
          <Space size="middle">
            <Button 
              type="primary" 
              onClick={onSign} 
              loading={signingLoading} 
              disabled={contractSigned}
              size="large"
              className={`
                ${contractSigned 
                  ? 'bg-green-500 hover:bg-green-600 border-green-500' 
                  : 'bg-blue-500 hover:bg-blue-600 border-blue-500'
                } 
                shadow-md
              `}
            >
              {contractSigned ? (
                <>
                  <CheckCircleOutlined className="mr-2" />
                  Đã Ký Thành Công
                </>
              ) : (
                <>
                  <EditOutlined className="mr-2" />
                  Ký Hợp Đồng
                </>
              )}
            </Button>
            {!contractSigned && (
              <Button 
                onClick={onSelectCertificate}
                size="large"
                className="shadow-md"
              >
                Đổi Chứng Thư
              </Button>
            )}
          </Space>
        </div>
      )}
    </Card>
  );
};

export default ContractPage;
