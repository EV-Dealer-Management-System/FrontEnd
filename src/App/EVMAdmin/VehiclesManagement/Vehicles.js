// Vehicles.js - Business logic cho quản lý Vehicle của EVM Admin
import api from "../../../api/api";
import { normalizeApiResponse } from "../../../api/helpers/responseHelper";

export const vehicleApi = {
  // ✅ ĐÚNG: Chỉ GIỮ LẠI 1 hàm getAllVehicles - Gọi endpoint vehicles
  getAllVehicles: async function () {
    try {
      console.log("🔄 [API] Calling: /ElectricVehicle/get-all-vehicles");
      
      const response = await api.get("/ElectricVehicle/get-all-vehicles");
      
      console.log("📥 [API] getAllVehicles Response:", response.data);

      // ✅ Xử lý response đúng chuẩn
      if (response.data?.isSuccess) {
        const vehicles = response.data.result || response.data.data || [];
        console.log(`✅ [API] Loaded ${vehicles.length} vehicles`);
        
        return {
          success: true,
          result: vehicles, // ✅ Trả về ở result
          data: vehicles,   // ✅ Và cả data để tương thích
          message: response.data.message || "Lấy danh sách xe thành công",
        };
      } else {
        console.warn("⚠️ [API] API returned unsuccessful:", response.data);
        return {
          success: false,
          result: [],
          data: [],
          error: response.data?.message || "API không trả về dữ liệu hợp lệ",
        };
      }
    } catch (error) {
      console.error("❌ [API] Error fetching all vehicles:", error);
      console.error("❌ [API] Error response:", error.response?.data);
      
      return {
        success: false,
        result: [],
        data: [],
        error: error.response?.data?.message || error.message || "Lỗi khi tải danh sách xe",
      };
    }
  },

  // Helper function để combine vehicle data
  combineVehicleData: function (models, versions, colors) {
    const vehicles = [];

    models.forEach((model) => {
      const modelVersions = versions.filter((v) => v.modelId === model.id);

      modelVersions.forEach((version) => {
        const versionColors = colors.filter((c) => c.versionId === version.id);

        if (versionColors.length > 0) {
          versionColors.forEach((color) => {
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
              totalPrice: (version.price || 0) + (color.additionalPrice || 0),
            });
          });
        } else {
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
            colorName: "Chưa có màu",
            hexCode: "#CCCCCC",
            imageUrl: "https://picsum.photos/400/300?random=default",
            additionalPrice: 0,
            totalPrice: version.price || 0,
          });
        }
      });
    });

    return vehicles;
  },

  // === MODEL MANAGEMENT ===
  getAllModels: async function () {
    try {
      const response = await api.get("/ElectricVehicleModel/get-all-models");
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data || [],
        };
      } else {
        return {
          success: false,
          data: [],
          error: "API không trả về dữ liệu models hợp lệ",
        };
      }
    } catch (error) {
      console.error("Error getting models:", error);
      return {
        success: false,
        data: [],
        error: error.message || "Lỗi khi tải danh sách models",
      };
    }
  },

  // Tạo model mới
  createModel: async function (modelData) {
    try {
      const response = await api.post(
        "/ElectricVehicleModel/create-model",
        modelData
      );
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || "Tạo model mới thành công!",
        };
      } else {
        return {
          success: false,
          error: response.data?.message || "Không thể tạo model",
        };
      }
    } catch (error) {
      console.error("Error creating model:", error);
      return {
        success: false,
        error: error.message || "Lỗi khi tạo model",
      };
    }
  },
  updateModel: async function (modelId, modelData) {
    try {
      const response = await api.put(     
        `/ElectricVehicleModel/update-model/${modelId}`,
        modelData
      );
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || "Cập nhật model thành công!",
        };
      } else {
        return {
          success: false,
          error: response.data?.message || "Không thể cập nhật model",
        };
      }
    } catch (error) {
      console.error("Error updating model:", error);
      return {
        success: false,
        error: error.message || "Lỗi khi cập nhật model",
      };
    }
  },
 deleteModel: async function (modelId) {
    try {
      const response = await api.delete(     
        `/ElectricVehicleModel/delete-model/${modelId}`
      );
      if (response.data?.isSuccess) { 
        return {
          success: true,
          message: response.data.message || "Xóa model thành công!",
        };
      } else {
        return {
          success: false,   
          error: response.data?.message || "Không thể xóa model",
        };
      }   
    } catch (error) {
      console.error("Error deleting model:", error);
      return {
        success: false,
        error: error.message || "Lỗi khi xóa model",
      };
    }
  },

  // === VERSION MANAGEMENT ===
  getAllVersions: async function () {
    try {
      const response = await api.get(
        "/ElectricVehicleVersion/get-all-versions"
      );
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data || [],
        };
      } else {
        return {
          success: false,
          data: [],
          error: "API không trả về dữ liệu versions hợp lệ",
        };
      }
    } catch (error) {
      console.error("Error getting versions:", error);
      return {
        success: false,
        data: [],
        error: error.message || "Lỗi khi tải danh sách versions",
      };
    }
  },
