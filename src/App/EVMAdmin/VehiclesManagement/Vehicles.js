// Vehicles.js - Business logic cho quản lý Vehicle của EVM Admin
import api from "../../../api/api";
export const vehicleApi = {
  // === OVERVIEW FUNCTIONS ===

  // Lấy danh sách tất cả vehicles từ API
  getAllVehicles: async function () {
    try {
      const response = await api.get('/ElectricVehicle/get-all-vehicles');

      if (response.data?.isSuccess && response.data?.result) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Lấy danh sách xe thành công'
        };
      } else {
        return {
          success: false,
          data: [],
          error: 'API không trả về dữ liệu hợp lệ'
        };
      }
    } catch (error) {
      console.error('Error getting vehicles from API:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Lỗi khi tải danh sách xe'
      };
    }
  },

  // Helper function để combine vehicle data
  combineVehicleData: function (models, versions, colors) {
    const vehicles = [];

    models.forEach(model => {
      const modelVersions = versions.filter(v => v.modelId === model.id);

      modelVersions.forEach(version => {
        const versionColors = colors.filter(c => c.versionId === version.id);

        if (versionColors.length > 0) {
          versionColors.forEach(color => {
            vehicles.push({
              id: `${model.id}-${version.id}-${color.id}`,
              modelId: model.id,
              modelName: model.modelName,
              modelDescription: model.description,
              versionId: version.id,
              versionName: version.versionName,
              price: version.price,
              batteryCapacity: version.batteryCapacity,
              range: version.range,
              colorId: color.id,
              colorName: color.colorName,
              hexCode: color.hexCode,
              imageUrl: color.imageUrl,
              additionalPrice: color.additionalPrice || 0,
              totalPrice: (version.price || 0) + (color.additionalPrice || 0)
            });
          });
        } else {
          // Version không có color nào
          vehicles.push({
            id: `${model.id}-${version.id}`,
            modelId: model.id,
            modelName: model.modelName,
            modelDescription: model.description,
            versionId: version.id,
            versionName: version.versionName,
            price: version.price,
            batteryCapacity: version.batteryCapacity,
            range: version.range,
            colorId: null,
            colorName: 'Chưa có màu',
            hexCode: '#CCCCCC',
            imageUrl: 'https://picsum.photos/400/300?random=default',
            additionalPrice: 0,
            totalPrice: version.price || 0
          });
        }
      });
    });

    return vehicles;
  },

  // === MODEL MANAGEMENT ===
  getAllModels: async function () {
    try {
      const response = await api.get('/ElectricVehicleModel/get-all-models');
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data || []
        };
      } else {
        return {
          success: false,
          data: [],
          error: 'API không trả về dữ liệu models hợp lệ'
        };
      }
    } catch (error) {
      console.error('Error getting models:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Lỗi khi tải danh sách models'
      };
    }
  },

  // Tạo model mới
  createModel: async function (modelData) {
    try {
      const response = await api.post('/ElectricVehicleModel/create-model', modelData);
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || 'Tạo model mới thành công!'
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể tạo model'
        };
      }
    } catch (error) {
      console.error('Error creating model:', error);
      return {
        success: false,
        error: error.message || 'Lỗi khi tạo model'
      };
    }
  },

  // === VERSION MANAGEMENT ===
  getAllVersions: async function () {
    try {
      const response = await api.get('/ElectricVehicleVersion/get-all-versions');
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data || []
        };
      } else {
        return {
          success: false,
          data: [],
          error: 'API không trả về dữ liệu versions hợp lệ'
        };
      }
    } catch (error) {
      console.error('Error getting versions:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Lỗi khi tải danh sách versions'
      };
    }
  },

  // === COLOR MANAGEMENT ===
  getAllColors: async function () {
    try {
      const response = await api.get('/ElectricVehicleColor/get-all-colors');
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data || []
        };
      } else {
        return {
          success: false,
          data: [],
          error: 'API không trả về dữ liệu colors hợp lệ'
        };
      }
    } catch (error) {
      console.error('Error getting colors:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Lỗi khi tải danh sách colors'
      };
    }
  },

  // === VEHICLE MANAGEMENT ===
  createVehicle: async function (vehicleData) {
    try {
      console.log('=== CREATE VEHICLE DEBUG ===');
      console.log('📤 Payload being sent:', JSON.stringify(vehicleData, null, 2));

      const response = await api.post('/ElectricVehicle/create-vehicle', vehicleData);

      const isSuccessful = response.data?.isSuccess === true ||
        response.data?.isSuccess === 'true' ||
        response.data?.success === true ||
        response.status === 200 || response.status === 201;

      if (isSuccessful) {
        return {
          success: true,
          data: response.data.result || response.data.data || response.data,
          message: response.data.message || 'Tạo xe điện mới thành công!'
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể tạo xe điện'
        };
      }
    } catch (error) {
      console.error('CREATE VEHICLE ERROR:', error.response?.status, error.message);
      return {
        success: false,
        error: error.message || 'Lỗi khi tạo xe điện'
      };
    }
  },



  // === WAREHOUSE MANAGEMENT ===
  getAllWarehouses: async () => {
    try {
      const endpoint = '/Warehouse/get-all-warehouses';
      const response = await api.get(endpoint);

      const isSuccessful = response.data?.isSuccess === true ||
        response.status === 200;

      if (isSuccessful && response.data?.result) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Lấy danh sách kho thành công!'
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Không thể lấy danh sách kho'
        };
      }
    } catch (error) {
      console.error('Error getting warehouses:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy danh sách kho.'
      };
    }
  },

  ElectricVehicleImageService: {
  
    async uploadSingleImage(file) {
      try {
        const contentType = this.detectContentType(file.name);

        const { data } = await api.post(
          '/ElectricVehicle/upload-file-url-electric-vehicle',
          { fileName: file.name, contentType },
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (!data?.isSuccess || !data?.result) {
          throw new Error(data?.message || 'Không thể lấy URL upload');
        }

        const uploadUrl =
          typeof data.result === 'string'
            ? data.result
            : data.result.uploadUrl || '';

        const objectKey =
          typeof data.result === 'object'
            ? data.result.objectKey || file.name
            : file.name;

        if (!uploadUrl) throw new Error('Pre-signed URL không hợp lệ');
        const response = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': contentType },
          body: file,
        });

        if (!response.ok) throw new Error(`Upload thất bại: ${response.status}`);

        console.log(`✅ Uploaded ${file.name} → key: ${objectKey}`);
        return objectKey;
      } catch (err) {
        console.error('❌ Upload ảnh lỗi:', err);
        throw err;
      }
    },

    async uploadMultipleImages(files) {
      console.log(`🔄 Starting upload for ${files.length} files`);
      const keys = [];
      
      for (const file of files) {
        try {
          console.log(`🔄 Uploading: ${file.name}`);
          const key = await this.uploadSingleImage(file);
          keys.push(key);
          console.log(`✅ Success: ${file.name} → ${key}`);
        } catch (error) {
          console.error(`❌ Upload ${file.name} failed:`, error);
          // Tạo fallback key để không block workflow
          const fallbackKey = `fallback-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, '')}`;
          keys.push(fallbackKey);
          console.log(`🔄 Using fallback key: ${fallbackKey}`);
        }
      }
      
      console.log('📦 Final attachment keys:', keys);
      console.log(`📊 Upload summary: ${keys.length} keys generated for ${files.length} files`);
      
      // Đảm bảo luôn trả về array, không bao giờ null/undefined
      return keys.length > 0 ? keys : [`default-key-${Date.now()}`];
    },
  }
};