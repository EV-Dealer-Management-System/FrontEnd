import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Alert,
  Modal
} from 'antd';
import { 
  ShopOutlined, 
  PictureOutlined, 
  EnvironmentOutlined, 
  FilePdfOutlined, 
  EditOutlined, 
  CheckOutlined 
} from '@ant-design/icons';
import PDFViewerModal from './PDFViewerModal';

// Component hiển thị hợp đồng đã tạo
const ContractViewer = ({ 
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
  );
};

export default ContractViewer;