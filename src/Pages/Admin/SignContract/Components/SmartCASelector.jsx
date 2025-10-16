import React, { useState, useEffect } from 'react';
import { Modal, Card, Button, Tag, Row, Col, Typography, Space, Divider, Alert, message } from 'antd';
import { SafetyOutlined, CheckCircleOutlined, ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { SmartCAService } from '../../../../App/EVMAdmin/SignContractEVM/SmartCA';

const { Text, Title } = Typography;

const SmartCASelector = ({ visible, onCancel, onSelect, smartCAData, loading, isExistingSmartCA = false, currentSelectedId = null }) => {
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
    if (!selectedCertificate) return;
    
    setUpdating(true);
    try {
      console.log('=== SELECTING SMARTCA ===');
      console.log('Selected certificate:', selectedCertificate);
      
      // Gọi API với parameters đúng theo spec
      const smartCAId = String(selectedCertificate.id); // Đảm bảo là string
      const smartCAOwnerName = selectedCertificate.commonName || selectedCertificate.name || null;
      
      console.log('SmartCA ID:', smartCAId, '(type:', typeof smartCAId, ')');
      console.log('SmartCA Owner Name:', smartCAOwnerName, '(type:', typeof smartCAOwnerName, ')');
      
      const result = await smartCAService.handleUpdateSmartCA(smartCAId, smartCAOwnerName);
      
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
        .scale-102 {
          transform: scale(1.02);
        }
        .scale-105 {
          transform: scale(1.05);
        }
        .scale-110 {
          transform: scale(1.1);
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
        <Row gutter={[16, 16]}>
          {certificates.length === 0 ? (
            <Col span={24}>
              <div className="text-center py-8 text-gray-500">
                <InfoCircleOutlined className="text-3xl mb-2" />
                <div>Không có chứng thư số nào</div>
                <div className="text-sm mt-1">Vui lòng thêm SmartCA trước khi ký</div>
              </div>
            </Col>
          ) : (
            certificates.map((cert) => {
              const expired = isExpired(cert.validTo);
              const canSelect = cert.isValid && !expired;
              const isSelected = selectedCertificate?.id === cert.id;
              const isCurrent = cert.id === currentSelectedId;

              return (
                <Col span={24} key={cert.id}>
                  <Card
                    className={`cursor-pointer transition-all duration-300 transform relative overflow-hidden ${
                      isSelected 
                        ? 'border-3 border-blue-500 shadow-xl bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 scale-105 ring-2 ring-blue-200 ring-opacity-50' 
                        : canSelect 
                          ? 'border-2 border-gray-300 hover:border-blue-400 hover:shadow-lg hover:scale-102 bg-white hover:bg-blue-25' 
                          : 'border border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    }`}
                    onClick={() => canSelect && setSelectedCertificate(cert)}
                    size="small"
                    style={{
                      borderWidth: isSelected ? '3px' : canSelect ? '2px' : '1px',
                      boxShadow: isSelected 
                        ? '0 10px 25px -5px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)' 
                        : canSelect 
                          ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                          : 'none'
                    }}
                  >
                    {/* Background gradient overlay cho selected */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                    )}
                    
                    {/* Indicator cho selection - Redesigned */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 flex items-center space-x-2 z-10">
                        <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg animate-pulse">
                          ĐÃ CHỌN
                        </div>
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          <CheckCircleOutlined className="text-white text-base" />
                        </div>
                      </div>
                    )}

                    {/* Left border highlight cho selected */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600" />
                    )}
                    <div className="flex justify-between items-start">
                      {/* Thông tin chính */}
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Text 
                            strong 
                            className={`text-lg mr-2 transition-colors duration-300 ${
                              isSelected ? 'text-blue-700 font-bold' : 'text-gray-900'
                            }`}
                          >
                            {cert.commonName || cert.name}
                          </Text>
                          {cert.isDefault && (
                            <Tag color={isSelected ? "blue" : "blue"} className="text-xs font-medium">
                              Mặc định
                            </Tag>
                          )}
                          {isCurrent && (
                            <Tag color={isSelected ? "green" : "green"} className="text-xs font-medium">
                              Đang sử dụng
                            </Tag>
                          )}
                          {isSelected && (
                            <Tag color="gold" className="text-xs font-semibold ml-1 animate-pulse">
                              ⭐ ĐƯỢC CHỌN
                            </Tag>
                          )}
                        </div>

                        <Space direction="vertical" size={4} className="w-full">
                          <div className="flex justify-between">
                            <Text className="text-gray-600">CCCD/HC/MST:</Text>
                            <Text strong>{cert.uid || 'N/A'}</Text>
                          </div>

                          <div className="flex justify-between">
                            <Text className="text-gray-600">Trạng thái:</Text>
                            <div>
                              {canSelect ? (
                                <Tag color="green" icon={<CheckCircleOutlined />}>
                                  Đang hoạt động
                                </Tag>
                              ) : expired ? (
                                <Tag color="red" icon={<ClockCircleOutlined />}>
                                  Hết hạn
                                </Tag>
                              ) : (
                                <Tag color="orange">
                                  Không khả dụng
                                </Tag>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between">
                            <Text className="text-gray-600">Hiệu lực:</Text>
                            <Text>
                              {formatDate(cert.validFrom)} - {formatDate(cert.validTo)}
                            </Text>
                          </div>

                          <div className="flex justify-between">
                            <Text className="text-gray-600">Số serial:</Text>
                            <Text className="font-mono text-sm">
                              {cert.serialNumber ? 
                                `${cert.serialNumber.substring(0, 20)}...` : 
                                'N/A'
                              }
                            </Text>
                          </div>

                          <div className="flex justify-between">
                            <Text className="text-gray-600">Gói:</Text>
                            <Text className="text-sm">
                              {cert.smartCaServiceName || 'SMARTCA CÁ NHÂN CƠ BẢN'}
                            </Text>
                          </div>
                        </Space>
                      </div>

                      {/* Radio selection indicator - Enhanced */}
                      <div className="ml-4 flex items-center">
                        <div className={`w-6 h-6 rounded-full border-3 flex items-center justify-center transition-all duration-300 transform ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500 shadow-lg scale-110 ring-2 ring-blue-200' 
                            : canSelect
                              ? 'border-gray-400 bg-white hover:border-blue-400 hover:scale-105'
                              : 'border-gray-300 bg-gray-100'
                        }`}>
                          {isSelected && (
                            <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })
          )}
        </Row>
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