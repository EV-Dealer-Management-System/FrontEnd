import api from '../../../api/api';

// API functions cho CreateAccount
export const createAccountApi = {
  // Tạo hợp đồng đại lý
  createDealerContract: async function(formData) {
    try {
      // Chuẩn bị dữ liệu gửi lên API theo schema mới
      const apiData = {
        dealerName: formData.dealerName || '',
        dealerAddress: formData.dealerAddress || '',
        taxNo: formData.taxNo || '',
        dealerLevel: formData.dealerLevel || 1,
        additionalTerm: formData.additionalTerm || null,
        regionDealer: formData.regionDealer || null,
        fullNameManager: formData.fullNameManager || '',
        emailManager: formData.emailManager || '',
        phoneNumberManager: formData.phoneNumberManager || ''
      };

      console.log('Dữ liệu gửi lên API:', apiData);
      
      // Gọi API tạo hợp đồng đại lý
      const response = await api.post('/EContract/dealer-contracts', apiData);
      
      // Log toàn bộ response để debug
      console.log('API response:', JSON.stringify(response.data, null, 2));
      
      // Trả về đúng cấu trúc mà backend trả về để xử lý phía component
      // Trong trường hợp này, cấu trúc response là:
      // { isSuccess: true, message: "...", result: { data: { id, downloadUrl, ... } } }
      return response.data;
    } catch (error) {
      console.error('Error creating dealer contract:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Có lỗi xảy ra khi tạo hợp đồng đại lý',
        details: error.response?.data || error.message
      };
    }
  },

  // Validate dữ liệu trước khi gửi API
  validateFormData: function(formData) {
    const errors = [];

    if (!formData.dealerName || formData.dealerName.trim().length < 2) {
      errors.push('Tên đại lý phải có ít nhất 2 ký tự');
    }

    if (!formData.fullNameManager || formData.fullNameManager.trim().length < 2) {
      errors.push('Họ tên quản lý đại lý phải có ít nhất 2 ký tự');
    }

    if (!formData.emailManager || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailManager)) {
      errors.push('Email quản lý đại lý không hợp lệ');
    }

    if (!formData.phoneNumberManager || !/^0[1-9]{9}$/.test(formData.phoneNumberManager)) {
      errors.push('Số điện thoại quản lý đại lý phải bắt đầu bằng 0 và có đúng 10 chữ số');
    }

    if (!formData.dealerAddress || formData.dealerAddress.trim().length < 5) {
      errors.push('Địa chỉ đại lý phải có ít nhất 5 ký tự');
    }

    if (!formData.taxNo || !/^[0-9]{10}$|^[0-9]{13}$/.test(formData.taxNo)) {
      errors.push('Mã số thuế phải có 10 hoặc 13 chữ số');
    }

    if (!formData.dealerLevel || ![1, 2, 3].includes(formData.dealerLevel)) {
      errors.push('Cấp độ đại lý phải từ 1 đến 3');
    }

    // ✅ Validate tỉnh/thành phố và phường/xã - Những field này bắt buộc cho địa chỉ đại lý
    if (!formData.province) {
      errors.push('Vui lòng chọn tỉnh/thành phố');
    }

    if (!formData.ward) {
      errors.push('Vui lòng chọn phường/xã');
    }

    // additionalTerm và regionDealer có thể null nên không cần validate

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Format dữ liệu cho API
  formatApiData: function(formData) {
    return {
      dealerName: formData.dealerName?.trim(),
      dealerAddress: formData.dealerAddress?.trim(),
      taxNo: formData.taxNo?.trim(),
      dealerLevel: formData.dealerLevel || 1,
      additionalTerm: formData.additionalTerm?.trim() || null,
      regionDealer: formData.regionDealer?.trim() || null,
      fullNameManager: formData.fullNameManager?.trim(),
      emailManager: formData.emailManager?.trim(),
      phoneNumberManager: formData.phoneNumberManager?.trim()
      // Note: province và ward không gửi lên API vì đã được xử lý thành dealerAddress
    };
  }
};

export default createAccountApi;