import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
  Typography,
  Divider,
  Alert,
  App,
  Steps,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CarOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { vehicleApi } from "../../../../App/EVMAdmin/VehiclesManagement/Vehicles";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Helper functions cho VIN
const VIN_CHARS = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789"; // Không có I, O, Q

const generateSampleVIN = () => {
  let vin = "";
  for (let i = 0; i < 17; i++) {
    vin += VIN_CHARS[Math.floor(Math.random() * VIN_CHARS.length)];
  }
  return vin;
};

const validateVIN = (vin) => {
  if (!vin || vin.length !== 17) return false;
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
};

function CreateElectricVehicle() {
  // TODO: Migrate to App.useApp() when refactoring component
  // const { message, modal } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [versions, setVersions] = useState([]);
  const [colors, setColors] = useState([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({}); // State để lưu form data giữa các steps
  const [uploadedImages, setUploadedImages] = useState([]); // State cho uploaded images (for display)
  const [attachmentKeys, setAttachmentKeys] = useState([]); // State cho attachment keys (flow mới)
  const [isUploading, setIsUploading] = useState(false); // State cho trạng thái upload
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [vehicleImagesVisible, setVehicleImagesVisible] = useState(false);
  const [selectedVehicleImages, setSelectedVehicleImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // Load data khi component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Tải toàn bộ dữ liệu cần thiết
  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadVehicles(),
        loadWarehouses(),
        loadVersions(),
        loadColors(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tải danh sách xe điện
  const loadVehicles = async () => {
    try {
      console.log("=== LOADING VEHICLES ===");
      const result = await vehicleApi.getAllVehicles();

      if (result.success) {
        console.log("✅ Vehicles loaded successfully:", result.data);
        setVehicles(result.data || []);
      } else {
        console.error("❌ Failed to load vehicles:", result.error);
        setVehicles([]);
      }
    } catch (error) {
      console.error("Error loading vehicles:", error);
      setVehicles([]);
    }
  };

  // Tải danh sách kho từ API thực
  const loadWarehouses = async () => {
    try {
      console.log("🔍 Loading warehouses from API...");

      // Kiểm tra method có tồn tại không
      if (!vehicleApi.getAllWarehouses) {
        console.error(
          "❌ getAllWarehouses method not found, using getInventoryById fallback"
        );
        const fallbackResult = await vehicleApi.getInventoryById();
        console.log("📦 Fallback API response:", fallbackResult);

        if (fallbackResult.success && fallbackResult.data) {
          const formattedWarehouses = fallbackResult.data.map(
            (warehouse, index) => ({
              id: warehouse.id,
              name: warehouse.dealerId || `Warehouse #${index + 1}`,
              displayName: `${
                warehouse.dealerId || `Warehouse #${index + 1}`
              } (Type: ${warehouse.warehouseType || 2})`,
            })
          );
          setWarehouses(formattedWarehouses);
          console.log(
            "✅ Loaded warehouses from fallback:",
            formattedWarehouses
          );
          return;
        }
      }

      // Gọi API get all warehouses - dùng method mới
      const result = await vehicleApi.getAllWarehouses();
      console.log("📦 Warehouse API response:", result);
      console.log("📦 Response type:", typeof result);
      console.log("📦 Has success prop:", result.hasOwnProperty("success"));
      console.log("📦 Has data prop:", result.hasOwnProperty("data"));

      if (result && result.success && result.data) {
        console.log("✅ Loaded warehouses from API:", result.data);
        console.log("✅ Data type:", typeof result.data);
        console.log("✅ Is array:", Array.isArray(result.data));

        // Format data theo structure từ attachment - hiển thị thông tin rõ ràng hơn
        const formattedWarehouses = result.data.map((warehouse, index) => ({
          id: warehouse.id, // GUID từ API
          name: warehouse.dealerId
            ? `Dealer: ${warehouse.dealerId}`
            : `Warehouse #${index + 1}`, // Tên kho rõ ràng hơn
          evInventoryId: warehouse.evInventoryId, // Inventory ID
          warehouseType: warehouse.warehouseType || 2, // Type từ API
          displayName: `${
            warehouse.dealerId || `Warehouse #${index + 1}`
          } (Type: ${warehouse.warehouseType || 2})`, // For dropdown display
        }));

        setWarehouses(formattedWarehouses);
        console.log("✅ Formatted warehouses for Select:", formattedWarehouses);
      } else {
        console.log("❌ No warehouses returned from API or API call failed");
        console.log("📝 Adding mock data for testing...");

        // Thêm mock data để test khi API chưa sẵn sàng
        const mockWarehouses = [
          {
            id: "0199d3ef-5fd1-7f77-84f7-89140441fc52",
            name: "Test Warehouse 1",
            displayName: "Test Warehouse 1 (Type: 2)",
          },
          {
            id: "0199d3ef-ddd1-789f-a4eb-26f47fee63a8",
            name: "Test Warehouse 2",
            displayName: "Test Warehouse 2 (Type: 2)",
          },
        ];

        setWarehouses(mockWarehouses);
        console.log("✅ Added mock warehouses for testing:", mockWarehouses);
        message.warning(
          "Đang dùng dữ liệu test. API warehouses có thể chưa sẵn sàng."
        );
      }
    } catch (error) {
      console.error("❌ Error loading warehouses:", error);
      console.log("📝 Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      // Fallback với mock data khi có lỗi
      console.log("🔄 Using mock data as fallback...");
      const mockWarehouses = [
        {
          id: "0199d3ef-5fd1-7f77-84f7-89140441fc52",
          name: "Test Warehouse 1",
          displayName: "Test Warehouse 1 (Type: 2)",
        },
        {
          id: "0199d3ef-ddd1-789f-a4eb-26f47fee63a8",
          name: "Test Warehouse 2",
          displayName: "Test Warehouse 2 (Type: 2)",
        },
      ];

      setWarehouses(mockWarehouses);
      console.log("✅ Fallback mock warehouses loaded");
      message.warning("Lỗi API. Đang dùng dữ liệu test để tiếp tục.");
    }
  };

  // Tải danh sách versions
  const loadVersions = async () => {
    try {
      console.log("📋 Loading versions...");
      const result = await vehicleApi.getAllVersions();
      console.log("📋 Versions API response:", result);

      if (result.success && result.data) {
        setVersions(result.data);
        console.log("✅ Loaded versions:", result.data);
      } else {
        console.log("⚠️ No versions found, using empty array");
        setVersions([]);
      }
    } catch (error) {
      console.error("❌ Error loading versions:", error);
      setVersions([]);
    }
  };

  // Tải danh sách màu sắc
  const loadColors = async () => {
    try {
      console.log("🌈 Loading colors...");
      const result = await vehicleApi.getAllColors();
      console.log("🌈 Colors API response:", result);

      if (result.success && result.data) {
        setColors(result.data);
        console.log("✅ Loaded colors:", result.data);
      } else {
        console.log("⚠️ No colors found, using empty array");
        setColors([]);
      }
    } catch (error) {
      console.error("❌ Error loading colors:", error);
      setColors([]);
    }
  };

  // Function đã được move lên trên

  // Xem chi tiết xe
  const handleViewVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsViewModalVisible(true);
  };

  // Xem ảnh của xe
  const handleViewImages = async (vehicle) => {
    setLoadingImages(true);
    setVehicleImagesVisible(true);
    setSelectedVehicleImages([]);

    try {
      console.log("📷 Loading images for vehicle:", vehicle.vin);

      // Gọi API để lấy ảnh của xe
      const response = await vehicleApi.getVehicleImages(vehicle.id);

      if (response.success && response.images) {
        setSelectedVehicleImages(response.images);
        console.log("✅ Loaded vehicle images:", response.images);
      } else {
        // Nếu không có ảnh hoặc API lỗi, hiển thị thông báo
        console.log("⚠️ No images found for vehicle");
        message.info(`Xe ${vehicle.vin} chưa có ảnh nào.`);
        setSelectedVehicleImages([]);
      }
    } catch (error) {
      console.error("❌ Error loading vehicle images:", error);
      message.error("Không thể tải ảnh của xe. Vui lòng thử lại.");
      setSelectedVehicleImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  // Xóa xe
  const handleDeleteVehicle = async (vehicleId) => {
    setLoading(true);
    try {
      console.log("=== DELETING VEHICLE ===");
      console.log("Vehicle ID:", vehicleId);

      const result = await vehicleApi.deleteVehicle(vehicleId);
      console.log("Delete result:", result);

      if (result.success) {
        message.success("Xóa xe điện thành công!");
        await loadVehicles();
      } else {
        message.error(result.error || "Không thể xóa xe điện");
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      message.error("Lỗi khi xóa xe điện");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý submit form tạo xe
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log("=== CREATING ELECTRIC VEHICLE ===");

      // Lưu form data cuối cùng
      const finalFormData = { ...formData, ...values };
      console.log("Final form data:", finalFormData);
      console.log("Uploaded images:", uploadedImages);

      // Validate critical data với chi tiết
      console.log("🔍 Available warehouses:", warehouses);
      console.log("🏢 Selected warehouseId:", finalFormData.warehouseId);
      console.log("🚗 Selected versionId:", finalFormData.versionId);
      console.log("🎨 Selected colorId:", finalFormData.colorId);

      // Chi tiết về versions và colors được chọn
      const selectedVersion = versions.find(
        (v) => v.id === finalFormData.versionId
      );
      const selectedColor = colors.find((c) => c.id === finalFormData.colorId);
      console.log("📋 Selected Version Object:", selectedVersion);
      console.log("🎨 Selected Color Object:", selectedColor);
      console.log("📊 All Available Versions:", versions);
      console.log("🌈 All Available Colors:", colors);

      // Prepare data theo API schema
      const vehicleData = {
        warehouseId: finalFormData.warehouseId, // Lấy từ form, bắt buộc phải chọn
        versionId: finalFormData.versionId,
        colorId: finalFormData.colorId,
        vin: finalFormData.vin,
        status: finalFormData.status || 1, // Lấy từ form hoặc mặc định 1
        manufactureDate: finalFormData.manufactureDate?.format
          ? finalFormData.manufactureDate.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
          : finalFormData.manufactureDate,
        importDate: finalFormData.importDate?.format
          ? finalFormData.importDate.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
          : finalFormData.importDate,
        warrantyExpiryDate: finalFormData.warrantyExpiryDate?.format
          ? finalFormData.warrantyExpiryDate.format(
              "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
            )
          : finalFormData.warrantyExpiryDate,
        costPrice: Number(finalFormData.costPrice) || 0, // Đảm bảo là number
      };

      // Step 1: TEMP - Skip image validation for testing
      console.log("🧪 TESTING MODE: Skipping image validation");
      console.log("  - uploadedImages length:", uploadedImages.length);
      console.log("  - attachmentKeys length:", attachmentKeys.length);

      // TEMP: Comment out image validation
      /*
      if (uploadedImages.length > 0 && attachmentKeys.length === 0) {
        message.warning(
          "⚠️ Bạn đã chọn ảnh nhưng chưa upload! Vui lòng click 'Upload ảnh' trước khi tạo xe."
        );
        setLoading(false);
        return;
      }
      */

      // Step 2: Sử dụng attachment keys đã lưu trong state (Flow mới - đơn giản!)
      console.log("🔑 Using attachment keys from state:", attachmentKeys);

      if (attachmentKeys.length > 0) {
        console.log(
          `📸 Found ${attachmentKeys.length} attachment keys from uploaded images`
        );
      } else {
        console.log("📷 No images uploaded (attachmentKeys empty)");
      }

      // TEMP: Set attachmentKeys to empty array for testing (ignore images)
      console.log("🧪 TESTING MODE: Setting attachmentKeys to empty array");
      vehicleData.attachmentKeys = []; // Force empty for testing

      console.log("🔍 Final Vehicle Data to be sent:", vehicleData);
      console.log(
        "🔍 AttachmentKeys to send (TEMP EMPTY):",
        vehicleData.attachmentKeys
      );

      // Validate data format trước khi gửi
      console.log("🔍 Data Validation:");
      console.log(
        "  - warehouseId:",
        vehicleData.warehouseId,
        typeof vehicleData.warehouseId
      );
      console.log(
        "  - versionId:",
        vehicleData.versionId,
        typeof vehicleData.versionId
      );
      console.log(
        "  - colorId:",
        vehicleData.colorId,
        typeof vehicleData.colorId
      );
      console.log("  - vin:", vehicleData.vin, typeof vehicleData.vin);
      console.log("  - status:", vehicleData.status, typeof vehicleData.status);
      console.log(
        "  - costPrice:",
        vehicleData.costPrice,
        typeof vehicleData.costPrice
      );
      console.log(
        "  - imageUrl:",
        vehicleData.imageUrl,
        typeof vehicleData.imageUrl
      );
      console.log(
        "  - attachmentKeys:",
        vehicleData.attachmentKeys,
        `(${vehicleData.attachmentKeys?.length || 0} keys)`
      );
      console.log("  - manufactureDate:", vehicleData.manufactureDate);
      console.log("  - importDate:", vehicleData.importDate);
      console.log("  - warrantyExpiryDate:", vehicleData.warrantyExpiryDate);

      // So sánh với Backend Schema từ Swagger API
      console.log("📋 SWAGGER API SCHEMA COMPARISON:");
      console.log("Expected backend format (from Swagger):", {
        warehouseId: "3fa85f64-5717-4562-b3fc-2c963f66afa6 (GUID)",
        versionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6 (GUID)",
        colorId: "3fa85f64-5717-4562-b3fc-2c963f66afa6 (GUID)",
        vin: "string",
        status: "1 (number)",
        manufactureDate: "2025-10-16T17:00:44.815Z (ISO with milliseconds)",
        importDate: "2025-10-16T17:00:44.815Z (ISO with milliseconds)",
        warrantyExpiryDate: "2025-10-16T17:00:44.815Z (ISO with milliseconds)",
        costPrice: "0 (number)",
        attachmentKeys: ["string array"],
      });
      console.log(
        "Actual frontend data matches:",
        JSON.stringify(vehicleData, null, 2)
      );

      // Validation trước khi gửi
      if (!vehicleData.warehouseId) {
        message.error("Vui lòng chọn kho!");
        setLoading(false);
        return;
      }

      if (!vehicleData.versionId) {
        message.error("Vui lòng chọn phiên bản xe!");
        setLoading(false);
        return;
      }

      if (!vehicleData.colorId) {
        message.error("Vui lòng chọn màu sắc!");
        setLoading(false);
        return;
      }

      if (!vehicleData.vin) {
        message.error("Vui lòng nhập VIN!");
        setLoading(false);
        return;
      }

      // Validate GUID format cho IDs
      const guidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (!guidRegex.test(vehicleData.versionId)) {
        console.error("❌ Invalid versionId format:", vehicleData.versionId);
        message.error("Version ID không đúng format GUID!");
        setLoading(false);
        return;
      }

      if (!guidRegex.test(vehicleData.colorId)) {
        console.error("❌ Invalid colorId format:", vehicleData.colorId);
        message.error("Color ID không đúng format GUID!");
        setLoading(false);
        return;
      }

      if (!guidRegex.test(vehicleData.warehouseId)) {
        console.error(
          "❌ Invalid warehouseId format:",
          vehicleData.warehouseId
        );
        message.error("Warehouse ID không đúng format GUID!");
        setLoading(false);
        return;
      }

      console.log("✅ All validations passed, proceeding with API call...");

      const result = await vehicleApi.createVehicle(vehicleData);
      console.log("Create result:", result);

      if (result.success) {
        message.success(result.message || "Tạo xe điện mới thành công!");

        // Hiển thị thông tin xe vừa tạo
        const selectedVersion = versions.find(
          (v) => v.id === finalFormData.versionId
        );
        const selectedColor = colors.find(
          (c) => c.id === finalFormData.colorId
        );
        const selectedWarehouse = warehouses.find(
          (w) => w.id === finalFormData.warehouseId
        );

        console.log("🎉 Vehicle created successfully:");
        console.log("  - Result:", result);
        console.log("  - Selected Version:", selectedVersion);
        console.log("  - Selected Color:", selectedColor);

        Modal.success({
          title: (
            <Space>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
              Tạo Xe Điện thành công!
            </Space>
          ),
          content: (
            <div style={{ marginTop: 16 }}>
              <Alert
                message="Thông tin Xe Điện"
                description={
                  <div>
                    <p>
                      <strong>VIN:</strong> {vehicleData.vin}
                    </p>
                    <p>
                      <strong>Version:</strong>{" "}
                      {selectedVersion?.versionName || "N/A"}
                    </p>
                    <p>
                      <strong>Màu sắc:</strong>{" "}
                      {selectedColor?.colorName || "N/A"}
                    </p>
                    <p>
                      <strong>Kho:</strong> {selectedWarehouse?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Giá cost:</strong>{" "}
                      {vehicleData.costPrice?.toLocaleString("vi-VN")} ₫
                    </p>
                    <p>
                      <strong>Trạng thái:</strong>{" "}
                      {vehicleData.status === 1
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </p>
                    {result.data?.id && (
                      <p>
                        <strong>Vehicle ID:</strong>
                        <Text code copyable style={{ marginLeft: 8 }}>
                          {result.data.id}
                        </Text>
                      </p>
                    )}
                  </div>
                }
                type="success"
                showIcon
              />
            </div>
          ),
          width: 600,
        });

        setIsCreateModalVisible(false);
        form.resetFields();
        setFormData({});
        setUploadedImages([]);
        setAttachmentKeys([]); // Reset attachment keys sau khi tạo thành công
        setIsUploading(false); // Reset upload status
        setPreviewVisible(false); // Reset preview modal
        setPreviewImage("");
        setPreviewTitle("");
        setVehicleImagesVisible(false); // Reset vehicle images modal
        setSelectedVehicleImages([]);
        setLoadingImages(false);
        await loadVehicles();
      } else {
        console.error("❌ Submit failed:", result.error);
        message.error(result.error || "Không thể tạo xe điện");
      }
    } catch (error) {
      console.error("Error creating vehicle:", error);
      message.error("Lỗi khi tạo xe điện");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chuyển step với validation
  const handleNextStep = async () => {
    try {
      // Validate các fields cần thiết cho step hiện tại
      const fieldsToValidate = getRequiredFieldsForStep(currentStep);

      // Validate form fields cho step hiện tại
      await form.validateFields(fieldsToValidate);

      // Lưu form data hiện tại vào state
      const currentFormValues = form.getFieldsValue();
      const updatedFormData = { ...formData, ...currentFormValues };
      setFormData(updatedFormData);

      console.log("✅ Step validation passed, moving to next step");
      console.log("Current form values:", currentFormValues);
      console.log("Updated form data:", updatedFormData);

      // Chuyển sang step tiếp theo
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error("❌ Step validation failed:", error);
      message.error(
        "Vui lòng điền đầy đủ thông tin bắt buộc trước khi tiếp tục!"
      );
    }
  };

  // Batch upload nhiều ảnh và lấy keys (Flow mới)
  const handleBatchImageUpload = async (files) => {
    // Validate files
    const validFiles = [];
    for (const file of files) {
      // Validate file type
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error(`${file.name} không phải file hình ảnh!`);
        continue;
      }

      // Validate file size (10MB max)
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error(`${file.name} quá lớn (>10MB)!`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      message.error("Không có file hợp lệ để upload!");
      return;
    }

    setIsUploading(true);

    try {
      console.log(
        `📤 Starting batch upload for ${validFiles.length} images...`
      );

      // Gọi API batch upload để lấy keys
      const uploadResult = await vehicleApi.uploadMultipleImagesForKeys(
        validFiles
      );

      if (uploadResult.success) {
        // Lưu attachment keys vào state
        setAttachmentKeys(uploadResult.keys);
        console.log("✅ Batch upload successful, keys:", uploadResult.keys);

        message.success(
          `🎉 Upload thành công ${validFiles.length} ảnh! Keys đã được lưu.`
        );
      } else {
        throw new Error(uploadResult.error);
      }
    } catch (error) {
      console.error("❌ Batch upload error:", error);
      message.error(`Lỗi batch upload: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Xử lý thay đổi danh sách file (Upload ngay khi chọn)
  const handleImageUpload = ({ fileList }) => {
    console.log("📝 File list changed:", fileList.length);

    // Cập nhật file list để hiển thị
    setUploadedImages(fileList);

    // Lấy các file mới từ fileList
    const newFiles = fileList
      .filter((file) => file.originFileObj && file.status !== "done")
      .map((file) => file.originFileObj);

    // Nếu có file mới, thực hiện batch upload
    if (newFiles.length > 0) {
      handleBatchImageUpload(newFiles);
    }
  };

  // Custom upload function - Không upload thật, chỉ để UI hoạt động
  const customUpload = ({ file, onSuccess }) => {
    // Mock upload success để UI hoạt động bình thường
    setTimeout(() => {
      onSuccess("ok");
    }, 100);
  }; // Xử lý preview ảnh
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj || file);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };

  // Convert file to base64 cho preview
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Xử lý xóa ảnh
  const handleRemove = (file) => {
    // Tìm index của ảnh trong danh sách để xóa attachment key tương ứng
    const fileIndex = uploadedImages.findIndex((img) => img.uid === file.uid);
    if (fileIndex !== -1 && attachmentKeys[fileIndex]) {
      // Xóa attachment key tương ứng
      const newKeys = [...attachmentKeys];
      const removedKey = newKeys.splice(fileIndex, 1)[0];
      setAttachmentKeys(newKeys);
      console.log("🗑️ Removed attachment key:", removedKey);
    }
    return true; // Cho phép xóa
  };

  // Reset form và data khi mở modal
  const handleCreateVehicle = () => {
    setCurrentStep(0);
    setFormData({});
    setUploadedImages([]);
    setAttachmentKeys([]); // Reset attachment keys
    setIsUploading(false); // Reset upload status
    setPreviewVisible(false); // Reset preview modal
    setPreviewImage("");
    setPreviewTitle("");
    setVehicleImagesVisible(false); // Reset vehicle images modal
    setSelectedVehicleImages([]);
    setLoadingImages(false);
    form.resetFields();
    form.setFieldsValue({
      status: 1, // Mặc định trạng thái hoạt động
      costPrice: 0,
      manufactureDate: dayjs(),
      importDate: dayjs(),
      warrantyExpiryDate: dayjs().add(2, "year"),
    });
    setIsCreateModalVisible(true);
  };

  // Lấy danh sách fields cần validate cho mỗi step
  const getRequiredFieldsForStep = (step) => {
    switch (step) {
      case 0: // Thông tin cơ bản
        return ["vin", "versionId", "colorId", "warehouseId"]; // Thêm lại warehouseId
      case 1: // Thông tin kỹ thuật
        return [
          "costPrice",
          "manufactureDate",
          "importDate",
          "warrantyExpiryDate",
        ];
      default:
        return [];
    }
  };

  // Steps cho wizard tạo xe
  const steps = [
    {
      title: "Thông tin cơ bản",
      content: "basic-info",
    },
    {
      title: "Thông tin kỹ thuật",
      content: "technical-info",
    },
    {
      title: "Xác nhận",
      content: "confirm",
    },
  ];

  // Columns cho table
  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "VIN",
      dataIndex: "vin",
      key: "vin",
      width: 150,
      render: (text) => (
        <Text code strong style={{ fontSize: 12 }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Version",
      dataIndex: "versionId",
      key: "versionId",
      width: 120,
      render: (versionId) => {
        const version = versions.find((v) => v.id === versionId);
        return version ? (
          <Tag color="blue">{version.versionName}</Tag>
        ) : (
          <Tag color="default">N/A</Tag>
        );
      },
    },
    {
      title: "Màu sắc",
      dataIndex: "colorId",
      key: "colorId",
      width: 120,
      render: (colorId) => {
        const color = colors.find((c) => c.id === colorId);
        return color ? (
          <Space>
            <div
              style={{
                width: 20,
                height: 20,
                backgroundColor: color.colorCode,
                borderRadius: "50%",
                border: "1px solid #d9d9d9",
              }}
            />
            <span>{color.colorName}</span>
          </Space>
        ) : (
          <Tag color="default">N/A</Tag>
        );
      },
    },
    {
      title: "Kho",
      dataIndex: "warehouseId",
      key: "warehouseId",
      width: 100,
      render: (warehouseId) => {
        const warehouse = warehouses.find((w) => w.id === warehouseId);
        return warehouse ? (
          <Tag color="green">{warehouse.name}</Tag>
        ) : (
          <Tag color="default">N/A</Tag>
        );
      },
    },
    {
      title: "Giá cost",
      dataIndex: "costPrice",
      key: "costPrice",
      width: 120,
      render: (price) => (
        <Text strong>
          {price ? price.toLocaleString("vi-VN") + " ₫" : "N/A"}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={status === 1 ? "success" : "error"}>
          {status === 1 ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Ngày sản xuất",
      dataIndex: "manufactureDate",
      key: "manufactureDate",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
    },
    {
      title: "Hình ảnh",
      key: "images",
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewImages(record)}
        >
          Xem ảnh
        </Button>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewVehicle(record)}
          >
            Xem
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa xe điện này?"
            onConfirm={() => handleDeleteVehicle(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Tạo & Quản lý Xe Điện"
      subTitle="Tạo mới và quản lý toàn bộ xe điện trong hệ thống"
      extra={[
        <Button
          key="reload"
          icon={<ReloadOutlined />}
          onClick={loadAllData}
          loading={loading}
        >
          Tải lại
        </Button>,
        <Button
          key="create"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateVehicle}
          size="large"
        >
          Tạo Xe Điện
        </Button>,
      ]}
    >
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Title level={4}>
                <CarOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                Danh sách Xe Điện
              </Title>
              <Text type="secondary">
                Quản lý toàn bộ xe điện trong hệ thống. Tổng cộng:{" "}
                {vehicles.length} xe
              </Text>

              {/* Test API Button */}
              <Button
                type="dashed"
                size="small"
                onClick={async () => {
                  console.log("Testing API connection...");
                  message.info("Đang kiểm tra kết nối API...");
                  try {
                    const result = await vehicleApi.getAllVehicles();
                    if (result.success) {
                      message.success("API kết nối thành công!");
                    } else {
                      message.error(
                        "API kết nối thất bại. Kiểm tra console để xem chi tiết."
                      );
                    }
                  } catch (error) {
                    message.error(
                      "API kết nối thất bại. Kiểm tra console để xem chi tiết."
                    );
                  }
                }}
              >
                Test API Connection
              </Button>
            </Space>
          </Col>
        </Row>

        <Divider />

        <Table
          columns={columns}
          dataSource={vehicles}
          rowKey="id"
          loading={loading}
          pagination={{
            total: vehicles.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} xe`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal tạo xe điện */}
      <Modal
        title={
          <Space>
            <CarOutlined style={{ color: "#1890ff" }} />
            Tạo Xe Điện Mới
          </Space>
        }
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          form.resetFields();
          setCurrentStep(0);
        }}
        footer={null}
        width={900}
      >
        <Divider />

        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          {steps.map((item) => (
            <Steps.Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          preserve={false}
        >
          {/* Step 1: Thông tin cơ bản */}
          {currentStep === 0 && (
            <div>
              <Title level={5}>
                <InfoCircleOutlined style={{ marginRight: 8 }} />
                Thông tin cơ bản
              </Title>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="VIN (Vehicle Identification Number)"
                    name="vin"
                    rules={[
                      { required: true, message: "Vui lòng nhập VIN!" },
                      {
                        min: 17,
                        max: 17,
                        message: "VIN phải có đúng 17 ký tự!",
                      },
                      {
                        pattern: /^[A-HJ-NPR-Z0-9]{17}$/,
                        message:
                          "VIN không đúng định dạng! Chỉ được sử dụng A-H, J-N, P-R, T-Z, 0-9 (không có I, O, Q)",
                      },
                    ]}
                    extra={
                      <div style={{ fontSize: 12, color: "#666" }}>
                        <strong>Quy tắc VIN:</strong>
                        <br />• Đúng 17 ký tự
                        <br />• Chỉ sử dụng: A-H, J-N, P-R, T-Z, 0-9
                        <br />• Không được dùng: I, O, Q (để tránh nhầm lẫn)
                        <br />• Ví dụ hợp lệ: 1HGBH41JXMN109186,
                        WVWZZZ1JZ3W386752
                      </div>
                    }
                  >
                    <Input.Group compact>
                      <Input
                        placeholder="Nhập 17 ký tự VIN (tự động viết hoa)"
                        size="large"
                        maxLength={17}
                        style={{
                          width: "calc(100% - 120px)",
                          textTransform: "uppercase",
                          fontFamily: "monospace",
                          letterSpacing: "1px",
                        }}
                        onChange={(e) => {
                          // Auto uppercase và chỉ giữ ký tự hợp lệ
                          const value = e.target.value
                            .toUpperCase()
                            .replace(/[^A-HJ-NPR-Z0-9]/g, "");
                          form.setFieldsValue({ vin: value });
                        }}
                      />
                      <Button
                        size="large"
                        style={{ width: 120 }}
                        onClick={() => {
                          const sampleVIN = generateSampleVIN();
                          form.setFieldsValue({ vin: sampleVIN });
                          message.success(`Đã tạo VIN mẫu: ${sampleVIN}`);
                        }}
                      >
                        Tạo VIN mẫu
                      </Button>
                    </Input.Group>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="Upload hình ảnh xe">
                    <Upload
                      multiple
                      listType="picture-card"
                      fileList={uploadedImages}
                      onChange={handleImageUpload}
                      onPreview={handlePreview}
                      onRemove={handleRemove}
                      customRequest={customUpload}
                      accept="image/*"
                      beforeUpload={(file) => {
                        const isImage = file.type.startsWith("image/");
                        if (!isImage) {
                          message.error("Chỉ được upload file hình ảnh!");
                        }
                        const isLt5M = file.size / 1024 / 1024 < 5;
                        if (!isLt5M) {
                          message.error("Hình ảnh phải nhỏ hơn 5MB!");
                        }
                        return isImage && isLt5M;
                      }}
                    >
                      {uploadedImages.length >= 8 ? null : (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      )}
                    </Upload>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                      Có thể upload tối đa 8 hình ảnh, mỗi ảnh &lt; 5MB
                    </div>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Version"
                    name="versionId"
                    rules={[
                      { required: true, message: "Vui lòng chọn Version!" },
                    ]}
                  >
                    <Select
                      size="large"
                      placeholder="Chọn Version"
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {versions.map((version) => (
                        <Option key={version.id} value={version.id}>
                          {version.versionName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Màu sắc"
                    name="colorId"
                    rules={[
                      { required: true, message: "Vui lòng chọn màu sắc!" },
                    ]}
                  >
                    <Select
                      size="large"
                      placeholder="Chọn màu sắc"
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {colors.map((color) => (
                        <Option key={color.id} value={color.id}>
                          <Space>
                            <div
                              style={{
                                width: 16,
                                height: 16,
                                backgroundColor: color.colorCode,
                                borderRadius: "50%",
                                border: "1px solid #d9d9d9",
                              }}
                            />
                            {color.colorName}
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Kho"
                    name="warehouseId"
                    rules={[{ required: true, message: "Vui lòng chọn kho!" }]}
                  >
                    <Select
                      size="large"
                      placeholder="Chọn kho"
                      loading={loading}
                    >
                      {warehouses.map((warehouse) => (
                        <Option key={warehouse.id} value={warehouse.id}>
                          {warehouse.displayName}
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              marginTop: "2px",
                            }}
                          >
                            ID: {warehouse.id.substring(0, 8)}...
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Trạng thái" name="status" initialValue={1}>
                    <Select size="large" disabled>
                      <Option value={1}>Hoạt động</Option>
                      <Option value={0}>Không hoạt động</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* Step 2: Thông tin kỹ thuật */}
          {currentStep === 1 && (
            <div>
              <Title level={5}>
                <CarOutlined style={{ marginRight: 8 }} />
                Thông tin kỹ thuật và thời gian
              </Title>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Giá cost (VND)"
                    name="costPrice"
                    rules={[
                      { required: true, message: "Vui lòng nhập giá cost!" },
                    ]}
                  >
                    <InputNumber
                      placeholder="0"
                      size="large"
                      style={{ width: "100%" }}
                      min={0}
                      max={10000000000}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      addonAfter="₫"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Ngày sản xuất"
                    name="manufactureDate"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ngày sản xuất!",
                      },
                    ]}
                  >
                    <DatePicker
                      size="large"
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày sản xuất"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Ngày nhập khẩu"
                    name="importDate"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ngày nhập khẩu!",
                      },
                    ]}
                  >
                    <DatePicker
                      size="large"
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày nhập khẩu"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Ngày hết hạn bảo hành"
                    name="warrantyExpiryDate"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ngày hết hạn bảo hành!",
                      },
                    ]}
                  >
                    <DatePicker
                      size="large"
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày hết hạn bảo hành"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* Step 3: Xác nhận */}
          {currentStep === 2 && (
            <div>
              <Title level={5}>
                <CheckCircleOutlined style={{ marginRight: 8 }} />
                Xác nhận thông tin
              </Title>

              <Alert
                message="Vui lòng kiểm tra lại thông tin trước khi tạo xe điện"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <div>
                {(() => {
                  // Sử dụng formData thay vì getFieldsValue()
                  const currentFormValues = form.getFieldsValue();
                  const values = { ...formData, ...currentFormValues };

                  // Debug logging để check form values
                  console.log("=== FORM VALUES IN CONFIRMATION STEP ===");
                  console.log("FormData from state:", formData);
                  console.log("Current form values:", currentFormValues);
                  console.log("Combined values:", values);

                  const selectedVersion = versions.find(
                    (v) => v.id === values.versionId
                  );
                  const selectedColor = colors.find(
                    (c) => c.id === values.colorId
                  );
                  const selectedWarehouse = warehouses.find(
                    (w) => w.id === values.warehouseId
                  );
                  return (
                    <Card title="Xác nhận thông tin xe điện">
                      <Row gutter={16}>
                        <Col span={12}>
                          <p>
                            <strong>VIN:</strong> {values.vin || "N/A"}
                          </p>
                          <p>
                            <strong>Version:</strong>{" "}
                            {selectedVersion?.versionName || "N/A"}
                          </p>
                          <p>
                            <strong>Màu sắc:</strong>{" "}
                            {selectedColor?.colorName || "N/A"}
                          </p>
                          <p>
                            <strong>Kho:</strong>{" "}
                            {selectedWarehouse?.name || "Chưa chọn kho"}
                          </p>
                        </Col>
                        <Col span={12}>
                          <p>
                            <strong>Giá cost:</strong>{" "}
                            {values.costPrice?.toLocaleString
                              ? values.costPrice.toLocaleString("vi-VN") + " ₫"
                              : values.costPrice || "N/A"}
                          </p>
                          <p>
                            <strong>Ngày sản xuất:</strong>{" "}
                            {values.manufactureDate?.format("DD/MM/YYYY") ||
                              "N/A"}
                          </p>
                          <p>
                            <strong>Ngày nhập khẩu:</strong>{" "}
                            {values.importDate?.format("DD/MM/YYYY") || "N/A"}
                          </p>
                        </Col>
                      </Row>

                      {/* Hiển thị uploaded images và attachment keys */}
                      {uploadedImages.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <strong>
                            Hình ảnh đã tải lên ({uploadedImages.length}):
                          </strong>

                          {/* Hiển thị attachment keys nếu có */}
                          {attachmentKeys.length > 0 && (
                            <div
                              style={{
                                marginTop: 8,
                                padding: "8px 12px",
                                backgroundColor: "#f6ffed",
                                border: "1px solid #b7eb8f",
                                borderRadius: 6,
                              }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  color: "#389e0d",
                                  fontSize: "14px",
                                }}
                              >
                                ✅ Đã upload thành công {attachmentKeys.length}{" "}
                                ảnh và nhận được keys từ server
                              </p>
                              <details style={{ marginTop: 4 }}>
                                <summary
                                  style={{
                                    cursor: "pointer",
                                    color: "#595959",
                                  }}
                                >
                                  Xem chi tiết keys
                                </summary>
                                <div
                                  style={{
                                    marginTop: 4,
                                    fontSize: "12px",
                                    fontFamily: "monospace",
                                  }}
                                >
                                  {attachmentKeys.map((key, index) => (
                                    <div key={index}>
                                      Ảnh {index + 1}: {key}
                                    </div>
                                  ))}
                                </div>
                              </details>
                            </div>
                          )}

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 8,
                              marginTop: 8,
                            }}
                          >
                            {uploadedImages.map((file, index) => {
                              // Tạo URL preview cho file
                              let previewUrl = "";
                              try {
                                if (file instanceof File) {
                                  previewUrl = URL.createObjectURL(file);
                                } else if (file.url) {
                                  previewUrl = file.url;
                                } else if (file.thumbUrl) {
                                  previewUrl = file.thumbUrl;
                                }
                              } catch (error) {
                                console.warn(
                                  "Cannot create preview URL for file:",
                                  file
                                );
                              }

                              return previewUrl ? (
                                <div
                                  key={index}
                                  style={{ position: "relative" }}
                                >
                                  <img
                                    src={previewUrl}
                                    alt={`Hình ${index + 1}`}
                                    style={{
                                      width: 100,
                                      height: 100,
                                      objectFit: "cover",
                                      borderRadius: 8,
                                      border: "1px solid #d9d9d9",
                                    }}
                                  />
                                  {/* Hiển thị key tương ứng với ảnh */}
                                  {attachmentKeys[index] && (
                                    <div
                                      style={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        background: "rgba(0, 0, 0, 0.7)",
                                        color: "white",
                                        fontSize: "10px",
                                        padding: "2px 4px",
                                        borderRadius: "0 0 8px 8px",
                                        textAlign: "center",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                      title={attachmentKeys[index] || "No key"}
                                    >
                                      Key:{" "}
                                      {attachmentKeys[index] &&
                                      typeof attachmentKeys[index] === "string"
                                        ? attachmentKeys[index].substring(
                                            0,
                                            8
                                          ) + "..."
                                        : "No key"}
                                    </div>
                                  )}
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <Divider />
          <div style={{ textAlign: "right" }}>
            <Space>
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(currentStep - 1)}>
                  Quay lại
                </Button>
              )}

              <Button
                onClick={() => {
                  setIsCreateModalVisible(false);
                  form.resetFields();
                  setCurrentStep(0);
                }}
              >
                Hủy
              </Button>

              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={handleNextStep}>
                  Tiếp theo
                </Button>
              )}

              {currentStep === steps.length - 1 && (
                <Button type="primary" htmlType="submit" loading={loading}>
                  Tạo Xe Điện
                </Button>
              )}
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal xem chi tiết xe */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: "#1890ff" }} />
            Chi tiết Xe Điện
          </Space>
        }
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedVehicle && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Thông tin cơ bản" size="small">
                  <p>
                    <strong>VIN:</strong>{" "}
                    <Text code>{selectedVehicle.vin}</Text>
                  </p>
                  <p>
                    <strong>Version:</strong>{" "}
                    {versions.find((v) => v.id === selectedVehicle.versionId)
                      ?.versionName || "N/A"}
                  </p>
                  <p>
                    <strong>Màu sắc:</strong>{" "}
                    {colors.find((c) => c.id === selectedVehicle.colorId)
                      ?.colorName || "N/A"}
                  </p>
                  <p>
                    <strong>Kho:</strong>{" "}
                    {warehouses.find(
                      (w) => w.id === selectedVehicle.warehouseId
                    )?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>
                    <Tag
                      color={selectedVehicle.status === 1 ? "success" : "error"}
                    >
                      {selectedVehicle.status === 1
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </Tag>
                  </p>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="Thông tin kỹ thuật" size="small">
                  <p>
                    <strong>Giá cost:</strong>{" "}
                    {selectedVehicle.costPrice?.toLocaleString("vi-VN")} ₫
                  </p>
                  <p>
                    <strong>Ngày sản xuất:</strong>{" "}
                    {selectedVehicle.manufactureDate
                      ? dayjs(selectedVehicle.manufactureDate).format(
                          "DD/MM/YYYY"
                        )
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Ngày nhập khẩu:</strong>{" "}
                    {selectedVehicle.importDate
                      ? dayjs(selectedVehicle.importDate).format("DD/MM/YYYY")
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Hết hạn bảo hành:</strong>{" "}
                    {selectedVehicle.warrantyExpiryDate
                      ? dayjs(selectedVehicle.warrantyExpiryDate).format(
                          "DD/MM/YYYY"
                        )
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Vehicle ID:</strong>{" "}
                    <Text code copyable>
                      {selectedVehicle.id}
                    </Text>
                  </p>
                </Card>
              </Col>
            </Row>

            {selectedVehicle.imageUrl && (
              <Card title="Hình ảnh" size="small" style={{ marginTop: 16 }}>
                <img
                  src={selectedVehicle.imageUrl}
                  alt="Vehicle"
                  style={{ width: "100%", maxHeight: 300, objectFit: "cover" }}
                />
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Modal xem ảnh của xe */}
      <Modal
        title={`Hình ảnh xe - ${
          selectedVehicleImages.length > 0
            ? `${selectedVehicleImages.length} ảnh`
            : "Chưa có ảnh"
        }`}
        open={vehicleImagesVisible}
        onCancel={() => setVehicleImagesVisible(false)}
        footer={null}
        width={1000}
        style={{ top: 20 }}
      >
        {loadingImages ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <div>Đang tải ảnh...</div>
          </div>
        ) : selectedVehicleImages.length > 0 ? (
          <Row gutter={[16, 16]}>
            {selectedVehicleImages.map((image, index) => (
              <Col key={index} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={`Vehicle image ${index + 1}`}
                      src={image.url || image}
                      style={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setPreviewImage(image.url || image);
                        setPreviewTitle(`Ảnh xe ${index + 1}`);
                        setPreviewVisible(true);
                      }}
                    />
                  }
                  bodyStyle={{ padding: "8px" }}
                >
                  <Card.Meta
                    title={`Ảnh ${index + 1}`}
                    description={
                      <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          setPreviewImage(image.url || image);
                          setPreviewTitle(`Ảnh xe ${index + 1}`);
                          setPreviewVisible(true);
                        }}
                      >
                        Xem lớn
                      </Button>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <EyeOutlined
              style={{ fontSize: "48px", color: "#ccc", marginBottom: "16px" }}
            />
            <div style={{ fontSize: "16px", color: "#666" }}>
              Xe này chưa có ảnh nào
            </div>
            <div style={{ fontSize: "14px", color: "#999", marginTop: "8px" }}>
              Hình ảnh sẽ được hiển thị khi xe có ảnh được upload
            </div>
          </div>
        )}
      </Modal>

      {/* Modal preview ảnh */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </PageContainer>
  );
}

// Wrap component với App để tránh static function warnings
const CreateElectricVehicleWithApp = () => (
  <App>
    <CreateElectricVehicle />
  </App>
);

export default CreateElectricVehicleWithApp;
