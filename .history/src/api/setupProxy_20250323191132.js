/**
 * 开发环境代理设置
 * 用于解决跨域问题和API转发
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 代理B站API请求
  app.use(
    '/api/bilibili',
    createProxyMiddleware({
      target: 'http://localhost:3001', // 指向你的API服务器
      changeOrigin: true,
      pathRewrite: {
        '^/api/bilibili': '/api/bilibili', // 路径重写，保持一致
      },
      onProxyReq: (proxyReq, req, res) => {
        // 打印代理请求日志
        console.log(`[Proxy] ${req.method} ${req.url} => ${proxyReq.path}`);
      },
    })
  );
  
  // 直接代理到B站官方API (备用方案)
  app.use(
    '/bilibili-api',
    createProxyMiddleware({
      target: 'https://api.bilibili.com',
      changeOrigin: true,
      pathRewrite: {
        '^/bilibili-api': '', // 去掉前缀
      },
      onProxyReq: (proxyReq, req, res) => {
        // 设置请求头
        proxyReq.setHeader('Referer', 'https://space.bilibili.com');
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        // 打印代理请求日志
        console.log(`[直接代理B站API] ${req.method} ${req.url} => ${proxyReq.path}`);
      },
    })
  );
}; 