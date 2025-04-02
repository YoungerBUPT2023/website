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

    // 保持地球在视野中，轻微浮动效果，无论滚动如何
    if (groupRef.current) {
      // 添加轻微的浮动效果
      const floatY = Math.sin(elapsedTime * 0.5) * 0.1;
      const floatX = Math.cos(elapsedTime * 0.3) * 0.05;
      
      // 固定位置，只有轻微浮动
      groupRef.current.position.x = floatX;
      groupRef.current.position.y = floatY;
      
      // 保持固定大小
      const scale = 2.5 + Math.sin(elapsedTime * 0.2) * 0.05;
      groupRef.current.scale.set(scale, scale, scale);
      
      // 轻微旋转效果
      groupRef.current.rotation.x = 0.1 + Math.sin(elapsedTime * 0.3) * 0.02;
      groupRef.current.rotation.z = Math.cos(elapsedTime * 0.4) * 0.02;
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

      {/* 大气层 - 增强边缘发光效果 */}
      <mesh ref={atmosphereRef} scale={1.15}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshPhongMaterial 
          color="#c0d8ff"
          transparent={true}
          opacity={0.04}
          side={BackSide}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* 外层大气光晕 - 增加更大的光晕效果 */}
      <mesh scale={1.4}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          color="#c0d8ff"
          transparent={true}
          opacity={0.02}
          side={BackSide}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* 最外层光晕 */}
      <mesh scale={1.8}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshPhongMaterial 
          color="#c0d8ff"
          transparent={true}
          opacity={0.01}
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
    background: 'linear-gradient(180deg, #0a101e 0%, #1a2942 100%)',
  };
  
  // 将长描述文本中的列表项处理为真正的列表
  const processLongDesc = (descArr) => {
    if (!descArr || !Array.isArray(descArr)) {
      return [];
    }
    
    // 创建一个新数组，避免修改原始数组
    const processedArr = [...descArr];
    
    return processedArr.map((paragraph, i) => {
      // 检查 paragraph 是否为 null 或 undefined
      if (paragraph == null) {
        return null;
      }
      
      if (paragraph.startsWith('【')) {
        // 这是一个标题
        return (
          <h4 key={i} className="feature-highlight">
            {paragraph.replace('【', '').replace('】', '')}
          </h4>
        );
      } else if (paragraph.startsWith('•')) {
        // 这是列表的开始，收集所有列表项
        const listItems = [];
        listItems.push(paragraph.replace('• ', ''));
        
        // 检查后续段落是否也是列表项
        for (let j = i + 1; j < processedArr.length; j++) {
          // 确保当前项不是 null 或 undefined
          if (processedArr[j] != null && processedArr[j].startsWith('•')) {
            listItems.push(processedArr[j].replace('• ', ''));
            // 将已处理的列表项从数组中标记为已处理
            processedArr[j] = null;
          } else {
            break;
          }
        }
        
        // 返回列表
        return (
          <ul key={i} className="feature-list">
            {listItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        );
      } else {
        // 普通段落
        return <p key={i}>{paragraph}</p>;
      }
    }).filter(item => item !== null); // 过滤掉已处理的列表项和空值
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
          >
            <div className="feature-icon">{icon}</div>
          </motion.div>
          
          <motion.h3 
            variants={childVariants}
            className="feature-title"
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
          >
            {processLongDesc(longDesc)}
          </motion.div>
          
          <motion.div 
            className="feature-button"
            variants={childVariants}
            whileHover={{ scale: 1.03 }}
          >
            <span>了解更多</span>
            <span className="feature-button-arrow">→</span>
          </motion.div>
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
      color: "#0066cc"
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
      color: "#0066cc"
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
      color: "#0066cc"
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
      color: "#0066cc"
    }
  ];

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
            color: '#d1d1d6',
            fontSize: '1.2rem',
            fontWeight: '400',
            letterSpacing: '0.06em',
            marginBottom: '1rem',
            opacity: useTransform(scrollY, [0, 400], [0.9, 0]),
            transform: useTransform(scrollY, [0, 400], ['scale(1)', 'scale(0.8)']),
          }}
        >
          太空教育实验平台
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
            color: '#fff',
            fontSize: '8rem',
            fontWeight: '500',
            margin: 0,
            lineHeight: 1,
            opacity: titleOpacity,
            scale: titleScale,
            y: titleY,
            filter: titleBlur,
            fontFamily: "'Noto Serif SC', serif",
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
              color: '#fff',
              fontSize: '1.5rem',
              fontWeight: '300',
              whiteSpace: 'nowrap',
              filter: useTransform(scrollY, [0, 400], ['blur(0px)', 'blur(5px)']),
            }}
          >
            探索太空教育新时代
          </motion.p>
          <motion.div className="feature-button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            style={{ 
              marginTop: '2rem',
              opacity: useTransform(scrollY, [0, 400], [1, 0])
            }}
            whileHover={{ scale: 1.03 }}
          >
            <span>了解更多</span>
            <span className="feature-button-arrow">→</span>
          </motion.div>
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

      <footer className="footer">
        <div className="footer-content">
          <p>联系方式: example@example.com</p>
          <p>工作单位: 太空教育实验室</p>
          <p>开发者: Space Education Lab</p>
          <p>© 2023 太空教育实验室. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home; 