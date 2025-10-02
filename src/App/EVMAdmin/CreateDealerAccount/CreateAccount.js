import api from '../../../Api/Api';

// API functions cho CreateAccount
export const createAccountApi = {
  // Tạo hợp đồng đại lý
  createDealerContract: async function(formData) {
    try {
      // Chuẩn bị dữ liệu gửi lên API
      const apiData = {
        dealerName: formData.brandName,
        dealerAddress: formData.address,
        fullNameManager: formData.representativeName,
        emailManager: formData.email,
        phoneNumberManager: formData.phone
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

    if (!formData.brandName || formData.brandName.trim().length < 2) {
      errors.push('Tên hãng phải có ít nhất 2 ký tự');
    }

    if (!formData.representativeName || formData.representativeName.trim().length < 2) {
      errors.push('Họ tên quản lý phải có ít nhất 2 ký tự');
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Email quản lý không hợp lệ');
    }

    if (!formData.phone || !/^0[1-9]{9}$/.test(formData.phone)) {
      errors.push('Số điện thoại quản lý phải bắt đầu bằng 0 và có đúng 10 chữ số');
    }

    if (!formData.address || formData.address.trim().length < 5) {
      errors.push('Địa chỉ đại lý phải có ít nhất 5 ký tự');
    }

    if (!formData.province) {
      errors.push('Vui lòng chọn tỉnh/thành phố');
    }

    if (!formData.ward) {
      errors.push('Vui lòng chọn phường/xã');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Format dữ liệu cho API
  formatApiData: function(formData) {
    return {
      dealerName: formData.brandName?.trim(),
      dealerAddress: formData.address?.trim(),
      dealerEmail: null, // Mặc định null
      dealerPhoneNumber: null, // Mặc định null
      fullNameManager: formData.representativeName?.trim(),
      emailManager: formData.email?.trim(),
      phoneNumberManager: formData.phone?.trim()
    };
  }
};

export default createAccountApi;