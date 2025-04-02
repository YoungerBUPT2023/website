import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  
  // 退出登录功能
  const handleLogout = () => {
    // 清除登录状态
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    
    // 触发一个storage事件，让其他组件（如Navbar）知道登录状态已更改
    window.dispatchEvent(new Event('storage'));
    
    // 跳转到首页
    navigate('/', { replace: true });
    
    // 强制刷新页面以确保所有组件都更新为未登录状态
    window.location.reload();
  };

  // 编辑资料功能
  const handleEditProfile = () => {
    // 关闭设置菜单
    setShowSettings(false);
    // 这里可以添加编辑资料的逻辑
    console.log('编辑资料');
  };
  
  // 切换设置菜单的显示状态
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  // 使用内联样式，避免任何CSS冲突
  const containerStyle = {
    paddingTop: '100px',
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #FF0000, #FF6B6B)',
    color: 'white',
    textAlign: 'center',
    position: 'relative',
    zIndex: 9999, // 确保显示在最顶层
    paddingBottom: '80px' // 为底部按钮留出空间
  };
  
  const headerStyle = {
    fontSize: '3rem',
    marginBottom: '20px',
    textShadow: '2px 2px 4px #000'
  };
  
  const contentStyle = {
    background: 'rgba(0,0,0,0.5)',
    padding: '30px',
    borderRadius: '15px',
    maxWidth: '800px',
    margin: '0 auto',
    boxShadow: '0 0 20px rgba(0,0,0,0.5)'
  };
  
  const avatarStyle = {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'yellow',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 20px',
    fontSize: '4rem',
    color: 'black',
    border: '5px solid white'
  };

  const buttonStyle = {
    padding: '12px 25px',
    borderRadius: '30px',
    fontWeight: 'bold',
    boxShadow: '0 0 15px rgba(0,0,0,0.5)',
    cursor: 'pointer',
    border: 'none',
    fontSize: '16px'
  };

  const settingsButtonStyle = {
    ...buttonStyle,
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: 'white',
    color: 'red',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    fontSize: '24px',
  };

  const settingsMenuStyle = {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 0 15px rgba(0,0,0,0.5)',
    overflow: 'hidden',
    display: showSettings ? 'block' : 'none',
    zIndex: 10000,
  };

  const menuItemStyle = {
    padding: '12px 20px',
    display: 'block',
    width: '100%',
    textAlign: 'left',
    border: 'none',
    borderBottom: '1px solid #eee',
    background: 'white',
    color: '#333',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  };

  const logoutItemStyle = {
    ...menuItemStyle,
    color: '#e74c3c',
    borderBottom: 'none',
  };

  return (
    // 不使用任何外部CSS类
    <div style={containerStyle}>
      <h1 style={headerStyle}>这是个人主页</h1>
      
      <div style={contentStyle}>
        <div style={avatarStyle}>
          {username ? username.charAt(0).toUpperCase() : '?'}
        </div>
        
        <h2 style={{fontSize: '2.5rem', marginBottom: '20px'}}>
          用户: {username || '未知用户'}
        </h2>
        
        <p style={{fontSize: '1.5rem', marginBottom: '30px'}}>
          这是一个测试页面，使用内联样式创建，避免任何CSS冲突
        </p>
        
        <div style={{
          padding: '20px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3 style={{marginBottom: '15px'}}>个人简介</h3>
          <p>这里是用户的个人简介，可以放置一些个人信息和兴趣爱好。</p>
        </div>
        
        <div style={{
          padding: '20px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '10px'
        }}>
          <h3 style={{marginBottom: '15px'}}>我的实验</h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            textAlign: 'left'
          }}>
            <li style={{
              padding: '10px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '5px',
              marginBottom: '10px'
            }}>水溶液平衡实验</li>
            <li style={{
              padding: '10px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '5px',
              marginBottom: '10px'
            }}>光合作用分析</li>
            <li style={{
              padding: '10px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '5px'
            }}>电池材料研究</li>
          </ul>
        </div>
      </div>
      
      {/* 设置按钮 */}
      <button 
        style={settingsButtonStyle} 
        onClick={toggleSettings}
        title="设置"
      >
        ⚙️
      </button>

      {/* 设置菜单 */}
      <div style={settingsMenuStyle}>
        <button 
          style={menuItemStyle} 
          onClick={handleEditProfile}
          onMouseOver={(e) => e.target.style.background = '#f5f5f5'}
          onMouseOut={(e) => e.target.style.background = 'white'}
        >
          编辑资料
        </button>
        <button 
          style={logoutItemStyle} 
          onClick={handleLogout}
          onMouseOver={(e) => e.target.style.background = '#f5f5f5'}
          onMouseOut={(e) => e.target.style.background = 'white'}
        >
          退出登录
        </button>
      </div>
    </div>
  );
};

export default UserProfile; 