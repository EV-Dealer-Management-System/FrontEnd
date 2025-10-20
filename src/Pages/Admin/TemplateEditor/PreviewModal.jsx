import React, {useMemo, useState} from 'react';
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
  // chức năng zoom cho preview
  const [zoom, setZoom] = useState(1);

  // ✅ Tạo HTML đầy đủ cho preview
  const completeHtml = useMemo(() => {
    // 0) Không có gì để hiển thị
    if (!htmlContent || !String(htmlContent).trim()) {
      console.warn('[PreviewModal] Missing htmlContent');
      return '';
    }

    // 1) Nếu htmlContent đã là tài liệu HTML đầy đủ -> dùng trực tiếp (không rebuild)
    const isFullDoc = /<(html|head|body)(\s|>)/i.test(htmlContent);
    if (isFullDoc) {
      console.log('[PreviewModal] Detected full HTML doc. Using as-is.');
      return htmlContent;
    }

    // 2) htmlContent là body-only -> rebuild với đủ phần head/style/attrs (nếu có)
    if (typeof rebuildCompleteHtml === 'function') {
      const extras = {
        allStyles: allStyles || '',
        headContent: htmlHead || '',
        htmlAttrs: htmlAttributes || '',
      };
      const subject = templateData?.name || 'Preview';
      const html = rebuildCompleteHtml(htmlContent, subject, extras);
      console.log('[PreviewModal] Built completeHtml (body-only -> full):', html?.length);
      return html;
    }

    // 3) Fallback cuối (rất an toàn): tự bọc nhanh body vào HTML đầy đủ
    const fallback = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><title>${templateData?.name || 'Preview'}</title></head>
        <body>${htmlContent}</body>
      </html>`;
    console.warn('[PreviewModal] Using local fallback rebuild (no rebuildCompleteHtml provided)');
    return fallback;
  }, [htmlContent, templateData, allStyles, htmlHead, htmlAttributes, rebuildCompleteHtml]);

  // ✅ Handle print preview
  const handlePrint = () => {
    const html = completeHtml;
    if (!html) return;

    // Tạo window mới để print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    // Đợi load xong rồi print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // ✅ Handle download HTML
  const handleDownload = () => {
    
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
      destroyOnHidden
      styles={{
        body: { 
          height: 'calc(100vh - 150px)', 
          padding: '16px',
          overflow: 'auto'
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
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Preview Panel */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <EyeOutlined className="mr-2 text-blue-500" />
                  <Title level={5} className="mb-0">A4 Preview (Real Size)</Title>
                     {/* Zoom Controls */}
                      <div className="flex items-center space-x-2 mb-4">
                        <Button onClick={() => setZoom(zoom - 0.1)} disabled={zoom <= 0.1}>
                          -
                        </Button>
                        <span> Scale: {Math.round(zoom * 100)}% </span>
                        <Button onClick={() => setZoom(zoom + 0.1)} disabled={zoom >= 2}>
                          +
                        </Button>
                      </div>
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
                      zoom: zoom,
                      marginBottom: '-120px',
                      padding: '10mm'
                    }}
                  >
                    <iframe
                      srcDoc={completeHtml}
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
                <span className="ml-2 text-sm text-gray-500">Kéo mở rộng để coi thêm</span>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <textarea
                  value={completeHtml}
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
              <strong>Total HTML:</strong> {completeHtml.length} chars
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
