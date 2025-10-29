import { useState, useEffect, useRef } from 'react';
import { App } from 'antd';

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

// Hook quản lý Quill editor với dynamic import và DOM polling
export const useQuillEditor = (visible, htmlContent, setHasUnsavedChanges, isUpdatingFromCode) => {
  const { message } = App.useApp();
  const [quill, setQuill] = useState(null);
  const quillRef = useRef(null);
  const [isPasted, setIsPasted] = useState(false);

  // ✅ Dynamic import Quill với async polling fix cho React 19 + Ant Design Modal
  useEffect(() => {
    if (!visible || quill || !quillRef.current) return;

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
            console.error('❌ DOM mount timeout sau', MAX_RETRY, 'lần retry');
            message.error('Lỗi khởi tạo editor - DOM chưa sẵn sàng');
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
        q.root.setAttribute('spellcheck', 'false');
        setQuill(q);
        setIsPasted(false);
        globalRetry = 0; // ✅ Reset sau khi thành công
        console.log('✅ Quill initialized successfully with async polling');
        
      } catch (error) {
        console.error('❌ Error initializing Quill:', error);
        message.error('Lỗi khởi tạo editor. Vui lòng thử lại.');
        console.error('Init Quill v2 error:', error);
        message.error('Lỗi khởi tạo editor');
      }
    };

    initQuill();

    return () => {
      cancelled = true;
    };
  }, [visible, quill]); // Chỉ phụ thuộc vào visible

  // ✅ Paste toàn bộ HTML khi Quill sẵn sàng và có nội dung
  useEffect(() => {
    if (!quill || isPasted || !visible || !htmlContent) return;
      console.log('✅ Pasting HTML to Quill, content length:', htmlContent.length);
      try {
        const bodyOnly = htmlContent.replace(/^[\s\S]*<body[^>]*>|<\/body>[\s\S]*$/g, '');
        const processed = preprocessHtmlForQuill(bodyOnly);
        quill.clipboard.dangerouslyPasteHTML(processed);
        setIsPasted(true);
      } catch (error) {
        console.warn('Failed to paste HTML:', error);
      }
    
  }, [quill, htmlContent, isPasted, visible]);

  // ✅ Đồng bộ Quill editor với htmlContent và track changes - CHỈ dùng quill
  useEffect(() => {
    if (!quill) return;
      let debounceTimer;
      
      // Setup listener: luôn postprocess trước khi lưu về state (để htmlContent luôn là raw)
      const handleTextChange = (delta, oldDelta, source) => {
        if (source !== 'user' || isUpdatingFromCode) return;
        
        // Debounce để tránh update quá nhanh khi gõ
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const rawHtml = quill.root.innerHTML;
          const postprocessed = postprocessHtmlFromQuill(rawHtml);
          if (typeof window.__UPDATE_HTML_CONTENT__ === 'function') {
            window.__UPDATE_HTML_CONTENT__(postprocessed);
          }
          // Note: setHtmlContent sẽ được truyền từ parent component
          setHasUnsavedChanges(true);
        }, 300); // Delay 300ms
      };
      
      quill.on('text-change', handleTextChange);
      
      return () => {
        quill.off('text-change', handleTextChange);
        clearTimeout(debounceTimer);
      };
    
  }, [quill, isUpdatingFromCode]);

  // ✅ Debug Quill initialization - CHỈ log 1 lần khi ready
  useEffect(() => {
    if (quill) {
      console.log('=== QUILL READY ===');
      console.log('Quill:', !!quill);
      console.log('QuillRef:', !!quillRef.current);
      console.log('Modal visible:', visible);
    }
  }, [quill]); // CHỈ log khi quill thay đổi

  // ✅ Cleanup Quill instance khi modal đóng
  useEffect(() => {
    if (visible || !quill) return;
      console.log('🗑️ Cleaning up Quill instance');
      try {
        // Quill cleanup - remove listeners và destroy instance
        quill.off('text-change'); // Remove listeners trước
        setQuill(null); // Reset state
        setIsPasted(false); // Reset paste flag
        console.log('✅ Quill instance cleaned up');
      } catch (error) {
        console.warn('Quill cleanup warning:', error);
      }
  }, [visible, quill]);

  // Method để reset Quill content
  const resetQuillContent = () => {
    if (quill) {
      quill.setText('');
      setIsPasted(false); // Reset paste flag
    }
  };

  // Method để lấy current content từ Quill
  const getCurrentContent = () => {
    return quill ? postprocessHtmlFromQuill(quill.root.innerHTML) : '';
  };

  return {
    quill,
    quillRef,
    isPasted,
    setIsPasted,
    resetQuillContent,
    getCurrentContent,
    postprocessHtmlFromQuill
  };
};
