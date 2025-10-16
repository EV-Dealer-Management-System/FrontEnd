import React, { useState, useEffect } from 'react';
import { Modal, Card, Button, Tag, Row, Col, Typography, Space, Divider, Alert, message, Radio } from 'antd';
import { SafetyOutlined, CheckCircleOutlined, ClockCircleOutlined, InfoCircleOutlined, CrownOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const SmartCASelector = ({ visible, onCancel, onSelect, smartCAData, loading, isExistingSmartCA = false, currentSelectedId = null, contractService, userId }) => {
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [updating, setUpdating] = useState(false);

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
    
    // Lọc chỉ lấy certificates hợp lệ và chưa hết hạn
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

  // Format ngày tháng
  function formatDate(dateString) {
    if (!dateString) return 'Không rõ';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return 'Không hợp lệ';
    }
  }

  // Xử lý chọn certificate với update API
  async function handleSelect() {
    if (!selectedCertificate) {
      message.warning('Vui lòng chọn một chứng thư số');
      return;
    }

    if (!contractService || !userId) {
      message.error('Thiếu thông tin cần thiết để cập nhật');
      return;
    }

    try {
      setUpdating(true);
      
      // Gọi API update SmartCA thông qua contractService
      const result = await contractService.handleUpdateSmartCA(
        selectedCertificate.id,
        userId,
        selectedCertificate.commonName
      );
      
      if (result.success) {
        message.success('Cập nhật SmartCA thành công');
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

  const certificates = getAllCertificates();

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
          className="bg-blue-500 hover:bg-blue-600 border-blue-500"
        >
          {updating ? 'Đang cập nhật...' : (currentSelectedId ? 'Đổi Chứng Thư' : 'Chọn để ký')}
        </Button>
      ]}
      width={800}
      destroyOnClose
    >
      {/* Custom CSS cho animations */}
      <style jsx>{`
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
      `}</style>

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
            >
              <Row gutter={[16, 16]}>
                {certificates.map((cert) => {
                  const isSelected = selectedCertificate?.id === cert.id;
                  const isCurrent = currentSelectedId === cert.id;
                  
                  return (
                    <Col xs={24} key={cert.id}>
                      <Card
                        className={`
                          hover-scale cursor-pointer transition-all duration-300
                          ${isSelected 
                            ? 'border-3 border-blue-500 shadow-xl bg-gradient-to-br from-blue-25 to-blue-50 selected-glow' 
                            : 'border border-gray-200 hover:border-blue-300 hover:shadow-lg'
                          }
                          ${isCurrent ? 'bg-green-50' : ''}
                        `}
                        onClick={() => {
                          setSelectedCertificate(cert);
                        }}
                        size="small"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <Radio 
                              value={cert.id} 
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
                                    {cert.commonName || cert.uid || 'Không rõ tên'}
                                  </Text>
                                  
                                  {/* Badges */}
                                  <div className="flex space-x-1">
                                    {cert.isDefault && (
                                      <Tag 
                                        icon={<CrownOutlined />} 
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
                                  color="green" 
                                  icon={<CheckCircleOutlined />}
                                  className={isSelected ? 'animate-pulse' : ''}
                                >
                                  Hợp lệ
                                </Tag>
                              </div>

                              {/* Chi tiết certificate */}
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <Text className="text-gray-600">ID:</Text>
                                  <Text code className="font-mono text-xs">{cert.id}</Text>
                                </div>
                                
                                <div className="flex justify-between">
                                  <Text className="text-gray-600">UID:</Text>
                                  <Text className="font-mono text-xs">{cert.uid || 'N/A'}</Text>
                                </div>
                                
                                <div className="flex justify-between">
                                  <Text className="text-gray-600">Ngày hết hạn:</Text>
                                  <Text className="text-xs">
                                    {formatDate(cert.validTo)}
                                  </Text>
                                </div>
                                
                                {cert.subjectDN && (
                                  <div className="flex justify-between">
                                    <Text className="text-gray-600">Subject DN:</Text>
                                    <Text className="text-xs text-right ml-2 truncate max-w-xs" title={cert.subjectDN}>
                                      {cert.subjectDN}
                                    </Text>
                                  </div>
                                )}
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
                    </Col>
                  );
                })}
              </Row>
            </Radio.Group>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SmartCASelector;