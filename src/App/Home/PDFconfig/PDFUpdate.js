import api from '../../../api/api';

const READY_CONTRACT_ENDPOINT = '/EContract/ready-dealer-contracts';
const READY_CONTRACT_PRODUCTION_URL = `https://api.electricvehiclesystem.click/api${READY_CONTRACT_ENDPOINT}`;

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
      console.log('🔍 Input Parameters:');
      console.log('  eContractId:', eContractId, typeof eContractId);
      console.log('  positionA:', positionA, typeof positionA);
      console.log('  positionB:', positionB, typeof positionB);
      console.log('  pageSign:', pageSign, typeof pageSign);
      
      // ✅ Ensure correct data types per API spec
      const requestPayload = {
        eContractId: String(eContractId),           // API requires string
        positionA: String(positionA),               // API requires string
        positionB: String(positionB),               // API requires string  
        pageSign: Number(pageSign) || 0             // API requires number, default 0
      };
      
      console.log('Final Request Payload:', JSON.stringify(requestPayload, null, 2));
      console.log('API Base URL:', api.defaults.baseURL);
      console.log(`Sending POST request to ${READY_CONTRACT_ENDPOINT}...`);

      const requestConfig = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const attemptRequest = (url) => api.post(url, requestPayload, requestConfig);

      let response;

      console.log('⏳ Making API call...');
      try {
        response = await attemptRequest(READY_CONTRACT_ENDPOINT);
      } catch (primaryError) {
        const isNetworkError =
          !primaryError.response &&
          (primaryError.code === 'ERR_NETWORK' || /network/i.test(primaryError.message || ''));
        const configuredBaseUrl = api.defaults?.baseURL || '';
        const isUsingProductionBase = configuredBaseUrl.includes('electricvehiclesystem.click');

        if (isNetworkError && !isUsingProductionBase) {
          console.warn('⚠️ Network error when calling ready contract endpoint. Retrying with production API host...');
          console.warn('Original error message:', primaryError.message);
          console.warn('Configured baseURL:', configuredBaseUrl);
          try {
            response = await attemptRequest(READY_CONTRACT_PRODUCTION_URL);
            console.log('✅ Fallback request to production API succeeded.');
          } catch (fallbackError) {
            console.error('❌ Fallback request to production host also failed.');
            throw fallbackError;
          }
        } else {
          throw primaryError;
        }
      }

      console.log('=== PDFUpdateService.readyDealerContract RESPONSE ===');
      console.log('✅ Response received!');
      console.log('Response Status:', response.status);
      console.log('Response Status Text:', response.statusText);
      console.log('Final Request URL:', response.config.url);
      console.log('Actual Request Data Sent:', response.config.data);
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
      console.error('❌ Error Type:', error.constructor.name);
      console.error('❌ Error Message:', error.message);
      console.error('❌ Error Stack:', error.stack);
      
      // ✅ Check if request was actually sent
      if (error.response) {
        // Request was sent, server responded with error
        console.error('🔴 HTTP Error Response (Server responded):');
        console.error('  Status:', error.response.status);
        console.error('  Status Text:', error.response.statusText);
        console.error('  Request URL:', error.response.config?.url);
        console.error('  Request Data:', error.response.config?.data);
        console.error('  Response Headers:', JSON.stringify(error.response.headers, null, 2));
        console.error('  Response Data:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        // Request was sent but no response received
        console.error('🟡 Network/Timeout Error (No response received):');
        console.error('  Request URL:', error.config?.url);
        console.error('  Request Data:', error.config?.data);
        console.error('  Request Config:', JSON.stringify(error.config, null, 2));
        console.error('  Request Object:', error.request);
      } else {
        // Error in request setup
        console.error('🟠 Request Setup Error:');
        console.error('  Error Details:', error);
      }
      
      if (
        !error.response &&
        (error.code === 'ERR_NETWORK' || /network/i.test(error.message || ''))
      ) {
        throw new Error(
          'Không thể kết nối tới máy chủ hợp đồng điện tử. Vui lòng kiểm tra kết nối mạng hoặc cấu hình API.'
        );
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

