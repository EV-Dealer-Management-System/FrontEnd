import React, { useState, useEffect } from 'react';
import 'quill/dist/quill.snow.css';
import {
  Modal,
  Button,
  Typography,
  Space,
  Spin,
  Tag,
  Tabs,
  Input,
  Alert,
  App
} from 'antd';
import {
  SaveOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  CodeOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useTemplateEditor } from './useTemplateEditor';
import { useQuillEditor } from './useQuillEditor';
import PreviewModal from './PreviewModal';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ========================================
// 📝 TEMPLATE EDITOR MODAL - QUILL + HTML
// ========================================

function TemplateEditorModal({ visible, onClose, template }) {
  const { modal } = App.useApp();
  
  // States cho modal
  const [activeTab, setActiveTab] = useState('editor');
  const [previewVisible, setPreviewVisible] = useState(false);

  // Hook quản lý template editor - chỉ active khi modal mở
  const {
    selectedTemplate,
    htmlContent,
    originalContent,
    loading,
    saving,
    hasUnsavedChanges,
    allStyles,
    htmlHead,
    htmlAttributes,
    loadTemplate,
    saveTemplate,
    resetTemplate,
    updateContent,
    resetAllStates,
    rebuildCompleteHtml
  } = useTemplateEditor();

  // Hook quản lý Quill editor
  const {
    quill,
    quillRef,
    isReady,
    getCurrentContent,
    setContent
  } = useQuillEditor(htmlContent, updateContent);

  // ✅ Load template khi modal mở
  useEffect(() => {
    if (visible && template) {
      console.log('📋 Loading template into modal:', template.name);
      loadTemplate(template);
    }
  }, [visible, template]);

  // ✅ Reset states khi đóng modal
  useEffect(() => {
    if (!visible) {
      resetAllStates();
      setActiveTab('editor');
    }
  }, [visible]);

  // ✅ Update Quill khi content change
  useEffect(() => {
    if (selectedTemplate && htmlContent && isReady && visible) {
      console.log('🔄 Syncing content to Quill in modal');
      setContent(htmlContent);
    }
  }, [selectedTemplate, htmlContent, isReady, visible]);

  // ✅ Handle save và close modal
  const handleSave = async () => {
    const success = await saveTemplate();
    if (success) {
      console.log('✅ Template saved successfully in modal');
      // Đóng modal sau khi save thành công
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  // ✅ Handle reset với confirmation
  const handleReset = () => {
    modal.confirm({
      title: 'Khôi phục nội dung gốc?',
      content: 'Tất cả thay đổi chưa lưu sẽ bị mất. Bạn có chắc chắn không?',
      okText: 'Khôi phục',
      cancelText: 'Hủy',
      onOk: () => {
        resetTemplate();
        if (originalContent && isReady) {
          setContent(originalContent);
        }
      }
    });
  };

  // ✅ Handle close modal với warning nếu có thay đổi
  const handleClose = () => {
    if (hasUnsavedChanges) {
      modal.confirm({
        title: 'Có thay đổi chưa lưu',
        content: 'Bạn có thay đổi chưa được lưu. Bạn có muốn đóng modal không?',
        okText: 'Đóng không lưu',
        cancelText: 'Ở lại',
        onOk: () => {
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  // ✅ Handle HTML content change
  const handleHtmlContentChange = (e) => {
    const newContent = e.target.value;
    updateContent(newContent);
    
    // Sync to Quill if ready và đang ở tab editor
    if (isReady && activeTab === 'html') {
      setTimeout(() => {
        setContent(newContent);
      }, 500);
    }
  };

  return (
    <>
      <Modal
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <EditOutlined className="text-blue-500" />
              <div>
                <Title level={4} className="mb-0">
                  Chỉnh sửa Template: {template?.name}
                </Title>
                {selectedTemplate && (
                  <div className="flex items-center space-x-3 mt-1">
                    <Text code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {selectedTemplate.code}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {(selectedTemplate.contentHtml?.length || 0).toLocaleString()} chars
                    </Text>
                    
                    {/* Status Indicator */}
                    {hasUnsavedChanges ? (
                      <Tag color="warning" icon={<ExclamationCircleOutlined />} className="text-xs">
                        Chưa lưu
                      </Tag>
                    ) : (
                      <Tag color="success" icon={<CheckCircleOutlined />} className="text-xs">
                        Đã lưu
                      </Tag>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        }
        open={visible}
        onCancel={handleClose}
        width="95vw"
        style={{ top: 20 }}
        styles={{
          body: { 
            height: 'calc(100vh - 150px)', 
            padding: '24px',
            overflow: 'hidden'
          }
        }}
        footer={[
          <Button key="reset" onClick={handleReset} disabled={!hasUnsavedChanges}>
            <ReloadOutlined />
            Reset
          </Button>,
          <Button 
            key="preview" 
            icon={<EyeOutlined />}
            onClick={() => setPreviewVisible(true)}
            disabled={!selectedTemplate}
            className="border-blue-400 text-blue-600 hover:border-blue-500"
          >
            Xem trước
          </Button>,
          <Button key="cancel" onClick={handleClose}>
            Hủy
          </Button>,
          <Button 
            key="save"
            type="primary"
            icon={saving ? <Spin size="small" /> : <SaveOutlined />}
            onClick={handleSave}
            loading={saving}
            disabled={!hasUnsavedChanges}
            className="bg-green-500 hover:bg-green-600 border-green-500"
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        ]}
      >
        
        {selectedTemplate ? (
          <div className="h-full flex flex-col">
            
            {/* Template Info Banner */}
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-800">
                    Đang chỉnh sửa: <strong>{selectedTemplate.name} </strong>
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-mono">
                    - {selectedTemplate.code}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {hasUnsavedChanges ? (
                    <span className="flex items-center text-amber-600 text-sm">
                      <ExclamationCircleOutlined className="mr-1" />
                      Có thay đổi chưa lưu
                    </span>
                  ) : (
                    <span className="flex items-center text-green-600 text-sm">
                      <CheckCircleOutlined className="mr-1" />
                       Đã đồng bộ
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Editor Tabs */}
            <div className="flex-1 overflow-hidden">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="h-full editor-tabs"
                type="card"
                items={[
                  {
                    key: 'editor',
                    label: (
                      <span>
                        <EditOutlined />
                        Quill Editor
                      </span>
                    ),
                    children: (
                      <div className="h-full overflow-hidden relative">
                        {/* Quill Editor Container */}
                        <div className="h-full">
                          <div 
                            ref={quillRef} 
                            className="h-full border border-gray-300 rounded bg-white"
                            style={{ 
                              height: 'calc(100vh - 350px)',
                              minHeight: '400px'
                            }}
                          />
                        </div>

                        {/* Loading Overlay */}
                        {!isReady && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                            <div className="text-center">
                              <Spin size="large" />
                              <div className="mt-3 text-gray-600">
                                Đang khởi tạo editor...
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  },
                  {
                    key: 'html',
                    label: (
                      <span>
                        <CodeOutlined />
                        HTML Editor
                      </span>
                    ),
                    children: (
                      <div className="h-full flex flex-col">
                        {/* HTML Editor Header */}
                        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <CodeOutlined className="text-green-600" />
                              <span className="font-medium text-green-800">HTML Source Editor</span>
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                Raw HTML
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-600">
                              <span>{htmlContent?.length || 0} chars</span>
                              <span>•</span>
                              <span>{htmlContent?.split('\n').length || 0} lines</span>
                              <span>•</span>
                              <span>{(htmlContent?.match(/\{\{[^}]+\}\}/g) || []).length} variables</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* HTML TextArea */}
                        <div className="flex-1 relative">
                          <TextArea
                            value={htmlContent}
                            onChange={handleHtmlContentChange}
                            placeholder={`<!-- Chỉnh sửa HTML template trực tiếp -->
                                            <div>
                                            <h1>Tiêu đề hợp đồng</h1>
                                            <p>Nội dung với biến: {{ company.name }}</p>
                                            </div>`
                                        }
                            className="h-full resize-none font-mono text-sm border-2 border-dashed border-green-200 focus:border-green-400"
                            style={{ 
                              height: 'calc(100vh - 400px)',
                              minHeight: '400px',
                              fontFamily: '"Fira Code", "Monaco", "Consolas", "Courier New", monospace',
                              fontSize: '13px',
                              lineHeight: '1.6',
                              backgroundColor: '#fafafa'
                            }}
                          />
                          
                          {/* Character count overlay */}
                          <div className="absolute bottom-2 right-2 px-2 py-1 bg-white border rounded shadow-sm text-xs text-gray-500">
                            {htmlContent?.length || 0} / ∞
                          </div>
                        </div>
                        
                        {/* HTML Editor Tips */}
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <div className="text-blue-500">💡</div>
                            <div className="text-xs text-blue-700">
                              <strong>Tips:</strong> 
                              <span className="ml-1">Thay đổi ở đây sẽ đồng bộ với Quill Editor.</span>
                              <span className="ml-2">Sử dụng biến động: </span>
                              <code className="bg-blue-100 px-1 rounded">{'{{ company.name }}'}</code>
                              <code className="bg-blue-100 px-1 rounded ml-1">{'{{ contract.date }}'}</code>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }
                ]}
              />
            </div>

          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Spin size="large" />
              <div className="mt-4 text-gray-600">Đang tải template...</div>
            </div>
          </div>
        )}

      </Modal>

      {/* Preview Modal */}
      <PreviewModal
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        templateData={selectedTemplate}
        htmlContent={htmlContent}
        allStyles={allStyles}
        htmlHead={htmlHead}
        htmlAttributes={htmlAttributes}
        rebuildCompleteHtml={rebuildCompleteHtml}
      />

      {/* Custom Styling cho Modal */}
      <style jsx>{`
        .editor-tabs .ant-tabs-content-holder {
          height: 100% !important;
          overflow: hidden !important;
        }
        
        .editor-tabs .ant-tabs-tabpane {
          height: 100% !important;
        }
        
        .ql-toolbar {
          border-top: 1px solid #d9d9d9 !important;
          border-left: 1px solid #d9d9d9 !important;
          border-right: 1px solid #d9d9d9 !important;
          border-bottom: 1px solid #d9d9d9 !important;
          border-radius: 6px 6px 0 0 !important;
          background: #fafafa;
          padding: 12px 16px;
        }
        
        .ql-container {
          border-left: 1px solid #d9d9d9 !important;
          border-right: 1px solid #d9d9d9 !important;
          border-bottom: 1px solid #d9d9d9 !important;
          border-radius: 0 0 6px 6px !important;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
        }
        
        .ql-editor {
          padding: 20px !important;
          min-height: 350px !important;
          background: white;
        }
        
        /* Template variables styling */
        .placeholder-variable {
          background: #e6f7ff !important;
          color: #1890ff !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          font-family: "Monaco", "Consolas", monospace !important;
          font-size: 12px !important;
          border: 1px solid #91d5ff !important;
        }
      `}</style>
    </>
  );
}

export default TemplateEditorModal;