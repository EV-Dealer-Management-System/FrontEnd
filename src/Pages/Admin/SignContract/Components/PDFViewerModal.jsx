import React, { useState } from 'react';
import { 
  Modal, 
  Button, 
  Image 
} from 'antd';
import { FilePdfOutlined, ClearOutlined, EnvironmentOutlined } from '@ant-design/icons';

// PDF Viewer Modal component - Hiển thị PDF giống Adobe Acrobat
const PDFViewerModal = ({ 
  visible, 
  onCancel, 
  contractLink, 
  contractNo,
  viewerLink 
}) => {
  const [currentService, setCurrentService] = useState(0); // Default to Google Docs Viewer
  const [imageError, setImageError] = useState(false);
  
  const services = [
    {
      name: "Google Docs Viewer",
      url: `https://docs.google.com/gview?url=${encodeURIComponent(contractLink)}&embedded=true`,
    },
    {
      name: "PDF.js Viewer",
      url: `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(contractLink)}`,
    },
    {
      name: "Original PDF",
      url: contractLink,
    }
  ];

  const currentUrl = viewerLink || services[currentService].url;
  
  const handleServiceChange = () => {
    setCurrentService((prev) => (prev + 1) % services.length);
    setImageError(false);
  };
  
  return (
    <Modal
      title={
        <div className="flex items-center justify-between bg-gray-100 -mx-6 -mt-4 px-6 py-3 border-b">
          <span className="flex items-center">
            <FilePdfOutlined className="text-red-500 mr-2" />
            <span className="font-medium">{contractNo}</span>
          </span>
          <div className="flex items-center space-x-2">
            <Button size="small" onClick={handleServiceChange} className="text-xs">
              Viewer: {services[currentService].name}
            </Button>
            <Button 
              type="primary" 
              size="small" 
              danger 
              onClick={onCancel}
              className="text-xs"
            >
              Thoát Toàn Màn Hình
            </Button>
            {imageError && <span className="text-red-500 text-xs">❌ Lỗi tải</span>}
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
        <Button 
          key="download" 
          type="primary" 
          icon={<FilePdfOutlined />}
          href={contractLink} 
          target="_blank"
          className="bg-red-500 border-red-500 hover:bg-red-600"
        >
          Tải xuống PDF
        </Button>
      ]}
      width="100vw"
      style={{ 
        top: 0,
        margin: 0,
        padding: 0,
        maxWidth: '100vw'
      }}
      styles={{
        header: {
          padding: '10px 16px',
          background: '#333',
          color: 'white',
          borderBottom: '1px solid #222'
        },
        body: { 
          height: 'calc(100vh - 110px)', 
          padding: '0',
          backgroundColor: '#525659',
          overflow: 'hidden'
        },
        mask: {
          backgroundColor: 'rgba(0,0,0,0.85)'
        },
        wrapper: {
          maxWidth: '100vw'
        },
        content: {
          padding: 0
        }
      }}
      destroyOnClose={true}
    >
      <div className="w-full h-full flex flex-col" style={{ backgroundColor: '#525659' }}>
        {/* PDF Display - Acrobat Style Fullscreen */}
        <div 
          className="flex-1 overflow-hidden flex justify-center"
          style={{
            backgroundColor: '#525659',
            padding: '0'
          }}
        >
          <div className="bg-white shadow-lg" style={{ width: '100%', height: '100%', maxWidth: '100%', display: 'flex', justifyContent: 'center' }}>
            {currentService === 2 ? (
              // Hiển thị PDF trực tiếp - sử dụng iframe với Mozilla PDF.js nếu browser không hỗ trợ
              <object 
                data={currentUrl} 
                type="application/pdf" 
                style={{ 
                  width: '100%', 
                  height: '85vh',
                  minWidth: '800px',
                  display: 'block'
                }}
                onError={() => setImageError(true)}
              >
                <iframe
                  src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(contractLink)}`}
                  title={`Hợp đồng ${contractNo}`}
                  style={{ 
                    width: '100%', 
                    height: '90vh',
                    minWidth: '100%',
                    border: 'none',
                    display: 'block'
                  }}
                  onError={() => setImageError(true)}
                />
                <div className="p-8 text-center text-gray-600 bg-white">
                  <FilePdfOutlined className="text-4xl text-red-500 mb-4" />
                  <p className="text-lg mb-4">Không thể hiển thị PDF trực tiếp</p>
                  <Button 
                    type="primary" 
                    icon={<EnvironmentOutlined />}
                    href={contractLink} 
                    target="_blank"
                    className="bg-blue-500 border-blue-500"
                  >
                    Mở trong tab mới
                  </Button>
                </div>
              </object>
            ) : (
              // Hiển thị qua iframe với các service viewer
              <iframe
                src={currentUrl}
                title={`Hợp đồng ${contractNo}`}
                style={{ 
                  width: '100%', 
                  height: '90vh',
                  minWidth: '100%',
                  maxWidth: '100%',
                  border: 'none',
                  display: 'block'
                }}
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Hướng dẫn sử dụng - Acrobat style */}
      <div className="flex justify-between items-center text-gray-300 text-xs px-4 py-2" style={{ backgroundColor: '#333', borderTop: '1px solid #222' }}>
        <div className="flex items-center">
          <span className="mr-2">💡</span>
          <span>Sử dụng scroll để xem toàn bộ tài liệu</span>
        </div>
        <div>
          <span>Hợp đồng số: <strong>{contractNo}</strong></span>
        </div>
      </div>
    </Modal>
  );
};

export default PDFViewerModal;