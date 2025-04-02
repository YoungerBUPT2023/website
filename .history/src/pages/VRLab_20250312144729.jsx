import React, { useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player/lazy';
import flvjs from 'flv.js';
import screenfull from 'screenfull';
import './VRLab.css';

function VRLab() {
  useEffect(() => {
    initStarryBackground();
  }, []);

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

  return (
    <div className="experiment-lab">
      <canvas id="starry-bg" className="starry-background"></canvas>
      <div className="lab-container">
        <VideoPlayer title="当前实验：生物实验室观察" />
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
  const playerContainerRef = React.useRef(null);
  const flvPlayerRef = React.useRef(null);

  const switchToBiliLive = () => {
    // 这里替换成实际的B站直播房间号
    const roomId = '23728714'; // 示例房间号
    setVideoSource({
      type: 'bilibili',
      url: `https://live-play.bilibili.com/live-bvc/${roomId}.flv`
    });
  };

  const switchToTestVideo = () => {
    // 销毁之前的 flv 播放器实例
    if (flvPlayerRef.current) {
      flvPlayerRef.current.destroy();
      flvPlayerRef.current = null;
    }
    setVideoSource({
      type: 'test',
      url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4'
    });
  };

  // 创建 FLV 播放器
  const createFlvPlayer = useCallback(() => {
    if (videoSource.type === 'bilibili' && flvjs.isSupported()) {
      // 确保之前的实例被销毁
      if (flvPlayerRef.current) {
        flvPlayerRef.current.destroy();
        flvPlayerRef.current = null;
      }

      try {
        flvPlayerRef.current = flvjs.createPlayer({
          type: 'flv',
          url: videoSource.url
        });
        
        if (playerContainerRef.current) {
          flvPlayerRef.current.attachMediaElement(playerContainerRef.current);
          flvPlayerRef.current.load();
        }
      } catch (error) {
        console.error('创建 FLV 播放器失败:', error);
        setIsVideoLoaded(false);
        setExperimentStatus('未开始');
      }
    }
  }, [videoSource]);

  // 处理视频源变化
  useEffect(() => {
    createFlvPlayer();
    return () => {
      if (flvPlayerRef.current) {
        try {
          flvPlayerRef.current.destroy();
        } catch (error) {
          console.error('销毁 FLV 播放器失败:', error);
        }
        flvPlayerRef.current = null;
      }
    };
  }, [videoSource, createFlvPlayer]);

  // 处理组件卸载
  useEffect(() => {
    return () => {
      if (flvPlayerRef.current) {
        try {
          flvPlayerRef.current.destroy();
        } catch (error) {
          console.error('组件卸载时销毁 FLV 播放器失败:', error);
        }
        flvPlayerRef.current = null;
      }
    };
  }, []);

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
              className={`switch-button ${videoSource.type === 'bilibili' ? 'active' : ''}`} 
              onClick={switchToBiliLive}
            >
              B站直播
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
        {videoSource.type === 'test' ? (
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
          />
        ) : (
          <video
            ref={playerContainerRef}
            style={{ width: '100%', height: '100%' }}
            controls
          />
        )}
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
              {videoSource.type === 'bilibili' ? '（B站直播）' : '（测试视频）'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VRLab; 