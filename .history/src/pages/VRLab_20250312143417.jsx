import React, { useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerContainerRef = React.useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleFullscreen = () => {
    if (screenfull.isEnabled && playerContainerRef.current) {
      screenfull.toggle(playerContainerRef.current);
      setIsFullscreen(!isFullscreen);
    }
  };

  useEffect(() => {
    if (screenfull.isEnabled) {
      screenfull.on('change', () => {
        setIsFullscreen(screenfull.isFullscreen);
      });
    }
    return () => {
      if (screenfull.isEnabled) {
        screenfull.off('change');
      }
    };
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
        </div>
      </div>
      <div className="player-container" ref={playerContainerRef}>
        <ReactPlayer
          url="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4"
          playing={true}
          controls={true}
          width="100%"
          height="100%"
          style={{ backgroundColor: '#1a1a1a' }}
        />
        <div className="no-video-message">
          <div className="message-content">
            <span className="message-icon">📹</span>
            <p>当前暂无实验进行</p>
            <p className="sub-message">实验开始后将自动播放视频流</p>
          </div>
        </div>
        <div className="player-controls">
          <div className="control-info">
            <span className="stream-status">⚪ 等待视频流连接...</span>
          </div>
          <button 
            className="fullscreen-button" 
            onClick={handleFullscreen}
          >
            {isFullscreen ? '退出全屏' : '全屏'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VRLab; 