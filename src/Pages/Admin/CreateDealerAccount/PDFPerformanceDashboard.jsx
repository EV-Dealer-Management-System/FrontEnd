import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Button, message } from 'antd';
import { 
  DashboardOutlined, 
  ThunderboltOutlined, 
  DatabaseOutlined,
  BugOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { pdfCacheService } from './PDFCacheService';

/**
 * PDFPerformanceDashboard - Phase 6 Analytics & Monitoring
 * 
 * @description Comprehensive performance monitoring dashboard cho PDF system:
 * - Real-time cache statistics và hit rates
 * - Memory usage tracking và alerts  
 * - Error reports và diagnostics
 * - Performance metrics history
 * - System health indicators
 * 
 * @returns {JSX.Element} Performance monitoring dashboard
 * 
 * @example
 * ```jsx
 * // Add to admin panel hoặc debug tools
 * <PDFPerformanceDashboard />
 * ```
 * 
 * @since Phase 6
 */
function PDFPerformanceDashboard() {
  const [cacheStats, setCacheStats] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [errorReports, setErrorReports] = useState([]);
  const [memoryInfo, setMemoryInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load data on component mount và setup refresh interval
  useEffect(() => {
    loadDashboardData();
    
    const interval = setInterval(() => {
      loadDashboardData();
    }, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  /**
   * Load all dashboard data từ localStorage và cache service
   */
  const loadDashboardData = async () => {
    try {
      // Cache statistics
      const stats = pdfCacheService.getCacheStats();
      setCacheStats(stats);
      
      // Performance history
      const perfData = JSON.parse(localStorage.getItem('pdf-performance-data') || '[]');
      setPerformanceData(perfData.slice(-20).reverse()); // Latest 20 records
      
      // Error reports  
      const errors = JSON.parse(localStorage.getItem('pdf-error-reports') || '[]');
      setErrorReports(errors.slice(-10).reverse()); // Latest 10 errors
      
      // Memory information
      if (performance.memory) {
        setMemoryInfo({
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        });
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      message.error('Lỗi tải dữ liệu dashboard');
    }
  };

  /**
   * Manual refresh của dashboard data
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setTimeout(() => setRefreshing(false), 500);
    message.success('Dashboard đã được cập nhật');
  };

  /**
   * Export performance data to JSON
   */
  const exportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      cacheStats,
      performanceData,
      errorReports,
      memoryInfo
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `pdf-performance-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    message.success('Dữ liệu đã được export');
  };

  /**
   * Clear all cached data và performance history
   */
  const clearAllData = () => {
    pdfCacheService.clearCache();
    localStorage.removeItem('pdf-performance-data');
    localStorage.removeItem('pdf-error-reports');
    loadDashboardData();
    message.success('Đã xóa tất cả dữ liệu cache và performance');
  };

  // Performance data table columns
  const performanceColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => new Date(timestamp).toLocaleTimeString(),
      width: 100
    },
    {
      title: 'Contract',
      dataIndex: 'contractNo',
      key: 'contractNo',
      width: 120
    },
    {
      title: 'Load Time',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration}ms`,
      sorter: (a, b) => a.duration - b.duration,
      width: 100
    },
    {
      title: 'Pages',
      dataIndex: 'numPages',
      key: 'numPages',
      width: 80
    },
    {
      title: 'Memory',
      dataIndex: ['memoryUsage', 'used'],
      key: 'memory',
      render: (used) => used ? `${used}MB` : 'N/A',
      width: 100
    },
    {
      title: 'Phase',
      dataIndex: 'phase',
      key: 'phase',
      render: (phase) => (
        <Tag color={phase?.includes('Phase 5') ? 'green' : 'blue'}>
          {phase || 'Legacy'}
        </Tag>
      ),
      width: 120
    }
  ];

  // Error reports table columns  
  const errorColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => new Date(timestamp).toLocaleString(),
      width: 150
    },
    {
      title: 'Lỗi',
      dataIndex: ['error', 'message'],
      key: 'error',
      render: (message) => (
        <span className="text-red-600 text-sm">{message}</span>
      )
    },
    {
      title: 'Browser',
      dataIndex: 'userAgent',
      key: 'userAgent',
      render: (ua) => {
        const browser = ua?.includes('Chrome') ? 'Chrome' : 
                      ua?.includes('Firefox') ? 'Firefox' :
                      ua?.includes('Safari') ? 'Safari' : 'Unknown';
        return <Tag>{browser}</Tag>;
      },
      width: 100
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <DashboardOutlined className="mr-2" />
          PDF Performance Dashboard - Phase 6
        </h1>
        <div className="space-x-2">
          <Button 
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={refreshing}
          >
            Refresh
          </Button>
          <Button 
            icon={<DownloadOutlined />}
            onClick={exportData}
          >
            Export Data
          </Button>
          <Button 
            danger
            onClick={clearAllData}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cache Hit Rate"
              value={cacheStats?.hitRate || 0}
              precision={1}
              suffix="%"
              valueStyle={{ color: (cacheStats?.hitRate || 0) > 70 ? '#3f8600' : '#cf1322' }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cached PDFs"
              value={cacheStats?.totalEntries || 0}
              suffix="files"
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cache Size" 
              value={cacheStats?.memoryUsage || '0 MB'}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Error Rate"
              value={errorReports.length}
              suffix="errors"
              valueStyle={{ color: errorReports.length > 5 ? '#cf1322' : '#3f8600' }}
              prefix={<BugOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Cache và Memory Usage */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Cache Utilization" className="h-full">
            {cacheStats && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Cache Usage</span>
                    <span>{cacheStats.utilizationPercent?.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    percent={cacheStats.utilizationPercent} 
                    status={cacheStats.utilizationPercent > 80 ? 'exception' : 'normal'}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Total Entries</div>
                    <div className="font-semibold">{cacheStats.totalEntries}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Total Hits</div>
                    <div className="font-semibold">{cacheStats.totalHits}</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Memory Usage" className="h-full">
            {memoryInfo && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Heap Usage</span>
                    <span>{((memoryInfo.used / memoryInfo.limit) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    percent={(memoryInfo.used / memoryInfo.limit) * 100}
                    status={(memoryInfo.used / memoryInfo.limit) > 0.8 ? 'exception' : 'normal'}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Used</div>
                    <div className="font-semibold">{memoryInfo.used}MB</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Total</div>
                    <div className="font-semibold">{memoryInfo.total}MB</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Limit</div>
                    <div className="font-semibold">{memoryInfo.limit}MB</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Performance History */}
      <Row gutter={16} className="mb-6">
        <Col span={24}>
          <Card title="Performance History" className="mb-4">
            <Table 
              dataSource={performanceData}
              columns={performanceColumns}
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
              size="small"
              rowKey={(record) => record.timestamp}
            />
          </Card>
        </Col>
      </Row>

      {/* Error Reports */}
      <Row gutter={16}>
        <Col span={24}>
          <Card title="Recent Errors">
            <Table 
              dataSource={errorReports}
              columns={errorColumns}
              pagination={{ pageSize: 5 }}
              scroll={{ x: true }}
              size="small"
              rowKey={(record) => record.timestamp}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default PDFPerformanceDashboard;