import axios from "axios";

const api = axios.create({

  baseURL: "http://api.metrohcmc.xyz/api",

});

// API cho địa danh Việt Nam - sử dụng proxy để tránh CORS
const provincesApi = axios.create({
  baseURL: "/api/provinces", // Sử dụng proxy local
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Request interceptor để tự động thêm JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý token hết hạn
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem("jwt_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Cache để lưu dữ liệu đã load
let cachedData = null;

// API functions cho địa danh Việt Nam - ĐƠN GIẢN HÓA
export const locationApi = {
  // Lấy tất cả tỉnh với wards (gọi API một lần duy nhất)
  getProvinces: async () => {
    if (cachedData) {
      return cachedData;
    }
    
    try {
      const response = await provincesApi.get('/?depth=2');
      
      // API trả về array, đảm bảo luôn là array để tránh lỗi .map()
      const provinces = Array.isArray(response.data) ? response.data : [];
      cachedData = provinces; // Cache để tránh gọi lại
      
      console.log('Loaded provinces:', provinces.length);
      return provinces;
    } catch (error) {
      console.error('Error loading provinces:', error);
      return []; // Trả về array rỗng khi lỗi thay vì throw
    }
  },

  // Lấy wards theo province code (từ data đã cache, không gọi API)
  getWardsByProvinceCode: (provinces, provinceCode) => {
    try {
      const province = provinces.find(p => p.code === parseInt(provinceCode));
      const wards = province?.wards || [];
      console.log(`Found ${wards.length} wards for province code:`, provinceCode);
      return wards;
    } catch (error) {
      console.error('Error getting wards for province:', provinceCode, error);
      return [];
    }
  },

  // Helper: Lấy tên province theo code
  getProvinceNameByCode: (provinces, provinceCode) => {
    const province = provinces.find(p => p.code === parseInt(provinceCode));
    return province?.name || '';
  },

  // Helper: Lấy tên ward theo code
  getWardNameByCode: (wards, wardCode) => {
    const ward = wards.find(w => w.code === parseInt(wardCode));
    return ward?.name || '';
  },

  // Clear cache (nếu cần refresh dữ liệu)
  clearCache: () => {
    cachedData = null;
  }
};

export default api;
