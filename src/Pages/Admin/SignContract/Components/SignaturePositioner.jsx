import React, { useRef, useState, useEffect } from 'react';
import { 
  Modal, 
  Button, 
  Form, 
  Input, 
  Row, 
  Col, 
  Card, 
  Alert, 
  message 
} from 'antd';
import { EditOutlined } from '@ant-design/icons';

/**
 * Component cho phép chọn vị trí chữ ký trên PDF
 * Hỗ trợ kéo thả chữ ký để đặt vị trí
 */
const SignaturePositioner = ({ 
  visible, 
  onCancel, 
  onConfirm, 
  signatureImage, 
  contractLink, 
  initialPosition,
  loading = false
}) => {
  // Tọa độ và kích thước chữ ký
  const [position, setPosition] = useState(initialPosition || {
    llx: 10,  // Tọa độ góc dưới cùng bên trái x
    lly: 110, // Tọa độ góc dưới cùng bên trái y
    width: 192, // Chiều rộng chữ ký
    height: 90, // Chiều cao chữ ký
  });
  
  // Trạng thái kéo thả
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Tham chiếu đến container PDF preview
  const previewContainerRef = useRef(null);
  
  // Xử lý sự kiện di chuyển chuột và cảm ứng khi đang kéo chữ ký
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && previewContainerRef.current) {
        const iframeContainer = previewContainerRef.current.querySelector('.overflow-auto');
        if (!iframeContainer) return;
        
        const iframeRect = iframeContainer.getBoundingClientRect();
        
        // Tính toán vị trí mới dựa trên vị trí chuột
        let newX = e.clientX - iframeRect.left - dragOffset.x;
        let newY = iframeRect.bottom - e.clientY - dragOffset.y;
        
        // Giới hạn trong khung iframe
        newX = Math.max(0, Math.min(newX, iframeRect.width - position.width));
        newY = Math.max(0, Math.min(newY, iframeRect.height - position.height));
        
        // Cập nhật vị trí mới
        setPosition(prev => ({
          ...prev,
          llx: Math.round(newX),
          lly: Math.round(newY)
        }));
      }
    };
    
    const handleTouchMove = (e) => {
      if (isDragging && previewContainerRef.current && e.touches[0]) {
        e.preventDefault();
        const touch = e.touches[0];
        const iframeContainer = previewContainerRef.current.querySelector('.overflow-auto');
        if (!iframeContainer) return;
        
        const iframeRect = iframeContainer.getBoundingClientRect();
        
        // Tính toán vị trí mới dựa trên vị trí cảm ứng
        let newX = touch.clientX - iframeRect.left - dragOffset.x;
        let newY = iframeRect.bottom - touch.clientY - dragOffset.y;
        
        // Giới hạn trong khung iframe
        newX = Math.max(0, Math.min(newX, iframeRect.width - position.width));
        newY = Math.max(0, Math.min(newY, iframeRect.height - position.height));
        
        // Cập nhật vị trí mới
        setPosition(prev => ({
          ...prev,
          llx: Math.round(newX),
          lly: Math.round(newY)
        }));
      }
    };
    
    const handleEndDrag = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEndDrag);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEndDrag);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEndDrag);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEndDrag);
    };
  }, [isDragging, dragOffset, position.width, position.height]);
  
  // Xử lý khi người dùng xác nhận vị trí chữ ký
  const handleConfirm = () => {
    if (!signatureImage) {
      message.error('Thiếu thông tin chữ ký');
      return;
    }
    
    // Chuyển đổi thành llx, lly, urx, ury để tạo rectangle
    const { llx, lly, width, height } = position;
    const urx = llx + width;
    const ury = lly + height;
    
    // Định dạng chuỗi vị trí "llx,lly,urx,ury"
    const positionString = `${llx},${lly},${urx},${ury}`;
    
    onConfirm(position, positionString);
  };

  return (
    <Modal
      title={
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <EditOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
          Chỉnh Vị Trí Chữ Ký Trên PDF
        </span>
      }
      open={visible}
      onCancel={onCancel}
      width={900}
      centered
      footer={[
        <Button key="back" onClick={onCancel}>
          Quay lại
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleConfirm}
          loading={loading}
        >
          Xác nhận vị trí và tiếp tục
        </Button>
      ]}
    >
      <div style={{ padding: '20px 0' }}>
        <Row gutter={[24, 16]}>
          <Col span={10}>
            <Card
              title="Thiết lập vị trí chữ ký"
              className="mb-4"
              size="small"
            >
              <Alert 
                message={
                  <div>
                    <div><strong>Thông tin về tọa độ chữ ký:</strong></div>
                    <ul className="ml-4 mt-2 list-disc">
                      <li>llx, lly: tọa độ góc dưới cùng bên trái của chữ ký</li>
                      <li>urx = llx + width (chiều rộng)</li>
                      <li>ury = lly + height (chiều cao)</li>
                    </ul>
                  </div>
                } 
                type="info" 
                className="mb-4" 
              />
              
              <Form layout="vertical">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="llx (X bắt đầu)">
                      <Input
                        type="number"
                        value={position.llx}
                        onChange={(e) => setPosition({...position, llx: parseInt(e.target.value) || 0})}
                        suffix="px"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="lly (Y bắt đầu)">
                      <Input
                        type="number"
                        value={position.lly}
                        onChange={(e) => setPosition({...position, lly: parseInt(e.target.value) || 0})}
                        suffix="px"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Chiều rộng (width)">
                      <Input
                        type="number"
                        value={position.width}
                        onChange={(e) => setPosition({...position, width: parseInt(e.target.value) || 0})}
                        suffix="px"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Chiều cao (height)">
                      <Input
                        type="number"
                        value={position.height}
                        onChange={(e) => setPosition({...position, height: parseInt(e.target.value) || 0})}
                        suffix="px"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <div className="bg-gray-50 p-3 rounded-md mt-2">
                  <div className="text-xs font-medium mb-2">Tọa độ chữ ký:</div>
                  <div className="text-sm bg-white p-2 rounded border border-gray-200 font-mono">
                    {position.llx},{position.lly},{position.llx + position.width},{position.lly + position.height}
                  </div>
                </div>
              </Form>
            </Card>
            
            <Card title="Xem trước chữ ký" size="small">
              {signatureImage && (
                <div className="text-center">
                  <img 
                    src={signatureImage} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '150px',
                      border: '1px solid #f0f0f0',
                      borderRadius: '4px',
                    }} 
                  />
                  <div className="text-xs text-gray-500 mt-2">
                    Kích thước: {position.width} x {position.height} px
                  </div>
                </div>
              )}
            </Card>
          </Col>
          
          <Col span={14}>
            <div className="bg-gray-100 rounded-lg p-4 h-full flex flex-col">
              <div className="bg-white border shadow rounded p-2 mb-4 flex-grow overflow-hidden relative" ref={previewContainerRef}>
                <div className="text-center font-medium mb-2 text-sm text-gray-600 border-b pb-2">
                  Xem trước PDF - Kéo thả chữ ký để chọn vị trí
                </div>
                <div className="overflow-auto h-full min-h-[400px] relative" style={{ backgroundColor: '#525659' }}>
                  <iframe 
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(contractLink)}&embedded=true`}
                    title="PDF Preview"
                    width="100%"
                    height="500px"
                    style={{ border: 'none', backgroundColor: 'white', pointerEvents: isDragging ? 'none' : 'auto' }}
                    onError={() => {
                      message.error('Không thể tải PDF qua Google Docs. Đang thử phương án khác...');
                      // Chuyển sang viewer thay thế nếu Google Docs không hoạt động
                      const backupViewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(contractLink)}`;
                      document.getElementById('pdf-viewer-iframe').src = backupViewerUrl;
                    }}
                    id="pdf-viewer-iframe"
                  ></iframe>
                  
                  {/* Chữ ký kéo thả */}
                  {signatureImage && (
                    <div 
                      className="absolute cursor-move border-2 border-blue-500 bg-white bg-opacity-80 flex items-center justify-center"
                      style={{
                        left: `${position.llx}px`,
                        bottom: `${position.lly}px`,
                        width: `${position.width}px`,
                        height: `${position.height}px`,
                        backgroundImage: `url(${signatureImage})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        zIndex: 100,
                        boxShadow: '0 0 8px rgba(0,0,0,0.3)',
                        touchAction: 'none'
                      }}
                      onMouseDown={(e) => {
                        setIsDragging(true);
                        const rect = e.currentTarget.getBoundingClientRect();
                        setDragOffset({
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top
                        });
                        e.preventDefault(); // Ngăn chặn việc chọn văn bản khi kéo
                      }}
                      onTouchStart={(e) => {
                        if (e.touches && e.touches[0]) {
                          setIsDragging(true);
                          const rect = e.currentTarget.getBoundingClientRect();
                          const touch = e.touches[0];
                          setDragOffset({
                            x: touch.clientX - rect.left,
                            y: touch.clientY - rect.top
                          });
                          e.preventDefault(); // Ngăn chặn cuộn trang khi kéo
                        }
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2 flex items-center justify-center">
                <span className="inline-block mr-2">💡</span>
                <span>Kéo thả khung chữ ký để chọn vị trí chính xác trên tài liệu</span>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default SignaturePositioner;