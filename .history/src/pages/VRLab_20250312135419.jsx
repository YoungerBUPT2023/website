import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import './VRLab.css';

function VideoPlayer({ title }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [experimentStatus, setExperimentStatus] = useState('未开始');

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
        </div>
      </div>
      <div className="player-container">
        <div className="player-frame">
          <ReactPlayer
            url={null}
            playing={false}
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
        </div>
        <div className="player-controls">
          <div className="control-info">
            <span className="stream-status">⚪ 等待视频流连接...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VRLab() {
  return (
    <div className="vr-lab">
      <VideoPlayer title="当前实验：生物实验室观察" />
    </div>
  );
}

export default VRLab; 