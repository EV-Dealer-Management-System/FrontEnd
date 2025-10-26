// Define process IMMEDIATELY to prevent env.mjs errors
window.process = window.process || {
  env: import.meta.env || {},
  platform: 'browser',
  version: '16.0.0'
};
globalThis.process = window.process;

// Import polyfills first to fix require/global issues  
import './polyfills.js'

import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntdApp } from 'antd'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AntdApp>
      <App />
    </AntdApp>
  </StrictMode>,
)
