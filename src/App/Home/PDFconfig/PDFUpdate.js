import api from '../../../api/api';

// Service cho PDF Template Update
export function PDFUpdateService() {
  
  // Lấy template HTML theo contract ID từ API mới
  const getTemplateByContractId = async (contractId) => {
    try {
      // Sử dụng endpoint mới với contract ID
      const response = await api.get(`/EContract/get-econtract-by-id/${contractId}`);
      
      if (response.status === 200 && response.data?.result) {
        const html = response.data.result.htmlTemaple || response.data.result.htmlTemplate;
        return {
          success: true,
          data: {
            id: response.data.result.id,
            htmlTemplate: html,
            raw: response.data.result
          }
        };
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching template:', error);
      throw new Error(error.response?.data?.message || 'Không thể tải template');
    }
  };

  // Cập nhật template HTML đã chỉnh sửa với API mới
  const updateEContract = async (contractId, htmlContent, subject) => {
    try {
      console.log('=== updateEContract START ===');
      console.log('Contract ID:', contractId);
      console.log('Subject:', subject);
      console.log('HTML Content Length:', htmlContent?.length || 0);
      
      const safeHtmlContent = String.raw`${htmlContent}`;
      
      const requestPayload = {
        id: contractId,
        subject: subject,
        htmlFile: safeHtmlContent
      };
      
      console.log('=== PAYLOAD GỬI ĐI ===');
      console.log('id:', requestPayload.id);
      console.log('subject:', requestPayload.subject);
      console.log('htmlFile length:', requestPayload.htmlFile.length);
      console.log('Toàn bộ payload:');
      console.log(JSON.stringify(requestPayload, null, 2));
      const response = await api.post('/EContract/update-econtract', requestPayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('=== SERVER RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:');
      console.log(JSON.stringify(response.headers, null, 2));
      console.log('Response data đầy đủ:');
      console.log(JSON.stringify(response.data, null, 2));

      if (response.status === 200 && response.data.success === true) {
        console.log('Update thành công');
        
        const responseData = response.data?.data;
        return {
          success: true,
          data: response.data,
          message: 'Template đã được cập nhật thành công',
          downloadUrl: responseData?.downloadUrl,
          positionA: responseData?.positionA,
          positionB: responseData?.positionB,
          pageSign: responseData?.pageSign
        };
      }
      
      console.log('Update thất bại - Status code:', response.status);
      throw new Error('Update failed');
    } catch (error) {
      console.error('=== LỖI updateEContract ===');
      console.error('Thông báo lỗi:', error.message);
      if (error.response) {
        console.error('=== SERVER RESPONSE ERROR ===');
        console.error('Status:', error.response.status);
        console.error('Status Text:', error.response.statusText);
        console.error('Headers:');
        console.error(JSON.stringify(error.response.headers, null, 2));
        console.error('Response data:');
        console.error(JSON.stringify(error.response.data, null, 2));
      }
      
      if (error.request) {
        console.error('=== REQUEST ERROR ===');
        console.error('Config:');
        console.error(JSON.stringify(error.config, null, 2));
      }
      
      throw new Error(error.response?.data?.message || 'Không thể cập nhật template');
    }
  };

  return {
    getTemplateByContractId,
    updateEContract
  };
}

