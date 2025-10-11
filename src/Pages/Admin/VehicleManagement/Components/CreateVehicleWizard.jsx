import React, { useState } from 'react';
import { 
  Steps, 
  Card, 
  Form, 
  Input, 
  Button, 
  Space, 
  App, 
  Row, 
  Col, 
  InputNumber,
  Descriptions,
  Badge,
  Alert
} from 'antd';
import { 
  CheckCircleOutlined, 
  CarOutlined, 
  SettingOutlined, 
  BgColorsOutlined, 
  FileTextOutlined 
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import api from '../../../../api/api';

const { Step } = Steps;
const { TextArea } = Input;

function CreateVehicleWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [createdData, setCreatedData] = useState({
    modelId: null,
    versionId: null,
    colorId: null
  });
  
  const [modelForm] = Form.useForm();
  const [versionForm] = Form.useForm();
  const [colorForm] = Form.useForm();
  
  const { message } = App.useApp();

  const steps = [
    {
      title: 'Model Info',
      description: 'Vehicle model details',
      icon: <CarOutlined />,
      content: 'model'
    },
    {
      title: 'Version Info',
      description: 'Model version specs',
      icon: <SettingOutlined />,
      content: 'version'
    },
    {
      title: 'Color Info',
      description: 'Available colors',
      icon: <BgColorsOutlined />,
      content: 'color'
    },
    {
      title: 'Review',
      description: 'Confirm details',
      icon: <FileTextOutlined />,
      content: 'review'
    }
  ];

  // Create Model
  const handleCreateModel = async (values) => {
    try {
      setLoading(true);
      const response = await api.post('ElectricVehicleModel/create-model', {
        modelName: values.modelName,
        description: values.description
      });
      
      if (response.data?.isSuccess) {
        setCreatedData(prev => ({ ...prev, modelId: response.data.result.id }));
        message.success('Tạo model thành công!');
        setCurrentStep(1);
      } else {
        message.error(response.data?.message || 'Lỗi khi tạo model');
      }
    } catch (error) {
      message.error('Lỗi khi tạo model: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Create Version
  const handleCreateVersion = async (values) => {
    try {
      setLoading(true);
      const response = await api.post('ElectricVehicleVersion/create-version', {
        modelId: createdData.modelId,
        versionName: values.versionName,
        batteryCapacity: parseFloat(values.batteryCapacity),
        range: parseInt(values.range),
        price: parseInt(values.price)
      });
      
      if (response.data?.isSuccess) {
        setCreatedData(prev => ({ ...prev, versionId: response.data.result.id }));
        message.success('Tạo version thành công!');
        setCurrentStep(2);
      } else {
        message.error(response.data?.message || 'Lỗi khi tạo version');
      }
    } catch (error) {
      message.error('Lỗi khi tạo version: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Create Color
  const handleCreateColor = async (values) => {
    try {
      setLoading(true);
      const response = await api.post('ElectricVehicleColor/create-color', {
        modelId: createdData.modelId,
        versionId: createdData.versionId,
        colorName: values.colorName,
        colorCode: values.colorCode,
        additionalPrice: values.additionalPrice ? parseInt(values.additionalPrice) : 0
      });
      
      if (response.data?.isSuccess) {
        setCreatedData(prev => ({ ...prev, colorId: response.data.result.id }));
        message.success('Tạo màu sắc thành công!');
        setCurrentStep(3);
      } else {
        message.error(response.data?.message || 'Lỗi khi tạo màu sắc');
      }
    } catch (error) {
      message.error('Lỗi khi tạo màu sắc: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const forms = [modelForm, versionForm, colorForm];
    const form = forms[currentStep];
    
    form.validateFields().then(values => {
      if (currentStep === 0) {
        handleCreateModel(values);
      } else if (currentStep === 1) {
        handleCreateVersion(values);
      } else if (currentStep === 2) {
        handleCreateColor(values);
      }
    }).catch(errorInfo => {
      console.log('Validation failed:', errorInfo);
    });
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setCreatedData({ modelId: null, versionId: null, colorId: null });
    modelForm.resetFields();
    versionForm.resetFields();
    colorForm.resetFields();
  };

  const renderStepContent = () => {
    const stepContent = steps[currentStep].content;

    switch (stepContent) {
      case 'model':
        return (
          <Form form={modelForm} layout="vertical">
            <Alert 
              message="Bước 1: Thông tin Model" 
              description="Tạo model xe điện mới với tên và mô tả chi tiết"
              type="info" 
              showIcon 
              style={{ marginBottom: 24 }}
            />
            
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="modelName"
                  label="Tên Model"
                  rules={[{ required: true, message: 'Vui lòng nhập tên model!' }]}
                >
                  <Input 
                    placeholder="VD: VF 8, Model 3, EQS" 
                    size="large"
                  />
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Mô tả Model"
                  rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                >
                  <TextArea 
                    rows={4} 
                    placeholder="Mô tả chi tiết về model xe điện..."
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        );

      case 'version':
        return (
          <Form form={versionForm} layout="vertical">
            <Alert 
              message="Bước 2: Thông tin Version" 
              description="Tạo version cho model với thông số kỹ thuật"
              type="info" 
              showIcon 
              style={{ marginBottom: 24 }}
            />
            
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="versionName"
                  label="Tên Version"
                  rules={[{ required: true, message: 'Vui lòng nhập tên version!' }]}
                >
                  <Input 
                    placeholder="VD: Eco, Plus, Extended Range" 
                    size="large"
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="batteryCapacity"
                  label="Dung lượng pin (kWh)"
                  rules={[{ required: true, message: 'Vui lòng nhập dung lượng pin!' }]}
                >
                  <InputNumber 
                    style={{ width: '100%' }}
                    placeholder="VD: 87.7"
                    min={0}
                    step={0.1}
                    size="large"
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="range"
                  label="Quãng đường (km)"
                  rules={[{ required: true, message: 'Vui lòng nhập quãng đường!' }]}
                >
                  <InputNumber 
                    style={{ width: '100%' }}
                    placeholder="VD: 420"
                    min={0}
                    size="large"
                  />
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item
                  name="price"
                  label="Giá cơ bản (VND)"
                  rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                >
                  <InputNumber 
                    style={{ width: '100%' }}
                    placeholder="VD: 1200000000"
                    min={0}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        );

      case 'color':
        return (
          <Form form={colorForm} layout="vertical">
            <Alert 
              message="Bước 3: Thông tin Màu sắc" 
              description="Thêm tùy chọn màu sắc cho version"
              type="info" 
              showIcon 
              style={{ marginBottom: 24 }}
            />
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="colorName"
                  label="Tên màu"
                  rules={[{ required: true, message: 'Vui lòng nhập tên màu!' }]}
                >
                  <Input 
                    placeholder="VD: Midnight Blue, Pearl White" 
                    size="large"
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="colorCode"
                  label="Mã màu (HEX)"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mã màu!' },
                    { pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Mã màu phải có định dạng #RRGGBB' }
                  ]}
                >
                  <Input 
                    placeholder="#1E3A8A" 
                    size="large"
                    addonAfter={
                      <div 
                        style={{ 
                          width: 20, 
                          height: 20, 
                          backgroundColor: colorForm.getFieldValue('colorCode') || '#e5e7eb',
                          border: '1px solid #d1d5db',
                          borderRadius: 4
                        }} 
                      />
                    }
                  />
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item
                  name="additionalPrice"
                  label="Phụ phí (VND)"
                  tooltip="Để trống nếu không có phụ phí"
                >
                  <InputNumber 
                    style={{ width: '100%' }}
                    placeholder="VD: 15000000"
                    min={0}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        );

      case 'review':
        const modelData = modelForm.getFieldsValue();
        const versionData = versionForm.getFieldsValue();
        const colorData = colorForm.getFieldsValue();
        
        return (
          <div>
            <Alert 
              message="Bước 4: Xác nhận thông tin" 
              description="Kiểm tra lại thông tin trước khi hoàn tất"
              type="success" 
              showIcon 
              style={{ marginBottom: 24 }}
            />
            
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card title="Thông tin Model" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Tên Model">
                    <Badge status="success" text={modelData.modelName} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Mô tả">{modelData.description}</Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Thông tin Version" size="small">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Tên Version">
                    <Badge status="processing" text={versionData.versionName} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Dung lượng pin">
                    {versionData.batteryCapacity} kWh
                  </Descriptions.Item>
                  <Descriptions.Item label="Quãng đường">
                    {versionData.range} km
                  </Descriptions.Item>
                  <Descriptions.Item label="Giá cơ bản">
                    {parseInt(versionData.price || 0).toLocaleString()} VND
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Thông tin Màu sắc" size="small">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Tên màu">
                    <Space>
                      <div 
                        style={{ 
                          width: 16, 
                          height: 16, 
                          backgroundColor: colorData.colorCode,
                          border: '1px solid #d1d5db',
                          borderRadius: 4,
                          display: 'inline-block'
                        }} 
                      />
                      {colorData.colorName}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã màu">{colorData.colorCode}</Descriptions.Item>
                  <Descriptions.Item label="Phụ phí">
                    {colorData.additionalPrice ? 
                      `${parseInt(colorData.additionalPrice).toLocaleString()} VND` : 
                      'Không có phụ phí'
                    }
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Space>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer
      title="Tạo xe điện mới"
      subTitle="Quy trình tạo xe điện với 4 bước: Model → Version → Màu sắc → Xác nhận"
    >
      <Card>
        <Steps 
          current={currentStep} 
          style={{ marginBottom: 32 }}
          items={steps.map(step => ({
            title: step.title,
            description: step.description,
            icon: step.icon
          }))}
        />

        <div style={{ minHeight: 400 }}>
          {renderStepContent()}
        </div>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Space>
            {currentStep > 0 && (
              <Button onClick={handlePrev}>
                Quay lại
              </Button>
            )}
            
            {currentStep === 3 && (
              <Button onClick={handleReset}>
                Tạo xe mới
              </Button>
            )}
            
            {currentStep < 3 && (
              <Button 
                type="primary" 
                onClick={handleNext}
                loading={loading}
              >
                {currentStep === 2 ? 'Hoàn tất' : 'Tiếp theo'}
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </PageContainer>
  );
}

export default CreateVehicleWizard;