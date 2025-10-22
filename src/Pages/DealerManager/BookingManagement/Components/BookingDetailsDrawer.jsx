import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Row,
  Col,
  Typography,
  Alert,
  Button,
  Space,
  Tag,
  Divider,
  Spin
} from 'antd';
import {
  FilePdfOutlined,
  EditOutlined,
  SafetyOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Import PDF components (reuse)
import PDFViewer from '../../../Admin/SignContract/Components/PDF/PDFViewer';
import PDFModal from '../../../Admin/SignContract/Components/PDF/PDFModal';

// Import SmartCA & Signing components (reuse)
import useContractSigning from '../../../Admin/SignContract/useContractSigning';
import SignatureModal from '../../../Admin/SignContract/Components/SignatureModal';
import SmartCAStatusChecker from '../../../Admin/SignContract/Components/SmartCAStatusChecker';
import SmartCASelector from '../../../Admin/SignContract/Components/SmartCASelector';
import SmartCAModal from '../../../Admin/SignContract/Components/SmartCAModal';

// Import Contract Service (reuse)
import { ContractService } from '../../../../App/Home/SignContractCustomer';

// Import hooks
import useBookingContract from './useBookingContract';

const { Title, Text } = Typography;

function BookingDetailsDrawer({ 
  visible, 
  onClose, 
  booking,
  onSignSuccess 
}) {
  // State
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  
  // SmartCA States
  const [smartCAInfo, setSmartCAInfo] = useState(null);
  const [selectedSmartCA, setSelectedSmartCA] = useState(null);
  const [showSmartCASelector, setShowSmartCASelector] = useState(false);
  
  // Hooks
  const { 
    contractLoading, 
    contractDetail, 
    createBookingContract, 
    getContractDetails,
    canSignContract,
    getSignProcessId,
    clearContract 
  } = useBookingContract();
  
  // Signing System (reuse)
  const contractSigning = useContractSigning();
  const contractService = ContractService();

  // Load contract khi mở drawer
  useEffect(() => {
    if (visible && booking) {
      loadBookingContract();
      // Reset SmartCA states
      setSmartCAInfo(null);
      setSelectedSmartCA(null);
    } else if (!visible) {
      clearContract();
      // Reset SmartCA states
      setSmartCAInfo(null);
      setSelectedSmartCA(null);
      contractSigning.resetSigningState();
    }
  }, [visible, booking]);

  // Hàm load contract
  const loadBookingContract = async () => {
    if (!booking) return;
    
    try {
      // Tạo hoặc lấy hợp đồng cho booking
      await createBookingContract(booking.id);
    } catch (error) {
      console.error('Error loading booking contract:', error);
    }
  };

  // Hàm đóng drawer
  const handleClose = () => {
    clearContract();
    setSmartCAInfo(null);
    setSelectedSmartCA(null);
    contractSigning.resetSigningState();
    onClose();
  };

  // Hàm xử lý kết quả check SmartCA
  const handleSmartCAChecked = (smartCAData) => {
    console.log('SmartCA checked for dealer:', smartCAData);
    setSmartCAInfo(smartCAData);
    
    // Tự động chọn SmartCA nếu có sẵn
    if (smartCAData?.defaultSmartCa?.isValid) {
      setSelectedSmartCA(smartCAData.defaultSmartCa);
    } else if (smartCAData?.userCertificates?.length > 0) {
      const validCert = smartCAData.userCertificates.find(cert => cert.isValid);
      if (validCert) {
        setSelectedSmartCA(validCert);
      }
    }
  };

  // Hàm chọn SmartCA
  const handleSelectSmartCA = (certificate) => {
    setSelectedSmartCA(certificate);
    setShowSmartCASelector(false);
  };

  // Hàm mở signature modal
  const handleOpenSignModal = () => {
    if (!selectedSmartCA) {
      setShowSmartCASelector(true);
      return;
    }
    contractSigning.setShowSignatureModal(true);
  };

  // Hàm ký hợp đồng
  const handleSignContract = async (signatureData, signatureDisplayMode) => {
    if (!contractDetail || !selectedSmartCA) return;
    
    const processId = getSignProcessId(contractDetail);
    if (!processId) return;

    // Chuẩn bị data theo format EVM Admin
    const waitingProcessData = {
      id: processId,
      pageSign: contractDetail.waitingProcess?.pageSign || contractDetail.processes?.[0]?.pageSign || 1,
      position: contractDetail.waitingProcess?.position || contractDetail.processes?.[0]?.position || "24,18,194,108"
    };

    try {
      await contractSigning.handleSignature(
        signatureData,
        signatureDisplayMode,
        processId,
        waitingProcessData,
        contractDetail.downloadUrl,
        waitingProcessData.position,
        waitingProcessData.pageSign
      );

      // Reload contract sau khi ký thành công
      await loadBookingContract();
      
      // Thông báo success cho parent
      if (onSignSuccess) {
        onSignSuccess();
      }

    } catch (error) {
      console.error('Error signing contract:', error);
    }
  };

  // Render thông tin booking
  const renderBookingInfo = () => (
    <div className="border rounded-lg p-4 bg-gray-50">
      <Title level={5} className="mb-3">
        <InfoCircleOutlined className="mr-2 text-blue-500" />
        Thông tin Booking
      </Title>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <Text strong>ID:</Text>
          <Text className="font-mono">{booking.id?.substring(0, 16)}...</Text>
        </div>
        
        <div className="flex justify-between">
          <Text strong>Ngày tạo:</Text>
          <div>
            <CalendarOutlined className="mr-1 text-blue-500" />
            {dayjs(booking.bookingDate).format('DD/MM/YYYY HH:mm')}
          </div>
        </div>
        
        <div className="flex justify-between">
          <Text strong>Trạng thái:</Text>
          <Tag color={booking.statusInfo?.color}>
            {booking.statusInfo?.label}
          </Tag>
        </div>
        
        <div className="flex justify-between">
          <Text strong>Người tạo:</Text>
          <div>
            <UserOutlined className="mr-1 text-green-500" />
            {booking.createdBy}
          </div>
        </div>
        
        <div className="flex justify-between">
          <Text strong>Tổng số xe:</Text>
          <Tag color="blue">{booking.totalQuantity} xe</Tag>
        </div>
        
        {booking.note && (
          <div>
            <Text strong>Ghi chú:</Text>
            <div className="mt-1 p-2 bg-white rounded border">
              <Text type="secondary">{booking.note}</Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render thông tin xe
  const renderVehicleDetails = () => (
    <div className="border rounded-lg p-4">
      <Title level={5} className="mb-3">
        Chi tiết xe đặt
      </Title>
      
      {booking.bookingEVDetails?.map((detail, index) => (
        <div key={index} className="p-3 bg-gray-50 rounded mb-2 last:mb-0">
          <div className="font-medium mb-2">Xe {index + 1}</div>
          <div className="space-y-1 text-sm">
            <div><Text strong>Version ID:</Text> <Text className="font-mono">{detail.version?.versionId?.substring(0, 8)}...</Text></div>
            <div><Text strong>Model ID:</Text> <Text className="font-mono">{detail.version?.modelId?.substring(0, 8)}...</Text></div>
            <div><Text strong>Color ID:</Text> <Text className="font-mono">{detail.colorId?.substring(0, 8)}...</Text></div>
            <div><Text strong>Số lượng:</Text> <Tag color="blue">{detail.quantity}</Tag></div>
            {detail.expectedDeliveryDate && (
              <div><Text strong>Ngày giao dự kiến:</Text> {dayjs(detail.expectedDeliveryDate).format('DD/MM/YYYY')}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // Render contract status
  const renderContractStatus = () => {
    if (contractLoading) {
      return (
        <div className="border rounded-lg p-4 text-center">
          <Spin tip="Đang tải hợp đồng..." />
        </div>
      );
    }

    if (!contractDetail) {
      return (
        <Alert
          message="Chưa có hợp đồng"
          description="Hợp đồng chưa được tạo hoặc có lỗi khi tải"
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={loadBookingContract}>
              Thử lại
            </Button>
          }
        />
      );
    }

    const canSign = canSignContract(contractDetail);
    const processId = getSignProcessId(contractDetail);

    return (
      <div className="border rounded-lg p-4">
        <Title level={5} className="mb-3">
          <FilePdfOutlined className="mr-2 text-red-500" />
          Hợp đồng Booking
        </Title>
        
        <div className="space-y-3">
          <div className="space-y-2 text-sm">
            <div><Text strong>Số HĐ:</Text> {contractDetail.no}</div>
            <div><Text strong>Chủ đề:</Text> {contractDetail.subject}</div>
            <div>
              <Text strong>Trạng thái:</Text> 
              <Tag color={contractDetail.status?.value === 2 ? 'processing' : 'default'} className="ml-2">
                {contractDetail.status?.description}
              </Tag>
            </div>
            <div><Text strong>Ngày tạo:</Text> {dayjs(contractDetail.createdDate).format('DD/MM/YYYY HH:mm')}</div>
          </div>

          <Divider className="my-3" />

          {canSign ? (
            <Alert
              message="Có thể ký hợp đồng"
              description={`Process ID: ${processId?.substring(0, 16)}...`}
              type="success"
              showIcon
              action={
                selectedSmartCA ? (
                  <Button
                    type="primary"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={handleOpenSignModal}
                    loading={contractSigning.signingLoading}
                  >
                    Ký ngay
                  </Button>
                ) : (
                  <Button
                    size="small"
                    icon={<SafetyOutlined />}
                    onClick={() => setShowSmartCASelector(true)}
                  >
                    Chọn SmartCA
                  </Button>
                )
              }
            />
          ) : (
            <Alert
              message="Không thể ký"
              description="Hợp đồng không ở trạng thái có thể ký"
              type="info"
              showIcon
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <Drawer
      title="Chi tiết Booking & Hợp đồng"
      width={window.innerWidth < 768 ? '100vw' : window.innerWidth < 1200 ? '90vw' : 1200}
      open={visible}
      onClose={handleClose}
      destroyOnClose
      extra={
        <Space>
          {contractDetail?.downloadUrl && (
            <Button
              type="primary"
              icon={<FilePdfOutlined />}
              onClick={() => setPdfModalVisible(true)}
            >
              Xem PDF toàn màn hình
            </Button>
          )}
        </Space>
      }
    >
      {booking && (
        <Row gutter={[16, 24]} className="h-full">
          {/* Left Column - Booking Info */}
          <Col xs={24} md={12} lg={8}>
            <div className="space-y-4">
              {renderBookingInfo()}
              {renderVehicleDetails()}
              {renderContractStatus()}
              
              {/* SmartCA Section */}
              <div className="border rounded-lg p-4">
                <Title level={5} className="mb-3">
                  <SafetyOutlined className="mr-2 text-blue-500" />
                  SmartCA Dealer
                </Title>
                
                {/* SmartCA Status Checker */}
                <SmartCAStatusChecker 
                  userId={localStorage.getItem('userId') || '20224'} // Dealer userId
                  contractService={contractService}
                  onChecked={handleSmartCAChecked}
                />
                
                {!smartCAInfo && (
                  <Alert
                    message="Đang kiểm tra SmartCA..."
                    type="info"
                    showIcon
                    size="small"
                  />
                )}

                {smartCAInfo && (
                  <div className="space-y-3">
                    {selectedSmartCA ? (
                      <Alert
                        message="SmartCA đã sẵn sàng"
                        description={
                          <div className="text-xs">
                            <div><strong>Chứng thư:</strong> {selectedSmartCA.commonName}</div>
                            <div><strong>UID:</strong> {selectedSmartCA.uid}</div>
                          </div>
                        }
                        type="success"
                        size="small"
                        action={
                          <Button size="small" onClick={() => setShowSmartCASelector(true)}>
                            Đổi
                          </Button>
                        }
                      />
                    ) : (
                      <Alert
                        message="Chưa chọn SmartCA"
                        description="Cần chọn chứng thư số để ký hợp đồng"
                        type="warning"
                        size="small"
                        action={
                          <Button size="small" type="primary" onClick={() => setShowSmartCASelector(true)}>
                            Chọn
                          </Button>
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </Col>

          {/* Right Column - PDF Viewer */}
          <Col xs={24} md={12} lg={16}>
            <div className="border rounded-lg p-4 h-[700px]">
              <div className="flex justify-between items-center mb-3">
                <Title level={5}>Xem trước hợp đồng</Title>
              </div>
              
              {contractDetail?.downloadUrl ? (
                <div className="h-[640px] border rounded">
                  <PDFViewer
                    contractNo={contractDetail.no || 'Booking'}
                    pdfUrl={contractDetail.downloadUrl}
                    showAllPages={false}
                    scale={0.75}
                  />
                </div>
              ) : (
                <div className="h-[640px] flex items-center justify-center bg-gray-50 border rounded">
                  <div className="text-center text-gray-500">
                    <FilePdfOutlined className="text-6xl mb-4" />
                    <div className="text-lg mb-2">Chưa có hợp đồng để hiển thị</div>
                    <div className="text-sm">
                      {contractLoading ? 'Đang tạo hợp đồng...' : 'Hợp đồng sẽ được tạo tự động'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
      )}

      {/* PDF Modal - Full Screen */}
      <PDFModal
        visible={pdfModalVisible}
        onClose={() => setPdfModalVisible(false)}
        contractNo={contractDetail?.no || 'Booking'}
        pdfUrl={contractDetail?.downloadUrl}
        title={`Hợp đồng Booking - ${contractDetail?.no || 'N/A'}`}
      />

      {/* Signature Modal - Reuse từ SignContract system */}
      <SignatureModal
        visible={contractSigning.showSignatureModal}
        onCancel={() => contractSigning.setShowSignatureModal(false)}
        onSign={handleSignContract}
        loading={contractSigning.signingLoading}
      />

      {/* SmartCA Modal - VNPT Loading */}
      <SmartCAModal
        visible={contractSigning.showSmartCAModal}
        onCancel={() => contractSigning.setShowSmartCAModal(false)}
        contractNo={contractDetail?.no || 'Booking'}
      />

      {/* SmartCA Selector Modal */}
      <SmartCASelector
        visible={showSmartCASelector}
        onCancel={() => setShowSmartCASelector(false)}
        onSelect={handleSelectSmartCA}
        smartCAData={smartCAInfo}
        loading={contractSigning.signingLoading}
        currentSelectedId={selectedSmartCA?.id}
        contractService={contractService}
        userId={localStorage.getItem('userId') || '20224'}
      />
    </Drawer>
  );
}

export default BookingDetailsDrawer;