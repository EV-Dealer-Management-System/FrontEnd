import React, { useState, useEffect } from 'react';
import { Modal, Card, Button, Tag, Typography, Space, Divider, Alert, message, Radio } from 'antd';
import { SafetyOutlined, CheckCircleOutlined, ClockCircleOutlined, InfoCircleOutlined, CrownOutlined } from '@ant-design/icons';
import { SmartCAService } from '../../../../App/EVMAdmin/SignContractEVM/SmartCA';

const { Text, Title } = Typography;

const SmartCASelector = ({ 
  visible, 
  onCancel, 
  onSelect, 
  smartCAData, 
  loading, 
  isExistingSmartCA = false, 
  currentSelectedId = null,
  contractService = null,  // For Customer use case
  userId = null           // For Customer use case
}) => {
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [updating, setUpdating] = useState(false);
  
  const smartCAService = SmartCAService();
  const FIXED_USER_ID = "18858"; // ID cứng của hãng

  // Tự động chọn certificate hiện tại khi mở modal
  useEffect(() => {
    if (visible && currentSelectedId) {
      const certificates = getAllCertificates();
      const currentCert = certificates.find(cert => cert.id === currentSelectedId);
      if (currentCert) {
        setSelectedCertificate(currentCert);
      }
    }
    // Reset selection khi đóng modal
    if (!visible) {
      setSelectedCertificate(null);
    }
  }, [visible, currentSelectedId]);



  // Lấy tất cả certificates từ defaultSmartCa và userCertificates
  function getAllCertificates() {
    const certificates = [];
    
    // Thêm defaultSmartCa nếu có
    if (smartCAData?.defaultSmartCa) {
      certificates.push({
        ...smartCAData.defaultSmartCa,
        isDefault: true
      });
    }
    
    // Thêm userCertificates
    if (smartCAData?.userCertificates?.length > 0) {
      smartCAData.userCertificates.forEach(cert => {
        // Tránh trùng lặp với defaultSmartCa
        if (!certificates.find(c => c.id === cert.id)) {
          certificates.push({
            ...cert,
            isDefault: false
          });
        }
      });
    }
    
    return certificates;
  }

  const certificates = getAllCertificates();

  // Format ngày tháng đơn giản
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  }

  // Kiểm tra chứng chỉ có hết hạn không
  function isExpired(validTo) {
    if (!validTo) return false;
    return new Date(validTo) < new Date();
  }

  // Xử lý chọn chứng chỉ với API call
  async function handleSelect() {
    if (!selectedCertificate) {
      message.warning('Vui lòng chọn một chứng thư số');
      return;
    }
    
    setUpdating(true);
    try {
      console.log('=== SELECTING SMARTCA ===');
      console.log('Selected certificate:', selectedCertificate);
      console.log('ContractService available:', !!contractService);
      console.log('UserId (prop):', userId);
      
      let result;
      const smartCAOwnerName = selectedCertificate.commonName || selectedCertificate.name || null;
      const smartCAId = String(selectedCertificate.id);
      
      const effectiveUserId = userId;
      console.log('Using UserId:', effectiveUserId);
      if (!effectiveUserId) {
        message.error('UserId không hợp lệ để cập nhật SmartCA.');
        setUpdating(false);
        return;
      }
      // Determine which service to use based on available props
      if (contractService && effectiveUserId) {
        // Customer case: use contractService with userId
        result = await contractService.handleUpdateSmartCA(
          smartCAId,
          effectiveUserId,
          smartCAOwnerName
        );
      } else {
        // Admin case: use smartCAService with fixed admin ID
        result = await smartCAService.handleUpdateSmartCA(
          smartCAId,
          effectiveUserId,
          smartCAOwnerName
        );
      }
      
      if (result.success) {
        message.success('Đã cập nhật SmartCA thành công');
        onSelect(selectedCertificate);
      } else {
        message.error(result.error || 'Có lỗi khi cập nhật SmartCA');
      }
    } catch (error) {
      console.error('Error selecting SmartCA:', error);
      message.error('Có lỗi khi cập nhật SmartCA');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Modal
      title={
        <div className="flex items-center">
          <SafetyOutlined className="text-blue-500 mr-2" />
          <span>Chọn Chứng Thư Số VNPT SmartCA</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button 
          key="select" 
          type="primary" 
          onClick={handleSelect}
          disabled={!selectedCertificate}
          loading={updating || loading}
        >
          {updating ? 'Đang cập nhật...' : (currentSelectedId ? 'Đổi Chứng Thư' : 'Chọn để ký')}
        </Button>
      ]}
      width={800}
      destroyOnHidden
    >
      {/* Custom CSS cho animations */}
      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.4); }
        }
        .selected-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .border-3 {
          border-width: 3px;
        }
        .bg-blue-25 {
          background-color: rgba(59, 130, 246, 0.025);
        }
        .hover-scale {
          transition: transform 0.2s ease-in-out;
        }
        .hover-scale:hover {
          transform: scale(1.02);
        }
        .ant-radio-group {
          width: 100% !important;
        }
        .ant-card {
          width: 100% !important;
        }
      `}</style>
      {/* Thông báo */}
      {isExistingSmartCA && (
        <Alert
          message={currentSelectedId ? "Đổi chứng thư số" : "SmartCA đã được thêm trước đó"}
          description={currentSelectedId ? 
            "Bạn có thể chọn chứng thư số khác để ký hợp đồng." :
            "Bạn đã có SmartCA trong hệ thống. Vui lòng chọn chứng thư số phù hợp để ký hợp đồng."
          }
          type="info"
          icon={<InfoCircleOutlined />}
          className="mb-4"
          showIcon
        />
      )}

      <div className="mb-4">
        <Text className="text-gray-600">
          {currentSelectedId ? 
            'Chọn chứng thư số khác hoặc giữ nguyên lựa chọn hiện tại.' :
            'Chọn một chứng thư số để ký hợp đồng. Chỉ các chứng thư còn hiệu lực mới có thể sử dụng.'
          }
        </Text>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {certificates.length === 0 ? (
          <Alert
            message="Không có chứng thư số hợp lệ"
            description="Vui lòng thêm SmartCA hoặc kiểm tra lại thông tin chứng thư số."
            type="warning"
            showIcon
          />
        ) : (
          <div>
            <Alert
              message="Chọn chứng thư số để ký hợp đồng"
              description={`Tìm thấy ${certificates.length} chứng thư số hợp lệ. Chọn một chứng thư để tiếp tục.`}
              type="info"
              showIcon
              className="mb-4"
            />
            
            <Radio.Group 
              value={selectedCertificate?.id} 
              onChange={(e) => {
                const cert = certificates.find(c => c.id === e.target.value);
                setSelectedCertificate(cert);
              }}
              className="w-full"
              style={{ width: '100%' }}
            >
              <div className="space-y-4 w-full" style={{ width: '100%' }}>
                {certificates.map((cert) => {
                  const expired = isExpired(cert.validTo);
                  const canSelect = cert.isValid && !expired;
                  const isSelected = selectedCertificate?.id === cert.id;
                  const isCurrent = cert.id === currentSelectedId;

                  return (
                    <div key={cert.id} className="w-full" style={{ width: '100%' }}>
                      <Card
                        className={`
                          hover-scale cursor-pointer transition-all duration-300 relative w-full
                          ${isSelected 
                            ? 'border-3 border-blue-500 shadow-xl bg-gradient-to-br from-blue-25 to-blue-50 selected-glow' 
                            : canSelect
                              ? 'border border-gray-200 hover:border-blue-300 hover:shadow-lg'
                              : 'border border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                          }
                          ${isCurrent ? 'bg-green-50' : ''}
                        `}
                        onClick={() => canSelect && setSelectedCertificate(cert)}
                        size="small"
                        style={{ width: '100%' }}
                      >
                        <div className="w-full" style={{ width: '100%' }}>
                          <div className="flex items-start space-x-3 w-full" style={{ width: '100%' }}>
                            <Radio 
                              value={cert.id} 
                              disabled={!canSelect}
                              className={`
                                mt-1 transition-all duration-200
                                ${isSelected ? 'scale-110' : 'scale-100'}
                              `}
                            />
                            
                            <div className="flex-1 min-w-0">
                              {/* Header với badges */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Text strong className="text-base truncate">
                                    {cert.commonName || cert.name || 'Không rõ tên'}
                                  </Text>
                                  
                                  {/* Badges */}
                                  <div className="flex space-x-1">
                                    {cert.isDefault && (
                                      <Tag 
                                        icon={<CheckCircleOutlined />} 
                                        color="gold" 
                                        className="animate-pulse"
                                      >
                                        Mặc định
                                      </Tag>
                                    )}
                                    
                                    {isCurrent && (
                                      <Tag 
                                        icon={<CheckCircleOutlined />} 
                                        color="green"
                                        className="animate-bounce"
                                      >
                                        Đang sử dụng
                                      </Tag>
                                    )}
                                    
                                    {isSelected && !isCurrent && (
                                      <Tag 
                                        icon={<CheckCircleOutlined />} 
                                        color="blue"
                                        className="animate-pulse"
                                      >
                                        Đã chọn
                                      </Tag>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Status badge */}
                                <Tag 
                                  color={canSelect ? "green" : expired ? "red" : "orange"} 
                                  icon={canSelect ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                                  className={isSelected ? 'animate-pulse' : ''}
                                >
                                  {canSelect ? 'Hợp lệ' : expired ? 'Hết hạn' : 'Không khả dụng'}
                                </Tag>
                              </div>

                              {/* Chi tiết certificate */}
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <Text className="text-gray-600">ID:</Text>
                                  <Text code className="font-mono text-xs">{cert.id}</Text>
                                </div>
                                
                                <div className="flex justify-between">
                                  <Text className="text-gray-600">CCCD/HC/MST:</Text>
                                  <Text className="font-mono text-xs">{cert.uid || 'N/A'}</Text>
                                </div>
                                
                                <div className="flex justify-between">
                                  <Text className="text-gray-600">Ngày hết hạn:</Text>
                                  <Text className="text-xs">
                                    {formatDate(cert.validTo)}
                                  </Text>
                                </div>
                                
                                <div className="flex justify-between">
                                  <Text className="text-gray-600">Số serial:</Text>
                                  <Text className="text-xs text-right ml-2 truncate max-w-xs font-mono" title={cert.serialNumber}>
                                    {cert.serialNumber ? 
                                      `${cert.serialNumber.substring(0, 20)}...` : 
                                      'N/A'
                                    }
                                  </Text>
                                </div>

                                <div className="flex justify-between">
                                  <Text className="text-gray-600">Gói:</Text>
                                  <Text className="text-xs">
                                    {cert.smartCaServiceName || 'SMARTCA CÁ NHÂN CƠ BẢN'}
                                  </Text>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Selection indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircleOutlined className="text-xl text-blue-500 animate-bounce" />
                          </div>
                        )}
                      </Card>
                    </div>
                  );
                })}
              </div>
            </Radio.Group>
          </div>
        )}
      </div>

      {certificates.length > 0 && (
        <>
          <Divider />
          <div className="text-sm text-gray-500">
            <Text>
              💡 <strong>Lưu ý:</strong> Chỉ các chứng thư số còn hiệu lực và đang hoạt động mới có thể sử dụng để ký.
            </Text>
          </div>
        </>
      )}
    </Modal>
  );
};

export default SmartCASelector;