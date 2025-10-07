import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Statistic, Row, Col, Alert, Progress, Space, Tag } from 'antd';
import { 
  BugOutlined, 
  DashboardOutlined, 
  MobileOutlined, 
  DesktopOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import PDFViewer from './PDFViewer';
import { storageOptimizer, optimizeStorageNow, getStorageReport } from './PDFStorageOptimizer';

const { Option } = Select;

// Test scenarios cho React-PDF
const testScenarios = [
  {
    id: 'real-contract',
    name: 'Hợp đồng thực tế',
    description: 'Test với PDF từ API /EContract/preview',
    pdfUrl: null // Sẽ được load từ API
  },
  {
    id: 'sample-small',
    name: 'PDF nhỏ (< 1MB)',
    description: 'Test performance với file nhỏ',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 'sample-medium',
    name: 'PDF vừa (1-5MB)',
    description: 'Test với file size trung bình',
    pdfUrl: 'https://scholar.princeton.edu/sites/default/files/oversize_pdf_test_0.pdf'
  },
  {
    id: 'sample-large',
    name: 'PDF lớn (> 5MB)',
    description: 'Test performance với file lớn',
    pdfUrl: 'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf'
  }
];

function PDFTestPanel({ contractNo, realPdfUrl }) {
  const [currentTest, setCurrentTest] = useState('real-contract');
  const [testResults, setTestResults] = useState({});
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState([]);
  
  // Phase 6: Storage management states
  const [storageReport, setStorageReport] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState(null);

  // Load benchmark data từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pdf-benchmark-data');
    if (saved) {
      setBenchmarkData(JSON.parse(saved));
    }
  }, []);

  // Lưu benchmark data
  const saveBenchmarkData = (newData) => {
    const updated = [...benchmarkData, newData];
    setBenchmarkData(updated);
    localStorage.setItem('pdf-benchmark-data', JSON.stringify(updated));
  };

  // Chạy test performance
  const runPerformanceTest = async (scenario) => {
    setIsRunningTest(true);
    const startTime = Date.now();
    
    try {
      const testData = {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        startTime,
        timestamp: new Date().toISOString(),
        device: getDeviceInfo(),
        browser: getBrowserInfo()
      };

      // Simulate PDF loading (trong thực tế sẽ track từ PDFViewer)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const result = {
        ...testData,
        endTime,
        duration,
        status: 'success',
        memoryUsage: getMemoryUsage()
      };

      setTestResults(prev => ({
        ...prev,
        [scenario.id]: result
      }));

      saveBenchmarkData(result);
      
    } catch (error) {
      const result = {
        scenarioId: scenario.id,
        status: 'error',
        error: error.message,
        duration: Date.now() - startTime
      };
      
      setTestResults(prev => ({
        ...prev,
        [scenario.id]: result
      }));
    } finally {
      setIsRunningTest(false);
    }
  };

  // Utility functions
  const getDeviceInfo = () => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    return 'Other';
  };

  const getMemoryUsage = () => {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  };

  // Phase 6: Storage management functions
  const loadStorageReport = async () => {
    try {
      const report = await getStorageReport();
      setStorageReport(report);
    } catch (error) {
      console.error('Failed to load storage report:', error);
    }
  };

  const handleOptimizeStorage = async () => {
    setIsOptimizing(true);
    try {
      const results = await optimizeStorageNow();
      setOptimizationResults(results);
      await loadStorageReport(); // Reload report after optimization
    } catch (error) {
      console.error('Storage optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Load storage report on component mount
  useEffect(() => {
    loadStorageReport();
  }, []);

  const getCurrentScenario = () => {
    const scenario = testScenarios.find(s => s.id === currentTest);
    if (scenario.id === 'real-contract') {
      return { ...scenario, pdfUrl: realPdfUrl };
    }
    return scenario;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      default: return 'processing';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircleOutlined />;
      case 'error': return <CloseCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Control Panel */}
      <Card 
        title={
          <span className="flex items-center">
            <BugOutlined className="mr-2 text-green-600" />
            Phase 3: React-PDF Testing Panel
          </span>
        }
        extra={
          <Tag color="processing">Phase 3 - Validation</Tag>
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Chọn Test Scenario:</label>
                <Select
                  value={currentTest}
                  onChange={setCurrentTest}
                  className="w-full"
                  size="large"
                >
                  {testScenarios.map(scenario => (
                    <Option key={scenario.id} value={scenario.id}>
                      <div>
                        <div className="font-medium">{scenario.name}</div>
                        <div className="text-xs text-gray-500">{scenario.description}</div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>
              
              <Button
                type="primary"
                size="large"
                loading={isRunningTest}
                onClick={() => runPerformanceTest(getCurrentScenario())}
                className="w-full"
              >
                {isRunningTest ? 'Đang chạy test...' : 'Chạy Performance Test'}
              </Button>
            </div>
          </Col>
          
          <Col span={12}>
            {/* Device & Browser Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Thông tin thiết bị:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  {getDeviceInfo() === 'mobile' ? <MobileOutlined /> : <DesktopOutlined />}
                  <span className="ml-2">Device: {getDeviceInfo()}</span>
                </div>
                <div>Browser: {getBrowserInfo()}</div>
                <div>Screen: {window.innerWidth}x{window.innerHeight}</div>
                {performance.memory && (
                  <div>Memory: {Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB</div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Test Results Dashboard */}
      <Card 
        title={
          <span className="flex items-center">
            <DashboardOutlined className="mr-2 text-blue-600" />
            Test Results Dashboard
          </span>
        }
      >
        <Row gutter={[16, 16]}>
          {testScenarios.map(scenario => {
            const result = testResults[scenario.id];
            return (
              <Col key={scenario.id} xs={24} sm={12} md={6}>
                <Card size="small" className="h-full">
                  <Statistic
                    title={
                      <div className="text-xs">
                        {scenario.name}
                        <div className="text-gray-500">{scenario.description}</div>
                      </div>
                    }
                    value={result ? `${result.duration}ms` : 'Chưa test'}
                    prefix={result ? getStatusIcon(result.status) : null}
                    valueStyle={{ 
                      color: result ? (result.status === 'success' ? '#3f8600' : '#cf1322') : '#666',
                      fontSize: '18px'
                    }}
                  />
                  {result && result.memoryUsage && (
                    <div className="text-xs text-gray-500 mt-2">
                      Memory: {result.memoryUsage.used}MB
                    </div>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
        
        {/* Benchmark History */}
        {benchmarkData.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Benchmark History:</h4>
            <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
              {benchmarkData.slice(-10).reverse().map((data, index) => (
                <div key={index} className="flex justify-between items-center py-1 text-sm">
                  <span>{data.scenarioName}</span>
                  <span className="text-gray-600">{data.duration}ms</span>
                  <span className="text-xs text-gray-500">{data.device}/{data.browser}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* PDF Viewer với current scenario */}
      <Card 
        title={`Testing: ${getCurrentScenario().name}`}
        extra={
          <Tag color={testResults[currentTest] ? getStatusColor(testResults[currentTest].status) : 'default'}>
            {testResults[currentTest] ? testResults[currentTest].status : 'pending'}
          </Tag>
        }
      >
        <PDFViewer 
          contractNo={contractNo || 'TEST-PDF'} 
          pdfUrl={getCurrentScenario().pdfUrl}
        />
      </Card>

      {/* Performance Tips */}
      <Alert
        message="Phase 3 Testing Guidelines"
        description={
          <ul className="list-disc pl-4 mt-2">
            <li>Test trên nhiều devices: mobile, tablet, desktop</li>
            <li>Phase 6: Monitor React-PDF performance metrics</li>
            <li>Kiểm tra memory usage và cleanup</li>
            <li>Test với PDF size khác nhau</li>
            <li>Đảm bảo responsive design hoạt động</li>
          </ul>
        }
        type="info"
        showIcon
      />
    </div>
  );
}

export default PDFTestPanel;