import React, { useState, useEffect, useRef } from 'react';
import './ProfileModal.css';
import { FaCamera, FaEdit, FaTrash, FaPlus, FaHistory, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProfileModal = ({ isOpen, onClose, username }) => {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [signature, setSignature] = useState('探索科学的奥秘');
  const [email, setEmail] = useState('your.email@example.com');
  const [bio, setBio] = useState('这里是我的个人简介，点击编辑按钮可以修改这段文字，介绍一下自己吧！');
  const [experiments, setExperiments] = useState([
    { id: 1, title: '水溶液平衡实验', description: '探索不同浓度下的水溶液平衡状态' },
    { id: 2, title: '光合作用分析', description: '研究光照条件对植物光合作用的影响' },
    { id: 3, title: '电池材料研究', description: '测试新型材料在锂离子电池中的性能' },
  ]);
  const [userProjects, setUserProjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [newExperiment, setNewExperiment] = useState({ title: '', description: '' });
  const [showAddExperiment, setShowAddExperiment] = useState(false);
  const [showLargeAvatar, setShowLargeAvatar] = useState(false);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [showHistoryAvatars, setShowHistoryAvatars] = useState(false);
  const [historyAvatars, setHistoryAvatars] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'experiments', 'projects'
  
  const avatarInputRef = useRef(null);
  const settingsRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      // 从localStorage加载数据
      loadUserData();
      
      // 加载用户作品数据
      loadUserProjects();
      
      // 防止滚动
      document.body.style.overflow = 'hidden';
    } else {
      // 恢复滚动
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, username]);
  
  useEffect(() => {
    if (isOpen) {
      const savedAvatars = JSON.parse(localStorage.getItem(`${username}_avatars`) || '[]');
      setHistoryAvatars(savedAvatars);
    }
  }, [isOpen, username]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 加载用户上传的作品
  const loadUserProjects = () => {
    try {
      // 从localStorage获取所有项目数据
      const allProjects = JSON.parse(localStorage.getItem('globalProjects')) || [];
      
      // 筛选出当前用户的项目
      const filteredProjects = allProjects.filter(project => project.author === username);
      
      setUserProjects(filteredProjects);
    } catch (error) {
      console.error('加载用户作品失败:', error);
    }
  };
  
  const loadUserData = () => {
    try {
      const userData = localStorage.getItem(`user_${username}`);
      if (userData) {
        const parsedData = JSON.parse(userData);
        setAvatar(parsedData.avatar || null);
        setSignature(parsedData.signature || '探索科学的奥秘');
        setEmail(parsedData.email || 'your.email@example.com');
        setBio(parsedData.bio || '这里是我的个人简介，点击编辑按钮可以修改这段文字，介绍一下自己吧！');
        
        // 加载实验数据
        if (parsedData.experiments && Array.isArray(parsedData.experiments)) {
          setExperiments(parsedData.experiments);
        }
      }
    } catch (error) {
      console.error('加载用户数据时出错:', error);
    }
  };
  
  const saveUserData = () => {
    try {
      const userData = {
        avatar,
        signature,
        email,
        bio,
        experiments
      };
      
      localStorage.setItem(`user_${username}`, JSON.stringify(userData));
      setIsEditing(false);
      setShowAddExperiment(false);
    } catch (error) {
      console.error('保存用户数据时出错:', error);
    }
  };
  
  const handleEdit = () => {
    setOriginalData({
      avatar,
      signature,
      email,
      bio,
      experiments: [...experiments]
    });
    setIsEditing(true);
    setShowSettings(false);
  };
  
  const handleCancel = () => {
    setAvatar(originalData.avatar);
    setSignature(originalData.signature);
    setEmail(originalData.email);
    setBio(originalData.bio);
    setExperiments([...originalData.experiments]);
    setIsEditing(false);
    setShowAddExperiment(false);
  };
  
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAvatar = event.target.result;
        setAvatar(newAvatar);
        // 保存到历史记录
        const savedAvatars = JSON.parse(localStorage.getItem(`${username}_avatars`) || '[]');
        if (!savedAvatars.includes(newAvatar)) {
          savedAvatars.unshift(newAvatar);
          localStorage.setItem(`${username}_avatars`, JSON.stringify(savedAvatars.slice(0, 5)));
          setHistoryAvatars(savedAvatars.slice(0, 5));
        }
        setShowAvatarOptions(false);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleExperimentChange = (id, field, value) => {
    setExperiments(prevExperiments => 
      prevExperiments.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };
  
  const handleDeleteExperiment = (id) => {
    setExperiments(prevExperiments => 
      prevExperiments.filter(exp => exp.id !== id)
    );
  };
  
  const handleAddExperiment = () => {
    if (newExperiment.title.trim() && newExperiment.description.trim()) {
      const newId = Math.max(0, ...experiments.map(e => e.id)) + 1;
      setExperiments([
        ...experiments, 
        { 
          id: newId, 
          title: newExperiment.title, 
          description: newExperiment.description 
        }
      ]);
      setNewExperiment({ title: '', description: '' });
      setShowAddExperiment(false);
    }
  };
  
  const handleAvatarClick = () => {
    if (!isEditing) {
      setShowLargeAvatar(true);
    }
  };
  
  const handleCloseLargeAvatar = () => {
    setShowLargeAvatar(false);
  };
  
  const selectHistoryAvatar = (avatarUrl) => {
    setAvatar(avatarUrl);
    setShowHistoryAvatars(false);
    setShowAvatarOptions(false);
  };
  
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

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="profile-modal-close" onClick={onClose}>&times;</button>
        
        <div className="profile-header">
          <div className="profile-avatar-container" 
               onClick={() => isEditing ? setShowAvatarOptions(true) : setShowLargeAvatar(true)}
               style={{ cursor: 'pointer' }}>
            {avatar ? (
              <img 
                src={avatar} 
                alt={username} 
                className="profile-avatar-img" 
              />
            ) : (
              <div className="profile-avatar">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
            {isEditing && showAvatarOptions && (
              <div className="avatar-options-overlay" onClick={e => e.stopPropagation()}>
                <button className="avatar-option-btn" onClick={() => setShowHistoryAvatars(true)}>
                  <FaHistory /> 查看历史头像
                </button>
                <button className="avatar-option-btn" onClick={() => avatarInputRef.current.click()}>
                  <FaCamera /> 选取新头像
                </button>
              </div>
            )}
            <input 
              type="file" 
              ref={avatarInputRef}
              className="avatar-upload" 
              onChange={handleAvatarChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          
          <div className="profile-info">
            <h2 className="profile-name">{username}</h2>
            
            {isEditing ? (
              <input
                type="text"
                className="edit-input"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="个性签名"
              />
            ) : (
              <p className="profile-signature">{signature}</p>
            )}
            
            {isEditing ? (
              <input
                type="email"
                className="edit-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="电子邮箱"
              />
            ) : (
              <p className="profile-email">{email}</p>
            )}
          </div>
          
          {!isEditing && (
            <button className="profile-settings-button" onClick={toggleSettings}>
              <FaCog />
            </button>
          )}
          
          {showSettings && (
            <div className="profile-settings-menu" ref={settingsRef}>
              <button className="settings-option" onClick={handleEdit}>
                <FaEdit /> 编辑资料
              </button>
              <button className="settings-option logout-option" onClick={handleLogout}>
                <FaSignOutAlt /> 退出登录
              </button>
            </div>
          )}
          
          {isEditing && (
            <div className="edit-actions">
              <button className="cancel-button" onClick={handleCancel}>取消</button>
              <button className="save-button" onClick={saveUserData}>保存</button>
            </div>
          )}
        </div>
        
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            个人资料
          </button>
          <button 
            className={`tab-button ${activeTab === 'experiments' ? 'active' : ''}`}
            onClick={() => setActiveTab('experiments')}
          >
            我的实验
          </button>
          <button 
            className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            我的作品 <span className="badge">{userProjects.length}</span>
          </button>
        </div>
        
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="profile-field">
              <h3>邮箱地址</h3>
              {isEditing ? (
                <input
                  type="email"
                  className="edit-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="邮箱地址"
                />
              ) : (
                <p>{email}</p>
              )}
            </div>
            
            <div className="profile-field">
              <h3>个人简介</h3>
              {isEditing ? (
                <textarea
                  className="edit-textarea"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="个人简介"
                />
              ) : (
                <p className="profile-bio">{bio}</p>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'experiments' && (
          <div className="profile-section">
            {isEditing && !showAddExperiment ? (
              <button className="add-experiment-button" onClick={() => setShowAddExperiment(true)}>
                <FaPlus /> 添加新实验
              </button>
            ) : null}
            
            {isEditing && showAddExperiment ? (
              <div className="experiment-form">
                <h3>添加新实验</h3>
                <input
                  type="text"
                  className="edit-input"
                  placeholder="实验标题"
                  value={newExperiment.title}
                  onChange={e => setNewExperiment({...newExperiment, title: e.target.value})}
                />
                <textarea
                  className="edit-textarea"
                  placeholder="实验描述"
                  value={newExperiment.description}
                  onChange={e => setNewExperiment({...newExperiment, description: e.target.value})}
                />
                <div className="experiment-form-actions">
                  <button className="cancel-button" onClick={() => setShowAddExperiment(false)}>取消</button>
                  <button className="add-button" onClick={handleAddExperiment}>添加</button>
                </div>
              </div>
            ) : null}
            
            <div className="experiments-list">
              {experiments.map(exp => (
                <div key={exp.id} className="experiment-item">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        className="edit-input"
                        value={exp.title}
                        onChange={e => handleExperimentChange(exp.id, 'title', e.target.value)}
                        placeholder="实验标题"
                      />
                      <textarea
                        className="edit-textarea"
                        value={exp.description}
                        onChange={e => handleExperimentChange(exp.id, 'description', e.target.value)}
                        placeholder="实验描述"
                      />
                    </>
                  ) : (
                    <>
                      <h3>{exp.title}</h3>
                      <p>{exp.description}</p>
                    </>
                  )}
                  
                  {isEditing && (
                    <button 
                      className="delete-experiment-button"
                      onClick={() => handleDeleteExperiment(exp.id)}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="profile-section projects-section">
            <h3 className="projects-title">已发布的作品 ({userProjects.length})</h3>
            
            {userProjects.length === 0 ? (
              <div className="empty-projects">
                <p>您还没有发布过作品</p>
                <button 
                  className="upload-project-button"
                  onClick={() => {
                    onClose(); // 关闭模态框
                    navigate('/gallery'); // 跳转到Gallery页面
                  }}
                >
                  去上传作品
                </button>
              </div>
            ) : (
              <div className="user-projects-grid">
                {userProjects.map(project => (
                  <div 
                    className="project-card" 
                    key={project.id}
                    onClick={() => {
                      onClose(); // 关闭当前模态框
                      navigate(`/project/${project.id}`); // 导航到项目详情页
                    }}
                  >
                    <div className="project-image">
                      <img 
                        src={project.imageUrl} 
                        alt={project.title}
                        onError={(e) => {
                          e.target.onerror = null; // 防止无限循环
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
        )}
        
        {showLargeAvatar && avatar && (
          <div className="large-avatar-overlay" onClick={handleCloseLargeAvatar}>
            <div className="large-avatar-container" onClick={e => e.stopPropagation()}>
              <img src={avatar} alt={username} className="large-avatar" />
              <button className="close-large-avatar" onClick={handleCloseLargeAvatar}>
                &times;
              </button>
            </div>
          </div>
        )}
        
        {showHistoryAvatars && (
          <div className="history-avatars-overlay" onClick={() => setShowHistoryAvatars(false)}>
            <div className="history-avatars-container" onClick={e => e.stopPropagation()}>
              <h3>历史头像</h3>
              <div className="history-avatars-grid">
                {historyAvatars.length > 0 ? (
                  historyAvatars.map((avatarUrl, index) => (
                    <div 
                      key={index} 
                      className="history-avatar-item"
                      onClick={() => selectHistoryAvatar(avatarUrl)}
                    >
                      <img src={avatarUrl} alt={`历史头像 ${index + 1}`} />
                    </div>
                  ))
                ) : (
                  <p className="no-history">没有历史头像记录</p>
                )}
              </div>
              <button 
                className="close-history-avatars" 
                onClick={() => setShowHistoryAvatars(false)}
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal; 