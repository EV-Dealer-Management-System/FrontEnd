import api from '../../api/api';

// ===== API SERVICES CHO TEMPLATE EDITOR =====

/**
 * Lấy danh sách tất cả template hợp đồng
 * @param {number} pageNumber - Số trang (default: 1)
 * @param {number} pageSize - Kích thước trang (default: 10)
 * @returns {Promise} API Response
 */
export const getAllTemplates = async (pageNumber = 1, pageSize = 10) => {
  try {
    console.log('🔍 Fetching templates from API...');
    console.log('- Page:', pageNumber, 'Size:', pageSize);
    
    const response = await api.get(`/EContractTemplate/get-all-econtract-template?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    
    console.log('✅ Templates API Response:', {
      status: response.status,
      isSuccess: response.data?.isSuccess,
      resultCount: response.data?.result?.length || 0
    });
    
    // Xử lý response
    if (response.status === 200 && response.data?.isSuccess) {
      const templates = response.data.result || [];
      
      console.log('📋 Templates loaded successfully:');
      templates.forEach((template, index) => {
        console.log(`  ${index + 1}. ${template.name} (${template.code}) - ${template.contentHtml?.length || 0} chars`);
      });
      
      return {
        success: true,
        data: templates,
        message: `Tải thành công ${templates.length} template`,
        total: templates.length
      };
    } else {
      throw new Error(response.data?.message || 'Invalid response format from server');
    }
    
  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    
    // Xử lý error response
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Lỗi khi tải danh sách template';
                        
    return {
      success: false,
      data: [],
      message: errorMessage,
      error: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      }
    };
  }
};

/**
 * Cập nhật template hợp đồng theo code
 * @param {string} templateCode - Mã template (vd: REGISTERDEALER)
 * @param {string} templateName - Tên template  
 * @param {string} htmlContent - Nội dung HTML đầy đủ
 * @returns {Promise} API Response
 */
export const updateTemplate = async (templateCode, templateName, htmlContent) => {
  try {
    console.log('💾 Updating template via API...');
    console.log('- Template Code:', templateCode);
    console.log('- Template Name:', templateName);
    console.log('- HTML Content Length:', htmlContent?.length || 0);
    
    // Validate input
    if (!templateCode) {
      throw new Error('Template code is required');
    }
    if (!templateName) {
      throw new Error('Template name is required');
    }
    if (!htmlContent || htmlContent.trim().length === 0) {
      throw new Error('HTML content cannot be empty');
    }
    
    // Tạo payload theo format chuẩn API
    const payload = {
      name: templateName,
      html: htmlContent
    };
    
    console.log('=== UPDATE TEMPLATE PAYLOAD ===');
    console.log('Payload structure:', {
      name: payload.name,
      htmlLength: payload.html?.length || 0,
      htmlPreview: payload.html?.substring(0, 100) + '...'
    });
    
    // Gửi PUT request với timeout
    const response = await Promise.race([
      api.put(`/EContractTemplate/update-econtract-template?code=${templateCode}`, payload),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      )
    ]);
    
    console.log('✅ Update template API Response:', {
      status: response.status,
      isSuccess: response.data?.isSuccess,
      message: response.data?.message
    });
    
    // Xử lý response thành công
    if (response.status === 200 && response.data?.isSuccess) {
      console.log('🎉 Template updated successfully');
      
      return {
        success: true,
        message: response.data.message || 'Template updated successfully',
        data: {
          templateCode,
          templateName,
          htmlLength: htmlContent.length,
          updatedAt: new Date().toISOString()
        }
      };
    } else {
      throw new Error(response.data?.message || 'Template update failed');
    }
    
  } catch (error) {
    console.error('❌ Error updating template:', error);
    
    // Xử lý các loại lỗi
    let errorMessage = 'Lỗi khi cập nhật template';
    
    if (error.response?.status === 400) {
      errorMessage = 'Dữ liệu gửi lên không hợp lệ';
    } else if (error.response?.status === 404) {
      errorMessage = `Không tìm thấy template với code: ${templateCode}`;
    } else if (error.response?.status === 500) {
      errorMessage = 'Lỗi server, vui lòng thử lại sau';
    } else if (error.message === 'Request timeout after 30 seconds') {
      errorMessage = 'Timeout - Request quá lâu, vui lòng thử lại';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      message: errorMessage,
      error: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        originalError: error.message
      }
    };
  }
};

/**
 * Lấy template cụ thể theo ID hoặc Code
 * @param {string} identifier - ID hoặc Code của template
 * @param {string} type - 'id' hoặc 'code' (default: 'code')
 * @returns {Promise} API Response
 */
export const getTemplateById = async (identifier, type = 'code') => {
  try {
    console.log(`🔍 Fetching template by ${type}:`, identifier);
    
    // Gọi API get all và filter theo identifier
    const allTemplatesResult = await getAllTemplates(1, 50); // Lấy nhiều hơn để search
    
    if (!allTemplatesResult.success) {
      throw new Error(allTemplatesResult.message);
    }
    
    // Tìm template theo identifier
    const template = allTemplatesResult.data.find(t => 
      type === 'id' ? t.id === identifier : t.code === identifier
    );
    
    if (!template) {
      throw new Error(`Template not found with ${type}: ${identifier}`);
    }
    
    console.log('✅ Template found:', template.name);
    
    return {
      success: true,
      data: template,
      message: `Template ${template.name} loaded successfully`
    };
    
  } catch (error) {
    console.error(`❌ Error fetching template by ${type}:`, error);
    
    return {
      success: false,
      data: null,
      message: error.message || `Lỗi khi tải template theo ${type}`,
      error: error
    };
  }
};

/**
 * Validate HTML content trước khi save
 * @param {string} htmlContent - Nội dung HTML cần validate
 * @returns {Object} Validation result
 */
export const validateTemplateContent = (htmlContent) => {
  const errors = [];
  const warnings = [];
  
  try {
    // Check basic HTML structure
    if (!htmlContent || htmlContent.trim().length === 0) {
      errors.push('HTML content is empty');
      return { isValid: false, errors, warnings };
    }
    
    // Check for doctype
    if (!htmlContent.includes('<!doctype') && !htmlContent.includes('<!DOCTYPE')) {
      warnings.push('Missing DOCTYPE declaration');
    }
    
    // Check for html tag
    if (!htmlContent.includes('<html')) {
      errors.push('Missing <html> tag');
    }
    
    // Check for head tag
    if (!htmlContent.includes('<head>')) {
      warnings.push('Missing <head> section');
    }
    
    // Check for body tag
    if (!htmlContent.includes('<body>')) {
      errors.push('Missing <body> tag');
    }
    
    // Check for charset
    if (!htmlContent.includes('charset')) {
      warnings.push('Missing charset declaration');
    }
    
    // Check for unclosed tags (basic check)
    const openTags = (htmlContent.match(/<(?!\/)[^>]+>/g) || []).length;
    const closeTags = (htmlContent.match(/<\/[^>]+>/g) || []).length;
    
    if (Math.abs(openTags - closeTags) > 5) { // Allow some tolerance for self-closing tags
      warnings.push('Possible unclosed HTML tags detected');
    }
    
    // Check content length
    if (htmlContent.length > 100000) { // 100KB
      warnings.push('HTML content is very large (>100KB)');
    }
    
    const isValid = errors.length === 0;
    
    console.log('📝 Template validation result:', {
      isValid,
      errors: errors.length,
      warnings: warnings.length,
      contentLength: htmlContent.length
    });
    
    return {
      isValid,
      errors,
      warnings,
      stats: {
        contentLength: htmlContent.length,
        estimatedSize: `${Math.round(htmlContent.length / 1024)}KB`
      }
    };
    
  } catch (error) {
    console.error('❌ Validation error:', error);
    
    return {
      isValid: false,
      errors: ['Validation process failed: ' + error.message],
      warnings: [],
      stats: null
    };
  }
};

// ===== EXPORT CÁC SERVICE FUNCTIONS =====
export const TemplateEditorService = {
  getAllTemplates,
  updateTemplate,
  getTemplateById,
  validateTemplateContent
};
