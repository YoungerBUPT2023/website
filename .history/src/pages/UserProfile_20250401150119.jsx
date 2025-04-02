import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = localStorage.getItem('username');
  
  // 获取用户上传的作品
  useEffect(() => {
    const fetchUserProjects = async () => {
      setIsLoading(true);
      try {
        // 从localStorage获取所有项目数据
        const allProjects = JSON.parse(localStorage.getItem('globalProjects')) || [];
        
        // 筛选出当前用户的项目
        const filteredProjects = allProjects.filter(project => project.author === username);
        
        setUserProjects(filteredProjects);
        setError(null);
      } catch (err) {
        console.error('获取用户作品失败:', err);
        setError('获取作品数据时出错，请稍后再试');
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUserProjects();
    }
  }, [username]);
  
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

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {username ? username.charAt(0).toUpperCase() : '?'}
        </div>
        
        <h2 className="profile-username">
          {username || '未知用户'}
          {username === currentUser && <span className="current-user-badge">（当前用户）</span>}
        </h2>
        
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">{userProjects.length}</span>
            <span className="stat-label">作品</span>
          </div>
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-section">
          <h3 className="section-title">个人简介</h3>
          <p className="profile-bio">这里是用户的个人简介，可以放置一些个人信息和兴趣爱好。</p>
        </div>
        
        <div className="profile-section">
          <h3 className="section-title">我的作品</h3>
          
          {isLoading ? (
            <div className="loading-state">加载中...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : userProjects.length === 0 ? (
            <div className="empty-state">
              <p>暂无作品</p>
              {username === currentUser && (
                <Link to="/gallery" className="upload-button">
                  去上传作品
                </Link>
              )}
            </div>
          ) : (
            <div className="user-projects-grid">
              {userProjects.map(project => (
                <div className="project-card" key={project.id} onClick={() => navigate(`/project/${project.id}`)}>
                  <div className="project-image">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=图片加载失败';
                      }}
                    />
                  </div>
                  <div className="project-content">
                    <h4 className="project-title">{project.title}</h4>
                    <p className="project-description">{project.description}</p>
                    <div className="project-meta">
                      <span className="project-date">{project.date}</span>
                      <div className="project-stats">
                        <span className="likes-count">❤ {project.likes}</span>
                        <span className="comments-count">💬 {(project.comments || []).length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {username === currentUser && (
        <>
          <button 
            className="settings-button"
            onClick={toggleSettings}
            title="设置"
          >
            ⚙️
          </button>

          <div className={`settings-menu ${showSettings ? 'show' : ''}`}>
            <button className="menu-item" onClick={handleEditProfile}>
              编辑资料
            </button>
            <button className="menu-item logout-item" onClick={handleLogout}>
              退出登录
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile; 