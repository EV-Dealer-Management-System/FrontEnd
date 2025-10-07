import React, { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import PDFErrorBoundary from './PDFErrorBoundary';

// Phase 5: Lazy load PDFViewer để giảm initial bundle size
const LazyPDFViewer = lazy(() => 
  import('./PDFViewer').then(module => ({
    default: module.default
  }))
);

// Phase 5: Lazy load PDFjs worker chỉ khi cần thiết
const loadPDFWorker = () => {
  return import('react-pdf').then(({ pdfjs }) => {
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString();
    }
    return pdfjs;
  });
};

// Phase 5: Loading fallback component cho PDF viewer
const PDFLoadingFallback = ({ message = "Đang tải PDF Viewer..." }) => (
  <div className="w-full h-64 flex items-center justify-center border border-gray-300 rounded-lg">
    <div className="text-center">
      <Spin size="large" />
      <div className="mt-2 text-gray-600">{message}</div>
      <div className="text-xs text-gray-400 mt-1">
        Đang tải thư viện PDF... (chỉ lần đầu)
      </div>
    </div>
  </div>
);

// Phase 5: Optimized PDF Viewer Wrapper với bundle splitting
const OptimizedPDFViewer = ({ contractNo, pdfUrl, ...props }) => {
  // Preload worker khi component mount
  React.useEffect(() => {
    loadPDFWorker().catch(error => {
      console.warn('Failed to preload PDF worker:', error);
    });
  }, []);

  return (
    <PDFErrorBoundary>
      <Suspense 
        fallback={
          <PDFLoadingFallback 
            message={`Đang tải PDF Viewer cho hợp đồng ${contractNo}...`}
          />
        }
      >
        <LazyPDFViewer 
          contractNo={contractNo} 
          pdfUrl={pdfUrl} 
          {...props}
        />
      </Suspense>
    </PDFErrorBoundary>
  );
};

export default OptimizedPDFViewer;