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

      if (response.status === 200) {
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
      console.error('Loại lỗi:', error.constructor.name);
      console.error('Thông báo lỗi:', error.message);
      console.error('Stack trace:', error.stack);
      
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

  // Ready contract với positions
  const readyDealerContract = async (eContractId, positionA, positionB, pageSign) => {
    try {
      console.log('=== readyDealerContract START ===');
      console.log('Input eContractId:', eContractId, '(type:', typeof eContractId, ')');
      console.log('Input positionA:', positionA, '(type:', typeof positionA, ')');
      console.log('Input positionB:', positionB, '(type:', typeof positionB, ')');
      console.log('Input pageSign:', pageSign, '(type:', typeof pageSign, ')');
      
      const requestPayload = {
        eContractId: String(eContractId),
        positionA: String(positionA),
        positionB: String(positionB),  
        pageSign: Number(pageSign) || 0
      };
      
      console.log('=== PAYLOAD GỬI ĐI ===');
      console.log('eContractId:', requestPayload.eContractId);
      console.log('positionA:', requestPayload.positionA);
      console.log('positionB:', requestPayload.positionB);
      console.log('pageSign:', requestPayload.pageSign);
      console.log('Toàn bộ payload:');
      console.log(JSON.stringify(requestPayload, null, 2));

      const requestConfig = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const attemptRequest = (url) => api.post(url, requestPayload, requestConfig);

      let response;

      console.log('Đang gọi API...');
      try {
        response = await attemptRequest(READY_CONTRACT_ENDPOINT);
      } catch (primaryError) {
        const isNetworkError =
          !primaryError.response &&
          (primaryError.code === 'ERR_NETWORK' || /network/i.test(primaryError.message || ''));
        const configuredBaseUrl = api.defaults?.baseURL || '';
        const isUsingProductionBase = configuredBaseUrl.includes('electricvehiclesystem.click');

        if (isNetworkError && !isUsingProductionBase) {
          console.warn('Network error, thử lại với production API...');
          console.warn('Lỗi gốc:', primaryError.message);
          console.warn('BaseURL hiện tại:', configuredBaseUrl);
          try {
            response = await attemptRequest(READY_CONTRACT_PRODUCTION_URL);
            console.log('Thành công với production API');
          } catch (fallbackError) {
            console.error('Fallback cũng thất bại');
            throw fallbackError;
          }
        } else {
          throw primaryError;
        }
      }

      console.log('=== SERVER RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('URL được gọi:', response.config.url);
      console.log('Data đã gửi:', response.config.data);
      console.log('Response headers:');
      console.log(JSON.stringify(response.headers, null, 2));
      console.log('Response data đầy đủ:');
      console.log(JSON.stringify(response.data, null, 2));

      if ((response.status === 200 || response.status === 201) && response.data?.isSuccess) {
        console.log('API thành công');
        return {
          success: true,
          data: response.data,
          message: response.data?.message || 'Hợp đồng đã sẵn sàng',
          contractData: response.data?.result?.data,
          downloadUrl: response.data?.result?.data?.downloadUrl,
          contractNo: response.data?.result?.data?.no,
          status: response.data?.result?.data?.status
        };
      }
      
      console.log('API thất bại - Status:', response.status, 'isSuccess:', response.data?.isSuccess);
      throw new Error(response.data?.message || 'Ready contract failed');
    } catch (error) {
      console.error('=== LỖI readyDealerContract ===');
      console.error('Loại lỗi:', error.constructor.name);
      console.error('Thông báo lỗi:', error.message);
      console.error('Stack trace:', error.stack);
      
      if (error.response) {
        console.error('=== SERVER RESPONSE ERROR ===');
        console.error('Status:', error.response.status);
        console.error('Status Text:', error.response.statusText);
        console.error('URL:', error.response.config?.url);
        console.error('Data đã gửi:', error.response.config?.data);
        console.error('Response headers:');
        console.error(JSON.stringify(error.response.headers, null, 2));
        console.error('Response data:');
        console.error(JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.error('=== NETWORK ERROR ===');
        console.error('URL:', error.config?.url);
        console.error('Data đã gửi:', error.config?.data);
        console.error('Request config:');
        console.error(JSON.stringify(error.config, null, 2));
      } else {
        console.error('=== REQUEST SETUP ERROR ===');
        console.error('Chi tiết:', error);
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

