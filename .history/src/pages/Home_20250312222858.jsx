import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture, Float, SpotLight, Trail, PointMaterial } from '@react-three/drei';
import { BackSide, AdditiveBlending, Color, ObjectLoader, Vector3 } from 'three';
import './Home.css';

function Earth({ scrollY }) {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const atmosphereRef = useRef();
  const groupRef = useRef();
  
  const [colorMap, normalMap, cloudsMap, nightMap] = useTexture([
    '/earth/color.jpg',
    '/earth/normal.jpg',
    '/earth/clouds.jpg',
    '/earth/night.jpg'
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
      const scrollProgress = Math.min(scrollY / 1500, 1);
      
      // 初始位置在底部中心，只露出一个弧线，随滚动移动到右上方
      groupRef.current.position.x = scrollProgress * 6; // 减小水平移动距离
      groupRef.current.position.y = -8 + scrollProgress * 12; // 减小垂直移动距离和初始位置
      
      // 缩小整体比例
      const baseScale = 4.5; // 减小初始尺寸
      const scaleReduction = 3.0; // 减小缩放范围
      // 添加弹性效果
      const elasticFactor = Math.sin(scrollProgress * Math.PI) * 0.15; // 减小弹性幅度
      const scale = baseScale - (scrollProgress * scaleReduction) + (elasticFactor * (1 - scrollProgress));
      groupRef.current.scale.set(scale, scale, scale);
      
      // 旋转效果 - 随滚动稍微调整角度
      groupRef.current.rotation.x = 0.15 + scrollProgress * Math.PI * 0.1;
      groupRef.current.rotation.z = scrollProgress * Math.PI * 0.08;
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
          shininess={15}
          emissiveMap={nightMap}
          emissive="#ffb74d"
          emissiveIntensity={2.5}
          metalness={0.9}
          roughness={0.6}
        />
      </mesh>

      {/* 云层 */}
      <mesh ref={cloudsRef} scale={1.002}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshPhongMaterial 
          map={cloudsMap}
          transparent={true}
          opacity={0.15}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* 大气层 - 增强边缘发光效果 */}
      <mesh ref={atmosphereRef} scale={1.15}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshPhongMaterial 
          color="#60a5fa"
          transparent={true}
          opacity={0.15}
          side={BackSide}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* 外层大气光晕 - 增加更大的光晕效果 */}
      <mesh scale={1.4}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          color="#3b82f6"
          transparent={true}
          opacity={0.08}
          side={BackSide}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* 最外层光晕 */}
      <mesh scale={1.6}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshPhongMaterial 
          color="#2563eb"
          transparent={true}
          opacity={0.05}
          side={BackSide}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* 科技感扫描线效果 */}
      <mesh scale={1.01}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshPhongMaterial 
          color="#93c5fd"
          transparent={true}
          opacity={0.08}
          wireframe={true}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function Scene({ scrollY }) {
  return (
    <>
      <ambientLight intensity={0.05} />
      <pointLight position={[-15, 0, -20]} intensity={2.5} color="#e2e8f0" />
      <pointLight position={[0, 0, -25]} intensity={1.5} color="#94a3b8" />
      <Stars 
        radius={300} 
        depth={60} 
        count={15000} 
        factor={5} 
        saturation={0} 
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
  const [model, setModel] = useState(null);
  const ref = useRef();
  
  useEffect(() => {
    // 加载JSON模型
    const loader = new ObjectLoader();
    loader.load(path, (obj) => {
      // 设置材质颜色
      obj.traverse((child) => {
        if (child.isMesh) {
          child.material.color = new Color(color);
          child.material.emissive = new Color(color);
          child.material.emissiveIntensity = 0.5;
        }
      });
      setModel(obj);
    });
  }, [path, color]);
  
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.005;
    }
  });
  
  if (!model) return null;
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <primitive 
        ref={ref}
        object={model} 
        scale={scale} 
        position={position}
        rotation={rotation}
      />
    </Float>
  );
}

