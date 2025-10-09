// Phase 5: Intelligent PDF Caching Service
class PDFCacheService {
  constructor() {
    this.cache = new Map();
    this.cacheMetadata = new Map();
    this.maxCacheSize = 50 * 1024 * 1024; // 50MB cache limit
    this.maxAge = 30 * 60 * 1000; // 30 minutes cache TTL
    this.preloadQueue = new Set();
    
    // Initialize from localStorage if available
    this.loadCacheFromStorage();
    
    // Setup cleanup interval
    this.setupCleanupInterval();
  }

  // Phase 5: Smart caching với size management
  async cachePDF(key, pdfBlob, metadata = {}) {
    try {
      const size = pdfBlob.size || 0;
      const now = Date.now();
      
      // Check if we need to free up space
      if (this.getCurrentCacheSize() + size > this.maxCacheSize) {
        await this.evictLeastRecentlyUsed(size);
      }
      
      // Create cache entry
      const cacheEntry = {
        blob: pdfBlob,
        timestamp: now,
        lastAccessed: now,
        size: size,
        hits: 0,
        metadata: {
          contractNo: metadata.contractNo,
          version: metadata.version || 1,
          source: metadata.source || 'api',
          ...metadata
        }
      };
      
      this.cache.set(key, cacheEntry);
      this.cacheMetadata.set(key, {
        size,
        timestamp: now,
        lastAccessed: now
      });
      
      // Persist to IndexedDB for longer storage
      this.persistToIndexedDB(key, cacheEntry);
      
      console.log(`🗃️ PDF cached: ${key} (${this.formatSize(size)})`);
      
      return true;
    } catch (error) {
      console.error('Error caching PDF:', error);
      return false;
    }
  }

