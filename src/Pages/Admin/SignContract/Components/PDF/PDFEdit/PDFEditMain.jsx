import { useState, useEffect } from 'react';
import 'quill/dist/quill.snow.css';
import { 
  Modal, 
  Button, 
  Card, 
  Space, 
  Spin, 
  Typography,
  Row,
  Col,
  Input,
  Tabs
} from 'antd';
import { 
  EditOutlined, 
  SaveOutlined, 
  EyeOutlined,
  FileTextOutlined,
  CodeOutlined,
  EditFilled
} from '@ant-design/icons';

import { useQuillEditor } from './useQuillEditor';
import { useHtmlParser } from './useHtmlParser';
import { useTemplateActions } from './useTemplateActions';

const { Title, Text } = Typography;
const { TextArea } = Input;

// PDF Template Editor Main Component
function PDFEditMain({
  contractId,
  contractNo,
  visible = false,
  onSave,
  onCancel
}) {
  // States cơ bản
  const [htmlContent, setHtmlContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [contractSubject, setContractSubject] = useState('');
  const [activeTab, setActiveTab] = useState('editor');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUpdatingFromCode, setIsUpdatingFromCode] = useState(false);
  

  // Custom hooks
  const {
    parseFromBE,
    bodyForEditor,      
    allStyles,          
    rebuildCompleteHtml
  } = useHtmlParser();

  const {
    quill,
    quillRef,
    isPasted,
    setIsPasted,
    resetQuillContent,
    getCurrentContent
  } = useQuillEditor(visible, htmlContent, setHasUnsavedChanges, isUpdatingFromCode);

  const {
    loading,
    saveLoading,
    templateData,
    templateLoaded,
    handleSave: originalHandleSave,
    handleReset,
    handleClose,
    handleForceClose,
    loadTemplate,
    resetStates,
    setTemplateData,
    setTemplateLoaded,
    contextHolder
  } = useTemplateActions(
    contractId,
    contractNo,
    visible,
    onSave,
    onCancel,
    htmlContent,
    setHtmlContent,
    originalContent,
    setOriginalContent,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    getCurrentContent,
    rebuildCompleteHtml,
    contractSubject
  );

  useEffect(() => {
    window.__UPDATE_HTML_CONTENT__ = (newHtml) => {
      setHtmlContent(newHtml);
    };
    return () => {
      delete window.__UPDATE_HTML_CONTENT__;
    };
  }, []);

  // Xử lý template loading và parsing
  useEffect(() => {
    const handleTemplateLoad = async () => {
      if (visible && contractId && !templateLoaded) {
        const template = await loadTemplate();
        if (template) {
          // ✅ Parse HTML từ BE - tách TẤT CẢ style và structure
          const rawHtml = template.htmlTemplate || '';
          const parsedResult = parseHtmlFromBE(rawHtml);
          
          // Lưu structure vào state
          updateParsedStructure(parsedResult);

          window.__PDF_TEMPLATE_CACHE__ = {
            allStyles: parsedResult.allStyles,
            htmlHead: parsedResult.htmlHead,
            htmlAttributes: parsedResult.htmlAttributes
          }
          
          // 🧩 DÙNG editableBody (thay bodyContent)
          setHtmlContent(parsedResult.editableBody || '');
          setOriginalContent(parsedResult.editableBody || '');
          setContractSubject(template.name || 'Hợp đồng đại lý');

          // ✅ Ghi log an toàn
          console.log('✅ Template loaded và parsed successfully');
          console.log('- Editable body length:', parsedResult.editableBody?.length || 0);
          console.log('- Template body length:', parsedResult.templateBody?.length || 0);
          console.log('- All styles length:', parsedResult.allStyles?.length || 0);
        }
      }
    };

    handleTemplateLoad();
  }, [visible, contractId, templateLoaded]);

  // Reset editor khi tạo contract mới
  useEffect(() => {
    if (visible && !contractId) {
      resetEditor(true); // FIX: Reset content khi tạo contract mới
    }
  }, [visible, contractId]);

  // Reset editor hoàn toàn - FIX: Chỉ reset khi thực sự cần
  const resetEditor = (shouldResetContent = false) => {
    console.log('Resetting editor, shouldResetContent:', shouldResetContent);
    
    // Reset workflow states
    setHasUnsavedChanges(false);
    
    // Chỉ reset content khi thực sự cần (ví dụ sau khi hoàn tất hợp đồng)
    if (shouldResetContent) {
      setHtmlContent('');
      setOriginalContent('');
      setContractSubject('');
      setTemplateData(null);
      setTemplateLoaded(false); // ✅ Reset flag để cho phép load lại template
      
      // ✅ Reset HTML structure states
      resetStructureStates();
      
      // Clear Quill content
      resetQuillContent();
      
    }
  };

  // ✅ Reset states khi modal đóng
  useEffect(() => {
    if (!visible) {
      // Reset các flag và states
      setIsUpdatingFromCode(false);
      setIsPasted(false);
      resetStates();
      
      console.log('✅ Modal closed → Reset all states + cleanup');
    }
  }, [visible]);

  // Thêm TailwindCSS styles cho react-quilljs
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      .ql-editor .sign { display: none !important; }
      .ql-editor [data-signature-block] { display: none !important; }
      .ql-editor [data-preserve-idx][data-type="sign"] { display: none !important; }
      .ql-editor {
        font-family: 'Noto Sans', 'DejaVu Sans', Arial, sans-serif !important;
        font-size: 12pt !important;
        line-height: 1.4 !important;
        min-height: 400px !important;
        height: auto !important;
        overflow-y: visible !important;
        word-wrap: break-word !important;
        word-break: break-word !important;
      }
      
      /* Bảo tồn style HTML trong Quill */
      .ql-editor p, .ql-editor div, .ql-editor span {
        margin-bottom: 0.5em !important;
      }
      
      .ql-editor table {
        width: 100% !important;
        border-collapse: collapse !important;
        margin-bottom: 1em !important;
      }
      
      .ql-editor td, .ql-editor th {
        border: 1px solid #ddd !important;
        padding: 8px !important;
        text-align: left !important;
        vertical-align: top !important;
      }
      
      .ql-editor th {
        background-color: #f5f5f5 !important;
        font-weight: bold !important;
      }
      
      .ql-editor .text-center {
        text-align: center !important;
      }
      
      .ql-editor .text-right {
        text-align: right !important;
      }
      
      .ql-editor .font-bold {
        font-weight: bold !important;
      }
      
      .ql-editor .underline {
        text-decoration: underline !important;
      }
      
      .ql-editor strong {
        font-weight: bold !important;
      }
      
      .ql-editor em {
        font-style: italic !important;
      }
      
      .ql-editor u {
        text-decoration: underline !important;
      }
      
      .ql-toolbar {
        position: sticky !important;
        top: 0;
        z-index: 10;
        border-color: #d1d5db !important;
        background-color: #f9fafb !important;
        border-radius: 6px 6px 0 0 !important;
      }
      
      .ql-container {
        border-color: #d1d5db !important;
        border-radius: 0 0 6px 6px !important;
        height: auto !important;
      }

      /* Highlight placeholder variables với TailwindCSS classes */
      .ql-editor .placeholder-variable {
        background-color: #dbeafe !important;
        color: #1d4ed8 !important;
        padding: 2px 4px !important;
        border-radius: 3px !important;
        font-family: 'Monaco', 'Consolas', monospace !important;
        font-size: 13px !important;
      }

      /* Đảm bảo quill container có đúng kích thước và luôn hiển thị */
      .ql-editor-container {
        height: calc(100vh - 300px) !important;
        max-height: calc(100vh - 300px) !important;
        overflow: auto !important;
        display: block !important;
        visibility: visible !important;
      }
      
      .ql-editor-container .ql-toolbar.ql-snow {
        border-top: 1px solid #d1d5db !important;
        display: block !important;
        visibility: visible !important;
      }
      
      /* Fix cho React 19 và react-quilljs */
      .quill {
        display: block !important;
        visibility: visible !important;
      }
      
      .quill > .ql-container {
        display: block !important;
      }
      
      .quill > .ql-toolbar {
        display: block !important;
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <span className="flex items-center">
            <EditOutlined className="mr-2" />
            Chỉnh sửa Template Hợp đồng - {contractNo}
          </span>
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                ⚠️ Có thay đổi chưa lưu
              </span>
            )}
            <Text type="secondary" className="text-sm">
              {templateData?.code}
            </Text>
          </div>
        </div>
      }
      open={visible}
      maskClosable={false}
      keyboard={false}
      onCancel={handleClose}
      width="95vw"
      style={{ top: 20 }}
      styles={{
        body: { 
          height: 'calc(100vh - 150px)', 
          padding: '16px',
          overflow: 'auto'
        }
      }}
      footer={null}
      forceRender
      destroyOnHidden={false}
    >
      {contextHolder}
      <div className="h-full flex flex-col">
        {/* Toolbar với workflow buttons */}
        <Card className="mb-4" size="small">
          <Row gutter={[16, 8]} align="middle">
            <Col>
              <Space className="flex flex-wrap">
                {/* Save Changes Button */}
                <Button 
                  type="primary" 
                  icon={saveLoading ? <Spin size="small" /> : <SaveOutlined />}
                  onClick={handleSave}
                  loading={saveLoading}
                  disabled={!hasUnsavedChanges}
                  className="bg-blue-500 hover:bg-blue-600 border-blue-500"
                >
                  {saveLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
                
                {/* Reset Button */}
                <Button 
                  onClick={handleReset}
                  disabled={!hasUnsavedChanges}
                  className="border-gray-300 hover:border-orange-500"
                >
                  Khôi phục
                </Button>
              </Space>
            </Col>

            {/* Status Display */}
            <Col>
              {hasUnsavedChanges && (
                <div className="flex items-center text-yellow-600">
                  <EditOutlined className="mr-1" />
                  <span>Có thay đổi chưa lưu</span>
                </div>
              )}
              {!hasUnsavedChanges && (
                <div className="flex items-center text-gray-500">
                  <span>Sẵn sàng lưu</span>
                </div>
              )}
            </Col>

            <Col flex="auto" />
          </Row>
        </Card>

        {/* Content Area */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded">
            <Spin size="large" tip="Đang tải template..." />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="h-full"
              type="card"
              items={[
                {
                  key: 'editor',
                  label: (
                    <span>
                      <EditFilled />
                      Chỉnh sửa nội dung
                    </span>
                  ),
                  children: (
                    <div className="h-full relative">
                      {/* ✅ quillRef LUÔN được render - không phụ thuộc vào quill instance */}
                      <div className="ql-editor-container h-full">
                        <div 
                          ref={quillRef} 
                          className="border border-gray-300 rounded bg-white h-full"
                          style={{ 
                            height: '100%',
                            visibility: 'visible',
                            opacity: 1
                          }}
                        />
                      </div>

                      {/* ✅ Loading overlay - chỉ hiển thị khi chưa có Quill */}
                      {!quill && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 bg-opacity-90 backdrop-blur-sm rounded">
                          <Spin size="large" tip="Đang khởi tạo editor..." />
                          <div className="mt-4 text-center">
                            <div className="text-sm text-gray-500 mb-2">
                              📦 Async polling DOM mount...
                            </div>
                            <div className="text-xs text-gray-400 space-y-1">
                              <div>Modal: {visible ? '✓' : '✗'}</div>
                              <div>DOM Ref: {quillRef.current ? '✓' : '✗'}</div>
                              <div>In Document: {quillRef.current && document.contains(quillRef.current) ? '✓' : '✗'}</div>
                              <div>Instance: {quill ? '✓' : '✗'}</div>
                            </div>
                            <div className="text-xs text-blue-500 mt-2">
                              Đợi Portal DOM + Quill init...
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  key: 'preview',
                  label: (
                    <span>
                      <EyeOutlined />
                      Xem trước
                    </span>
                  ),
                  children: (
                    <div
                      style={{
                        height: 'calc(100vh - 300px)',
                        overflowY: 'auto',
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: 8,
                        padding: 16,
                        fontFamily: 'Noto Sans, DejaVu Sans, Arial, sans-serif',
                        fontSize: '12pt',
                        lineHeight: '1.4'
                      }}
                    >
                      {/* ✅ Preview với styles được inject */}
                      {allStyles && (
                        <style dangerouslySetInnerHTML={{ __html: allStyles.replace(/<\/?style[^>]*>/g, '') }} />
                      )}
                      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                    </div>
                  )
                },
                {
                  key: 'html',
                  label: (
                    <span>
                      <CodeOutlined />
                      HTML
                    </span>
                  ),
                  children: (
                    <div className="h-full overflow-hidden">
                      <TextArea
                        value={htmlContent} // ghi/đọc RAW
                        onChange={(e) => {
                          setHtmlContent(e.target.value); // lưu RAW
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="Chỉnh sửa HTML trực tiếp (dành cho kỹ thuật viên)..."
                        className="h-full resize-none border-gray-300 focus:border-blue-500"
                        disabled={false}
                        style={{ 
                          height: 'calc(100vh - 300px)',
                          maxHeight: 'calc(100vh - 300px)',
                          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          backgroundColor: 'white',
                          color: 'inherit'
                        }}
                      />
                    </div>
                  )
                },
                {
                  key: 'debug',
                  label: (
                    <span>
                      <FileTextOutlined />
                      Debug Styles
                    </span>
                  ),
                  children: (
                    <div className="h-full overflow-auto p-4 bg-gray-50">
                      <div className="grid grid-cols-1 gap-4">
                        <Card size="small" title="📊 Style Preservation Status">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>All Styles Length:</span>
                              <span className="font-mono">{allStyles?.length || 0} chars</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Style Blocks Count:</span>
                              <span className="font-mono">{(allStyles?.match(/<style/g) || []).length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>HTML Head Length:</span>
                              <span className="font-mono">{htmlHead?.length || 0} chars</span>
                            </div>
                            <div className="flex justify-between">
                              <span>HTML Attributes:</span>
                              <span className="font-mono">{htmlAttributes || 'none'}</span>
                            </div>
                          </div>
                        </Card>
                        
                        <Card size="small" title="🎨 Preserved Styles">
                          <TextArea
                            value={allStyles}
                            readOnly
                            rows={10}
                            placeholder="Không có styles được lưu trữ"
                            className="font-mono text-xs"
                          />
                        </Card>
                        
                        <Card size="small" title="📄 Body Content (for Quill)">
                          <TextArea
                            value={htmlContent}
                            readOnly
                            rows={8}
                            placeholder="Không có nội dung body"
                            className="font-mono text-xs"
                          />
                        </Card>
                      </div>
                    </div>
                  )
                }
              ]}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

export default PDFEditMain;
