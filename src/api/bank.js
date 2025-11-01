import axios from 'axios';

// Lấy URL từ environment
const BANK_API_URL = import.meta.env.VITE_BANK_API_URL;

// API service cho ngân hàng
export const bankApi = {
  // Lấy danh sách tất cả ngân hàng
  getAllBanks: async () => {
    try {
      const response = await axios.get(BANK_API_URL);
      
      // Kiểm tra response structure theo mẫu API
      if (response.data && response.data.code === "00" && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.desc
        };
      } else {
        throw new Error('Định dạng response không hợp lệ');
      }
    } catch (error) {
      console.error('Lỗi khi gọi API ngân hàng:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.desc || error.message || 'Không thể tải danh sách ngân hàng'
      };
    }
  },

  // Tìm ngân hàng theo code
  getBankByCode: async (bankCode) => {
    try {
      const response = await bankApi.getAllBanks();
      if (response.success) {
        const bank = response.data.find(bank => bank.code === bankCode);
        return bank || null;
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi tìm ngân hàng theo code:', error);
      return null;
    }
  },

  // Format dữ liệu ngân hàng để hiển thị
  formatBankForSelect: (banks) => {
    if (!Array.isArray(banks)) return [];
    
    return banks.map(bank => ({
      value: bank.code,
      label: bank.shortName || bank.name,
      fullName: bank.name,
      logo: bank.logo,
      code: bank.code,
      transferSupported: bank.transferSupported,
      swiftCode: bank.swift_code
    }));
  }
};

export default bankApi;