// create version 
 createVersion: async function (versionData) {
    try {
      const response = await api.post(
        "/ElectricVehicleVersion/create-version",
        versionData
      );
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || "Tạo model mới thành công!",
        };
      } else {
        return {
          success: false,
          error: response.data?.message || "Không thể tạo version",
        };
      }
    } catch (error) {
      console.error("Error creating version:", error);
      return {
        success: false,
        error: error.message || "Lỗi khi tạo version",
      };
    }
  },
updateVersion: async function (versionId, versionData) {
    try {
      const response = await api.put( 
        `/ElectricVehicleVersion/update-version/${versionId}`,
        versionData
      );    
      if (response.data?.isSuccess) { 
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || "Cập nhật version thành công!",
        };
      } else {  
        return {
          success: false,
          error: response.data?.message || "Không thể cập nhật version",
        };
      } 
    } catch (error) {
      console.error("Error updating version:", error);
      return {
        success: false,
        error: error.message || "Lỗi khi cập nhật version",
      };
    } 
  },
  deleteVersion: async function (versionId) {
    try {
      const response = await api.delete(    

        `/ElectricVehicleVersion/detele-version-by-id/${versionId}`,
      );    
      if (response.data?.isSuccess) { 
        return {
          success: true,
          message: response.data.message || "Xóa version thành công!",
        };
      } else {   
        return {
          success: false, 
          error: response.data?.message || "Không thể xóa version",
        };
      } 
    } catch (error) {
      console.error("Error deleting version:", error);
      return {
        success: false,
        error: error.message || "Lỗi khi xóa version",
      };
    } 
  },  
getVersionByModelId: async function (modelId) {
    try {
      const response = await api.get(     
        `/ElectricVehicleVersion/get-all-available-versions-by-model-id/${modelId}`
      );
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data || [],
        };
      }
  else {
        return {
          success: false,
          data: [],
          error: "API không trả về dữ liệu versions hợp lệ",
        };
      }
    } catch (error) {
      console.error("Error getting versions by model ID:", error);
      return {
        success: false,
        data: [],
        error: error.message || "Lỗi khi tải danh sách versions",
      };
    } 
  },
  // === COLOR MANAGEMENT ===
  getAllColors: async function () {
    try {
      const response = await api.get("/ElectricVehicleColor/get-all-colors");
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data || [],
        };
      } else {
        return {
          success: false,
          data: [],
          error: "API không trả về dữ liệu colors hợp lệ",
        };
      }
    } catch (error) {
      console.error("Error getting colors:", error);
      return {
        success: false,
        data: [],
        error: error.message || "Lỗi khi tải danh sách colors",
      };
    }
  },
