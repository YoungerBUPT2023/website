import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { WebGLRenderer } from 'three';

const ExperimentCanvas = () => {
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [renderer, setRenderer] = useState(null);

  // 检查 WebGL 支持的函数
  const isWebGLAvailable = () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    // 检查 WebGL 支持
    if (!isWebGLAvailable()) {
      setError('您的浏览器不支持 WebGL，无法运行此实验。请尝试使用最新版本的 Chrome 或 Firefox。');
      return;
    }

    try {
      // 创建场景
      const scene = new THREE.Scene();
      
      // 创建相机
      const camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
      );
      camera.position.z = 5;
      
      // 尝试创建渲染器，添加错误处理
      let rendererInstance;
      try {
        rendererInstance = new WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          alpha: true,
          powerPreference: 'default' // 尝试使用默认性能设置
        });
        rendererInstance.setSize(window.innerWidth, window.innerHeight);
        rendererInstance.setPixelRatio(window.devicePixelRatio);
        setRenderer(rendererInstance);
      } catch (err) {
        console.error('WebGL 渲染器创建失败:', err);
        setError('创建 WebGL 上下文失败。请检查您的浏览器设置或尝试使用其他浏览器。');
        return;
      }
      
      // 添加一些基本的 3D 对象
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      
      // 动画循环
      const animate = () => {
        if (!rendererInstance) return;
        
        requestAnimationFrame(animate);
        
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        
        rendererInstance.render(scene, camera);
      };
      
      animate();
      
      // 处理窗口大小变化
      const handleResize = () => {
        if (!rendererInstance) return;
        
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        rendererInstance.setSize(window.innerWidth, window.innerHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      // 清理函数
      return () => {
        window.removeEventListener('resize', handleResize);
        if (rendererInstance) {
          rendererInstance.dispose();
        }
        // 清理其他 Three.js 资源
        geometry.dispose();
        material.dispose();
      };
    } catch (err) {
      console.error('实验初始化失败:', err);
      setError('实验初始化失败。请刷新页面重试。');
    }
  }, []);

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className="webgl-error">
        <h3>WebGL 错误</h3>
        <p>{error}</p>
        <div className="error-suggestions">
          <h4>可能的解决方案:</h4>
          <ul>
            <li>更新您的显卡驱动程序</li>
            <li>在浏览器设置中启用硬件加速</li>
            <li>尝试使用其他浏览器，如 Chrome 或 Firefox 的最新版本</li>
            <li>检查您的设备是否支持 WebGL</li>
          </ul>
        </div>
      </div>
    );
  }

  return <canvas ref={canvasRef} className="experiment-canvas" />;
};

export default ExperimentCanvas; 