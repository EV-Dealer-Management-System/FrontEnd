import axios from "axios";

const PRODUCTION_BASE_URL = "https://api.electricvehiclesystem.click/api";
const DEVELOPMENT_BASE_URL = "http://localhost:5000/api";

const sanitizeBaseUrl = (url) =>
  typeof url === "string" ? url.trim().replace(/\/+$/, "") : undefined;

const resolveBaseUrl = () => {
  const envUrl = sanitizeBaseUrl(import.meta.env.VITE_API_URL);
  if (envUrl) {
    return envUrl;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;

    if (host === "localhost" || host === "127.0.0.1") {
      return DEVELOPMENT_BASE_URL;
    }

    if (host.endsWith("electricvehiclesystem.click")) {
      return PRODUCTION_BASE_URL;
    }
  }

  return import.meta.env.DEV ? DEVELOPMENT_BASE_URL : PRODUCTION_BASE_URL;
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor để tự động thêm JWT token và ngrok header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Thêm header để skip ngrok browser warning
    config.headers['ngrok-skip-browser-warning'] = 'true';
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


// API functions cho địa danh Việt Nam - SỬ DỤNG BACKEND ENDPOINTS VỚI FALLBACK
export const locationApi = {
  // Lấy danh sách tỉnh từ backend API với fallback
  getProvinces: async () => {
    try {
      // Thử API chính trước
      const response = await api.get('/GHN/provinces-open-get-province');
      
      // Kiểm tra response structure từ backend
      if (response.data?.isSuccess && Array.isArray(response.data.result)) {
        console.log('Loaded provinces from primary API:', response.data.result.length);
        return response.data.result.map(province => ({
          code: province.code,
          name: province.name
        }));
      }
      
      console.warn('Primary API response không hợp lệ, thử fallback API...');
    } catch (error) {
      console.error('Primary API failed, trying fallback:', error);
    }

    // Fallback API
    try {
      const fallbackResponse = await api.get('/GHN/get-provices');
      
      if (fallbackResponse.data?.isSuccess && Array.isArray(fallbackResponse.data.result)) {
        console.log('Loaded provinces from fallback API:', fallbackResponse.data.result.length);
        return fallbackResponse.data.result.map(province => ({
          code: province.code,
          name: province.provinceName,
          provinceID: province.provinceID // Lưu để dùng cho districts
        }));
      }
      
      console.warn('Fallback API response cũng không hợp lệ:', fallbackResponse.data);
      return [];
    } catch (fallbackError) {
      console.error('Fallback API cũng lỗi:', fallbackError);
      return [];
    }
  },

  // Lấy districts theo province từ backend API với fallback
  getWardsByProvinceCode: async (provinceCode) => {
    try {
      // Thử API chính trước
      const response = await api.get(`/GHN/provinces-open-get-ward?provinceCode=${provinceCode}`);
      
      // Kiểm tra response và lấy wards
      if (response.data?.isSuccess && response.data.result?.wards) {
        console.log(`Loaded ${response.data.result.wards.length} wards from primary API for province ${provinceCode}`);
        return response.data.result.wards;
      }
      
      console.warn('Primary wards API không hợp lệ, thử fallback...');
    } catch (error) {
      console.error('Primary wards API failed, trying fallback:', error);
    }

    // Fallback API - cần tìm provinceID từ provinceCode
    try {
      // Lấy lại danh sách provinces để tìm provinceID
      const provincesResponse = await api.get('/GHN/get-provices');
      
      if (provincesResponse.data?.isSuccess && Array.isArray(provincesResponse.data.result)) {
        const province = provincesResponse.data.result.find(p => p.code === provinceCode);
        
        if (province?.provinceID) {
          const districtsResponse = await api.get(`/GHN/get-districts?provinceId=${province.provinceID}`);
          
          if (districtsResponse.data?.isSuccess && Array.isArray(districtsResponse.data.result)) {
            console.log(`Loaded ${districtsResponse.data.result.length} districts from fallback API for province ${provinceCode}`);
            return districtsResponse.data.result.map(district => ({
              code: district.code,
              name: district.districtName,
              districtID: district.districtID
            }));
          }
        }
      }
      
      console.warn('Fallback districts API không tìm được dữ liệu cho province:', provinceCode);
      return [];
    } catch (fallbackError) {
      console.error('Fallback districts API cũng lỗi:', fallbackError);
      return [];
    }
  },

  // Helper: Lấy tên province theo code - hỗ trợ cả hai cấu trúc dữ liệu
  getProvinceNameByCode: (provinces, provinceCode) => {
    const province = provinces.find(p => 
      p.code === parseInt(provinceCode) || p.code === provinceCode
    );
    return province?.name || province?.provinceName || '';
  },

  // Helper: Lấy tên ward/district theo code - hỗ trợ cả hai cấu trúc dữ liệu  
  getWardNameByCode: (wards, wardCode) => {
    const ward = wards.find(w => 
      w.code === parseInt(wardCode) || w.code === wardCode
    );
    return ward?.name || ward?.districtName || '';
  },

  // Helper: Lấy provinceID từ code để dùng cho fallback API
  getProvinceIdByCode: (provinces, provinceCode) => {
    const province = provinces.find(p => 
      p.code === parseInt(provinceCode) || p.code === provinceCode
    );
    return province?.provinceID || null;
  },

  // Clear cache nếu cần
  clearCache: () => {
    // Backend API không cần cache riêng
    console.log('Cache cleared (using backend API)');
  }
};

export default api;