  // Phase 5: Intelligent cache retrieval với hit tracking
  async getCachedPDF(key) {
    try {
      let cacheEntry = this.cache.get(key);
      
      // Try IndexedDB if not in memory
      if (!cacheEntry) {
        cacheEntry = await this.getFromIndexedDB(key);
        if (cacheEntry) {
          // Restore to memory cache
          this.cache.set(key, cacheEntry);
        }
      }
      
      if (cacheEntry) {
        // Check if expired
        if (Date.now() - cacheEntry.timestamp > this.maxAge) {
          this.cache.delete(key);
          this.cacheMetadata.delete(key);
          this.deleteFromIndexedDB(key);
          return null;
        }
        
        // Update access metrics
        cacheEntry.lastAccessed = Date.now();
        cacheEntry.hits++;
        
        console.log(`🎯 Cache hit: ${key} (${cacheEntry.hits} hits)`);
        
        return cacheEntry.blob;
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving cached PDF:', error);
      return null;
    }
  }

  // Phase 5: Prefetching mechanism
  async prefetchPDF(contractNo, pdfUrl, priority = 'low') {
    if (this.preloadQueue.has(contractNo)) {
      return; // Already in queue
    }
    
    this.preloadQueue.add(contractNo);
    
    try {
      // Check if already cached
      if (await this.getCachedPDF(contractNo)) {
        this.preloadQueue.delete(contractNo);
        return;
      }
      
      console.log(`🔄 Prefetching PDF: ${contractNo} (priority: ${priority})`);
      
      // Fetch PDF with appropriate priority
      const response = await fetch(pdfUrl, {
        priority: priority,
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        await this.cachePDF(contractNo, blob, {
          contractNo,
          source: 'prefetch',
          priority
        });
      }
      
    } catch (error) {
      console.warn(`Failed to prefetch PDF ${contractNo}:`, error);
    } finally {
      this.preloadQueue.delete(contractNo);
    }
  }

  // Phase 5: LRU eviction strategy
  async evictLeastRecentlyUsed(requiredSpace) {
    const entries = Array.from(this.cacheMetadata.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    let freedSpace = 0;
    
    for (const [key, metadata] of entries) {
      if (freedSpace >= requiredSpace) break;
      
      this.cache.delete(key);
      this.cacheMetadata.delete(key);
      this.deleteFromIndexedDB(key);
      
      freedSpace += metadata.size;
      
      console.log(`🗑️ Evicted from cache: ${key} (${this.formatSize(metadata.size)})`);
    }
    
    return freedSpace;
  }

  // Phase 5: Cache analytics
  getCacheStats() {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    
    return {
      totalEntries: entries.length,
      totalSize: totalSize,
      totalHits: totalHits,
      hitRate: entries.length > 0 ? totalHits / entries.length : 0,
      memoryUsage: this.formatSize(totalSize),
      maxSize: this.formatSize(this.maxCacheSize),
      utilizationPercent: (totalSize / this.maxCacheSize) * 100
    };
  }

  // Phase 5: IndexedDB persistence for offline support
  async persistToIndexedDB(key, cacheEntry) {
    try {
      const dbRequest = indexedDB.open('PDFCache', 2);
      
      dbRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('pdfs')) {
          db.createObjectStore('pdfs', { keyPath: 'id' });
        }
      };
      
      dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['pdfs'], 'readwrite');
        const store = transaction.objectStore('pdfs');
        
        store.put({
          id: key,
          ...cacheEntry,
          blob: cacheEntry.blob // IndexedDB can store blobs natively
        });
      };
      
    } catch (error) {
      console.warn('IndexedDB persistence failed:', error);
    }
  }

  async getFromIndexedDB(key) {
    return new Promise((resolve) => {
      try {
        const dbRequest = indexedDB.open('PDFCache', 1);
        
        dbRequest.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(['pdfs'], 'readonly');
          const store = transaction.objectStore('pdfs');
          const request = store.get(key);
          
          request.onsuccess = () => {
            resolve(request.result || null);
          };
          
          request.onerror = () => {
            resolve(null);
          };
        };
        
        dbRequest.onerror = () => {
          resolve(null);
        };
        
      } catch (error) {
        console.warn('IndexedDB retrieval failed:', error);
        resolve(null);
      }
    });
  }

  async deleteFromIndexedDB(key) {
    try {
      const dbRequest = indexedDB.open('PDFCache', 1);
      
      dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['pdfs'], 'readwrite');
        const store = transaction.objectStore('pdfs');
        store.delete(key);
      };
      
    } catch (error) {
      console.warn('IndexedDB deletion failed:', error);
    }
  }

  // Utility methods
  getCurrentCacheSize() {
    return Array.from(this.cacheMetadata.values())
      .reduce((sum, metadata) => sum + metadata.size, 0);
  }

  formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  loadCacheFromStorage() {
    // Load metadata from localStorage for quick access
    try {
      const storedMetadata = localStorage.getItem('pdf-cache-metadata');
      if (storedMetadata) {
        const metadata = JSON.parse(storedMetadata);
        for (const [key, data] of Object.entries(metadata)) {
          this.cacheMetadata.set(key, data);
        }
      }
    } catch (error) {
      console.warn('Failed to load cache metadata:', error);
    }
  }

  setupCleanupInterval() {
    // Cleanup expired entries every 10 minutes
    setInterval(() => {
      this.cleanupExpiredEntries();
      this.saveCacheMetadata();
    }, 10 * 60 * 1000);
  }

  cleanupExpiredEntries() {
    const now = Date.now();
    const expiredKeys = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.cacheMetadata.delete(key);
      this.deleteFromIndexedDB(key);
    });
    
    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  saveCacheMetadata() {
    try {
      const metadata = Object.fromEntries(this.cacheMetadata.entries());
      localStorage.setItem('pdf-cache-metadata', JSON.stringify(metadata));
    } catch (error) {
      console.warn('Failed to save cache metadata:', error);
    }
  }

  // Public API for manual cache management
  clearCache() {
    this.cache.clear();
    this.cacheMetadata.clear();
    localStorage.removeItem('pdf-cache-metadata');
    
    // Clear IndexedDB
    try {
      const dbRequest = indexedDB.deleteDatabase('PDFCache');
      dbRequest.onsuccess = () => {
        console.log('🗑️ PDF cache cleared completely');
      };
    } catch (error) {
      console.warn('Failed to clear IndexedDB:', error);
    }
  }
}

// Singleton instance
export const pdfCacheService = new PDFCacheService();

export default PDFCacheService;