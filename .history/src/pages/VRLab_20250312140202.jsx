import React, { useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { Particles } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import './VRLab.css';

function ParticlesBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      className="particles-bg"
      init={particlesInit}
      options={{
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 120,
        particles: {
          color: {
            value: "#4a90e2",
          },
          links: {
            color: "#4a90e2",
            distance: 150,
            enable: true,
            opacity: 0.2,
            width: 1,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: 1,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 60,
          },
          opacity: {
            value: 0.2,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 3 },
          },
        },
        detectRetina: true,
      }}
    />
  );
}

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
      <ParticlesBackground />
      <VideoPlayer title="当前实验：生物实验室观察" />
    </div>
  );
}

export default VRLab; 