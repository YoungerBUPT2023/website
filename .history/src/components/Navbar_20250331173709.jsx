import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';
import ContactModal from './ContactModal';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  // 监听 localStorage 变化
  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
      setUsername(localStorage.getItem('username') || '');
    };
    
    // 检查当前状态
    checkLoginStatus();
    
    // 创建事件监听器
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleLoginClick = () => {
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    navigate('/');
  };

  const handleProfileClick = () => {
    console.log('点击用户名，显示个人主页模态框', username);
    setShowProfileModal(true);
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <span className="calligraphy-text">问天</span>
          <span 
            style={{
              background: 'linear-gradient(90deg, #00c6ff 0%, #7c4dff 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              fontWeight: 'bold',
              textShadow: '0 0 4px rgba(124, 77, 255, 0.5)',
              fontFamily: "'Orbitron', sans-serif",
              border: '1px solid rgba(124, 77, 255, 0.3)',
              borderRadius: '4px',
              padding: '0 4px',
              marginRight: '4px',
              marginLeft: '8px',
              fontSize: '0.8rem',
            }}
          >
            AI驱动
          </span>
          <span className="normal-text">太空科学试验平台</span>
        </Link>
        <div className="navbar-menu">
          <Link to="/lab" className="navbar-item">实验设计</Link>
          <Link to="/vr-lab" className="navbar-item">流程监控</Link>
          <Link to="/gallery" className="navbar-item">交流社区</Link>
          <Link to="/space-view" className="navbar-item">代码生成</Link>
        </div>
        <div className="navbar-end">
          <a href="#" 
             className="contact-link" 
             onClick={(e) => {
               e.preventDefault();
               setShowContactModal(true);
             }}>
            <span style={{ 
              fontFamily: "'Orbitron', sans-serif", 
              color: '#4fc3f7', 
              fontWeight: '500',
              textShadow: '0 0 4px rgba(79, 195, 247, 0.4)',
              letterSpacing: '0.05em',
              background: 'linear-gradient(90deg, #4fc3f7, #039be5)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              transition: 'all 0.3s ease'
            }}>
              太空实验申请
            </span>
          </a>
          {isLoggedIn ? (
            <div className="user-info">
              <span className="username-link" onClick={handleProfileClick}>
                {username}
              </span>
              <div className="navbar-avatar" onClick={handleProfileClick}>
                {(() => {
                  try {
                    const userData = localStorage.getItem(`user_${username}`);
                    const parsedData = userData ? JSON.parse(userData) : null;
                    return parsedData?.avatar ? (
                      <img src={parsedData.avatar} alt={username} />
                    ) : (
                      <div className="default-avatar">
                        {username.charAt(0).toUpperCase()}
                      </div>
                    );
                  } catch (error) {
                    console.error('获取头像失败:', error);
                    return (
                      <div className="default-avatar">
                        {username.charAt(0).toUpperCase()}
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          ) : (
            <button onClick={handleLoginClick} className="login-button-highlight">
              登录
            </button>
          )}
        </div>
      </nav>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        username={username}
      />

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </>
  );
}

export default Navbar; 