import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Button,
  message,
  Spin
} from 'antd';
import OptimizedPDFViewer from './OptimizedPDFViewer';
import PDFToolbar from '../SignContract/Components/PDF/PDFToolbar';

const PDFModal = ({ 
  visible, 
  onClose, 
  onCancel,
  contractNo, 
  pdfUrl,
  title = "Xem hợp đồng PDF"
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!visible) return;
      
      switch (event.key) {
        case 'Escape':
          handleClose();
          break;
        case 'F11':
          event.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [visible, isFullscreen]);

  // Handle close modal
  const handleClose = () => {
    if (onClose) onClose();
    if (onCancel) onCancel();
    setIsFullscreen(false);
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle download
  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      message.warning('Không có link tải PDF');
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Force re-render PDF viewer
    window.location.reload();
  };

  const modalProps = {
    open: visible,
    onCancel: handleClose,
    footer: null,
    closable: false,
    destroyOnClose: true,
    maskClosable: true,
    keyboard: true,
    ...(isFullscreen ? {
      width: '100vw',
      style: { 
        top: 0, 
        paddingBottom: 0,
        maxWidth: 'none'
      },
      styles: {
        body: {
          height: 'calc(100vh - 55px)',
          padding: 0,
          overflow: 'hidden'
        }
      }
    } : {
      width: '95%',
      centered: true,
      style: { top: 20 },
      styles: {
        body: {
          height: '85vh',
          padding: 0,
          overflow: 'hidden'
        }
      }
    })
  };

  return (
    <Modal 
      {...modalProps}
      className={`pdf-modal ${isFullscreen ? 'pdf-modal-fullscreen' : ''}`}
      wrapClassName="pdf-modal-wrap"
    >
      {/* Toolbar với error handling */}
      {(() => {
        try {
          return (
            <PDFToolbar
              title={title}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
              onDownload={handleDownload}
              onRefresh={handleRefresh}
              onClose={handleClose}
              showZoomControls={true}
              showPrintButton={true}
            />
          );
        } catch (error) {
          console.error('PDFToolbar Error:', error);
          return (
            <div className="flex justify-between items-center p-3 border-b bg-red-50">
              <span className="text-red-600">Lỗi tải toolbar</span>
              <Button onClick={handleClose} size="small">Đóng</Button>
            </div>
          );
        }
      })()}
      
      <div className="relative h-full bg-gray-100">
        {visible && (
          <div 
            className="h-full overflow-auto pdf-content"
            style={{
              scrollBehavior: 'smooth',
              overflowX: 'auto',
              overflowY: 'auto'
            }}
          >
            <OptimizedPDFViewer
              contractNo={contractNo}
              pdfUrl={pdfUrl}
              onLoadingChange={setLoading}
            />
          </div>
        )}
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <Spin size="large" />
              <div className="mt-3 text-gray-600 font-medium">Đang tải PDF...</div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .pdf-modal .ant-modal-content {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .pdf-modal .ant-modal-body {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .pdf-modal-fullscreen .ant-modal {
          max-width: none;
          margin: 0;
          padding: 0;
        }
        
        .pdf-modal-fullscreen .ant-modal-content {
          height: 100vh;
        }
        
        .pdf-content {
          scrollbar-width: thin;
          scrollbar-color: #888 #f1f1f1;
        }
        
        .pdf-content::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .pdf-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .pdf-content::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        
        .pdf-content::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        .pdf-modal-wrap .ant-modal-mask {
          background-color: rgba(0, 0, 0, 0.65);
        }
      `}</style>
    </Modal>
  );
};

export default PDFModal;