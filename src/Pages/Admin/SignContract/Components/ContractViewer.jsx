import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Alert
} from 'antd';
import { 
  ShopOutlined, 
  EnvironmentOutlined, 
  FilePdfOutlined, 
  EditOutlined, 
  CheckOutlined 
} from '@ant-design/icons';
import OptimizedPDFViewer from '../../CreateDealerAccount/OptimizedPDFViewer';

// Component hiển thị hợp đồng đã tạo - Phase 4: Chỉ sử dụng React-PDF
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
  // Không cần pdfModalVisible nữa vì PDFViewer có built-in fullscreen
  
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
          
          {/* PDF Display - Phase 4: Chỉ sử dụng React-PDF */}
          <div className="mt-6 mb-6">
            {loading ? (
              <div className="border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 min-h-[750px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải hợp đồng PDF...</p>
                </div>
              </div>
            ) : (
              // Phase 4 & 5: Optimized PDF Viewer với lazy loading
              <OptimizedPDFViewer 
                contractNo={contractNo} 
                pdfUrl={viewerLink || contractLink}
              />
            )}
          </div>
          
          {/* Action buttons - Phase 4: Đơn giản hóa, PDFViewer có built-in fullscreen */}
          <div className="flex justify-between items-center mt-4">
            <Space>
              <Button 
                type="primary" 
                href={viewerLink || contractLink} 
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
      {/* Phase 4: Đã loại bỏ PDFViewerModal - PDFViewer có fullscreen built-in */}
    </>
  );
};

export default ContractViewer;