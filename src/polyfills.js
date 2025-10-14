// Polyfills for Node.js globals in browser environment
// Fix "require is not defined" error

// Polyfill for require function (basic implementation)
if (typeof global === 'undefined') {
  var global = globalThis;
}

if (typeof require === 'undefined') {
  window.require = function(moduleId) {
    console.warn(`require('${moduleId}') called in browser. This is likely a bundling issue.`);
    // Return empty object for most cases to prevent crashes
    return {};
  };
}

// Process polyfill - Must be defined BEFORE any imports
window.process = window.process || {
  env: {
    NODE_ENV: import.meta.env?.MODE || 'development',
    ...import.meta.env
  },
  version: '16.0.0',
  versions: {
    node: '16.0.0'
  },
  platform: 'browser',
  nextTick: function(callback) {
    setTimeout(callback, 0);
  },
  cwd: function() {
    return '/';
  },
  argv: [],
  exit: function() {},
  stdout: {
    write: function() {}
  },
  stderr: {
    write: function() {}
  }
};

// Also define as global
globalThis.process = window.process;

// Buffer polyfill (basic)
if (typeof Buffer === 'undefined') {
  window.Buffer = {
    from: function(str) {
      return new TextEncoder().encode(str);
    },
    isBuffer: function() {
      return false;
    }
  };
}

export default {};