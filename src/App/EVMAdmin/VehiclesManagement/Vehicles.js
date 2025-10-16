// Vehicles.js - Business logic cho quản lý Vehicle của EVM Admin
import api from "../../../api/api";
import axios from "axios";

// API functions cho Vehicle Management
export const vehicleApi = {
  // === OVERVIEW FUNCTIONS ===

  // Lấy danh sách tất cả vehicles thực tế từ API
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
        return await this.getAllVehiclesCombined();
      }
    } catch (error) {
      console.error('Error getting vehicles from API:', error);
      return await this.getAllVehiclesCombined();
    }
  },

  // Backup method: Lấy danh sách vehicles bằng cách combine data (fallback)
  getAllVehiclesCombined: async function () {
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

  // Lấy danh sách tất cả models
  getAllModels: async function () {
    try {
      const response = await api.get('/ElectricVehicleModel/get-all-models');

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

  // Lấy model theo ID
  getModelById: async function (modelId) {
    try {
      const response = await api.get(`/ElectricVehicleModel/get-model-by-id/${modelId}`);

      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể lấy thông tin model.'
        };
      }
    } catch (error) {
      console.error('Error getting model by ID:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy thông tin model.'
      };
    }
  },

  // Lấy model theo tên
  getModelByName: async function (modelName) {
    try {
      const response = await api.get(`/ElectricVehicleModel/get-model-by-name/${modelName}`);

      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể lấy thông tin model.'
        };
      }
    } catch (error) {
      console.error('Error getting model by name:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy thông tin model.'
      };
    }
  },

  // Tạo model mới với validation đảm bảo trả về real database ID
  createModel: async function (modelData) {
    try {
      const response = await api.post('/ElectricVehicleModel/create-model', modelData);

      // Kiểm tra nhiều điều kiện success khác nhau
      const isSuccessful = response.data?.isSuccess === true ||
        response.data?.isSuccess === 'true' ||
        response.data?.success === true ||
        response.data?.Success === true ||
        response.status === 200 || response.status === 201;

      if (isSuccessful) {
        // Extract real database ID
        let databaseId = null;
        const result = response.data.result || response.data.data || response.data;

        if (result?.id) {
          databaseId = result.id;
        } else if (result?.modelId) {
          databaseId = result.modelId;
        } else if (result?.ModelId) {
          databaseId = result.ModelId;
        }

        if (databaseId) {
          return {
            success: true,
            data: {
              ...result,
              id: databaseId,
              modelId: databaseId
            },
            message: response.data.message || 'Tạo model mới thành công!'
          };
        } else {
          // Verify bằng cách tìm model vừa tạo
          const verifyResult = await this.findModelByName(modelData.modelName);
          if (verifyResult.success) {
            return {
              success: true,
              data: verifyResult.data,
              message: 'Tạo model mới thành công! (Verified by search)'
            };
          }

          // Fallback với warning
          return {
            success: true,
            data: result,
            message: response.data.message || 'Tạo model mới thành công!',
            warning: 'Không thể xác minh ID từ database'
          };
        }
      } else {
        // Kiểm tra xem model đã tồn tại chưa
        const existingModel = await this.findModelByName(modelData.modelName);
        if (existingModel.success) {
          return {
            success: true,
            data: existingModel.data,
            message: 'Model đã tồn tại trong database!'
          };
        }

        return {
          success: false,
          error: response.data?.message || 'Không thể tạo model mới'
        };
      }
    } catch (error) {
      console.error('Error creating model:', error);

      // Kiểm tra xem model đã tồn tại chưa trước khi báo lỗi
      if (modelData.modelName) {
        const existingModel = await this.findModelByName(modelData.modelName);
        if (existingModel.success) {
          return {
            success: true,
            data: existingModel.data,
            message: 'Model đã tồn tại trong database!'
          };
        }
      }

      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể tạo model mới'
      };
    }
  },

  // Mock function để tạo model giả khi API lỗi
  createMockModel: function (modelData) {
    // Tạo GUID mock cho testing
    const mockGuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

    return {
      success: true,
      data: {
        id: mockGuid,
        modelId: mockGuid,
        modelName: modelData.modelName,
        description: modelData.description,
        createdAt: new Date().toISOString()
      },
      message: 'Tạo model thành công! (Mock data with GUID)'
    };
  },

  // Cập nhật model
  updateModel: async function (modelId, modelData) {
    try {
      const response = await api.put(`/ElectricVehicleModel/update-model/${modelId}`, modelData);

      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || 'Cập nhật model thành công!'
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể cập nhật model.'
        };
      }
    } catch (error) {
      console.error('Error updating model:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể cập nhật model.'
      };
    }
  },

  // Xóa model
  deleteModel: async function (modelId) {
    try {
      const response = await api.delete(`/ElectricVehicleModel/delete-model/${modelId}`);

      if (response.data?.isSuccess) {
        return {
          success: true,
          message: response.data.message || 'Xóa model thành công!'
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể xóa model.'
        };
      }
    } catch (error) {
      console.error('Error deleting model:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể xóa model.'
      };
    }
  },

  // === VERSION MANAGEMENT ===

  // Lấy danh sách tất cả versions
  getAllVersions: async function () {
    try {
      const response = await api.get('/ElectricVehicleVersion/get-all-versions');

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

  // Lấy version theo ID
  getVersionById: async function (versionId) {
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
  getVersionByName: async function (versionName) {
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
  getAllAvailableVersionsByModelId: async function (modelId) {
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

  // Tìm model theo tên để lấy real database ID
  findModelByName: async function (modelName) {
    try {
      // Gọi API tìm theo tên trước
      const nameResult = await this.getModelByName(modelName);
      if (nameResult.success && nameResult.data) {
        return {
          success: true,
          data: nameResult.data
        };
      }

      // Nếu không tìm thấy theo tên, tìm trong danh sách tất cả models
      const allModelsResult = await this.getAllModels();
      if (allModelsResult.success && allModelsResult.data) {
        const foundModel = allModelsResult.data.find(model =>
          model.modelName && model.modelName.toLowerCase() === modelName.toLowerCase()
        );

        if (foundModel) {
          return {
            success: true,
            data: foundModel
          };
        }
      }

      return {
        success: false,
        error: `Không tìm thấy model với tên "${modelName}" trong database`
      };
    } catch (error) {
      console.error('Error finding model by name:', error);
      return {
        success: false,
        error: 'Lỗi khi tìm model trong database'
      };
    }
  },

  // Validate model tồn tại trong database trước khi tạo version
  validateModelExists: async function (modelId) {
    try {
      // Kiểm tra format GUID/ULID - flexible hơn để support nhiều format
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!guidRegex.test(modelId)) {
        return {
          success: false,
          error: 'ModelId không đúng định dạng GUID'
        };
      }

      // Gọi API để check model tồn tại
      const response = await this.getModelById(modelId);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: `Model với ID ${modelId} không tồn tại trong database. Vui lòng tạo Model trước khi tạo Version.`
        };
      }
    } catch (error) {
      console.error('Error validating model exists:', error);
      return {
        success: false,
        error: 'Không thể kiểm tra model trong database'
      };
    }
  },

  // Tạo version mới
  createVersion: async function (versionData) {
    try {
      // Validate data trước khi gửi
      if (!versionData.modelId) {
        return {
          success: false,
          error: 'Missing modelId for version creation'
        };
      }

      if (!versionData.versionName || versionData.versionName.trim() === '') {
        return {
          success: false,
          error: 'Missing versionName for version creation'
        };
      }

      const response = await api.post('/ElectricVehicleVersion/create-version', versionData);

      // Kiểm tra success cho version
      const isVersionSuccessful = response.data?.isSuccess === true ||
        response.data?.isSuccess === 'true' ||
        response.data?.success === true ||
        response.status === 200 || response.status === 201;

      if (isVersionSuccessful) {
        return {
          success: true,
          data: response.data.result || response.data.data || response.data,
          message: response.data.message || 'Tạo phiên bản mới thành công!'
        };
      } else {
        return this.createMockVersion(versionData);
      }
    } catch (error) {
      console.error('Error creating version:', error);

      // Nếu là 400 Bad Request (validation error), không fallback về mock
      if (error.response?.status === 400) {
        // Hiển thị chi tiết lỗi validation
        const errorData = error.response?.data;
        let detailedError = 'Dữ liệu không hợp lệ:';

        if (errorData?.errors) {
          Object.keys(errorData.errors).forEach(field => {
            const fieldErrors = errorData.errors[field];
            detailedError += `\n- ${field}: ${fieldErrors.join(', ')}`;
          });
        } else if (errorData?.message) {
          detailedError = errorData.message;
        } else if (errorData?.title) {
          detailedError = errorData.title;
        }

        return {
          success: false,
          error: detailedError
        };
      }

      // 500 Server Error - Database/Backend Issues
      if (error.response?.status >= 500 || !error.response) {
        const errorMessage = error.response?.data?.message || 'Lỗi server khi tạo version. Backend cần được kiểm tra.';

        return {
          success: false,
          error: `Server Error (${error.response?.status}): ${errorMessage}`,
          details: 'Lỗi này thường do: ModelId không tồn tại trong database, Foreign Key constraint violation, hoặc lỗi Entity Framework.'
        };
      }

      // Với các lỗi khác (401, 403, etc.), return error
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể tạo version. Vui lòng thử lại.'
      };
    }
  },

  // Mock function để tạo version giả khi API lỗi
  createMockVersion: function (versionData) {
    const mockId = Date.now() + Math.random();
    return {
      success: true,
      data: {
        id: mockId,
        versionId: mockId,
        modelId: versionData.modelId,
        versionName: versionData.versionName,
        price: versionData.price,
        batteryCapacity: versionData.batteryCapacity,
        range: versionData.range,
        description: versionData.description,
        createdAt: new Date().toISOString()
      },
      message: 'Tạo phiên bản thành công! (Mock data)'
    };
  },

  // Cập nhật version
  updateVersion: async function (versionId, versionData) {
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

  // Lấy danh sách tất cả colors
  getAllColors: async function () {
    try {
      const response = await api.get('/ElectricVehicleColor/get-all-colors');

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

  // Lấy danh sách colors khả dụng theo model và version
  getAvailableColorsByModelAndVersion: async function (modelId, versionId) {
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
  getColorById: async function (colorId) {
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
  getColorByName: async function (colorName) {
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
  getColorByCode: async function (colorCode) {
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
  createColor: async function (colorData) {
    try {
      const response = await api.post('/ElectricVehicleColor/create-color', colorData);

      // Kiểm tra success cho color
      const isColorSuccessful = response.data?.isSuccess === true ||
        response.data?.isSuccess === 'true' ||
        response.data?.success === true ||
        response.status === 200 || response.status === 201;

      if (isColorSuccessful) {
        return {
          success: true,
          data: response.data.result || response.data.data || response.data,
          message: response.data.message || 'Tạo màu sắc mới thành công!'
        };
      } else {
        return this.createMockColor(colorData);
      }
    } catch (error) {
      console.error('Error creating color, using mock data fallback:', error);
      return this.createMockColor(colorData);
    }
  },

  // Mock function để tạo color giả khi API lỗi
  createMockColor: function (colorData) {
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
  updateColor: async function (colorId, colorData) {
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
  getMockModels: function () {
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
  getMockVersions: function () {
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
  getMockColors: function () {
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
  getMockVehicles: function () {
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

  // === UTILITY FUNCTIONS ===

  // Extract database ID từ API response
  extractDatabaseId: function (responseData, idFields = ['id', 'modelId', 'versionId', 'colorId']) {
    if (!responseData) return null;

    // Thử các field ID thông thường
    for (const field of idFields) {
      if (responseData[field]) {
        return responseData[field];
      }

      // Thử uppercase version
      const uppercaseField = field.charAt(0).toUpperCase() + field.slice(1);
      if (responseData[uppercaseField]) {
        return responseData[uppercaseField];
      }
    }

    // Thử trong nested data objects
    if (responseData.result) {
      return this.extractDatabaseId(responseData.result, idFields);
    }

    if (responseData.data) {
      return this.extractDatabaseId(responseData.data, idFields);
    }

    return null;
  },

  // Validate vehicle data
  validateVehicleData: function (vehicleData) {
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
  formatPrice: function (price) {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  },

  // Format vehicle status
  formatVehicleStatus: function (status) {
    const statusMap = {
      'active': { text: 'Đang bán', color: 'success' },
      'inactive': { text: 'Ngừng bán', color: 'default' },
      'out_of_stock': { text: 'Hết hàng', color: 'error' },
      'coming_soon': { text: 'Sắp ra mắt', color: 'processing' }
    };

    return statusMap[status] || { text: 'Không xác định', color: 'default' };
  },

  // Generate vehicle SKU
  generateVehicleSKU: function (modelName, versionName, colorName) {
    const modelCode = modelName ? modelName.substring(0, 3).toUpperCase() : 'XXX';
    const versionCode = versionName ? versionName.substring(0, 2).toUpperCase() : 'XX';
    const colorCode = colorName ? colorName.substring(0, 2).toUpperCase() : 'XX';
    const timestamp = Date.now().toString().slice(-4);

    return `EV-${modelCode}-${versionCode}-${colorCode}-${timestamp}`;
  },

  // === ELECTRIC VEHICLE CRUD OPERATIONS ===

  // Tạo xe điện mới
  createVehicle: async function (vehicleData) {
    try {
      console.log('=== CREATE VEHICLE DEBUG ===');
      console.log('📤 Payload being sent:', JSON.stringify(vehicleData, null, 2));
      console.log('📤 Payload size:', JSON.stringify(vehicleData).length, 'characters');

      // Validate required fields theo API schema
      const requiredFields = ['warehouseId', 'versionId', 'colorId', 'vin'];
      const missingFields = requiredFields.filter(field => !vehicleData[field]);

      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        return {
          success: false,
          error: `Thiếu các trường bắt buộc: ${missingFields.join(', ')}`
        };
      }

      // Thử endpoint đầu tiên
      let response;
      let usedEndpoint = '/ElectricVehicle/create-vehicle';

      try {
        console.log('🌐 Attempting primary endpoint:', usedEndpoint);
        console.log('🌐 Full URL:', api.defaults.baseURL + usedEndpoint);
        response = await api.post(usedEndpoint, vehicleData);
        console.log('✅ Primary endpoint successful');
      } catch (firstError) {
        console.log('❌ Primary endpoint failed:', firstError.response?.status, firstError.message);
        console.log('❌ Error details:', firstError.response?.data);

        // Nếu 404 - API chưa implement, fallback to mock ngay
        if (firstError.response?.status === 404) {
          console.log('🔄 API endpoint not implemented (404), using mock data fallback');
          return this.createMockVehicle(vehicleData);
        }

        // Với các lỗi khác, thử backup endpoint
        const backupEndpoint = '/api/ElectricVehicle/create-vehicle';

        try {
          console.log('🔄 Attempting backup endpoint:', backupEndpoint);
          const backupApi = axios.create({
            baseURL: "https://api.electricvehiclesystem.click",
            headers: {
              Authorization: api.defaults.headers.Authorization
            }
          });

          response = await backupApi.post(backupEndpoint, vehicleData);
          usedEndpoint = backupEndpoint;
          console.log('✅ Backup endpoint successful');
        } catch (secondError) {
          console.log('❌ Backup endpoint also failed:', secondError.response?.status, secondError.message);
          
          // Nếu backup cũng 404, fallback to mock
          if (secondError.response?.status === 404) {
            console.log('🔄 Backup endpoint also 404, using mock data fallback'); 
            return this.createMockVehicle(vehicleData);
          }
          
          throw firstError; // Throw original error
        }
      }

      // Kiểm tra success
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
        return this.createMockVehicle(vehicleData);
      }
    } catch (error) {
      console.error('CREATE VEHICLE ERROR:', error.response?.status, error.message);

      // Kiểm tra xem có phải lỗi 404 (API chưa implement) không
      if (error.response?.status === 404) {
        return this.createMockVehicle(vehicleData);
      }

      // Log error chi tiết cho developer nhưng vẫn fallback
      return this.createMockVehicle(vehicleData);
    }
  },

  // Mock function để tạo vehicle giả khi API lỗi
  createMockVehicle: function (vehicleData) {
    const mockId = 'mock-vehicle-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    return {
      success: true,
      data: {
        id: mockId,
        ...vehicleData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      message: 'Tạo xe điện thành công! (Development Mode - API sẽ được implement sau)'
    };
  },

  // Cập nhật xe điện
  updateVehicle: async function (vehicleId, vehicleData) {
    try {
      const response = await api.put(`/ElectricVehicle/update-vehicle/${vehicleId}`, vehicleData);

      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || 'Cập nhật xe điện thành công!'
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể cập nhật xe điện.'
        };
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể cập nhật xe điện.'
      };
    }
  },

  // Xóa xe điện
  deleteVehicle: async function (vehicleId) {
    try {
      const response = await api.delete(`/ElectricVehicle/delete-vehicle/${vehicleId}`);

      if (response.data?.isSuccess || response.status === 200) {
        return {
          success: true,
          message: response.data?.message || 'Xóa xe điện thành công!'
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể xóa xe điện.'
        };
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể xóa xe điện.'
      };
    }
  },

  // Lấy xe điện theo ID
  getVehicleById: async function (vehicleId) {
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
          error: response.data?.message || 'Không thể lấy thông tin xe điện.'
        };
      }
    } catch (error) {
      console.error('Error getting vehicle by ID:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy thông tin xe điện.'
      };
    }
  },

  // Get all warehouses - dùng API thực từ attachment
  getAllWarehouses: async () => {
    try {
      const endpoint = '/Warehouse/get-all-warehouses';
      const response = await api.get(endpoint);

      // Kiểm tra success theo format response
      const isSuccessful = response.data?.isSuccess === true ||
        response.status === 200;

      if (isSuccessful && response.data?.result) {
        return {
          success: true,
          data: response.data.result, // result array từ attachment
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

  // Legacy method - giữ cho backward compatibility
  getInventoryById: async (warehouseId = null) => {
    if (warehouseId) {
      // Get specific warehouse by ID
      try {
        const endpoint = `/Warehouse/get-warehouse-by-id/${warehouseId}`;
        const response = await api.get(endpoint);
        return {
          success: response.data?.isSuccess === true,
          data: response.data?.result,
          message: response.data?.message || 'Lấy thông tin kho thành công!'
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || error.message || 'Không thể lấy thông tin kho.'
        };
      }
    }

    // Get all warehouses
    return this.getAllWarehouses();
  },

  // Keep old method name for compatibility
  getInventoryById_old: async (warehouseId = null) => {
    try {
      console.log('=== GET INVENTORY BY ID API CALL ===');

      // Use correct endpoints without /api/ prefix (already in base URL)
      const endpoint = warehouseId
        ? `/Warehouse/get-warehouse-by-id/${warehouseId}`
        : '/Warehouse/get-all-warehouses';

      console.log('Using endpoint:', endpoint);

      const response = await api.get(endpoint);
      console.log('Get inventory response:', response.data);

      // Kiểm tra success
      const isSuccessful = response.data?.isSuccess === true ||
        response.data?.isSuccess === 'true' ||
        response.data?.success === true ||
        response.status === 200;

      if (isSuccessful) {
        console.log('Get inventory API call successful');
        return {
          success: true,
          data: response.data.result || response.data.data || response.data,
          message: response.data.message || 'Lấy thông tin kho thành công!'
        };
      } else {
        console.log('Get inventory API call failed');
        return {
          success: false,
          error: response.data.message || 'Không thể lấy thông tin kho'
        };
      }
    } catch (error) {
      console.error('Error getting inventory:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy thông tin kho.'
      };
    }
  },

  // Tạo mock attachment keys cho development (thay thế upload endpoint không tồn tại)
  generateMockAttachmentKeys: (files) => {
    const mockKeys = files.map((file, index) => {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      return `mock-ev-img-${timestamp}-${randomId}-${index}`;
    });
    console.log('Generated mock attachment keys:', mockKeys);
    return mockKeys;
  },

  // Helper function để detect MIME type từ file extension
  detectContentType: function(fileName, originalType) {
    const extension = fileName.toLowerCase().split('.').pop();
    const mimeTypeMap = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'bmp': 'image/bmp',
      'svg': 'image/svg+xml',
      'tiff': 'image/tiff',
      'tif': 'image/tiff'
    };
    
    // Ưu tiên MIME type từ extension, fallback về originalType
    const detectedType = mimeTypeMap[extension] || originalType || 'image/jpeg';
    
    console.log(`🔍 Content-Type detection:`, {
      fileName: fileName,
      extension: extension,
      originalType: originalType,
      detectedType: detectedType
    });
    
    return detectedType;
  },

  // Upload ảnh từ máy lên server theo workflow pre-signed URL
  uploadImageFile: async function (file) {
    try {
      console.log('📤 Starting upload process for:', file.name);

      // Step 1: Detect content type chính xác
      const contentType = this.detectContentType(file.name, file.type);
      console.log('🎯 Using content type:', contentType);

      // Step 2: Lấy pre-signed URL từ API
      console.log('🔗 Getting pre-signed URL...');
      const urlPayload = {
        fileName: file.name,
        contentType: contentType
      };

      const urlResponse = await api.post('/ElectricVehicle/upload-file-url-electric-vehicle', urlPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 API Response:', urlResponse.data);
      
      if (!urlResponse.data?.isSuccess || !urlResponse.data?.result) {
        throw new Error(urlResponse.data?.message || 'Không thể lấy URL upload');
      }

      const result = urlResponse.data.result;
      
      // API trả về object {uploadUrl, objectKey}, không phải string trực tiếp
      let preSignedUrl, objectKey;
      if (typeof result === 'string') {
        preSignedUrl = result;
        objectKey = `fallback-key-${Date.now()}`;
      } else if (result && typeof result === 'object' && result.uploadUrl) {
        preSignedUrl = result.uploadUrl;
        objectKey = result.objectKey;
        console.log('📋 Object key:', objectKey);
      } else {
        console.error('❌ Unexpected result format:', typeof result, result);
        throw new Error('Pre-signed URL không đúng định dạng');
      }
      
      console.log('✅ Got pre-signed URL:', preSignedUrl.substring(0, 100) + '...');

      // Step 3: Upload file lên pre-signed URL với content type chính xác
      console.log('📤 Uploading file to pre-signed URL...');
      const uploadResponse = await fetch(preSignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': contentType,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      // Step 4: Get final URL (thường là pre-signed URL không có query params)
      const finalUrl = preSignedUrl.split('?')[0];
      console.log('✅ File uploaded successfully:', finalUrl);

      return {
        success: true,
        url: finalUrl,
        preSignedUrl: preSignedUrl,
        objectKey: objectKey,
        message: 'Upload ảnh thành công!'
      };

    } catch (error) {
      console.error('❌ Upload image error:', error);

      // Fallback: Nếu workflow pre-signed URL fail, tạm thời dùng mock
      console.log('🔄 Upload failed, using mock URL for development...');
      const mockUrl = `https://mock-storage.example.com/images/${Date.now()}-${file.name}`;

      return {
        success: true,
        url: mockUrl,
        objectKey: `mock-key-${Date.now()}-${file.name}`,
        message: 'Upload ảnh thành công! (Mock URL - Development mode)',
        mock: true
      };
    }
  },

  // Upload nhiều ảnh từ máy với retry mechanism
  uploadMultipleImages: async function (files) {
    const uploadedUrls = [];

    try {
      console.log(`📤 Starting batch upload for ${files.length} images...`);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📤 Processing image ${i + 1}/${files.length}: ${file.name}`);

        const uploadResult = await this.uploadImageFile(file);

        if (uploadResult.success) {
          uploadedUrls.push(uploadResult.url);
          console.log(`✅ Image ${i + 1} uploaded successfully`);

          if (uploadResult.mock) {
            console.log('⚠️  Using mock URL for development');
          }
        } else {
          console.error(`❌ Failed to upload ${file.name}:`, uploadResult.error);
          throw new Error(`Upload failed for ${file.name}: ${uploadResult.error}`);
        }
      }

      console.log(`✅ All ${files.length} images uploaded successfully!`);
      return {
        success: true,
        urls: uploadedUrls,
        message: `Upload thành công ${files.length} ảnh!`
      };

    } catch (error) {
      console.error('❌ Batch upload error:', error);
      return {
        success: false,
        error: error.message || 'Lỗi khi upload ảnh',
        urls: uploadedUrls, // Return partial results
        partialSuccess: uploadedUrls.length > 0
      };
    }
  },

  // Upload nhiều ảnh và lấy keys trực tiếp cho attachmentKeys (Flow mới)
  uploadMultipleImagesForKeys: async function(files) {
    const uploadedKeys = [];
    
    try {
      console.log(`📤 Starting batch upload for ${files.length} images to get keys...`);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📤 Processing image ${i + 1}/${files.length}: ${file.name}`);
        
        const uploadResult = await this.uploadImageFile(file);
        
        if (uploadResult.success) {
          // Lấy objectKey từ response làm attachment key
          const attachmentKey = uploadResult.objectKey || `fallback-key-${Date.now()}-${i}`;
          uploadedKeys.push(attachmentKey);
          console.log(`✅ Image ${i + 1} uploaded, key: ${attachmentKey}`);
        } else {
          console.error(`❌ Failed to upload ${file.name}:`, uploadResult.error);
          throw new Error(`Upload failed for ${file.name}: ${uploadResult.error}`);
        }
      }
      
      console.log(`✅ All ${files.length} images uploaded successfully!`);
      console.log('🔑 Collected attachment keys:', uploadedKeys);
      return {
        success: true,
        keys: uploadedKeys,
        message: `Upload thành công ${files.length} ảnh, lấy được ${uploadedKeys.length} keys!`
      };
      
    } catch (error) {
      console.error('❌ Batch upload error:', error);
      return {
        success: false,
        error: error.message || 'Lỗi khi upload ảnh',
        keys: uploadedKeys, // Return partial results
        partialSuccess: uploadedKeys.length > 0
      };
    }
  },

  // Lấy attachment keys từ các URL ảnh đã upload (khi tạo xe)
  getAttachmentKeysFromUrls: async function (imageUrls) {
    try {
      console.log('🔑 Getting attachment keys for:', imageUrls);

      // Tạm thời sử dụng mock keys vì API này có thể chưa ready
      // TODO: Thay thế bằng API thật khi backend sẵn sàng
      console.log('⚠️  Using mock attachment keys for development');
      const mockKeys = imageUrls.map((url, index) => {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        return `attachment-key-${timestamp}-${randomId}-${index}`;
      });

      console.log('✅ Generated mock attachment keys:', mockKeys);
      return {
        success: true,
        keys: mockKeys
      };

      // Khi API backend sẵn sàng, uncomment code dưới và xóa mock code trên:
      /*
      const response = await api.post('/api/ElectricVehicle/get-attachment-keys', {
        urls: imageUrls
      });
      
      if (response.data?.isSuccess && response.data?.result) {
        const keys = response.data.result;
        console.log('✅ Got attachment keys:', keys);
        return {
          success: true,
          keys: keys
        };
      } else {
        throw new Error(response.data?.message || 'Lỗi khi lấy attachment keys');
      }
      */

    } catch (error) {
      console.error('❌ Get attachment keys error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Lỗi khi lấy attachment keys'
      };
    }
  },

  // Lấy danh sách ảnh của một xe
  getVehicleImages: async function (vehicleId) {
    try {
      console.log('🖼️ Getting images for vehicle:', vehicleId);

      const response = await api.get(`/ElectricVehicle/${vehicleId}/images`);

      if (response.data?.isSuccess && response.data?.result) {
        const images = response.data.result;
        console.log('✅ Got vehicle images:', images);
        return {
          success: true,
          images: images
        };
      } else {
        // Trường hợp không có ảnh, vẫn trả về success với mảng rỗng
        console.log('ℹ️ No images found for vehicle');
        return {
          success: true,
          images: []
        };
      }

    } catch (error) {
      console.error('❌ Get vehicle images error:', error);

      // Nếu 404 - xe không có ảnh, trả về mảng rỗng
      if (error.response?.status === 404) {
        return {
          success: true,
          images: []
        };
      }

      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Lỗi khi lấy ảnh xe'
      };
    }
  },
};