import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, useTexture } from '@react-three/drei';
import './VRLab.css';

function Box() {
  const [texture] = useTexture(['/textures/wood.jpg']); // 确保你有这个纹理文件

  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial 
        map={texture} // 使用纹理
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