import { useState } from 'react';
import { message, Modal } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { SignContract } from '../../../App/EVMAdmin/SignContract';

// Custom hook để quản lý logic ký hợp đồng
const useContractSigning = () => {
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signingLoading, setSigningLoading] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);
  const [signatureCompleted, setSignatureCompleted] = useState(false);
  const [showSmartCAModal, setShowSmartCAModal] = useState(false);
  const [showAppVerifyModal, setShowAppVerifyModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Handle signature directly
  const handleSignature = async (signatureData, signatureDisplayMode, contractId, waitingProcessData) => {
    try {
      if (!contractId || !signatureData) {
        message.error('Không thể xác nhận vị trí chữ ký. Thiếu thông tin hợp đồng hoặc chữ ký.');
        return;
      }

      // Set preview image
      setPreviewImage(signatureData);

      // Chuyển sang trạng thái xác thực
      setShowSignatureModal(false);
      setSigningLoading(true);
      setShowSmartCAModal(true);
      
      const signContractApi = SignContract();
      
      // Sử dụng vị trí cố định thay vì chọn vị trí
      const positionString = "32,472,202,562";
      
      console.log('Signature position:', positionString);
      
      const signData = {
        waitingProcess: waitingProcessData,
        reason: "Ký hợp đồng đại lý",
        reject: false,
        signatureImage: signatureData,
        signingPage: 0,
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
        processId: contractId,
        waitingProcess: waitingProcessData,
        hasCorrectPrefix: signatureData.startsWith('data:image/png;base64,'),
        position: positionString
      });

      const result = await signContractApi.handleSignContract(signData);
      
      console.log('Digital signature result:', JSON.stringify(result, null, 2));
      
      // Ký điện tử thành công, chuyển sang bước xác thực app
      if (result && result.statusCode === 200 && result.isSuccess) {
        setSignatureCompleted(true);
        setShowSmartCAModal(false);
        setShowAppVerifyModal(true);
        message.success('Ký điện tử thành công! Vui lòng xác thực trên ứng dụng.');
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

  // Reset signing state
  const resetSigningState = () => {
    setContractSigned(false);
    setShowSignatureModal(false);
    setShowAppVerifyModal(false);
    setShowSmartCAModal(false);
    setSignatureCompleted(false);
    setSigningLoading(false);
    setPreviewImage(null);
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
    handleSignature,
    handleAppVerification,
    resetSigningState
  };
};

export default useContractSigning;