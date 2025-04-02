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
  const [activeCategory, setActiveCategory] = useState('all');
  
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
        description: '一个模拟太空探索的3D交互项目，用户可以体验太空飞行和行星探索。',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        author: '张三',
        category: 'space',
        date: '2023-05-15'
      },
      {
        id: 2,
        title: '月球表面漫步',
        description: '模拟在月球表面行走的VR体验，重现阿波罗登月任务的场景。',
        imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        author: '李四',
        category: 'vr',
        date: '2023-06-22'
      },
      {
        id: 3,
        title: '火星基地建设',
        description: '火星基地建设规划与模拟，探索未来人类在火星上的生存可能性。',
        imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        author: '王五',
        category: 'space',
        date: '2023-07-10'
      },
      {
        id: 4,
        title: '深海探索模拟器',
        description: '探索海洋深处的神秘世界，了解深海生物和地质特征。',
        imageUrl: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        author: '赵六',
        category: 'simulation',
        date: '2023-08-05'
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
      author: username,
      category: 'other',
      date: new Date().toISOString().split('T')[0]
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

  const filteredWorks = activeCategory === 'all' 
    ? works 
    : works.filter(work => work.category === activeCategory);

  return (
    <div className="gallery-page">
      <div className="gallery-hero">
        <div className="gallery-hero-content">
          <h1>优秀实验作品展示</h1>
          <p>探索太空科学的奇妙世界，欣赏同学们的创意作品</p>
          
          {isLoggedIn ? (
            <button 
              className="hero-upload-btn"
              onClick={() => setShowUploadForm(!showUploadForm)}
            >
              {showUploadForm ? '取消上传' : '上传我的作品'}
            </button>
          ) : (
            <button 
              className="hero-login-btn"
              onClick={handleLoginClick}
            >
              登录后上传作品
            </button>
          )}
        </div>
      </div>

      <div className="gallery-container">
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
                  placeholder="请输入作品标题"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">作品描述</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="请描述您的作品..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="file">上传作品文件</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.zip,.rar,.doc,.docx"
                    required
                    className="file-input"
                  />
                  <div className="file-upload-button">
                    <span>选择文件</span>
                    <p className="file-name">{file ? file.name : '未选择文件'}</p>
                  </div>
                </div>
                
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

        <div className="gallery-filter">
          <button 
            className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            全部作品
          </button>
          <button 
            className={`filter-btn ${activeCategory === 'space' ? 'active' : ''}`}
            onClick={() => setActiveCategory('space')}
          >
            太空探索
          </button>
          <button 
            className={`filter-btn ${activeCategory === 'vr' ? 'active' : ''}`}
            onClick={() => setActiveCategory('vr')}
          >
            VR体验
          </button>
          <button 
            className={`filter-btn ${activeCategory === 'simulation' ? 'active' : ''}`}
            onClick={() => setActiveCategory('simulation')}
          >
            模拟实验
          </button>
        </div>

        <div className="gallery-grid">
          {filteredWorks.length > 0 ? (
            filteredWorks.map((work) => (
              <div key={work.id} className="gallery-item">
                <div className="gallery-item-image">
                  <img src={work.imageUrl} alt={work.title} />
                </div>
                <div className="gallery-item-content">
                  <h3>{work.title}</h3>
                  <p className="gallery-item-description">{work.description}</p>
                  <div className="gallery-item-meta">
                    <span className="gallery-item-author">作者: {work.author}</span>
                    <span className="gallery-item-date">{work.date}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-works">
              <p>暂无作品展示</p>
              {isLoggedIn && (
                <button 
                  className="upload-btn-empty"
                  onClick={() => setShowUploadForm(true)}
                >
                  上传第一个作品
                </button>
              )}
            </div>
          )}
        </div>
        
        {isLoggedIn && !showUploadForm && (
          <div className="floating-upload-btn" onClick={() => setShowUploadForm(true)}>
            <span>+</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Gallery; 