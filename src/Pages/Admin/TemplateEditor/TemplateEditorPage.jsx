import React, { useState, useEffect } from 'react';
import 'quill/dist/quill.snow.css';
import { 
  Layout, 
  Card, 
  Row, 
  Col, 
  Button, 
  Select, 
  Space, 
  Typography, 
  Spin, 
  Alert,
  Tabs,
  Input,
  Modal,
  App
} from 'antd';
import { 
  EditOutlined, 
  SaveOutlined, 
  EyeOutlined, 
  ReloadOutlined,
  FileTextOutlined,
  CodeOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import AdminLayout from '../../../Components/Admin/AdminLayout';

import { useTemplateEditor } from './useTemplateEditor';
import { useQuillEditor } from './useQuillEditor';
import PreviewModal from './PreviewModal';

const { Title, Text } = Typography;
const { Option } = Select;
const { Content } = Layout;
const { TextArea } = Input;

// Template Editor Page - Trang chỉnh sửa template hợp đồng
function TemplateEditorPage() {
  const { modal } = App.useApp();
  
  // States cho UI
  const [activeTab, setActiveTab] = useState('editor');
  const [previewVisible, setPreviewVisible] = useState(false);

  // Hook quản lý template editor
  const {
    templates,
    selectedTemplate,
    htmlContent,
    originalContent,
    loading,
    saving,
    hasUnsavedChanges,
    allStyles,
    htmlHead,
    htmlAttributes,
    fetchTemplates,
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

  // ✅ Update Quill khi chọn template mới
  useEffect(() => {
    if (htmlContent && isReady && selectedTemplate) {
      console.log('🔄 Syncing template content to Quill editor');
      setContent(htmlContent);
    }
  }, [selectedTemplate, htmlContent, isReady]);

  // ✅ Handle template selection
  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      if (hasUnsavedChanges) {
        Modal.confirm({
          title: 'Có thay đổi chưa được lưu',
          content: 'Bạn có muốn lưu thay đổi trước khi chuyển template?',
          okText: 'Lưu và Chuyển',
          cancelText: 'Bỏ qua và Chuyển',
          onOk: async () => {
            const saved = await saveTemplate();
            if (saved) {
              loadTemplate(template);
            }
          },
          onCancel: () => {
            loadTemplate(template);
          }
        });
      } else {
        loadTemplate(template);
      }
    }
  };

  // ✅ Handle save with confirmation
  const handleSave = async () => {
    if (!selectedTemplate) return;
    
    Modal.confirm({
      title: 'Xác nhận lưu template',
      content: `Bạn có chắc chắn muốn lưu thay đổi cho template "${selectedTemplate.name}"?`,
      okText: 'Lưu',
      cancelText: 'Hủy',
      onOk: async () => {
        const success = await saveTemplate();
        if (success) {
          // Sync lại content từ Quill
          const currentContent = getCurrentContent();
          updateContent(currentContent);
        }
      }
    });
  };

  // ✅ Handle reset with confirmation  
  const handleReset = () => {
    if (!hasUnsavedChanges) return;
    
    Modal.confirm({
      title: 'Khôi phục nội dung gốc',
      content: 'Thao tác này sẽ xóa tất cả thay đổi chưa lưu. Bạn có chắc chắn?',
      okText: 'Khôi phục',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: () => {
        resetTemplate();
        if (originalContent && isReady) {
          setContent(originalContent);
        }
      }
    });
  };

  // ✅ Handle manual content change in HTML tab
  const handleHtmlContentChange = (e) => {
    const newContent = e.target.value;
    updateContent(newContent);
    
    // Sync to Quill if ready
    if (isReady && activeTab === 'html') {
      // Delay để tránh conflict khi đang gõ
      setTimeout(() => {
        setContent(newContent);
      }, 500);
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <AdminLayout />
      
      <PageContainer
        title="Quản lý Template Hợp đồng"
        subTitle="Chỉnh sửa và cập nhật template hợp đồng điện tử"
        extra={[
          <Button 
            key="refresh" 
            icon={<ReloadOutlined />} 
            onClick={fetchTemplates}
            loading={loading}
          >
            Tải lại
          </Button>,
          <Button 
            key="preview" 
            icon={<EyeOutlined />}
            onClick={() => setPreviewVisible(true)}
            disabled={!selectedTemplate}
            className="border-blue-500 text-blue-500 hover:bg-blue-50"
          >
            Xem trước
          </Button>
        ]}
      >
        
        {/* Template Selector */}
        <Card className="mb-6" size="small">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <div className="space-y-2">
                <Text strong>Chọn Template:</Text>
                <Select
                  value={selectedTemplate?.id}
                  onChange={handleTemplateSelect}
                  placeholder="Chọn template để chỉnh sửa..."
                  className="w-full"
                  loading={loading}
                  allowClear
                  onClear={() => {
                    resetAllStates();
                    if (isReady) {
                      setContent('');
                    }
                  }}
                >
                  {templates.map(template => (
                    <Option key={template.id} value={template.id}>
                      <div className="flex items-center justify-between">
                        <span>{template.name}</span>
                        <Text type="secondary" className="text-xs">
                          {template.code}
                        </Text>
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            
            <Col xs={24} md={8}>
              {selectedTemplate && (
                <div className="space-y-1">
                  <Text strong>Template Info:</Text>
                  <div className="text-sm space-y-1">
                    <div>Code: <Text code>{selectedTemplate.code}</Text></div>
                    <div>Name: {selectedTemplate.name}</div>
                    <div>Status: 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        hasUnsavedChanges 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {hasUnsavedChanges ? '⚠️ Có thay đổi chưa lưu' : '✅ Đã lưu'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Col>
            
            <Col xs={24} md={8}>
              <div className="flex justify-end">
                <Space>
                  <Button 
                    onClick={handleReset}
                    disabled={!hasUnsavedChanges || !selectedTemplate}
                    className="border-orange-500 text-orange-500 hover:bg-orange-50"
                  >
                    Khôi phục
                  </Button>
                  <Button 
                    type="primary"
                    icon={saving ? <Spin size="small" /> : <SaveOutlined />}
                    onClick={handleSave}
                    loading={saving}
                    disabled={!hasUnsavedChanges || !selectedTemplate}
                    className="bg-green-500 hover:bg-green-600 border-green-500"
                  >
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Editor Content */}
        {selectedTemplate ? (
          <Card className="flex-1">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="h-full"
              type="card"
              items={[
                {
                  key: 'editor',
                  label: (
                    <span>
                      <EditOutlined />
                      Chỉnh sửa nội dung
                    </span>
                  ),
                  children: (
                    <div className="h-full overflow-hidden relative">
                      {/* ✅ Quill Editor Container */}
                      <div className="ql-editor-container">
                        <div 
                          ref={quillRef} 
                          className="border border-gray-300 rounded bg-white"
                          style={{ 
                            height: 'calc(100vh - 400px)',
                            minHeight: '500px',
                            visibility: 'visible',
                            opacity: 1
                          }}
                        />
                      </div>

                      {/* Loading Overlay */}
                      {!isReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                          <div className="text-center">
                            <Spin size="large" tip="Đang khởi tạo editor..." />
                            <div className="mt-2 text-sm text-gray-500">
                              Vui lòng đợi editor load...
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
                      Chỉnh sửa HTML
                    </span>
                  ),
                  children: (
                    <div className="h-full">
                      <TextArea
                        value={htmlContent}
                        onChange={handleHtmlContentChange}
                        placeholder="Chỉnh sửa HTML trực tiếp..."
                        className="h-full resize-none font-mono text-sm"
                        style={{ 
                          height: 'calc(100vh - 400px)',
                          minHeight: '500px',
                          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                          fontSize: '13px',
                          lineHeight: '1.5'
                        }}
                      />
                    </div>
                  )
                },
                {
                  key: 'debug',
                  label: (
                    <span>
                      <SettingOutlined />
                      Debug Info
                    </span>
                  ),
                  children: (
                    <div className="h-full overflow-auto p-4 bg-gray-50">
                      <div className="grid grid-cols-1 gap-4">
                        
                        <Card size="small" title="📊 Template Status">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Selected Template:</strong>
                              <div>{selectedTemplate?.name || 'None'}</div>
                            </div>
                            <div>
                              <strong>Template Code:</strong>
                              <div className="font-mono">{selectedTemplate?.code || 'None'}</div>
                            </div>
                            <div>
                              <strong>Content Length:</strong>
                              <div className="font-mono">{htmlContent?.length || 0} chars</div>
                            </div>
                            <div>
                              <strong>Has Changes:</strong>
                              <div className={hasUnsavedChanges ? 'text-yellow-600' : 'text-green-600'}>
                                {hasUnsavedChanges ? '⚠️ Yes' : '✅ No'}
                              </div>
                            </div>
                          </div>
                        </Card>

                        <Card size="small" title="🎨 Preserved Styles">
                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                              <span>All Styles Length:</span>
                              <span className="font-mono">{allStyles?.length || 0} chars</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Style Blocks:</span>
                              <span className="font-mono">{(allStyles?.match(/<style/g) || []).length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>HTML Head Length:</span>
                              <span className="font-mono">{htmlHead?.length || 0} chars</span>
                            </div>
                          </div>
                          <TextArea
                            value={allStyles}
                            readOnly
                            rows={8}
                            placeholder="Không có styles được bảo tồn"
                            className="font-mono text-xs"
                          />
                        </Card>

                        <Card size="small" title="⚙️ Editor Status">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Quill Ready:</strong>
                              <div className={isReady ? 'text-green-600' : 'text-red-500'}>
                                {isReady ? '✅ Ready' : '❌ Not Ready'}
                              </div>
                            </div>
                            <div>
                              <strong>Active Tab:</strong>
                              <div className="font-mono">{activeTab}</div>
                            </div>
                            <div>
                              <strong>Loading:</strong>
                              <div className={loading ? 'text-blue-500' : 'text-gray-500'}>
                                {loading ? '🔄 Loading' : '⏹️ Idle'}
                              </div>
                            </div>
                            <div>
                              <strong>Saving:</strong>
                              <div className={saving ? 'text-orange-500' : 'text-gray-500'}>
                                {saving ? '💾 Saving' : '⏹️ Idle'}
                              </div>
                            </div>
                          </div>
                        </Card>

                      </div>
                    </div>
                  )
                }
              ]}
            />
          </Card>
        ) : (
          <Card className="text-center py-16">
            <div className="space-y-4">
              <FileTextOutlined className="text-6xl text-gray-400" />
              <div>
                <Title level={4} type="secondary">Chưa chọn template</Title>
                <Text type="secondary">
                  Vui lòng chọn một template từ danh sách phía trên để bắt đầu chỉnh sửa.
                </Text>
              </div>
              {templates.length === 0 && !loading && (
                <div className="mt-4">
                  <Alert 
                    message="Không tìm thấy template nào" 
                    description="Hãy kiểm tra kết nối API hoặc liên hệ admin."
                    type="warning" 
                    showIcon 
                  />
                </div>
              )}
            </div>
          </Card>
        )}

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

      </PageContainer>
      
      {/* Global Styles for Quill */}
      <style jsx global>{`
        .ql-editor {
          font-family: 'Noto Sans', 'DejaVu Sans', Arial, sans-serif !important;
          font-size: 12pt !important;
          line-height: 1.4 !important;
          min-height: 400px !important;
        }
        
        .ql-editor .placeholder-variable {
          background-color: #dbeafe !important;
          color: #1d4ed8 !important;
          padding: 2px 4px !important;
          border-radius: 3px !important;
          font-family: 'Monaco', 'Consolas', monospace !important;
          font-size: 13px !important;
        }
        
        .ql-toolbar {
          border-color: #d1d5db !important;
          background-color: #f9fafb !important;
        }
        
        .ql-container {
          border-color: #d1d5db !important;
        }
      `}</style>
      
    </Layout>
  );
}

export default TemplateEditorPage;
