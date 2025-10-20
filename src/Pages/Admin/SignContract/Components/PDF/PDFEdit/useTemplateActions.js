import { useState, useEffect } from 'react';
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
  contractSubject
) => {
  const { message } = App.useApp();
  const [saveLoading, setSaveLoading] = useState(false);
  const [templateData, setTemplateData] = useState(null);
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Service
  const pdfUpdateService = PDFUpdateService();

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
        
        console.log('✅ Template loaded successfully');
        setTemplateLoaded(true);
        message.success('Đã tải template thành công');
        
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

    setSaveLoading(true);
    
    // FIX: Thêm timeout để tránh promise treo vô hạn
    const saveTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Save timeout after 30 seconds')), 30000);
    });
    
    try {
      // ✅ Lấy current content từ Quill và rebuild HTML đầy đủ
      const currentBodyContent = getCurrentContent ? getCurrentContent() : htmlContent;
      const completeHtml = rebuildCompleteHtml(currentBodyContent, contractSubject);
      const subject = contractSubject || `Hợp đồng Đại lý ${contractNo}`;
      
      console.log('=== SAVE TEMPLATE CHANGES ===');
      console.log('Contract ID:', contractId);
      console.log('Subject:', subject);
      console.log('Body content length:', currentBodyContent.length);
      console.log('Complete HTML length:', completeHtml.length);
      
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

  // Reset states khi modal đóng
  const resetStates = () => {
    setTemplateLoaded(false);
    setLoading(false);
    setSaveLoading(false);
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
    setTemplateLoaded
  };
};