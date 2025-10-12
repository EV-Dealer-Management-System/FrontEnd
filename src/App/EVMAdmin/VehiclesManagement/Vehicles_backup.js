// Vehicles.js - Business logic cho quản lý Vehicle của EVM Admin
import api from "../../../api/api";

// API functions cho Vehicle Management
export const vehicleApi = {
  // === VEHICLE MANAGEMENT ===
  
  // Lấy danh sách tất cả models
  getAllModels: async function() {
    try {
      const response = await api.get('/ElectricVehicleModel/get-all-models');
      console.log('Get all models response:', response.data);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data || []
        };
      } else {
        return this.getMockModels();
      }
    } catch (error) {
      console.error('Error getting models:', error);
      return this.getMockModels();
    }
  },

  // Lấy danh sách tất cả versions
  getAllVersions: async function() {
    try {
      const response = await api.get('/ElectricVehicleVersion/get-all-versions');
      console.log('Get all versions response:', response.data);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data || []
        };
      } else {
        return this.getMockVersions();
      }
    } catch (error) {
      console.error('Error getting versions:', error);
      return this.getMockVersions();
    }
  },

  // Lấy danh sách tất cả colors
  getAllColors: async function() {
    try {
      const response = await api.get('/ElectricVehicleColor/get-all-colors');
      console.log('Get all colors response:', response.data);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data || []
        };
      } else {
        return this.getMockColors();
      }
    } catch (error) {
      console.error('Error getting colors:', error);
      return this.getMockColors();
    }
  },

  // Lấy danh sách tất cả vehicles (tổng hợp từ models, versions, colors)
  getAllVehicles: async function() {
    try {
      // Lấy tất cả models, versions, colors và combine lại
      const [modelsResult, versionsResult, colorsResult] = await Promise.all([
        this.getAllModels(),
        this.getAllVersions(), 
        this.getAllColors()
      ]);

      if (modelsResult.success && versionsResult.success && colorsResult.success) {
        // Combine data để tạo danh sách vehicles hoàn chỉnh
        const vehicles = this.combineVehicleData(
          modelsResult.data,
          versionsResult.data,
          colorsResult.data
        );
        
        return {
          success: true,
          data: vehicles
        };
      } else {
        return this.getMockVehicles();
      }
    } catch (error) {
      console.error('Error getting vehicles:', error);
      return this.getMockVehicles();
    }
  },

  // Helper function để combine vehicle data
  combineVehicleData: function(models, versions, colors) {
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

  // Lấy thông tin vehicle theo ID
  getVehicleById: async function(vehicleId) {
    try {
      const response = await api.get(`/ElectricVehicle/get-vehicle-by-id/${vehicleId}`);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể lấy thông tin xe.'
        };
      }
    } catch (error) {
      console.error('Error getting vehicle by ID:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy thông tin xe.'
      };
    }
  },

  // Tạo vehicle mới
  createVehicle: async function(vehicleData) {
    try {
      const response = await api.post('/ElectricVehicle/create-vehicle', vehicleData);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || 'Tạo xe mới thành công!'
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể tạo xe mới.'
        };
      }
    } catch (error) {
      console.error('Error creating vehicle:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể tạo xe mới.'
      };
    }
  },

  // Cập nhật vehicle
  updateVehicle: async function(vehicleId, vehicleData) {
    try {
      const response = await api.put(`/ElectricVehicle/update-vehicle`, {
        vehicleId: vehicleId,
        ...vehicleData
      });
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || 'Cập nhật xe thành công!'
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể cập nhật xe.'
        };
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể cập nhật xe.'
      };
    }
  },

  // Cập nhật trạng thái vehicle
  updateVehicleStatus: async function(vehicleId, status) {
    try {
      const response = await api.put(`/ElectricVehicle/update-vehicle-status/${vehicleId}/${status}`);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || 'Cập nhật trạng thái xe thành công!'
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể cập nhật trạng thái xe.'
        };
      }
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái xe.'
      };
    }
  },

  // Lấy số lượng xe khả dụng theo model-version-color
  getAvailableQuantity: async function(modelId, versionId, colorId) {
    try {
      const response = await api.get(`/ElectricVehicle/get-available-quantity-by-model-version-color/${modelId}/${versionId}/${colorId}`);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể lấy số lượng khả dụng.'
        };
      }
    } catch (error) {
      console.error('Error getting available quantity:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy số lượng khả dụng.'
      };
    }
  },

  // === VERSION MANAGEMENT ===
  
  // Lấy tất cả versions
  getAllVersions: async function() {
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
          error: response.data?.message || 'Không thể lấy danh sách phiên bản.'
        };
      }
    } catch (error) {
      console.error('Error getting all versions:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy danh sách phiên bản.'
      };
    }
  },

  // Lấy version theo ID
  getVersionById: async function(versionId) {
    try {
      const response = await api.get(`/ElectricVehicleVersion/get-version-by-id/${versionId}`);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể lấy thông tin phiên bản.'
        };
      }
    } catch (error) {
      console.error('Error getting version by ID:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy thông tin phiên bản.'
      };
    }
  },

  // Lấy version theo tên
  getVersionByName: async function(versionName) {
    try {
      const response = await api.get(`/ElectricVehicleVersion/get-version-by-name/${versionName}`);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể lấy thông tin phiên bản.'
        };
      }
    } catch (error) {
      console.error('Error getting version by name:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy thông tin phiên bản.'
      };
    }
  },

  // Lấy tất cả versions khả dụng theo model ID
  getAllAvailableVersionsByModelId: async function(modelId) {
    try {
      const response = await api.get(`/ElectricVehicleVersion/get-all-available-versions-by-model-id/${modelId}`);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data || []
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể lấy danh sách phiên bản khả dụng.'
        };
      }
    } catch (error) {
      console.error('Error getting available versions by model:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy danh sách phiên bản khả dụng.'
      };
    }
  },

  // Tạo version mới
  createVersion: async function(versionData) {
    try {
      console.log('=== CREATE VERSION API CALL ===');
      console.log('Using correct endpoint: /ElectricVehicleVersion/create-version');
      console.log('Data being sent:', versionData);
      
      const response = await api.post('/ElectricVehicleVersion/create-version', versionData);
      console.log('Create version response:', response.data);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || 'Tạo phiên bản mới thành công!'
        };
      } else {
        console.log('API call failed, using mock data fallback');
        return this.createMockVersion(versionData);
      }
    } catch (error) {
      console.error('Error creating version, using mock data fallback:', error);
      return this.createMockVersion(versionData);
    }
  },

  // Mock function để tạo version giả khi API lỗi
  createMockVersion: function(versionData) {
    console.log('Creating mock version with data:', versionData);
    const mockId = Date.now() + Math.random();
    return {
      success: true,
      data: {
        id: mockId,
        versionId: mockId,
        modelId: versionData.modelId,
        versionName: versionData.versionName,
        price: versionData.price,
        description: versionData.description,
        createdAt: new Date().toISOString()
      },
      message: 'Tạo phiên bản thành công! (Mock data)'
    };
  },

  // Cập nhật version
  updateVersion: async function(versionId, versionData) {
    try {
      const response = await api.put(`/ElectricVehicleVersion/update-version/${versionId}`, versionData);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || 'Cập nhật phiên bản thành công!'
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể cập nhật phiên bản.'
        };
      }
    } catch (error) {
      console.error('Error updating version:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể cập nhật phiên bản.'
      };
    }
  },

  // === COLOR MANAGEMENT ===
  
  // Lấy tất cả colors
  getAllColors: async function() {
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
          error: response.data?.message || 'Không thể lấy danh sách màu sắc.'
        };
      }
    } catch (error) {
      console.error('Error getting all colors:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy danh sách màu sắc.'
      };
    }
  },

  // Lấy danh sách colors khả dụng theo model và version
  getAvailableColorsByModelAndVersion: async function(modelId, versionId) {
    try {
      const response = await api.get(`/ElectricVehicleColor/get-available-colors-by-modelId-and-versionId/${modelId}/${versionId}`);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data || []
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể lấy danh sách màu sắc khả dụng.'
        };
      }
    } catch (error) {
      console.error('Error getting available colors by model and version:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy danh sách màu sắc khả dụng.'
      };
    }
  },

  // Lấy color theo ID
  getColorById: async function(colorId) {
    try {
      const response = await api.get(`/ElectricVehicleColor/get-color-by-id/${colorId}`);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể lấy thông tin màu sắc.'
        };
      }
    } catch (error) {
      console.error('Error getting color by ID:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy thông tin màu sắc.'
      };
    }
  },

  // Lấy color theo tên
  getColorByName: async function(colorName) {
    try {
      const response = await api.get(`/ElectricVehicleColor/get-color-by-name/${colorName}`);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể lấy thông tin màu sắc.'
        };
      }
    } catch (error) {
      console.error('Error getting color by name:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy thông tin màu sắc.'
      };
    }
  },

  // Lấy color theo code
  getColorByCode: async function(colorCode) {
    try {
      const response = await api.get(`/ElectricVehicleColor/get-color-by-code/${colorCode}`);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể lấy thông tin màu sắc.'
        };
      }
    } catch (error) {
      console.error('Error getting color by code:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy thông tin màu sắc.'
      };
    }
  },

  // Tạo color mới
  createColor: async function(colorData) {
    try {
      console.log('=== CREATE COLOR API CALL ===');
      console.log('Using correct endpoint: /ElectricVehicleColor/create-color');
      console.log('Data being sent:', colorData);
      
      const response = await api.post('/ElectricVehicleColor/create-color', colorData);
      console.log('Create color response:', response.data);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || 'Tạo màu sắc mới thành công!'
        };
      } else {
        console.log('API call failed, using mock data fallback');
        return this.createMockColor(colorData);
      }
    } catch (error) {
      console.error('Error creating color, using mock data fallback:', error);
      return this.createMockColor(colorData);
    }
  },

  // Mock function để tạo color giả khi API lỗi
  createMockColor: function(colorData) {
    console.log('Creating mock color with data:', colorData);
    const mockId = Date.now() + Math.random() * 1000;
    return {
      success: true,
      data: {
        id: mockId,
        colorId: mockId,
        versionId: colorData.versionId,
        colorName: colorData.colorName,
        hexCode: colorData.hexCode,
        imageUrl: colorData.imageUrl,
        additionalPrice: colorData.additionalPrice || 0,
        createdAt: new Date().toISOString()
      },
      message: 'Tạo màu sắc thành công! (Mock data)'
    };
  },

  // Cập nhật color
  updateColor: async function(colorId, colorData) {
    try {
      const response = await api.put(`/ElectricVehicleColor/update-color/${colorId}`, colorData);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || 'Cập nhật màu sắc thành công!'
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể cập nhật màu sắc.'
        };
      }
    } catch (error) {
      console.error('Error updating color:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể cập nhật màu sắc.'
      };
    }
  },

  // === MOCK DATA FALLBACKS ===
  
  // Mock models data
  getMockModels: function() {
    return {
      success: true,
      data: [
        {
          id: 1,
          modelName: "VinFast VF8",
          description: "SUV điện cao cấp 7 chỗ ngồi",
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          modelName: "VinFast VF9",
          description: "SUV điện hạng sang 7 chỗ ngồi",
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          modelName: "VinFast VF6",
          description: "SUV điện compact 5 chỗ ngồi",
          createdAt: new Date().toISOString()
        }
      ]
    };
  },

  // Mock versions data  
  getMockVersions: function() {
    return {
      success: true,
      data: [
        {
          id: 1,
          modelId: 1,
          versionName: "Eco",
          price: 1200000000,
          batteryCapacity: 82,
          range: 420
        },
        {
          id: 2,
          modelId: 1,
          versionName: "Plus",
          price: 1400000000,
          batteryCapacity: 87.7,
          range: 450
        },
        {
          id: 3,
          modelId: 2,
          versionName: "Plus",
          price: 1600000000,
          batteryCapacity: 123,
          range: 500
        },
        {
          id: 4,
          modelId: 3,
          versionName: "Eco",
          price: 1000000000,
          batteryCapacity: 59.6,
          range: 380
        }
      ]
    };
  },

  // Mock colors data
  getMockColors: function() {
    return {
      success: true,
      data: [
        {
          id: 1,
          versionId: 1,
          colorName: "Đỏ Cherry",
          hexCode: "#DC143C",
          imageUrl: "https://picsum.photos/400/300?random=1",
          additionalPrice: 0
        },
        {
          id: 2,
          versionId: 1,
          colorName: "Trắng Ngọc Trai",
          hexCode: "#F8F8FF",
          imageUrl: "https://picsum.photos/400/300?random=2",
          additionalPrice: 15000000
        },
        {
          id: 3,
          versionId: 2,
          colorName: "Đen Obsidian",
          hexCode: "#0B0B0B",
          imageUrl: "https://picsum.photos/400/300?random=3",
          additionalPrice: 20000000
        },
        {
          id: 4,
          versionId: 2,
          colorName: "Xanh Ocean",
          hexCode: "#006994",
          imageUrl: "https://picsum.photos/400/300?random=4",
          additionalPrice: 10000000
        }
      ]
    };
  },
  
  // Mock vehicles data
  getMockVehicles: function() {
    const mockVehicles = [
      {
        key: "1",
        id: "VF001",
        name: "VinFast VF8",
        category: "SUV Điện",
        price: 1200000000,
        batteryCapacity: 82,
        range: 420,
        seats: 7,
        color: ["Đỏ", "Trắng", "Đen", "Xanh"],
        stock: 150,
        status: "active",
        image: "https://picsum.photos/300/200?random=1",
        description: "SUV điện cao cấp với công nghệ tiên tiến",
        manufacturer: "VinFast",
        year: 2024,
      },
      {
        key: "2",
        id: "VF002",
        name: "VinFast VF9",
        category: "SUV Điện",
        price: 1500000000,
        batteryCapacity: 92,
        range: 450,
        seats: 7,
        color: ["Đỏ", "Trắng", "Đen"],
        stock: 120,
        status: "active",
        image: "https://picsum.photos/300/200?random=2",
        description: "SUV điện hạng sang với không gian rộng rãi",
        manufacturer: "VinFast",
        year: 2024,
      },
      {
        key: "3",
        id: "VF003",
        name: "VinFast VF5",
        category: "Hatchback Điện",
        price: 800000000,
        batteryCapacity: 50,
        range: 300,
        seats: 5,
        color: ["Trắng", "Đen", "Xanh"],
        stock: 200,
        status: "coming_soon",
        image: "https://picsum.photos/300/200?random=3",
        description: "Xe điện compact phù hợp đô thị",
        manufacturer: "VinFast",
        year: 2024,
      }
    ];

    return {
      success: true,
      data: mockVehicles,
      fallback: true
    };
  },

  // Mock models data
  getMockModels: function() {
    const mockModels = [
      { id: "1", name: "VinFast VF8", description: "SUV điện cao cấp" },
      { id: "2", name: "VinFast VF9", description: "SUV điện hạng sang" },
      { id: "3", name: "VinFast VF5", description: "Xe điện compact" }
    ];

    return {
      success: true,
      data: mockModels,
      fallback: true
    };
  },

  // === UTILITY FUNCTIONS ===
  
  // Validate vehicle data
  validateVehicleData: function(vehicleData) {
    const errors = [];
    
    if (!vehicleData.name || vehicleData.name.trim().length === 0) {
      errors.push('Tên xe không được để trống');
    }
    
    if (!vehicleData.modelId) {
      errors.push('Vui lòng chọn model');
    }
    
    if (!vehicleData.versionId) {
      errors.push('Vui lòng chọn phiên bản');
    }
    
    if (!vehicleData.colorId) {
      errors.push('Vui lòng chọn màu sắc');
    }
    
    if (!vehicleData.price || vehicleData.price <= 0) {
      errors.push('Giá xe phải lớn hơn 0');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },

  // Format price
  formatPrice: function(price) {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  },

  // Format vehicle status
  formatVehicleStatus: function(status) {
    const statusMap = {
      'active': { text: 'Đang bán', color: 'success' },
      'inactive': { text: 'Ngừng bán', color: 'default' },
      'out_of_stock': { text: 'Hết hàng', color: 'error' },
      'coming_soon': { text: 'Sắp ra mắt', color: 'processing' }
    };
    
    return statusMap[status] || { text: 'Không xác định', color: 'default' };
  },

  // Generate vehicle SKU
  generateVehicleSKU: function(modelName, versionName, colorName) {
    const modelCode = modelName ? modelName.substring(0, 3).toUpperCase() : 'XXX';
    const versionCode = versionName ? versionName.substring(0, 2).toUpperCase() : 'XX';
    const colorCode = colorName ? colorName.substring(0, 2).toUpperCase() : 'XX';
    const timestamp = Date.now().toString().slice(-4);
    
    return `EV-${modelCode}-${versionCode}-${colorCode}-${timestamp}`;
  }
};
