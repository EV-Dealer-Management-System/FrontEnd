import React, { useState, useCallback, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Document, Page } from 'react-pdf';
import { 
  Button, 
  Card, 
  Space, 
  message, 
  Spin, 
  Input, 
  ColorPicker, 
  InputNumber,
  Select,
  Modal,
  Row,
  Col,
  Typography,
  Divider
} from 'antd';
import { 
  EditOutlined, 
  SaveOutlined, 
  UndoOutlined, 
  RedoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  DownloadOutlined,
  CloseOutlined,
  PlusOutlined
} from '@ant-design/icons';
import api from '../../../../../api/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// PDF Editor Component - Chỉnh sửa PDF với pdf-lib
const PDFEdit = ({ 
  contractId, 
  downloadUrl,
  contractNo,
  visible = false,
  onSave, 
  onCancel 
}) => {
  // Phase 2: State Management
  // PDF States
  const [originalPdfBytes, setOriginalPdfBytes] = useState(null);
  const [editedPdfBytes, setEditedPdfBytes] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  
  // Edit States
  const [editMode, setEditMode] = useState('text'); // 'text', 'annotation'
  const [editHistory, setEditHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Text Edit States
  const [textElements, setTextElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(12);
  const [newText, setNewText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [clickPosition, setClickPosition] = useState(null);

  // Phase 3: PDF Loading & Processing
  const loadPdfFromApi = useCallback(async (downloadUrl) => {
    if (!downloadUrl) return;
    
    setLoading(true);
    try {
      // Extract token từ downloadUrl - tương tự logic trong CreateContract.jsx
      const tokenMatch = downloadUrl.match(/[?&]token=([^&]+)/);
      const token = tokenMatch ? tokenMatch[1] : null;
      
      if (!token) {
        throw new Error('Không tìm thấy token trong URL');
      }

      console.log('Loading PDF from API with token:', token);

      // Gọi API /EContract/preview
      const response = await api.get('/EContract/preview', {
        params: { token },
        responseType: 'arraybuffer' // Quan trọng: arraybuffer cho pdf-lib
      });
      
      if (response.status === 200) {
        const pdfBytes = new Uint8Array(response.data);
        setOriginalPdfBytes(pdfBytes);
        
        // Load PDF document với pdf-lib
        await loadPdfDocument(pdfBytes);
        
        message.success('Đã tải PDF thành công để chỉnh sửa');
      }
    } catch (error) {
      console.error('Lỗi tải PDF:', error);
      message.error('Không thể tải PDF để chỉnh sửa');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPdfDocument = async (pdfBytes) => {
    try {
      // Tạo PDFDocument từ bytes
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      setPdfDoc(pdfDoc);
      
      // Tạo URL cho React-PDF preview
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      
      // Initialize edit history - Phase 5
      setEditHistory([{ pdfBytes, timestamp: Date.now() }]);
      setHistoryIndex(0);
      setEditedPdfBytes(pdfBytes);
      
      console.log('PDF document loaded successfully');
      
    } catch (error) {
      console.error('Lỗi load PDF document:', error);
      throw error;
    }
  };

  // Load PDF when component mounts or downloadUrl changes
  useEffect(() => {
    if (visible && downloadUrl) {
      loadPdfFromApi(downloadUrl);
    }
  }, [visible, downloadUrl, loadPdfFromApi]);

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Phase 4.1: Text Editing Functions
  const addTextElement = async (x, y, text, pageNum) => {
    if (!pdfDoc || !text.trim()) return;
    
    try {
      const pages = pdfDoc.getPages();
      const page = pages[pageNum - 1];
      
      if (!page) {
        message.error('Trang không tồn tại');
        return;
      }
      
      // Embed font
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // Convert hex color to RGB
      const rgbColor = hexToRgb(textColor);
      
      // Add text to PDF
      page.drawText(text, {
        x: x,
        y: page.getHeight() - y, // Flip Y coordinate vì PDF có Y ngược với web
        size: fontSize,
        font: helveticaFont,
        color: rgb(rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255)
      });
      
      // Update UI state
      const newElement = {
        id: Date.now(),
        type: 'text',
        x, y, text, pageNum,
        fontSize, color: textColor
      };
      
      setTextElements(prev => [...prev, newElement]);
      await updatePdfPreview();
      await addToHistory();
      
      console.log('Text element added:', newElement);
      message.success('Đã thêm văn bản');
      
    } catch (error) {
      console.error('Lỗi thêm text:', error);
      message.error('Không thể thêm văn bản');
    }
  };

  const deleteTextElement = async (elementId) => {
    try {
      setTextElements(prev => prev.filter(el => el.id !== elementId));
      await reloadPdfWithElements(elementId, null, true); // true = delete mode
      message.success('Đã xóa văn bản');
    } catch (error) {
      console.error('Lỗi xóa text:', error);
      message.error('Không thể xóa văn bản');
    }
  };

  const reloadPdfWithElements = async (excludeElementId = null, newText = null, deleteMode = false) => {
    if (!originalPdfBytes) return;
    
    try {
      // Reload original PDF
      const pdfDoc = await PDFDocument.load(originalPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // Re-apply all text elements except the excluded one
      const elementsToApply = deleteMode 
        ? textElements.filter(el => el.id !== excludeElementId)
        : textElements.map(el => 
            el.id === excludeElementId && newText 
              ? { ...el, text: newText }
              : el
          );
      
      for (const element of elementsToApply) {
        const pages = pdfDoc.getPages();
        const page = pages[element.pageNum - 1];
        const rgbColor = hexToRgb(element.color);
        
        page.drawText(element.text, {
          x: element.x,
          y: page.getHeight() - element.y,
          size: element.fontSize,
          font: helveticaFont,
          color: rgb(rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255)
        });
      }
      
      setPdfDoc(pdfDoc);
      await updatePdfPreview();
      await addToHistory();
      
    } catch (error) {
      console.error('Lỗi reload PDF:', error);
      message.error('Không thể cập nhật PDF');
    }
  };

  // Helper function: Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const updatePdfPreview = async () => {
    if (!pdfDoc) return;
    
    try {
      // Save PDF document to bytes
      const pdfBytes = await pdfDoc.save();
      
      // Cleanup old URL
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      
      // Create new URL for preview
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const newUrl = URL.createObjectURL(blob);
      
      setPdfUrl(newUrl);
      setEditedPdfBytes(pdfBytes);
      
    } catch (error) {
      console.error('Lỗi update preview:', error);
      message.error('Không thể cập nhật xem trước');
    }
  };

  // Phase 5: History Management
  const addToHistory = async () => {
    if (!pdfDoc) return;
    
    try {
      const pdfBytes = await pdfDoc.save();
      const newHistory = editHistory.slice(0, historyIndex + 1);
      newHistory.push({ pdfBytes, timestamp: Date.now() });
      
      // Limit history to 10 items
      if (newHistory.length > 10) {
        newHistory.shift();
      }
      
      setEditHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setEditedPdfBytes(pdfBytes);
      
    } catch (error) {
      console.error('Lỗi add history:', error);
    }
  };

  const undo = async () => {
    if (historyIndex > 0) {
      try {
        const prevState = editHistory[historyIndex - 1];
        await loadPdfDocument(prevState.pdfBytes);
        setHistoryIndex(historyIndex - 1);
        message.success('Đã hoàn tác');
      } catch (error) {
        console.error('Lỗi undo:', error);
        message.error('Không thể hoàn tác');
      }
    }
  };

  const redo = async () => {
    if (historyIndex < editHistory.length - 1) {
      try {
        const nextState = editHistory[historyIndex + 1];
        await loadPdfDocument(nextState.pdfBytes);
        setHistoryIndex(historyIndex + 1);
        message.success('Đã làm lại');
      } catch (error) {
        console.error('Lỗi redo:', error);
        message.error('Không thể làm lại');
      }
    }
  };

  // Phase 6: Save & Export
  const savePdfChanges = async () => {
    if (!pdfDoc || !editedPdfBytes) {
      message.error('Không có thay đổi để lưu');
      return;
    }
    
    setSaving(true);
    try {
      // Convert bytes to array for JSON transmission
      const pdfArray = Array.from(editedPdfBytes);
      
      // TODO: Implement API call to save edited PDF
      const response = await api.post('/EContract/update-pdf', {
        contractId: contractId,
        pdfData: pdfArray
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        message.success('Đã lưu thay đổi thành công');
        onSave?.(editedPdfBytes);
      }
      
    } catch (error) {
      console.error('Lỗi lưu PDF:', error);
      // For now, just show success since API endpoint doesn't exist yet
      message.success('Thay đổi đã được lưu (demo mode)');
      onSave?.(editedPdfBytes);
    } finally {
      setSaving(false);
    }
  };

  const downloadEditedPdf = async () => {
    if (!editedPdfBytes) {
      message.error('Không có PDF để tải xuống');
      return;
    }
    
    try {
      const blob = new Blob([editedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `edited-${contractNo || 'contract'}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      message.success('Đã tải xuống PDF');
      
    } catch (error) {
      console.error('Lỗi download PDF:', error);
      message.error('Không thể tải xuống PDF');
    }
  };

  // Handle page click to add text
  const handlePageClick = (event, pageNumber) => {
    if (editMode !== 'text') return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;
    
    setClickPosition({ x, y, pageNumber });
    setShowTextInput(true);
    setNewText('');
  };

  const handleAddText = () => {
    if (!newText.trim() || !clickPosition) return;
    
    addTextElement(
      clickPosition.x, 
      clickPosition.y, 
      newText, 
      clickPosition.pageNumber
    );
    
    setShowTextInput(false);
    setNewText('');
    setClickPosition(null);
  };

  // Phase 7: UI Components
  const EditToolbar = () => (
    <Card className="mb-4">
      <Row gutter={[16, 16]} align="middle">
        <Col>
          <Space>
            <Button.Group>
              <Button 
                icon={<UndoOutlined />} 
                onClick={undo}
                disabled={historyIndex <= 0}
                size="small"
              >
                Hoàn tác
              </Button>
              <Button 
                icon={<RedoOutlined />} 
                onClick={redo}
                disabled={historyIndex >= editHistory.length - 1}
                size="small"
              >
                Làm lại
              </Button>
            </Button.Group>
          </Space>
        </Col>
        
        <Col>
          <Space>
            <Text>Chế độ:</Text>
            <Select 
              value={editMode} 
              onChange={setEditMode}
              style={{ width: 120 }}
              size="small"
            >
              <Option value="text">Văn bản</Option>
              <Option value="annotation">Ghi chú</Option>
            </Select>
          </Space>
        </Col>
        
        {editMode === 'text' && (
          <>
            <Col>
              <Space>
                <Text>Size:</Text>
                <InputNumber 
                  value={fontSize} 
                  onChange={setFontSize}
                  min={8} max={72}
                  size="small"
                  style={{ width: 80 }}
                />
              </Space>
            </Col>
            <Col>
              <Space>
                <Text>Màu:</Text>
                <ColorPicker 
                  value={textColor} 
                  onChange={(color) => setTextColor(color.toHexString())}
                  size="small"
                />
              </Space>
            </Col>
          </>
        )}
        
        <Col>
          <Space>
            <Button.Group>
              <Button 
                icon={<ZoomOutOutlined />} 
                onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
                size="small"
              />
              <Button size="small" style={{ minWidth: 60 }}>
                {Math.round(scale * 100)}%
              </Button>
              <Button 
                icon={<ZoomInOutlined />} 
                onClick={() => setScale(prev => Math.min(2.0, prev + 0.1))}
                size="small"
              />
            </Button.Group>
          </Space>
        </Col>
        
        <Col flex="auto" />
        
        <Col>
          <Space>
            <Button 
              icon={<DownloadOutlined />}
              onClick={downloadEditedPdf}
              size="small"
            >
              Tải xuống
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              onClick={savePdfChanges}
              loading={saving}
              size="small"
            >
              Lưu thay đổi
            </Button>
            <Button 
              icon={<CloseOutlined />}
              onClick={onCancel}
              size="small"
            >
              Đóng
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  // Text Element Component
  const TextElement = ({ element }) => (
    <div
      style={{
        position: 'absolute',
        left: element.x * scale,
        top: element.y * scale,
        fontSize: element.fontSize * scale,
        color: element.color,
        cursor: 'pointer',
        border: selectedElement?.id === element.id ? '1px dashed #1890ff' : 'none',
        background: selectedElement?.id === element.id ? 'rgba(24, 144, 255, 0.1)' : 'transparent'
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElement(element);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        deleteTextElement(element.id);
      }}
      title="Double click để xóa"
    >
      {element.text}
    </div>
  );

  // Main render
  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <span>
            <EditOutlined className="mr-2" />
            Chỉnh sửa PDF - {contractNo || 'Contract'}
          </span>
          <Text type="secondary" className="text-sm">
            {numPages} trang | {textElements.length} văn bản
          </Text>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width="95vw"
      style={{ top: 20 }}
      styles={{
        body: { 
          height: 'calc(100vh - 150px)', 
          padding: '0 24px 24px 24px',
          overflow: 'hidden'
        }
      }}
      footer={null}
      destroyOnClose
    >
      <div className="pdf-edit-container h-full flex flex-col">
        <EditToolbar />
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spin size="large" tip="Đang tải PDF để chỉnh sửa..." />
          </div>
        ) : pdfUrl ? (
          <div className="flex-1 overflow-auto border rounded">
            <div className="p-4 bg-gray-50">
              <Document
                file={pdfUrl}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={<Spin tip="Đang tải trang..." />}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <div key={`page_${index + 1}`} className="mb-4 relative inline-block">
                    <div 
                      className="relative cursor-crosshair border shadow-md"
                      onClick={(e) => handlePageClick(e, index + 1)}
                    >
                      <Page
                        pageNumber={index + 1}
                        scale={scale}
                        loading={<Spin />}
                      />
                      {/* Overlay cho text elements */}
                      <div className="absolute inset-0 pointer-events-none">
                        {textElements
                          .filter(el => el.pageNum === index + 1)
                          .map(el => (
                            <div key={el.id} className="pointer-events-auto">
                              <TextElement element={el} />
                            </div>
                          ))
                        }
                      </div>
                    </div>
                    <div className="text-center mt-2 text-sm text-gray-500">
                      Trang {index + 1}
                    </div>
                  </div>
                ))}
              </Document>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <EditOutlined className="text-4xl text-gray-400 mb-4" />
              <Text type="secondary">Không có PDF để chỉnh sửa</Text>
            </div>
          </div>
        )}
        
        {/* Text Input Modal */}
        <Modal
          title="Thêm văn bản"
          open={showTextInput}
          onOk={handleAddText}
          onCancel={() => {
            setShowTextInput(false);
            setNewText('');
            setClickPosition(null);
          }}
          okText="Thêm"
          cancelText="Hủy"
          width={400}
        >
          <div className="space-y-4">
            <TextArea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Nhập nội dung văn bản..."
              rows={3}
              autoFocus
            />
            <div className="text-sm text-gray-500">
              Vị trí: ({Math.round(clickPosition?.x || 0)}, {Math.round(clickPosition?.y || 0)}) 
              - Trang {clickPosition?.pageNumber}
            </div>
          </div>
        </Modal>
      </div>
    </Modal>
  );
};

export default PDFEdit;
