import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import { BackSide, AdditiveBlending, Color, ObjectLoader } from 'three';
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
      // 计算滚动进度，范围从0到4（对应首屏和四个功能卡片）
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
        // 实验设计评估：地球在右上角
        targetX = 3.75;
        targetY = 1.5;
        targetScale = 1.5;
      } else if (scrollProgress < 0.85) {
        // 实验流程监控：地球移动到右下角
        targetX = 3.75;
        targetY = -1.5;
        targetScale = 1.5;
      } else if (scrollProgress < 1.05) {
        // 作品展：地球移动到左下角
        targetX = -3.75;
        targetY = -1.5;
        targetScale = 1.5;
      } else if(scrollProgress < 2.5){
        // 代码生成：地球移动到左上角
        targetX = -3.75;
        targetY = 1.5;
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
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollY.onChange(setScrollValue);
    return () => unsubscribe();
  }, [scrollY]);

  // 调整滚动变换的范围，使其与地球移动同步
  const titleOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const titleScale = useTransform(scrollY, [0, 600], [1, 0.8]);
  const titleY = useTransform(scrollY, [0, 600], [0, 100]);
  const titleBlur = useTransform(scrollY, [0, 600], ['blur(0px)', 'blur(10px)']);

  const features = [
    { 
      icon: "📋", 
      title: "实验设计评估", 
      desc: "设计实验流程，智能评估可行性", 
      longDesc: [
        "在这个模块中，您可以详细描述您的实验设计和流程，我们的智能系统将对其进行全面评估。",
        "【主要功能】",
        "• 实验方案智能审核：自动检测潜在问题和优化空间",
        "• 资源需求评估：计算实验所需的设备、材料和时间成本",
        "• 安全风险分析：识别实验过程中可能存在的安全隐患"
      ],
      path: "/lab", 
      color: "#3f51b5"
    },
    { 
      icon: "🥽", 
      title: "实验流程监控", 
      desc: "沉浸式体验，直观操作实验设备", 
      longDesc: [
        "通过先进的虚拟现实技术，您可以实时监控和操作实验设备，获得身临其境的沉浸式体验。",
        "【技术特点】",
        "• 高精度3D模拟：1:1还原实验设备和环境",
        "• 多传感器数据集成：实时采集和显示关键参数",
        "• 远程协作功能：支持多人同时在线操作和观察"
      ],
      path: "/vr-lab", 
      color: "#e91e63"
    },
    { 
      icon: "🏆", 
      title: "作品展", 
      desc: "优秀实验作品展示与分享", 
      longDesc: [
        "这里展示了来自全国各地学生和研究者的优秀实验作品，涵盖物理、化学、生物等多个学科领域。",
        "【展区分类】",
        "• 创新实验区：展示具有原创性的实验设计和成果",
        "• 学科专区：按学科分类的优秀实验作品",
        "• 学生竞赛区：各类科技竞赛的获奖作品展示"
      ],
      path: "/gallery", 
      color: "#ff9800"
    },
    { 
      icon: "💻", 
      title: "代码生成", 
      desc: "智能分析实验流程，自动生成代码", 
      longDesc: [
        "只需输入您的实验流程描述，我们的AI系统就能自动生成相应的代码，帮助您快速实现实验自动化。",
        "【支持语言】",
        "• Python：适用于数据分析和科学计算",
        "• MATLAB：适用于数学建模和信号处理",
        "• Arduino/树莓派：适用于DIY实验设备集成"
      ],
      path: "/space-view", 
      color: "#009688"
    }
  ];

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

      <motion.div 
        ref={featuresRef}
        className="features-container"
        style={{ 
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          width: '100%'
        }}
      >
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} index={index} />
        ))}
      </motion.div>

      {/* 修改实验示例部分的 id 和样式 */}
      <section 
        className="experiments-showcase" 
        id="experiments" 
        style={{ 
          position: 'relative', 
          zIndex: 5,
          scrollMarginTop: '80px' // 添加滚动边距，防止被导航栏遮挡
        }}
      >
        <div className="showcase-header">
          <h2 className="showcase-title">实验示例</h2>
          <p className="showcase-subtitle">探索我们最新的交互式实验和项目</p>
        </div>
        
        <div className="experiments-grid">
          {/* 示例卡片 1 */}
          <div className="experiment-card" style={{ height: '500px' }}>
            <div className="experiment-thumbnail" style={{
              backgroundImage: "url('/images/space-simulator.jpg')"
            }}>
              <span className="experiment-badge" style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(255, 75, 145, 0.9)',
                color: 'white',
                padding: '0.3rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600',
                zIndex: 2
              }}>最新</span>
            </div>
            <div className="experiment-content" style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 'calc(100% - 200px)',
              padding: '1.5rem'
            }}>
              <div>
                <h3 className="experiment-title" style={{
                  marginBottom: '0.5rem'
                }}>太空模拟器</h3>
                <p style={{ 
                  color: '#d1d1d6',
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  margin: '0 0 1rem 0',
                  display: 'block',
                  writingMode: 'horizontal-tb !important',
                  textOrientation: 'mixed',
                  direction: 'ltr',
                  textAlign: 'left',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word'
                }}>探索行星轨道和重力场的交互式宇宙模拟实验</p>
              </div>
              <div>
                <div className="experiment-meta">
                  <span className="experiment-date">2023年10月</span>
                  <span className="experiment-author">陈明</span>
                </div>
                <Link to="/experiment/1" className="experiment-link">开始实验</Link>
              </div>
            </div>
          </div>
          
          {/* 示例卡片 2 */}
          <div className="experiment-card" style={{ height: '500px' }}>
            <div className="experiment-thumbnail" style={{
              backgroundImage: "url('/images/rocket-simulator.jpg')"
            }}></div>
            <div className="experiment-content" style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 'calc(100% - 200px)',
              padding: '1.5rem'
            }}>
              <div>
                <h3 className="experiment-title" style={{
                  marginBottom: '0.5rem'
                }}>火箭发射模拟</h3>
                <p style={{ 
                  color: '#d1d1d6',
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  margin: '0 0 1rem 0',
                  display: 'block',
                  writingMode: 'horizontal-tb !important',
                  textOrientation: 'mixed',
                  direction: 'ltr',
                  textAlign: 'left',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word'
                }}>体验火箭发射的各个阶段，调整参数以达到最佳飞行轨迹</p>
              </div>
              <div>
                <div className="experiment-meta">
                  <span className="experiment-date">2023年9月</span>
                  <span className="experiment-author">李华</span>
                </div>
                <Link to="/experiment/2" className="experiment-link">开始实验</Link>
              </div>
            </div>
          </div>
          
          {/* 示例卡片 3 */}
          <div className="experiment-card" style={{ height: '500px' }}>
            <div className="experiment-thumbnail" style={{
              backgroundImage: "url('/images/galaxy-formation.jpg')"
            }}></div>
            <div className="experiment-content" style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 'calc(100% - 200px)',
              padding: '1.5rem'
            }}>
              <div>
                <h3 className="experiment-title" style={{
                  marginBottom: '0.5rem'
                }}>星系形成</h3>
                <p style={{ 
                  color: '#d1d1d6',
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  margin: '0 0 1rem 0',
                  display: 'block',
                  writingMode: 'horizontal-tb !important',
                  textOrientation: 'mixed',
                  direction: 'ltr',
                  textAlign: 'left',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word'
                }}>观察星系形成过程中的物理现象，互动式调整参数</p>
              </div>
              <div>
                <div className="experiment-meta">
                  <span className="experiment-date">2023年8月</span>
                  <span className="experiment-author">王小明</span>
                </div>
                <Link to="/experiment/3" className="experiment-link">开始实验</Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="view-all-link">
          <a href="/gallery" className="view-all-btn">查看全部</a>
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
              <a href="/#/lab" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>实验室</a>
              <a href="/#/gallery" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>作品展示</a>
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
                  padding: '5px 15px',
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  background: 'rgba(100, 217, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  width: '120px'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
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

export default Home; 