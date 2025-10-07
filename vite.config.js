import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for large dependencies
          'antd': ['antd', '@ant-design/icons', '@ant-design/pro-components', '@ant-design/charts'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'utils': ['axios'],
          'pdf': ['react-pdf', 'pdfjs-dist']
        }
      }
    },
    chunkSizeWarningLimit: 100000, // Increase warning limit to 1000kB
  },
  server: {
    proxy: {
      '/api/provinces': {
        target: 'https://provinces.open-api.vn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/provinces/, '/api/v2'),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Dev-only proxy to display remote PDF inline without CORS/X-Frame issues
      '/pdf-proxy': {
        target: 'https://econtract-premium-api.vnpt.vn',
        changeOrigin: true,
        secure: true,
        // Map /pdf-proxy?token=... -> /Api/Download?token=...
        rewrite: (path) => path.replace(/^\/pdf-proxy/, '/Api/Download'),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Remove/override headers that block embedding
            if (proxyRes.headers) {
              delete proxyRes.headers['x-frame-options'];
              delete proxyRes.headers['x-frame-options'.toLowerCase()];
              delete proxyRes.headers['content-security-policy'];
              delete proxyRes.headers['content-security-policy'.toLowerCase()];
              // Force inline display
              if (proxyRes.headers['content-disposition']) {
                proxyRes.headers['content-disposition'] = 'inline';
              }
              // Allow cross-origin when needed (mostly harmless for embedding)
              res.setHeader('Access-Control-Allow-Origin', '*');
            }
          });
        },
      }
    }
  }
})
