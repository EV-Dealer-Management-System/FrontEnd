import { useState, useEffect } from 'react';
import { App } from 'antd';
import { TemplateEditorService } from '../../../App/Admin/TemplateEditor';

export const useTemplateEditor = () => {
  const { message } = App.useApp();
  
  // States cơ bản
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // HTML parsing states - gom từ useHtmlParser
  const [allStyles, setAllStyles] = useState('');
  const [htmlHead, setHtmlHead] = useState('');
  const [htmlAttributes, setHtmlAttributes] = useState('');

  // ✅ Parse HTML từ BE - tách TẤT CẢ STYLE (gộp từ useHtmlParser.js)
  const parseHtmlFromBE = (rawHtml) => {
    console.log('=== PARSING TEMPLATE HTML FROM BE ===');
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
    
    console.log('Parsed template results:');
    console.log('- All styles length:', allStyles.length);
    console.log('- Style blocks found:', allStyleMatches?.length || 0);
    console.log('- Head content length:', htmlHead.length);
    console.log('- HTML attributes:', htmlAttributes);
    console.log('- Body content length (after removing styles):', bodyContent.length);
    
    return { bodyContent, allStyles, htmlHead, htmlAttributes };
  };

  // ✅ Rebuild HTML đầy đủ khi save - BAO GỒM TẤT CẢ STYLE (gộp từ useHtmlParser.js)
  const rebuildCompleteHtml = (bodyContent, templateName) => {
    console.log('=== REBUILDING COMPLETE TEMPLATE HTML ===');
    console.log('Body content length:', bodyContent?.length || 0);
    console.log('All styles length:', allStyles?.length || 0);
    console.log('HTML head length:', htmlHead?.length || 0);
    
    const finalHtml = `<!doctype html>
<html${htmlAttributes}>
<head>
<meta charset="utf-8" />
<title>${templateName || 'Template Hợp đồng'}</title>
${htmlHead}
${allStyles}
</head>
<body>
${bodyContent}
</body>
</html>`;

    console.log('Final template HTML length:', finalHtml.length);
    console.log('Styles included in rebuild:', !!allStyles);
    return finalHtml;
  };

  // ✅ Fetch all templates - sử dụng service từ TemplateEditor.js
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const result = await TemplateEditorService.getAllTemplates(1, 10);
      
      if (result.success) {
        setTemplates(result.data);
        console.log('✅ Templates loaded via service:', result.data.length);
        message.success(result.message);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error fetching templates via service:', error);
      message.error(error.message || 'Lỗi khi tải danh sách template');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load template content và parse HTML structure
  const loadTemplate = (template) => {
    console.log('📋 Loading template:', template.code, template.name);
    
    setSelectedTemplate(template);
    
    // ✅ Parse HTML từ BE - tách TẤT CẢ style và structure
    const rawHtml = template.contentHtml || '';
    const parsedResult = parseHtmlFromBE(rawHtml);
    
    // Lưu structure vào state
    setAllStyles(parsedResult.allStyles);
    setHtmlHead(parsedResult.htmlHead);
    setHtmlAttributes(parsedResult.htmlAttributes);
    
    // Chỉ hiển thị body content trong Quill (đã loại bỏ style rải rác)
    setHtmlContent(parsedResult.bodyContent);
    setOriginalContent(parsedResult.bodyContent);
    setHasUnsavedChanges(false);
    
    console.log('✅ Template loaded và parsed successfully');
    console.log('- Body content length:', parsedResult.bodyContent.length);
    console.log('- All styles length:', parsedResult.allStyles.length);
    console.log('- Styles preserved:', !!parsedResult.allStyles);
    
    message.success(`Đã tải template: ${template.name}`);
  };

  // ✅ Save template - sử dụng service từ TemplateEditor.js
  const saveTemplate = async () => {
    if (!selectedTemplate) {
      message.error('Chưa chọn template để lưu');
      return false;
    }

    if (!htmlContent.trim()) {
      message.error('Nội dung template không được rỗng');
      return false;
    }

    setSaving(true);

    try {
      console.log('💾 Saving template via service:', selectedTemplate.code);
      
      // ✅ Rebuild HTML đầy đủ với TẤT CẢ styles preserved
      const completeHtml = rebuildCompleteHtml(htmlContent, selectedTemplate.name);
      
      // ✅ Validate content trước khi save
      const validation = TemplateEditorService.validateTemplateContent(completeHtml);
      if (!validation.isValid) {
        message.error(`Validation failed: ${validation.errors.join(', ')}`);
        return false;
      }
      
      if (validation.warnings.length > 0) {
        console.warn('Template validation warnings:', validation.warnings);
      }

      // ✅ Gọi service để update template
      const result = await TemplateEditorService.updateTemplate(
        selectedTemplate.code,
        selectedTemplate.name,
        completeHtml
      );

      if (result.success) {
        console.log('✅ Template saved successfully via service');
        message.success(result.message);
        
        setOriginalContent(htmlContent);
        setHasUnsavedChanges(false);
        
        // ✅ Update template in list với HTML mới
        setTemplates(prev => 
          prev.map(t => 
            t.code === selectedTemplate.code 
              ? { ...t, contentHtml: completeHtml }
              : t
          )
        );
        
        // ✅ Update selected template
        setSelectedTemplate(prev => ({
          ...prev,
          contentHtml: completeHtml
        }));

        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error saving template via service:', error);
      message.error(error.message || 'Lỗi khi lưu template');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ✅ Reset to original content
  const resetTemplate = () => {
    if (!selectedTemplate) {
      message.error('Chưa chọn template để reset');
      return;
    }

    console.log('🔄 Resetting template to original content');
    setHtmlContent(originalContent);
    setHasUnsavedChanges(false);
    message.success('Đã khôi phục nội dung gốc');
  };

  // ✅ Update content và track changes
  const updateContent = (newContent) => {
    setHtmlContent(newContent);
    setHasUnsavedChanges(newContent !== originalContent);
  };

  // ✅ Reset all states
  const resetAllStates = () => {
    setSelectedTemplate(null);
    setHtmlContent('');
    setOriginalContent('');
    setHasUnsavedChanges(false);
    setAllStyles('');
    setHtmlHead('');
    setHtmlAttributes('');
  };

  // ✅ Load templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    // States
    templates,
    selectedTemplate,
    htmlContent,
    originalContent,
    loading,
    saving,
    hasUnsavedChanges,
    allStyles,
    htmlHead,
    htmlAttributes,
    
    // Actions
    fetchTemplates,
    loadTemplate,
    saveTemplate,
    resetTemplate,
    updateContent,
    resetAllStates,
    rebuildCompleteHtml
  };
};
