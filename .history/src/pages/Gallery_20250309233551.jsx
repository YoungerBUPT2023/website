import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gallery.css';

const Gallery = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    tags: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');

  // 检查登录状态
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const user = localStorage.getItem('username') || '';
      setIsLoggedIn(loggedIn);
      setUsername(user);
    };
    
    checkAuth();
    window.addEventListener('storage', checkAuth);
    
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // 加载示例项目数据
  useEffect(() => {
    // 模拟从API获取数据
    const sampleProjects = [
      {
        id: 1,
        title: '太空站模拟器',
        description: '一个交互式太空站模拟器，可以体验失重环境下的生活和工作。',
        imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        author: '刘明',
        date: '2023-09-15',
        tags: ['VR', '太空', '模拟']
      },
      {
        id: 2,
        title: '火星探测车控制系统',
        description: '基于实际NASA数据开发的火星探测车控制系统，可以模拟在火星表面的探索任务。',
        imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        author: '张伟',
        date: '2023-10-22',
        tags: ['火星', '机器人', '控制系统']
      },
      {
        id: 3,
        title: '太阳系行星轨道可视化',
        description: '基于真实天文数据的太阳系行星轨道三维可视化项目，包含历史轨迹和未来预测。',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        author: '王芳',
        date: '2023-08-30',
        tags: ['天文', '可视化', '数据']
      },
      {
        id: 4,
        title: '太空垃圾追踪系统',
        description: '实时追踪地球轨道上的太空垃圾，并提供碰撞风险评估。',
        imageUrl: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        author: '李强',
        date: '2023-11-05',
        tags: ['太空', '数据', '安全']
      }
    ];
    
    setProjects(sampleProjects);
  }, []);

  // 处理文件选择
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // 创建预览URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理作品上传
  const handleUpload = (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert('请先登录后再上传作品');
      return;
    }
    
    if (!selectedFile) {
      alert('请选择要上传的文件');
      return;
    }
    
    // 创建新项目对象
    const newProject = {
      id: Date.now(),
      title: uploadData.title,
      description: uploadData.description,
      imageUrl: previewUrl,
      author: username,
      date: new Date().toISOString().split('T')[0],
      tags: uploadData.tags.split(',').map(tag => tag.trim())
    };
    
    // 添加到项目列表
    setProjects([newProject, ...projects]);
    
    // 重置表单
    setUploadData({
      title: '',
      description: '',
      tags: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setShowUploadModal(false);
    
    // 显示成功消息
    alert('作品上传成功！');
  };

  // 处理登录点击
  const handleLoginClick = () => {
    navigate('/login');
  };

  // 过滤项目
  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.tags.includes(filter));

  // 获取所有标签
  const allTags = [...new Set(projects.flatMap(project => project.tags))];

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <div className="header-content">
          <h1>太空实验作品展</h1>
          <p>展示最优秀的太空科学实验项目和创新作品</p>
        </div>
        
        <div className="header-actions">
          {isLoggedIn ? (
            <button 
              className="upload-button"
              onClick={() => setShowUploadModal(true)}
            >
              <i className="icon-upload"></i>
              上传作品
            </button>
          ) : (
            <button 
              className="login-button"
              onClick={handleLoginClick}
            >
              登录后上传
            </button>
          )}
        </div>
      </div>
      
      <div className="gallery-filters">
        <button 
          className={filter === 'all' ? 'filter-active' : ''}
          onClick={() => setFilter('all')}
        >
          全部作品
        </button>
        {allTags.map(tag => (
          <button 
            key={tag}
            className={filter === tag ? 'filter-active' : ''}
            onClick={() => setFilter(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      
      <div className="gallery-grid">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <div className="project-card" key={project.id}>
              <div className="project-image">
                <img src={project.imageUrl} alt={project.title} />
              </div>
              <div className="project-content">
                <h3>{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-meta">
                  <span className="project-author">作者: {project.author}</span>
                  <span className="project-date">{project.date}</span>
                </div>
                <div className="project-tags">
                  {project.tags.map(tag => (
                    <span className="tag" key={tag} onClick={() => setFilter(tag)}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-projects">
            <p>暂无符合条件的作品</p>
          </div>
        )}
      </div>
      
      {showUploadModal && (
        <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>上传您的作品</h2>
              <button className="close-button" onClick={() => setShowUploadModal(false)}>×</button>
            </div>
            
            <form className="upload-form" onSubmit={handleUpload}>
              <div className="form-group">
                <label htmlFor="title">作品标题</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={uploadData.title}
                  onChange={handleInputChange}
                  placeholder="请输入作品标题"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">作品描述</label>
                <textarea
                  id="description"
                  name="description"
                  value={uploadData.description}
                  onChange={handleInputChange}
                  placeholder="请描述您的作品..."
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="tags">标签</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={uploadData.tags}
                  onChange={handleInputChange}
                  placeholder="用逗号分隔多个标签，如：太空,模拟,VR"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="file">上传文件</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.zip,.doc,.docx"
                    className="file-input"
                  />
                  <div className="file-upload-button">
                    选择文件
                  </div>
                  <span className="selected-file-name">
                    {selectedFile ? selectedFile.name : '未选择文件'}
                  </span>
                </div>
              </div>
              
              {previewUrl && (
                <div className="preview-container">
                  <h4>预览</h4>
                  <img src={previewUrl} alt="预览" className="file-preview" />
                </div>
              )}
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowUploadModal(false)}
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={!selectedFile || !uploadData.title}
                >
                  上传作品
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery; 