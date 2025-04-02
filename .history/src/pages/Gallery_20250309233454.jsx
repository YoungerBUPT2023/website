import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gallery.css';

function Gallery() {
  const navigate = useNavigate();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [works, setWorks] = useState([]);
  const [previewUrl, setPreviewUrl] = useState('');
  
  // 检查登录状态
  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const user = localStorage.getItem('username') || '';
      setIsLoggedIn(loggedIn);
      setUsername(user);
    };
    
    checkLoginStatus();
    
    // 监听登录状态变化
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);
  
  // 加载作品数据
  useEffect(() => {
    // 这里可以从API加载数据，现在使用模拟数据
    const dummyWorks = [
      {
        id: 1,
        title: '太空探索模拟',
        description: '一个模拟太空探索的3D交互项目',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        author: '张三'
      },
      {
        id: 2,
        title: '月球表面漫步',
        description: '模拟在月球表面行走的VR体验',
        imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        author: '李四'
      },
      {
        id: 3,
        title: '火星基地建设',
        description: '火星基地建设规划与模拟',
        imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        author: '王五'
      }
    ];
    
    setWorks(dummyWorks);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    // 创建预览URL
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert('请先登录后再上传作品');
      return;
    }
    
    // 模拟上传成功
    const newWork = {
      id: works.length + 1,
      title,
      description,
      imageUrl: previewUrl || 'https://via.placeholder.com/500x300?text=No+Preview',
      author: username
    };
    
    // 添加到作品列表
    setWorks([newWork, ...works]);
    
    // 重置表单
    setTitle('');
    setDescription('');
    setFile(null);
    setPreviewUrl('');
    setShowUploadForm(false);
    
    alert(`作品上传成功！\n标题: ${title}\n描述: ${description}`);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h1>优秀实验作品展示</h1>
        {isLoggedIn ? (
          <button 
            className="upload-btn"
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            {showUploadForm ? '取消上传' : '上传作品'}
          </button>
        ) : (
          <button 
            className="login-btn"
            onClick={handleLoginClick}
          >
            登录后上传作品
          </button>
        )}
      </div>

      {showUploadForm && (
        <div className="upload-form-container">
          <form className="upload-form" onSubmit={handleSubmit}>
            <h2>上传您的作品</h2>
            
            <div className="form-group">
              <label htmlFor="title">作品标题</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">作品描述</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="file">选择文件</label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                accept="image/*,.pdf,.zip,.rar,.doc,.docx"
                required
              />
              {previewUrl && (
                <div className="file-preview">
                  <img src={previewUrl} alt="预览" />
                </div>
              )}
              <p className="file-hint">支持图片、PDF、压缩包和文档格式</p>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setShowUploadForm(false);
                  setTitle('');
                  setDescription('');
                  setFile(null);
                  setPreviewUrl('');
                }}
              >
                取消
              </button>
              <button 
                type="submit" 
                className="submit-btn"
              >
                提交作品
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="gallery-grid">
        {works.length > 0 ? (
          works.map((work) => (
            <div key={work.id} className="gallery-item">
              <img src={work.imageUrl} alt={work.title} />
              <h3>{work.title}</h3>
              <p>{work.description}</p>
              <div className="work-author">作者: {work.author}</div>
            </div>
          ))
        ) : (
          <p className="no-works">暂无作品展示</p>
        )}
      </div>
    </div>
  );
}

export default Gallery; 