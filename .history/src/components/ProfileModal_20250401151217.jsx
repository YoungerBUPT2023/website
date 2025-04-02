import React, { useState, useEffect, useRef } from 'react';
import './ProfileModal.css';
import { toast } from 'react-toastify';
import { FiUser, FiUserPlus, FiEdit, FiSettings, FiLogOut, FiX, FiHeart, FiMessageSquare, FiUpload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ProfileModal = ({ isOpen, onClose, username }) => {
  const [user, setUser] = useState({
    username: '',
    avatar: '',
    bio: '',
    fullName: '',
    email: '',
    gender: '',
    dateJoined: '',
    followers: [],
    following: []
  });
  const [editMode, setEditMode] = useState(false);
  const [tempUser, setTempUser] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [avatarClicked, setAvatarClicked] = useState(false);
  const [experiments, setExperiments] = useState([]);
  const [showExperimentForm, setShowExperimentForm] = useState(false);
  const [newExperiment, setNewExperiment] = useState({ name: '', description: '' });
  const modalRef = useRef(null);
  const settingsRef = useRef(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && username) {
      loadUserData();
      loadUserProjects();
    }
  }, [isOpen, username]);

  // 加载用户数据
  const loadUserData = () => {
    setIsLoadingUser(true);
    // 从localStorage获取用户数据模拟API请求
    try {
      const userList = JSON.parse(localStorage.getItem('users')) || [];
      const currentUser = userList.find(u => u.username === username);
      
      if (currentUser) {
        setUser({
          username: currentUser.username || '',
          avatar: currentUser.avatar || 'https://gravatar.com/avatar/0?d=mp',
          bio: currentUser.bio || '这个人很懒，还没有填写个人简介',
          fullName: currentUser.fullName || '',
          email: currentUser.email || '',
          gender: currentUser.gender || '',
          dateJoined: currentUser.dateJoined || new Date().toISOString().split('T')[0],
          followers: currentUser.followers || [],
          following: currentUser.following || []
        });
        setTempUser({
          username: currentUser.username || '',
          avatar: currentUser.avatar || 'https://gravatar.com/avatar/0?d=mp',
          bio: currentUser.bio || '这个人很懒，还没有填写个人简介',
          fullName: currentUser.fullName || '',
          email: currentUser.email || '',
          gender: currentUser.gender || ''
        });
        
        // 加载实验数据
        setExperiments(currentUser.experiments || []);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('加载用户数据失败');
    } finally {
      setIsLoadingUser(false);
    }
  };

  // 加载用户发布的作品
  const loadUserProjects = () => {
    try {
      // 从localStorage获取项目数据
      const allProjects = JSON.parse(localStorage.getItem('projects')) || [];
      // 筛选当前用户发布的项目
      const userProjs = allProjects.filter(project => project.author === username);
      setUserProjects(userProjs);
    } catch (error) {
      console.error('Failed to load user projects:', error);
      toast.error('加载用户作品失败');
    }
  };

  // 导航到项目详情页
  const navigateToProject = (projectId) => {
    onClose();
    navigate(`/project/${projectId}`);
  };

  return isOpen ? (
    <div className="profile-modal-overlay" onClick={handleOutsideClick}>
      <div className="profile-modal-content" ref={modalRef}>
        <button className="profile-close-button" onClick={onClose}>
          <FiX />
        </button>

        {isLoadingUser ? (
          <div className="loading-spinner">加载中...</div>
        ) : (
          <>
            <div className="profile-header">
              <div className="profile-avatar-container" onClick={handleAvatarClick}>
                <img src={user.avatar} alt={user.username} className="profile-avatar" />
                {editMode && <div className="avatar-edit-overlay"><FiEdit /><span>更换头像</span></div>}
              </div>
              <div className="profile-user-info">
                <h2 className="profile-name">{user.fullName || user.username}</h2>
                <p className="profile-username">@{user.username}</p>
                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-count">{user.followers.length}</span>
                    <span className="stat-label">粉丝</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-count">{user.following.length}</span>
                    <span className="stat-label">关注</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-count">{userProjects.length}</span>
                    <span className="stat-label">作品</span>
                  </div>
                </div>
              </div>
              <div className="profile-actions">
                {!editMode ? (
                  <button className="profile-settings-button" onClick={toggleSettings}>
                    <FiSettings />
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button className="profile-cancel-button" onClick={cancelEdit}>取消</button>
                    <button className="profile-save-button" onClick={saveChanges}>保存</button>
                  </div>
                )}
                {showSettings && (
                  <div className="profile-settings-menu" ref={settingsRef}>
                    <button className="settings-option" onClick={startEdit}>
                      <FiEdit /> 编辑资料
                    </button>
                    <button className="settings-option logout-option" onClick={handleLogout}>
                      <FiLogOut /> 退出登录
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-tabs">
              <button 
                className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <FiUser /> 个人资料
              </button>
              <button 
                className={`tab-button ${activeTab === 'experiments' ? 'active' : ''}`}
                onClick={() => setActiveTab('experiments')}
              >
                <FiUserPlus /> 我的实验
              </button>
              <button 
                className={`tab-button ${activeTab === 'works' ? 'active' : ''}`}
                onClick={() => setActiveTab('works')}
              >
                <FiUpload /> 我的作品 <span className="badge">{userProjects.length}</span>
              </button>
            </div>

            {activeTab === 'profile' && (
              <div className="profile-details">
                {editMode ? (
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="profile-field">
                      <h3>个人简介</h3>
                      <textarea 
                        className="profile-bio-input"
                        value={tempUser.bio}
                        onChange={(e) => setTempUser({...tempUser, bio: e.target.value})}
                      />
                    </div>
                    <div className="profile-field">
                      <h3>全名</h3>
                      <input 
                        type="text"
                        className="profile-input"
                        value={tempUser.fullName}
                        onChange={(e) => setTempUser({...tempUser, fullName: e.target.value})}
                      />
                    </div>
                    <div className="profile-field">
                      <h3>电子邮件</h3>
                      <input 
                        type="email"
                        className="profile-input"
                        value={tempUser.email}
                        onChange={(e) => setTempUser({...tempUser, email: e.target.value})}
                      />
                    </div>
                    <div className="profile-field">
                      <h3>性别</h3>
                      <select
                        className="profile-input"
                        value={tempUser.gender}
                        onChange={(e) => setTempUser({...tempUser, gender: e.target.value})}
                      >
                        <option value="">不选择</option>
                        <option value="male">男</option>
                        <option value="female">女</option>
                        <option value="other">其他</option>
                      </select>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="profile-field">
                      <h3>个人简介</h3>
                      <p className="profile-bio">{user.bio}</p>
                    </div>
                    <div className="profile-field">
                      <h3>全名</h3>
                      <p>{user.fullName || '未设置'}</p>
                    </div>
                    <div className="profile-field">
                      <h3>电子邮件</h3>
                      <p>{user.email || '未设置'}</p>
                    </div>
                    <div className="profile-field">
                      <h3>性别</h3>
                      <p>{user.gender ? (user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '其他') : '未设置'}</p>
                    </div>
                    <div className="profile-field">
                      <h3>加入日期</h3>
                      <p>{user.dateJoined}</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'experiments' && (
              <div className="experiments-section">
                {!showExperimentForm && (
                  <button className="add-experiment-button" onClick={() => setShowExperimentForm(true)}>
                    <FiPlus /> 添加新实验
                  </button>
                )}
                
                {showExperimentForm && (
                  <div className="experiment-form">
                    <h3>添加新实验</h3>
                    <div className="profile-field">
                      <h3>实验名称</h3>
                      <input 
                        type="text"
                        className="profile-input"
                        value={newExperiment.name}
                        onChange={(e) => setNewExperiment({...newExperiment, name: e.target.value})}
                      />
                    </div>
                    <div className="profile-field">
                      <h3>实验描述</h3>
                      <textarea 
                        className="profile-bio-input"
                        value={newExperiment.description}
                        onChange={(e) => setNewExperiment({...newExperiment, description: e.target.value})}
                      />
                    </div>
                    <div className="experiment-form-actions">
                      <button className="cancel-button" onClick={() => setShowExperimentForm(false)}>取消</button>
                      <button className="add-button" onClick={addExperiment}>添加实验</button>
                    </div>
                  </div>
                )}
                
                <div className="experiments-list">
                  {experiments.length > 0 ? (
                    experiments.map((exp, index) => (
                      <div className="experiment-item" key={index}>
                        <h3>{exp.name}</h3>
                        <p>{exp.description}</p>
                        <button 
                          className="delete-experiment-button" 
                          onClick={() => deleteExperiment(index)}
                        >
                          <FiX />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="no-history">还没有添加任何实验</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'works' && (
              <div className="projects-section">
                <h3 className="projects-title">我的上传作品</h3>
                
                {userProjects.length > 0 ? (
                  <div className="user-projects-grid">
                    {userProjects.map((project) => (
                      <div 
                        key={project.id} 
                        className="project-card"
                        onClick={() => navigateToProject(project.id)}
                      >
                        <div className="project-image">
                          <img 
                            src={project.coverImage || 'https://via.placeholder.com/300x200?text=No+Image'} 
                            alt={project.title} 
                          />
                        </div>
                        <div className="project-content">
                          <h4 className="project-title">{project.title}</h4>
                          <p className="project-description">{project.description}</p>
                          <div className="project-meta">
                            <span className="project-date">{new Date(project.createdAt).toLocaleDateString()}</span>
                            <div className="project-stats">
                              <span className="likes-count">
                                <FiHeart /> {project.likes?.length || 0}
                              </span>
                              <span className="comments-count">
                                <FiMessageSquare /> {project.comments?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-projects">
                    <p>你还没有上传任何作品</p>
                    <button 
                      className="upload-project-button"
                      onClick={() => {
                        onClose();
                        navigate('/upload');
                      }}
                    >
                      立即上传作品
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {avatarClicked && (
          <div className="large-avatar-overlay" onClick={handleLargeAvatarClose}>
            <div className="large-avatar-container">
              <img src={user.avatar} alt={user.username} className="large-avatar" />
              <button className="close-large-avatar" onClick={handleLargeAvatarClose}>
                <FiX />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;
};

export default ProfileModal;