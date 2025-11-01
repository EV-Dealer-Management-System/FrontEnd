import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Space,
  Spin,
  Alert,
  Avatar,
  message
} from 'antd';
import {
  ShopOutlined,
  UserAddOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  ApartmentOutlined,
  BankOutlined,
  CreditCardOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { bankApi } from '../../../../api/bank';

const { Option } = Select;

// Custom form field component with consistent styling
const FormField = ({
  name,
  label,
  icon,
  rules,
  children,
  span = 12,
  required = true, // This prop is used in rules if not explicitly provided
  disabledAll = false
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
      {React.cloneElement(children, { disabled: disabledAll})}
    </Form.Item>
  </Col>
);

const DealerForm = ({
  form,
  provinces,
  wards,
  loadingProvinces,
  loadingWards,
  onFinish,
  onFinishFailed,
  handleProvinceChange,
  loading,
  contractLink,
  resetForm,
  isLocked,
  isEditing,
  disabledAll,
  onStartEdit,
  onCancelEdit,
  onConfirmEdit,
  updatingEdit
}) => {
  // States cho danh sách ngân hàng
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  // Load danh sách ngân hàng khi component mount
  useEffect(() => {
    const loadBanks = async () => {
      setLoadingBanks(true);
      try {
        const response = await bankApi.getAllBanks();
        if (response.success) {
          setBanks(bankApi.formatBankForSelect(response.data));
        } else {
          message.error(response.message || 'Không thể tải danh sách ngân hàng');
          setBanks([]);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách ngân hàng:', error);
        message.error('Không thể tải danh sách ngân hàng');
        setBanks([]);
      } finally {
        setLoadingBanks(false);
      }
    };

    loadBanks();
  }, []);
  return (
    <>
    {contractLink && (
        <div className="mb-4 items-center justify-end gap-12">
          {!isEditing ? (
            <Button
              type="primary"
              onClick={onStartEdit}
              className="px-6 py-2 h-auto font-semibold rounded-lg"
            >
              Chỉnh Sửa Thông Tin
            </Button>
          ) : (
            <Space>
              <Button
                onClick={onCancelEdit}
                className="px-6 py-2 h-auto font-semibold rounded-lg"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                loading={updatingEdit}
                onClick={onConfirmEdit}
                className="px-6 py-2 h-auto font-semibold rounded-lg"
              >
                Xác nhận sửa đổi
              </Button>
            </Space>
          )}
        </div>
      )}
    <Form
      form={form}
      name="dealerForm"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      layout="vertical"
      size="large"
      className="max-w-4xl mx-auto"
      disabled={disabledAll}
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
           disabledAll={disabledAll}
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
           disabledAll={disabledAll}
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
           disabledAll={disabledAll}
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
           disabledAll={disabledAll}
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
           disabledAll={disabledAll}
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
           disabledAll={disabledAll}
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
           disabledAll={disabledAll}
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
           disabledAll={disabledAll}
        >
          <Select
            placeholder="Chọn cấp độ đại lý"
            className="rounded-lg"
          >
            <Option value={1}>Đại lý cấp 1</Option>
            <Option value={2}>Đại lý cấp 2</Option>
            <Option value={3}>Đại lý cấp 3</Option>
            <Option value={4}>Đại lý cấp 4</Option>
            <Option value={5}>Đại lý cấp 5</Option>
          </Select>
        </FormField>

        <FormField
          name="bankName"
          label="Ngân Hàng"
          icon={<BankOutlined />}
          rules={[
            { required: true, message: 'Vui lòng chọn ngân hàng!' }
          ]}
          disabledAll={disabledAll}
        >
          <Select
            placeholder="Chọn ngân hàng"
            className="rounded-lg"
            loading={loadingBanks}
            showSearch
            filterOption={(input, option) => {
            const label = (option?.label || '').toLowerCase();
            const fullname = (option?.fullname || '').toLowerCase();
            const value = (option?.value || '').toLowerCase(); // đây chính là code
            const code = (option?.children?.props?.children?.[1]?.props?.children || '')
              .toString()
              .toLowerCase();
            const search = input.toLowerCase();

            return (
              label.includes(search) ||
              fullname.includes(search) ||
              value.includes(search) || // cho phép search theo code
              code.includes(search)
            );
          }}
            notFoundContent={loadingBanks ? <Spin size="small" /> : 'Không tìm thấy ngân hàng'}
            optionLabelProp="label"
          >
            {banks.map(bank => (
              <Option
                key={bank.value}
                value={bank.value}
                label={bank.fullName}
                fullname={bank.fullName}
              >
                <div className="flex items-center gap-3">
                  <div
                style={{
                  width: 32,
                  height: 24,
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  backgroundColor: '#fff',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={bank.logo}
                  alt={bank.code}
                  style={{
                    maxWidth: 30,
                    maxHeight: 35,
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800 leading-none">{bank.fullName} </span>
                    <span className="text-xs text-gray-500">- ({bank.code})</span>
                  </div>
                </div>
              </Option>

            ))}
          </Select>
        </FormField>

        <FormField
          name="bankAccount"
          label="Số Tài Khoản Ngân Hàng"
          icon={<CreditCardOutlined />}
          rules={[
            { required: true, message: 'Vui lòng nhập số tài khoản ngân hàng!' },
            { 
              pattern: /^[0-9]{6,20}$/, 
              message: 'Số tài khoản phải có từ 6 đến 20 chữ số!' 
            }
          ]}
          disabledAll={disabledAll}
        >
          <Input
            placeholder="Nhập số tài khoản ngân hàng"
            className="rounded-lg"
            maxLength={20}
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
           disabledAll={disabledAll}
        >
          <Input.TextArea
            placeholder="Nhập địa chỉ đại lý (số nhà, tên đường, ...)"
            rows={3}
            className="rounded-lg"
          />
        </FormField>

        {/* Ghi chú quan trọng về tài khoản ngân hàng */}
        <Col xs={24}>
          <Alert
            message="Lưu ý quan trọng"
            description={
              <div>
                <div className="flex items-start gap-2 mb-2">
                  <WarningOutlined className="text-orange-500 mt-1" />
                  <span>
                    Vui lòng <strong>kiểm tra kỹ thông tin ngân hàng và số tài khoản</strong> trước khi tạo hợp đồng.
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  • Đảm bảo số tài khoản chính xác và thuộc về đại lý<br />
                  • Thông tin này sẽ được sử dụng cho các giao dịch tài chính<br />
                  • Sau khi tạo hợp đồng, việc thay đổi sẽ cần quy trình phức tạp hơn
                </div>
              </div>
            }
            type="warning"
            showIcon
            className="mb-4"
          />
        </Col>
      </Row>

      {/* Form Actions */}
      {!contractLink && (
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
              disabled={contractLink !== null}
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
      )}
      {contractLink && isEditing && (
        <Row justify="center" className="mt-10 mb-4">
          <Col>
            <Space size="large" className="flex flex-wrap justify-center">
              <Button
                onClick={onCancelEdit}
                size="large"
                className="px-8 py-3 h-auto text-base font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:shadow-md transition-all duration-200"
              >
                Hủy Sửa đổi
              </Button>
              <Button
                type="primary"
                onClick={onConfirmEdit}
                loading={updatingEdit}
                size="large"
                className="px-12 py-3 h-auto text-base font-semibold rounded-xl border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Xác nhận sửa đổi
              </Button>
            </Space>
          </Col>
        </Row>
      )}
    </Form>
    </>
  );
};

export default DealerForm;
