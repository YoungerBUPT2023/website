import React, { useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, useGLTF } from '@react-three/drei';
import './Home.css';

function Earth() {
  const { nodes, materials } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/low-poly-earth/model.gltf');
  return (
    <group rotation={[0, 0, 0]} scale={2}>
      <mesh geometry={nodes.Sphere.geometry} material={materials['Material.001']} />
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Earth />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

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

  return (
    <div className="home">
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: -1 }}>
        <Canvas camera={{ position: [0, 0, 8] }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
      <div className="hero-section">
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