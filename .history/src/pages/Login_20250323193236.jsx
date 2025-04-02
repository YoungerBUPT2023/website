import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post('http://localhost:3001/api/login', {
        username,
        password
      });
      
      if (response.data.success) {
        // 登录成功，保存用户信息到localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', response.data.username);
        
        // 保存完整用户数据对象
        const userData = {
          username: response.data.username,
          token: response.data.token || '', // 可能没有token
          isAdmin: response.data.isAdmin || false
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // 触发storage事件，通知其他组件登录状态已更改
        window.dispatchEvent(new Event('storage'));
        
        // 跳转到实验页面
        navigate('/experiment');
      }
    } catch (error) {
      setError(error.response?.data?.message || '登录失败，请重试');
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