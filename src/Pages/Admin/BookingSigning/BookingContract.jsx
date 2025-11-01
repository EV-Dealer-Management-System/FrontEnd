import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PageContainer
} from '@ant-design/pro-components';
import {
  Table,
  Button,
  Select,
  Input,
  Space,
  Tag,
  Drawer,
  Row,
  Col,
  Typography,
  message,
  Alert,
  notification
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  FilePdfOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import AdminLayout from '../../../Components/Admin/AdminLayout';
import { ConfigProvider } from 'antd';
import viVN from 'antd/lib/locale/vi_VN';
// Import hooks logic
import useFetchContracts from '../../../App/Admin/Booking/useFetchContract';
import useContractDetails from './Components/useContractDetails';

// Reuse SignContract system components
import useContractSigning from '../../Admin/SignContract/useContractSigning';
import SignatureModal from '../../Admin/SignContract/Components/SignatureModal';
import PDFModal from '../../Admin/SignContract/Components/PDF/PDFModal';
import PDFViewer from '../../Admin/SignContract/Components/PDF/PDFViewer';

// Reuse SmartCA system components
import SmartCAStatusChecker from '../../Admin/SignContract/Components/SmartCAStatusChecker';
import AddSmartCA from '../../Admin/SignContract/Components/AddSmartCA';
import SmartCAModal from '../../Admin/SignContract/Components/SmartCAModal';
import SmartCASelector from '../../Admin/SignContract/Components/SmartCASelector';

// Reuse Contract service
import { SignContract } from '../../../App/EVMAdmin/SignContractEVM/SignContractEVM';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

function BookingContract() {
  const [searchParams] = useSearchParams();

  // State quản lý UI
  const [selectedContract, setSelectedContract] = useState(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);

  // SmartCA States
  const [smartCAInfo, setSmartCAInfo] = useState(null);
  const [selectedSmartCA, setSelectedSmartCA] = useState(null);
  const [showSmartCASelector, setShowSmartCASelector] = useState(false);
  const [showAddSmartCAModal, setShowAddSmartCAModal] = useState(false);
  // EVC User Info State
  const [evcUser, setEvcUser] = useState({ accessToken: '', userId: '' });

  // Hooks logic
  const { contracts, loading, filters, updateFilter, reload } = useFetchContracts();
  const { detail, loading: detailLoading, canSign, signProcessId, fetchContractDetails, clearDetails, getPreviewUrl, loadPdfPreview, pdfBlobUrl, pdfLoading } = useContractDetails();

  // Reuse Contract Signing system
  const contractSigning = useContractSigning();
  const contractService = useMemo(() => SignContract(), []);

  // Ref để tránh fetch EVC token nhiều lần
  const hasFetchedToken = useRef(false);

  // Lấy EVC AccessToken khi mở trang
  useEffect(() => {
  if (hasFetchedToken.current) return;
  hasFetchedToken.current = true;

  const fetchEVCUser = async () => {
    try {
      const res = await contractService.getAccessTokenForEVC();
      setEvcUser(res);
    } catch (err) {
      console.error('Lỗi lấy EVC token:', err);
    }
  };
  fetchEVCUser();
}, []);

  // Tự động search khi có bookingId từ URL
  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    if (bookingId) {
      console.log('Auto-searching for booking ID:', bookingId);
      updateFilter('search', bookingId);

      // Hiển thị thông báo cho user
      message.info(`Đang tìm kiếm hợp đồng cho Booking ID: ${bookingId.substring(0, 8)}...`);
    }
  }, [searchParams, updateFilter]);

  // Hàm kiểm tra SmartCA có lựa chọn hợp lệ không
  const getSmartCAChoices = (info) => {
    if (!info) return { hasChoices: false, hasValidChoices: false };
    const defaultExists = !!info.defaultSmartCa;
    const userCerts = Array.isArray(info.userCertificates) ? info.userCertificates : [];
    const hasChoices = defaultExists || userCerts.length > 0;
    const hasValidChoices = (info.defaultSmartCa?.isValid) || userCerts.some(c => c.isValid);
    return { hasChoices, hasValidChoices };
  };

  // Hàm xử lý mở chi tiết hợp đồng
  const handleViewContract = async (record) => {
    try {
      setDetailDrawerVisible(true);
      setSelectedContract(record);
      await fetchContractDetails(record.id);


    } catch (error) {
      console.log('Lỗi khi mở chi tiết hợp đồng:', error);
      message.error('Lỗi khi tải chi tiết hợp đồng');
      notification.error({
        message: 'Lỗi tải hợp đồng',
        description: 'Vui lòng kiểm tra kết nối hoặc thử lại.',
      });
      setDetailDrawerVisible(false);
      setSelectedContract(null);
    }
  };

  // Hàm đóng drawer chi tiết
  const handleCloseDetail = () => {
    setDetailDrawerVisible(false);
    setSelectedContract(null);
    clearDetails();
    contractSigning.resetSigningState();
  };
  // Safe render status
  const SafeStatus = ({ value }) => {
    if (!value) return <span>-</span>;
    try {
      return renderStatus(value);
    } catch {
      return <span>-</span>;
    }
  };

  // Hàm kiểm tra SmartCA cho Admin (userId cố định cho hãng)
  const handleSmartCAChecked = (smartCAData) => {
    console.log('SmartCA checked for admin:', smartCAData);
    if (!smartCAInfo) {
      setSmartCAInfo(smartCAData);
    }

    const userCerts = smartCAData?.userCertificates || [];
    if (!selectedSmartCA) {
      if (smartCAData?.defaultSmartCa?.isValid) {
        setSelectedSmartCA(smartCAData.defaultSmartCa);
      } else {
        const validCert = userCerts.find(c => c.isValid);
        if (validCert) setSelectedSmartCA(validCert);
      }
    }
  };

  // Hàm mở signature modal (có SmartCA rồi)
  const handleOpenSignModal = () => {
    if (!canSign || !signProcessId) {
      message.warning('Hợp đồng không thể ký lúc này');
      return;
    }

    if (!selectedSmartCA) {
      message.warning('Vui lòng chọn SmartCA trước khi ký');
      setShowSmartCASelector(true);
      return;
    }

    contractSigning.setShowSignatureModal(true);
  };

  // Hàm xử lý ký hợp đồng - reuse logic từ useContractSigning
  const handleSignContract = async (signatureData, signatureDisplayMode) => {
    if (!signProcessId || !detail) {
      message.error('Thiếu thông tin hợp đồng');
      return;
    }
    const positionToSign = detail.positionB || detail.waitingProcess?.position || "50,110,220,180";
    const pageToSign = detail.pageSign || detail.waitingProcess?.pageSign || 1;
    // Chuẩn bị data cho ký - theo format của EVM Admin
    const waitingProcessData = {
      id: signProcessId,
      pageSign: pageToSign,
      position: positionToSign
    };

    try {
      await contractSigning.handleSignature(
        signatureData,
        signatureDisplayMode,
        signProcessId,
        waitingProcessData,
        detail.downloadUrl,
        positionToSign,
        pageToSign,
        
      );

      // Reload contract detail sau khi ký thành công
      if (selectedContract) {
        await fetchContractDetails(selectedContract.id);
      }
      reload(); // Reload danh sách

    } catch (error) {
      console.error('Error signing contract:', error);
      message.error('Có lỗi khi ký hợp đồng');
    }
  };

  // Hàm chọn SmartCA
  const handleSelectSmartCA = (certificate) => {
    setSelectedSmartCA(certificate);
    setShowSmartCASelector(false);
    message.success(`Đã chọn chứng thư: ${certificate.commonName}`);
  };

  // Hàm mở PDF Modal
  const handleOpenPdfModal = async () => {
    if (detail?.downloadUrl) {
      // Gọi preview trước khi mở modal
      const resultUrl = await loadPdfPreview(detail.downloadUrl);
      if (resultUrl) {
        setPdfModalVisible(true);
      } else {
        message.error('Không thể tải PDF để xem trước');
      }
    } else {
      message.error('Không có đường dẫn PDF');
    }
  };

  // Render trạng thái hợp đồng
 const renderStatus = (status) => {
  const statusConfig = {
    1: { color: 'blue', text: 'Nháp' },
    2: { color: 'processing', text: 'Sẵn sàng' },
    3: { color: 'gold', text: 'Đang thực hiện' },
    4: { color: 'success', text: 'Hoàn tất' },
    5: { color: 'purple', text: 'Đang chỉnh sửa' },
    6: { color: 'green', text: 'Đã chấp nhận' },
    [-1]: { color: 'error', text: 'Từ chối' },
    [-2]: { color: 'default', text: 'Đã xóa' },
    [-3]: { color: 'volcano', text: 'Đã hủy' },
  };

    const config = statusConfig[status] || { color: 'default', text: 'Không xác định' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Cấu hình columns table
  const columns = [
    {
      title: 'Tên hợp đồng',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Chủ sở hữu',
      dataIndex: 'ownerName',
      key: 'ownerName',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: 'descend',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => <SafeStatus value={record.status} />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewContract(record)}
          >
            Xem
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageContainer
        title="Quản lý hợp đồng Booking"
        subTitle="Xem và ký hợp đồng booking từ khách hàng"
      >
        {/* Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <Row gutter={16}>
            <Col >
              <Search
                placeholder="Tìm theo tên hoặc ID"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                allowClear
              />
            </Col>
            <Col >
              <Select
                placeholder="Lọc theo trạng thái"
                value={filters.status}
                onChange={(value) => updateFilter('status', value)}
                allowClear
              >
                <Option value={1}>Nháp</Option>
                <Option value={2}>Sẵn sàng</Option>
                <Option value={3}>Đang thực hiện</Option>
                <Option value={4}>Hoàn tất</Option>
                <Option value={5}>Đang chỉnh sửa</Option>
                <Option value={6}>Đã chấp nhận</Option>
                <Option value={-1}>Từ chối</Option>
                <Option value={-2}>Đã xóa</Option>
                <Option value={-3}>Đã hủy</Option>
              </Select>
            </Col>
            <Col >
              <Select
                placeholder="Lọc theo ngày tạo"
                value={filters.dateRange}
                onChange={(value) => updateFilter('dateRange', value)}
                allowClear
              >
                <Select.Option value="today">Hôm nay</Select.Option>
                <Select.Option value="this_week">Tuần này</Select.Option>
                <Select.Option value="this_month">Tháng này</Select.Option>
              </Select>
            </Col>
            <Col  className="flex justify-end">
              <Button onClick={reload}>
                Làm mới
              </Button>
            </Col>
          </Row>
        </div>
        <ConfigProvider locale={viVN}>
          {/* Contracts Table */}
          <div className="bg-white rounded-lg shadow-sm">
            <Table
              columns={columns}
              dataSource={contracts}
              rowKey="id"
              loading={loading}
              scroll={false}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Tổng ${total} hợp đồng`,
              }}
              style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
            />
          </div>
        </ConfigProvider>
        {/* Contract Detail Drawer */}
        <Drawer
          title="Chi tiết hợp đồng Booking"
          width={1100}
          open={detailDrawerVisible}
          onClose={handleCloseDetail}
          loading={detailLoading}
          extra={
            <Space>
              {detail?.status?.value === 3 && canSign && selectedSmartCA && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleOpenSignModal}
                  loading={contractSigning.signingLoading}
                >
                  Ký hợp đồng
                </Button>
              )}
              {detail?.status?.value === 3 && canSign && !selectedSmartCA && (
                <Button
                  type="default"
                  icon={<SafetyOutlined />}
                  onClick={() => setShowSmartCASelector(true)}
                >
                  Chọn SmartCA
                </Button>
              )}
              {detail?.status?.value !== 3 && (
                <Button
                  type="default"
                  disabled
                >
                  Ký hợp đồng
                </Button>
              )}
            </Space>
          }
          >
          {detail && (
            <Row gutter={16} className="h-full">
              {/* Left Column - Contract Info & SmartCA */}
              <Col span={8}>
                <div className="space-y-4">
                  {/* Thông tin cơ bản */}
                  <div className="border rounded-lg p-4">
                    <Title level={5}>Thông tin hợp đồng</Title>
                    <div className="space-y-2 text-sm">
                      <div><Text strong>Số hợp đồng:</Text> {detail.no}</div>
                      <div><Text strong>Chủ đề:</Text> {detail.subject}</div>
                      <div><Text strong>Trạng thái:</Text> <SafeStatus value={detail.status.value} /></div>
                      <div><Text strong>Ngày tạo:</Text> {dayjs(detail.createdDate).format('DD/MM/YYYY HH:mm')}</div>
                    </div>
                  </div>

                  {/* SmartCA Status */}
                  {/* SmartCA Status - chỉ hiển thị khi trạng thái = 3 */}
                  {detail?.status?.value === 3 && (
                    <div className="border rounded-lg p-4">
                      <Title level={5}>SmartCA cho Admin</Title>

                      {!smartCAInfo && (
                        <>
                          <SmartCAStatusChecker
                            userId={evcUser.userId}
                            contractService={contractService}
                            onChecked={handleSmartCAChecked}
                          />
                          <Alert
                            message="Đang kiểm tra SmartCA..."
                            type="info"
                            showIcon
                            className="mb-3"
                          />
                        </>
                      )}

                      {/* Khi đã có kết quả kiểm tra */}
                      {smartCAInfo && (() => {
                        const { hasChoices, hasValidChoices } = getSmartCAChoices(smartCAInfo);

                        if (!hasChoices) {
                          return (
                            <>
                              <Alert
                                message="Không tìm thấy chứng thư số"
                                description="Bạn có thể thêm SmartCA mới bằng CCCD/CMND (serial tuỳ chọn)."
                                type="warning"
                                showIcon
                                className="mb-3"
                              />
                              <Button type="primary" onClick={() => setShowAddSmartCAModal(true)}>
                                Thêm SmartCA
                              </Button>

                              <AddSmartCA
                                visible={showAddSmartCAModal}
                                onCancel={() => setShowAddSmartCAModal(false)}
                                onSuccess={(res) => {
                                  setSmartCAInfo(prev => ({
                                    ...(prev || {}),
                                    userCertificates: [...(prev?.userCertificates || []), res.smartCAData].filter(Boolean),
                                    defaultSmartCa: (prev?.defaultSmartCa) || null,
                                  }));
                                  if (res.hasValidSmartCA && res.smartCAData) {
                                    setSelectedSmartCA(res.smartCAData);
                                  }
                                  setShowAddSmartCAModal(false);
                                  message.success('SmartCA mới đã được thêm!');
                                }}
                                contractInfo={{
                                  userId: evcUser.userId,
                                  accessToken: evcUser.accessToken
                                }}
                              />
                            </>
                          );
                        }

                        return (
                          <div className="space-y-3">
                            {selectedSmartCA ? (
                              <Alert
                                message="SmartCA đã sẵn sàng"
                                description={
                                  <div>
                                    <div><strong>Chứng thư:</strong> {selectedSmartCA.commonName}</div>
                                    <div><strong>UID:</strong> {selectedSmartCA.uid}</div>
                                  </div>
                                }
                                type={hasValidChoices ? 'success' : 'warning'}
                                action={
                                  <Button size="small" onClick={() => setShowSmartCASelector(true)}>
                                    Đổi
                                  </Button>
                                }
                              />
                            ) : (
                              <Alert
                                message={hasValidChoices ? 'Chưa chọn SmartCA' : 'Chưa có chứng thư hợp lệ'}
                                description={hasValidChoices
                                  ? 'Vui lòng chọn chứng thư số để ký hợp đồng'
                                  : 'Hệ thống có chứng thư nhưng chưa hợp lệ; bạn có thể thêm chứng thư mới.'}
                                type="warning"
                                action={
                                  <Space>
                                    {hasValidChoices ? (
                                      <Button size="small" type="primary" onClick={() => setShowSmartCASelector(true)}>
                                        Chọn
                                      </Button>
                                    ) : (
                                      <>
                                        <Button size="small" onClick={() => setShowSmartCASelector(true)}>
                                          Xem danh sách
                                        </Button>
                                        <Button size="small" type="primary" onClick={() => setShowAddSmartCAModal(true)}>
                                          Thêm SmartCA
                                        </Button>
                                      </>
                                    )}
                                  </Space>
                                }
                              />
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                </div>
              </Col>

              {/* Right Column - PDF Viewer */}
              <Col span={16}>

                <div className="border rounded-lg p-4 h-[600px]">
                  <div className="flex justify-between items-center mb-3">
                    <Title level={5}>Xem trước hợp đồng</Title>
                    <Space>
                      <Button
                        type="primary"
                        size="small"
                        icon={<FilePdfOutlined />}
                        onClick={handleOpenPdfModal}
                        loading={pdfLoading}
                      >
                        Cửa Sổ Pop-up
                      </Button>
                    </Space>
                  </div>

                  {detail.downloadUrl ? (
                    <div className="h-[540px] border rounded">
                      <PDFViewer
                        contractNo={detail.no || 'Booking'}
                        pdfUrl={getPreviewUrl() || pdfBlobUrl}
                        showAllPages={false}
                        scale={0.8}
                      />
                    </div>
                  ) : (
                    <div className="h-[540px] flex items-center justify-center bg-gray-50 border rounded">
                      <div className="text-center text-gray-500">
                        <FilePdfOutlined className="text-4xl mb-2" />
                        <div>Không có PDF để hiển thị</div>
                      </div>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          )}
        </Drawer>

        {/* Signature Modal - Reuse từ SignContract system */}
        <SignatureModal
          visible={contractSigning.showSignatureModal}
          onCancel={() => contractSigning.setShowSignatureModal(false)}
          onSign={handleSignContract}
          loading={contractSigning.signingLoading}
        />

        {/* SmartCA Modal - Reuse từ SignContract system */}
        <SmartCAModal
          visible={contractSigning.showSmartCAModal}
          onCancel={() => contractSigning.setShowSmartCAModal(false)}
          contractNo={selectedContract?.id?.substring(0, 8) || 'Booking'}
        />

        {/* SmartCA Selector Modal */}
        <SmartCASelector
          visible={showSmartCASelector}
          onCancel={() => setShowSmartCASelector(false)}
          onSelect={handleSelectSmartCA}
          smartCAData={smartCAInfo}
          loading={contractSigning.signingLoading}
          currentSelectedId={selectedSmartCA?.id}
          contractService={contractService}
          userId={evcUser.userId} // Fixed admin user ID for EVM
        />

        {/* PDF Modal - Reuse từ SignContract system */}
        <PDFModal
          visible={pdfModalVisible}
          onClose={() => setPdfModalVisible(false)}
          contractNo={selectedContract?.id?.substring(0, 8) || 'Booking'}
          pdfUrl={pdfBlobUrl || getPreviewUrl()}
          title={`Hợp đồng Booking - ${selectedContract?.name || 'N/A'}`}
        />
      </PageContainer>
    </AdminLayout>
  );

}


export default BookingContract;
