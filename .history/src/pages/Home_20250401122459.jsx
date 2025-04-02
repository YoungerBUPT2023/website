import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import { BackSide, AdditiveBlending, Color, ObjectLoader } from 'three';
import { FaTimes, FaDownload } from 'react-icons/fa';
import './Home.css';

function Earth({ scrollY }) {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const atmosphereRef = useRef();
  const groupRef = useRef();
  
  const [colorMap, normalMap, cloudsMap, nightMap] = useTexture([
    '/earth_new/color.jpg',
    '/earth_new/normal.jpg',
    '/earth_new/clouds.jpg',
    '/earth_new/night.jpg'
  ]);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    
    // 地球自转
    if (earthRef.current) {
      earthRef.current.rotation.y = elapsedTime * 0.1;
    }
    
    // 云层自转（稍快一些）
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = elapsedTime * 0.2;
    }

    // 大气层光晕效果
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = elapsedTime * 0.05;
    }

    // 根据滚动位置调整地球组的位置和旋转
    if (groupRef.current) {
      // 计算滚动进度，范围从0到4（对应首屏和功能卡片）
      const scrollProgress = Math.min(scrollY / 2500, 4);
      
      // 根据滚动进度确定地球位置
      let targetX = 0;
      let targetY = 0;
      let targetScale = 4.5;
      
      if (scrollProgress < 0.2) {
        // 首屏：地球从底部中心向右上方移动
        targetX = scrollProgress * 6;
        targetY = -8 + scrollProgress * 12;
        targetScale = 4.5 - (scrollProgress * 3.0);
      } else if (scrollProgress < 0.55) {
        // AI智能体赋能部分：地球在右上角
        targetX = 3.75;
        targetY = 1.5;
        targetScale = 1.5;
      } else if (scrollProgress < 0.85) {
        // 全流程监控部分：地球移动到右下角
        targetX = 3.75;
        targetY = -1.5;
        targetScale = 1.5;
      } else if (scrollProgress < 1.15) {
        // 太空科学交流社区：地球移动到左下角
        targetX = -3.75;
        targetY = -1.5;
        targetScale = 1.5;
      } else {
        // 保持在太空科学交流社区的位置和大小，避免突然变化
        targetX = -3.75;
        targetY = -1.5;
        targetScale = 1.5;
      }
      
      // 平滑过渡
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.02;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.02;
      
      // 添加弹性效果
      const elasticFactor = Math.sin(scrollProgress * Math.PI) * 0.15;
      const scale = targetScale + (elasticFactor * (1 - Math.min(scrollProgress, 1)));
      
      groupRef.current.scale.set(scale, scale, scale);
      
      // 旋转效果 - 随滚动稍微调整角度
      groupRef.current.rotation.x = 0.15 + Math.min(scrollProgress, 1) * Math.PI * 0.1;
      groupRef.current.rotation.z = Math.min(scrollProgress, 1) * Math.PI * 0.08;
    }
  });

  return (
    <group ref={groupRef} scale={3.5}>
      {/* 地球本体 */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshPhongMaterial 
          map={colorMap}
          normalMap={normalMap}
          normalScale={[0.2, 0.2]}
          shininess={12}
          emissiveMap={nightMap}
          emissive="#c0d8ff"
          emissiveIntensity={1.7}
          metalness={0.1}
          roughness={1.5}
        />
      </mesh>

      {/* 云层 */}
      <mesh ref={cloudsRef} scale={1.003}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshPhongMaterial 
          map={cloudsMap}
          transparent={true}
          opacity={0.5}
          depthWrite={true}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* 彩色大气层效果 - 靠近地球的光晕 */}
      <mesh ref={atmosphereRef} scale={1.15}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshPhongMaterial 
          color="#00b8ff"
          transparent={true}
          opacity={0.04}
          side={BackSide}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* 外层青蓝色大气光晕 */}
      <mesh scale={1.4}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          color="#00e5ff"
          transparent={true}
          opacity={0.02}
          side={BackSide}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* 最外层深蓝光晕 */}
      <mesh scale={1.8}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshPhongMaterial 
          color="#0070ff"
          transparent={true}
          opacity={0.01}
          side={BackSide}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* 额外添加一层青白光晕 */}
      <mesh scale={2.2}>
        <sphereGeometry args={[2, 24, 24]} />
        <meshPhongMaterial 
          color="#80ffea"
          transparent={true}
          opacity={0.008}
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
      <ambientLight intensity={0.15} />
      <pointLight position={[-15, 0, -20]} intensity={2.0} color="#f8fafc" />
      <pointLight position={[0, 0, -25]} intensity={1.0} color="#e0f2fe" />
      <Stars 
        radius={300} 
        depth={60} 
        count={15000} 
        factor={5} 
        saturation={0.3} 
        fade 
        speed={0.5} 
      />
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

