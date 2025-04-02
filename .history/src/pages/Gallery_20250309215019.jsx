import React, { useState } from 'react';
import './Gallery.css';

function Gallery() {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  
  // 模拟作品数据
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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`模拟上传成功！\n标题: ${title}\n描述: ${description}\n文件: ${file ? file.name : '无'}`);
    setTitle('');
    setDescription('');
    setFile(null);
    setShowUploadForm(false);
  };

  // 模拟用户已登录状态
  const isLoggedIn = true;

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h1>优秀实验作品展示</h1>
        {isLoggedIn && (
          <button 
            className="upload-btn"
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            {showUploadForm ? '取消上传' : '上传作品'}
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
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-btn"
            >
              提交
            </button>
          </form>
        </div>
      )}

      <div className="gallery-grid">
        {dummyWorks.map((work) => (
          <div key={work.id} className="gallery-item">
            <img src={work.imageUrl} alt={work.title} />
            <h3>{work.title}</h3>
            <p>{work.description}</p>
            <div className="work-author">作者: {work.author}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gallery; 