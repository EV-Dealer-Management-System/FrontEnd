import React from 'react';
import { Button, Result } from 'antd';
import { ReloadOutlined, BugOutlined } from '@ant-design/icons';

// Phase 5: Error Boundary cho PDFViewer component
class PDFErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Cập nhật state để hiển thị fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details cho debugging
    console.error('PDFViewer Error Boundary caught an error:', error, errorInfo);
    
    // Phase 5: Enhanced error logging với context
    const errorReport = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      memoryUsage: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : null,
      networkInfo: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null
    };

    // Save error report to localStorage for later analysis
    const errorHistory = JSON.parse(localStorage.getItem('pdf-error-reports') || '[]');
    errorHistory.push(errorReport);
    // Keep only last 20 error reports
    localStorage.setItem('pdf-error-reports', JSON.stringify(errorHistory.slice(-20)));

    this.setState({
      error,
      errorInfo: errorReport
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Optional: reload page for complete reset
    if (this.props.forceReloadOnRetry) {
      window.location.reload();
    }
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    
    // Phase 5: Error reporting mechanism
    const reportData = {
      subject: 'PDF Viewer Error Report',
      body: `
Lỗi PDF Viewer:
- Message: ${error?.message || 'Unknown error'}
- Component: PDFViewer
- Time: ${errorInfo?.timestamp || new Date().toISOString()}
- Browser: ${errorInfo?.userAgent || navigator.userAgent}
- Memory: ${errorInfo?.memoryUsage ? `${errorInfo.memoryUsage.used}MB/${errorInfo.memoryUsage.total}MB` : 'N/A'}
- Network: ${errorInfo?.networkInfo ? errorInfo.networkInfo.effectiveType : 'N/A'}

Technical Details:
${error?.stack || 'No stack trace available'}
      `.trim()
    };

    // Create mailto link or send to error reporting service
    const mailtoLink = `mailto:support@example.com?subject=${encodeURIComponent(reportData.subject)}&body=${encodeURIComponent(reportData.body)}`;
    window.open(mailtoLink);
  };

  render() {
    if (this.state.hasError) {
      // Phase 5: Enhanced error UI với recovery options
      return (
        <div className="w-full h-full flex items-center justify-center p-8">
          <Result
            status="error"
            title="PDF Viewer Error"
            subTitle={
              <div className="space-y-2">
                <p>Đã xảy ra lỗi khi hiển thị PDF. Vui lòng thử các giải pháp dưới đây:</p>
                {this.state.error && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <strong>Chi tiết lỗi:</strong> {this.state.error.message}
                  </div>
                )}
                {this.state.errorInfo?.memoryUsage && (
                  <div className="text-xs text-gray-500">
                    RAM sử dụng: {this.state.errorInfo.memoryUsage.used}MB / {this.state.errorInfo.memoryUsage.total}MB
                  </div>
                )}
              </div>
            }
            extra={
              <div className="space-x-2">
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />}
                  onClick={this.handleRetry}
                >
                  Thử lại
                </Button>
                <Button 
                  type="default"
                  onClick={() => window.location.reload()}
                >
                  Tải lại trang
                </Button>
                <Button 
                  type="default"
                  icon={<BugOutlined />}
                  onClick={this.handleReportError}
                >
                  Báo lỗi
                </Button>
              </div>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default PDFErrorBoundary;