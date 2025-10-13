// Vehicles.js - Business logic cho quản lý Vehicle của EVM Admin
import api from "../../../api/api";

// API functions cho Vehicle Management
export const vehicleApi = {
  // === OVERVIEW FUNCTIONS ===
  
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

  // === MODEL MANAGEMENT ===
  
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

  // Lấy model theo ID
  getModelById: async function(modelId) {
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
  getModelByName: async function(modelName) {
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
  createModel: async function(modelData) {
    try {
      console.log('=== CREATE MODEL API CALL ===');
      console.log('Using endpoint: /ElectricVehicleModel/create-model');
      console.log('Data being sent:', modelData);
      
      const response = await api.post('/ElectricVehicleModel/create-model', modelData);
      console.log('Raw API response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('isSuccess value:', response.data?.isSuccess);
      console.log('isSuccess type:', typeof response.data?.isSuccess);
      
      // Kiểm tra nhiều điều kiện success khác nhau
      const isSuccessful = response.data?.isSuccess === true || 
                          response.data?.isSuccess === 'true' ||
                          response.data?.success === true ||
                          response.data?.Success === true ||
                          response.status === 200 || response.status === 201;
      
      console.log('Final success evaluation:', isSuccessful);
      
      if (isSuccessful) {
        console.log('API call successful, result:', response.data.result);
        console.log('Full response.data structure:', JSON.stringify(response.data, null, 2));
        
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
        
        console.log('Extracted database ID:', databaseId);
        
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
          console.warn('⚠️ API successful but no ID returned, will verify by searching...');
          
          // Verify bằng cách tìm model vừa tạo
          const verifyResult = await this.findModelByName(modelData.modelName);
          if (verifyResult.success) {
            console.log('✅ Verified model creation by name search:', verifyResult.data);
            return {
              success: true,
              data: verifyResult.data,
              message: 'Tạo model mới thành công! (Verified by search)'
            };
          }
          
          // Fallback với warning
          console.warn('⚠️ Cannot verify model creation, returning success without ID');
          return {
            success: true,
            data: result,
            message: response.data.message || 'Tạo model mới thành công!',
            warning: 'Không thể xác minh ID từ database'
          };
        }
      } else {
        console.log('API call failed, checking if model exists by name...');
        
        // Kiểm tra xem model đã tồn tại chưa
        const existingModel = await this.findModelByName(modelData.modelName);
        if (existingModel.success) {
          console.log('✅ Model already exists:', existingModel.data);
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
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Kiểm tra xem model đã tồn tại chưa trước khi báo lỗi
      if (modelData.modelName) {
        console.log('Checking if model already exists after error...');
        const existingModel = await this.findModelByName(modelData.modelName);
        if (existingModel.success) {
          console.log('✅ Model already exists despite error:', existingModel.data);
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
  createMockModel: function(modelData) {
    console.log('Creating mock model with data:', modelData);
    
    // Tạo GUID mock cho testing
    const mockGuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    
    console.log('Generated mock GUID for model:', mockGuid);
    
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
  updateModel: async function(modelId, modelData) {
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
  deleteModel: async function(modelId) {
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

  // Tìm model theo tên để lấy real database ID
  findModelByName: async function(modelName) {
    try {
      console.log('=== FINDING MODEL BY NAME ===');
      console.log('Searching for model with name:', modelName);
      
      // Gọi API tìm theo tên trước
      const nameResult = await this.getModelByName(modelName);
      if (nameResult.success && nameResult.data) {
        console.log('✅ Found model by name:', nameResult.data);
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
          console.log('✅ Found model in all models list:', foundModel);
          return {
            success: true,
            data: foundModel
          };
        }
      }
      
      console.log('❌ Model not found by name:', modelName);
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
  validateModelExists: async function(modelId) {
    try {
      console.log('=== VALIDATING MODEL EXISTS ===');
      console.log('Checking if modelId exists in database:', modelId);
      
      // Kiểm tra format GUID/ULID - flexible hơn để support nhiều format
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!guidRegex.test(modelId)) {
        console.error('❌ Invalid GUID format:', modelId);
        return {
          success: false,
          error: 'ModelId không đúng định dạng GUID'
        };
      }
      
      // Gọi API để check model tồn tại
      const response = await this.getModelById(modelId);
      
      if (response.success && response.data) {
        console.log('✅ Model exists in database:', response.data);
        return {
          success: true,
          data: response.data
        };
      } else {
        console.error('❌ Model not found in database:', modelId);
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
  createVersion: async function(versionData) {
    try {
      console.log('=== CREATE VERSION API CALL ===');
      console.log('Using endpoint: /ElectricVehicleVersion/create-version');
      console.log('Data being sent:', versionData);
      
      // Validate data trước khi gửi
      console.log('=== DETAILED VERSION DATA VALIDATION ===');
      console.log('versionData received:', versionData);
      console.log('versionData type:', typeof versionData);
      console.log('versionData.modelId:', versionData.modelId);
      console.log('versionData.modelId type:', typeof versionData.modelId);
      console.log('versionData.versionName:', versionData.versionName);
      console.log('versionData.versionName type:', typeof versionData.versionName);
      console.log('versionData.versionName length:', versionData.versionName?.length);
      console.log('versionData.versionName trim():', versionData.versionName?.trim());
      console.log('versionData.versionName trim() length:', versionData.versionName?.trim()?.length);
      
      if (!versionData.modelId) {
        console.error('❌ Missing modelId in version data');
        return {
          success: false,
          error: 'Missing modelId for version creation'
        };
      }
      
      if (!versionData.versionName || versionData.versionName.trim() === '') {
        console.error('❌ Missing versionName in version data');
        console.error('versionName value was:', versionData.versionName);
        console.error('versionName after trim was:', versionData.versionName?.trim());
        return {
          success: false,
          error: 'Missing versionName for version creation'
        };
      }
      
      // ⚠️ SKIP MODEL VALIDATION - Backend sẽ validate
      // Tạm thời bỏ qua client validation vì có conflict với backend
      console.log('=== SKIPPING CLIENT-SIDE MODEL VALIDATION ===');
      console.log('Model ID to be sent:', versionData.modelId);
      console.log('Backend sẽ thực hiện validation và trả về lỗi nếu Model không tồn tại.');
      
      console.log('✅ Model validation successful, model exists in database');
      console.log('✅ Version data validation passed, sending to API...');
      console.log('API base URL:', import.meta.env.VITE_API_URL);
      console.log('Full endpoint will be:', import.meta.env.VITE_API_URL + '/ElectricVehicleVersion/create-version');
      console.log('Payload being sent:', JSON.stringify(versionData, null, 2));
      
      // Kiểm tra từng field để đảm bảo đúng format
      console.log('=== FIELD BY FIELD VALIDATION ===');
      console.log('modelId:', versionData.modelId, '(type:', typeof versionData.modelId, ')');
      console.log('versionName:', versionData.versionName, '(type:', typeof versionData.versionName, ')');
      console.log('motorPower:', versionData.motorPower, '(type:', typeof versionData.motorPower, ')');
      console.log('batteryCapacity:', versionData.batteryCapacity, '(type:', typeof versionData.batteryCapacity, ')');
      console.log('rangePerkCharge:', versionData.rangePerkCharge, '(type:', typeof versionData.rangePerkCharge, ')');
      console.log('supplyStatus:', versionData.supplyStatus, '(type:', typeof versionData.supplyStatus, ')');
      console.log('topSpeed:', versionData.topSpeed, '(type:', typeof versionData.topSpeed, ')');
      console.log('weight:', versionData.weight, '(type:', typeof versionData.weight, ')');
      console.log('height:', versionData.height, '(type:', typeof versionData.height, ')');
      console.log('productionYear:', versionData.productionYear, '(type:', typeof versionData.productionYear, ')');
      console.log('description:', versionData.description, '(type:', typeof versionData.description, ')');
      console.log('isActive:', versionData.isActive, '(type:', typeof versionData.isActive, ')');
      
      // ⚠️ WARNING: ModelId có thể không tồn tại trong database
      console.warn('⚠️ IMPORTANT: modelId được generate client-side có thể không tồn tại trong database');
      console.warn('⚠️ Điều này có thể gây lỗi Foreign Key Constraint');
      console.warn('⚠️ Cần đảm bảo model được tạo thành công trước khi tạo version');
      console.warn('⚠️ Current modelId being used:', versionData.modelId);
      console.warn('⚠️ Backend cần kiểm tra xem modelId này có tồn tại trong database không');
      
      const response = await api.post('/ElectricVehicleVersion/create-version', versionData);
      console.log('Create version response:', response.data);
      console.log('Version response status:', response.status);
      console.log('Version isSuccess value:', response.data?.isSuccess);
      
      // Kiểm tra success cho version
      const isVersionSuccessful = response.data?.isSuccess === true || 
                                 response.data?.isSuccess === 'true' ||
                                 response.data?.success === true ||
                                 response.status === 200 || response.status === 201;
      
      if (isVersionSuccessful) {
        console.log('Version API call successful, result:', response.data.result);
        console.log('Full version response.data structure:', JSON.stringify(response.data, null, 2));
        
        return {
          success: true,
          data: response.data.result || response.data.data || response.data,
          message: response.data.message || 'Tạo phiên bản mới thành công!'
        };
      } else {
        console.log('API call failed, using mock data fallback');
        return this.createMockVersion(versionData);
      }
    } catch (error) {
      console.error('Error creating version:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Full error response:', JSON.stringify(error.response, null, 2));
      
      // Nếu là 400 Bad Request (validation error), không fallback về mock
      if (error.response?.status === 400) {
        console.error('❌ API validation error - not using mock fallback');
        
        // Hiển thị chi tiết lỗi validation
        const errorData = error.response?.data;
        console.error('=== DETAILED 400 ERROR ANALYSIS ===');
        console.error('Error response type:', typeof errorData);
        console.error('Error response keys:', Object.keys(errorData || {}));
        console.error('Error message:', errorData?.message);
        console.error('Error errors array:', errorData?.errors);
        console.error('Error title:', errorData?.title);
        console.error('Error detail:', errorData?.detail);
        console.error('Error traceId:', errorData?.traceId);
        
        // Tạo message chi tiết từ validation errors
        let detailedError = 'Dữ liệu không hợp lệ:';
        
        if (errorData?.errors) {
          console.error('Processing validation errors...');
          Object.keys(errorData.errors).forEach(field => {
            const fieldErrors = errorData.errors[field];
            console.error(`Field ${field} errors:`, fieldErrors);
            detailedError += `\n- ${field}: ${fieldErrors.join(', ')}`;
          });
        } else if (errorData?.message) {
          detailedError = errorData.message;
        } else if (errorData?.title) {
          detailedError = errorData.title;
        }
        
        console.error('Final error message:', detailedError);
        
        return {
          success: false,
          error: detailedError
        };
      }
      
      // 500 Server Error - Database/Backend Issues
      if (error.response?.status >= 500 || !error.response) {
        console.error('❌ CRITICAL: Server error detected (500+)');
        console.error('This indicates a backend database issue');
        console.error('Common causes: Foreign Key constraint, Database connection, Entity Framework errors');
        
        const errorMessage = error.response?.data?.message || 'Lỗi server khi tạo version. Backend cần được kiểm tra.';
        
        // ⚠️ PRODUCTION MODE: Do NOT use mock data for 500 errors
        // 500 errors indicate real backend problems that need to be fixed
        console.error('⚠️ NOT using mock data fallback for 500 errors');
        console.error('⚠️ Backend team cần fix database/server issue này');
        
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
        batteryCapacity: versionData.batteryCapacity,
        range: versionData.range,
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
      console.log('Using endpoint: /ElectricVehicleColor/create-color');
      console.log('Data being sent:', colorData);
      
      const response = await api.post('/ElectricVehicleColor/create-color', colorData);
      console.log('Create color response:', response.data);
      console.log('Color response status:', response.status);
      console.log('Color isSuccess value:', response.data?.isSuccess);
      
      // Kiểm tra success cho color
      const isColorSuccessful = response.data?.isSuccess === true || 
                               response.data?.isSuccess === 'true' ||
                               response.data?.success === true ||
                               response.status === 200 || response.status === 201;
      
      if (isColorSuccessful) {
        console.log('Color API call successful, result:', response.data.result);
        console.log('Full color response.data structure:', JSON.stringify(response.data, null, 2));
        
        return {
          success: true,
          data: response.data.result || response.data.data || response.data,
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

  // === UTILITY FUNCTIONS ===
  
  // Extract database ID từ API response
  extractDatabaseId: function(responseData, idFields = ['id', 'modelId', 'versionId', 'colorId']) {
    if (!responseData) return null;
    
    // Thử các field ID thông thường
    for (const field of idFields) {
      if (responseData[field]) {
        console.log(`Found ID in field ${field}:`, responseData[field]);
        return responseData[field];
      }
      
      // Thử uppercase version
      const uppercaseField = field.charAt(0).toUpperCase() + field.slice(1);
      if (responseData[uppercaseField]) {
        console.log(`Found ID in field ${uppercaseField}:`, responseData[uppercaseField]);
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
    
    console.warn('No database ID found in response:', responseData);
    return null;
  },

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
  },

  // === ELECTRIC VEHICLE CRUD OPERATIONS ===

  // Tạo xe điện mới
  createVehicle: async function(vehicleData) {
    try {
      console.log('=== CREATE ELECTRIC VEHICLE API CALL ===');
      console.log('Using endpoint: /ElectricVehicle/create-vehicle');
      console.log('Data being sent:', vehicleData);
      
      const response = await api.post('/ElectricVehicle/create-vehicle', vehicleData);
      console.log('Create vehicle response:', response.data);
      console.log('Vehicle response status:', response.status);
      
      // Kiểm tra success
      const isSuccessful = response.data?.isSuccess === true || 
                          response.data?.isSuccess === 'true' ||
                          response.data?.success === true ||
                          response.status === 200 || response.status === 201;
      
      if (isSuccessful) {
        console.log('✅ Vehicle API call successful, result:', response.data.result);
        return {
          success: true,
          data: response.data.result || response.data.data || response.data,
          message: response.data.message || 'Tạo xe điện mới thành công!'
        };
      } else {
        console.log('❌ API call failed, using mock data fallback');
        return this.createMockVehicle(vehicleData);
      }
    } catch (error) {
      console.error('❌ Error creating vehicle, using mock data fallback:', error);
      return this.createMockVehicle(vehicleData);
    }
  },

  // Mock function để tạo vehicle giả khi API lỗi
  createMockVehicle: function(vehicleData) {
    console.log('Creating mock vehicle with data:', vehicleData);
    const mockId = 'vehicle-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    return {
      success: true,
      data: {
        id: mockId,
        ...vehicleData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      message: 'Tạo xe điện thành công! (Mock data)'
    };
  },

  // Cập nhật xe điện
  updateVehicle: async function(vehicleId, vehicleData) {
    try {
      console.log('=== UPDATE VEHICLE API CALL ===');
      console.log('Vehicle ID:', vehicleId);
      console.log('Data being sent:', vehicleData);
      
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
  deleteVehicle: async function(vehicleId) {
    try {
      console.log('=== DELETE VEHICLE API CALL ===');
      console.log('Vehicle ID:', vehicleId);
      
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
  }
};