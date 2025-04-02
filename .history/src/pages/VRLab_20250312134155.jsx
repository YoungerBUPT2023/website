import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, useTexture } from '@react-three/drei';
import ReactPlayer from 'react-player';
import './VRLab.css';

function Box() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial 
        color="#8B4513" // 使用棕色代替木纹纹理
        roughness={0.5} 
        metalness={0.5} 
      />
    </mesh>
  );
}

function Sphere() {
  return (
    <mesh position={[3, 0, 0]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}

function VideoPlayer({ title }) {
  return (
    <div className="video-player">
      <h3>{title}</h3>
      <ReactPlayer
        url={null} // 暂无视频播放源
        playing={false}
        controls={true}
        light={false}
        width="100%"
        height="100%"
        style={{ backgroundColor: 'black' }}
      />
      <div className="no-video">暂无实验进行中</div>
    </div>
  );
}

function VRLab() {
  return (
    <div className="vr-lab">
      <div className="vr-experiment">
        <div className="icon-title">
          <span role="img" aria-label="vr">🥽</span>
          <h2>实验流程监控</h2>
        </div>
        <p>沉浸式体验，直观操作</p>
      </div>
      <VideoPlayer title="当前实验：实验名称" />
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <Stars />
        <Environment preset="sunset" />
        <Box />
        <Sphere /> {/* 添加球体 */}
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default VRLab; 