import axios from "axios";

const api = axios.create({
baseURL: import.meta.env.VITE_API_URL,
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


// API functions cho địa danh Việt Nam - SỬ DỤNG BACKEND ENDPOINTS
export const locationApi = {
  // Lấy danh sách tỉnh từ backend API
  getProvinces: async () => {
    try {
      const response = await api.get('/GHN/provinces-open-get-province');
      
      // Kiểm tra response structure từ backend
      if (response.data?.isSuccess && Array.isArray(response.data.result)) {
        console.log('Loaded provinces from backend:', response.data.result.length);
        return response.data.result;
      }
      
      console.warn('Backend response không hợp lệ:', response.data);
      return [];
    } catch (error) {
      console.error('Lỗi khi tải danh sách tỉnh từ backend:', error);
      return [];
    }
  },

  // Lấy wards theo province code từ backend API
  getWardsByProvinceCode: async (provinceCode) => {
    try {
      const response = await api.get(`/GHN/provinces-open-get-ward?provinceCode=${provinceCode}`);
      
      // Kiểm tra response và lấy wards
      if (response.data?.isSuccess && response.data.result?.wards) {
        console.log(`Loaded ${response.data.result.wards.length} wards for province ${provinceCode}`);
        return response.data.result.wards;
      }
      
      console.warn('Backend wards response không hợp lệ:', response.data);
      return [];
    } catch (error) {
      console.error('Lỗi khi tải danh sách phường/xã từ backend:', error);
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

  // Clear cache nếu cần
  clearCache: () => {
    // Backend API không cần cache riêng
    console.log('Cache cleared (using backend API)');
  }
};

export default api;
