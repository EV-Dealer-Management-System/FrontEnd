import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Spin, Button, Slider, message, Tooltip } from 'antd';
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
import { pdfCacheService } from './PDFCacheService';

// Cấu hình worker cho pdfjs sử dụng file trong public
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();


function PDFViewer({ contractNo, pdfUrl: externalPdfUrl, showAllPages = false }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [scale, setScale] = useState(1.2); // Zoom scale
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadTime, setLoadTime] = useState(null); // Performance tracking
  const [touchStart, setTouchStart] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [pinchDistance, setPinchDistance] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [errorInfo, setErrorInfo] = useState(null);
  
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
      
      // Phase 5: Check cache first
      const cacheKey = contractNo || 'default-pdf';
      
      // Nếu đã có pdfUrl từ props (blob URL từ CreateContract), cache nó và sử dụng
      if (externalPdfUrl) {
        // Try to cache the external PDF for future use
        if (externalPdfUrl instanceof Blob) {
          pdfCacheService.cachePDF(cacheKey, externalPdfUrl, {
            contractNo,
            source: 'props',
            timestamp: Date.now()
          });
        }
        setPdfUrl(externalPdfUrl);
        setLoading(false);
        return;
      }

      // Phase 5: Try cache first before API call
      const cachedPdf = await pdfCacheService.getCachedPDF(cacheKey);
      if (cachedPdf) {
        console.log(`🎯 Using cached PDF for ${cacheKey}`);
        setPdfUrl(cachedPdf);
        setLoading(false);
        return;
      }

      // Nếu không có, thử fetch từ API (backup logic)
      try {
        setLoading(true);
        
        // Lấy JWT token từ localStorage cho authentication header
        const token = localStorage.getItem('jwt_token');
        
        if (!token) {
          throw new Error('Không tìm thấy token xác thực');
        }

        // NOTE: Đây là backup logic - thông thường pdfUrl sẽ được truyền từ CreateContract
        // CreateContract đã extract token từ downloadUrl và gọi preview API
        const response = await api.get('/EContract/preview', {
          responseType: 'blob',
          headers: {
            'Accept': 'application/pdf',
          }
        });

        // Phase 5: Cache the PDF và tạo blob URL
        const blob = new Blob([response.data], { type: 'application/pdf' });
        
        // Cache for future use
        await pdfCacheService.cachePDF(cacheKey, blob, {
          contractNo,
          source: 'api',
          timestamp: Date.now(),
          size: blob.size
        });
        
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        
      } catch (error) {
        console.error('Lỗi khi tải PDF:', error);
        
        // Phase 5: Enhanced error handling với detailed diagnostics
        const errorDetails = {
          message: error.message,
          status: error.response?.status,
          retryCount,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          networkInfo: navigator.connection ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt
          } : null,
          memoryInfo: performance.memory ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
          } : null
        };
        
        setErrorInfo(errorDetails);
        
        // Phase 5: Smart retry strategy với network-aware backoff
        const maxRetries = navigator.connection?.effectiveType === 'slow-2g' ? 2 : 3;
        const baseDelay = navigator.connection?.effectiveType === '4g' ? 500 : 1000;
        
        if (retryCount < maxRetries) {
          const delay = baseDelay * Math.pow(2, retryCount);
          
          message.warning(`Thử lại lần ${retryCount + 1}/${maxRetries} sau ${delay}ms...`);
          
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            fetchPdf();
          }, delay);
        } else {
          // Phase 5: Enhanced fallback strategies
          const fallbackMessage = `Không thể tải PDF sau ${maxRetries} lần thử. `;
          
          if (error.response?.status === 200 && error.response?.data) {
            // PDF data OK nhưng render fail - mở trong tab mới
            const blob = new Blob([error.response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            message.info(fallbackMessage + 'Đã mở PDF trong tab mới.');
          } else if (navigator.onLine === false) {
            message.error(fallbackMessage + 'Vui lòng kiểm tra kết nối mạng.');
          } else {
            message.error(fallbackMessage + 'Vui lòng thử lại sau hoặc liên hệ hỗ trợ.');
          }
        }
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
  }, [externalPdfUrl]); // Re-run khi externalPdfUrl thay đổi

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
        scale,
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
  
  // Phase 5: Optimized zoom với memory monitoring
  const zoomIn = useCallback(() => {
    setScale(prev => {
      const newScale = Math.min(prev + 0.2, 3);
      trackMemoryUsage();
      return newScale;
    });
  }, [trackMemoryUsage]);

  const zoomOut = useCallback(() => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.2, 0.5);
      trackMemoryUsage();
      return newScale;
    });
  }, [trackMemoryUsage]);

  const resetZoom = useCallback(() => {
    setScale(1.2);
    trackMemoryUsage();
  }, [trackMemoryUsage]);
  
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
      
      setScale(prev => {
        const newScale = Math.max(0.5, Math.min(3, prev * (scaleChange * sensitivity)));
        
        // Throttle memory tracking on mobile để tránh lag
        if (!isMobile || Date.now() % 500 === 0) {
          trackMemoryUsage();
        }
        
        return newScale;
      });
      
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
    if (!isMobile) return scale;
    
    // Mobile optimization: adjust scale based on screen size
    const screenWidth = window.innerWidth;
    if (screenWidth < 480) {
      return Math.min(scale, 1.0); // Max 1.0 trên mobile nhỏ
    } else if (screenWidth < 768) {
      return Math.min(scale, 1.2); // Max 1.2 trên tablet
    }
    return scale;
  }, [scale, isMobile]);

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
      {/* Header controls - Chỉ hiển thị khi KHÔNG phải showAllPages */}
      {!showAllPages && (
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
            
            <span className="text-sm px-2">{Math.round(scale * 100)}%</span>
            
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
            <Spin size="large" tip="Đang tải PDF từ server..." />
          </div>
        )}
        
        {!loading && pdfUrl && (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            // Phase 5: Enhanced error handling với fallback
            onLoadError={(error) => {
              console.error('Document load error:', error);
              const errorDetails = {
                type: 'document-load-error',
                message: error.message,
                timestamp: new Date().toISOString(),
                pdfUrl: typeof pdfUrl === 'string' ? 'URL' : 'Blob'
              };
              setErrorInfo(errorDetails);
              trackMemoryUsage();
            }}
            loading={
              <div className="text-center p-8">
                <Spin size="large" tip="Đang render PDF..." />
                {memoryUsage && (
                  <div className="text-xs text-gray-400 mt-2">
                    RAM: {memoryUsage.used}MB / {memoryUsage.total}MB
                  </div>
                )}
              </div>
            }
            error={
              <div className="text-center text-red-500 p-4">
                <div className="mb-3">⚠️ Không thể hiển thị PDF</div>
                {errorInfo && (
                  <div className="text-sm text-gray-600 mb-3 max-w-md mx-auto">
                    <div><strong>Lỗi:</strong> {errorInfo.message}</div>
                    <div><strong>Đã thử:</strong> {errorInfo.retryCount + 1} lần</div>
                    {errorInfo.networkInfo && (
                      <div><strong>Mạng:</strong> {errorInfo.networkInfo.effectiveType}</div>
                    )}
                    {errorInfo.memoryInfo && (
                      <div><strong>RAM:</strong> {errorInfo.memoryInfo.used}MB</div>
                    )}
                  </div>
                )}
                <div className="space-x-2">
                  <Button 
                    type="primary" 
                    onClick={() => {
                      if (typeof pdfUrl === 'string') {
                        window.open(pdfUrl, '_blank');
                      } else {
                        const url = URL.createObjectURL(pdfUrl);
                        window.open(url, '_blank');
                      }
                    }}
                  >
                    📄 Mở trong tab mới
                  </Button>
                  <Button 
                    onClick={() => {
                      setRetryCount(0);
                      setErrorInfo(null);
                      window.location.reload();
                    }}
                  >
                    🔄 Tải lại
                  </Button>
                </div>
              </div>
            }
            className="w-full flex justify-center"
            // Phase 5: Performance tuning
            ref={documentRef}
          >
            {showAllPages ? (
              // Render tất cả trang với scroll tốt - chỉ căn giữa ngang
              <div className="w-full flex flex-col">
                {Array.from(new Array(numPages), (el, index) => (
                  <div key={`page_${index + 1}`} className="flex justify-center mb-4">
                    <Page
                      pageNumber={index + 1}
                      scale={0.8} // Fixed scale cho all pages
                      className="shadow-lg border border-gray-200"
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                      onLoadError={(error) => {
                        console.error(`Page ${index + 1} load error:`, error);
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              // Render single page như trước
              <Page 
                pageNumber={pageNumber} 
                scale={getResponsiveScale}
                className={`shadow-lg ${isMobile ? 'max-w-full' : ''}`}
                // Phase 5: Performance optimizations
                renderAnnotationLayer={false} // Tắt annotations để tiết kiệm memory
                renderTextLayer={false} // Tắt text layer để render nhanh hơn
                // Phase 5: Error handling cho từng page
                onLoadError={(error) => {
                  console.error(`Page ${pageNumber} load error:`, error);
                  message.error(`Lỗi tải trang ${pageNumber}: ${error.message}`);
                }}
                onRenderSuccess={() => {
                  // Track successful renders
                  trackMemoryUsage();
                }}
              />
            )}
          </Document>
        )}
        
        {!loading && !pdfUrl && (
          <div className="text-center text-gray-500 p-4">
            <FilePdfOutlined className="text-4xl mb-2" />
            <div>Không có PDF để hiển thị</div>
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
              Trang {pageNumber} / {numPages}
            </span>
            {loadTime && (
              <Tooltip title="Thời gian tải PDF">
                <span className="text-xs text-gray-500">
                  ⏱️ {Date.now() - loadTime}ms
                </span>
              </Tooltip>
            )}
            {/* Phase 5: Cache status indicator */}
            <Tooltip title="PDF được tải từ cache">
              <span className="text-xs text-green-600">
                💾 Cached
              </span>
            </Tooltip>
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