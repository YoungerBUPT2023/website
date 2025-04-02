import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/lazy';
// const ReactPlayer = require('react-player/lazy');
import './VRLab.css';

function VRLab() {
  const [experimentTitle, setExperimentTitle] = useState('天宫课堂第四课');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('游客');
  const messagesEndRef = useRef(null);
  const [videoSource, setVideoSource] = useState('reactplayer');
  const [showCoursesList, setShowCoursesList] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const coursesList = [
    { 
      id: 1, 
      title: '天宫课堂球形火焰实验', 
      source: 'bilibili', 
      bvid: 'BV1uz4y1L7F8',
      description: '本视频展示了在太空中进行的球形火焰实验，展示了微重力环境下的燃烧特性。'
    },
    { 
      id: 2, 
      title: '天宫课堂第四课-动量守恒实验', 
      source: 'bilibili', 
      bvid: 'BV1R84y1U7FH',
      description: '在太空环境中展示动量守恒定律，通过实验观察微重力环境下的物理定律表现。'
    },
    { 
      id: 3, 
      title: '天宫课堂第四课-又见陀螺实验', 
      source: 'bilibili', 
      bvid: 'BV1am4y1V7az',
      description: '展示太空中陀螺的运动特性，观察微重力环境下角动量守恒的现象。'
    },
    { 
      id: 4, 
      title: '天宫课堂第四课-奇妙"乒乓球"实验', 
      source: 'bilibili', 
      bvid: 'BV1N84y1S7rL',
      description: '通过太空中的"乒乓球"实验，展示微重力环境中液体表面张力的独特表现。'
    },
  ];
  
  const coursesListRef = useRef(null);

  useEffect(() => {
    initStarryBackground();
    const checkAdminStatus = () => {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          if (parsedUserData.isAdmin === true) {
            setIsAdmin(true);
            setUsername(parsedUserData.username || '管理员');
            return;
          }
          
          const storedUsername = parsedUserData.username;
          setIsAdmin(storedUsername === 'qydycg' || storedUsername === 'aikub');
          setUsername(storedUsername);
        } catch (error) {
          console.error('解析用户数据失败:', error);
          setIsAdmin(false);
        }
      }
    };
    
    setSelectedCourse(coursesList[0]);
    
    checkAdminStatus();
    window.addEventListener('storage', checkAdminStatus);
    
    const handleClickOutside = (event) => {
      if (coursesListRef.current && !coursesListRef.current.contains(event.target)) {
        setShowCoursesList(false);
      }
    };
    
    setMessages([
      { id: 1, username: '张老师', content: '欢迎来到生物实验室观察讨论区', timestamp: new Date().toLocaleTimeString() },
      { id: 2, username: '李同学', content: '请问这个实验的目的是什么？', timestamp: new Date().toLocaleTimeString() },
      { id: 3, username: '张老师', content: '这个实验主要是观察细胞分裂过程，大家注意观察显微镜下的变化', timestamp: new Date().toLocaleTimeString() }
    ]);
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('storage', checkAdminStatus);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.height = '';
    document.documentElement.style.height = '';
    
    document.body.classList.remove('no-scroll');
    
    document.body.classList.add('can-scroll');
    
    const timer1 = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    
    const timer2 = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'auto'
      });
    }, 300);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      document.body.classList.remove('can-scroll');
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initStarryBackground = () => {
    const canvas = document.getElementById('starry-bg');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const stars = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5
      });
    }
    
    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        ctx.fillStyle = '#61dafb';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
  };

  const handleEditTitle = () => {
    setTempTitle(experimentTitle);
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (tempTitle.trim()) {
      setExperimentTitle(tempTitle);
    }
    setIsEditingTitle(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    const newMsg = {
      id: Date.now(),
      username: username,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const switchVideoSource = (source) => {
    setVideoSource(source);
    setIsVideoLoading(true);
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setExperimentTitle(course.title);
    setShowCoursesList(false);
    setIsVideoLoading(true);
  };

  return (
    <div className="experiment-lab">
      <canvas id="starry-bg" className="starry-background"></canvas>
      <div className="lab-container">
        <div className="video-player">
          <div className="video-header">
            <div className="title-container">
              {isEditingTitle ? (
                <div className="title-edit-container">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="title-input"
                    autoFocus
                  />
                  <button className="save-title-btn" onClick={handleTitleSave}>
                    保存
                  </button>
                </div>
              ) : (
                <div className="title-display">
                  <h2 className="video-title">当前实验：{experimentTitle}</h2>
                  {isAdmin && (
                    <button className="edit-title-btn" onClick={handleEditTitle}>
                      <span className="edit-icon">✎</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="video-info">
              <div className="info-item">
                <span className="info-label">实验状态：</span>
                <span className="status-badge status-inactive">未开始</span>
              </div>
              <div className="info-item">
                <span className="info-label">当前时间：</span>
                <span className="time-display">12:00</span>
              </div>
              <div className="source-switch">
                <button 
                  className={`switch-button ${videoSource === 'reactplayer' ? 'active' : ''}`}
                  onClick={() => switchVideoSource('reactplayer')}
                >
                  实验直播
                </button>
                <button 
                  className={`switch-button ${videoSource === 'bilibili' ? 'active' : ''}`}
                  onClick={() => switchVideoSource('bilibili')}
                >
                  测试视频
                </button>
              </div>
            </div>
          </div>
          
          <div className="course-selector-container" ref={coursesListRef}>
            <div 
              className="selected-course" 
              onClick={() => setShowCoursesList(!showCoursesList)}
            >
              <span>{selectedCourse?.title || experimentTitle}</span>
              <span className="dropdown-icon">{showCoursesList ? '▲' : '▼'}</span>
            </div>
            {showCoursesList && (
              <div className="courses-dropdown">
                {coursesList.map(course => (
                  <div 
                    key={course.id} 
                    className={`course-item ${selectedCourse?.id === course.id ? 'active' : ''}`}
                    onClick={() => handleSelectCourse(course)}
                    title={course.description}
                  >
                    <div className="course-item-title">{course.title}</div>
                    <div className="course-item-desc">{course.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {videoSource === 'reactplayer' && (
            <div className="player-container">
              <div style={{ width: '100%', height: '400px', position: 'relative' }}>
                {isVideoLoading && (
                  <div className="video-loading">
                    <div className="loader"></div>
                    <div className="loading-text">视频加载中...</div>
                  </div>
                )}
                <iframe 
                  src={`//player.bilibili.com/player.html?bvid=${selectedCourse?.bvid || 'BV1uz4y1L7F8'}&page=1&high_quality=1&danmaku=0&t=2.3&as_wide=1&autoplay=1&bid=${selectedCourse?.bvid || 'BV1uz4y1L7F8'}&showinfo=0&noEndPanel=1`} 
                  scrolling="no" 
                  border="0" 
                  frameBorder="no" 
                  framespacing="0" 
                  allowFullScreen={true}
                  style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                  onLoad={() => setIsVideoLoading(false)}
                ></iframe>
              </div>
              <div className="player-controls">
                <div className="control-info">
                  <span className="stream-status">🟢 实验直播中</span>
                  <span className="source-info">({selectedCourse?.title || '天宫课堂球形火焰实验'})</span>
                </div>
                {selectedCourse && (
                  <div className="video-description">
                    {selectedCourse.description}
                  </div>
                )}
              </div>
            </div>
          )}

          {videoSource === 'bilibili' && (
            <div className="player-container">
              <div style={{ width: '100%', height: '400px', position: 'relative' }}>
                {isVideoLoading && (
                  <div className="video-loading">
                    <div className="loader"></div>
                    <div className="loading-text">视频加载中...</div>
                  </div>
                )}
                <iframe 
                  src={`//player.bilibili.com/player.html?bvid=${selectedCourse?.bvid || 'BV1uz4y1L7F8'}&page=1&high_quality=1&danmaku=0&t=2.3&as_wide=1&autoplay=1&bid=${selectedCourse?.bvid || 'BV1uz4y1L7F8'}&showinfo=0&noEndPanel=1`} 
                  scrolling="no" 
                  border="0" 
                  frameBorder="no" 
                  framespacing="0" 
                  allowFullScreen={true}
                  style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                  onLoad={() => setIsVideoLoading(false)}
                ></iframe>
              </div>
              <div className="player-controls">
                <div className="control-info">
                  <span className="stream-status">🟢 B站官方播放器</span>
                  <span className="source-info">({selectedCourse?.title || '天宫课堂球形火焰实验'})</span>
                </div>
                {selectedCourse && (
                  <div className="video-description">
                    {selectedCourse.description}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="discussion-panel">
          <div className="discussion-header">
            <h3>实时讨论区</h3>
          </div>
          <div className="messages-container">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.username === username ? 'own-message' : ''}`}>
                <div className="message-header">
                  <span className="message-username">{msg.username}</span>
                  <span className="message-time">{msg.timestamp}</span>
                </div>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="message-input-container" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="输入讨论内容..."
              className="message-input"
            />
            <button type="submit" className="send-button">发送</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function VideoPlayer({ title }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [experimentStatus, setExperimentStatus] = useState('未开始');
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoSource, setVideoSource] = useState({
    type: 'test',
    url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4'
  });

  const switchToRTMP = () => {
    setVideoSource({
      type: 'rtmp',
      url: 'rtmp://localhost:1935/live/stream'
    });
    setIsVideoLoaded(true);
    setExperimentStatus('进行中');
  };

  const switchToTestVideo = () => {
    setVideoSource({
      type: 'test',
      url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4'
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="video-player">
      <div className="video-header">
        <h3 className="video-title">{title}</h3>
        <div className="video-info">
          <div className="info-item">
            <span className="info-label">实验状态：</span>
            <span className={`status-badge ${experimentStatus === '未开始' ? 'status-inactive' : 'status-active'}`}>
              {experimentStatus}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">当前时间：</span>
            <span className="time-display">{currentTime.toLocaleTimeString()}</span>
          </div>
          <div className="source-switch">
            <button 
              className={`switch-button ${videoSource.type === 'rtmp' ? 'active' : ''}`} 
              onClick={switchToRTMP}
            >
              实验直播
            </button>
            <button 
              className={`switch-button ${videoSource.type === 'test' ? 'active' : ''}`} 
              onClick={switchToTestVideo}
            >
              测试视频
            </button>
          </div>
        </div>
      </div>
      <div className="player-container">
        <ReactPlayer
          url={videoSource.url}
          playing={true}
          controls={true}
          width="100%"
          height="100%"
          style={{ backgroundColor: '#1a1a1a' }}
          onReady={() => {
            setIsVideoLoaded(true);
            setExperimentStatus('进行中');
          }}
          onError={(e) => {
            console.error('Video error:', e);
            setIsVideoLoaded(false);
            setExperimentStatus('未开始');
          }}
          config={{
            file: {
              forceVideo: true,
              attributes: {
                crossOrigin: 'anonymous'
              }
            }
          }}
        />
        {!isVideoLoaded && (
          <div className="no-video-message">
            <div className="message-content">
              <span className="message-icon">📹</span>
              <p>当前暂无实验进行</p>
              <p className="sub-message">实验开始后将自动播放视频流</p>
            </div>
          </div>
        )}
        <div className="player-controls">
          <div className="control-info">
            <span className="stream-status">
              {isVideoLoaded ? '🟢 视频流已连接' : '⚪ 等待视频流连接...'}
            </span>
            <span className="source-info">
              {videoSource.type === 'rtmp' ? '（实验直播）' : '（测试视频）'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VRLab; 