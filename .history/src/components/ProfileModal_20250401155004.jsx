import React, { useState, useEffect, useRef } from 'react';
import './ProfileModal.css';
import { FaCamera, FaEdit, FaTrash, FaPlus, FaHistory, FaSignOutAlt, FaCog, FaRocket } from 'react-icons/fa';
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
  
  const avatarInputRef = useRef(null);
  const settingsRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      // 从localStorage加载数据
      loadUserData();
      
      // 防止滚动
      document.body.style.overflow = 'hidden';
      
      // 加载用户发布的作品
      loadUserProjects();
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
  
  // 加载用户发布的作品
  const loadUserProjects = () => {
    try {
      // 从本地存储获取全局项目列表
      const savedProjects = JSON.parse(localStorage.getItem('globalProjects') || '[]');
      
      // 筛选出当前用户发布的作品
      const currentUserProjects = savedProjects.filter(project => project.author === username);
      
      setUserProjects(currentUserProjects);
    } catch (error) {
      console.error('加载用户作品时出错:', error);
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
            <h1>{username}</h1>
            
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
        </div>
        
        <div className="profile-content">
          <div className="profile-section">
            <h2>个人简介</h2>
            {isEditing ? (
              <textarea
                className="edit-textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="个人简介"
              />
            ) : (
              <p className="profile-bio">{bio}</p>
            )}
          </div>
          
          <div className="profile-section">
            <div className="section-header">
              <h2>我的实验</h2>
              {isEditing && (
                <button 
                  className="add-experiment-button"
                  onClick={() => setShowAddExperiment(true)}
                >
                  <FaPlus /> 添加实验
                </button>
              )}
            </div>
            
            {showAddExperiment && (
              <div className="add-experiment-form">
                <input
                  type="text"
                  className="edit-input"
                  value={newExperiment.title}
                  onChange={(e) => setNewExperiment({...newExperiment, title: e.target.value})}
                  placeholder="实验标题"
                />
                <textarea
                  className="edit-textarea"
                  value={newExperiment.description}
                  onChange={(e) => setNewExperiment({...newExperiment, description: e.target.value})}
                  placeholder="实验描述"
                />
                <div className="experiment-form-actions">
                  <button className="profile-button save-button" onClick={handleAddExperiment}>
                    添加
                  </button>
                  <button 
                    className="profile-button cancel-button" 
                    onClick={() => {
                      setShowAddExperiment(false);
                      setNewExperiment({ title: '', description: '' });
                    }}
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
            
            <div className="experiments-list">
              {experiments.length > 0 ? (
                experiments.map(exp => (
                  <div key={exp.id} className="experiment-item">
                    {isEditing ? (
                      <>
                        <div className="experiment-edit-header">
                          <input
                            type="text"
                            className="edit-input"
                            value={exp.title}
                            onChange={(e) => handleExperimentChange(exp.id, 'title', e.target.value)}
                            placeholder="实验标题"
                          />
                          <button 
                            className="delete-experiment-button"
                            onClick={() => handleDeleteExperiment(exp.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                        <textarea
                          className="edit-textarea"
                          value={exp.description}
                          onChange={(e) => handleExperimentChange(exp.id, 'description', e.target.value)}
                          placeholder="实验描述"
                        />
                      </>
                    ) : (
                      <>
                        <h3>{exp.title}</h3>
                        <p>{exp.description}</p>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className="empty-message">暂无实验记录</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="profile-actions">
          {isEditing && (
            <>
              <button className="profile-button save-button" onClick={saveUserData}>保存</button>
              <button className="profile-button cancel-button" onClick={handleCancel}>取消</button>
            </>
          )}
          
          <div className="settings-container-bottom" ref={settingsRef}>
            <button className="settings-button" onClick={toggleSettings} title="设置">
              <FaCog />
            </button>
            
            {showSettings && (
              <div className="settings-menu settings-menu-bottom">
                <button className="settings-menu-item" onClick={handleEdit}>
                  <FaEdit /> 编辑资料
                </button>
                <button className="settings-menu-item logout-item" onClick={handleLogout}>
                  <FaSignOutAlt /> 退出登录
                </button>
              </div>
            )}
          </div>
        </div>

        {showLargeAvatar && (
          <div className="large-avatar-overlay" onClick={handleCloseLargeAvatar}>
            <div className="large-avatar-container">
              <img src={avatar || '/default-avatar.png'} alt="用户头像" />
            </div>
          </div>
        )}

        {showHistoryAvatars && (
          <div className="history-avatars-overlay" onClick={() => setShowHistoryAvatars(false)}>
            <div className="history-avatars-container" onClick={e => e.stopPropagation()}>
              <h3>历史头像</h3>
              <div className="history-avatars-grid">
                {historyAvatars.map((avatarUrl, index) => (
                  <div key={index} className="history-avatar-item" onClick={() => selectHistoryAvatar(avatarUrl)}>
                    <img src={avatarUrl} alt={`历史头像 ${index + 1}`} />
                  </div>
                ))}
              </div>
              <button className="close-history-btn" onClick={() => setShowHistoryAvatars(false)}>关闭</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal; 