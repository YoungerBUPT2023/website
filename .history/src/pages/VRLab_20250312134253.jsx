import React from 'react';
import ReactPlayer from 'react-player';
import './VRLab.css';

function VideoPlayer({ title }) {
  return (
    <div className="video-player">
      <h3 className="video-title">{title}</h3>
      <div className="player-container">
        <ReactPlayer
          url={null} // 暂无视频播放源
          playing={false}
          controls={true}
          width="100%"
          height="100%"
          style={{ backgroundColor: 'black' }}
        />
        <div className="no-video-message">当前暂无实验进行</div>
      </div>
    </div>
  );
}

function VRLab() {
  return (
    <div className="vr-lab">
      <div className="vr-experiment">
        <div className="icon-title">
          <span role="img" aria-label="vr">🔬</span>
          <h2>实验流程监控</h2>
        </div>
        <p>实时观看实验进程</p>
      </div>
      <VideoPlayer title="当前实验：实验名称" />
    </div>
  );
}

export default VRLab; 