import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  Space,
  Typography,
  Divider,
  Spin,
  Layout,
  App
} from 'antd';
import { 
  UserAddOutlined, 
  ShopOutlined, 
  EnvironmentOutlined, 
  MailOutlined, 
  PhoneOutlined,
  FilePdfOutlined,
  DownloadOutlined, 
  FileTextOutlined, 
  ApartmentOutlined, 
  GlobalOutlined, 
  EditOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';
import { locationApi } from '../../../App/APIComponent/Address';
import api from '../../../api/api';
import ContractViewer from '../SignContract/Components/ContractViewer';
import PDFEdit from '../SignContract/Components/PDF/PDFEdit/PDFEditMain';
import { createAccountApi } from '../../../App/EVMAdmin/DealerContract/CreateDealerContract';
import { PDFUpdateService } from '../../../App/Home/PDFconfig/PDFUpdate';
import AdminLayout from '../../../Components/Admin/AdminLayout';

const FIXED_USER_ID = "18858";

const { Title, Text } = Typography;
const { Option } = Select;
const { Content } = Layout;

// Custom form field component with consistent styling
const FormField = ({
  name,
  label,
  icon,
  rules,
  children,
  span = 12,
  required = true // This prop is used in rules if not explicitly provided
}) => (
  <Col xs={24} md={span}>
    <Form.Item
      name={name}
      label={
        <span className="font-semibold text-gray-700 flex items-center">
          {icon && <span className="mr-2 text-blue-500">{icon}</span>}
          {label}
        </span>
      }
      rules={rules || (required ? [{ required: true, message: `${label} là bắt buộc` }] : [])}
    >
      {children}
    </Form.Item>
  </Col>
);

const CreateContract = () => {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);
  
  // Contract states
  const [contractLink, setContractLink] = useState(null);
  const [contractNo, setContractNo] = useState(null);
  const [contractId, setContractId] = useState(null);
  const [waitingProcessData, setWaitingProcessData] = useState(null);

  // Workflow states - mới thêm
  const [updatingContract, setUpdatingContract] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [contractConfirmed, setContractConfirmed] = useState(false);

  // Lưu thông tin vị trí ký từ API response
  const [positionA, setPositionA] = useState(null);
  const [positionB, setPositionB] = useState(null);
  const [pageSign, setPageSign] = useState(null);
  const [originalPositionA, setOriginalPositionA] = useState(null);
  const [originalPositionB, setOriginalPositionB] = useState(null);
  const [originalPageSign, setOriginalPageSign] = useState(null);

  // PDF preview states
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  // PDF Template Edit states
  const [showTemplateEdit, setShowTemplateEdit] = useState(false);
  
  // Initialize services
  const pdfUpdateService = PDFUpdateService();

  // Load PDF preview từ API /EContract/preview
  const loadPdfPreview = React.useCallback(async (downloadUrl) => {
    if (!downloadUrl) return null;
    
    setLoadingPdf(true);
    try {
      // Extract token từ downloadUrl
      const tokenMatch = downloadUrl;
      const token = tokenMatch ? tokenMatch : null;
      if (!token) {
        message.warning('Không tìm thấy url trong response api');
        return null;
      }
      // Gọi API qua backend proxy thay vì fetch trực tiếp
      const response = await api.get(`/EContract/preview`, {
      params: { downloadUrl },        // cách này sạch hơn so với nối string
      responseType: 'blob'
    });
      
      if (response.status === 200) {
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(pdfBlob);
        
        setPdfBlob(pdfBlob);
        setPdfBlobUrl(blobUrl);
        return blobUrl;
      }
    } catch (error) {
      console.log('Lỗi API preview, sử dụng link gốc:', error.message);
  
      return null;
    } finally {
      setLoadingPdf(false);
    }
  }, []);

  // Build a display URL for PDF (ưu tiên blob URL, không thì dùng trực tiếp contractLink)
  const getPdfDisplayUrl = () => {
    // Ưu tiên blob URL từ preview API (không CORS)
    if (pdfBlobUrl) {
      return pdfBlobUrl;
    }
    
    // KHÔNG dùng trực tiếp downloadUrl vì sẽ gây CORS
    // Thay vào đó, hiển thị thông báo cho user
    return null;
  };

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const data = await locationApi.getProvinces();

        // Đảm bảo data là array trước khi set
        if (Array.isArray(data)) {
          setProvinces(data);
        } else {
          console.warn('Provinces data is not an array:', data);
          setProvinces([]);
          message.warning('Dữ liệu tỉnh/thành phố không hợp lệ');
        }
      } catch (error) {
        message.error('Không thể tải danh sách tỉnh/thành phố');
        console.error('Error loading provinces:', error);
        setProvinces([]); // Đảm bảo set array rỗng khi có lỗi
      } finally {
        setLoadingProvinces(false);
      }
    };

    loadProvinces();
  }, []);

  // Load wards when province changes - GỌI API backend với fallback
  const handleProvinceChange = async (provinceCode) => {
    if (!provinceCode) {
      setWards([]);
      form.setFieldsValue({ ward: undefined });
      return;
    }

    try {
      setLoadingWards(true);
      // Gọi API backend để lấy wards/districts theo provinceCode (có fallback)
      const wardsList = await locationApi.getWardsByProvinceCode(provinceCode);

      if (Array.isArray(wardsList)) {
        setWards(wardsList);
      } else {
        console.warn('Wards/districts data is not an array:', wardsList);
        setWards([]);
        message.warning('Dữ liệu phường/xã/quận/huyện không hợp lệ');
      }

      form.setFieldsValue({ ward: undefined });
    } catch (error) {
      message.error('Không thể tải danh sách phường/xã/quận/huyện');
      console.error('Error loading wards/districts:', error);
      setWards([]); // Đảm bảo set array rỗng khi có lỗi
    } finally {
      setLoadingWards(false);
    }
  };

  // Handle form submission
  const onFinish = async (values) => {
    setLoading(true);

    try {
      // Combine address with province and ward information
      const provinceCode = values.province;
      const wardCode = values.ward;
      let fullAddress = values.address || '';

      // Sử dụng helper functions để lấy tên
      const provinceName = locationApi.getProvinceNameByCode(provinces, provinceCode);
      const wardName = locationApi.getWardNameByCode(wards, wardCode);

      if (wardName && provinceName) {
        fullAddress = `${fullAddress}, ${wardName}, ${provinceName}`.trim().replace(/^,\s+/, '');
      } else {
        console.error('Không thể tìm thấy thông tin phường/xã hoặc tỉnh/thành phố');
      }

      // Chuẩn bị dữ liệu theo schema API mới
      const dealerData = {
        dealerName: values.brandName,
        dealerAddress: fullAddress,
        taxNo: values.taxNo,
        dealerLevel: values.dealerLevel,
        additionalTerm: values.additionalTerm || null,
        regionDealer: values.regionDealer || null,
        fullNameManager: values.representativeName,
        emailManager: values.email,
        phoneNumberManager: values.phone,
        // ✅ Thêm province và ward vào validation data
        province: values.province,
        ward: values.ward
      };

      // Validate form data (bao gồm province và ward)
      const validation = createAccountApi.validateFormData(dealerData);
      if (!validation.isValid) {
        message.error(validation.errors[0]);
        setLoading(false);
        return;
      }

      const response = await api.post('/EContract/draft-dealer-contracts', dealerData);

      if (response.data?.isSuccess) {
        const contractData = response.data.result?.data;
        
        if (contractData) {
          setContractId(contractData.id);
          setContractLink(contractData.downloadUrl);
          setContractNo(contractData.no);
          
          // Lưu vị trí gốc
          setOriginalPositionA(contractData.positionA);
          setOriginalPositionB(contractData.positionB);
          setOriginalPageSign(contractData.pageSign);
          
          // Set current positions
          setPositionA(contractData.positionA);
          setPositionB(contractData.positionB);
          setPageSign(contractData.pageSign);
          
          await loadPdfPreview(contractData.downloadUrl);
          
          message.success('Hợp đồng đã được tạo thành công!');
        }
      } else {
        message.error(response.data?.message || 'Có lỗi khi tạo hợp đồng');
        setContractLink(null);
        setContractNo(null);
      }
    } catch (error) {
      console.error('API Error:', error);
      if (error.response?.data) {
        const errorData = error.response.data;
        message.error(errorData.message || 'Có lỗi khi tạo hợp đồng');
      } else {
        message.error('Có lỗi không mong muốn xảy ra');
      }
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    message.error('Vui lòng kiểm tra lại thông tin đã nhập');
  };

  // Handle update contract workflow - ✅ Cập nhật với thông tin mới từ API
  const handleUpdateContract = async (updateInfo) => {
    if (!contractId || !contractNo) return;
    
    setUpdatingContract(true);
    try {
      // ✅ Cập nhật positions mới từ API response
      if (updateInfo.positionA) {
        setPositionA(updateInfo.positionA);
      }
      if (updateInfo.positionB) {
        setPositionB(updateInfo.positionB);
      }
      if (updateInfo.pageSign) {
        setPageSign(updateInfo.pageSign);
      }
      
      // ✅ Cập nhật downloadUrl mới và gọi lại preview
      if (updateInfo.downloadUrl) {
        setContractLink(updateInfo.downloadUrl);
        await loadPdfPreview(updateInfo.downloadUrl);
      }
      
      message.success('Hợp đồng đã được cập nhật thành công');
      setShowTemplateEdit(false);
      
    } catch (error) {
      console.error('Update contract error:', error);
      message.error(error.message || 'Không thể cập nhật hợp đồng');
    } finally {
      setUpdatingContract(false);
    }
  };

  // Xác nhận hợp đồng
  const handleConfirmContract = async () => {
    if (!contractId) {
      message.error('Không tìm thấy ID hợp đồng');
      return;
    }

    const finalPositionA = positionA || originalPositionA || "18,577,188,667";
    const finalPositionB = positionB || originalPositionB || "406,577,576,667";
    const finalPageSign = pageSign || originalPageSign || 9;

    modal.confirm({
      title: 'Xác nhận hợp đồng',
      content: 'Bạn có chắc chắn muốn xác nhận hợp đồng này? Sau khi xác nhận, hợp đồng sẽ được gửi đi xét duyệt.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        try {
          setConfirming(true);

          const payload = {
            eContractId: String(contractId),
            positionA: String(finalPositionA),
            positionB: String(finalPositionB),
            pageSign: Number(finalPageSign)
          };

          const response = await api.post('/EContract/ready-dealer-contracts', payload, {
            headers: { 'Content-Type': 'application/json' }
          });

          if (response.data?.isSuccess) {
            setContractConfirmed(true);
            message.success(`Xác nhận hợp đồng thành công! Hợp đồng ${response.data.result?.data?.no || contractNo} đã sẵn sàng ký số.`);
            
            // Sau 3 giây tự động chuyển về tạo hợp đồng mới
            setTimeout(() => {
              resetFormDirect();
            }, 3000);
          } else {
            message.error(response.data?.message || 'Xác nhận hợp đồng thất bại');
          }
        } catch (error) {
          console.error('Confirm contract error:', error);
          message.error(error.response?.data?.message || error.message || 'Không thể xác nhận hợp đồng');
        } finally {
          setConfirming(false);
        }
      }
    });
  };

  // Download PDF - sử dụng blob data nếu có, không thì dùng contractLink
  const handleDownload = () => {
    if (pdfBlobUrl) {
      // Download từ blob URL (không CORS)
      const link = document.createElement('a');
      link.href = pdfBlobUrl;
      link.download = `${title || `hop-dong-${contractNo}`}.pdf`;
      link.click();
    } else if (contractLink) {
      // Mở trong tab mới thay vì download trực tiếp
      window.open(contractLink, '_blank');
      message.info('PDF đã được mở trong tab mới');
    } else {
      message.warning('Không có file PDF để tải xuống');
    }
  };

  const handlePrint = () => {
    if (contractLink) {
      // Mở trong tab mới để in (tránh CORS)
      const printWindow = window.open(contractLink, '_blank');
      message.info('PDF đã được mở trong tab mới. Vui lòng sử dụng Ctrl+P để in');
    } else {
      message.warning('Không có file PDF để in');
    }
  };

  // Reset form trực tiếp (không confirm)  
  const resetFormDirect = () => {
    form.resetFields();
    setContractLink(null);
    setContractNo(null);
    setContractId(null);
    setWaitingProcessData(null);
    setWards([]);
    
    // Reset PDF states
    setPdfBlob(null);
    setPdfBlobUrl(null);
    setLoadingPdf(false);
    
    // Reset workflow states
    setUpdatingContract(false);
    setShowTemplateEdit(false);
    setConfirming(false);
    setContractConfirmed(false);
    
    // Reset signing position states
    setPositionA(null);
    setPositionB(null);
    setPageSign(null);
    setOriginalPositionA(null);
    setOriginalPositionB(null);
    setOriginalPageSign(null);
    
    message.success('Đã tạo hợp đồng mới');
  };

  // Reset form with confirmation
  const resetForm = () => {
    modal.confirm({
      title: 'Làm mới biểu mẫu?',
      content: 'Thao tác này sẽ xóa dữ liệu đã nhập và bắt đầu hợp đồng mới.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      centered: true,
      onOk: resetFormDirect
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4">
        <Card 
          className="shadow-2xl rounded-2xl mb-8 overflow-hidden border-0"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Space direction="vertical" size="large" className="w-full">
            {/* Header với gradient background */}
            <div 
              className="text-center py-8 px-6 -mx-6 -mt-6 mb-4"
              style={{
                background: 'linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)',
                color: 'white'
              }}
            >
              <Title
                level={2}
                className="mb-3 flex items-center justify-center gap-3"
                style={{ color: 'black', margin: 0 }}
              >
                <UserAddOutlined className="text-3xl" />
                Tạo Hợp Đồng Đại Lý
              </Title>
              <Text className="text-lg opacity-90" style={{ color: 'black' }}>
                Quản lý và tạo hợp đồng cho các đại lý xe điện
              </Text>
            </div>


            {/* Contract Display */}
            {contractLink && !contractConfirmed && (
              <>
                <ContractViewer
                  contractLink={contractLink}
                  contractNo={contractNo}
                  contractSigned={false}
                  onSign={null}
                  onDownload={handleDownload}
                  onNewContract={resetFormDirect}
                  viewerLink={getPdfDisplayUrl()}
                  loading={loadingPdf}
                />

                {/* Nút xác nhận hợp đồng */}
                <Card className="mb-6 mt-6 shadow-md rounded-xl border border-blue-200">
                  <div className="text-center">
                    <div className="rounded-lg p-4 mb-4 border border-blue-200 bg-blue-50">
                      <div className="font-semibold text-lg text-blue-700">Hợp đồng đã sẵn sàng</div>
                      <div className="text-sm mt-1 text-blue-600">
                        Vui lòng xem xét nội dung hợp đồng và xác nhận để gửi đi xét duyệt
                      </div>
                    </div>
                    
                    <Space className="flex flex-wrap justify-center gap-4">
                      <Button 
                        type="primary" 
                        icon={<EditOutlined />}
                        onClick={() => setShowTemplateEdit(true)}
                        size="large"
                        disabled={confirming}
                        className="px-6 py-2 h-auto font-semibold rounded-lg"
                      >
                        Chỉnh sửa nội dung
                      </Button>
                      
                      <Button 
                        type="primary"
                        size="large"
                        onClick={handleConfirmContract}
                        loading={confirming}
                        disabled={confirming}
                        className="px-8 py-2 h-auto font-semibold rounded-lg bg-green-500 hover:bg-green-600 border-green-500"
                      >
                        Xác nhận hợp đồng
                      </Button>
                    </Space>
                  </div>
                </Card>
              </>
            )}

            {/* Hiển thị thành công */}
            {contractConfirmed && (
              <Card className="mb-6 shadow-md rounded-xl border border-green-200">
                <div className="text-center p-6">
                  <div className="rounded-lg p-6 bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                    <CheckCircleOutlined className="text-4xl text-green-500 mb-4" />
                    <div className="font-semibold text-xl text-green-700 mb-3">
                      🎉 Xác nhận hợp đồng thành công!
                    </div>
                    <div className="text-green-600 mb-4">
                      Hợp đồng <strong>{contractNo}</strong> đã được gửi đi và sẵn sàng cho việc ký số. 
                      Các bên liên quan sẽ nhận được thông báo để tiến hành ký.
                    </div>
                    <div className="bg-white border border-green-300 rounded-lg p-4 mb-4 text-sm text-gray-700">
                      📋 <strong>Trạng thái:</strong> Chờ ký số<br/>
                      🔗 <strong>Mã hợp đồng:</strong> {contractNo}<br/>
                      ⏰ <strong>Thời gian:</strong> {new Date().toLocaleString('vi-VN')}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Tự động chuyển về tạo hợp đồng mới sau 3 giây...
                    </div>
                    <Button 
                      type="primary"
                      size="large" 
                      onClick={resetFormDirect}
                      className="px-8 py-3 h-auto font-semibold rounded-lg bg-blue-500 hover:bg-blue-600 border-blue-500"
                    >
                      Tạo hợp đồng mới ngay
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Test panel removed - không cần thiết cho nghiệp vụ chính */}

            {/* Form */}
            <Form
              form={form}
              name="dealerForm"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              layout="vertical"
              size="large"
              className="max-w-4xl mx-auto"
            >
              <Row gutter={[24, 16]}>
                <FormField
                  name="brandName"
                  label="Tên Hãng"
                  icon={<ShopOutlined />}
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên hãng!' },
                    { min: 2, message: 'Tên hãng phải có ít nhất 2 ký tự!' }
                  ]}
                >
                  <Input
                    placeholder="Nhập tên hãng xe điện"
                    className="rounded-lg"
                  />
                </FormField>

                <FormField
                  name="representativeName"
                  label="Họ Tên Quản Lý"
                  icon={<UserAddOutlined />}
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ tên quản lý!' },
                    { min: 2, message: 'Họ tên quản lý phải có ít nhất 2 ký tự!' }
                  ]}
                >
                  <Input
                    placeholder="Nhập họ tên quản lý"
                    className="rounded-lg"
                  />
                </FormField>

                <FormField
                  name="taxNo"
                  label="Mã Số Thuế"
                  icon={<FileTextOutlined />}
                  rules={[
                    { required: true, message: 'Vui lòng nhập mã số thuế!' },
                    {
                      pattern: /^[0-9]{10}$|^[0-9]{13}$/,
                      message: 'Mã số thuế phải có 10 hoặc 13 chữ số!'
                    }
                  ]}
                >
                  <Input
                    placeholder="Nhập mã số thuế (10 hoặc 13 chữ số)"
                    className="rounded-lg"
                    maxLength={13}
                  />
                </FormField>

                <FormField
                  name="province"
                  label="Tỉnh/Thành phố"
                  icon={<EnvironmentOutlined />}
                  rules={[
                    { required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }
                  ]}
                >
                  <Select
                    placeholder="Chọn tỉnh/thành phố"
                    className="rounded-lg"
                    showSearch
                    loading={loadingProvinces}
                    onChange={handleProvinceChange}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    notFoundContent={loadingProvinces ? <Spin size="small" /> : 'Không tìm thấy tỉnh/thành phố'}
                  >
                    {provinces.map(province => (
                      <Option key={province.code} value={province.code}>
                        {province.name}
                      </Option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  name="ward"
                  label="Quận/Huyện/Phường/Xã"
                  icon={<EnvironmentOutlined />}
                  rules={[
                    { required: true, message: 'Vui lòng chọn quận/huyện/phường/xã!' }
                  ]}
                >
                  <Select
                    placeholder="Chọn quận/huyện/phường/xã"
                    className="rounded-lg"
                    showSearch
                    loading={loadingWards}
                    disabled={wards.length === 0}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    notFoundContent={loadingWards ? <Spin size="small" /> : 'Không tìm thấy quận/huyện/phường/xã'}
                  >
                    {wards.map(ward => (
                      <Option key={ward.code} value={ward.code}>
                        {ward.name || ward.districtName}
                      </Option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  name="email"
                  label="Email Quản Lý"
                  icon={<MailOutlined />}
                  rules={[
                    { required: true, message: 'Vui lòng nhập email quản lý!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input
                    placeholder="Nhập email quản lý"
                    className="rounded-lg"
                  />
                </FormField>

                <FormField
                  name="phone"
                  label="Số Điện Thoại Quản Lý"
                  icon={<PhoneOutlined />}
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại quản lý!' },
                    {
                      pattern: /^0[1-9]{9}$/,
                      message: 'Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số!'
                    }
                  ]}
                >
                  <Input
                    placeholder="Nhập số điện thoại quản lý (bắt đầu bằng 0)"
                    className="rounded-lg"
                  />
                </FormField>

                <FormField
                  name="dealerLevel"
                  label="Cấp Độ Đại Lý"
                  icon={<ApartmentOutlined />}
                  rules={[
                    { required: true, message: 'Vui lòng chọn cấp độ đại lý!' }
                  ]}
                >
                  <Select
                    placeholder="Chọn cấp độ đại lý"
                    className="rounded-lg"
                  >
                    <Option value={1}>Đại lý cấp 1</Option>
                    <Option value={2}>Đại lý cấp 2</Option>
                    <Option value={3}>Đại lý cấp 3</Option>
                  </Select>
                </FormField>

                <FormField
                  name="regionDealer"
                  label="Khu Vực Đại Lý"
                  icon={<GlobalOutlined />}
                  required={false}
                  rules={[]}
                >
                  <Input
                    placeholder="Nhập khu vực đại lý (có thể bỏ trống)"
                    className="rounded-lg"
                  />
                </FormField>

                <FormField
                  name="address"
                  label="Địa Chỉ Đại Lý"
                  icon={<EnvironmentOutlined />}
                  span={24}
                  rules={[
                    { required: true, message: 'Vui lòng nhập địa chỉ đại lý!' }
                  ]}
                >
                  <Input.TextArea
                    placeholder="Nhập địa chỉ đại lý (số nhà, tên đường, ...)"
                    rows={3}
                    className="rounded-lg"
                  />
                </FormField>

                <FormField
                  name="additionalTerm"
                  label="Điều Khoản Bổ Sung"
                  icon={<FileTextOutlined />}
                  span={24}
                  required={false}
                  rules={[]}
                >
                  <Input.TextArea
                    placeholder="Nhập điều khoản bổ sung (có thể bỏ trống)"
                    rows={4}
                    className="rounded-lg"
                  />
                </FormField>
              </Row>

              {/* Action Buttons với custom styling */}
              <Row justify="center" className="mt-10 mb-4">
                <Col>
                  <Space size="large" className="flex flex-wrap justify-center">
                    <Button
                      size="large"
                      onClick={resetForm}
                      disabled={contractLink !== null}
                      className="px-8 py-3 h-auto text-base font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:shadow-md transition-all duration-200"
                    >
                      Làm Mới
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                      disabled={contractLink !== null} // ✅ Vẫn disable khi đã có contract
                      className="px-12 py-3 h-auto text-base font-semibold rounded-xl border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                      style={{
                        background: loading 
                          ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                          : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Spin size="small" />
                          Đang tạo...
                        </span>
                      ) : (
                        'Tiếp Theo'
                      )}
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Space>
        </Card>



        {/* PDF Fallback với custom styling */}
        {!getPdfDisplayUrl() && contractLink && (
          <Card 
            className="mb-6 border-2 border-dashed border-blue-300 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
            }}
          >
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FilePdfOutlined 
                className="text-8xl mb-6"
                style={{ color: '#3b82f6' }}
              />
              <Title level={4} className="text-gray-700 mb-4">
                PDF Preview không khả dụng
              </Title>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={() => window.open(contractLink, '_blank')}
                size="large"
                className="px-8 py-3 h-auto font-semibold rounded-xl shadow-md hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                  border: 'none'
                }}
              >
                Mở PDF trong tab mới
              </Button>
              <Text className="text-sm text-gray-600 mt-3 opacity-80">
                Nhấn để xem PDF trên trang VNPT
              </Text>
            </div>
          </Card>
        )}

        {/* Template Edit Modal - FIX: Thêm key để force re-render */}
        <App>
          <PDFEdit
            key={showTemplateEdit ? contractId : 'hidden'} // ✅ Force re-render mỗi lần mở
            visible={showTemplateEdit}
            onCancel={() => setShowTemplateEdit(false)}
            onSave={handleUpdateContract} // ✅ Sử dụng function mới
            contractId={contractId}
            contractNo={contractNo}
          />
        </App>
      </div>
    </AdminLayout>
  );
};

export default CreateContract;