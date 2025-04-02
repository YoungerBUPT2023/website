const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');

const app = express();
app.use(cors());

// 添加详细的请求日志
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

// 首先获取认证信息
async function getAuthCookies() {
    try {
        const response = await axios.get('https://www.coze.cn', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        });
        return response.headers['set-cookie'] || [];
    } catch (error) {
        console.error('获取认证信息失败:', error);
        return [];
    }
}

let authCookies = [];
// 定期更新认证信息
async function updateAuthCookies() {
    authCookies = await getAuthCookies();
    console.log('已更新认证信息');
}
updateAuthCookies();
setInterval(updateAuthCookies, 1000 * 60 * 30); // 每30分钟更新一次

// 配置代理
app.use('/api', createProxyMiddleware({
    target: 'https://api.coze.cn',
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '^/api': ''
    },
    onProxyReq: (proxyReq, req, res) => {
        // 添加必要的请求头
        proxyReq.setHeader('Accept', 'application/json');
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
        proxyReq.setHeader('Origin', 'https://www.coze.cn');
        proxyReq.setHeader('Referer', 'https://www.coze.cn/');
        
        // 添加认证cookie
        if (authCookies.length > 0) {
            proxyReq.setHeader('Cookie', authCookies.join('; '));
        }

        console.log('代理请求头:', proxyReq.getHeaders());
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log('响应状态码:', proxyRes.statusCode);
        console.log('响应头:', proxyRes.headers);
    },
    onError: (err, req, res) => {
        console.error('代理错误:', err);
        res.status(500).json({
            error: true,
            message: '代理服务器错误',
            details: err.message
        });
    }
}));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`代理服务器运行在 http://localhost:${PORT}`);
}); 