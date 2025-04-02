import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const EditProfile = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: null,
    interests: [],
    skills: [],
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: ''
    }
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('获取用户数据失败');
        }
        
        const data = await response.json();
        setUserData(data);
        
        const projectsResponse = await fetch('http://localhost:5000/api/projects/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!projectsResponse.ok) {
          throw new Error('获取项目数据失败');
        }
        
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]);

  const handleDeleteProject = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('删除项目失败');
      }

      setProjects(projects.filter(project => project.id !== projectId));
      setShowDeleteConfirm(false);
      setSuccessMessage('项目删除成功');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-content">
        <h1>编辑个人资料</h1>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="profile-form">
              {/* ... existing form fields ... */}
            </form>

            <div className="my-projects-section">
              <h2>我的实验</h2>
              {projects.length > 0 ? (
                <div className="projects-grid">
                  {projects.map(project => (
                    <div 
                      key={project.id} 
                      className="project-card"
                      onClick={() => handleProjectClick(project)}
                    >
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
                        <h3>{project.title}</h3>
                        <p className="project-description">{project.description}</p>
                        <div className="project-meta">
                          <span className="project-date">{project.date}</span>
                          <span className="project-likes">❤️ {project.likes}</span>
                        </div>
                        <div className="project-tags">
                          {project.tags.map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                        <div className="project-actions">
                          <button 
                            className="delete-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectToDelete(project.id);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-projects">
                  <p>您还没有发布任何实验</p>
                  <Link to="/gallery" className="publish-button">
                    去发布实验
                  </Link>
                </div>
              )}
            </div>
          </>
        )}

        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>确认删除</h3>
              <p>确定要删除这个实验吗？此操作无法撤销。</p>
              <div className="modal-actions">
                <button 
                  className="cancel-button"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  取消
                </button>
                <button 
                  className="confirm-button"
                  onClick={() => handleDeleteProject(projectToDelete)}
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}

        {showProjectDetail && selectedProject && (
          <div className="modal-overlay">
            <div className="project-detail-modal">
              <div className="modal-header">
                <h2>{selectedProject.title}</h2>
                <button 
                  className="close-button"
                  onClick={() => setShowProjectDetail(false)}
                >
                  ×
                </button>
              </div>
              <div className="project-detail-content">
                <div className="project-detail-image">
                  <img src={selectedProject.imageUrl} alt={selectedProject.title} />
                </div>
                <div className="project-detail-info">
                  <div className="project-detail-meta">
                    <span className="project-date">发布日期: {selectedProject.date}</span>
                    <span className="project-likes">❤️ {selectedProject.likes}</span>
                  </div>
                  <div className="project-detail-tags">
                    {selectedProject.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="project-detail-description">
                    <h3>项目描述</h3>
                    <p>{selectedProject.description}</p>
                  </div>
                  {selectedProject.detailedDescription && (
                    <div className="project-detail-full-description">
                      <h3>详细描述</h3>
                      <p>{selectedProject.detailedDescription}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile; 