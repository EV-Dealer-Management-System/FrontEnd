import { useState, useEffect, useRef, use } from 'react';
import { Modal, App } from 'antd';
import { PDFUpdateService } from '../../../../../../App/Home/PDFconfig/PDFUpdate';

// Hook xử lý các actions của template: save, reset, close modal
export const useTemplateActions = (
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
  contractSubject,
  allStyles,
  signContent,
  headerContent
) => {
  const [modal, contextHolder] = Modal.useModal();
  const { message } = App.useApp();
  const [saveLoading, setSaveLoading] = useState(false);
  const [templateData, setTemplateData] = useState(null);
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  


  const didRequestRef = useRef(false);
  
  // Service
  const pdfUpdateService = PDFUpdateService();

  // ✅ Load template NGAY khi modal mở - KHÔNG phụ thuộc quillReady
  useEffect(() => {
    if (!visible || !contractId) return;
    if (didRequestRef.current || templateLoaded || loading) return; // Tránh gọi nhiều lần
    didRequestRef.current = true;
    console.log('Modal opened → Load template (independent of Quill)');
    loadTemplate();
  }, [visible, contractId, templateLoaded, loading]); 

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

        const html = template.htmlTemplate || ''; 
        if (html) {
          console.log('Template HTML length:', html.length);
        } else {
          message.warning('Không tìm nội dung template trong hợp đồng');
        }
        
        console.log('✅ Template loaded successfully');
        message.success('Đã tải template thành công');
        setTemplateLoaded(true);
        return template; // Return template data để parent component xử lý
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
    let latestContent = getCurrentContent ? getCurrentContent() : '';
    let usedDomFallback = false;
    let useOldHtmlFallback = false;
      if (!latestContent) {
        // an toàn: hút trực tiếp từ DOM editor nếu instance đã mount
        const live = document.querySelector('.ql-editor')?.innerHTML;
        if (live && typeof live === 'string') {
          latestContent = live;
          usedDomFallback = true;
        }
      }
    setSaveLoading(true);
    
    // FIX: Thêm timeout để tránh promise treo vô hạn
    const saveTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Save timeout after 30 seconds')), 30000);
    });
    
    try {
      // ✅ Lấy nội dung người dùng đã chỉnh trong Quill
      let quillBody = latestContent || htmlContent || '';
      if(!latestContent && !usedDomFallback) {
        useOldHtmlFallback = true;
      }
      quillBody = quillBody.replace(
        /<p>(\s*Điều\s+\d+[^<]*)<\/p>/gi,
        '<div class="section-title">$1</div>'
      );
      if (useOldHtmlFallback && hasUnsavedChanges) {
        // ❌ Không lấy được bản mới nhất từ editor → DỪNG LƯU và báo lỗi
        message.error('❌ Không thể lấy nội dung mới nhất từ editor. Vui lòng thử bấm "Lưu" lại sau 1 giây.');
        setSaveLoading(false);
        return; // ⛔ DỪNG Ở ĐÂY, KHÔNG GỬI BẢN CŨ
      }
      const completeHtml = rebuildCompleteHtml(
        quillBody,
        contractSubject,
        allStyles,
        signContent,
        headerContent
      );
      const subject = contractSubject || `Hợp đồng Đại lý ${contractNo}`;
      const currentBodyContent = quillBody || htmlContent || '';

      console.log('=== SAVE TEMPLATE CHANGES ===');
      console.log('Contract ID:', contractId);
      console.log('Subject:', subject);
      console.log('- Quill body length:', quillBody?.length || 0);
      console.log('- Complete HTML length:', completeHtml?.length || 0);
      
      // Gửi complete HTML với đầy đủ structure về BE
      const result = await Promise.race([
        pdfUpdateService.updateEContract(contractId, completeHtml, subject),
        saveTimeout
      ]);

      if (result.success) {
        console.log('✅ Template changes saved successfully');
        message.success('Đã lưu thay đổi thành công');
        setOriginalContent(quillBody);
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
        
        return result; // Return result để parent component xử lý positions
        
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

  // Khôi phục nội dung gốc
  const handleReset = () => {
    modal.confirm({
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
    
    if (!hasUnsavedChanges) {
      console.log('No unsaved changes, closing directly');
      onCancel();
      return;
    }

    modal.confirm({
      title: 'Có thay đổi chưa được lưu',
      content: 'Nếu thoát, tất cả thay đổi sẽ bị mất. Bạn có chắc muốn thoát không?',
      okText: 'Thoát không lưu',
      cancelText: 'Ở lại',
      okType: 'danger',
      onOk: () => {
        console.log('User confirmed exit without saving');
        // Reset các thay đổi cục bộ để đảm bảo không ghi đè
        setHtmlContent(originalContent);
        setHasUnsavedChanges(false);
        onCancel(); // Đóng modal mà không lưu
      },
      onCancel: () => {
        console.log('User canceled exit, staying in modal');
        // Không làm gì thêm
      }
    });
  };

  // Xử lý đóng trực tiếp không cần confirm
  const handleForceClose = () => {
    console.log('PDFEdit force close called');
    onCancel();
  };

  // Reset states khi modal đóng
  const resetStates = () => {
    setTemplateLoaded(false);
    setLoading(false);
    setSaveLoading(false);
    didRequestRef.current = false;
  };

  return {
    loading,
    saveLoading,
    templateData,
    templateLoaded,
    handleSave,
    handleReset,
    handleClose,
    handleForceClose,
    loadTemplate,
    resetStates,
    setTemplateData,
    setTemplateLoaded,
    contextHolder,
    allStyles
  };
};