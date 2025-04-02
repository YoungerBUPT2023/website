import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: null,
    interests: [],
    skills: [],
    achievements: [],
    projects: []
  });

  const navigate = useNavigate();

  const fetchUserProjects = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/user/${userData.username}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('获取作品列表失败');
      }
      
      const data = await response.json();
      setUserData(prev => ({
        ...prev,
        projects: data
      }));
    } catch (error) {
      console.error('获取作品列表错误:', error);
      alert('获取作品列表失败，请稍后重试');
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${username}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('获取用户信息失败');
        }
        
        const data = await response.json();
        setUserData(data);
        await fetchUserProjects();
      } catch (error) {
        console.error('获取用户信息错误:', error);
        alert('获取用户信息失败，请稍后重试');
      }
    };

    if (username && token) {
      fetchUserData();
    }
  }, [username, token]);

  // 处理编辑项目
  const handleEditProject = (projectId) => {
    navigate(`/gallery/edit/${projectId}`);
  };

  // 处理删除项目
  const handleDeleteProject = async (projectId) => {
    if (window.confirm('确定要删除这个实验吗？此操作不可恢复。')) {
      try {
        const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('删除失败');
        }

        // 更新本地状态，移除已删除的项目
        setUserData(prev => ({
          ...prev,
          projects: prev.projects.filter(project => project.id !== projectId)
        }));

        alert('实验已成功删除');
      } catch (error) {
        console.error('删除实验错误:', error);
        alert('删除失败，请稍后重试');
      }
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-content">
        <h1>编辑个人资料</h1>
        
        <form onSubmit={handleSubmit} className="edit-profile-form">
          {/* ... 现有的表单字段 ... */}
        </form>

        <div className="my-experiments-section">
          <h2>我的实验</h2>
          {userData.projects && userData.projects.length > 0 ? (
            <div className="experiments-grid">
              {userData.projects.map(project => (
                <div key={project.id} className="experiment-card">
                  <div className="experiment-image">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=图片加载失败';
                      }}
                    />
                  </div>
                  <div className="experiment-info">
                    <h3>{project.title}</h3>
                    <p className="experiment-description">{project.description}</p>
                    <div className="experiment-meta">
                      <span className="experiment-date">{project.date}</span>
                      <span className="experiment-likes">
                        <i className="icon-like"></i> {project.likes}
                      </span>
                    </div>
                    <div className="experiment-tags">
                      {project.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                    <div className="experiment-actions">
                      <button 
                        className="edit-button"
                        onClick={() => handleEditProject(project.id)}
                      >
                        编辑
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-experiments">
              <p>您还没有发布任何实验</p>
              <button 
                className="create-experiment-button"
                onClick={() => navigate('/gallery')}
              >
                去发布实验
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfile; 