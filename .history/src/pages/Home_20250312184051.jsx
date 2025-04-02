import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import { BackSide, AdditiveBlending } from 'three';
import './Home.css';

function Earth({ scrollY }) {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const atmosphereRef = useRef();
  const groupRef = useRef();
  
  const [colorMap, normalMap, cloudsMap] = useTexture([
    '/earth/color.jpg',
    '/earth/normal.jpg',
    '/earth/clouds.jpg'
  ]);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    
    // 地球自转
    if (earthRef.current) {
      earthRef.current.rotation.y = elapsedTime * 0.05;
    }
    
    // 云层自转（稍快一些）
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = elapsedTime * 0.06;
    }

    // 大气层光晕效果
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = elapsedTime * 0.05;
    }

    // 根据滚动位置调整地球组的位置和旋转
    if (groupRef.current) {
      groupRef.current.position.y = scrollY * 0.005;
      groupRef.current.position.x = Math.sin(scrollY * 0.002) * 2;
      groupRef.current.rotation.x = scrollY * 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 地球本体 */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          map={colorMap}
          normalMap={normalMap}
          normalScale={[0.05, 0.05]}
          shininess={5}
        />
      </mesh>

      {/* 云层 */}
      <mesh ref={cloudsRef} scale={1.003}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          map={cloudsMap}
          transparent={true}
          opacity={0.4}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* 大气层 */}
      <mesh ref={atmosphereRef} scale={1.15}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          color="#4287f5"
          transparent={true}
          opacity={0.1}
          side={BackSide}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* 大气层光晕 */}
      <mesh scale={1.25}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          color="#93c5fd"
          transparent={true}
          opacity={0.05}
          side={BackSide}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function Scene({ scrollY }) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[100, 10, 10]} intensity={0.8} />
      <pointLight position={[-100, -10, -10]} intensity={0.3} color="#93c5fd" />
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
      <Earth scrollY={scrollY} />
      <OrbitControls 
        enableZoom={false} 
        enableRotate={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 1.5}
      />
    </>
  );
}

function Home() {
  const { scrollY } = useScroll();
  const [scrollValue, setScrollValue] = useState(0);

  // 监听滚动位置
  useEffect(() => {
    const unsubscribe = scrollY.onChange(setScrollValue);
    return () => unsubscribe();
  }, [scrollY]);

  // 根据滚动位置计算动画值
  const y = useTransform(scrollY, [0, 1000], [0, -200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

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
        <Canvas 
          camera={{ position: [0, 0, 8], fov: 45 }}
          style={{ background: 'radial-gradient(circle at center, #000235 0%, #000000 100%)' }}
        >
          <Suspense fallback={null}>
            <Scene scrollY={scrollValue} />
          </Suspense>
        </Canvas>
      </div>

      <motion.div 
        className="hero-section" 
        style={{ 
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white',
          textShadow: '0 0 20px rgba(255,255,255,0.3)',
          mixBlendMode: 'difference',
          zIndex: 1
        }}
      >
        <motion.h1 
          style={{ 
            fontSize: '6rem',
            marginBottom: '1rem',
            y,
            opacity,
            scale
          }}
        >
          问天
        </motion.h1>
        <motion.p
          style={{ 
            fontSize: '1.5rem',
            opacity,
            y: useTransform(scrollY, [0, 300], [0, -100])
          }}
        >
          太空教育试验平台
        </motion.p>
      </motion.div>

      <div style={{ height: '100vh' }} /> {/* 空白区域用于滚动 */}

      <motion.div 
        className="features-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ 
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          padding: '2rem',
          borderRadius: '20px',
          margin: '2rem',
          position: 'relative',
          zIndex: 2
        }}
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
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(5px)'
            }}
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

      <footer className="footer" style={{ 
        background: 'rgba(0,0,0,0.3)', 
        backdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 2
      }}>
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