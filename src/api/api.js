import axios from "axios";

const api = axios.create({

  baseURL: "https://10b5fa7d09f7.ngrok-free.app/api",

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

// API functions cho địa danh Việt Nam
export const locationApi = {
  // Load tất cả dữ liệu một lần với depth=2
  loadAllData: async () => {
    if (cachedData) {
      return cachedData;
    }
    
    try {
      const response = await provincesApi.get('/', { params: { depth: 2 } });
      cachedData = response.data;
      return cachedData;
    } catch (error) {
      console.error('Error fetching all location data:', error);
      throw error;
    }
  },

  // Lấy danh sách tất cả tỉnh/thành phố
  getProvinces: async () => {
    try {
      const allData = await locationApi.loadAllData();
      return allData.map(province => ({
        code: province.code,
        name: province.name
      }));
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  },

  // Lấy danh sách phường/xã theo tỉnh/thành phố (API v2 bỏ quận/huyện)
  getWards: async (provinceCode) => {
    try {
      const allData = await locationApi.loadAllData();
      const province = allData.find(p => p.code === parseInt(provinceCode));
      console.log('Found province:', province?.name, 'wards count:', province?.wards?.length);
      return province ? province.wards || [] : [];
    } catch (error) {
      console.error('Error fetching wards:', error);
      throw error;
    }
  },

  // Lấy tất cả dữ liệu với depth=2 (tỉnh + quận/huyện + phường/xã)
  getAllLocations: async () => {
    try {
      const response = await provincesApi.get('/', { params: { depth: 2 } });
      return response.data;
    } catch (error) {
      console.error('Error fetching all locations:', error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết tỉnh/thành phố theo code
  getProvinceByCode: async (provinceCode) => {
    try {
      const response = await provincesApi.get(`/provinces/${provinceCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching province details:', error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết quận/huyện theo code
  getDistrictByCode: async (districtCode) => {
    try {
      const response = await provincesApi.get(`/districts/${districtCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching district details:', error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết phường/xã theo code
  getWardByCode: async (wardCode) => {
    try {
      const response = await provincesApi.get(`/wards/${wardCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ward details:', error);
      throw error;
    }
  }
};

export default api;
