import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
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
      const scrollProgress = Math.min(scrollY / 1000, 1);
      
      // 初始位置在底部，只露出地平线，随滚动移动到右上方
      groupRef.current.position.x = -2 + scrollProgress * 6; // 从左向右移动
      groupRef.current.position.y = -5 + scrollProgress * 9; // 从下向上移动，初始位置更低
      
      // 缩放效果 - 随滚动逐渐缩小
      const scale = 2.5 - scrollProgress * 0.8;
      groupRef.current.scale.set(scale, scale, scale);
      
      // 旋转效果 - 随滚动稍微调整角度
      groupRef.current.rotation.x = scrollProgress * Math.PI * 0.15;
      groupRef.current.rotation.z = scrollProgress * Math.PI * 0.08;
    }
  });

  return (
    <group ref={groupRef} scale={2.5}>
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
        enabled={false}
      />
    </>
  );
}

function FeatureCard({ icon, title, desc, path, color, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="feature-card"
    >
      <Link to={path} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="feature-content">
          <div className="feature-icon-wrapper">
            <div className="feature-icon">{icon}</div>
            <div className="feature-icon-glow" style={{ background: color }} />
          </div>
          <h3>{title}</h3>
          <p>{desc}</p>
        </div>
      </Link>
    </motion.div>
  );
}

function Home() {
  const { scrollY } = useScroll();
  const [scrollValue, setScrollValue] = useState(0);
  const featuresRef = useRef(null);
  const isInView = useInView(featuresRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const unsubscribe = scrollY.onChange(setScrollValue);
    return () => unsubscribe();
  }, [scrollY]);

  const y = useTransform(scrollY, [0, 800], [0, 300]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);
  const scale = useTransform(scrollY, [0, 600], [1, 1.2]);
  const xPos = useTransform(scrollY, [0, 600], [0, 200]);
  const blur = useTransform(scrollY, [0, 600], [0, 10]);

  const features = [
    { icon: "📋", title: "实验设计评估", desc: "设计实验流程，智能评估可行性", path: "/lab", color: "#4facfe" },
    { icon: "🥽", title: "实验流程监控", desc: "沉浸式体验，直观操作实验设备", path: "/vr-lab", color: "#00f2fe" },
    { icon: "🏆", title: "作品展", desc: "优秀实验作品展示与分享", path: "/gallery", color: "#0061ff" },
    { icon: "💻", title: "代码生成", desc: "智能分析实验流程，自动生成代码", path: "/space-view", color: "#60efff" }
  ];

  return (
    <div className="home">
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh' }}>
        <Canvas 
          camera={{ position: [0, 0, 8], fov: 45 }}
          style={{ 
            background: 'radial-gradient(circle at center, #000235 0%, #000000 100%)',
          }}
        >
          <Suspense fallback={null}>
            <Scene scrollY={scrollValue} />
          </Suspense>
        </Canvas>
      </div>

      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2 }}
        style={{ 
          position: 'fixed',
          top: '28%',
          right: '25%',
          zIndex: 1,
          pointerEvents: 'none',
          width: 'auto',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end'
        }}
      >
        <motion.p
          style={{
            x: xPos,
            y: useTransform(scrollY, [0, 400], [0, 50]),
            opacity: useTransform(scrollY, [0, 400], [0.9, 0]),
            color: 'rgba(255,255,255,0.7)',
            fontSize: '1.2rem',
            fontWeight: '200',
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            marginBottom: '1.2rem',
            fontFamily: "'Montserrat', sans-serif",
            filter: useTransform(scrollY, [0, 400], ['blur(0px)', 'blur(5px)']),
            textAlign: 'right'
          }}
        >
          Space Education Lab
        </motion.p>
        <motion.h1 
          style={{ 
            x: xPos,
            y,
            scale,
            opacity,
            color: '#fff',
            fontSize: '9rem',
            fontWeight: '500',
            margin: 0,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            fontFamily: "'Noto Serif SC', serif",
            filter: useTransform(scrollY, [0, 600], ['blur(0px)', 'blur(10px)']),
            textShadow: '0 0 60px rgba(255,255,255,0.15), 0 0 20px rgba(255,255,255,0.1)',
            background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.1em'
          }}
        >
          问天
        </motion.h1>
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.2rem',
            marginTop: '2rem'
          }}
        >
          <motion.span
            style={{
              width: '40px',
              height: '1px',
              background: 'rgba(255,255,255,0.3)',
              display: 'block',
              transformOrigin: 'right',
              scale: useTransform(scrollY, [0, 400], [1, 0])
            }}
          />
          <motion.p
            style={{ 
              x: xPos,
              opacity: useTransform(scrollY, [0, 400], [0.8, 0]),
              y: useTransform(scrollY, [0, 400], [0, 100]),
              color: 'rgba(255,255,255,0.7)',
              fontSize: '1.4rem',
              fontWeight: '300',
              whiteSpace: 'nowrap',
              fontFamily: "'Noto Sans SC', sans-serif",
              filter: useTransform(scrollY, [0, 400], ['blur(0px)', 'blur(5px)']),
              letterSpacing: '0.2em'
            }}
          >
            太空教育试验平台
          </motion.p>
        </motion.div>
      </motion.div>

      <div style={{ height: '150vh' }} />

      <motion.div 
        ref={featuresRef}
        className={`features-grid ${isInView ? 'visible' : ''}`}
        style={{ 
          position: 'relative',
          zIndex: 2,
          padding: '0 10%'
        }}
      >
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} index={index} />
        ))}
      </motion.div>

      <footer className="footer" style={{ 
        background: 'rgba(0,0,0,0.2)', 
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