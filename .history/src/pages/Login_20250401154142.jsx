import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

// 配置axios默认设置
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      console.log('尝试登录...');
      const response = await axios.post('/api/login', {
        username,
        password
      });
      
      console.log('登录响应:', response.data);
      
      // 处理新的响应格式
      if (response.data) {
        // 存储用户信息
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', response.data.username);
        
        // 存储完整的用户数据以便其他组件使用
        const userData = {
          username: response.data.username,
          token: response.data.token,
          isAdmin: response.data.isAdmin
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // 触发存储事件，通知其他组件登录状态已更改
        window.dispatchEvent(new Event('storage'));
        
        // 导航到实验页面
        navigate('/experiment');
      }
    } catch (error) {
      console.error('登录错误:', error);
      if (error.response) {
        // 服务器返回了错误响应
        setError(error.response.data?.message || '登录失败，请检查用户名和密码');
        console.log('服务器错误响应:', error.response.data);
      } else if (error.request) {
        // 请求发送成功，但没有收到响应
        setError('无法连接到服务器，请检查服务器是否已启动');
        console.log('无响应:', error.request);
      } else {
        // 设置请求时发生了错误
        setError('发送请求时出错: ' + error.message);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>地空实验平台</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
            />
          </div>
          <div className="input-group">
            <label>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">
            登录
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login; 