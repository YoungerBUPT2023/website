import React, { useState } from 'react';
import './AuthModal.css';

function AuthModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // 切换标签页
  const switchTab = (tab) => {
    setActiveTab(tab);
    setMessage({ text: '', type: '' });
    // 清空输入框
    setUsername('');
    setPassword('');
  };

  // 获取所有已注册用户
  const getRegisteredUsers = () => {
    const usersJson = localStorage.getItem('registeredUsers');
    return usersJson ? JSON.parse(usersJson) : [];
  };

  // 保存注册用户
  const saveUser = (newUser) => {
    const users = getRegisteredUsers();
    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
  };

  // 检查用户名是否已存在
  const isUsernameTaken = (username) => {
    const users = getRegisteredUsers();
    return users.some(user => user.username === username);
  };

  // 验证用户登录
  const validateUser = (username, password) => {
    // 首先检查硬编码的管理员账户
    if (username === 'younger' && password === 'ILoveSun') {
      return true;
    }

    // 然后检查注册的用户
    const users = getRegisteredUsers();
    return users.some(user => user.username === username && user.password === password);
  };

  // 处理登录
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '登录失败');
      }

      // 保存登录状态和token
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', username.trim());
      localStorage.setItem('token', data.token); // 保存token
      
      // 保存用户数据
      const userData = {
        username: username.trim(),
        // 其他用户数据...
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setMessage({ text: '登录成功', type: 'success' });
      
      // 延迟关闭模态框
      setTimeout(() => {
        onClose();
        window.location.reload(); // 刷新页面以更新状态
      }, 1000);
    } catch (error) {
      console.error('登录错误:', error);
      setMessage({ text: error.message || '登录失败', type: 'error' });
    }
  };

  // 处理注册
  const handleRegister = async (e) => {
    e.preventDefault();
    
    try {
      // 验证输入
      if (!username || !password) {
        setMessage({ text: '用户名和密码不能为空', type: 'error' });
        return;
      }
      
      if (username.length > 8) {
        setMessage({ text: '用户名不能超过8个字符', type: 'error' });
        return;
      }
      
      if (password.length > 12) {
        setMessage({ text: '密码不能超过12个字符', type: 'error' });
        return;
      }

      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '注册失败');
      }
      
      setMessage({ text: '注册成功', type: 'success' });
      
      // 注册成功后切换到登录页面
      setTimeout(() => {
        switchTab('login');
      }, 1500);
    } catch (error) {
      console.error('注册错误:', error);
      setMessage({ text: error.message || '注册失败', type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-content">
        <button className="auth-modal-close-button" onClick={onClose}>&times;</button>
        
        <div className="auth-modal-tabs">
          <div 
            className={`auth-modal-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >
            登录
          </div>
          <div 
            className={`auth-modal-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => switchTab('register')}
          >
            注册
          </div>
        </div>
        
        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} >
            <h2 className="auth-modal-title">用户登录</h2>
            <div className="auth-modal-form-group">
              <label htmlFor="login-username" className="auth-modal-label">用户名</label>
              <input 
                type="text" 
                id="login-username" 
                className="auth-modal-input" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名" 
                maxLength="8" 
                required 
              />
            </div>
            <div className="auth-modal-form-group">
              <label htmlFor="login-password" className="auth-modal-label">密码</label>
              <input 
                type="password" 
                id="login-password" 
                className="auth-modal-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码" 
                maxLength="12" 
                required 
              />
            </div>
            <div className="auth-modal-form-group">
              <button type="submit" className="auth-modal-button">登录</button>
            </div>
            {message.text && message.type === 'error' && (
              <div className="auth-modal-error">
                {message.text}
              </div>
            )}
            {message.text && message.type === 'success' && (
               <div style={{color: '#68D391', textAlign: 'center', marginTop: '10px'}}>
                 {message.text}
               </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleRegister} >
            <h2 className="auth-modal-title">用户注册</h2>
            <div className="auth-modal-form-group">
              <label htmlFor="register-username" className="auth-modal-label">用户名</label>
              <input 
                type="text" 
                id="register-username" 
                className="auth-modal-input" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名(最多8个字符)" 
                maxLength="8" 
                required 
              />
            </div>
            <div className="auth-modal-form-group">
              <label htmlFor="register-password" className="auth-modal-label">密码</label>
              <input 
                type="password" 
                id="register-password" 
                className="auth-modal-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码(最多12个字符)" 
                maxLength="12" 
                required 
              />
            </div>
            <div className="auth-modal-form-group">
              <button type="submit" className="auth-modal-button">注册</button>
            </div>
            {message.text && message.type === 'error' && (
              <div className="auth-modal-error">
                {message.text}
              </div>
            )}
            {message.text && message.type === 'success' && (
               <div style={{color: '#68D391', textAlign: 'center', marginTop: '10px'}}> 
                 {message.text}
               </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal; 