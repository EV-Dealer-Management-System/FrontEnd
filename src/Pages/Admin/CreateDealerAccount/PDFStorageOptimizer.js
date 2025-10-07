// Phase 6: Storage Optimization & Cleanup Utilities

class PDFStorageOptimizer {
  constructor() {
    this.storageKeys = {
      performance: 'pdf-performance-data',
      errors: 'pdf-error-reports', 
      cache: 'pdf-cache-metadata',
      legacy: [
        'pdf-viewer-mode', // Phase 1-3 legacy
        'google-docs-performance', // Pre-migration data
        'pdf-comparison-data', // Phase 2-3 testing data
        'pdf-test-results' // PDFTestPanel results
      ]
    };
    this.maxStorageSizes = {
      performance: 100, // Max 100 performance records
      errors: 20, // Max 20 error reports
      cache: 50 * 1024 * 1024 // 50MB cache limit
    };
  }

  // Phase 6: Clean up legacy localStorage data
  async cleanupLegacyStorage() {
    console.log('🧹 Starting Phase 6 storage cleanup...');
    
    let totalCleaned = 0;
    const cleanupResults = {
      removedKeys: [],
      compactedData: {},
      spaceSaved: 0
    };

    // Remove legacy keys from Phase 1-3
    this.storageKeys.legacy.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        const size = new Blob([data]).size;
        localStorage.removeItem(key);
        cleanupResults.removedKeys.push({ key, size });
        totalCleaned += size;
      }
    });

    // Compact performance data
    const performanceData = this.compactPerformanceData();
    if (performanceData.spaceSaved > 0) {
      cleanupResults.compactedData.performance = performanceData;
      totalCleaned += performanceData.spaceSaved;
    }

    // Compact error reports
    const errorData = this.compactErrorReports();
    if (errorData.spaceSaved > 0) {
      cleanupResults.compactedData.errors = errorData;
      totalCleaned += errorData.spaceSaved;
    }

    cleanupResults.spaceSaved = totalCleaned;
    
    console.log('✅ Storage cleanup completed:', cleanupResults);
    return cleanupResults;
  }

  // Compact performance data to keep only relevant metrics
  compactPerformanceData() {
    try {
      const rawData = localStorage.getItem(this.storageKeys.performance);
      if (!rawData) return { spaceSaved: 0 };

      const data = JSON.parse(rawData);
      const originalSize = new Blob([rawData]).size;

      if (data.length > this.maxStorageSizes.performance) {
        // Keep most recent and best performing entries
        const sortedData = data
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, this.maxStorageSizes.performance);

        // Additional filtering: remove duplicate entries with same contractNo
        const uniqueData = sortedData.reduce((acc, item) => {
          const existingIndex = acc.findIndex(x => 
            x.contractNo === item.contractNo && 
            Math.abs(new Date(x.timestamp) - new Date(item.timestamp)) < 5000 // 5s window
          );
          
          if (existingIndex === -1) {
            acc.push(item);
          } else {
            // Keep the better performing one
            if (item.duration < acc[existingIndex].duration) {
              acc[existingIndex] = item;
            }
          }
          return acc;
        }, []);

        const compactedData = JSON.stringify(uniqueData);
        const newSize = new Blob([compactedData]).size;
        
        localStorage.setItem(this.storageKeys.performance, compactedData);
        
        return {
          originalEntries: data.length,
          compactedEntries: uniqueData.length,
          spaceSaved: originalSize - newSize,
          compressionRatio: ((originalSize - newSize) / originalSize * 100).toFixed(1) + '%'
        };
      }

      return { spaceSaved: 0 };
    } catch (error) {
      console.warn('Failed to compact performance data:', error);
      return { spaceSaved: 0 };
    }
  }

  // Compact error reports keeping only unique and recent errors
  compactErrorReports() {
    try {
      const rawData = localStorage.getItem(this.storageKeys.errors);
      if (!rawData) return { spaceSaved: 0 };

      const data = JSON.parse(rawData);
      const originalSize = new Blob([rawData]).size;

      if (data.length > this.maxStorageSizes.errors) {
        // Group by error type and keep most recent of each type
        const errorGroups = data.reduce((groups, error) => {
          const key = `${error.error?.name || 'Unknown'}-${error.error?.message?.substring(0, 50) || 'NoMessage'}`;
          if (!groups[key] || new Date(error.timestamp) > new Date(groups[key].timestamp)) {
            groups[key] = error;
          }
          return groups;
        }, {});

        // Take most recent errors up to limit
        const compactedErrors = Object.values(errorGroups)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, this.maxStorageSizes.errors);

        const compactedData = JSON.stringify(compactedErrors);
        const newSize = new Blob([compactedData]).size;
        
        localStorage.setItem(this.storageKeys.errors, compactedData);
        
        return {
          originalEntries: data.length,
          compactedEntries: compactedErrors.length,
          spaceSaved: originalSize - newSize,
          compressionRatio: ((originalSize - newSize) / originalSize * 100).toFixed(1) + '%'
        };
      }

      return { spaceSaved: 0 };
    } catch (error) {
      console.warn('Failed to compact error reports:', error);
      return { spaceSaved: 0 };
    }
  }

  // Get storage usage report
  async getStorageReport() {
    const report = {
      localStorage: {},
      indexedDB: null,
      total: 0,
      breakdown: {}
    };

    // Analyze localStorage usage
    Object.keys(localStorage).forEach(key => {
      const data = localStorage.getItem(key);
      const size = new Blob([data || '']).size;
      report.localStorage[key] = {
        size: size,
        sizeFormatted: this.formatBytes(size),
        isPDFRelated: this.isPDFRelatedKey(key)
      };
      report.total += size;
    });

    // Analyze IndexedDB usage (if supported)
    if ('indexedDB' in window) {
      try {
        const dbSize = await this.getIndexedDBSize();
        report.indexedDB = {
          size: dbSize,
          sizeFormatted: this.formatBytes(dbSize),
          databases: ['PDFCache']
        };
        report.total += dbSize;
      } catch (error) {
        report.indexedDB = { error: error.message };
      }
    }

    // Breakdown by category
    const pdfKeys = Object.keys(report.localStorage).filter(key => 
      report.localStorage[key].isPDFRelated
    );
    
    report.breakdown = {
      pdfRelated: pdfKeys.reduce((sum, key) => sum + report.localStorage[key].size, 0),
      other: report.total - pdfKeys.reduce((sum, key) => sum + report.localStorage[key].size, 0) - (report.indexedDB?.size || 0),
      cache: report.indexedDB?.size || 0
    };

    report.totalFormatted = this.formatBytes(report.total);

    return report;
  }

  // Check if localStorage key is PDF-related
  isPDFRelatedKey(key) {
    const pdfKeyPatterns = [
      'pdf-',
      'react-pdf',
      'pdfjs',
      'contract',
      'signature',
      'viewer'
    ];
    
    return pdfKeyPatterns.some(pattern => 
      key.toLowerCase().includes(pattern)
    );
  }

  // Estimate IndexedDB size
  async getIndexedDBSize() {
    return new Promise((resolve) => {
      if (!('indexedDB' in window)) {
        resolve(0);
        return;
      }

      try {
        const request = indexedDB.open('PDFCache', 1);
        
        request.onsuccess = (event) => {
          const db = event.target.result;
          
          if (!db.objectStoreNames.contains('pdfs')) {
            resolve(0);
            return;
          }

          const transaction = db.transaction(['pdfs'], 'readonly');
          const store = transaction.objectStore('pdfs');
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            const items = getAllRequest.result;
            const totalSize = items.reduce((sum, item) => {
              return sum + (item.blob?.size || 0);
            }, 0);
            resolve(totalSize);
          };
          
          getAllRequest.onerror = () => resolve(0);
        };
        
        request.onerror = () => resolve(0);
      } catch (error) {
        resolve(0);
      }
    });
  }

  // Format bytes to human readable
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Optimize all PDF-related storage
  async optimizeStorage() {
    console.log('🚀 Starting comprehensive storage optimization...');
    
    const results = {
      cleanup: await this.cleanupLegacyStorage(),
      beforeReport: await this.getStorageReport(),
      afterReport: null,
      recommendations: []
    };

    // Clear excessive performance data if needed
    const perfData = JSON.parse(localStorage.getItem(this.storageKeys.performance) || '[]');
    if (perfData.length > this.maxStorageSizes.performance * 1.5) {
      results.recommendations.push(
        `Performance data có ${perfData.length} entries. Nên giảm xuống ${this.maxStorageSizes.performance}.`
      );
    }

    // Check cache usage
    if (results.beforeReport.indexedDB?.size > this.maxStorageSizes.cache) {
      results.recommendations.push(
        `IndexedDB cache size (${this.formatBytes(results.beforeReport.indexedDB.size)}) vượt giới hạn. Nên clear cache.`
      );
    }

    // Generate after report
    results.afterReport = await this.getStorageReport();
    
    const spaceSaved = results.beforeReport.total - results.afterReport.total;
    
    console.log('✅ Storage optimization completed!');
    console.log(`💾 Space saved: ${this.formatBytes(spaceSaved)}`);
    console.log(`📊 Final usage: ${results.afterReport.totalFormatted}`);
    
    return results;
  }

  // Emergency cleanup - clear all PDF storage
  async emergencyCleanup() {
    console.log('🚨 Emergency storage cleanup initiated...');
    
    const clearedItems = [];
    
    // Clear all PDF-related localStorage
    Object.keys(localStorage).forEach(key => {
      if (this.isPDFRelatedKey(key)) {
        const size = new Blob([localStorage.getItem(key) || '']).size;
        localStorage.removeItem(key);
        clearedItems.push({ key, size });
      }
    });

    // Clear IndexedDB
    try {
      const dbRequest = indexedDB.deleteDatabase('PDFCache');
      await new Promise((resolve) => {
        dbRequest.onsuccess = () => resolve();
        dbRequest.onerror = () => resolve();
      });
      clearedItems.push({ key: 'IndexedDB-PDFCache', size: 'Database cleared' });
    } catch (error) {
      console.warn('Failed to clear IndexedDB:', error);
    }

    const totalCleared = clearedItems.reduce((sum, item) => 
      sum + (typeof item.size === 'number' ? item.size : 0), 0
    );

    console.log('🧹 Emergency cleanup completed!');
    console.log(`🗑️ Cleared ${clearedItems.length} items`);
    console.log(`💾 Space freed: ${this.formatBytes(totalCleared)}`);
    
    return { clearedItems, totalCleared };
  }
}

// Export utilities
export const storageOptimizer = new PDFStorageOptimizer();

// Convenience methods
export const optimizeStorageNow = () => storageOptimizer.optimizeStorage();
export const getStorageReport = () => storageOptimizer.getStorageReport();
export const emergencyCleanup = () => storageOptimizer.emergencyCleanup();

export default PDFStorageOptimizer;