// 3D模型组件
function Model3D({ path, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0], color }) {
  const ref = useRef();
  const [model, setModel] = useState(null);
  
  useEffect(() => {
    // 使用ObjectLoader加载Three.js JSON格式的模型
    const loader = new ObjectLoader();
    loader.load(path, (loadedObject) => {
      // 设置材质颜色
      if (loadedObject.material) {
        loadedObject.material.color = new Color(color);
        loadedObject.material.emissive = new Color(color);
        loadedObject.material.emissiveIntensity = 0.5;
      }
      setModel(loadedObject);
    });
  }, [path, color]);
  
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.005;
    }
  });
  
  if (!model) return null;
  
  return (
    <primitive 
      ref={ref}
      object={model} 
      scale={scale} 
      position={position} 
      rotation={rotation} 
    />
  );
}

function FeatureCard({ icon, title, desc, longDesc, path, color, index, modelPath }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30%" });
  
  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };
  
  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.2
      }
    }
  };
  
  // 根据索引调整卡片位置，使其与地球移动同步
  const cardStyle = {
    position: 'relative',
    zIndex: 10,
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    margin: '0',
    padding: '0',
    background: 'transparent !important',
    backdropFilter: 'none !important',
    boxShadow: 'none !important'
  };
  
  return (
    <motion.div 
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{ 
        duration: 0.7, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      className="feature-card"
      style={cardStyle}
    >
      <Link to={path} style={{ textDecoration: 'none', color: 'inherit', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="feature-content">
          {modelPath && (
            <motion.div 
              className="feature-3d-container"
              variants={childVariants}
              style={{ height: '300px', width: '100%', position: 'relative', marginBottom: '30px' }}
            >
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color={color} />
                <Suspense fallback={null}>
                  <Model3D path={modelPath} scale={1.5} color={color} />
                </Suspense>
                <OrbitControls 
                  enableZoom={false}
                  enablePan={false}
                  rotateSpeed={0.5}
                  autoRotate
                  autoRotateSpeed={1}
                />
              </Canvas>
            </motion.div>
          )}
          
          <motion.div 
            className="feature-icon-wrapper"
            variants={childVariants}
            style={{
              background: `linear-gradient(135deg, ${color}22 0%, ${color}55 100%)`,
              padding: '1.5rem',
              borderRadius: '1rem',
              boxShadow: `0 10px 20px ${color}22, 0 6px 6px ${color}11`
            }}
          >
            <div className="feature-icon">{icon}</div>
          </motion.div>
          
          <motion.h3 
            variants={childVariants}
            style={{ 
              color: color,
              fontSize: '3.5rem',
              fontWeight: '500',
              margin: '0.5rem 0',
              letterSpacing: '-0.02em',
              textShadow: `0 2px 10px ${color}77`
            }}
          >
            {title}
          </motion.h3>
          
          <motion.p 
            className="feature-short-desc"
            variants={childVariants}
          >
            {desc}
          </motion.p>
          
          <motion.div 
            className="feature-long-desc"
            variants={childVariants}
            style={{
              color: '#d1d1d6',
              fontSize: '1.1rem',
              fontWeight: '400'
            }}
          >
            {longDesc.map((paragraph, i) => (
              <p key={i} style={{ 
                fontWeight: paragraph.startsWith('【') ? '500' : '400',
                marginTop: paragraph.startsWith('【') ? '15px' : '8px',
                color: paragraph.startsWith('【') ? '#fff' : '#d1d1d6'
              }}>
                {paragraph}
              </p>
            ))}
          </motion.div>
          
          <motion.div 
            variants={childVariants}
            style={{ 
              width: '50%', 
              height: '4px', 
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              margin: '2rem auto 0',
              borderRadius: '2px'
            }}
          />
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
  
  // 添加弹窗状态
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollY.onChange(setScrollValue);
    return () => unsubscribe();
  }, [scrollY]);

  // 调整滚动变换的范围，使其与地球移动同步
  const titleOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const titleScale = useTransform(scrollY, [0, 600], [1, 0.8]);
  const titleY = useTransform(scrollY, [0, 600], [0, 100]);
  const titleBlur = useTransform(scrollY, [0, 600], ['blur(0px)', 'blur(10px)']);

  // 新的AI智能体卡片数据
  const aiCards = [
    {
      title: "自然语言转实验设计",
      description: "我们的AI智能体可以将自然语言描述的文本转换为专业严谨的实验设计方案",
      image: "/introduce/1_1.png",
      path: "/lab",
    },
    {
      title: "多维度实验评估",
      description: "我们的AI智能体将从多个维度全面准确地评估实验方案并给出分析报告",
      image: "/introduce/1_2.png",
      path: "/lab",
    },
    {
      title: "实验报告代码生成",
      description: "我们的AI将根据实验报告生成完整准确的代码，并有三种语言可选",
      image: "/introduce/1_3.png",
      path: "/space-view",
    }
  ];

  const features = [];

  // 添加滚动到实验示例部分的函数
  const scrollToExperiments = () => {
    const experimentsSection = document.getElementById('experiments');
    if (experimentsSection) {
      experimentsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // 添加 URL hash 变化的处理
  useEffect(() => {
    if (window.location.hash === '#experiments') {
      scrollToExperiments();
    }
  }, []);

  return (
    <div className="home">
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh' }}>
        <Canvas 
          camera={{ position: [0, 0, 12], fov: 32 }}
          style={{ 
            background: 'linear-gradient(180deg, #0a101e 0%, #1a2942 100%)',
          }}
        >
          <Suspense fallback={null}>
            <Scene scrollY={scrollValue} />
          </Suspense>
        </Canvas>
      </div>

      {/* 滚动指示器 */}
      <motion.div 
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        style={{ opacity: useTransform(scrollY, [0, 200], [1, 0]) }}
      >
        <div className="scroll-indicator-text">向下滚动</div>
        <div className="scroll-indicator-arrow"></div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        style={{ 
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          pointerEvents: 'none',
          width: '100%',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          style={{
            fontSize: '1.2rem',
            fontWeight: '400',
            letterSpacing: '0.06em',
            marginBottom: '1rem',
            opacity: useTransform(scrollY, [0, 400], [0.9, 0]),
            transform: useTransform(scrollY, [0, 400], ['scale(1)', 'scale(0.8)']),
            color: 'white',
          }}
        >
          <span 
            style={{
              background: 'linear-gradient(90deg, #00c6ff 0%, #7c4dff 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              fontWeight: 'bold',
              textShadow: '0 0 8px rgba(124, 77, 255, 0.5)',
              fontFamily: "'Orbitron', sans-serif",
              border: '1px solid rgba(124, 77, 255, 0.3)',
              borderRadius: '4px',
              padding: '0 6px',
              marginRight: '4px',
            }}
          >
            AI驱动
          </span>
          太空科学实验平台
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 1.5, 
            delay: 0.8,
            type: "spring",
            stiffness: 50
          }}
          style={{ 
            fontSize: '8rem',
            fontWeight: '500',
            margin: 0,
            lineHeight: 1,
            opacity: titleOpacity,
            scale: titleScale,
            y: titleY,
            filter: titleBlur,
            fontFamily: "'Noto Serif SC', serif",
            color: '#ffffff',
            textShadow: '0 0 30px rgba(100, 217, 255, 0.6), 0 0 60px rgba(100, 217, 255, 0.3)',
          }}
        >
          问天
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '1.5rem'
          }}
        >
          <motion.p
            style={{ 
              opacity: useTransform(scrollY, [0, 400], [0.8, 0]),
              scale: useTransform(scrollY, [0, 400], [1, 0.8]),
              y: useTransform(scrollY, [0, 400], [0, 50]),
              fontSize: '1.5rem',
              fontWeight: '400',
              whiteSpace: 'nowrap',
              filter: useTransform(scrollY, [0, 400], ['blur(0px)', 'blur(5px)']),
              color: '#ffffff',
              textShadow: '0 4px 12px rgba(0, 200, 255, 0.6)',
              letterSpacing: '0.08em',
              fontFamily: "'Roboto', sans-serif",
              position: 'relative',
              padding: '0 10px',
            }}
          >
            <span style={{ 
              position: 'relative',
              zIndex: 1,
            }}>探索AI驱动科学与太空新时代</span>
            <span style={{
              position: 'absolute',
              left: 0,
              bottom: -2,
              width: '100%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(0, 200, 255, 0.8), transparent)',
              zIndex: 0
            }}></span>
        </motion.p>
        </motion.div>
      </motion.div>

      {/* 增加滚动空间，确保首屏有足够的高度 */}
      <div style={{ height: '100vh' }} />

      {/* 新的AI智能体赋能太空科学图文排版部分 */}
      <motion.section 
        className="ai-capabilities-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1 }}
      >
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          AI智能体赋能太空科学
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto 3rem auto',
            color: '#d1d1d6',
            fontSize: 'clamp(1rem, 3vw, 1.1rem)',
            lineHeight: 1.6
          }}
        >
          我们拥有物理实验知识库和专门制作的AI智能体工作流，帮助您完成从实验设计到代码生成的全流程
        </motion.p>
        
        <div className="ai-card-grid">
          {aiCards.map((card, index) => (
            <motion.div
              key={index}
              className="ai-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
            >
              <div className="ai-card-image-container">
                <div className="ai-card-image-overlay" />
                <img 
                  src={card.image} 
                  alt={card.title}
                  className="ai-card-image"
                />
              </div>
              
              <div className="ai-card-content">
                <div>
                  <h3 className="ai-card-title">
                    {card.title}
                  </h3>
                  
                  <p className="ai-card-description">
                    {card.description}
                  </p>
                </div>
                
                <Link 
                  to={card.path}
                  className="ai-card-link"
                >
                  了解更多
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 新的全流程监控聚焦实验部分 */}
      <motion.section
        className="ai-capabilities-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1 }}
        style={{ 
          marginTop: '4rem' 
        }}
      >
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          style={{
            background: 'linear-gradient(90deg, #ff64b5, #ff7ab5)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            fontWeight: '700',
            padding: '0 1rem'
          }}
        >
          全流程实时监控
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto 3rem auto',
            color: '#d1d1d6',
            fontSize: 'clamp(1rem, 3vw, 1.1rem)',
            lineHeight: 1.6
          }}
        >
          使用我们的太空实验实时监控系统，您可以观看太空实验的全程，参与专业讨论，了解每一步实验过程
        </motion.p>
        
        <div className="monitoring-features">
          <div className="monitoring-features-container">
            <motion.div
              className="monitoring-feature-item"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <div className="monitoring-feature-image">
                <div className="monitoring-image-overlay"></div>
                <img src="/introduce/2_1.png" alt="沉浸式观看"/>
              </div>
              <div className="monitoring-feature-text">
                <h3>沉浸式观看</h3>
                <p>基于UDP协议，地面将播放太空实验的实时转播，让您足不出户体验太空实验全过程</p>
              </div>
            </motion.div>
            
            <motion.div
              className="monitoring-feature-item"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="monitoring-feature-image">
                <div className="monitoring-image-overlay"></div>
                <img src="/introduce/1_2.png" alt="实时讨论区"/>
              </div>
              <div className="monitoring-feature-text">
                <h3>实时讨论区</h3>
                <p>专家团队在线实时解答疑惑，面向大众的开放讨论区提供互动交流平台</p>
              </div>
            </motion.div>
            
            <motion.div
              className="monitoring-feature-item"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <div className="monitoring-feature-image">
                <div className="monitoring-image-overlay"></div>
                <img src="/introduce/1_3.png" alt="AI助力聚焦流程"/>
              </div>
              <div className="monitoring-feature-text">
                <h3>AI助力聚焦流程</h3>
                <p>在每个实验流程的关键时间点，AI会提醒当前的实验步骤和相关注意事项</p>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '3rem'
            }}
          >
            <Link 
              to="/vr-lab"
              className="monitoring-learn-more-btn"
            >
              了解更多
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* 新的太空科学交流社区部分 */}
      <motion.section
        className="ai-capabilities-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1 }}
        style={{ 
          marginTop: '4rem' 
        }}
      >
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          style={{
            background: 'linear-gradient(90deg, #ff9933, #ffbb44)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            fontWeight: '700',
            padding: '0 1rem'
          }}
        >
          太空科学交流社区
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto 3rem auto',
            color: '#d1d1d6',
            fontSize: 'clamp(1rem, 3vw, 1.1rem)',
            lineHeight: 1.6
          }}
        >
          打造开放活跃的太空科学交流平台，汇聚知识与创意，支持实验分享、科普内容和创新挑战赛，连接科学爱好者与专业人士
        </motion.p>
        
        <div className="community-features">
          <div className="community-features-container">
            <motion.div
              className="community-feature-item"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <div className="community-feature-image">
                <div className="community-image-overlay"></div>
                <img src="/introduce/1_1.png" alt="在线太空科学论坛"/>
              </div>
              <div className="community-feature-text">
                <h3>在线太空科学论坛</h3>
                <p>活跃的社区生态系统，支持图文分享、互动讨论，建立科学爱好者与专业人士间的知识桥梁</p>
              </div>
            </motion.div>
            
            <motion.div
              className="community-feature-item"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="community-feature-image">
                <div className="community-image-overlay"></div>
                <img src="/introduce/1_2.png" alt="示例实验"/>
              </div>
              <div className="community-feature-text">
                <h3>示例实验</h3>
                <p>精心设计的高质量示例实验方案，遵循严谨科学标准，为学习和研究提供可靠参考和实践指导</p>
              </div>
            </motion.div>
            
            <motion.div
              className="community-feature-item"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <div className="community-feature-image">
                <div className="community-image-overlay"></div>
                <img src="/introduce/1_3.png" alt="太空科学科普"/>
              </div>
              <div className="community-feature-text">
                <h3>太空科学科普</h3>
                <p>定期发布高质量科普文章，深入浅出地解析太空科学知识，激发探索宇宙的好奇心与热情</p>
              </div>
            </motion.div>
            
            <motion.div
              className="community-feature-item"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <div className="community-feature-image">
                <div className="community-image-overlay"></div>
                <img src="/introduce/1_1.png" alt="太空实验挑战赛"/>
              </div>
              <div className="community-feature-text">
                <h3>太空实验挑战赛</h3>
                <p>面向K12和大学生群体的创新竞赛，优胜者将获得珍贵机会将实验方案送入太空进行实际验证</p>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '3rem'
            }}
          >
            <Link 
              to="/gallery"
              className="community-learn-more-btn"
            >
              了解更多
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* 新增 “关于我们” 部分 */}
      <section className="about-us-section" style={{ 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        background: '#0a101e', // 深蓝背景色
        padding: '80px 0', 
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        {/* 背景图片容器 - 放在内容容器后面但在视觉上作为背景 */}
        <div style={{ 
          position: 'absolute', 
          right: 0, 
          top: 0, 
          bottom: 0, 
          width: '55%', // 图片区域宽度
          height: '100%',
          backgroundImage: 'url(/introduce/team.jpg)', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          zIndex: 0 // 确保在文本下方
        }}>
          {/* 左侧渐变遮罩 */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '66.7%', // 遮罩占图片容器宽度的 2/3，使清晰部分占 1/3
            background: 'linear-gradient(to right, #0a101e, rgba(10, 16, 30, 0))', // 移除 8% 使过渡更平滑
            zIndex: 1
          }}></div>
        </div>

        {/* 内容容器 */}
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          width: '100%', 
          position: 'relative', // 确保文本在图片层之上
          zIndex: 1, 
          padding: '0 20px' // 增加一些左右内边距
        }}>
          {/* 左侧文本内容区 */}
          <div style={{ flex: '0 0 45%', paddingRight: '40px', color: 'white' }}>
            <h2 style={{ fontSize: '2.8rem', marginBottom: '25px', color: '#e0f2fe', fontWeight: '600', textShadow: '0 2px 8px rgba(100, 217, 255, 0.3)' }}>
              关于我们
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
              <img 
                src="/logos/logo3.jpg" // 请确保 logo3.jpg 放在 public/logos/ 目录下
                alt="StellarMindscapes Logo" 
                style={{ 
                  width: '55px', 
                  height: '55px', 
                  borderRadius: '50%', 
                  marginRight: '15px', 
                  border: '3px solid rgba(100, 217, 255, 0.5)',
                  objectFit: 'cover' // 确保图片不变形
                }} 
              />
              <h3 style={{ fontSize: '1.6rem', margin: 0, color: '#c5dfff', fontWeight: '500' }}>
                星启智空团队 (StellarMindscapes)
              </h3>
            </div>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '30px', color: '#d1d5db' }}>
              我们致力于运用人工智能技术赋能太空科学研究，打造一个集交流、学习与实践于一体的综合性太空科学社区与实验平台。
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '35px', 
              background: 'rgba(255, 255, 255, 0.08)', 
              padding: '20px', 
              borderRadius: '12px',
              border: '1px solid rgba(100, 217, 255, 0.1)'
            }}>
               <img 
                 src="/logos/logo2.png" // 请确保 logo2.png 放在 public/logos/ 目录下
                 alt="紫微科技 Logo" 
                 style={{ width: '90px', height: 'auto', marginRight: '25px', filter: 'brightness(1.1)' }} 
               />
               <p style={{ fontSize: '1rem', lineHeight: 1.6, margin: 0, color: '#e5e7eb' }}>
                 我们与 <strong style={{ color: '#90cdf4' }}>紫微科技</strong> 紧密合作，共同研发的实验飞船预计将于 <strong style={{ color: '#faf089' }}>2025年下半年</strong> 发射升空，开展前沿的太空实验探究。
               </p>
            </div>
            <button 
              onClick={() => setShowApplicationModal(true)}
              className="contact-experiment-link" 
              style={{
                display: 'inline-block',
                padding: '14px 30px',
                background: 'linear-gradient(90deg, #00c6ff, #0072ff)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '30px',
                fontWeight: 'bold',
                fontSize: '1.05rem',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                boxShadow: '0 5px 20px rgba(0, 198, 255, 0.4)',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 114, 255, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 20px rgba(0, 198, 255, 0.4)';
              }}
            >
              想在太空进行实验？联系我们
            </button>
          </div>

          {/* 右侧空白占位，利用 flex 布局将左侧推到45%宽度 */}
          <div style={{ flex: '0 0 55%' }}>
            {/* 这个 div 是空的，主要用于布局控制 */}
          </div>
        </div>
      </section>

      {/* 新增页脚内容 */}
      <footer style={{
        background: 'linear-gradient(180deg, rgba(10, 16, 30, 0.95) 0%, rgba(16, 23, 41, 0.98) 100%)',
        padding: '60px 20px',
        color: 'white',
        borderTop: '1px solid rgba(100, 217, 255, 0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {/* 左侧 - 品牌信息 */}
          <div style={{ flex: '1 1 300px', marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <img 
                src="/images/tiangong_station.png" 
                alt="天宫空间站" 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  marginRight: '15px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  filter: 'drop-shadow(0 0 8px rgba(100, 217, 255, 0.6))'
                }} 
              />
              <div>
                <h3 style={{ color: '#fff', margin: '0', fontSize: '1.2rem' }}>星启智空团队 | StellarMindscapes</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: '5px 0 0', fontSize: '0.9rem' }}>创新AI与太空科学教育平台，探索未知，启迪未来</p>
              </div>
            </div>
          </div>
          
          {/* 中间 - 快速链接 */}
          <div style={{ flex: '1 1 300px', marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px' }}>快速链接</h4>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <a href="/lab" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>实验室</a>
              <a href="/gallery" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>交流社区</a>
            </div>
          </div>
          
          {/* 右侧 - 关于我们 */}
          <div style={{ flex: '1 1 300px', marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px' }}>关于我们</h4>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={() => setShowTeamModal(true)} 
                style={{ 
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)', 
                  textDecoration: 'none', 
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                团队信息
              </button>
            </div>
          </div>

          {/* 右侧 - 社交媒体 */}
          <div style={{ flex: '1 1 300px', marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px' }}>关注我们</h4>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <a href="https://github.com/YoungerBUPT2023/website-children" target="_blank" rel="noopener noreferrer" 
                style={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  padding: '10px', 
                  borderRadius: '50%', 
                  background: 'rgba(100, 217, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  transition: 'all 0.3s ease'
                }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '40px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', margin: '0' }}>© 2025 AI驱动太空科学实验平台</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '15px' }}>
            <button 
              onClick={() => setShowPrivacyModal(true)} 
              style={{ 
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)', 
                fontSize: '0.85rem', 
                textDecoration: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              隐私政策
            </button>
            <button 
              onClick={() => setShowTermsModal(true)} 
              style={{ 
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)', 
                fontSize: '0.85rem', 
                textDecoration: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              服务协议
            </button>
          </div>
        </div>
      </footer>

      {/* 添加太空实验申请 Modal */}
      {showApplicationModal && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="modal-content" style={modalContentStyle}>
            <button onClick={() => setShowApplicationModal(false)} style={closeButtonStyle}>
              <FaTimes />
            </button>
            <h2 style={{ textAlign: 'center', color: '#e0f2fe', marginBottom: '30px', borderBottom: '1px solid rgba(100, 217, 255, 0.2)', paddingBottom: '15px' }}>
              太空实验申请
            </h2>
            
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
              <p style={{ color: '#d1d5db', lineHeight: 1.6, margin: '0 0 15px 0' }}>
                我们为优质的科学实验提供太空实验机会。请按以下要求提交您的实验申请：
              </p>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <a href="/path/to/template.docx" download style={downloadLinkStyle}>
                  <FaDownload style={{ marginRight: '8px' }} /> 下载实验申请模板 (.docx格式)
                </a>
                <a href="/path/to/template.tex" download style={downloadLinkStyle}>
                  <FaDownload style={{ marginRight: '8px' }} /> 下载实验申请模板 (.tex格式)
                </a>
              </div>
              <p style={{ color: '#a0aec0', fontSize: '0.9rem', textAlign: 'center', marginTop: '10px' }}>
                包含标准格式、填写说明和评审标准，请严格按照模板要求准备申请材料
              </p>
            </div>

            <h3 style={{ color: '#90cdf4', marginBottom: '20px', borderBottom: '1px solid rgba(100, 217, 255, 0.1)', paddingBottom: '10px' }}>
              实验申请流程
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
              <div style={flowSectionStyle}>
                <h4 style={flowTitleStyle}>申请材料要求</h4>
                <ul style={flowListStyle}>
                  <li><strong style={strongStyle}>实验计划书:</strong> 需包含实验目的、科学价值、技术路线、预期成果等内容，格式规范，不超过20页</li>
                  <li><strong style={strongStyle}>COMSOL仿真文件:</strong> 提供完整的仿真模型及相关参数设置，确保模型可复现</li>
                  <li><strong style={strongStyle}>技术报告:</strong> 详细描述实验方法、所需设备、环境要求及预期结果分析</li>
                </ul>
              </div>
              
              <div style={flowSectionStyle}>
                <h4 style={flowTitleStyle}>评估流程</h4>
                <p style={{ color: '#d1d5db', marginBottom: '10px' }}>我们将从以下多个维度对您的实验进行量化评估：</p>
                <ul style={flowListStyle}>
                  <li>科学价值与创新性</li>
                  <li>技术可行性与风险</li>
                  <li>资源需求与效益比</li>
                  <li>执行难度与时间预估</li>
                </ul>
              </div>
              
              <div style={flowSectionStyle}>
                <h4 style={flowTitleStyle}>处理时间</h4>
                <p style={{ color: '#d1d5db', marginBottom: '10px' }}>我们将在收到您的完整申请材料后<strong style={strongStyle}>5-7个工作日</strong>内给予回复，包括：</p>
                <ul style={flowListStyle}>
                  <li>实验方案评审意见</li>
                  <li>建议修改与优化方向</li>
                  <li>实验资源分配计划</li>
                  <li>后续流程安排</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 添加隐私政策弹窗 */}
      {showPrivacyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div style={{
            backgroundColor: 'rgba(16, 23, 41, 0.98)',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflowY: 'auto',
            color: 'white',
            border: '1px solid rgba(100, 217, 255, 0.3)',
            boxShadow: '0 0 20px rgba(0, 200, 255, 0.2)'
          }}>
            <h2 style={{ color: '#fff', borderBottom: '1px solid rgba(100, 217, 255, 0.3)', paddingBottom: '10px' }}>隐私政策</h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>
              <h3>1. 引言</h3>
              <p>欢迎使用我们的 AI 驱动太空科学网站（"本网站"）。本隐私政策解释了我们如何收集、使用、存储和保护您的个人信息。使用本网站，即表示您同意本隐私政策的条款。</p>
              
              <h3>2. 我们收集的信息</h3>
              <p>我们可能收集以下信息：</p>
              <ul style={{ paddingLeft: '20px' }}>
                <li>账户信息：如您的姓名、电子邮件地址、用户名等。</li>
                <li>上传作品：您在网站上上传的太空科学相关作品。</li>
                <li>AI 分析数据：AI 对您作品的分析结果。</li>
                <li>技术数据：包括 IP 地址、设备信息、浏览行为等。</li>
              </ul>
              
              <h3>3. 我们如何使用信息</h3>
              <p>我们收集的信息将用于：</p>
              <ul style={{ paddingLeft: '20px' }}>
                <li>提供和优化 AI 分析服务。</li>
                <li>维护和改进网站功能。</li>
                <li>保护用户安全，防止欺诈行为。</li>
                <li>进行数据分析和研究，以改进 AI 能力。</li>
                <li>向用户提供更新或相关通知（如适用）。</li>
              </ul>
              
              <h3>4. 信息共享与披露</h3>
              <p>我们不会出售或出租您的个人信息。以下情况下可能共享信息：</p>
              <ul style={{ paddingLeft: '20px' }}>
                <li>法律要求：在法律法规要求下，我们可能披露您的信息。</li>
                <li>合作伙伴：为提供某些功能，我们可能与受信任的第三方合作，如云存储或支付处理服务。</li>
                <li>匿名数据：我们可能共享去标识化的数据，用于研究或改进 AI 技术。</li>
              </ul>
              
              <h3>5. 数据安全</h3>
              <p>我们采取合理的安全措施来保护您的数据，包括加密、访问控制和安全存储。然而，互联网数据传输无法保证绝对安全，请妥善保管您的账号信息。</p>
              
              <h3>6. 用户权利</h3>
              <p>您可以：</p>
              <ul style={{ paddingLeft: '20px' }}>
                <li>访问、更正或删除您的个人数据。</li>
                <li>选择退出营销信息。</li>
                <li>请求删除您的账户。</li>
              </ul>
              
              <h3>7. Cookie 与追踪技术</h3>
              <p>我们使用 Cookie 以提升用户体验，您可以在浏览器设置中管理 Cookie 偏好。</p>
              
              <h3>8. 政策变更</h3>
              <p>我们可能更新本政策，变更后会通过网站公告或电子邮件通知用户。</p>
              
              <h3>9. 联系方式</h3>
              <p>如有任何隐私问题，请联系我们：contact@example.com</p>
            </div>
            <button 
              onClick={() => setShowPrivacyModal(false)} 
              style={{
                backgroundColor: 'rgba(100, 217, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(100, 217, 255, 0.4)',
                padding: '8px 20px',
                borderRadius: '5px',
                marginTop: '20px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 添加服务协议弹窗 */}
      {showTermsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div style={{
            backgroundColor: 'rgba(16, 23, 41, 0.98)',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflowY: 'auto',
            color: 'white',
            border: '1px solid rgba(100, 217, 255, 0.3)',
            boxShadow: '0 0 20px rgba(0, 200, 255, 0.2)'
          }}>
            <h2 style={{ color: '#fff', borderBottom: '1px solid rgba(100, 217, 255, 0.3)', paddingBottom: '10px' }}>服务协议</h2>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>
              <h3>1. 引言</h3>
              <p>本协议规定了您与本网站之间的权利与义务。使用本网站即表示您接受本协议。</p>
              
              <h3>2. 账户注册与使用</h3>
              <ul style={{ paddingLeft: '20px' }}>
                <li>用户需提供真实、准确的注册信息。</li>
                <li>用户需妥善保管账户，避免共享或泄露。</li>
                <li>任何账户活动均由用户本人负责。</li>
              </ul>
              
              <h3>3. 服务使用规则</h3>
              <ul style={{ paddingLeft: '20px' }}>
                <li>用户不得上传违法、不当或侵犯他人权益的内容。</li>
                <li>用户不得利用 AI 进行恶意行为或操纵分析结果。</li>
                <li>本网站保留对违规账户进行限制或终止的权利。</li>
              </ul>
              
              <h3>4. 知识产权</h3>
              <ul style={{ paddingLeft: '20px' }}>
                <li>用户上传的作品归用户所有，但用户授予本网站有限的许可，以便执行 AI 分析等服务。</li>
                <li>AI 生成的分析数据归网站所有，但用户可自由使用自己的分析结果。</li>
              </ul>
              
              <h3>5. 责任限制</h3>
              <ul style={{ paddingLeft: '20px' }}>
                <li>本网站不对 AI 结果的准确性或适用性作出保证。</li>
                <li>用户需自行判断分析结果的适用性，网站不承担因使用结果造成的损失。</li>
              </ul>
              
              <h3>6. 账户终止</h3>
              <ul style={{ paddingLeft: '20px' }}>
                <li>用户可随时注销账户。</li>
                <li>如用户违反本协议，我们可暂停或终止服务。</li>
              </ul>
              
              <h3>7. 争议解决</h3>
              <ul style={{ paddingLeft: '20px' }}>
                <li>本协议适用中国法律。</li>
                <li>争议应通过友好协商解决，协商不成的，提交北京市有管辖权的人民法院解决。</li>
              </ul>
              
              <h3>8. 变更与修订</h3>
              <p>我们可随时更新本协议，用户在变更后继续使用即视为接受新条款。</p>
              
              <h3>9. 联系方式</h3>
              <p>如有疑问，请联系我们：contact@example.com</p>
            </div>
            <button 
              onClick={() => setShowTermsModal(false)} 
              style={{
                backgroundColor: 'rgba(100, 217, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(100, 217, 255, 0.4)',
                padding: '8px 20px',
                borderRadius: '5px',
                marginTop: '20px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 添加团队信息弹窗 */}
      {showTeamModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div style={{
            backgroundColor: 'rgba(16, 23, 41, 0.98)',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '500px',
            color: 'white',
            border: '1px solid rgba(100, 217, 255, 0.3)',
            boxShadow: '0 0 20px rgba(0, 200, 255, 0.2)',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#fff', borderBottom: '1px solid rgba(100, 217, 255, 0.3)', paddingBottom: '10px', marginBottom: '20px' }}>团队信息</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem', lineHeight: '1.8' }}>
              徐文阳 唐资仪 李星昱 李如璟（排名不分先后）
            </p>
            <button 
              onClick={() => setShowTeamModal(false)} 
              style={{
                backgroundColor: 'rgba(100, 217, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(100, 217, 255, 0.4)',
                padding: '8px 20px',
                borderRadius: '5px',
                marginTop: '20px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 修改背景光晕为科技蓝色系 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 2 }}
        style={{
          position: 'fixed',
          top: '30%',
          left: '25%',
          width: '50vw',
          height: '50vh',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 200, 255, 0.2) 0%, rgba(0, 127, 255, 0.05) 50%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
          pointerEvents: 'none',
          transform: useTransform(scrollY, [0, 400], ['scale(1) translate(0, 0)', 'scale(0.3) translate(-100px, -100px)']),
        }}
      />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 2, delay: 0.3 }}
        style={{
          position: 'fixed',
          top: '40%',
          right: '20%',
          width: '40vw',
          height: '40vh',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 255, 230, 0.15) 0%, rgba(0, 150, 255, 0.05) 50%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(50px)',
          zIndex: 0,
          pointerEvents: 'none',
          transform: useTransform(scrollY, [0, 400], ['scale(1) translate(0, 0)', 'scale(0.5) translate(100px, -50px)']),
        }}
      />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 2, delay: 0.6 }}
        style={{
          position: 'fixed',
          bottom: '20%',
          left: '30%',
          width: '45vw',
          height: '45vh',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(100, 230, 255, 0.15) 0%, rgba(0, 150, 255, 0.05) 50%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(55px)',
          zIndex: 0,
          pointerEvents: 'none',
          transform: useTransform(scrollY, [0, 400], ['scale(1) translate(0, 0)', 'scale(0.4) translate(-50px, 100px)']),
        }}
      />

      {/* 添加科技感网格线效果 */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(to right, rgba(100, 217, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(100, 217, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: useTransform(scrollY, [0, 400], [0.2, 0]),
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* 添加数字雨效果元素 */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url('/images/digital-rain.png')`,
          backgroundSize: 'cover',
          opacity: useTransform(scrollY, [0, 400], [0.04, 0]),
          zIndex: 0,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
}

// 添加 Modal 样式 (可以根据项目现有 modal 样式调整或放入 CSS 文件)
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  background: 'linear-gradient(145deg, #1a202c, #2d3748)', // 深色渐变背景
  padding: '40px',
  borderRadius: '15px',
  maxWidth: '900px',
  width: '90%',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative',
  color: 'white',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(100, 217, 255, 0.2)',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '15px',
  right: '15px',
  background: 'transparent',
  border: 'none',
  color: '#a0aec0', // 灰色
  fontSize: '1.5rem',
  cursor: 'pointer',
  transition: 'color 0.3s ease',
};
// 悬停效果可以在 CSS 中添加 :hover { color: white; }

const downloadLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '10px 18px',
  background: 'rgba(0, 198, 255, 0.1)',
  color: '#63b3ed', // 浅蓝色
  textDecoration: 'none',
  borderRadius: '8px',
  border: '1px solid rgba(0, 198, 255, 0.3)',
  transition: 'background 0.3s ease, color 0.3s ease',
  fontSize: '0.9rem',
};
// 悬停效果可以在 CSS 中添加 :hover { background: 'rgba(0, 198, 255, 0.2)', color: '#90cdf4' }

const flowSectionStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  padding: '25px',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
};

const flowTitleStyle = {
  color: '#e0f2fe',
  marginBottom: '15px',
  fontSize: '1.2rem',
};

const flowListStyle = {
  listStyle: 'disc',
  marginLeft: '20px',
  color: '#d1d5db',
  lineHeight: 1.7,
  paddingLeft: '5px',
  fontSize: '0.95rem',
};

const strongStyle = {
  color: '#faf089', // 淡黄色强调
  fontWeight: '600',
};

export default Home; 