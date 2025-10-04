import React, { useState } from 'react';
import { Card, Form, Input, Button, Row, Col, Typography, Steps, Space, Tag, Divider, Modal, message } from 'antd';
import { FileTextOutlined, SafetyOutlined, EditOutlined, CheckCircleOutlined, FilePdfOutlined, ReloadOutlined } from '@ant-design/icons';

// Reuse service
import { ContractService } from '../App/Home/SignContractCustomer';

// Reuse components từ CreateAccount
import SignatureModal from './Admin/SignContract/Components/SignatureModal';
import AppVerifyModal from './Admin/SignContract/Components/AppVerifyModal';
import PDFViewerModal from './Admin/SignContract/Components/PDFViewerModal';
import SmartCAModal from './Admin/SignContract/Components/SmartCAModal';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

function ContractPage() {
  const [form] = Form.useForm();
  const contractService = ContractService();

  // States chính
  const [loading, setLoading] = useState(false);
  const [contractInfo, setContractInfo] = useState(null);
  const [smartCAInfo, setSmartCAInfo] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // PDF viewer
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfKey, setPdfKey] = useState(0);

  // Flow ký
  const [signingLoading, setSigningLoading] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showAppVerifyModal, setShowAppVerifyModal] = useState(false);
  const [signatureCompleted, setSignatureCompleted] = useState(false); // FIX: state bị thiếu
  const [contractSigned, setContractSigned] = useState(false); // FIX: state bị thiếu

  // Modal Thêm SmartCA
  const [smartCAVisible, setSmartCAVisible] = useState(false);
  const [addingSmartCA, setAddingSmartCA] = useState(false);
  const [smartCAForm] = Form.useForm();

  // Thêm state cho modal chờ ký điện tử
  const [showSmartCAModal, setShowSmartCAModal] = useState(false);

  // Lấy thông tin hợp đồng theo processCode
  async function getContractInfo(processCode) {
    try {
      setLoading(true);
      const result = await contractService.handleGetContractInfo(processCode);
      if (result.success) {
        setContractInfo(result.data);
        setCurrentStep(1);
        await checkSmartCA(result.data.processedByUserId);
        message.success('Lấy thông tin hợp đồng thành công!');
      } else {
        message.error(result.error || 'Không lấy được thông tin hợp đồng');
      }
    } catch (e) {
      console.error(e);
      message.error('Có lỗi khi lấy thông tin hợp đồng');
    } finally {
      setLoading(false);
    }
  }

  // Kiểm tra SmartCA của user
  async function checkSmartCA(userId) {
    try {
      const result = await contractService.handleCheckSmartCA(userId);
      if (result.success) {
        setSmartCAInfo(result.data);
        const ok = contractService.isSmartCAValid(result.data);
        setCurrentStep(ok ? 3 : 2);
        if (ok) message.success('SmartCA đã sẵn sàng để ký!');
      } else {
        setCurrentStep(2);
        message.error(result.error || 'Không kiểm tra được SmartCA');
      }
    } catch (e) {
      console.error(e);
      setCurrentStep(2);
      message.error('Có lỗi khi kiểm tra SmartCA');
    }
  }

  // Thêm SmartCA (token lấy từ contractInfo.accessToken)
  async function addSmartCA(values) {
    if (!contractInfo?.processedByUserId || !contractInfo?.accessToken) {
      message.error('Thiếu thông tin user/token để thêm SmartCA');
      return;
    }
    try {
      setSigningLoading(true);
      const result = await contractService.handleAddSmartCA({
        userId: contractInfo.processedByUserId,
        userName: values.cccd,
        serialNumber: values.serialNumber,
        accessToken: contractInfo.accessToken
      });
      if (result.success) {
        setSmartCAInfo(result.data);
        const ok = contractService.isSmartCAValid(result.data);
        setCurrentStep(ok ? 3 : 2);
        message.success(result.message || 'Thêm SmartCA thành công');
      } else {
        message.error(result.error || 'Thêm SmartCA thất bại');
      }
    } catch (e) {
      console.error(e);
      message.error('Có lỗi khi thêm SmartCA');
    } finally {
      setSigningLoading(false);
    }
  }

  // Ép reload PDF (không gọi lại API info) bằng cache-busting
  function refreshPdfCache(reason = '') {
    if (!contractInfo?.downloadUrl) return;
    const base = contractInfo.downloadUrl;
    const freshUrl = `${base}${base.includes('?') ? '&' : '?'}_ts=${Date.now()}`;
    setPdfBlob(freshUrl);
    setPdfKey(k => k + 1);
    // console.log('PDF refreshed:', { reason, freshUrl });
  }

  // Mở modal PDF
  function openPDF() {
    if (!contractInfo?.downloadUrl) {
      message.warning('Không có link PDF');
      return;
    }
    refreshPdfCache('open');
    setPdfModalVisible(true);
  }

  // Mở modal ký

  // Nhận dữ liệu chữ ký từ SignatureModal và gọi API ký
  async function handleSignatureFromModal(signatureDataURL, displayMode = 2) {
    if (!contractInfo?.processId || !contractInfo?.accessToken) {
      message.error('Thiếu thông tin process hoặc token để ký.');
      return;
    }
    
    setSigningLoading(true);
    setShowSignatureModal(false);
    
    // Hiển thị modal chờ ký điện tử
    setShowSmartCAModal(true);
    
    // Log dữ liệu trước khi gửi API
    console.log('=== DỮ LIỆU GỬI KHI KÝ HỢP ĐỒNG ===');
    console.log('1. Thông tin cơ bản:', {
      processId: contractInfo.processId,
      accessToken: contractInfo.accessToken ? `${contractInfo.accessToken.substring(0, 30)}...` : 'null',
      reason: 'Ký hợp đồng điện tử',
      displayMode: displayMode,
      hasSignatureImage: !!signatureDataURL,
      signatureImageSize: signatureDataURL ? signatureDataURL.length : 0
    });
    
    console.log('2. Contract Info đầy đủ:', contractInfo);
    
    console.log('3. Signature Data (50 ký tự đầu):', 
      signatureDataURL ? signatureDataURL.substring(0, 50) + '...' : 'null'
    );
    
    try {
      const result = await contractService.handleDigitalSignature({
        processId: contractInfo.processId,
        reason: 'Ký hợp đồng điện tử',
        signatureImage: signatureDataURL,
        signatureDisplayMode: displayMode,
        accessToken: contractInfo.accessToken
      });
      
      // Log kết quả từ API
      console.log('=== KẾT QUẢ TRẢ VỀ TỪ API ===');
      console.log('Result:', result);
      
      // Đóng modal chờ ký điện tử
      setShowSmartCAModal(false);
      
      if (result.success) {
        message.success('Ký điện tử thành công! Vui lòng xác thực.');
        refreshPdfCache('afterSign');
        setSignatureCompleted(true);
        setShowAppVerifyModal(true);
      } else {
        message.error(result.error || 'Ký thất bại.');
      }
    } catch (e) {
      console.error('=== LỖI KHI GỬI API KÝ ===');
      console.error('Error:', e);
      console.error('Error message:', e.message);
      console.error('Error response:', e.response?.data);
      
      // Đóng modal chờ ký điện tử khi có lỗi
      setShowSmartCAModal(false);
      message.error('Có lỗi không mong muốn khi ký điện tử');
    } finally {
      setSigningLoading(false);
    }
  }

  // Xác thực ứng dụng (Step 2)
  async function handleAppVerification() {
    if (!signatureCompleted) {
      message.error('Vui lòng hoàn thành ký điện tử trước!');
      return;
    }
    setSigningLoading(true);
    try {
      const result = await contractService.handleAppVerification({
        processId: contractInfo.processId
      });
      if (result.success) {
        setShowAppVerifyModal(false);
        setCurrentStep(4);
        setContractSigned(true); // FIX: cập nhật trạng thái đã ký
        refreshPdfCache('afterVerify');

        Modal.success({
          title: (
            <span className="text-green-600 font-semibold flex items-center">
              <CheckCircleOutlined className="mr-2" />
              Ký Hợp Đồng Hoàn Tất!
            </span>
          ),
          content: (
            <div className="py-4">
              <div className="text-base mb-3">🎉 Hợp đồng đã được ký và xác thực thành công!</div>
              <div className="text-sm text-gray-600">
                Process ID: <strong>{contractInfo.processId?.substring(0, 8)}...</strong>
              </div>
              <div className="text-sm text-gray-600">
                Trạng thái: <strong className="text-green-600">Đã ký và xác thực ✅</strong>
              </div>
            </div>
          ),
          okText: 'Đóng',
          centered: true,
          width: 450,
          okButtonProps: { className: 'bg-green-500 border-green-500 hover:bg-green-600' }
        });
        message.success('Xác thực thành công! Hợp đồng đã hoàn tất.');
      } else {
        message.error(result.error || 'Xác thực thất bại.');
      }
    } catch (e) {
      console.error(e);
      message.error('Có lỗi khi xác thực từ ứng dụng');
    } finally {
      setSigningLoading(false);
    }
  }

  // Submit form
  async function onFinish(values) {
    await getContractInfo(values.processCode);
  }

  // Reset flow
  function resetForm() {
    form.resetFields();
    setContractInfo(null);
    setSmartCAInfo(null);
    setCurrentStep(0);
    setPdfBlob(null);
    setPdfModalVisible(false);
    setPdfKey(0);
    setSignatureCompleted(false);
    setContractSigned(false);
    setShowSignatureModal(false);
    setShowAppVerifyModal(false);
    setShowSmartCAModal(false);
    setSigningLoading(false);
  }

  // Mở modal nhập thông tin SmartCA (đơn giản, không phụ thuộc Form instance)
  function openAddSmartCA() {
    smartCAForm.resetFields();
    setSmartCAVisible(true);
  }

  // Submit thêm SmartCA
  async function submitSmartCA() {
    if (!contractInfo?.processedByUserId || !contractInfo?.accessToken) {
      message.error('Thiếu thông tin user/token để thêm SmartCA');
      return;
    }
    try {
      const values = await smartCAForm.validateFields();
      setAddingSmartCA(true);

      const result = await contractService.handleAddSmartCA({
        userId: contractInfo.processedByUserId,
        userName: values.cccd,
        serialNumber: values.serialNumber,
        accessToken: contractInfo.accessToken
      });

      if (result.success) {
        message.success(result.message || 'Thêm SmartCA thành công');
        setSmartCAInfo(result.data);

        const ok = contractService.isSmartCAValid(result.data);
        setCurrentStep(ok ? 3 : 2);
        setSmartCAVisible(false);
      } else {
        message.error(result.error || 'Thêm SmartCA thất bại');
      }
    } catch (e) {
      if (e?.errorFields) {
        // lỗi validate form, không log
      } else {
        console.error('Add SmartCA error:', e);
        message.error('Có lỗi khi thêm SmartCA');
      }
    } finally {
      setAddingSmartCA(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2} className="flex items-center justify-center mb-2">
            <SafetyOutlined className="text-blue-500 mr-3" />
            Ký Hợp Đồng Điện Tử
          </Title>
          <Text className="text-gray-600">Nhập mã process để xem và ký hợp đồng</Text>
        </div>

        {/* Steps */}
        <Card className="mb-6">
          <Steps current={currentStep} className="mb-4">
            <Step title="Nhập mã process" icon={<FileTextOutlined />} />
            <Step title="Xem hợp đồng" icon={<FilePdfOutlined />} />
            <Step title="Kiểm tra SmartCA" icon={<SafetyOutlined />} />
            <Step title="Ký hợp đồng" icon={<EditOutlined />} />
            <Step title="Hoàn thành" icon={<CheckCircleOutlined />} />
          </Steps>
        </Card>

        {/* Form nhập processCode */}
        {currentStep === 0 && (
          <Card
            title={<span className="flex items-center"><FileTextOutlined className="text-blue-500 mr-2" />Nhập Mã Process</span>}
            className="mb-6"
          >
            <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={18}>
                  <Form.Item
                    name="processCode"
                    label="Mã Process"
                    rules={[{ required: true, message: 'Vui lòng nhập mã process!' }]}
                  >
                    <Input placeholder="Nhập mã process" size="large" prefix={<FileTextOutlined className="text-gray-400" />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item label=" " className="mb-0">
                    <Button type="primary" htmlType="submit" loading={loading} size="large" className="w-full bg-blue-500 hover:bg-blue-600">
                      Lấy thông tin
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        )}

        {/* Thông tin hợp đồng + SmartCA */}
        {contractInfo && (
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} lg={12}>
              <Card
                title={<span className="flex items-center"><FilePdfOutlined className="text-red-500 mr-2" />Thông Tin Hợp Đồng</span>}
                extra={<Button onClick={resetForm} size="small" icon={<ReloadOutlined />}>Nhập mã khác</Button>}
              >
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Text strong>Process ID:</Text>
                    <Text className="text-gray-600 font-mono text-sm">{contractInfo.processId?.substring(0, 8)}...</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text strong>User ID:</Text>
                    <Text className="text-gray-600">{contractInfo.processedByUserId}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text strong>Trạng thái:</Text>
                    <Tag color={contractSigned ? 'green' : 'blue'}>{contractSigned ? 'Đã ký' : 'Chưa ký'}</Tag>
                  </div>

                  <Divider className="my-3" />
                  <Space>
                    <Button
                      type="primary"
                      icon={<FilePdfOutlined />}
                      onClick={openPDF}
                      className="bg-red-500 hover:bg-red-600 border-red-500"
                    >
                      Xem PDF
                    </Button>
                    <Button href={contractInfo.downloadUrl} target="_blank" icon={<FilePdfOutlined />}>
                      Mở tab mới
                    </Button>
                  </Space>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <SmartCACard
                smartCAInfo={smartCAInfo}
                onAddSmartCA={openAddSmartCA}
                onSign={() => setShowSignatureModal(true)}
                signingLoading={signingLoading}
                contractSigned={contractSigned}
              />
            </Col>
          </Row>
        )}

        {/* Sau khi hoàn tất */}
        {currentStep === 4 && (
          <Card className="mb-6">
            <div className="text-center py-8">
              <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
              <Title level={3} className="text-green-600 mb-2">Ký Hợp Đồng Thành Công!</Title>
              <Paragraph className="text-gray-600 mb-6">Bạn có thể tải hợp đồng đã ký.</Paragraph>
              <Space>
                <Button type="primary" size="large" href={contractInfo?.downloadUrl} target="_blank" icon={<FilePdfOutlined />} className="bg-green-500 hover:bg-green-600 border-green-500">
                  Tải hợp đồng đã ký
                </Button>
                <Button size="large" onClick={resetForm}>Ký hợp đồng khác</Button>
              </Space>
            </div>
          </Card>
        )}

        {/* PDF Modal – reuse PDFViewerModal (không bắt buộc Google Docs) */}
        {contractInfo && (
          <PDFViewerModal
            key={pdfKey}
            visible={pdfModalVisible}
            onCancel={() => setPdfModalVisible(false)}
            contractLink={pdfBlob || contractInfo.downloadUrl}
            contractNo={`${contractInfo.processId?.slice(0, 8) || 'HĐ'}...`}
          />
        )}

        {/* Signature Modal – reuse */}
        <SignatureModal
          visible={showSignatureModal}
          onCancel={() => setShowSignatureModal(false)}
          onSign={handleSignatureFromModal}
          loading={signingLoading}
        />

        {/* App Verify Modal – reuse */}
        <AppVerifyModal
          visible={showAppVerifyModal}
          onCancel={() => setShowAppVerifyModal(false)}
          onVerify={handleAppVerification}
          loading={signingLoading}
          signatureCompleted={signatureCompleted}
        />

        {/* Modal Thêm SmartCA (Form đơn giản) */}
        <Modal
          open={smartCAVisible}
          title="Thêm SmartCA"
          onCancel={() => setSmartCAVisible(false)}
          onOk={submitSmartCA}
          confirmLoading={addingSmartCA}
          okText="Thêm"
          cancelText="Hủy"
          destroyOnClose
        >
          <Form form={smartCAForm} layout="vertical">
            <Form.Item
              name="cccd"
              label="CCCD/CMND"
              rules={[{ required: true, message: 'Vui lòng nhập CCCD/CMND' }]}
            >
              <Input placeholder="Nhập CCCD/CMND" />
            </Form.Item>
            <Form.Item name="serialNumber" label="Serial Number (tuỳ chọn)">
              <Input placeholder="Serial Number nếu có" />
            </Form.Item>
          </Form>
        </Modal>

        {/* SmartCA Modal chờ ký điện tử - reuse từ CreateAccount */}
        <SmartCAModal
          visible={showSmartCAModal}
          onCancel={() => {
            setShowSmartCAModal(false);
            setSigningLoading(false);
          }}
          contractNo={contractInfo?.processId?.substring(0, 8) || 'HĐ-Unknown'}
        />
      </div>
    </div>
  );
}

