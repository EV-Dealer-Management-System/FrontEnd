import React from 'react';
import { Modal, Button, Typography, Card, Divider } from 'antd';
import { EyeOutlined, CodeOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Modal xem trước template với HTML đầy đủ (style + head + body)
function PreviewModal({
  visible,
  onClose,
  templateData,
  htmlContent,
  allStyles,
  htmlHead,
  htmlAttributes,
  rebuildCompleteHtml
}) {

  // ✅ Tạo HTML đầy đủ cho preview
  const getCompleteHtml = () => {
    if (!templateData || !htmlContent) return '';
    
    return rebuildCompleteHtml(htmlContent, templateData.name);
  };

  // ✅ Handle print preview
  const handlePrint = () => {
    const completeHtml = getCompleteHtml();
    if (!completeHtml) return;

    // Tạo window mới để print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(completeHtml);
    printWindow.document.close();
    printWindow.focus();
    
    // Đợi load xong rồi print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // ✅ Handle download HTML
  const handleDownload = () => {
    const completeHtml = getCompleteHtml();
    if (!completeHtml) return;

    const blob = new Blob([completeHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateData?.name || 'template'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <span className="flex items-center">
            <EyeOutlined className="mr-2" />
            Xem trước Template: {templateData?.name}
          </span>
          <div className="flex items-center space-x-2">
            <Button 
              icon={<PrinterOutlined />} 
              onClick={handlePrint}
              className="border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              In thử
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleDownload}
              className="border-green-500 text-green-500 hover:bg-green-50"
            >
              Tải HTML
            </Button>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width="95vw"
      style={{ top: 20 }}
      styles={{
        body: { 
          height: 'calc(100vh - 150px)', 
          padding: '16px',
          overflow: 'hidden'
        }
      }}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>
      ]}
    >
      <div className="h-full flex flex-col">
        
        {/* Info Panel */}
        <Card className="mb-4" size="small">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Text strong>Template Code:</Text>
              <div className="font-mono text-blue-600">{templateData?.code}</div>
            </div>
            <div>
              <Text strong>Template Name:</Text>
              <div>{templateData?.name}</div>
            </div>
            <div>
              <Text strong>Styles Preserved:</Text>
              <div className={`font-mono ${allStyles ? 'text-green-600' : 'text-red-500'}`}>
                {allStyles ? `✓ ${(allStyles.match(/<style/g) || []).length} blocks` : '✗ No styles'}
              </div>
            </div>
          </div>
        </Card>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            
            {/* Preview Panel */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <EyeOutlined className="mr-2 text-blue-500" />
                  <Title level={5} className="mb-0">A4 Preview (Real Size)</Title>
                </div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Scale: 60% • A4 Portrait
                </div>
              </div>
              
              <div className="flex-1 border rounded overflow-auto bg-gray-100 p-6" style={{ minHeight: '500px' }}>
                <div className="flex justify-center">
                  <div 
                    className="bg-white shadow-2xl mx-auto border border-gray-300"
                    style={{ 
                      width: '210mm', 
                      minHeight: '297mm',
                      maxWidth: '100%',
                      transform: 'scale(0.6)',
                      transformOrigin: 'top center',
                      marginBottom: '-120px',
                      padding: '10mm'
                    }}
                  >
                    <iframe
                      srcDoc={getCompleteHtml()}
                      className="w-full border-0"
                      style={{ 
                        width: '100%',
                        height: '277mm', // A4 height - padding
                        minHeight: '277mm'
                      }}
                      title="Template Preview"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* HTML Source Panel */}
            <div className="flex flex-col">
              <div className="flex items-center mb-2">
                <CodeOutlined className="mr-2 text-green-500" />
                <Title level={5} className="mb-0">Complete HTML Source</Title>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <textarea
                  value={getCompleteHtml()}
                  readOnly
                  className="w-full h-full p-3 font-mono text-xs border rounded resize-none bg-gray-50"
                  style={{ 
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                    fontSize: '11px',
                    lineHeight: '1.4'
                  }}
                  placeholder="HTML source sẽ hiển thị khi có template..."
                />
              </div>
            </div>

          </div>
        </div>

        {/* Debug Info */}
        <Divider />
        <Card size="small" className="mt-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
            <div>
              <strong>Total HTML:</strong> {getCompleteHtml().length} chars
            </div>
            <div>
              <strong>Body Content:</strong> {htmlContent?.length || 0} chars
            </div>
            <div>
              <strong>Styles:</strong> {allStyles?.length || 0} chars
            </div>
            <div>
              <strong>Head Content:</strong> {htmlHead?.length || 0} chars
            </div>
          </div>
        </Card>

      </div>
    </Modal>
  );
}

export default PreviewModal;
