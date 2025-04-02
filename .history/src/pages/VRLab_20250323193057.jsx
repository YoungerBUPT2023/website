import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/lazy';
// const ReactPlayer = require('react-player/lazy');
import './VRLab.css';

function VRLab() {
  const [experimentTitle, setExperimentTitle] = useState('【天宫课堂第四课】奇妙"乒乓球"实验');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('游客');
  const messagesEndRef = useRef(null);
  const [videoSource, setVideoSource] = useState('bilibili');
  const [bilibiliOfficialUID, setBilibiliOfficialUID] = useState('3546654781213401'); // 中国空间站官方账号UID，可根据需要更改
  const [currentBvid, setCurrentBvid] = useState('BV1N84y1S7rL');  // 当前播放的视频BV号
  const [officialVideos, setOfficialVideos] = useState([]);  // 存储官方账号的视频列表
  const [showVideoList, setShowVideoList] = useState(true);  // 控制视频列表的显示，默认显示
  const [upInfo, setUpInfo] = useState({ name: 'younger', face: '' }); // UP主信息

  useEffect(() => {
    initStarryBackground();
    const checkAdminStatus = () => {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const { username: storedUsername } = JSON.parse(userData);
          // 使用配置文件中定义的管理员用户名进行检查
          setIsAdmin(storedUsername === 'qydycg' || storedUsername === 'aikub');
          setUsername(storedUsername);
        } catch (error) {
          console.error('解析用户数据失败:', error);
          setIsAdmin(false);
        }
      }
    };
    
    checkAdminStatus();
    window.addEventListener('storage', checkAdminStatus);
    
    // 加载一些示例消息
    setMessages([
      { id: 1, username: '张老师', content: '欢迎来到生物实验室观察讨论区', timestamp: new Date().toLocaleTimeString() },
      { id: 2, username: '李同学', content: '请问这个实验的目的是什么？', timestamp: new Date().toLocaleTimeString() },
      { id: 3, username: '张老师', content: '这个实验主要是观察细胞分裂过程，大家注意观察显微镜下的变化', timestamp: new Date().toLocaleTimeString() }
    ]);
    
    // 初始加载视频列表
    fetchUpVideos();
    
    // 获取初始UP主信息
    fetchUpInfo(bilibiliOfficialUID);
    
    return () => {
      window.removeEventListener('storage', checkAdminStatus);
    };
  }, []);

  useEffect(() => {
    // 滚动到最新消息
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 立即滚动到顶部
    window.scrollTo(0, 0);
    
    // 确保body可以滚动
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.height = '';
    document.documentElement.style.height = '';
    
    // 移除可能影响滚动的类
    document.body.classList.remove('no-scroll');
    
    // 添加一个类来确保滚动行为
    document.body.classList.add('can-scroll');
    
    // 使用setTimeout确保在DOM渲染后再次滚动到顶部
    const timer1 = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    
    // 再次尝试滚动到顶部，以防第一次不成功
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

  // 切换视频源，并可以传入指定的UP主ID
  const switchVideoSource = (source, upID = null) => {
    setVideoSource(source);
    if (upID) {
      setBilibiliOfficialUID(upID);
      // 获取新的UP主信息
      fetchUpInfo(upID);
      // 当切换UP主ID时，重置视频列表
      setOfficialVideos([]);
      // 重新获取视频列表
      setTimeout(() => {
        fetchUpVideos();
      }, 100);
    }
  };

  // 获取UP主的信息
  const fetchUpInfo = async (uid) => {
    try {
      // 尝试通过代理API获取UP主信息
      let response = await fetch(`/api/bilibili/user?uid=${uid}`);
      let data = await response.json();
      
      // 如果代理API失败，尝试直接调用B站API
      if (!data.success) {
        console.log('代理API获取UP主信息失败，尝试直接调用B站API');
        response = await fetch(`/bilibili-api/x/space/acc/info?mid=${uid}&jsonp=jsonp`);
        const biliData = await response.json();
        
        if (biliData && biliData.code === 0) {
          data = {
            success: true,
            data: {
              name: biliData.data.name,
              face: biliData.data.face
            }
          };
        }
      }
      
      if (data.success && data.data) {
        setUpInfo({
          name: data.data.name || `UP主(${uid})`,
          face: data.data.face || ''
        });
      } else {
        // 如果API调用失败，回退到模拟数据
        if (uid === '3546654781213401') {
          setUpInfo({
            name: 'younger',
            face: 'https://i1.hdslb.com/bfs/face/6323d69d0bfa21894fc3ff2adc2c84a7be16de76.jpg'
          });
        } else {
          setUpInfo({
            name: `UP主(${uid})`,
            face: ''
          });
        }
      }
    } catch (error) {
      console.error('获取UP主信息失败:', error);
      // 错误处理，使用默认数据
      setUpInfo({
        name: `UP主(${uid})`,
        face: ''
      });
    }
  };

  // 获取UP主的视频列表
  const fetchUpVideos = async () => {
    try {
      // 尝试通过代理API获取视频列表
      let response = await fetch(`/api/bilibili/videos?uid=${bilibiliOfficialUID}&page=1&pageSize=20`);
      let data = await response.json();
      
      // 如果代理API失败，尝试直接调用B站API
      if (!data.success) {
        console.log('代理API获取视频列表失败，尝试直接调用B站API');
        response = await fetch(`/bilibili-api/x/space/arc/search?mid=${bilibiliOfficialUID}&ps=20&pn=1&order=pubdate&jsonp=jsonp`);
        const biliData = await response.json();
        
        if (biliData && biliData.code === 0) {
          const videoList = biliData.data.list?.vlist || [];
          data = {
            success: true,
            data: {
              list: videoList.map(video => ({
                bvid: video.bvid,
                title: video.title,
                cover: video.pic || ''
              }))
            }
          };
        }
      }
      
      if (data.success && data.data && data.data.list) {
        // 格式化API返回的数据
        const videos = data.data.list.map(video => ({
          bvid: video.bvid,
          title: video.title,
          cover: video.pic || video.cover || ''
        }));
        
        setOfficialVideos(videos);
      } else {
        // API调用失败，使用模拟数据
        loadMockData();
      }
    } catch (error) {
      console.error('获取视频列表失败:', error);
      // 错误处理，使用模拟数据
      loadMockData();
    }
    
    setShowVideoList(true); // 确保视频列表始终显示
  };
  
  // 使用模拟数据的函数
  const loadMockData = () => {
    // younger UP主的视频 (UID: 3546654781213401)
    if (bilibiliOfficialUID === '3546654781213401') {
      const youngersVideos = [
        { 
          bvid: 'BV1N84y1S7rL', 
          title: '【天宫课堂第四课】奇妙"乒乓球"实验',
          cover: 'https://i0.hdslb.com/bfs/archive/33c9a66c0a3903a3677797fd8e0c0f56693c8f05.jpg' 
        },
        { 
          bvid: 'BV1BH4y1U7vF', 
          title: '【天宫课堂第四课】球形火焰实验',
          cover: 'https://i0.hdslb.com/bfs/archive/92a743e28fae7144262f3c7aa7c4b626572d7d8e.jpg' 
        },
        { 
          bvid: 'BV1eLXkY7EwE', 
          title: '【电磁场与电磁波】纯板书讲解 适配北邮信通院要求 younger',
          cover: 'https://i0.hdslb.com/bfs/archive/7fed439267967e6009d7f3d0c6dc259f9bf1f059.jpg' 
        },
        { 
          bvid: 'BV1dT41127p5', 
          title: '【编译原理】期末划重点 北邮计算机学院要求',
          cover: 'https://i0.hdslb.com/bfs/archive/2f8c3d54da72a445ed19e145a05b25ad3c0777f2.jpg'
        },
        { 
          bvid: 'BV1Kc41177GR', 
          title: '【2022北邮考研】计算机专业课真题解析 补充完整',
          cover: 'https://i0.hdslb.com/bfs/archive/ba29d7aef34ee3bd01fb1d01bb26dc3a6c41014e.jpg' 
        },
        { 
          bvid: 'BV1m54y1Q7eG', 
          title: '【数据结构与算法】预习指南 考研复试/专业课/期末',
          cover: 'https://i0.hdslb.com/bfs/archive/e4d89a72f0f77a279e38afc13e4caf3ac4e70163.jpg'
        }
      ];
      setOfficialVideos(youngersVideos);
    } else {
      // 默认视频列表，这里可以根据UID加载不同内容
      const defaultVideos = [
        { 
          bvid: 'BV1N84y1S7rL', 
          title: '【天宫课堂第四课】奇妙"乒乓球"实验',
          cover: 'https://i0.hdslb.com/bfs/archive/33c9a66c0a3903a3677797fd8e0c0f56693c8f05.jpg' 
        },
        { 
          bvid: 'BV1BH4y1U7vF', 
          title: '【天宫课堂第四课】球形火焰实验',
          cover: 'https://i0.hdslb.com/bfs/archive/92a743e28fae7144262f3c7aa7c4b626572d7d8e.jpg' 
        },
        { 
          bvid: 'BV1eLXkY7EwE', 
          title: '【电磁场与电磁波】纯板书讲解 适配北邮信通院要求 younger',
          cover: 'https://i0.hdslb.com/bfs/archive/7fed439267967e6009d7f3d0c6dc259f9bf1f059.jpg' 
        }
      ];
      setOfficialVideos(defaultVideos);
    }
  };

  // 播放选中的视频
  const playSelectedVideo = (bvid, title) => {
    setCurrentBvid(bvid);
    setExperimentTitle(title);
    // 如果当前不是B站播放器，切换到B站播放器
    if (videoSource !== 'bilibili') {
      setVideoSource('bilibili');
    }
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
                  onClick={() => switchVideoSource('bilibili', bilibiliOfficialUID)}
                >
                  测试视频
                </button>
              </div>
            </div>
          </div>
          
          {/* React Player 视频播放器 */}
          {videoSource === 'reactplayer' && (
            <div className="player-container">
              <div style={{ width: '100%', height: '400px', position: 'relative' }}>
                <ReactPlayer
                  className="react-player"
                  url="/videos/天宫课堂第四课——奇妙乒乓球实验.mp4"
                  playing={true}
                  controls={true}
                  width="100%"
                  height="100%"
                  style={{ backgroundColor: '#1a1a1a' }}
                  playsinline={true}
                  light={false}
                  pip={true}
                  volume={0.8}
                  muted={false}
                  config={{
                    file: {
                      attributes: {
                        style: {
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }
                      },
                      forceVideo: true
                    }
                  }}
                  onError={(e) => console.error('视频加载错误:', e)}
                />
              </div>
              <div className="player-controls">
                <div className="control-info">
                  <span className="stream-status">🟢 实验直播中</span>
                  <span className="source-info">(天宫课堂第四课——奇妙"乒乓球"实验)</span>
                </div>
              </div>
            </div>
          )}

          {/* B站官方嵌入播放器 */}
          {videoSource === 'bilibili' && (
            <div className="player-container">
              <div style={{ width: '100%', height: '400px', position: 'relative' }}>
                <iframe 
                  src={`//player.bilibili.com/player.html?bvid=${currentBvid}&page=1&high_quality=1&danmaku=0&t=0&as_wide=1&autoplay=1&showinfo=0&noEndPanel=1`}
                  scrolling="no" 
                  border="0" 
                  frameBorder="no" 
                  framespacing="0" 
                  allowFullScreen={true}
                  style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                ></iframe>
              </div>
              <div className="player-controls">
                <div className="control-info">
                  <span className="stream-status">🟢 B站官方播放器</span>
                  <span className="source-info">
                    {bilibiliOfficialUID === '3546654781213401' 
                      ? '(天宫课堂第四课 - 奇妙"乒乓球"实验)' 
                      : `(B站UP主视频 - UID:${bilibiliOfficialUID})`}
                  </span>
                </div>
                {isAdmin && (
                  <div className="admin-controls">
                    <input
                      type="text"
                      value={bilibiliOfficialUID}
                      onChange={(e) => setBilibiliOfficialUID(e.target.value)}
                      placeholder="输入B站官方账号UID"
                      className="uid-input"
                    />
                    <button 
                      onClick={() => switchVideoSource('bilibili', bilibiliOfficialUID)} 
                      className="apply-button"
                    >
                      应用
                    </button>
                    <button 
                      onClick={fetchUpVideos} 
                      className="fetch-videos-button"
                    >
                      {showVideoList ? '隐藏视频' : '显示视频列表'}
                    </button>
                  </div>
                )}
              </div>
              
              {/* 视频列表 - 移至播放器下方 */}
              {showVideoList && (
                <div className="video-list-container">
                  {/* UP主信息卡片 */}
                  <div className="up-info-card">
                    <div className="up-avatar">
                      {upInfo.face ? (
                        <img src={upInfo.face} alt={upInfo.name} />
                      ) : (
                        <div className="default-avatar">{upInfo.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="up-details">
                      <div className="up-name">{upInfo.name}</div>
                      <div className="up-uid">UID: {bilibiliOfficialUID}</div>
                    </div>
                  </div>
                  
                  <h4>
                    {bilibiliOfficialUID === '3546654781213401' 
                      ? 'younger的视频课程列表'
                      : `UP主视频列表`}
                  </h4>
                  <div className="video-grid">
                    {officialVideos.map((video) => (
                      <div 
                        key={video.bvid} 
                        className={`video-grid-item ${video.bvid === currentBvid ? 'active' : ''}`}
                        onClick={() => playSelectedVideo(video.bvid, video.title)}
                      >
                        <div className="video-thumbnail">
                          <img src={video.cover || 'https://i0.hdslb.com/bfs/archive/7fed439267967e6009d7f3d0c6dc259f9bf1f059.jpg'} alt={video.title} />
                          {video.bvid === currentBvid && <div className="now-playing">正在播放</div>}
                        </div>
                        <div className="video-details">
                          <div className="video-grid-title">{video.title}</div>
                          <div className="video-grid-id">BV: {video.bvid}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 讨论区 */}
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
      // 这里替换成你的 RTMP 服务器地址
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