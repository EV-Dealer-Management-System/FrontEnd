import React from 'react';
import { Button, Space, Tooltip, Typography } from 'antd';
import { 
  CloseOutlined, 
  FullscreenOutlined, 
  FullscreenExitOutlined,
  DownloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
  PrinterOutlined
} from '@ant-design/icons';

const { Title } = Typography;

const PDFToolbar = ({ 
  title = "PDF Viewer",
  isFullscreen = false,
  onToggleFullscreen = () => {},
  onDownload = () => {},
  onRefresh = () => {},
  onClose = () => {},
  showZoomControls = false,
  onZoomIn = () => {},
  onZoomOut = () => {},
  showPrintButton = false,
  onPrint = () => {}
}) => {
  try {
    return (
    <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex items-center">
        <Title level={4} className="mb-0 mr-4 text-gray-800">
          {title}
        </Title>
      </div>
      
      <Space size="small">
        {showZoomControls && (
          <>
            <Tooltip title="Phóng to">
              <Button 
                icon={<ZoomInOutlined />} 
                onClick={onZoomIn}
                size="small"
              />
            </Tooltip>
            <Tooltip title="Thu nhỏ">
              <Button 
                icon={<ZoomOutOutlined />} 
                onClick={onZoomOut}
                size="small"
              />
            </Tooltip>
          </>
        )}
        
        {showPrintButton && (
          <Tooltip title="In">
            <Button 
              icon={<PrinterOutlined />} 
              onClick={onPrint}
              size="small"
            />
          </Tooltip>
        )}
        
        <Tooltip title="Tải xuống">
          <Button 
            icon={<DownloadOutlined />} 
            onClick={onDownload}
            size="small"
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          />
        </Tooltip>
        
        <Tooltip title="Làm mới">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={onRefresh}
            size="small"
            className="text-green-600 border-green-300 hover:bg-green-50"
          />
        </Tooltip>
        
        <Tooltip title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}>
          <Button 
            icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
            onClick={onToggleFullscreen}
            size="small"
            className="text-purple-600 border-purple-300 hover:bg-purple-50"
          />
        </Tooltip>
        
        <Tooltip title="Đóng">
          <Button 
            icon={<CloseOutlined />} 
            onClick={onClose}
            size="small"
            danger
            className="ml-2"
          />
        </Tooltip>
      </Space>
    </div>
    );
  } catch (error) {
    console.error('PDFToolbar Error:', error);
    return (
      <div className="flex justify-center items-center p-3 border-b bg-red-50">
        <span className="text-red-600">Lỗi tải toolbar PDF</span>
      </div>
    );
  }
};

export default PDFToolbar;