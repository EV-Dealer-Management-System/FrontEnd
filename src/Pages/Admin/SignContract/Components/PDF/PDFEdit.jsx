import React, { useState, useEffect, useRef } from 'react';
import { useQuill } from 'react-quilljs';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { 
  Modal, 
  Button, 
  Card, 
  Space, 
  message, 
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
  CloseOutlined,
  FileTextOutlined,
  CodeOutlined,
  EditFilled,
  CheckCircleOutlined
} from '@ant-design/icons';
import { PDFUpdateService } from '../../../../../App/Home/PDFconfig/PDFUpdate';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Cấu hình ReactQuill modules
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['blockquote'],
    ['link'],
    ['clean']
  ],
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'align', 
  'list', 'blockquote', 'link'
];

// PDF Template Editor với react-quilljs (React 19 compatible)
function PDFEdit({
  contractId,
  contractNo,
  visible = false,
  onSave,
  onConfirm,
  onCancel,
  // Signature position props
  positionA,
  positionB,
  pageSign,
  onPositionsUpdate
}) {
  // States cơ bản
  const [loading, setLoading] = useState(false);
  const [templateData, setTemplateData] = useState(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [contractSubject, setContractSubject] = useState('');
  const [activeTab, setActiveTab] = useState('editor');

  // Workflow states - ✅ Bỏ isConfirmed và confirmLoading
  const [saveLoading, setSaveLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // ✅ Flag để đảm bảo Quill đã sẵn sàng trước khi paste nội dung
  const [quillReady, setQuillReady] = useState(false);
  
  // ✅ Flag để tránh load template trùng lặp
  const [templateLoaded, setTemplateLoaded] = useState(false);

  // Signature position states
  const [currentPositions, setCurrentPositions] = useState({
    positionA: positionA || null,
    positionB: positionB || null,
    pageSign: pageSign || null
  });

  // Service
  const pdfUpdateService = PDFUpdateService();

  // Khởi tạo Quill editor với useQuill hook
  const { quill, quillRef } = useQuill({
    modules: quillModules,
    formats: quillFormats,
    theme: 'snow',
    placeholder: 'Nhập nội dung hợp đồng...'
  });



  // Function để highlight các placeholder như {{ company.name }}
  const preprocessHtmlForQuill = (html) => {
    return html.replace(
      /\{\{\s*([^}]+)\s*\}\}/g, 
      '<span class="placeholder-variable bg-blue-50 text-blue-600 px-1 rounded font-mono text-sm">${{ $1 }}</span>'
    );
  };

  const postprocessHtmlFromQuill = (html) => {
    return html.replace(
      /<span class="[^"]*placeholder-variable[^"]*"[^>]*>\$\{\{\s*([^}]+)\s*\}\}<\/span>/g,
      '{{ $1 }}'
    );
  };

  // Thêm TailwindCSS styles cho react-quilljs
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      .ql-editor {
        font-family: 'Noto Sans', 'DejaVu Sans', Arial, sans-serif !important;
        font-size: 12pt !important;
        line-height: 1.4 !important;
        min-height: 400px !important;
        max-height: calc(100vh - 380px) !important;
        overflow-y: auto !important;
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
        border-color: #d1d5db !important;
        background-color: #f9fafb !important;
        border-radius: 6px 6px 0 0 !important;
      }
      
      .ql-container {
        border-color: #d1d5db !important;
        border-radius: 0 0 6px 6px !important;
        height: calc(100vh - 380px) !important;
        max-height: calc(100vh - 380px) !important;
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
        height: 100% !important;
        max-height: 100% !important;
        overflow: hidden !important;
        display: block !important;
        visibility: visible !important;
      }
      
      .ql-editor-container .ql-container {
        height: calc(100vh - 380px) !important;
        max-height: calc(100vh - 380px) !important;
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

  // State để track việc đang programmatically update
  const [isUpdatingFromCode, setIsUpdatingFromCode] = useState(false);

  // ✅ Khởi tạo quillReady flag khi quill sẵn sàng
  useEffect(() => {
    if (quill) {
      console.log('✅ Quill editor initialized and ready');
      setQuillReady(true);
    } else {
      setQuillReady(false);
    }
  }, [quill]);

  // Sync positions từ parent props
  useEffect(() => {
    setCurrentPositions({
      positionA: positionA || null,
      positionB: positionB || null,
      pageSign: pageSign || null
    });
  }, [positionA, positionB, pageSign]);

  // Editor luôn được enable - không có trạng thái confirmed trong popup này

  // Reset editor khi tạo contract mới
  useEffect(() => {
    if (visible && !contractId) {
      resetEditor(true); // FIX: Reset content khi tạo contract mới
    }
  }, [visible, contractId]);

  // ✅ Đồng bộ Quill editor với htmlContent và track changes - CHỈ dùng quill
  useEffect(() => {
    if (quill && quillReady) {
      let debounceTimer;
      
      // Setup listener: luôn postprocess trước khi lưu về state (để htmlContent luôn là raw)
      const handleTextChange = (delta, oldDelta, source) => {
        if (source !== 'user' || isUpdatingFromCode) return;
        
        // Debounce để tránh update quá nhanh khi gõ
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const currentHtml = quill.root.innerHTML;
          const raw = postprocessHtmlFromQuill(currentHtml); // ← trả về {{ ... }}
          setHtmlContent(raw);
          setHasUnsavedChanges(true);
        }, 300); // Delay 300ms
      };
      
      quill.on('text-change', handleTextChange);
      
      return () => {
        quill.off('text-change', handleTextChange);
        clearTimeout(debounceTimer);
      };
    }
  }, [quill, quillReady, isUpdatingFromCode]);  // ✅ TÁCH BIỆT: Paste nội dung vào Quill - HOẠT ĐỘNG ĐỘC LẬP với loadTemplate
  useEffect(() => {
    if (!quill || !quillReady || !htmlContent) return;

    console.log('✅ Auto-syncing HTML to Quill editor, content length:', htmlContent.length);
    const processed = preprocessHtmlForQuill(htmlContent);
    setIsUpdatingFromCode(true);

    try {
      const delta = quill.clipboard.convert(processed);
      quill.setContents(delta);
    } catch (error) {
      console.warn('setContents failed, fallback to dangerouslyPasteHTML:', error);
      quill.clipboard.dangerouslyPasteHTML(processed);
    }

    setTimeout(() => setIsUpdatingFromCode(false), 50);
  }, [quill, quillReady, htmlContent]); // ✅ Tự động sync khi có Quill + content (độc lập API)

  // ✅ Debug Quill initialization - CHỈ log 1 lần khi ready
  useEffect(() => {
    if (quill && quillReady) {
      console.log('=== QUILL READY ===');
      console.log('Quill:', !!quill);
      console.log('QuillRef:', !!quillRef);
      console.log('QuillReady:', quillReady);
      console.log('Modal visible:', visible);
      console.log('Contract ID:', contractId);
      console.log('HTML Content length:', htmlContent?.length || 0);
    }
  }, [quillReady]); // CHỈ log khi quillReady thay đổi

  // ✅ Load template NGAY khi modal mở - KHÔNG phụ thuộc quillReady
  useEffect(() => {
    if (visible && contractId && !templateLoaded) {
      console.log('✅ Modal opened → Load template (independent of Quill)');
      loadTemplate();
    }
  }, [visible, contractId]); // ✅ CHỈ phụ thuộc vào modal và contractId

  // Load template từ API
  const loadTemplate = async () => {
    if (!contractId) {
      message.error('Không có ID hợp đồng');
      return;
    }
    
    // ✅ Tránh load trùng lặp
    if (templateLoaded) {
      console.log('Template already loaded, skipping...');
      return;
    }

    setLoading(true);
    try {
      const result = await pdfUpdateService.getTemplateByContractId(contractId);
      
      if (result.success && result.data) {
        const template = result.data;
        setTemplateData(template);
        
        // Lưu RAW HTML vào state (KHÔNG preprocess)
        const raw = template.contentHtml || '';
        setHtmlContent(raw);           // ❗ raw
        setOriginalContent(raw);       // ❗ raw
        setContractSubject(template.name || 'Hợp đồng đại lý');
        
        // ✅ Không cần force paste - useEffect([quill, quillReady, htmlContent]) sẽ tự động sync
        console.log('✅ Template loaded, htmlContent updated, Quill will auto-sync');
        
        // ✅ Đánh dấu đã load template thành công
        setTemplateLoaded(true);
        
        message.success('Đã tải template thành công');
      }
    } catch (error) {
      console.error('Load template error:', error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Lưu thay đổi template (chỉ call update-econtract) - FIX: Thêm timeout safety
  const handleSave = async () => {
    if (!htmlContent.trim()) {
      message.error('Nội dung template không được rỗng');
      return;
    }

    setSaveLoading(true);
    
    // FIX: Thêm timeout để tránh promise treo vô hạn
    const saveTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Save timeout after 30 seconds')), 30000);
    });
    
    try {
      // Gửi RAW HTML (đã là RAW)
      const raw = htmlContent;
      const subject = contractSubject || `Hợp đồng Đại lý ${contractNo}`;
      
      console.log('=== SAVE TEMPLATE CHANGES ===');
      console.log('Contract ID:', contractId);
      console.log('Subject:', subject);
      console.log('RAW HTML Content Length:', raw.length);
      
      // Chỉ gọi update-econtract API với RAW + timeout safety
      const result = await Promise.race([
        pdfUpdateService.updateEContract(contractId, raw, subject),
        saveTimeout
      ]);

      if (result.success) {
        console.log('✅ Template changes saved successfully');
        message.success('Đã lưu thay đổi thành công');
        setOriginalContent(htmlContent);
        setHasUnsavedChanges(false);
        
        // ✅ Callback với thông tin mới từ API response
        const updateInfo = {
          htmlContent: raw,
          downloadUrl: result.downloadUrl,
          positionA: result.positionA,
          positionB: result.positionB,
          pageSign: result.pageSign
        };
        
        onSave?.(updateInfo);
        
        // Update current positions từ API response mới
        if (result.positionA) setCurrentPositions(prev => ({ ...prev, positionA: result.positionA }));
        if (result.positionB) setCurrentPositions(prev => ({ ...prev, positionB: result.positionB }));
        if (result.pageSign) setCurrentPositions(prev => ({ ...prev, pageSign: result.pageSign }));
        
      } else {
        console.log('❌ Template save failed:', result.message);
        message.error(result.message || 'Lưu thay đổi thất bại');
      }
    } catch (error) {
      console.error('=== SAVE TEMPLATE ERROR ===');
      console.error('Error:', error);
      message.error(error.message || 'Có lỗi xảy ra khi lưu thay đổi');
    } finally {
      setSaveLoading(false);
    }
  };

  // Bỏ logic xác nhận hoàn tất - chỉ dùng bên ngoài

  // Bỏ second confirmation

  // Bỏ finalize contract - chỉ dùng bên ngoài

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
      
      // Clear Quill content
      if (quill) {
        quill.setText('');
      }
      
      // Reset positions
      setCurrentPositions({
        positionA: null,
        positionB: null,
        pageSign: null
      });
    }
  };

  // Khôi phục nội dung gốc
  const handleReset = () => {
    Modal.confirm({
      title: 'Khôi phục nội dung gốc?',
      content: 'Thao tác này sẽ xóa tất cả các thay đổi chưa lưu.',
      okText: 'Khôi phục',
      cancelText: 'Hủy',
      onOk: () => {
        setHtmlContent(originalContent);
        setHasUnsavedChanges(false);
        message.success('Đã khôi phục nội dung gốc');
      }
    });
  };

  // ✅ Xử lý đóng modal với 3 lựa chọn: Lưu + Thoát, Thoát không lưu, Ở lại
  const handleClose = () => {
    console.log('PDFEdit handleClose called, hasUnsavedChanges:', hasUnsavedChanges);
    
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: 'Có thay đổi chưa được lưu',
        content: 'Bạn muốn thực hiện hành động nào?',
        okText: 'Lưu và Thoát',
        cancelText: 'Ở lại',
        okType: 'primary',
        onOk: async () => {
          try {
            console.log('User chose: Save and Exit');
            await handleSave(); // Lưu trước khi thoát
            onCancel(); // Thoát sau khi lưu thành công
          } catch (error) {
            console.error('Save failed:', error);
            // Nếu lưu thất bại, không thoát
          }
        },
        onCancel: () => {
          // Hiển thị modal phụ để chọn "Thoát không lưu" hay "Ở lại"
          Modal.confirm({
            title: 'Bạn có chắc chắn?',
            content: 'Tất cả thay đổi sẽ bị mất. Bạn có muốn thoát không lưu?',
            okText: 'Thoát không lưu',
            cancelText: 'Ở lại tiếp tục chỉnh sửa',
            okType: 'danger',
            onOk: () => {
              console.log('User chose: Exit without saving');
              onCancel(); // Force close không lưu
            },
            onCancel: () => {
              console.log('User chose: Stay in modal');
              // Không làm gì, ở lại modal
            }
          });
        }
      });
    } else {
      console.log('No unsaved changes, closing directly');
      onCancel();
    }
  };

  // Xử lý đóng trực tiếp không cần confirm
  const handleForceClose = () => {
    console.log('PDFEdit force close called');
    onCancel();
  };

  // ✅ Reset states khi modal đóng
  useEffect(() => {
    if (!visible) {
      // Reset các flag và states
      setIsUpdatingFromCode(false);
      setLoading(false);
      setSaveLoading(false);
      setQuillReady(false);
      setTemplateLoaded(false); // ✅ Reset để cho phép reload template lần sau
      console.log('✅ Modal closed → Reset all states');
    }
  }, [visible]);

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
      destroyOnClose={false} // Giữ editor trong DOM
    >
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
                
                {/* Bỏ nút "Xác nhận hoàn tất" - chỉ dùng nút xác nhận bên ngoài */}
                
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

            {/* Bỏ nút Đóng khỏi toolbar - chỉ dùng X trên header */}
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
                    <div className="h-full overflow-hidden">                      
                        {quill && quillReady ? (
                          <div className="h-full overflow-hidden">
                            <div className="ql-editor-container h-full">
                              <div 
                                ref={quillRef} 
                                className="border border-gray-300 rounded bg-white h-full"
                                style={{ 
                                  height: 'calc(100vh - 320px)',
                                  maxHeight: 'calc(100vh - 320px)',
                                  visibility: 'visible',
                                  opacity: 1
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full border border-gray-300 rounded bg-gray-50">
                            <Spin size="large" tip="Đang khởi tạo editor..." />
                            <div className="ml-4 text-sm text-gray-500">
                              Quill: {quill ? '✓' : '✗'}, Ready: {quillReady ? '✓' : '✗'}
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
                      dangerouslySetInnerHTML={{ __html: htmlContent }} // render RAW
                    />
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
                }
              ]}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

export default PDFEdit;