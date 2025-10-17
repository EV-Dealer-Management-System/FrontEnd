import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Alert,
  message
} from 'antd';
import { 
  ShopOutlined, 
  EnvironmentOutlined, 
  FilePdfOutlined, 
  EditOutlined, 
  CheckOutlined 
} from '@ant-design/icons';
import PDFModal from './PDF/PDFModal';

// Component hiển thị hợp đồng đã tạo - Sử dụng PDF Modal
const ContractViewer = ({
  contractLink,
  contractNo,
  contractSigned,
  onSign,
  onDownload,
  onNewContract,
  viewerLink,
  loading = false
}) => {
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const previewUrl = viewerLink || null;

  const handleOpenInNewTab = () => {
    const targetUrl = previewUrl || contractLink;

    if (!targetUrl) {
      message.warning('Không có đường dẫn để mở hợp đồng.');
      return;
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

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
          
          {/* PDF Preview - Hiển thị thông tin về PDF */}
          <div className="mt-6 mb-6">
            <div className="border border-gray-300 rounded-lg p-6 text-center bg-gray-50">
              <FilePdfOutlined className="text-4xl text-blue-500 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Hợp đồng PDF sẵn sàng</h3>
              <p className="text-gray-600 mb-4">
                Hợp đồng số <strong>{contractNo}</strong> đã được tạo thành công.
              </p>
              <Button
                type="primary"
                size="large"
                icon={<FilePdfOutlined />}
                onClick={() => setPdfModalVisible(true)}
                loading={loading}
                className="bg-blue-500 hover:bg-blue-600"
                disabled={!previewUrl}
              >
                Xem hợp đồng PDF
              </Button>
              {!previewUrl && !loading && (
                <p className="text-sm text-gray-500 mt-3">
                  Không thể tải trước hợp đồng trong ứng dụng. Vui lòng mở trong tab mới để xem.
                </p>
              )}
            </div>
          </div>

          {/* Action buttons - Phase 4: Đơn giản hóa, PDFViewer có built-in fullscreen */}
          <div className="flex justify-between items-center mt-4">
            <Space>
              <Button
                type="primary"
                onClick={handleOpenInNewTab}
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
            
            <Button 
              type="primary"
              onClick={onNewContract}
              className="bg-blue-500 border-blue-500 hover:bg-blue-600"
            >
              Tạo hợp đồng mới
            </Button>
          </div>
        </div>
      </Card>
      
      {/* PDF Modal for contract viewing */}
      <PDFModal
        visible={pdfModalVisible}
        onClose={() => setPdfModalVisible(false)}
        contractNo={contractNo}
        pdfUrl={previewUrl}
        title={`Hợp đồng ${contractNo}`}
      />
    </>
  );
};

export default ContractViewer;