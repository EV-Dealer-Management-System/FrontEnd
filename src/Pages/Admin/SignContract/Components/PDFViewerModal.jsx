import React, { useState } from 'react';
import { 
  Modal, 
  Button, 
  Image,
  Tabs 
} from 'antd';
import { FilePdfOutlined, ClearOutlined, EnvironmentOutlined, FileTextOutlined } from '@ant-design/icons';
import PDFViewer from '../../CreateDealerAccount/PDFViewer';

// PDF Viewer Modal component - Hiển thị PDF giống Adobe Acrobat
const PDFViewerModal = ({ 
  visible, 
  onCancel, 
  contractLink, 
  contractNo,
  viewerLink 
}) => {
  const [activeTab, setActiveTab] = useState('google-docs'); // Default tab
  const [imageError, setImageError] = useState(false);
  
  // Sử dụng viewerLink nếu có (từ PDF preview API), nếu không thì dùng contractLink
  const pdfUrl = viewerLink || contractLink;

  // Tabs configuration for different PDF viewers
  const tabItems = [
    {
      key: 'google-docs',
      label: (
        <span>
          <EnvironmentOutlined />
          Google Docs
        </span>
      ),
      children: (
        <div className="h-[70vh]">
          <iframe 
            src={`https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
            className="w-full h-full border-0"
            title="Google Docs PDF Viewer"
          />
        </div>
      )
    },
    {
      key: 'pdfjs',
      label: (
        <span>
          <FilePdfOutlined />
          PDF.js
        </span>
      ),
      children: (
        <div className="h-[70vh]">
          <iframe 
            src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
            className="w-full h-full border-0"
            title="PDF.js Viewer"
          />
        </div>
      )
    },
    {
      key: 'react-pdf',
      label: (
        <span>
          <FileTextOutlined />
          React-PDF
        </span>
      ),
      children: (
        <div className="h-[70vh] overflow-auto">
          <PDFViewer 
            contractNo={contractNo} 
            pdfUrl={pdfUrl}
          />
        </div>
      )
    }
  ];
  
  return (
    <Modal
      title={
        <div className="flex items-center justify-between bg-gray-100 -mx-6 -mt-4 px-6 py-3 border-b">
          <span className="flex items-center">
            <FilePdfOutlined className="text-red-500 mr-2" />
            <span className="font-medium">{contractNo}</span>
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Mode: {activeTab === 'google-docs' ? 'Google Docs' : activeTab === 'pdfjs' ? 'PDF.js' : 'React-PDF'}
            </span>
            <Button 
              type="primary" 
              size="small" 
              danger 
              onClick={onCancel}
              className="text-xs"
            >
              Thoát Toàn Màn Hình
            </Button>
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
      {/* Phase 2: Tabs cho các PDF viewers */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={tabItems}
        type="card"
        size="small"
        className="h-full"
        tabBarStyle={{ 
          margin: 0, 
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #d9d9d9'
        }}
      />
    </Modal>
  );
};

export default PDFViewerModal;