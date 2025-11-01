import { useEffect, useMemo, useRef, useState } from 'react';
import Quill from 'quill';

// === Toolbar & formats (tuỳ bạn chỉnh) ===
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['link', 'image'],
    ['clean'],
  ],
};
const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'align', 'link', 'image',
];

// === Tiền/Xử lý HTML (tuỳ chỉnh theo bạn) ===
const preprocessHtmlForQuill = (html = '') => {
  let clean= String(html);
  clean = clean.replace(/<div[^>]*class=["'][^"']*sign[^"']*["'][\s\S]*?<\/div>/gi, '');
  return clean;
};
const postprocessHtmlFromQuill = (html = '') => String(html);

// === debounce đơn giản ===
const debounce = (fn, ms = 300) => {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

// === hash nhẹ để nhận diện template đã paste ===
const hash = (s = '') => {
  let h = 0; for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0;
  return String(h);
};


// NOTE: giữ named export để khớp với import { useQuillEditor } phía Modal
export const useQuillEditor = (initialContent, onContentChange, visible) => {
  const quillRef = useRef(null);           // div container
  const quillInstanceRef = useRef(null);   // Quill instance

  const [isReady, setIsReady] = useState(false);

  // guards
  const initLockRef = useRef(false);
  const cancelledRef = useRef(false);
  const isUpdatingRef = useRef(false);     // đang set/paste từ code
  const pastedOnceRef = useRef(false);
  const lastHashRef = useRef('');
  // init quill khi visible=true và DOM sẵn sàng
  useEffect(() => {
    cancelledRef.current = false;
    if (!visible) return;

    const initQuill = async () => {
      if (cancelledRef.current) return;
      if (initLockRef.current) return;
      if (quillInstanceRef.current) return; // đã có rồi

      initLockRef.current = true;

      // chờ DOM mount tối đa 30 * 100ms = 3s
      for (let i = 0; i < 30; i++) {
        if (cancelledRef.current) break;
        if (quillRef.current && quillRef.current.isConnected) break;
        await new Promise(r => setTimeout(r, 100));
      }

      if (cancelledRef.current) { initLockRef.current = false; return; }

      if (!quillRef.current || !quillRef.current.isConnected) {
        initLockRef.current = false;
        // retry nhẹ nếu modal vẫn mở
        if (visible) setTimeout(initQuill, 200);
        return;
      }

      try {
        // dynamic import tránh vấn đề bundle/SSR
        const { default: Quill } = await import('quill');

        // khởi tạo Quill
        const q = new Quill(quillRef.current, {
          theme: 'snow',
          modules: quillModules,
          formats: quillFormats,
        });
        quillInstanceRef.current = q;

        // paste initialContent đúng 1 lần mỗi template
        const currentHash = hash(initialContent || '');
        if (!pastedOnceRef.current || currentHash !== lastHashRef.current) {
          if (initialContent && String(initialContent).trim()) {
            console.log('[useQuillEditor] 📄 Pasting initial content on init');
            isUpdatingRef.current = true;
            q.setContents([]);
            q.clipboard.dangerouslyPasteHTML(preprocessHtmlForQuill(initialContent));
            isUpdatingRef.current = false;
            pastedOnceRef.current = true;
            lastHashRef.current = currentHash;
          }
        }

        setIsReady(true);
        console.log('[useQuillEditor] ✅ Quill ready, paste completed');
      } catch (e) {
        console.error('[useQuillEditor] init error:', e);
      } finally {
        initLockRef.current = false;
      }
    };

    initQuill();

    return () => { cancelledRef.current = true; };
  }, [visible, initialContent]);

  // listener text-change (1 nơi duy nhất)
  useEffect(() => {
    const q = quillInstanceRef.current;
    if (!q) return;

    const emit = debounce(() => {
      const raw = q.root?.innerHTML || '';
      onContentChange?.(postprocessHtmlFromQuill(raw));
    }, 300);

    const handler = (_d, _o, source) => {
      if (cancelledRef.current) return;
      if (isUpdatingRef.current) return; // bỏ qua khi set từ code
      if (source !== 'user') return;     // chỉ khi user nhập
      emit();
    };

    q.on('text-change', handler);
    return () => { q.off('text-change', handler); };
  }, [onContentChange, isReady]);

  // Chỉ paste lần đầu khi ready (KHÔNG phụ thuộc initialContent để tránh repaste khi gõ)
  useEffect(() => {
    const q = quillInstanceRef.current;
    if (!isReady || !q) return;

    const currentHash = hash(initialContent || '');

    // CHỈ paste nếu CHƯA từng paste (lần đầu mở hoặc đổi template)
    // TRÁNH paste lại theo từng thay đổi live htmlContent
    if (!pastedOnceRef.current && currentHash !== lastHashRef.current) {
      if (initialContent && String(initialContent).trim()) {
        isUpdatingRef.current = true;
        q.setContents([]);
        q.clipboard.dangerouslyPasteHTML(preprocessHtmlForQuill(initialContent));
        isUpdatingRef.current = false;
        pastedOnceRef.current = true;
        lastHashRef.current = currentHash;
      } else {
        q.setText('');
        pastedOnceRef.current = true;
        lastHashRef.current = currentHash;
      }
    }
  }, [isReady]); // KHÔNG phụ thuộc initialContent nữa

  // CLEANUP HOÀN TOÀN khi modal đóng (fix lỗi mở lần 2 không hiện editor)
  useEffect(() => {
    if (!visible) {
      console.log('[useQuillEditor] 🧹 Modal closed, cleaning up Quill instance');
      
      // Cleanup Quill instance khi modal đóng
      const q = quillInstanceRef.current;
      if (q) {
        try {
          q.off('text-change');        // gỡ listeners
          q.setText('');               // dọn nội dung
        } catch (e) {
          console.warn('[useQuillEditor] Cleanup error:', e);
        }
      }
      quillInstanceRef.current = null; // QUAN TRỌNG: cho phép init lần sau
      setIsReady(false);

      // Reset tất cả flags
      pastedOnceRef.current = false;
      lastHashRef.current = '';
      initLockRef.current = false;
      cancelledRef.current = true;
      
      console.log('[useQuillEditor] ✅ Cleanup completed, ready for next open');
    }
  }, [visible]);

  // public helpers
  const getCurrentContent = () => {
    const q = quillInstanceRef.current;
    if (!q) return '';
    return q.root?.innerHTML || '';
  };

  const setContent = (html) => {
    const q = quillInstanceRef.current;
    if (!q) return;
    isUpdatingRef.current = true;
    q.setContents([]);
    q.clipboard.dangerouslyPasteHTML(preprocessHtmlForQuill(html || ''));
    setTimeout(() => {
      console.log("=== Quill rendered HTML ===");
      console.log(q.root.innerHTML);
    }, 1000);
    isUpdatingRef.current = false;
  };

  const resetContent = () => {
    const q = quillInstanceRef.current;
    if (!q) return;
    isUpdatingRef.current = true;
    q.setText('');
    isUpdatingRef.current = false;
  };

  const resetPasteState = () => {
    console.log('[useQuillEditor] 🔄 Reset paste state - allow repaste on content change');
    pastedOnceRef.current = false;
    lastHashRef.current = '';
  };

  return {
    quill: quillInstanceRef.current,
    quillRef,
    isReady,

    getCurrentContent,
    setContent,
    resetContent,
    resetPasteState,

    preprocessHtmlForQuill,
    postprocessHtmlFromQuill,
  };
};