// 星云组件
function Nebula({ color, position = [0, 0, 0], scale = 1 }) {
  const points = useRef();
  const sphere = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.1;
    if (points.current) {
      points.current.rotation.y += 0.002;
      points.current.rotation.z = Math.sin(t) * 0.01;
    }
    if (sphere.current) {
      sphere.current.rotation.y += 0.001;
      sphere.current.scale.x = Math.sin(t) * 0.1 + 1;
      sphere.current.scale.z = Math.cos(t) * 0.1 + 1;
    }
  });
  
  return (
    <group position={position} scale={scale}>
      {/* 中心发光球体 */}
      <mesh ref={sphere}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      
      {/* 星云粒子 */}
      <points ref={points}>
        <sphereGeometry args={[5, 64, 64]} />
        <PointMaterial
          transparent
          color={color}
          size={0.1}
          sizeAttenuation={true}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
      
      {/* 光源 */}
      <SpotLight
        color={color}
        position={[0, 0, 0]}
        distance={10}
        angle={Math.PI / 4}
        attenuation={5}
        anglePower={5}
        intensity={2}
      />
    </group>
  );
}

// 火箭组件
function Rocket({ color, position = [0, 0, 0], direction = [1, 0, 0] }) {
  const rocketRef = useRef();
  const [startPos] = useState(new Vector3(...position));
  const [dir] = useState(new Vector3(...direction).normalize());
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    if (rocketRef.current) {
      // 火箭沿着方向移动，并添加一些波动
      const newPos = startPos.clone().add(
        dir.clone().multiplyScalar(Math.sin(t * 0.5) * 2 + 3)
      );
      rocketRef.current.position.copy(newPos);
      
      // 火箭朝向移动方向
      rocketRef.current.lookAt(newPos.clone().add(dir));
      
      // 添加一些旋转
      rocketRef.current.rotation.z = Math.sin(t * 0.3) * 0.1;
    }
  });
  
  return (
    <group>
      <Trail
        width={1}
        length={10}
        color={color}
        attenuation={(t) => t * t}
      >
        <mesh ref={rocketRef} position={position}>
          {/* 火箭主体 */}
          <group>
            {/* 火箭头部 */}
            <mesh position={[0, 0, 1]}>
              <coneGeometry args={[0.2, 0.5, 16]} />
              <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* 火箭身体 */}
            <mesh>
              <cylinderGeometry args={[0.2, 0.2, 1, 16]} />
              <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
            </mesh>
            
            {/* 火箭尾部 */}
            <mesh position={[0, 0, -0.6]}>
              <coneGeometry args={[0.3, 0.2, 16, 1, true]} />
              <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.5} />
            </mesh>
            
            {/* 火箭翼 */}
            {[0, 1, 2, 3].map((i) => (
              <mesh 
                key={i} 
                position={[0, 0, -0.3]}
                rotation={[0, (i * Math.PI) / 2, 0]}
              >
                <boxGeometry args={[0.5, 0.05, 0.2]} />
                <meshStandardMaterial color="#dddddd" />
              </mesh>
            ))}
            
            {/* 火箭喷射 */}
            <mesh position={[0, 0, -0.7]}>
              <coneGeometry args={[0.15, 0.5, 16, 1, true]} />
              <meshBasicMaterial color={color} transparent opacity={0.7} />
            </mesh>
          </group>
        </mesh>
      </Trail>
    </group>
  );
}

// 卫星组件
function Satellite({ color, position = [0, 0, 0], scale = 1 }) {
  const satelliteRef = useRef();
  const panelsRef = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    if (satelliteRef.current) {
      satelliteRef.current.rotation.y += 0.005;
    }
    
    if (panelsRef.current) {
      // 太阳能板轻微摆动
      panelsRef.current.rotation.x = Math.sin(t * 0.2) * 0.05;
    }
  });
  
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={satelliteRef} position={position} scale={scale}>
        {/* 卫星主体 */}
        <mesh>
          <boxGeometry args={[0.8, 0.8, 1.2]} />
          <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* 天线 */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
        
        {/* 太阳能板 */}
        <group ref={panelsRef}>
          <mesh position={[1.2, 0, 0]}>
            <boxGeometry args={[1.5, 0.05, 0.8]} />
            <meshStandardMaterial color="#1a4a7a" />
          </mesh>
          <mesh position={[-1.2, 0, 0]}>
            <boxGeometry args={[1.5, 0.05, 0.8]} />
            <meshStandardMaterial color="#1a4a7a" />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

