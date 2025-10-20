import { useState, useEffect, useRef } from 'react';
import { App } from 'antd';

// ✅ Cấu hình Quill modules cho Template Editor
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link'],
    ['blockquote', 'code-block'],
    ['clean']
  ],
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike', 
  'color', 'background', 'list', 'align', 'link', 
  'blockquote', 'code-block'
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

// Hook quản lý Quill editor cho Template Editor
export const useQuillEditor = (initialContent = '', onContentChange) => {
  const { message } = App.useApp();
  const [quill, setQuill] = useState(null);
  const quillRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isPasted, setIsPasted] = useState(false);

  // ✅ Dynamic import Quill với DOM polling
  useEffect(() => {
    let cancelled = false;
    let globalRetry = 0;
    const MAX_RETRY = 10;

    const initQuill = async () => {
      try {
        console.log('📦 Dynamic importing Quill for Template Editor...');
        
        // ✅ Dynamic import Quill
        const { default: Quill } = await import('quill');
        
        if (cancelled) return;
        
        // ✅ Đợi DOM mount
        while (!quillRef.current || !document.contains(quillRef.current)) {
          if (cancelled) return;
          
          globalRetry++;
          console.log(`⏳ DOM polling ${globalRetry}/${MAX_RETRY} for Template Editor`);
          
          if (globalRetry > MAX_RETRY) {
            console.error('❌ DOM mount timeout for Template Editor');
            message.error('Lỗi khởi tạo editor template');
            return;
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (cancelled) return;
        
        console.log('✅ Creating Quill instance for Template Editor');
        const q = new Quill(quillRef.current, {
          theme: 'snow',
          modules: quillModules,
          formats: quillFormats,
          placeholder: 'Chỉnh sửa nội dung template...'
        });
        
        q.root.setAttribute('spellcheck', 'false');
        setQuill(q);
        setIsReady(true);
        globalRetry = 0;
        console.log('✅ Quill Template Editor initialized successfully');
        
      } catch (error) {
        console.error('❌ Error initializing Quill Template Editor:', error);
        message.error('Lỗi khởi tạo editor template. Vui lòng thử lại.');
      }
    };

    // Chỉ init khi có ref
    if (quillRef.current && !quill) {
      initQuill();
    }

    return () => {
      cancelled = true;
    };
  }, []); // Chỉ chạy 1 lần khi mount

  // ✅ Paste initial content khi Quill ready
  useEffect(() => {
    if (quill && initialContent && !isPasted && isReady) {
      console.log('✅ Pasting initial content to Template Editor, length:', initialContent.length);
      
      try {
        const processed = preprocessHtmlForQuill(initialContent);
        quill.clipboard.dangerouslyPasteHTML(processed);
        setIsPasted(true);
      } catch (error) {
        console.warn('Failed to paste initial content:', error);
      }
    }
  }, [quill, initialContent, isPasted, isReady]);

  // ✅ Setup text change listener
  useEffect(() => {
    if (quill && isReady) {
      let debounceTimer;
      
      const handleTextChange = (delta, oldDelta, source) => {
        if (source !== 'user') return;
        
        // Debounce để tránh update quá nhanh
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const currentHtml = quill.root.innerHTML;
          const raw = postprocessHtmlFromQuill(currentHtml);
          onContentChange?.(raw);
        }, 300);
      };
      
      quill.on('text-change', handleTextChange);
      
      return () => {
        quill.off('text-change', handleTextChange);
        clearTimeout(debounceTimer);
      };
    }
  }, [quill, isReady, onContentChange]);

  // ✅ Method để update content từ bên ngoài
  const updateContent = (newContent) => {
    if (quill && isReady) {
      console.log('🔄 Updating Quill content programmatically');
      const processed = preprocessHtmlForQuill(newContent);
      quill.clipboard.dangerouslyPasteHTML(processed);
      setIsPasted(true);
    }
  };

  // ✅ Method để lấy current content
  const getCurrentContent = () => {
    if (quill && isReady) {
      const currentHtml = quill.root.innerHTML;
      return postprocessHtmlFromQuill(currentHtml);
    }
    return '';
  };

  // ✅ Method để reset content
  const resetContent = () => {
    if (quill && isReady) {
      quill.setText('');
      setIsPasted(false);
    }
  };

  // ✅ Method để clear và set new content
  const setContent = (content) => {
    if (quill && isReady) {
      const processed = preprocessHtmlForQuill(content);
      quill.clipboard.dangerouslyPasteHTML(processed);
    }
  };

  return {
    quill,
    quillRef,
    isReady,
    updateContent,
    getCurrentContent,
    resetContent,
    setContent,
    postprocessHtmlFromQuill
  };
};
