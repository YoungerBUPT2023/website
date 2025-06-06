import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';
import ContactModal from './ContactModal';

function Navbar() {
  const navigate = useNavigate();
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
          <span className="normal-text">太空教育试验平台</span>
        </Link>
        <div className="navbar-menu">
          <Link to="/lab" className="navbar-item">实验设计评估</Link>
          <Link to="/vr-lab" className="navbar-item">实验流程监控</Link>
          <Link to="/gallery" className="navbar-item">作品展</Link>
          <Link to="/space-view" className="navbar-item">代码生成</Link>
        </div>
        <div className="navbar-end">
          <a href="#" 
             className="contact-link" 
             onClick={(e) => {
               e.preventDefault();
               setShowContactModal(true);
             }}>
            想做更多实验？联系我们
          </a>
          {isLoggedIn ? (
            <div className="user-info">
              <span className="username-link" onClick={handleProfileClick}>
                欢迎，{username}
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