import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  message,
  Select,
  Space,
  Typography,
  Divider,
  Spin,
  Modal,
  Layout
} from 'antd';
import { UserAddOutlined, ShopOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined,FilePdfOutlined,DownloadOutlined, FileTextOutlined, ApartmentOutlined, GlobalOutlined } from '@ant-design/icons';
import { locationApi } from '../../../api/api';
import api from '../../../api/api';
import { ContractService } from '../../../App/Home/SignContractCustomer'
import ContractViewer from '../SignContract/Components/ContractViewer';
import SignatureModal from '../SignContract/Components/SignatureModal';
import SignaturePositionModal from '../SignContract/Components/SignaturePositionModal';
import SmartCAModal from '../SignContract/Components/SmartCAModal';
import AppVerifyModal from '../SignContract/Components/AppVerifyModal';
import AddSmartCA from '../SignContract/Components/AddSmartCA';
import SmartCASelector from '../SignContract/Components/SmartCASelector';
import SmartCAStatusChecker from '../SignContract/Components/SmartCAStatusChecker';
import useContractSigning from '../SignContract/useContractSigning';
import { createAccountApi } from '../../../App/EVMAdmin/CreateDealerAccount/CreateAccount';
const FIXED_USER_ID = "18858";
import AdminLayout from '../../../Components/Admin/AdminLayout';

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
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);
  const [contractLink, setContractLink] = useState(null);
  const [contractNo, setContractNo] = useState(null);
  const [contractId, setContractId] = useState(null);
  const [waitingProcessData, setWaitingProcessData] = useState(null);

  // SmartCA flow
  const [showAddSmartCA, setShowAddSmartCA] = useState(false);
  const [showSmartCASelector, setShowSmartCASelector] = useState(false);
  const [smartCAInfo, setSmartCAInfo] = useState(null);
  const [selectedSmartCA, setSelectedSmartCA] = useState(null);
  const [checkingSmartCA, setCheckingSmartCA] = useState(false);

  // PDF preview states
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Sử dụng custom hook để quản lý logic ký hợp đồng
  const {
    showSignatureModal,
    setShowSignatureModal,
    signingLoading,
    contractSigned,
    signatureCompleted,
    showSmartCAModal,
    setShowSmartCAModal,
    showAppVerifyModal,
    setShowAppVerifyModal,
    previewImage,
    showPositionModal,
    setShowPositionModal,
    handleSignature,
    handlePositionConfirm,
    handleAppVerification,
    resetSigningState
  } = useContractSigning();

  // Initialize contract service
  const contractService = ContractService();

  // Load PDF preview từ API /EContract/preview
  const loadPdfPreview = React.useCallback(async (downloadUrl) => {
    if (!downloadUrl) return null;
    
    setLoadingPdf(true);
    try {
      // Extract token từ downloadUrl
      const tokenMatch = downloadUrl.match(/[?&]token=([^&]+)/);
      const token = tokenMatch ? tokenMatch[1] : null;
      if (!token) {
        message.warning('Không tìm thấy token trong đường dẫn hợp đồng');
      }
      // Gọi API qua backend proxy thay vì fetch trực tiếp
      const response = await api.get(`/EContract/preview?token=${token}`, {
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
      // Quan trọng: KHÔNG return downloadUrl trực tiếp vì sẽ gây CORS
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

  // Load wards when province changes - GỌI API backend
  const handleProvinceChange = async (provinceCode) => {
    if (!provinceCode) {
      setWards([]);
      form.setFieldsValue({ ward: undefined });
      return;
    }

    try {
      setLoadingWards(true);
      // Gọi API backend để lấy wards theo provinceCode
      const wardsList = await locationApi.getWardsByProvinceCode(provinceCode);

      if (Array.isArray(wardsList)) {
        setWards(wardsList);
      } else {
        console.warn('Wards data is not an array:', wardsList);
        setWards([]);
        message.warning('Dữ liệu phường/xã không hợp lệ');
      }

      form.setFieldsValue({ ward: undefined });
    } catch (error) {
      message.error('Không thể tải danh sách phường/xã');
      console.error('Error loading wards:', error);
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
        phoneNumberManager: values.phone
      };

      // Validate form data
      const validation = createAccountApi.validateFormData(dealerData);
      if (!validation.isValid) {
        message.error(validation.errors[0]);
        setLoading(false);
        return;
      }

      console.log('Dữ liệu gửi đi:', dealerData);

      // Create dealer contract
      const result = await createAccountApi.createDealerContract(dealerData);

      if (result.isSuccess || result.success) {
        message.success('Tạo hợp đồng thành công!');

        let contractData = null;
        console.log('Full API response:', JSON.stringify(result, null, 2));

        if (result.result?.data) {
          contractData = result.result.data;
          console.log('Lấy dữ liệu từ result.result.data:', contractData);
        } else if (result.data) {
          contractData = result.data;
          console.log('Lấy dữ liệu từ result.data:', contractData);
        }

        if (contractData) {
          const contractIdFromResponse = contractData.id;
          const downloadUrl = contractData.downloadUrl;
          const contractNo = contractData.no;
          const processId = contractData.waitingProcess?.id || contractIdFromResponse;

          setContractId(processId);
          setWaitingProcessData(contractData.waitingProcess);

          if (downloadUrl) {
            setContractLink(downloadUrl);
            setContractNo(contractNo || 'Không xác định');
            
            // Load PDF preview từ API /EContract/preview
            await loadPdfPreview(downloadUrl);
            
            message.success({
              content: (
                <span>
                  Hợp đồng đã được tạo thành công và sẽ được hiển thị bên dưới!
                </span>
              ),
              duration: 3
            });
            // Sau khi tạo hợp đồng, kiểm tra trạng thái SmartCA trước
            setCheckingSmartCA(true);
          } else {
            message.warning('Không tìm thấy đường dẫn hợp đồng');
            console.error('Download URL không tồn tại trong phản hồi');
          }
        } else {
          message.warning('Không có thông tin hợp đồng trong kết quả trả về');
        }
      } else {
        message.error(result.error || 'Có lỗi khi tạo hợp đồng');
        setContractLink(null);
        setContractNo(null);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      message.error('Có lỗi không mong muốn xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Vui lòng kiểm tra lại thông tin đã nhập');
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

  // Reset form and related state
  const resetForm = () => {
    Modal.confirm({
      title: 'Làm mới biểu mẫu? ',
      content: 'Thao tác này sẽ xóa dữ liệu đã nhập và bắt đầu hợp đồng mới.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => {
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
        resetSigningState();
        message.success('Đã làm mới biểu mẫu');
      }
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-lg rounded-xl mb-6">
          <Space direction="vertical" size="large" className="w-full">
            {/* Header */}
            <div className="text-center py-5">
              <Title
                level={2}
                className="text-blue-500 mb-2 flex items-center justify-center gap-3"
              >
                <UserAddOutlined />
                Tạo Hợp Đồng Đại Lý
              </Title>
              <Text className="text-base text-gray-600">
                Quản lý và tạo hợp đồng cho các đại lý xe điện
              </Text>
            </div>

            <Divider className="my-6" />


            {/* Contract Display */}
            {contractLink && (
              <>
                {/* Phase 4: Chỉ sử dụng React-PDF */}
                <Card className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Text strong className="text-green-600">
                        <FileTextOutlined className="mr-2" />
                        PDF Viewer: React-PDF (Native)
                      </Text>
                      <div className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded">
                        Phase 4: Simplified & Optimized
                      </div>
                    </div>
                  </div>
                </Card>

                <ContractViewer
                  contractLink={contractLink}
                  contractNo={contractNo}
                  contractSigned={contractSigned}
                  onSign={() => {
                    // Kiểm tra đã có SmartCA và có chứng thư số hợp lệ chưa
                    const hasValidSmartCA = smartCAInfo && (
                      smartCAInfo.defaultSmartCa ||
                      (smartCAInfo.userCertificates && smartCAInfo.userCertificates.length > 0)
                    );
                    if (!hasValidSmartCA) {
                      message.warning('Bạn chưa có SmartCA hoặc chưa có chứng thư số hợp lệ. Vui lòng thêm SmartCA trước khi ký!');
                      setShowAddSmartCA(true);
                      return;
                    }
                    if (!selectedSmartCA) {
                      message.warning('Vui lòng chọn chứng thư số SmartCA trước khi ký hợp đồng!');
                      setShowSmartCASelector(true);
                      return;
                    }
                    setShowSignatureModal(true);
                  }}
                  onDownload={handleDownload}
                  onNewContract={resetForm}
                  viewerLink={getPdfDisplayUrl()}
                  loading={loadingPdf}
                />

                {/* Card trạng thái SmartCA giống ContractPage */}
                <Card className="mb-6 mt-6">
                  <Title level={4} className="flex items-center">
                    <SmartCAModal />
                    Trạng thái SmartCA
                  </Title>
                  {!smartCAInfo ? (
                    <div className="text-center">
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded p-3 mb-3">
                        <div className="font-medium">SmartCA chưa sẵn sàng</div>
                        <div className="text-sm">Bạn cần thêm SmartCA để có thể ký hợp đồng</div>
                      </div>
                      <Button type="primary" danger onClick={() => setShowAddSmartCA(true)}>
                        Thêm SmartCA
                      </Button>
                    </div>
                  ) : !selectedSmartCA ? (
                    <div className="text-center">
                      <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded p-3 mb-3">
                        <div className="font-medium">Đã có SmartCA</div>
                        <div className="text-sm">Vui lòng chọn chứng thư số để ký hợp đồng</div>
                      </div>
                      <Button type="primary" onClick={() => setShowSmartCASelector(true)}>
                        Chọn Chứng Thư
                      </Button>
                      <Button className="ml-2" onClick={() => setShowAddSmartCA(true)}>
                        Thêm SmartCA Khác
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="bg-green-50 border border-green-200 text-green-700 rounded p-3 mb-3">
                        <div className="font-medium">SmartCA sẵn sàng</div>
                        <div className="text-sm">
                          Sử dụng: {selectedSmartCA.commonName} ({selectedSmartCA.uid})
                        </div>
                      </div>
                      <Button type="primary" onClick={() => setShowSignatureModal(true)}>
                        Ký Hợp Đồng
                      </Button>
                      <Button className="ml-2" onClick={() => setShowSmartCASelector(true)}>
                        Đổi Chứng Thư
                      </Button>
                    </div>
                  )}
                </Card>
              </>
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
                  label="Phường/Xã"
                  icon={<EnvironmentOutlined />}
                  rules={[
                    { required: true, message: 'Vui lòng chọn phường/xã!' }
                  ]}
                >
                  <Select
                    placeholder="Chọn phường/xã"
                    className="rounded-lg"
                    showSearch
                    loading={loadingWards}
                    disabled={wards.length === 0}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    notFoundContent={loadingWards ? <Spin size="small" /> : 'Không tìm thấy phường/xã'}
                  >
                    {wards.map(ward => (
                      <Option key={ward.code} value={ward.code}>
                        {ward.name}
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

              {/* Action Buttons */}
              <Row justify="center" className="mt-8">
                <Col>
                  <Space size="large">
                    <Button
                      size="large"
                      onClick={resetForm}
                      className="rounded-lg min-w-32 h-12 text-base font-semibold"
                      disabled={contractLink !== null}
                    >
                      Làm Mới
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                      className="rounded-lg min-w-32 h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 border-none shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={contractLink !== null}
                    >
                      {loading ? 'Đang tạo...' : 'Tiếp Theo'}
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Space>
        </Card>

        {/* Modal thêm SmartCA cho hãng sau khi tạo hợp đồng */}
        <AddSmartCA
          visible={showAddSmartCA}
          onCancel={() => setShowAddSmartCA(false)}
          onSuccess={() => {
            setShowAddSmartCA(false);
            setCheckingSmartCA(true);
          }}
          contractInfo={{
            userId: FIXED_USER_ID,
            accessToken: localStorage.getItem('jwt_token')
          }}
        />

        {/* Kiểm tra sự tồn tại SmartCA sau khi tạo hợp đồng hoặc thêm mới */}
        {checkingSmartCA && (
          <SmartCAStatusChecker
            userId={FIXED_USER_ID}
            contractService={ContractService()}
            onChecked={(data) => {
              setSmartCAInfo(data);
              setCheckingSmartCA(false);
              const hasValidSmartCA = data && (data.defaultSmartCa || (data.userCertificates && data.userCertificates.length > 0));
              if (hasValidSmartCA) {
                setShowSmartCASelector(true);
              } else {
                setShowAddSmartCA(true);
              }
            }}
          />
        )}

        {/* Modal chọn chứng thư số SmartCA */}
        <SmartCASelector
          visible={showSmartCASelector}
          onCancel={() => setShowSmartCASelector(false)}
          onSelect={(cert) => {
            setSelectedSmartCA(cert);
            setShowSmartCASelector(false);
            message.success(`Đã chọn chứng thư: ${cert.commonName}`);
          }}
          smartCAData={smartCAInfo}
          loading={false}
          isExistingSmartCA={true}
          currentSelectedId={selectedSmartCA?.id}
        />

        {/* Signature Modal */}
        <SignatureModal
          visible={showSignatureModal}
          onCancel={() => setShowSignatureModal(false)}
          onSign={(signatureData, signatureDisplayMode) => {
            handleSignature(signatureData, signatureDisplayMode, contractId, waitingProcessData, contractLink);
          }}
          loading={signingLoading}
        />

        {/* Signature Position Modal */}
        <SignaturePositionModal
          visible={showPositionModal}
          onCancel={() => setShowPositionModal(false)}
          onConfirm={handlePositionConfirm}
          contractLink={contractLink}
          contractNo={contractNo}
          signaturePreview={previewImage}
        />

        {/* SmartCA Modal */}
        <SmartCAModal
          visible={showSmartCAModal}
          onCancel={() => {
            setShowSmartCAModal(false);
          }}
          contractNo={contractNo}
        />

        {/* App Verification Modal */}
        <AppVerifyModal
          visible={showAppVerifyModal}
          onCancel={() => setShowAppVerifyModal(false)}
          onVerify={() => handleAppVerification(contractNo)}
          loading={signingLoading}
          signatureCompleted={signatureCompleted}
        />

        {/* Trong ContractViewer hoặc PDFModal */}
        {!getPdfDisplayUrl() && contractLink && (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-gray-50 rounded-lg">
            <FilePdfOutlined className="text-6xl mb-4 text-blue-400" />
            <p className="text-lg mb-4 text-gray-700">PDF Preview không khả dụng</p>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => window.open(contractLink, '_blank')}
              size="large"
            >
              Mở PDF trong tab mới
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Nhấn để xem PDF trên trang VNPT
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CreateContract;