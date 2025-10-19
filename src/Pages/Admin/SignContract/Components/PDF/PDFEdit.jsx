import React, { useState, useEffect, useRef } from 'react';
// ✅ Bỏ static import Quill - sẽ dùng dynamic import
import 'quill/dist/quill.snow.css';
import Quill from 'quill';
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
  Tabs,
  App
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
import { range } from 'pdf-lib';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ✅ Cấu hình ReactQuill modules - Giới hạn để tránh phá layout A4
const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'color': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
};

const quillFormats = [
  'bold', 'italic', 'underline', 'color', 'list', 'link'
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
  const { message } = App.useApp();
  
  // States cơ bản
  const [loading, setLoading] = useState(false);
  const [templateData, setTemplateData] = useState(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [contractSubject, setContractSubject] = useState('');
  
  // ✅ Lưu trữ cấu trúc HTML gốc từ BE
  const [allStyles, setAllStyles] = useState(''); // Lưu TẤT CẢ style blocks
  const [htmlHead, setHtmlHead] = useState('');
  const [htmlAttributes, setHtmlAttributes] = useState('');
  const [activeTab, setActiveTab] = useState('editor');

  // Workflow states - ✅ Bỏ isConfirmed và confirmLoading
  const [saveLoading, setSaveLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // ✅ Flag để đảm bảo Quill đã sẵn sàng trước khi paste nội dung
  const [quill, setQuill] = useState(null);
  const quillRef = useRef(null);
  const [isPasted, setIsPasted] = useState(false);
  
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

  // ✅ Dynamic import Quill với async polling fix cho React 19 + Ant Design Modal
  useEffect(() => {
    if (!visible || quill) return;

    let cancelled = false;
    let globalRetry = 0; // ✅ Biến ngoài useEffect để tránh React 19 double invoke reset
    const MAX_RETRY = 15; // Tăng lên 15 lần (2.25 giây)

    const initQuill = async () => {
      try {
        console.log('📦 Dynamic importing Quill...');
        
        // ✅ Dynamic import Quill
        const { default: Quill } = await import('quill');
        
        if (cancelled) return;
        
        // ✅ Async polling DOM mount - không dùng requestAnimationFrame
        console.log('🔍 Starting DOM polling...');
        
        while (!quillRef.current || !document.contains(quillRef.current)) {
          if (cancelled) return;
          
          globalRetry++;
          console.log(`⏳ DOM polling ${globalRetry}/${MAX_RETRY} - Ref: ${!!quillRef.current}, InDoc: ${quillRef.current ? document.contains(quillRef.current) : false}`);
          
          if (globalRetry > MAX_RETRY) {
            console.error('❌ DOM mount timeout sau', MAX_RETRY, 'lần polling');
            message.error('Không thể khởi tạo editor - DOM chưa sẵn sàng');
            return;
          }
          
          // ✅ Async polling với setTimeout
          await new Promise(resolve => setTimeout(resolve, 150));
        }
        
        if (cancelled) return;
        
        console.log('✅ DOM ready → Creating Quill instance');
        const q = new Quill(quillRef.current, {
          theme: 'snow',
          modules: quillModules,
          formats: quillFormats,
          placeholder: 'Nhập nội dung hợp đồng...'
        });
        const Delta = Quill.import('delta');
        //bỏ toàn bộ blocks signature khi khởi tạo
        q.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
          //nếu node có class "sign" thì bỏ toàn bộ delta
          if(node && node.nodeType === 1) {
            if(node.matches?.('.sign')|| node.closest?.('.sign')) {
              return new Delta();
            }
          }
          return delta;
        });
        q.root.setAttribute('spellcheck', 'false');
        setQuill(q);
        setIsPasted(false);
        globalRetry = 0; // ✅ Reset sau khi thành công
        console.log('✅ Quill initialized successfully with async polling');
        
      } catch (error) {
        console.error('❌ Error initializing Quill:', error);
        message.error('Lỗi khởi tạo editor. Vui lòng thử lại.');
      }
    };

    initQuill();

    return () => {
      cancelled = true;
    };
  }, [visible]); // Chỉ phụ thuộc vào visible

  // ✅ Paste toàn bộ HTML khi Quill sẵn sàng và có nội dung
  useEffect(() => {
    if (quill && htmlContent && !isPasted) {
      console.log('✅ Pasting HTML to Quill, content length:', htmlContent.length);
      const bodyOnly = htmlContent.replace(/^[\s\S]*<body[^>]*>|<\/body>[\s\S]*$/g, '');
      const processed = preprocessHtmlForQuill(bodyOnly);
      
      try {
        quill.clipboard.dangerouslyPasteHTML(processed);
        setIsPasted(true);
      } catch (error) {
        console.warn('Failed to paste HTML:', error);
      }
    }
  }, [quill, htmlContent]);



  // ✅ Function để tách HTML structure từ BE - BẢO TOÀN TẤT CẢ STYLE
  const parseHtmlFromBE = (rawHtml) => {
    console.log('=== PARSING HTML FROM BE (BẢO TOÀN TẤT CẢ STYLE) ===');
    console.log('Raw HTML length:', rawHtml?.length || 0);
    
    if (!rawHtml) return { bodyContent: '', allStyles: '', htmlHead: '', htmlAttributes: '' };
    
    // ✅ Tách TẤT CẢ <style> tags (cả trong <head> và <body>)
    const allStyleMatches = rawHtml.match(/<style[\s\S]*?<\/style>/gi);
    const allStyles = allStyleMatches ? allStyleMatches.join('\n') : '';
    
    // ✅ Tách <head> content (KHÔNG bao gồm <style> đã tách)
    let headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    let htmlHead = '';
    if (headMatch) {
      htmlHead = headMatch[1]
        .replace(/<style[\s\S]*?<\/style>/gi, '') // Xóa style đã tách
        .replace(/<title[\s\S]*?<\/title>/gi, '') // Xóa title để tránh trùng
        .trim();
    }
    
    // ✅ Tách html attributes
    const htmlMatch = rawHtml.match(/<html([^>]*)>/i);
    const htmlAttributes = htmlMatch ? htmlMatch[1] : ' lang="vi"';
    
    // ✅ Tách body content và LOẠI BỎ tất cả <style> rải rác
    let bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let bodyContent = bodyMatch ? bodyMatch[1] : rawHtml;
    
    // Loại bỏ tất cả <style> rải rác trong body content
    bodyContent = bodyContent.replace(/<style[\s\S]*?<\/style>/gi, '');
    
    console.log('Parsed results:');
    console.log('- All styles length:', allStyles.length);
    console.log('- Style blocks found:', allStyleMatches?.length || 0);
    console.log('- Head content length:', htmlHead.length);
    console.log('- HTML attributes:', htmlAttributes);
    console.log('- Body content length (after removing styles):', bodyContent.length);
    
    return { bodyContent, allStyles, htmlHead, htmlAttributes };
  };

  // ✅ Function để rebuild HTML đầy đủ khi gửi về BE - BAO GỒM TẤT CẢ STYLE
  const rebuildCompleteHtml = (bodyContent) => {
    console.log('=== REBUILDING COMPLETE HTML (BẢO TOÀN TẤT CẢ STYLE) ===');
    console.log('Body content length:', bodyContent?.length || 0);
    console.log('All styles length:', allStyles?.length || 0);
    console.log('HTML head length:', htmlHead?.length || 0);
    
    const finalHtml = `<!doctype html>
<html${htmlAttributes}>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${contractSubject || 'Hợp đồng điện tử'}</title>
${htmlHead}
${allStyles}
</head>
<body>
${bodyContent}
</body>
</html>`;

    console.log('Final HTML length:', finalHtml.length);
    console.log('Styles included in rebuild:', !!allStyles);
    return finalHtml;
  };

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
      .ql-editor .sign { display: none !important; }

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
    if (quill) {
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
  }, [quill, isUpdatingFromCode]);  // ✅ Debug Quill initialization - CHỈ log 1 lần khi ready
  useEffect(() => {
    if (quill) {
      console.log('=== QUILL READY ===');
      console.log('Quill:', !!quill);
      console.log('QuillRef:', !!quillRef.current);
      console.log('Modal visible:', visible);
      console.log('Contract ID:', contractId);
      console.log('HTML Content length:', htmlContent?.length || 0);
    }
  }, [quill]); // CHỈ log khi quill thay đổi

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
        
        // ✅ Parse HTML từ BE - tách TẤT CẢ style và structure
        const rawHtml = template.contentHtml || '';
        const { bodyContent, allStyles, htmlHead, htmlAttributes } = parseHtmlFromBE(rawHtml);
        
        // Lưu structure vào state
        setAllStyles(allStyles);
        setHtmlHead(htmlHead);
        setHtmlAttributes(htmlAttributes);
        
        // Chỉ hiển thị body content trong Quill (đã loại bỏ style rải rác)
        setHtmlContent(bodyContent);
        setOriginalContent(bodyContent);
        setContractSubject(template.name || 'Hợp đồng đại lý');
        
        console.log('✅ Template loaded và parsed successfully');
        console.log('- Body content length:', bodyContent.length);
        console.log('- All styles length:', allStyles.length);
        console.log('- Styles preserved:', !!allStyles);
        
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
      // ✅ Lấy current content từ Quill và rebuild HTML đầy đủ
      const currentBodyContent = quill ? postprocessHtmlFromQuill(quill.root.innerHTML) : htmlContent;
      const completeHtml = rebuildCompleteHtml(currentBodyContent);
      const subject = contractSubject || `Hợp đồng Đại lý ${contractNo}`;
      
      console.log('=== SAVE TEMPLATE CHANGES ===');
      console.log('Contract ID:', contractId);
      console.log('Subject:', subject);
      console.log('Body content length:', currentBodyContent.length);
      console.log('Complete HTML length:', completeHtml.length);
      console.log('Has all styles:', !!allStyles);
      console.log('All styles length:', allStyles?.length || 0);
      console.log('Has html head:', !!htmlHead);
      
      // Gửi complete HTML với đầy đủ structure về BE
      const result = await Promise.race([
        pdfUpdateService.updateEContract(contractId, completeHtml, subject),
        saveTimeout
      ]);

      if (result.success) {
        console.log('✅ Template changes saved successfully');
        message.success('Đã lưu thay đổi thành công');
        setOriginalContent(htmlContent);
        setHasUnsavedChanges(false);
        
        // ✅ Callback với thông tin mới từ API response
        const updateInfo = {
          htmlContent: currentBodyContent, // Trả về body content cho parent
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
      
      // ✅ Reset HTML structure states
      setAllStyles('');
      setHtmlHead('');
      setHtmlAttributes('');
      
      // Clear Quill content
      if (quill) {
        quill.setText('');
        setIsPasted(false); // Reset paste flag
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

  // ✅ Reset states và cleanup Quill khi modal đóng
  useEffect(() => {
    if (!visible) {
      // Reset các flag và states
      setIsUpdatingFromCode(false);
      setLoading(false);
      setSaveLoading(false);
      setIsPasted(false);
      setTemplateLoaded(false); // ✅ Reset để cho phép reload template lần sau
      
      // ✅ Cleanup Quill instance khi modal đóng
      if (quill) {
        console.log('🗑️ Cleaning up Quill instance');
        try {
          // Quill cleanup - remove listeners và destroy instance
          quill.off('text-change'); // Remove listeners trước
          setQuill(null); // Reset state
        } catch (error) {
          console.warn('Quill cleanup warning:', error);
        }
      }
      
      console.log('✅ Modal closed → Reset all states + cleanup Quill');
    }
  }, [visible, quill]); // Thêm quill vào dependencies

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
                    <div className="h-full overflow-hidden relative">
                      {/* ✅ quillRef LUÔN được render - không phụ thuộc vào quill instance */}
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

export default PDFEdit;