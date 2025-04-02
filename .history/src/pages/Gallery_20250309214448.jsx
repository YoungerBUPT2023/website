import React, { useState, useEffect } from 'react';
import { uploadService } from '../services/uploadService';
import './Gallery.css';

function Gallery() {
  const [works, setWorks] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // 加载作品列表
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      const data = await uploadService.getWorks();
      setWorks(data);
    } catch (err) {
      console.error('获取作品失败:', err);
      setError('获取作品列表失败，请稍后再试');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('请选择要上传的文件');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);

      await uploadService.uploadWork(formData);
      setSuccess('作品上传成功！');
      setTitle('');
      setDescription('');
      setFile(null);
      setShowUploadForm(false);
      
      // 重新加载作品列表
      fetchWorks();
    } catch (err) {
      console.error('上传失败:', err);
      setError('上传失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

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
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
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
              disabled={loading}
            >
              {loading ? '上传中...' : '提交'}
            </button>
          </form>
        </div>
      )}

      <div className="gallery-grid">
        {works.length > 0 ? (
          works.map((work) => (
            <div key={work.id} className="gallery-item">
              <img src={work.imageUrl || '/placeholder.png'} alt={work.title} />
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