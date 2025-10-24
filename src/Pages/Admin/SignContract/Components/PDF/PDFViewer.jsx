import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Spin, Button, Slider, message, Tooltip } from 'antd';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { 
  FilePdfOutlined, 
  ZoomInOutlined, 
  ZoomOutOutlined, 
  LeftOutlined, 
  RightOutlined,
  ExpandOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons';
import api from '../../../../../api/api';
import { pdfCacheService } from '../../../../../App/Home/PDFconfig/PDFCacheService';

// Cấu hình worker cho pdfjs sử dụng file trong public
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();


function PDFViewer({ contractNo, pdfUrl: externalPdfUrl, showAllPages = false, scale: externalScale }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [internalScale, setInternalScale] = useState(1.2); // Internal scale khi không có external scale
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadTime, setLoadTime] = useState(null); // Performance tracking
  const [touchStart, setTouchStart] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [pinchDistance, setPinchDistance] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [errorInfo, setErrorInfo] = useState(null);
  const [isDocumentReady, setIsDocumentReady] = useState(false);
  
  // Phase 5: Advanced performance optimizations
  const documentRef = useRef(null);
  const [memoryUsage, setMemoryUsage] = useState(null);
  const [renderQueue, setRenderQueue] = useState(new Set());
  const [visiblePages, setVisiblePages] = useState(new Set([1]));
  const intersectionObserverRef = useRef(null);

  useEffect(() => {
    // Detect mobile device
    setIsMobile(window.innerWidth <= 768);
    
    const fetchPdf = async () => {
  const startTime = Date.now();
  setLoadTime(startTime);
  const cacheKey = contractNo || 'default-pdf';

  try {
    // ✅ Trường hợp externalPdfUrl là Blob (BE đã xử lý preview rồi)
    if (externalPdfUrl instanceof Blob) {
      const blobUrl = URL.createObjectURL(externalPdfUrl);
      try {
        await pdfCacheService.cachePDF(cacheKey, externalPdfUrl, {
          contractNo,
          source: 'props-blob',
          timestamp: Date.now(),
          size: externalPdfUrl.size,
        });
      } catch (err) {
        console.warn('⚠️ Lưu cache thất bại:', err);
      }
      setPdfUrl(blobUrl);
      setLoading(false);
      return;
    }

    // ✅ Nếu là chuỗi URL
    if (typeof externalPdfUrl === 'string') {
      // Nếu là blob: URL → không cần fetch lại
      if (externalPdfUrl.startsWith('blob:')) {
        setPdfUrl(externalPdfUrl);
        setLoading(false);
        return;
      }

      // ✅ Chỉ xử lý nếu có downloadUrl=
      const downloadUrlMatch = externalPdfUrl.match(/[?&]downloadUrl=([^&]+)/);
      const encodedDownloadUrl = downloadUrlMatch ? downloadUrlMatch[1] : null;

      if (encodedDownloadUrl) {
        const response = await api.get(`/EContract/preview?downloadUrl=${encodedDownloadUrl}`, {
          responseType: 'blob',
          timeout: 30000,
          headers: { Accept: 'application/pdf' },
        });

        if (response.status !== 200 || !response.data) {
          throw new Error(`Backend preview API trả về lỗi: ${response.status}`);
        }

        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

        const blobUrl = URL.createObjectURL(pdfBlob);
        try {
          await pdfCacheService.cachePDF(cacheKey, pdfBlob, {
            contractNo,
            source: 'normalized-url',
            timestamp: Date.now(),
            size: pdfBlob.size,
          });
        } catch (err) {
          console.warn('⚠️ Cache normalized blob lỗi:', err);
        }
        setPdfUrl(blobUrl);
        setLoading(false);
        return;
      }

      // ❌ Không có downloadUrl → không hợp lệ
      throw new Error('externalPdfUrl không chứa thông tin downloadUrl hợp lệ');
    }

    // ✅ Nếu không có externalPdfUrl → thử lấy cache
    try {
      const cached = await pdfCacheService.getCachedPDF(cacheKey);
      if (cached) {
        setPdfUrl(cached);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('⚠️ Không lấy được cache:', err);
    }

    // ❌ Nếu đến đây vẫn không có PDF → báo lỗi
    throw new Error('Không tìm thấy nguồn PDF để hiển thị');
  } catch (error) {
    console.error('❌ Lỗi trong fetchPdf:', error);
    setErrorInfo({
      message: error.message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  } finally {
    setLoading(false);
  }
};


    fetchPdf();
    
    // Cleanup function để giải phóng blob URL (chỉ khi tạo blob URL mới)
    return () => {
      if (pdfUrl && !externalPdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [externalPdfUrl, retryCount]); // Re-run khi externalPdfUrl hoặc retryCount thay đổi

  // Phase 5: Enhanced performance tracking với memory monitoring
  const trackMemoryUsage = useCallback(() => {
    if (performance.memory) {
      const memData = {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
      setMemoryUsage(memData);
      
      // Warning nếu memory usage cao
      if (memData.used > memData.limit * 0.8) {
        console.warn('🚨 Memory usage cao:', memData);
        // Trigger cleanup nếu cần
        cleanupUnusedPages();
      }
      
      return memData;
    }
    return null;
  }, []);

  // Phase 5: Cleanup unused pages để giải phóng memory
  const cleanupUnusedPages = useCallback(() => {
    // Clear pages không visible để tiết kiệm memory
    setRenderQueue(prev => {
      const newQueue = new Set();
      visiblePages.forEach(page => newQueue.add(page));
      return newQueue;
    });
    
    // Force garbage collection nếu available
    if (window.gc) {
      window.gc();
    }
  }, [visiblePages]);

  // Khi load xong PDF
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    const endTime = Date.now();
    
    // Phase 5: Enhanced performance metrics
    if (loadTime) {
      const duration = endTime - loadTime;
      const memData = trackMemoryUsage();
      
      const performanceData = {
        viewer: 'React-PDF',
        duration,
        numPages,
        scale: currentScale,
        timestamp: new Date().toISOString(),
        contractNo,
        memoryUsage: memData,
        phase: 'Phase 5 - Optimized',
        deviceInfo: {
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          connection: navigator.connection ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink
          } : null
        }
      };
      
      // Intelligent caching với size limit
      const existingData = JSON.parse(localStorage.getItem('pdf-performance-data') || '[]');
      existingData.push(performanceData);
      
      // Phase 5: Smart cache management - giữ dữ liệu theo priority
      const sortedData = existingData
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 100); // Tăng từ 50 lên 100 records
      
      localStorage.setItem('pdf-performance-data', JSON.stringify(sortedData));
      
      console.log(`🚀 Phase 5 React-PDF Performance:`, performanceData);
      
      // Enhanced performance comparison
      const recentData = sortedData.slice(0, 10);
      const avgDuration = recentData.reduce((sum, d) => sum + d.duration, 0) / recentData.length;
      
      if (duration > avgDuration * 1.5) {
        message.warning(`PDF tải chậm hơn bình thường: ${duration}ms (trung bình: ${Math.round(avgDuration)}ms)`);
      } else {
        message.success(`PDF tải thành công: ${duration}ms ${memData ? `(RAM: ${memData.used}MB)` : ''}`);
      }
    }
  }

  // Phase 5: Optimized navigation với prefetching
  const goToPrevPage = useCallback(() => {
    const newPage = Math.max(pageNumber - 1, 1);
    setPageNumber(newPage);
    // Prefetch previous page nếu có
    if (newPage > 1) {
      setVisiblePages(prev => new Set([...prev, newPage - 1]));
    }
    trackMemoryUsage();
  }, [pageNumber, trackMemoryUsage]);

  const goToNextPage = useCallback(() => {
    const newPage = Math.min(pageNumber + 1, numPages);
    setPageNumber(newPage);
    // Prefetch next page
    if (newPage < numPages) {
      setVisiblePages(prev => new Set([...prev, newPage + 1]));
    }
    trackMemoryUsage();
  }, [pageNumber, numPages, trackMemoryUsage]);
  
  // Get current scale - ưu tiên external scale, fallback về internal scale
  const currentScale = externalScale || internalScale;

  // Phase 5: Optimized zoom với memory monitoring (chỉ khi không có external scale)
  const zoomIn = useCallback(() => {
    if (!externalScale) {
      setInternalScale(prev => {
        const newScale = Math.min(prev + 0.2, 3);
        trackMemoryUsage();
        return newScale;
      });
    }
  }, [externalScale, trackMemoryUsage]);

  const zoomOut = useCallback(() => {
    if (!externalScale) {
      setInternalScale(prev => {
        const newScale = Math.max(prev - 0.2, 0.5);
        trackMemoryUsage();
        return newScale;
      });
    }
  }, [externalScale, trackMemoryUsage]);

  const resetZoom = useCallback(() => {
    if (!externalScale) {
      setInternalScale(1.2);
      trackMemoryUsage();
    }
  }, [externalScale, trackMemoryUsage]);
  
  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    trackMemoryUsage();
  }, [isFullscreen, trackMemoryUsage]);

  // Phase 5: Enhanced mobile gestures với performance optimization
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setTouchStart({ 
        x: touch.clientX, 
        y: touch.clientY,
        timestamp: Date.now() 
      });
    } else if (e.touches.length === 2) {
      e.preventDefault(); // Prevent default zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setPinchDistance(distance);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    // Phase 5: Optimized pinch-to-zoom với throttling
    if (e.touches.length === 2 && pinchDistance > 0) {
      e.preventDefault();
      
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const scaleChange = distance / pinchDistance;
      const sensitivity = isMobile ? 1.2 : 1.0; // Tăng sensitivity trên mobile
      
      // Chỉ cho phép pinch zoom khi không có external scale
      if (!externalScale) {
        setInternalScale(prev => {
          const newScale = Math.max(0.5, Math.min(3, prev * (scaleChange * sensitivity)));
          
          // Throttle memory tracking on mobile để tránh lag
          if (!isMobile || Date.now() % 500 === 0) {
            trackMemoryUsage();
          }
          
          return newScale;
        });
      }
      
      setPinchDistance(distance);
    }
  }, [pinchDistance, isMobile, trackMemoryUsage]);

  const handleTouchEnd = useCallback((e) => {
    if (touchStart && e.changedTouches.length === 1) {
      const touchEnd = { 
        x: e.changedTouches[0].clientX, 
        y: e.changedTouches[0].clientY,
        timestamp: Date.now()
      };
      
      const deltaX = touchEnd.x - touchStart.x;
      const deltaY = touchEnd.y - touchStart.y;
      const deltaTime = touchEnd.timestamp - touchStart.timestamp;
      
      // Phase 5: Enhanced swipe detection với velocity và mobile optimization
      const minSwipeDistance = isMobile ? 30 : 50; // Giảm threshold trên mobile
      const maxSwipeTime = 500; // Maximum time for swipe gesture
      
      if (deltaTime < maxSwipeTime && Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY)) {
        const velocity = Math.abs(deltaX) / deltaTime; // px/ms
        
        // Faster swipes are more responsive
        if (velocity > 0.3 || Math.abs(deltaX) > minSwipeDistance * 2) {
          if (deltaX > 0) {
            goToPrevPage(); // Swipe right = previous page
          } else {
            goToNextPage(); // Swipe left = next page
          }
        }
      }
    }
    setTouchStart(null);
    setPinchDistance(0);
  }, [touchStart, isMobile, goToPrevPage, goToNextPage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isFullscreen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'PageUp':
          goToPrevPage();
          break;
        case 'ArrowRight':
        case 'PageDown':
          goToNextPage();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          resetZoom();
          break;
        case 'Escape':
          setIsFullscreen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, numPages, pageNumber]);

  // Phase 5: Responsive scale adjustment
  const getResponsiveScale = useMemo(() => {
    if (!isMobile) return currentScale;
    
    // Mobile optimization: adjust scale based on screen size
    const screenWidth = window.innerWidth;
    if (screenWidth < 480) {
      return Math.min(currentScale, 1.0); // Max 1.0 trên mobile nhỏ
    } else if (screenWidth < 768) {
      return Math.min(currentScale, 1.2); // Max 1.2 trên tablet
    }
    return currentScale;
  }, [currentScale, isMobile]);

  // Phase 5: Viewport meta optimization
  useEffect(() => {
    if (isMobile) {
      // Optimize viewport for mobile PDF viewing
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const originalContent = viewportMeta?.getAttribute('content');
      
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 
          'width=device-width, initial-scale=1, maximum-scale=3, user-scalable=yes'
        );
      }
      
      // Cleanup function
      return () => {
        if (viewportMeta && originalContent) {
          viewportMeta.setAttribute('content', originalContent);
        }
      };
    }
  }, [isMobile]);

  return (
    <div className={`w-full ${showAllPages ? 'bg-transparent' : `flex flex-col bg-white ${
      isFullscreen ? 'fixed inset-0 z-50' : 'rounded-lg shadow-lg'
    } ${isMobile ? 'p-2' : 'p-4'}`}`}>
      {/* Header controls - Chỉ hiển thị khi KHÔNG phải showAllPages và KHÔNG có external scale */}
      {!showAllPages && !externalScale && (
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-between items-center'} mb-4 pb-3 border-b`}>
          <div className="flex items-center">
            <FilePdfOutlined className="mr-2 text-blue-600" />
            <span className={`font-semibold text-blue-600 ${isMobile ? 'text-sm' : ''}`}>
              {contractNo ? `Hợp đồng số: ${contractNo}` : 'Xem hợp đồng PDF'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Tooltip title="Thu nhỏ">
              <Button size="small" icon={<ZoomOutOutlined />} onClick={zoomOut} />
            </Tooltip>
            
            <span className="text-sm px-2">{Math.round(currentScale * 100)}%</span>
            
            <Tooltip title="Phóng to">
              <Button size="small" icon={<ZoomInOutlined />} onClick={zoomIn} />
            </Tooltip>
            
            <Tooltip title="Reset zoom">
              <Button size="small" onClick={resetZoom}>
                100%
              </Button>
            </Tooltip>
            
            <Tooltip title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}>
              <Button 
                size="small" 
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
                onClick={toggleFullscreen} 
              />
            </Tooltip>
          </div>
        </div>
      )}
      
      <div 
        className={
          showAllPages 
            ? 'w-full overflow-auto flex justify-center' // Thêm overflow-auto và flex justify-center cho showAllPages
            : 'w-full bg-gray-50 rounded-lg border border-gray-200 flex justify-center items-center min-h-[600px]'
        }
        style={showAllPages ? { overflowY: "auto" } : {}}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {loading && (
          <div className="flex flex-col items-center">
            <Spin size="large" tip="Đang tải PDF từ server..." fullscreen/>
          </div>
        )}
        
        {/* ✅ Giai đoạn render Document + Page (đã thêm guard tránh crash worker) */}
        {!loading && pdfUrl && !errorInfo && (
          <Document
            key={pdfUrl} // đảm bảo worker được re-init khi đổi file
            file={pdfUrl}
            loading={<div className="text-center text-gray-500 p-4">⏳ Đang tải PDF...</div>}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
              setErrorInfo(null);
            }}
            onLoadError={(e) => {
              console.error('❌ Lỗi load tài liệu:', e);
              setNumPages(null);
              setPdfUrl(null);
              setErrorInfo({ message: 'Tập tin PDF không hợp lệ hoặc không thể tải.' });
            }}
          >
            {numPages > 0 && (
              showAllPages ? (
                Array.from({ length: numPages }, (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    scale={getResponsiveScale}
                    // Giữ text/annotation layer (đã import CSS bên trên)
                    renderTextLayer
                    renderAnnotationLayer
                    loading={<div className="text-center text-gray-400 py-4">Đang kết xuất trang {index + 1}…</div>}
                    onRenderError={(err) => {
                      console.error(`Lỗi render trang ${index + 1}:`, err);
                      message.error(`Không hiển thị được trang ${index + 1}`);
                    }}
                  />
                ))
              ) : (
                <Page
                  key={`page_${pageNumber}`}
                  pageNumber={pageNumber}
                  scale={getResponsiveScale}
                  renderTextLayer
                  renderAnnotationLayer
                  loading={<div className="text-center text-gray-400 py-4">Đang kết xuất trang {pageNumber}…</div>}
                  onRenderError={(err) => {
                    console.error(`Lỗi render trang ${pageNumber}:`, err);
                    message.error(`Không hiển thị được trang ${pageNumber}`);
                  }}
                />
              )
            )}
          </Document>
        )}
        
        {/* ✅ Thông báo lỗi nếu có lỗi */}
        {errorInfo && (
          <div className="text-center text-red-500 p-4">
            <p>⚠ {errorInfo.message}</p>
            <button
              className="mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => window.location.reload()}
            >
              🔄 Tải lại
            </button>
          </div>
        )}

        {/* ✅ Nếu pdfUrl bị null do lỗi */}
        {!loading && !pdfUrl && !errorInfo && (
          <div className="text-center text-gray-500 p-4">
            Không có tài liệu để hiển thị.
          </div>
        )}
      </div>
      
      {/* Navigation Controls - Ẩn khi hiển thị tất cả trang */}
      {numPages && !showAllPages && (
        <div className="flex items-center justify-center mt-4 gap-4 pt-3 border-t">
          <Button 
            icon={<LeftOutlined />} 
            onClick={goToPrevPage} 
            disabled={pageNumber <= 1}
            size="small"
          >
            Trang trước 
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Trang   {pageNumber} / {numPages}
            </span>
          </div>
          
          <Button 
            icon={<RightOutlined />} 
            onClick={goToNextPage} 
            disabled={pageNumber >= numPages}
            size="small"
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
}

export default PDFViewer;