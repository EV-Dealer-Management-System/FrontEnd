import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
import { 
  DownloadOutlined, 
  PrinterOutlined, 
  ZoomInOutlined, 
  ZoomOutOutlined,
  FilePdfOutlined,
  FullscreenOutlined
} from '@ant-design/icons';
import { Document, Page, pdfjs } from 'react-pdf';
import { Spin } from 'antd';

// Cấu hình worker cho pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

function PDFModal({ visible, onClose, contractNo, pdfUrl, title }) {
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);

  // Xử lý đóng modal
  const handleClose = () => {
    if (onClose) onClose();
  };

  // Tải xuống PDF
  const handleDownload = () => {
    if (!pdfUrl) {
      message.warning('Không có file PDF để tải xuống');
      return;
    }
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title || `hop-dong-${contractNo}`}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Đang tải xuống PDF...');
  };

  // In PDF
  const handlePrint = () => {
    if (!pdfUrl) {
      message.warning('Không có file PDF để in');
      return;
    }
    
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
      message.success('Đang mở cửa sổ in...');
    }
  };

  // Zoom functions
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.3));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  // Khi PDF load thành công
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={handleClose}
      footer={null}
      width="50%"
      style={{ top: 30 }}
      styles={{ 
        body: { 
          height: '85vh', 
          padding: 0,
          overflow: 'auto'
        } 
      }}
      centered={true}
      maskClosable={true}
      keyboard={true}
      destroyOnHidden={true}
    >
      <div className="flex flex-col h-full bg-white">
        {/* Toolbar với tất cả chức năng */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <FilePdfOutlined className="text-xl" />
            <span className="font-semibold text-lg">{title || `Hợp đồng ${contractNo}`}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Zoom controls */}
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <Button 
                type="text" 
                icon={<ZoomOutOutlined />} 
                onClick={zoomOut} 
                className="text-white hover:bg-white/20 border-0"
                size="small"
                title="Thu nhỏ"
              />
              <span className="text-sm font-medium min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button 
                type="text" 
                icon={<ZoomInOutlined />} 
                onClick={zoomIn} 
                className="text-white hover:bg-white/20 border-0"
                size="small"
                title="Phóng to"
              />
              <Button 
                type="text" 
                onClick={resetZoom} 
                className="text-white hover:bg-white/20 border-0"
                size="small"
                title="Reset zoom"
              >
                Reset
              </Button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button 
                type="text" 
                icon={<PrinterOutlined />} 
                onClick={handlePrint} 
                className="text-white hover:bg-white/20 border-0"
                title="In tài liệu"
              >
                In
              </Button>
              <Button 
                type="text" 
                icon={<DownloadOutlined />} 
                onClick={handleDownload} 
                className="text-white hover:bg-white/20 border-0"
                title="Tải xuống"
              >
                Tải xuống
              </Button>
            </div>
          </div>
        </div>

        {/* PDF Content với scroll được đảm bảo */}
        <div 
          className="flex-1 bg-gray-100 relative" 
          style={{ 
            height: 'calc(85vh - 80px)', 
            overflow: 'auto',
            overflowY: 'scroll',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Ghi chú hướng dẫn */}
          <div className="absolute top-4 right-4 z-10 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
            📄 Lướt xuống để xem toàn bộ tài liệu
          </div>
          
          <div className="w-full py-4" style={{ minHeight: '100%' }}>
            <div className="flex justify-center">
              <div className="w-full max-w-2xl px-4">
                {loading && (
                  <div className="flex justify-center items-center h-64">
                    <Spin size="large" tip="Đang tải PDF..." />
                  </div>
                )}

                {pdfUrl && (
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={(error) => {
                      console.error('PDF load error:', error);
                      message.error('Không thể tải PDF');
                      setLoading(false);
                    }}
                    loading=""
                  >
                    {numPages && Array.from(new Array(numPages), (el, index) => (
                      <div key={`page_${index + 1}`} className="flex justify-center mb-6">
                        <div className="shadow-xl rounded-lg overflow-hidden border border-gray-200 bg-white">
                          <Page
                            pageNumber={index + 1}
                            scale={scale}
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                            onLoadError={(error) => {
                              console.error(`Page ${index + 1} load error:`, error);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </Document>
                )}

                {!pdfUrl && !loading && (
                  <div className="flex justify-center items-center h-64 text-gray-500">
                    <div className="text-center">
                      <FilePdfOutlined className="text-6xl mb-4 text-gray-300" />
                      <p className="text-xl">Không có PDF để hiển thị</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PDFModal;