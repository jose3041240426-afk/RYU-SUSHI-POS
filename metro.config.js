const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('mjs');

// Mock for Node.js core modules that don't exist in React Native
const mockModulePath = path.resolve(__dirname, 'mock-stream.js');

config.resolver.extraNodeModules = {
  stream: mockModulePath,
  zlib: mockModulePath,
  crypto: mockModulePath,
  path: mockModulePath,
  fs: mockModulePath,
  http: mockModulePath,
  https: mockModulePath,
  net: mockModulePath,
  tls: mockModulePath,
  os: mockModulePath,
  child_process: mockModulePath,
  events: mockModulePath,
};

// Force Metro to use the browser version of ws and other Node.js packages
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Redirect 'ws' to our mock that uses React Native's built-in WebSocket
  if (moduleName === 'ws') {
    return {
      filePath: path.resolve(__dirname, 'mock-ws.js'),
      type: 'sourceFile',
    };
  }

  // For all other modules, use the default resolver
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