// Component hiển thị thông tin SmartCA (giữ lại phiên bản ngắn gọn)
const SmartCACard = ({ smartCAInfo, onAddSmartCA, onSign, signingLoading, contractSigned }) => {
  const ready =
    !!smartCAInfo?.defaultSmartCa?.isValid ||
    (smartCAInfo?.userCertificates || []).some(c => c.isValid);

  return (
    <Card
      title={<span className="flex items-center"><SafetyOutlined className="text-blue-500 mr-2" />SmartCA</span>}
      extra={!ready && <Tag color="orange">Chưa sẵn sàng</Tag>}
    >
      {!ready ? (
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded p-3 mb-3">
            <div className="font-medium">SmartCA chưa sẵn sàng</div>
            <div className="text-sm">Bạn cần thêm SmartCA để có thể ký hợp đồng</div>
          </div>
          <Button type="primary" danger onClick={onAddSmartCA} disabled={contractSigned}>
            Thêm SmartCA
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-green-50 border border-green-200 text-green-700 rounded p-3 mb-3">
            <div className="font-medium">{contractSigned ? "Đã ký thành công" : "SmartCA sẵn sàng"}</div>
            <div className="text-sm">
              {smartCAInfo?.defaultSmartCa?.commonName || 'Đã có chứng chỉ hợp lệ'}
            </div>
          </div>
          <Button 
            type="primary" 
            onClick={onSign} 
            loading={signingLoading} 
            disabled={contractSigned}
            className={contractSigned ? "bg-green-500" : "bg-blue-500"}
          >
            {contractSigned ? "Đã Ký Thành Công" : "Ký Hợp Đồng"}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ContractPage;
