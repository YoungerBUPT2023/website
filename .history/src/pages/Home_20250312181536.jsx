import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';
import * as THREE from 'three';

function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  useEffect(() => {
    // 创建场景
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 添加立方体
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    // 动画循环
    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    animate();

    // 清理函数
    return () => {
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="home">
      <div className="hero-section">
        <div className="stars-container">
          {[...Array(200)].map((_, i) => (
            <div key={i} className="star" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }} />
          ))}
        </div>
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-title"
        >
          <span className="calligraphy-hero-text">问天</span>
          <span className="normal-hero-text">太空教育试验平台</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="hero-subtitle"
        >
          探索宇宙的奥秘，体验科技的魅力
        </motion.p>
        <div className="hero-circles">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`hero-circle circle-${i + 1}`} />
          ))}
        </div>
      </div>

      <motion.div 
        className="features-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[
          { icon: "📋", title: "实验设计评估", desc: "设计实验流程，智能评估可行性", path: "/lab", color: "#4facfe" },
          { icon: "🥽", title: "实验流程监控", desc: "沉浸式体验，直观操作实验设备", path: "/vr-lab", color: "#00f2fe" },
          { icon: "🏆", title: "作品展", desc: "优秀实验作品展示与分享", path: "/gallery", color: "#0061ff" },
          { icon: "💻", title: "代码生成", desc: "智能分析实验流程，自动生成代码", path: "/space-view", color: "#60efff" }
        ].map((feature, index) => (
          <motion.div 
            key={index}
            className="feature-card"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              boxShadow: `0 0 20px ${feature.color}40`
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to={feature.path}>
              <div className="feature-content">
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-icon-glow" style={{ background: feature.color }} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
                <motion.div 
                  className="feature-arrow"
                  whileHover={{ x: 5 }}
                >
                  →
                </motion.div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <footer className="footer">
        <div className="footer-content">
          <p>联系方式: example@example.com</p>
          <p>工作单位: 太空教育实验室</p>
          <p>开发者: 张三</p>
          <p>GitHub: <a href="https://github.com/your-github">github.com/your-github</a></p>
        </div>
      </footer>
    </div>
  );
}

export default Home; 