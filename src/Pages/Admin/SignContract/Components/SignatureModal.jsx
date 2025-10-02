import React, { useState, useRef } from 'react';
import { 
  Modal, 
  Button, 
  Alert, 
  Radio, 
  Space, 
  Tabs, 
  Upload, 
  Image,
  Typography,
  message
} from 'antd';
import { 
  EditOutlined, 
  UploadOutlined, 
  PictureOutlined, 
  ClearOutlined, 
  CheckOutlined 
} from '@ant-design/icons';
import SignatureCanvas from 'react-signature-canvas';

const { Text } = Typography;

// Modal ký điện tử
const SignatureModal = ({ 
  visible, 
  onCancel, 
  onSign, 
  loading 
}) => {
  const [signatureDisplayMode, setSignatureDisplayMode] = useState(2); // 2: Văn bản và hình ảnh, 3: Kết hợp ảnh và chữ ký
  const [signatureMethod, setSignatureMethod] = useState('draw'); // 'draw' hoặc 'upload'
  const [uploadedImageBase64, setUploadedImageBase64] = useState('');
  const signatureRef = useRef(null);

  // Function xử lý upload ảnh
  const handleImageUpload = (info) => {
    const { file } = info;
    
    // Xử lý file khi upload thành công hoặc khi có file type
    if (file.status === 'done' || file.type) {
      const fileToRead = file.originFileObj || file;
      
      if (fileToRead) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target.result;
          console.log('Image uploaded and converted to base64:', {
            fileName: fileToRead.name,
            fileSize: fileToRead.size,
            fileType: fileToRead.type,
            base64Prefix: base64.substring(0, 50) + '...'
          });
          setUploadedImageBase64(base64);
          message.success('Ảnh đã được tải lên thành công!');
        };
        reader.onerror = () => {
          message.error('Lỗi khi đọc file ảnh!');
        };
        reader.readAsDataURL(fileToRead);
      }
    }
  };

  // Function kiểm tra file upload
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ có thể tải lên file ảnh!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Kích thước ảnh phải nhỏ hơn 5MB!');
      return false;
    }
    
    return true;
  };

  // Function kết hợp ảnh upload và chữ ký vẽ tay thành một ảnh
  const getCombinedSignatureData = () => {
    if (!uploadedImageBase64 || !signatureRef.current || signatureRef.current.isEmpty()) {
      return null;
    }

    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Tạo ảnh từ uploaded image - sử dụng document.createElement
        const uploadedImg = document.createElement('img');
        uploadedImg.onload = () => {
          try {
            // Lấy signature data trước
            const signatureDataURL = getSignatureAsFullDataURL();
            if (!signatureDataURL) {
              reject(new Error('Không thể lấy dữ liệu chữ ký'));
              return;
            }
            
            // Tạo ảnh từ signature canvas
            const signatureImg = document.createElement('img');
            
            signatureImg.onload = () => {
              try {
                // Tính toán kích thước canvas kết hợp
                const padding = 20;
                const maxWidth = Math.max(uploadedImg.width, signatureImg.width);
                const totalHeight = uploadedImg.height + signatureImg.height + padding;
                
                canvas.width = maxWidth;
                canvas.height = totalHeight;
                
                // Vẽ nền trắng
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Vẽ ảnh upload ở trên (căn giữa)
                const uploadX = (maxWidth - uploadedImg.width) / 2;
                ctx.drawImage(uploadedImg, uploadX, 0, uploadedImg.width, uploadedImg.height);
                
                // Vẽ chữ ký ở dưới (căn giữa)
                const signatureX = (maxWidth - signatureImg.width) / 2;
                const signatureY = uploadedImg.height + padding;
                ctx.drawImage(signatureImg, signatureX, signatureY, signatureImg.width, signatureImg.height);
                
                // Chuyển thành base64 và trả về
                const combinedDataURL = canvas.toDataURL('image/png', 1.0);
                console.log('Combined signature created successfully:', {
                  uploadedImgSize: `${uploadedImg.width}x${uploadedImg.height}`,
                  signatureImgSize: `${signatureImg.width}x${signatureImg.height}`,
                  canvasSize: `${canvas.width}x${canvas.height}`,
                  dataURLPrefix: combinedDataURL.substring(0, 50) + '...'
                });
                resolve(combinedDataURL);
              } catch (error) {
                console.error('Error drawing combined signature:', error);
                reject(error);
              }
            };
            
            signatureImg.onerror = () => {
              reject(new Error('Không thể load ảnh chữ ký'));
            };
            
            signatureImg.src = signatureDataURL;
          } catch (error) {
            console.error('Error processing signature:', error);
            reject(error);
          }
        };
        
        uploadedImg.onerror = () => {
          reject(new Error('Không thể load ảnh upload'));
        };
        
        // Đảm bảo uploadedImageBase64 có định dạng đúng
        if (!uploadedImageBase64.startsWith('data:image/')) {
          reject(new Error('Định dạng ảnh upload không hợp lệ'));
          return;
        }
        
        uploadedImg.src = uploadedImageBase64;
      } catch (error) {
        console.error('Error in getCombinedSignatureData:', error);
        reject(error);
      }
    });
  };

  // Function lấy signature data từ method được chọn
  const getSignatureData = () => {
    if (signatureDisplayMode === 3) {
      // Trả về promise cho combined signature
      return getCombinedSignatureData();
    } else if (signatureMethod === 'upload') {
      return uploadedImageBase64;
    } else {
      return getSignatureAsFullDataURL();
    }
  };

  // Helper function để chuyển đổi signature thành PNG base64 với format đầy đủ
  const getSignatureAsFullDataURL = () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      return null;
    }
    
    // Lấy canvas element
    const canvas = signatureRef.current.getCanvas();
    
    // Tạo một canvas mới với nền trắng để đảm bảo PNG có nền trắng
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
  
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);
    
    // Chuyển thành PNG base64 với format đầy đủ: data:image/png;base64,iVBORw0KGgoAAAA...
    const dataURL = tempCanvas.toDataURL('image/png', 1.0); // Chất lượng cao nhất
    return dataURL; // Trả về format đầy đủ bao gồm prefix
  };

  // Clear chữ ký
  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  // Clear uploaded image
  const clearUploadedImage = () => {
    setUploadedImageBase64('');
  };

  // Clear tất cả signature data
  const clearAllSignatureData = () => {
    clearSignature();
    clearUploadedImage();
  };

  // Handle digital signature
  const handleDigitalSignature = async () => {
    // Kiểm tra chữ ký dựa trên method và display mode
    if (signatureDisplayMode === 2) {
      if (signatureMethod === 'draw') {
        if (!signatureRef.current || signatureRef.current.isEmpty()) {
          message.error('Vui lòng vẽ chữ ký của bạn!');
          return;
        }
      } else if (signatureMethod === 'upload') {
        if (!uploadedImageBase64) {
          message.error('Vui lòng tải lên ảnh chữ ký hoặc logo!');
          return;
        }
      }
    } else if (signatureDisplayMode === 3) {
      // Kiểm tra cả ảnh upload và chữ ký vẽ tay cho chế độ kết hợp
      if (!uploadedImageBase64) {
        message.error('Vui lòng tải lên ảnh để kết hợp với chữ ký!');
        return;
      }
      if (!signatureRef.current || signatureRef.current.isEmpty()) {
        message.error('Vui lòng vẽ chữ ký để kết hợp với ảnh!');
        return;
      }
    }

    try {
      // Lấy signature data dựa trên method được chọn
      let signatureDataURL = '';
      try {
        const signatureData = getSignatureData();
        
        // Xử lý async cho combined signature
        if (signatureDisplayMode === 3 && signatureData instanceof Promise) {
          console.log('Processing combined signature...');
          signatureDataURL = await signatureData;
          console.log('Combined signature completed:', signatureDataURL ? 'Success' : 'Failed');
        } else {
          signatureDataURL = signatureData;
        }
        
        if (!signatureDataURL) {
          message.error('Không thể lấy dữ liệu chữ ký. Vui lòng thử lại!');
          return;
        }

        // Gọi callback với signature data và display mode
        onSign(signatureDataURL, signatureDisplayMode);
        
      } catch (error) {
        console.error('Error getting signature data:', error);
        message.error(`Lỗi xử lý chữ ký: ${error.message}`);
        return;
      }
    } catch (error) {
      console.error('Error in digital signature:', error);
      message.error('Có lỗi không mong muốn khi ký điện tử');
    }
  };

  return (
    <Modal
      title={
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <EditOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
          Ký Hợp Đồng Điện Tử
        </span>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      centered
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Alert
          message="Bước 1/2: Vui lòng thực hiện ký điện tử trước"
          type="info"
          style={{ marginBottom: '20px' }}
        />
        
        {/* Tùy chọn loại chữ ký */}
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <Text strong style={{ marginBottom: '8px', display: 'block' }}>Chọn loại chữ ký:</Text>
          <Radio.Group 
            value={signatureDisplayMode} 
            onChange={(e) => setSignatureDisplayMode(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio value={2}>
                <span style={{ fontWeight: '500' }}>Văn bản hoặc hình ảnh</span>
                <div style={{ fontSize: '12px', color: '#666', marginLeft: '24px' }}>
                  Hiển thị văn bản hoặc hình ảnh chữ ký bạn vẽ
                </div>
              </Radio>
              <Radio value={3}>
                <span style={{ fontWeight: '500' }}>Kết hợp ảnh và chữ ký</span>
                <div style={{ fontSize: '12px', color: '#666', marginLeft: '24px' }}>
                  Kết hợp ảnh upload (trên) và chữ ký vẽ tay (dưới) thành một
                </div>
              </Radio>
            </Space>
          </Radio.Group>
        </div>
        
        {/* Tabs cho việc vẽ chữ ký hoặc upload ảnh - chỉ hiển thị khi cần hình ảnh */}
        {signatureDisplayMode === 2 && (
          <div style={{ marginBottom: '20px' }}>
            <Tabs 
              activeKey={signatureMethod} 
              onChange={setSignatureMethod}
              items={[
                {
                  key: 'draw',
                  label: (
                    <span>
                      <EditOutlined />
                      Vẽ Chữ Ký
                    </span>
                  ),
                  children: (
                    <div style={{
                      border: '2px dashed #d9d9d9',
                      borderRadius: '8px',
                      padding: '10px',
                      backgroundColor: '#fafafa'
                    }}>
                      <SignatureCanvas
                        ref={signatureRef}
                        canvasProps={{
                          width: 500,
                          height: 200,
                          className: 'signature-canvas',
                          style: {
                            border: '1px solid #d9d9d9',
                            borderRadius: '4px',
                            backgroundColor: 'white'
                          }
                        }}
                        backgroundColor="white"
                        penColor="black"
                        dotSize={2}
                        minWidth={1}
                        maxWidth={3}
                        velocityFilterWeight={0.7}
                      />
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#666', 
                        marginTop: '8px',
                        textAlign: 'center'
                      }}>
                        Vẽ chữ ký của bạn trong khung trên
                      </div>
                    </div>
                  )
                },
                {
                  key: 'upload',
                  label: (
                    <span>
                      <UploadOutlined />
                      Upload Ảnh
                    </span>
                  ),
                  children: (
                    <div style={{
                      border: '2px dashed #d9d9d9',
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: '#fafafa',
                      textAlign: 'center',
                      minHeight: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      {!uploadedImageBase64 ? (
                        <Upload.Dragger
                          name="signature"
                          multiple={false}
                          onChange={handleImageUpload}
                          beforeUpload={beforeUpload}
                          showUploadList={false}
                          customRequest={({ onSuccess }) => {
                            // Fake upload success to prevent HTTP request
                            setTimeout(() => {
                              onSuccess();
                            }, 0);
                          }}
                          style={{
                            width: '100%',
                            border: 'none',
                            backgroundColor: 'transparent'
                          }}
                        >
                          <p className="ant-upload-drag-icon">
                            <PictureOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                          </p>
                          <p className="ant-upload-text" style={{ fontSize: '16px', fontWeight: '500' }}>
                            Kéo thả ảnh vào đây hoặc click để chọn
                          </p>
                          <p className="ant-upload-hint" style={{ color: '#666' }}>
                            Hỗ trợ các định dạng: JPG, PNG, GIF. Tối đa 5MB
                          </p>
                        </Upload.Dragger>
                      ) : (
                        <div style={{ width: '100%' }}>
                          <div style={{ marginBottom: '16px' }}>
                            <Image
                              src={uploadedImageBase64}
                              alt="Signature Preview"
                              style={{ 
                                maxWidth: '300px', 
                                maxHeight: '150px',
                                border: '1px solid #d9d9d9',
                                borderRadius: '4px'
                              }}
                            />
                          </div>
                          <Button 
                            icon={<ClearOutlined />}
                            onClick={clearUploadedImage}
                            type="dashed"
                          >
                            Xóa ảnh và chọn lại
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                }
              ]}
            />
          </div>
        )}
        
        {/* Giao diện cho chế độ kết hợp ảnh và chữ ký */}
        {signatureDisplayMode === 3 && (
          <div style={{ marginBottom: '20px' }}>
            <Alert
              message="Chế độ kết hợp: Vui lòng cung cấp cả ảnh và chữ ký"
              type="warning"
              style={{ marginBottom: '16px' }}
            />
            
            {/* Upload ảnh */}
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>1. Tải lên ảnh (sẽ hiển thị ở trên):</Text>
              <div style={{
                border: '2px dashed #d9d9d9',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#fafafa',
                textAlign: 'center'
              }}>
                {!uploadedImageBase64 ? (
                  <Upload.Dragger
                    name="signature"
                    multiple={false}
                    onChange={handleImageUpload}
                    beforeUpload={beforeUpload}
                    showUploadList={false}
                    customRequest={({ onSuccess }) => {
                      // Fake upload success to prevent HTTP request
                      setTimeout(() => {
                        onSuccess();
                      }, 0);
                    }}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent'
                    }}
                  >
                    <p className="ant-upload-drag-icon">
                      <PictureOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                    </p>
                    <p className="ant-upload-text">Tải lên ảnh logo/hình ảnh</p>
                    <p className="ant-upload-hint">JPG, PNG, GIF - Tối đa 5MB</p>
                  </Upload.Dragger>
                ) : (
                  <div>
                    <Image
                      src={uploadedImageBase64}
                      alt="Logo Preview"
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '100px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '4px'
                      }}
                    />
                    <div style={{ marginTop: '8px' }}>
                      <Button 
                        icon={<ClearOutlined />}
                        onClick={clearUploadedImage}
                        size="small"
                        type="dashed"
                      >
                        Thay đổi ảnh
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Vẽ chữ ký */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>2. Vẽ chữ ký (sẽ hiển thị ở dưới):</Text>
              <div style={{
                border: '2px dashed #d9d9d9',
                borderRadius: '8px',
                padding: '10px',
                backgroundColor: '#fafafa'
              }}>
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    width: 500,
                    height: 150,
                    className: 'signature-canvas',
                    style: {
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                      backgroundColor: 'white'
                    }
                  }}
                  backgroundColor="white"
                  penColor="black"
                  dotSize={2}
                  minWidth={1}
                  maxWidth={3}
                  velocityFilterWeight={0.7}
                />
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginTop: '8px',
                  textAlign: 'center'
                }}>
                  Vẽ chữ ký của bạn trong khung trên
                </div>
              </div>
            </div>
            
            {/* Preview kết hợp nếu cả hai đều có */}
            {uploadedImageBase64 && signatureRef.current && !signatureRef.current.isEmpty() && (
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Text style={{ fontSize: '12px', color: '#1890ff' }}>✅ Sẵn sàng kết hợp: Ảnh (trên) + Chữ ký (dưới)</Text>
              </div>
            )}
          </div>
        )}
        <div style={{ 
          fontSize: '12px', 
          color: '#666', 
          marginBottom: '16px',
          textAlign: 'left'
        }}>
          <strong>Lưu ý:</strong> 
          {signatureDisplayMode === 3 
            ? ' Ảnh và chữ ký sẽ được kết hợp thành một ảnh PNG base64'
            : signatureMethod === 'draw' 
              ? ' Chữ ký vẽ tay sẽ được chuyển đổi thành định dạng PNG base64'
              : ' Ảnh upload sẽ được chuyển đổi thành định dạng base64'
          } để gửi lên server
        </div>

        <Space size="large">
          <Button
            icon={<ClearOutlined />}
            onClick={clearAllSignatureData}
            style={{ minWidth: '100px' }}
          >
            Xóa tất cả
          </Button>
          
          <Button
            onClick={onCancel}
            style={{ minWidth: '100px' }}
          >
            Hủy
          </Button>
          
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleDigitalSignature}
            loading={loading}
            style={{ 
              minWidth: '100px',
              backgroundColor: '#1890ff',
              borderColor: '#1890ff'
            }}
          >
            {loading ? 'Đang ký...' : 'Ký Điện Tử'}
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default SignatureModal;