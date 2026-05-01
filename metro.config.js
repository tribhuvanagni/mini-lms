const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// webview needs .html assets
config.resolver.assetExts.push('html');

module.exports = withNativeWind(config, { input: './global.css' });