// 实验设备组件
function LabEquipment({ color, position = [0, 0, 0], scale = 1 }) {
  const equipmentRef = useRef();
  const tubeRef = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    if (equipmentRef.current) {
      equipmentRef.current.rotation.y += 0.005;
    }
    
    if (tubeRef.current) {
      // 试管内液体波动效果
      tubeRef.current.scale.y = Math.sin(t * 0.5) * 0.1 + 1;
    }
  });
  
  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.2}>
      <group ref={equipmentRef} position={position} scale={scale}>
        {/* 底座 */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[1.2, 1.5, 0.2, 32]} />
          <meshStandardMaterial color="#444444" metalness={0.5} roughness={0.5} />
        </mesh>
        
        {/* 支架 */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
          <meshStandardMaterial color="#777777" metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* 试管架 */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[1.5, 0.1, 0.5]} />
          <meshStandardMaterial color="#555555" metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* 试管 */}
        <group position={[0, 0.7, 0]}>
          {/* 试管玻璃 */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 1, 16, 1, true]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
          </mesh>
          
          {/* 试管底部 */}
          <mesh position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
          </mesh>
          
          {/* 试管内液体 */}
          <mesh ref={tubeRef} position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.4, 16]} />
            <meshStandardMaterial color={color} transparent opacity={0.8} />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

// 抽象3D形状组件
function AbstractShape({ color, position, scale = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
      meshRef.current.rotation.y += 0.005;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial 
        color={color} 
        transparent 
        opacity={0.7}
      />
    </mesh>
  );
}