//create color 
 createColor: async function (colorData) {
    try {
      const response = await api.post(
        "/ElectricVehicleColor/create-color",
        colorData
      );
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || "Tạo color mới thành công!",
        };
      } else {
        return {
          success: false,
          error: response.data?.message || "Không thể tạo color",
        };
      }
    } catch (error) {
      console.error("Error creating color:", error);
      return {
        success: false,
        error: error.message || "Lỗi khi tạo color",
      };
    }
  },

  // === VEHICLE MANAGEMENT ===

  // Tạo xe mới
  createVehicle: async function (vehicleData) {
    try {
      console.log("=== CREATE VEHICLE API CALL ===");
      console.log("📤 Endpoint: /ElectricVehicle/create-vehicle");
      console.log("📤 Payload:", JSON.stringify(vehicleData, null, 2));

      // ✅ Kiểm tra các field bắt buộc
      if (!vehicleData.electricVehicleTemplateId) {
        throw new Error("❌ electricVehicleTemplateId is required!");
      }
      if (!vehicleData.warehouseId) {
        throw new Error("❌ warehouseId is required!");
      }
      if (!vehicleData.vinList || !Array.isArray(vehicleData.vinList) || vehicleData.vinList.length === 0) {
        throw new Error("❌ vinList is required and must be a non-empty array!");
      }

      const response = await api.post(
        "/ElectricVehicle/create-vehicle",
        vehicleData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("📥 API Response:", response.data);

      if (response.data?.isSuccess) {
        return {
          success: true,
          isSuccess: true,
          data: response.data.result || response.data.data,
          message: response.data.message || "Tạo xe thành công!",
        };
      } else {
        return {
          success: false,
          error: response.data?.message || "Không thể tạo xe",
        };
      }
    } catch (error) {
      console.error("❌ Error creating vehicle:", error);
      console.error("❌ Error response:", error.response?.data);

      return {
        success: false,
        error: error.response?.data?.message || error.message || "Lỗi khi tạo xe",
      };
    }
  },

  // Cập nhật xe
  updateVehicle: async function (vehicleId, vehicleData) {
    try {
      console.log("=== UPDATE VEHICLE API CALL ===");
      console.log("📤 Vehicle ID:", vehicleId);
      console.log("📤 Payload:", JSON.stringify(vehicleData, null, 2));

      const response = await api.put(
        `/ElectricVehicle/update-vehicle?vehicleId=${vehicleId}`,
        vehicleData
      );

      console.log("📥 API Response:", response.data);

      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || "Cập nhật xe thành công!",
        };
      } else {
        return {
          success: false,
          error: response.data?.message || "Không thể cập nhật xe",
        };
      }
    } catch (error) {
      console.error("❌ Error updating vehicle:", error);
      console.error("❌ Error response:", error.response?.data);

      return {
        success: false,
        error: error.response?.data?.message || error.message || "Lỗi khi cập nhật xe",
      };
    }
  },

  // === WAREHOUSE MANAGEMENT ===
  getAllWarehouses: async () => {
    try {
      const endpoint = "/Warehouse/get-all-warehouses";
      const response = await api.get(endpoint);

      const isSuccessful =
        response.data?.isSuccess === true || response.status === 200;

      if (isSuccessful && response.data?.result) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || "Lấy danh sách kho thành công!",
        };
      } else {
        return {
          success: false,
          error: response.data.message || "Không thể lấy danh sách kho",
        };
      }
    } catch (error) {
      console.error("Error getting warehouses:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể lấy danh sách kho.",
      };
    }
  },

  // === TEMPLATE MANAGEMENT ===
  getTemplateByVersionAndColor: async function (versionId, colorId) {
    try {
      const response = await api.get(
        `/EVTemplate/get-template-by-version-and-color/${versionId}/${colorId}`
      );
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || "Lấy template thành công",
        };
      } else {
        return {
          success: false,
          error: response.data?.message || "Không tìm thấy template",
        };
      }
    } catch (error) {
      console.error("Error getting template by version and color:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Lỗi khi lấy template",
      };
    }
  },

  // Lấy tất cả templates
  getAllTemplateVehicles: async function () {
    try {
      console.log("🔄 [API] Calling: /EVTemplate/Get-all-template-vehicles");
      
      const response = await api.get("/EVTemplate/Get-all-template-vehicles");
      
      console.log("📥 [API] getAllTemplateVehicles Response:", response.data);
      
      if (response.data?.isSuccess) {
        const templates = response.data.result || response.data.data || [];
        console.log(`✅ [API] Loaded ${templates.length} templates`);
        
        return {
          success: true,
          data: templates,
          message: response.data.message || "Lấy danh sách template thành công",
        };
      } else {
        return {
          success: false,
          data: [],
          error: "API không trả về dữ liệu templates hợp lệ",
        };
      }
    } catch (error) {
      console.error("❌ [API] Error getting all templates:", error);
      return {
        success: false,
        data: [],
        error: error.message || "Lỗi khi tải danh sách templates",
      };
    }
  },

  // Tạo template vehicle mới
  createTemplateVehicle: async function (templateData) {
    try {
      console.log("=== CREATE TEMPLATE VEHICLE API CALL ===");
      console.log("📤 Endpoint: /EVTemplate/create-template-vehicles");
      console.log("📤 Payload:", JSON.stringify(templateData, null, 2));

      const response = await api.post(
        "/EVTemplate/create-template-vehicles",
        templateData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("📥 API Response:", response.data);
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || "Tạo template thành công!",
        };
      } else {
        return {
          success: false,
          error: response.data?.message || "Không thể tạo template",
        };
      }
    } catch (error) {
      console.error("❌ Error creating template:", error);
      console.error("❌ Error response:", error.response?.data);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Lỗi khi tạo template",
      };
    }
  },

  // Cập nhật template
  updateTemplateVehicle: async function (templateId, templateData) {
    try {
      const response = await api.put(
        `/EVTemplate/update-template-vehicle/${templateId}`,
        templateData
      );
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.result || response.data.data,
          message: response.data.message || "Cập nhật template thành công!",
        };
      } else {
        return {
          success: false,
          error: response.data?.message || "Không thể cập nhật template",
        };
      }
    } catch (error) {
      console.error("Error updating template:", error);
      return {
        success: false,
        error: error.message || "Lỗi khi cập nhật template",
      };
    }
  },

  // Xóa template
  deleteTemplateVehicle: async function (templateId) {
    try {
      const response = await api.delete(
        `/EVTemplate/delete-template/${templateId}`
      );
      
      if (response.data?.isSuccess) {
        return {
          success: true,
          message: response.data.message || "Xóa template thành công!",
        };
      } else {
        return {
          success: false,
          error: response.data?.message || "Không thể xóa template",
        };
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      return {
        success: false,
        error: error.message || "Lỗi khi xóa template",
      };
    }
  },

  // === IMAGE UPLOAD SERVICES ===
  ElectricVehicleImageService: {
    async uploadSingleImage(file) {
      try {
        const contentType = this.detectContentType(file.name);

        const { data } = await api.post(
          "/ElectricVehicle/upload-file-url-electric-vehicle",
          { fileName: file.name, contentType },
          { headers: { "Content-Type": "application/json" } }
        );

        if (!data?.isSuccess || !data?.result) {
          throw new Error(data?.message || "Không thể lấy URL upload");
        }

        const uploadUrl =
          typeof data.result === "string"
            ? data.result
            : data.result.uploadUrl || "";

        const objectKey =
          typeof data.result === "object"
            ? data.result.objectKey || file.name
            : file.name;

        if (!uploadUrl) throw new Error("Pre-signed URL không hợp lệ");
        const response = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": contentType },
          body: file,
        });

        if (!response.ok)
          throw new Error(`Upload thất bại: ${response.status}`);

        console.log(`✅ Uploaded ${file.name} → key: ${objectKey}`);
        return objectKey;
      } catch (err) {
        console.error("❌ Upload ảnh lỗi:", err);
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
          const fallbackKey = `fallback-${Date.now()}-${file.name.replace(
            /[^a-zA-Z0-9]/g,
            ""
          )}`;
          keys.push(fallbackKey);
          console.log(`🔄 Using fallback key: ${fallbackKey}`);
        }
      }

      console.log("📦 Final attachment keys:", keys);
      return keys.length > 0 ? keys : [`default-key-${Date.now()}`];
    },

    detectContentType(fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase();
      const types = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp'
      };
      return types[ext] || 'application/octet-stream';
    }
  },

  uploadImageAndGetKey: async (file) => {
    try {
      const { data } = await api.post("/ElectricVehicle/upload-file-url-electric-vehicle", {
        fileName: file.name,
        contentType: file.type,
      });

      const uploadUrl = data?.result?.uploadUrl;
      const objectKey = data?.result?.objectKey;

      if (!uploadUrl || !objectKey) throw new Error("Thiếu uploadUrl hoặc objectKey");

      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      console.log("✅ Upload thành công:", objectKey);
      return objectKey;
    } catch (err) {
      console.error("❌ Upload lỗi:", err);
      return null;
    }
  },
};
