import React, { useState, useEffect } from 'react';
import { Modal, Card, Button, Tag, Row, Col, Typography, Space, Divider, Alert } from 'antd';
import { SafetyOutlined, CheckCircleOutlined, ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const SmartCASelector = ({ visible, onCancel, onSelect, smartCAData, loading, isExistingSmartCA = false, currentSelectedId = null }) => {
  const [selectedCertificate, setSelectedCertificate] = useState(null);

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

  // Xử lý chọn chứng chỉ
  function handleSelect() {
    if (!selectedCertificate) return;
    onSelect(selectedCertificate);
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
          loading={loading}
        >
          {currentSelectedId ? 'Đổi Chứng Thư' : 'Chọn để ký'}
        </Button>
      ]}
      width={800}
      destroyOnClose
    >
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
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-blue-500 shadow-md bg-blue-50' 
                        : canSelect 
                          ? 'border-gray-200 hover:border-blue-300 hover:shadow-sm' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    }`}
                    onClick={() => canSelect && setSelectedCertificate(cert)}
                    size="small"
                  >
                    <div className="flex justify-between items-start">
                      {/* Thông tin chính */}
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Text strong className="text-lg mr-2">
                            {cert.commonName || cert.name}
                          </Text>
                          {cert.isDefault && (
                            <Tag color="blue" className="text-xs">
                              Mặc định
                            </Tag>
                          )}
                          {isCurrent && (
                            <Tag color="green" className="text-xs">
                              Đang sử dụng
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

                      {/* Radio selection indicator */}
                      <div className="ml-4 flex items-center">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
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