function FeatureCard({ icon, title, desc, longDesc, path, color, index, modelPath }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });
  
  const variants = {
    hidden: { opacity: 0, y: 100 },
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
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="feature-card"
      style={{
        borderLeft: `2px solid ${color}33`
      }}
    >
      <Link to={path} style={{ textDecoration: 'none', color: 'inherit', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="feature-content">
          <motion.div 
            className="feature-3d-container"
            variants={childVariants}
            style={{ height: '250px', width: '100%', position: 'relative', marginBottom: '30px' }}
          >
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color={color} />
              <Suspense fallback={null}>
                {index % 2 === 0 ? (
                  <Model3D 
                    path={index === 0 ? "/models/lab_equipment.json" : 
                          index === 2 ? "/models/trophy.json" : "/models/computer.json"} 
                    scale={1.5} 
                    color={color} 
                  />
                ) : (
                  <group>
                    <AbstractShape color={color} position={[-1.5, 0, 0]} scale={0.7} />
                    <AbstractShape color={color} position={[1.5, 0, 0]} scale={0.7} />
                    <AbstractShape color={color} position={[0, 1, 0]} scale={0.9} />
                  </group>
                )}
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
          
          <motion.div 
            className="feature-icon-wrapper"
            variants={childVariants}
          >
            <div className="feature-icon">{icon}</div>
            <div className="feature-icon-glow" style={{ background: color }} />
          </motion.div>
          
          <motion.h3 
            variants={childVariants}
            style={{ 
              background: `linear-gradient(180deg, ${color} 0%, rgba(255,255,255,0.8) 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
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
          >
            {longDesc.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </motion.div>
          
          <motion.div 
            className="feature-button"
            variants={childVariants}
            whileHover={{ scale: 1.05 }}
            style={{ borderColor: `${color}66` }}
          >
            <span>进入{title}</span>
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

  const y = useTransform(scrollY, [0, 800], [0, 300]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);
  const scale = useTransform(scrollY, [0, 600], [1, 1.2]);
  const xPos = useTransform(scrollY, [0, 600], [0, 200]);
  const blur = useTransform(scrollY, [0, 600], [0, 10]);

  const features = [
    { 
      icon: "📋", 
      title: "实验设计评估", 
      desc: "设计实验流程，智能评估可行性", 
      longDesc: [
        "在这个模块中，您可以详细描述您的实验设计和流程，我们的智能系统将对其进行全面评估。",
        "系统会分析实验的可行性、安全性、资源需求以及预期结果，为您提供专业的反馈和建议。",
        "无论是简单的教学实验还是复杂的科研项目，我们都能为您提供准确的评估和优化方案。"
      ],
      path: "/lab", 
      color: "#4facfe",
      modelPath: "/models/lab_equipment.json"
    },
    { 
      icon: "🥽", 
      title: "实验流程监控", 
      desc: "沉浸式体验，直观操作实验设备", 
      longDesc: [
        "通过先进的虚拟现实技术，您可以实时监控和操作实验设备，获得身临其境的沉浸式体验。",
        "系统提供直观的操作界面，让您能够精确控制实验参数，观察实验过程中的每一个细节。",
        "实时数据分析和可视化功能，帮助您更好地理解实验现象和结果，提高实验效率和准确性。"
      ],
      path: "/vr-lab", 
      color: "#00f2fe",
      modelPath: "/models/vr_headset.json"
    },
    { 
      icon: "🏆", 
      title: "作品展", 
      desc: "优秀实验作品展示与分享", 
      longDesc: [
        "这里展示了来自全国各地学生和研究者的优秀实验作品，涵盖物理、化学、生物等多个学科领域。",
        "您可以浏览详细的实验报告、观看实验视频、了解实验背后的创新思想和科学原理。",
        "同时，您也可以分享自己的实验成果，与志同道合的伙伴交流经验，共同进步。"
      ],
      path: "/gallery", 
      color: "#0061ff",
      modelPath: "/models/trophy.json"
    },
    { 
      icon: "💻", 
      title: "代码生成", 
      desc: "智能分析实验流程，自动生成代码", 
      longDesc: [
        "只需输入您的实验流程描述，我们的AI系统就能自动生成相应的代码，帮助您快速实现实验自动化。",
        "支持多种编程语言和实验设备接口，无论您使用什么样的实验平台，都能轻松集成。",
        "生成的代码清晰易懂，并附有详细注释，即使是编程初学者也能轻松理解和使用。"
      ],
      path: "/space-view", 
      color: "#60efff",
      modelPath: "/models/computer.json"
    }
  ];

  return (
    <div className="home">
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh' }}>
        <Canvas 
          camera={{ position: [0, 0, 12], fov: 32 }}
          style={{ 
            background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
          }}
        >
          <Suspense fallback={null}>
            <Scene scrollY={scrollValue} />
          </Suspense>
        </Canvas>
      </div>

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
            color: 'rgba(255,255,255,0.7)',
            fontSize: '1.4rem',
            fontWeight: '200',
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            marginBottom: '1.2rem',
            fontFamily: "'Montserrat', sans-serif",
            filter: useTransform(scrollY, [0, 400], ['blur(0px)', 'blur(5px)']),
            opacity: useTransform(scrollY, [0, 400], [0.9, 0]),
            transform: useTransform(scrollY, [0, 400], ['scale(1)', 'scale(0.8)']),
          }}
        >
          Space Education Lab
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
            fontSize: '12rem',
            fontWeight: '500',
            margin: 0,
            lineHeight: 1,
            opacity: useTransform(scrollY, [0, 400], [1, 0]),
            scale: useTransform(scrollY, [0, 400], [1, 0.8]),
            y: useTransform(scrollY, [0, 400], [0, 100]),
            filter: useTransform(scrollY, [0, 400], ['blur(0px)', 'blur(10px)']),
            fontFamily: "'Noto Serif SC', serif",
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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.2rem',
            marginTop: '2rem'
          }}
        >
          <motion.span
            style={{
              width: '60px',
              height: '2px',
              background: 'rgba(255,255,255,0.3)',
              display: 'block',
              transformOrigin: 'center',
              scale: useTransform(scrollY, [0, 400], [1, 0])
            }}
          />
          <motion.p
            style={{ 
              opacity: useTransform(scrollY, [0, 400], [0.8, 0]),
              scale: useTransform(scrollY, [0, 400], [1, 0.8]),
              y: useTransform(scrollY, [0, 400], [0, 50]),
              color: 'rgba(255,255,255,0.7)',
              fontSize: '1.6rem',
              fontWeight: '300',
              whiteSpace: 'nowrap',
              fontFamily: "'Noto Sans SC', sans-serif",
              filter: useTransform(scrollY, [0, 400], ['blur(0px)', 'blur(5px)']),
              letterSpacing: '0.2em'
            }}
          >
            太空教育试验平台
          </motion.p>
          <motion.span
            style={{
              width: '60px',
              height: '2px',
              background: 'rgba(255,255,255,0.3)',
              display: 'block',
              transformOrigin: 'center',
              scale: useTransform(scrollY, [0, 400], [1, 0])
            }}
          />
        </motion.div>
      </motion.div>

      <div style={{ height: '200vh' }} />

      <motion.div 
        ref={featuresRef}
        className={`features-grid ${isInView ? 'visible' : ''}`}
        style={{ 
          position: 'relative',
          zIndex: 2,
          padding: '0 5%',
          minHeight: '400vh'
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