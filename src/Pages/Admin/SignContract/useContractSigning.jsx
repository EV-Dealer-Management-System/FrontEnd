import { useState } from 'react';
import { message, Modal } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { SignContract } from '../../../App/EVMAdmin/SignContractEVM/SignContractEVM';
import AddSmartCA from './Components/AddSmartCA';

// Custom hook để quản lý logic ký hợp đồng
const useContractSigning = () => {
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signingLoading, setSigningLoading] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);
  const [signatureCompleted, setSignatureCompleted] = useState(false);
  const [showSmartCAModal, setShowSmartCAModal] = useState(false);
  const [showAppVerifyModal, setShowAppVerifyModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showAddSmartCA, setShowAddSmartCA] = useState(false);

  // State cho modal chọn vị trí chữ ký
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [pendingSignatureData, setPendingSignatureData] = useState(null);

  // Handle signature - Bước 1: Lưu dữ liệu chữ ký và mở modal chọn vị trí
  const handleSignature = async (signatureData, signatureDisplayMode, contractId, waitingProcessData, contractLink) => {
    try {
      if (!contractId || !signatureData) {
        message.error('Không thể xác nhận vị trí chữ ký. Thiếu thông tin hợp đồng hoặc chữ ký.');
        return;
      }

      // Set preview image
      setPreviewImage(signatureData);

      // Lưu dữ liệu chữ ký tạm thời và mở modal chọn vị trí
      setPendingSignatureData({
        signatureData,
        signatureDisplayMode,
        contractId,
        waitingProcessData,
        contractLink
      });

      // Đóng modal ký và mở modal chọn vị trí
      setShowSignatureModal(false);
      setShowPositionModal(true);
    } catch (error) {
      console.error('Error preparing signature:', error);
      message.error('Có lỗi không mong muốn khi chuẩn bị chữ ký');
    }
  };

  // Handle position confirmation - Bước 2: Thực hiện ký với vị trí đã chọn
  const handlePositionConfirm = async (positionData) => {
    try {
      if (!pendingSignatureData) {
        message.error('Không có dữ liệu chữ ký. Vui lòng thực hiện lại.');
        return;
      }

      const { signatureData, signatureDisplayMode, waitingProcessData } = pendingSignatureData;
      const { positionString, signingPage } = positionData;

      // Đóng modal chọn vị trí và chuyển sang xác thực
      setShowPositionModal(false);
      setSigningLoading(true);
      setShowSmartCAModal(true);

      const signContractApi = SignContract();

      console.log('Signature position:', positionString);
      console.log('Signing page:', signingPage);

      const signData = {
        waitingProcess: waitingProcessData,
        reason: "Ký hợp đồng đại lý",
        reject: false,
        signatureImage: signatureData,
        signingPage: signingPage,
        signingPosition: positionString,
        signatureText: "EVM COMPANY",
        fontSize: 14,
        showReason: true,
        confirmTermsConditions: true,
        signatureDisplayMode: signatureDisplayMode
      };

      console.log('Signature data format:', {
        fullDataURL: signatureData.substring(0, 100) + '...',
        dataURLLength: signatureData.length,
        waitingProcess: waitingProcessData,
        hasCorrectPrefix: signatureData.startsWith('data:image/png;base64,'),
        position: positionString,
        page: signingPage
      });

      const result = await signContractApi.handleSignContract(signData);

      console.log('Digital signature result:', JSON.stringify(result, null, 2));

      // Ký điện tử thành công, chuyển sang bước xác thực app
      if (result && result.statusCode === 200 && result.isSuccess) {
        setSignatureCompleted(true);
        setShowSmartCAModal(false);
        setShowAppVerifyModal(true);
        message.success('Ký điện tử thành công! Vui lòng xác thực trên ứng dụng.');
        // Clear pending data
        setPendingSignatureData(null);
      } else {
        // Xử lý lỗi ký điện tử
        const errorMessage = result?.message ||
          result?.result?.messages?.[0] ||
          'Có lỗi khi ký điện tử';
        message.error(errorMessage);
        setShowSmartCAModal(false);
      }
    } catch (error) {
      console.error('Error in digital signature:', error);
      message.error('Có lỗi không mong muốn khi ký điện tử');
      setShowSmartCAModal(false);
    } finally {
      setSigningLoading(false);
    }
  };

  // Handle app verification (Step 2)
  const handleAppVerification = async (contractNo) => {
    if (!signatureCompleted) {
      message.error('Vui lòng hoàn thành ký điện tử trước!');
      return;
    }

    setSigningLoading(true);
    try {
      setShowAppVerifyModal(false);
      setContractSigned(true);
      // Hiển thị popup thành công cuối cùng
      Modal.success({
        title: (
          <span className="text-green-600 font-semibold flex items-center">
            <CheckOutlined className="mr-2" />
            Ký Hợp Đồng Hoàn Tất!
          </span>
        ),
        content: (
          <div className="py-4">
            <div className="text-base mb-3">🎉 Hợp đồng đã được ký và xác thực thành công!</div>
            <div className="text-sm text-gray-600">
              Hợp đồng số: <strong>{contractNo}</strong>
            </div>
            <div className="text-sm text-gray-600">
              Trạng thái: <strong className="text-green-600">Đã ký và xác thực ✅</strong>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Hợp đồng đã được hoàn tất với chữ ký điện tử và xác thực từ ứng dụng
            </div>
          </div>
        ),
        okText: 'Đóng',
        centered: true,
        width: 450,
        okButtonProps: {
          className: 'bg-green-500 border-green-500 hover:bg-green-600'
        }
      });

      message.success('Xác thực thành công! Hợp đồng đã hoàn tất.');
    } catch (error) {
      console.error('Error in app verification:', error);
      message.error('Có lỗi khi xác thực từ ứng dụng');
    } finally {
      setSigningLoading(false);
    }
  };

  // Handle SmartCA success
  const handleSmartCASuccess = (smartCAData) => {
    console.log('SmartCA added:', smartCAData);
    setShowAddSmartCA(false);

    // Hiển thị thông báo thành công với thông tin chi tiết
    if (smartCAData.hasValidSmartCA) {
      message.success('SmartCA đã được thêm và kích hoạt thành công!');
    } else {
      message.warning('SmartCA đã được thêm nhưng chưa được kích hoạt. Vui lòng kiểm tra lại.');
    }
  };

  // Reset signing state
  const resetSigningState = () => {
    setContractSigned(false);
    setShowSignatureModal(false);
    setShowAppVerifyModal(false);
    setShowSmartCAModal(false);
    setSignatureCompleted(false);
    setSigningLoading(false);
    setPreviewImage(null);
    setShowAddSmartCA(false);
    setShowPositionModal(false);
    setPendingSignatureData(null);
  };

  return {
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
    showAddSmartCA,
    setShowAddSmartCA,
    showPositionModal,
    setShowPositionModal,
    pendingSignatureData,
    handleSignature,
    handlePositionConfirm,
    handleAppVerification,
    handleSmartCASuccess,
    resetSigningState,
    AddSmartCAComponent: (contractInfo) => (
      <AddSmartCA
        visible={showAddSmartCA}
        onCancel={() => setShowAddSmartCA(false)}
        onSuccess={handleSmartCASuccess}
        contractInfo={contractInfo}
      />
    )
  };
};

export default useContractSigning;