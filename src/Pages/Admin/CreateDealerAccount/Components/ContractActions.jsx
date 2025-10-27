import React from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Spin
} from 'antd';
import {
  EditOutlined,
  CheckCircleOutlined,
  FilePdfOutlined,
  DownloadOutlined
} from '@ant-design/icons';

// Import PDF components
import ContractViewer from '../../SignContract/Components/ContractViewer';

const { Title, Text } = Typography;

const ContractActions = ({
  contractLink,
  contractNo,
  contractConfirmed,
  confirming,
  loadingPdf,
  getPdfDisplayUrl,
  onConfirm,
  onEdit,
  onDownload,
  onReset
}) => {
  return (
    <>
      {/* Contract Viewer and Actions - when contract is created but not confirmed */}
      {contractLink && !contractConfirmed && (
        <>
          <ContractViewer
            contractLink={contractLink}
            contractNo={contractNo}
            contractSigned={false}
            onSign={null}
            onDownload={onDownload}
            onNewContract={onReset}
            viewerLink={getPdfDisplayUrl()}
            loading={loadingPdf}
          />

          {/* Contract Ready Actions */}
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
                  onClick={onEdit}
                  size="large"
                  disabled={confirming}
                  className="px-6 py-2 h-auto font-semibold rounded-lg"
                >
                  Chỉnh sửa nội dung
                </Button>
                
                <Button 
                  type="primary"
                  size="large"
                  onClick={onConfirm}
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

      {/* Contract Confirmed Success Message */}
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
                onClick={onReset}
                className="px-8 py-3 h-auto font-semibold rounded-lg bg-blue-500 hover:bg-blue-600 border-blue-500"
              >
                Tạo hợp đồng mới ngay
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* PDF Preview not available fallback */}
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
    </>
  );
};

export default ContractActions;
