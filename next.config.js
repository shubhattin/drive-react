/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});
const langList = Object.keys(require('./src/langs/locales.json'));
const nextConfig = withBundleAnalyzer({
  reactStrictMode: true,
  i18n: {
    locales: langList,
    defaultLocale: 'sa'
  },
  swcMinify: true
});
module.exports = {};
module.exports = nextConfig;
