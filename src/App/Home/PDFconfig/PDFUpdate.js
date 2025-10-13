import api from '../../../api/api';

// Service cho PDF Template Update
export function PDFUpdateService() {
  
  // Lấy template HTML theo contract ID từ API mới
  const getTemplateByContractId = async (contractId) => {
    try {
      // Sử dụng endpoint mới với contract ID
      const response = await api.get(`/EContractTemplate/get-econtract-template-by-econtract-id/${contractId}`);
      
      if (response.status === 200 && response.data) {
        return {
          success: true,
          data: response.data
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
      console.log('=== PDFUpdateService.updateEContract START ===');
      console.log('Contract ID:', contractId);
      console.log('Subject:', subject);
      console.log('HTML Content Length:', htmlContent?.length || 0);
      console.log('HTML Content Preview (first 300 chars):', htmlContent?.substring(0, 300) + '...');
      
      // FIX: Dùng String.raw để bảo toàn HTML chứa ký tự đặc biệt
      const safeHtmlContent = String.raw`${htmlContent}`;
      
      const requestPayload = {
        id: contractId,
        subject: subject,
        htmlFile: safeHtmlContent // ✅ Thay đổi từ htmlContent thành htmlFile
      };
      
      console.log('Request payload:');
      console.log('  id:', requestPayload.id);
      console.log('  subject:', requestPayload.subject);
      console.log('  htmlFile length:', requestPayload.htmlFile.length);

      console.log('Sending API request to /EContract/update-econtract...');
      const response = await api.post('/EContract/update-econtract', requestPayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('=== PDFUpdateService.updateEContract RESPONSE ===');
      console.log('Response Status:', response.status);
      console.log('Response Status Text:', response.statusText);
      console.log('Response Headers:', response.headers);
      console.log('Response Data:', response.data);

      if (response.status === 200) {
        console.log('✅ Update successful');
        
        // ✅ Trả về thêm thông tin positions và downloadUrl từ response
        const responseData = response.data?.data;
        return {
          success: true,
          data: response.data,
          message: 'Template đã được cập nhật thành công',
          // Thêm thông tin cần thiết để cập nhật parent component
          downloadUrl: responseData?.downloadUrl,
          positionA: responseData?.positionA,
          positionB: responseData?.positionB,
          pageSign: responseData?.pageSign
        };
      }
      
      console.log('❌ Update failed - Invalid status code:', response.status);
      throw new Error('Update failed');
    } catch (error) {
      console.error('=== PDFUpdateService.updateEContract ERROR ===');
      console.error('Error Type:', error.constructor.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      
      if (error.response) {
        console.error('HTTP Error Response:');
        console.error('  Status:', error.response.status);
        console.error('  Status Text:', error.response.statusText);
        console.error('  Headers:', error.response.headers);
        console.error('  Data:', error.response.data);
      }
      
      if (error.request) {
        console.error('HTTP Request Config:', error.config);
        console.error('HTTP Request:', error.request);
      }
      
      throw new Error(error.response?.data?.message || 'Không thể cập nhật template');
    }
  };

  // Ready contract với positions
  const readyDealerContract = async (eContractId, positionA, positionB, pageSign) => {
    try {
      console.log('=== PDFUpdateService.readyDealerContract START ===');
      console.log('eContractId:', eContractId);
      console.log('positionA:', positionA);
      console.log('positionB:', positionB);
      console.log('pageSign:', pageSign);
      
      const requestPayload = {
        eContractId,
        positionA,
        positionB,
        pageSign
      };
      
      console.log('Request payload:', JSON.stringify(requestPayload, null, 2));
      console.log('Sending API request to /EContract/ready-dealer-contracts...');
      
      const response = await api.post('/EContract/ready-dealer-contracts', requestPayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('=== PDFUpdateService.readyDealerContract RESPONSE ===');
      console.log('Response Status:', response.status);
      console.log('Response Status Text:', response.statusText);
      console.log('Response Headers:', JSON.stringify(response.headers, null, 2));
      console.log('Response Data (FULL):', JSON.stringify(response.data, null, 2));

      // ✅ Check cho cả status 200 và 201, và kiểm tra isSuccess trong response
      if ((response.status === 200 || response.status === 201) && response.data?.isSuccess) {
        console.log('✅ Ready dealer contract successful');
        return {
          success: true,
          data: response.data,
          message: response.data?.message || 'Hợp đồng đã sẵn sàng',
          // Thêm thông tin từ nested data
          contractData: response.data?.result?.data,
          downloadUrl: response.data?.result?.data?.downloadUrl,
          contractNo: response.data?.result?.data?.no,
          status: response.data?.result?.data?.status
        };
      }
      
      console.log('❌ Ready contract failed - Invalid status or isSuccess false');
      console.log('Status:', response.status, 'isSuccess:', response.data?.isSuccess);
      throw new Error(response.data?.message || 'Ready contract failed');
    } catch (error) {
      console.error('=== PDFUpdateService.readyDealerContract ERROR ===');
      console.error('Error Type:', error.constructor.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      
      if (error.response) {
        console.error('HTTP Error Response:');
        console.error('  Status:', error.response.status);
        console.error('  Status Text:', error.response.statusText);
        console.error('  Headers:', JSON.stringify(error.response.headers, null, 2));
        console.error('  Data (FULL):', JSON.stringify(error.response.data, null, 2));
      }
      
      if (error.request) {
        console.error('HTTP Request Config:', JSON.stringify(error.config, null, 2));
        console.error('HTTP Request (FULL):', error.request);
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Không thể hoàn tất hợp đồng');
    }
  };

  return {
    getTemplateByContractId,
    updateEContract,
    readyDealerContract
  };
}

