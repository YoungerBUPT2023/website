import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfileModal = ({ username, email, bio, onClose }) => {
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
    
    // 关闭模态框
    onClose();
    
    // 跳转到首页
    navigate('/', { replace: true });
    
    // 强制刷新页面以确保所有组件都更新为未登录状态
    window.location.reload();
  };

  // 编辑资料功能
  const handleEditProfile = () => {
    // 关闭设置菜单
    setShowSettings(false);
    // 跳转到编辑资料页面
    navigate(`/profile/${username}/edit`);
  };
  
  // 切换设置菜单的显示状态
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        position: 'relative',
        width: '90%',
        maxWidth: '800px',
        backgroundColor: '#111',
        borderRadius: '10px',
        padding: '20px',
        color: 'white',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
      }}>
        {/* 关闭按钮 */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
        
        {/* 用户头像 */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: '#8a2be2',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0 auto 20px',
          fontSize: '60px',
          color: 'white'
        }}>
          {username ? username.charAt(0).toUpperCase() : 'P'}
        </div>
        
        {/* 用户名 */}
        <h2 style={{
          color: '#00ffff',
          fontSize: '2.5rem',
          textAlign: 'center',
          margin: '10px 0'
        }}>
          {username || 'pingwei'}
        </h2>
        
        {/* 用户简介 */}
        <p style={{
          color: '#00ffff',
          fontSize: '1.2rem',
          textAlign: 'center',
          margin: '10px 0 20px'
        }}>
          {bio || '探索科学的奥秘'}
        </p>
        
        {/* 用户邮箱 */}
        <p style={{
          color: '#aaa',
          fontSize: '1rem',
          textAlign: 'center',
          margin: '0 0 30px'
        }}>
          {email || 'your.email@example.com'}
        </p>
        
        {/* 内容区域 */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          marginTop: '20px'
        }}>
          {/* 个人简介部分 */}
          <div style={{
            flex: '1 1 300px',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            padding: '15px',
            borderLeft: '2px solid #00ffff'
          }}>
            <h3 style={{
              color: '#00ffff',
              borderBottom: '1px solid #333',
              paddingBottom: '10px',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ width: '4px', height: '20px', backgroundColor: '#00ffff', marginRight: '10px' }}></span>
              个人简介
            </h3>
            <p style={{ color: '#ddd', lineHeight: '1.6' }}>
              这里是我的个人简介，点击编辑按钮可以修改这段文字，介绍一下自己吧！
            </p>
          </div>
          
          {/* 我的实验部分 */}
          <div style={{
            flex: '1 1 300px',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            padding: '15px',
            borderLeft: '2px solid #ff1493'
          }}>
            <h3 style={{
              color: '#ff1493',
              borderBottom: '1px solid #333',
              paddingBottom: '10px',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ width: '4px', height: '20px', backgroundColor: '#ff1493', marginRight: '10px' }}></span>
              我的实验
            </h3>
            <ul style={{ padding: '0 0 0 10px', margin: 0 }}>
              <li style={{ 
                color: '#ddd', 
                marginBottom: '10px',
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 20, 147, 0.1)',
                borderRadius: '4px'
              }}>
                水溶液平衡实验
              </li>
              <li style={{ 
                color: '#ddd', 
                marginBottom: '10px',
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 20, 147, 0.1)',
                borderRadius: '4px'
              }}>
                光合作用分析
              </li>
              <li style={{ 
                color: '#ddd',
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 20, 147, 0.1)',
                borderRadius: '4px'
              }}>
                电池材料研究
              </li>
            </ul>
          </div>
        </div>
        
        {/* 底部按钮区域 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '30px'
        }}>
          {/* 设置按钮 */}
          <button 
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#00ffff',
              fontSize: '24px',
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative'
            }} 
            onClick={toggleSettings}
            title="设置"
          >
            ⚙️
          </button>
          
          {/* 设置菜单 */}
          {showSettings && (
            <div style={{
              position: 'absolute',
              bottom: '70px',
              backgroundColor: '#222',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
              zIndex: 1001
            }}>
              <button 
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 20px',
                  textAlign: 'left',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #333',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
                onClick={handleEditProfile}
                onMouseOver={(e) => e.target.style.backgroundColor = '#333'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                编辑资料
              </button>
              <button 
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 20px',
                  textAlign: 'left',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#ff4d4d',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
                onClick={handleLogout}
                onMouseOver={(e) => e.target.style.backgroundColor = '#333'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal; 