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
  const [currentTime, setCurrentTime] = useState(new Date());
  const messagesEndRef = useRef(null);
  const [videoSource, setVideoSource] = useState('reactplayer');
  const [showCoursesList, setShowCoursesList] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [activePanel, setActivePanel] = useState('discussion');
  const [currentExperimentStep, setCurrentExperimentStep] = useState(0);
  const coursesList = [
    { 
      id: 1, 
      title: '天宫课堂球形火焰实验', 
      source: 'local',
      videoPath: '/videos/天宫课堂，球形火焰实验 - 001 - 天宫课堂，球形火焰实验.mp4',
      description: '本视频展示了在太空中进行的球形火焰实验，展示了微重力环境下的燃烧特性。'
    },
    { 
      id: 2, 
      title: '天宫课堂第四课-动量守恒实验', 
      source: 'local',
      videoPath: '/videos/【天宫课堂第四课】动量守恒实验 - 001 - 【天宫课堂第四课】动量守恒实验.mp4',
      description: '在太空环境中展示动量守恒定律，通过实验观察微重力环境下的物理定律表现。'
    },
    { 
      id: 3, 
      title: '天宫课堂第四课-又见陀螺实验', 
      source: 'local',
      videoPath: '/videos/【天宫课堂第四课】又见陀螺实验 - 001 - 【天宫课堂第四课】又见陀螺实验.mp4',
      description: '展示太空中陀螺的运动特性，观察微重力环境下角动量守恒的现象。'
    },
    { 
      id: 4, 
      title: '天宫课堂第四课-奇妙"乒乓球"实验', 
      source: 'local',
      videoPath: '/videos/【天宫课堂第四课】奇妙"乒乓球"实验 - 001 - 【天宫课堂第四课】奇妙"乒乓球"实验.mp4',
      description: '通过太空中的"乒乓球"实验，展示微重力环境中液体表面张力的独特表现。'
    },
  ];
  
  const coursesListRef = useRef(null);

  // 添加实验流程数据
  const experimentSteps = [
    {
      id: 1,
      title: '实验准备',
      time: 0,
      description: '准备实验器材，检查安全措施',
      details: [
        '检查实验舱环境',
        '确认实验设备状态',
        '准备燃烧物质'
      ]
    },
    {
      id: 2,
      title: '点火阶段',
      time: 30,
      description: '开始点火，观察初始火焰形态',
      details: [
        '使用专用点火装置',
        '控制点火强度',
        '记录初始火焰状态'
      ]
    },
    {
      id: 3,
      title: '稳定燃烧',
      time: 60,
      description: '观察球形火焰的稳定燃烧过程',
      details: [
        '记录火焰形状变化',
        '观察燃烧稳定性',
        '测量火焰直径'
      ]
    },
    {
      id: 4,
      title: '数据采集',
      time: 90,
      description: '记录实验数据和现象',
      details: [
        '采集温度数据',
        '记录燃烧时间',
        '拍摄火焰图像'
      ]
    },
    {
      id: 5,
      title: '实验结束',
      time: 120,
      description: '关闭火源，记录实验结果',
      details: [
        '安全熄灭火焰',
        '保存实验数据',
        '记录实验结论'
      ]
    }
  ];

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
    
    // 添加B站播放器消息监听
    const handleVideoMessage = (event) => {
      if (event.data.type === 'progress') {
        const currentTime = event.data.data;
        // 根据当前播放时间更新实验步骤
        const currentStep = experimentSteps.findIndex(
          (step, index) => {
            const nextStep = experimentSteps[index + 1];
            return currentTime >= step.time && (!nextStep || currentTime < nextStep.time);
          }
        );
        if (currentStep !== -1 && currentStep !== currentExperimentStep) {
          setCurrentExperimentStep(currentStep);
        }
      }
    };
    
    window.addEventListener('message', handleVideoMessage);
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
    
    // 重置页面位置
    window.scrollTo(0, 0);
    document.body.style.overflow = 'auto';
    
    return () => {
      window.removeEventListener('storage', checkAdminStatus);
      window.removeEventListener('message', handleVideoMessage);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // 添加更新时间的效果
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 格式化时间的函数
  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 监听视频播放进度
  const handleProgress = (progress) => {
    const currentTime = progress.playedSeconds;
    // 根据当前播放时间更新实验步骤
    const currentStep = experimentSteps.findIndex(
      (step, index) => {
        const nextStep = experimentSteps[index + 1];
        return currentTime >= step.time && (!nextStep || currentTime < nextStep.time);
      }
    );
    if (currentStep !== -1 && currentStep !== currentExperimentStep) {
      setCurrentExperimentStep(currentStep);
    }
  };

  return (
    <div className="vr-lab-page">
      <div className="experiment-lab">
        <canvas id="starry-bg" className="starry-background"></canvas>
        <div className="lab-container">
          <VideoPlayer
            title={experimentTitle}
            selectedCourse={selectedCourse}
            onSelectCourse={handleSelectCourse}
            coursesList={coursesList}
          />
          <div className="discussion-panel">
            <div className="panel-header">
              <div className="panel-tabs">
                <button 
                  className={`panel-tab ${activePanel === 'discussion' ? 'active' : ''}`}
                  onClick={() => setActivePanel('discussion')}
                >
                  实时讨论
                </button>
                <button 
                  className={`panel-tab ${activePanel === 'focus' ? 'active' : ''}`}
                  onClick={() => setActivePanel('focus')}
                >
                  聚焦实验
                </button>
              </div>
            </div>
            
            {activePanel === 'discussion' ? (
              <>
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
              </>
            ) : (
              <div className="focus-experiment-container">
                <div className="experiment-details">
                  <div className="detail-item">
                    <h4>流程导航</h4>
                    <div className="experiment-timeline">
                      {experimentSteps.map((step, index) => (
                        <div 
                          key={step.id}
                          className={`timeline-step ${index === currentExperimentStep ? 'current' : ''} ${index < currentExperimentStep ? 'completed' : ''}`}
                        >
                          <div className="step-indicator">
                            {index < currentExperimentStep ? (
                              <span className="step-check">✓</span>
                            ) : index === currentExperimentStep ? (
                              <span className="step-current">•</span>
                            ) : (
                              <span className="step-number">{index + 1}</span>
                            )}
                          </div>
                          <div className="step-content">
                            <h5 className="step-title">{step.title}</h5>
                            <p className="step-description">{step.description}</p>
                            {index === currentExperimentStep && (
                              <ul className="step-details">
                                {step.details.map((detail, i) => (
                                  <li key={i}>{detail}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="experiment-points">
                    <h3>实验要点</h3>
                    <div className="detail-item">
                      <h4>实验目的</h4>
                      <p>观察微重力环境下的球形火焰燃烧特性，研究燃烧过程中的物理化学变化。</p>
                    </div>
                    <div className="detail-item">
                      <h4>实验原理</h4>
                      <p>在微重力环境下，由于浮力对流的消失，火焰呈现球形分布，更有利于研究燃烧的本质特征。</p>
                    </div>
                    <div className="detail-item">
                      <h4>观察重点</h4>
                      <ul>
                        <li>火焰的形状变化</li>
                        <li>燃烧的稳定性</li>
                        <li>火焰颜色的分布</li>
                        <li>燃烧速率的变化</li>
                      </ul>
                    </div>
                    <div className="detail-item">
                      <h4>实验意义</h4>
                      <p>通过研究微重力环境下的燃烧现象，可以更好地理解燃烧过程中的基本物理化学规律，为地面燃烧研究提供重要参考。</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoPlayer({ title, selectedCourse, onSelectCourse, coursesList }) {
  const videoRef = useRef(null);
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0);
  const [isPlaylistExpanded, setIsPlaylistExpanded] = useState(false);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      window.postMessage({
        type: 'progress',
        data: currentTime
      }, '*');
    }
  };

  const handleCourseSelect = (index) => {
    setCurrentCourseIndex(index);
    const course = coursesList[index];
    if (course) {
      onSelectCourse(course);
      setIsPlaylistExpanded(false);
    }
  };

  const togglePlaylist = () => {
    setIsPlaylistExpanded(!isPlaylistExpanded);
  };

  return (
    <div className="video-player">
      <div className="video-header">
        <h2 className="video-title">{title}</h2>
        <div className="video-info">
          <div className="info-item playlist-wrapper">
            <div className="playlist-trigger" onClick={togglePlaylist}>
              <span className="info-label">选集列表</span>
              <span className="playlist-current">{selectedCourse?.title}</span>
              <span className={`playlist-toggle ${isPlaylistExpanded ? 'expanded' : ''}`}>▼</span>
            </div>
            {isPlaylistExpanded && (
              <div className="playlist-dropdown">
                {coursesList.map((course, index) => (
                  <div
                    key={course.id}
                    className={`playlist-item ${selectedCourse?.id === course.id ? 'active' : ''}`}
                    onClick={() => handleCourseSelect(index)}
                  >
                    <div className="playlist-item-number">{index + 1}</div>
                    <div className="playlist-item-info">
                      <div className="playlist-item-title">{course.title}</div>
                      <div className="playlist-item-duration">45:00</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="info-item">
            <span className="info-label">实验状态:</span>
            <span className="status-badge status-active">进行中</span>
          </div>
          <div className="info-item">
            <span className="info-label">实验时长:</span>
            <span className="time-display">45:00</span>
          </div>
        </div>
      </div>
      <div className="player-container">
        {selectedCourse && (
          <video
            ref={videoRef}
            className="local-video-player"
            controls
            onTimeUpdate={handleTimeUpdate}
            playsInline
          >
            <source src={selectedCourse.videoPath} type="video/mp4" />
            您的浏览器不支持视频播放。
          </video>
        )}
      </div>
      <div className="video-description">
        {selectedCourse?.description}
      </div>
    </div>
  );
}

export default VRLab; 