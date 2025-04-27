import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gallery.css';
import PublishButton from '../components/PublishButton';
import ProfileModal from '../components/ProfileModal';
import { availableImages } from '../data/availableImages';

// 随机打乱图片数组的函数
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// 创建科普内容ID与图片的映射关系
const scienceImageMapping = {
  'jwst-1': '/kepu/webb_telescope.jpg',  // 韦伯望远镜
  'mars-life-1': '/kepu/perseverance.jpg',  // 毅力号
  'blackhole-1': '/kepu/black_hole.jpg',  // 黑洞
  'starship-1': '/kepu/starship.jpg',  // 星舰
  'iss-life-1': '/kepu/iss.jpg',  // 国际空间站
  'exoplanets-1': '/kepu/exoplanets.jpg',  // 系外行星
  'moon-return-1': '/kepu/artemis.jpg',  // 阿尔忒弥斯计划
  'dark-matter-1': '/kepu/dark_matter.jpg',  // 暗物质
  'space-debris-1': '/kepu/space_debris.jpg',  // 太空垃圾
  'quantum-physics-space-1': '/kepu/quantum_physics.jpg',  // 量子物理
  'solar-storm-1': '/kepu/solar_storm.jpg',  // 太阳风暴
  'neutron-stars-1': '/kepu/neutron_star.jpg',  // 中子星
  'space-medicine-1': '/kepu/space_medicine.jpg',  // 太空医学
  'space-telescopes-1': '/kepu/space_telescopes.jpg',  // 太空望远镜
  'mars-colony-1': '/kepu/mars_colony.jpg',  // 火星殖民
  'gravitational-waves-1': '/kepu/gravitational_waves.jpg',  // 引力波
  'cosmic-microwave-1': '/kepu/cosmic_microwave.jpg',  // 宇宙微波背景辐射
  'space-mining-1': '/kepu/space_mining.jpg',  // 太空采矿
  'space-tourism-1': '/kepu/space_tourism.jpg',  // 太空旅游
  'multiverse-theory-1': '/kepu/multiverse.jpg',  // 多重宇宙
  'space-radiation-1': '/kepu/space_radiation.jpg',  // 太空辐射
  'space-food-1': '/kepu/space_food.jpg',  // 太空食品
  'space-suits-1': '/kepu/space_suits.jpg',  // 太空服
  'space-weather-1': '/kepu/space_weather.jpg',  // 太空天气
  'rocket-science-1': '/kepu/rocket_science.jpg',  // 火箭科学
  'space-time-1': '/kepu/space_time.jpg',  // 时空弯曲
  'space-law-1': '/kepu/space_law.jpg',  // 太空法
  'space-robotics-1': '/kepu/space_robotics.jpg',  // 太空机器人
  'space-propulsion-1': '/kepu/space_propulsion.jpg',  // 太空推进
  'space-habitats-1': '/kepu/space_habitats.jpg',  // 太空栖息地
  'space-psychology-1': '/kepu/space_psychology.jpg',  // 太空心理学
  'space-communication-1': '/kepu/space_communication.jpg',  // 深空通信
  'space-agriculture-1': '/kepu/space_agriculture.jpg',  // 太空农业
};

// 创建一个函数，根据科普内容ID查找最合适的图片
const findBestMatchingImage = (contentId, contentTitle) => {
  // 首先检查是否有直接映射
  if (scienceImageMapping[contentId]) {
    // 检查映射的图片是否存在于可用图片列表中
    if (availableImages.includes(scienceImageMapping[contentId])) {
      return scienceImageMapping[contentId];
    }
  }
  
  // 如果没有直接映射或映射的图片不存在，尝试根据关键词匹配
  const keywords = [
    ...contentId.split('-'),
    ...contentTitle.toLowerCase().split(' ')
  ];
  
  // 尝试找到包含关键词的图片
  for (const keyword of keywords) {
    if (keyword.length < 3) continue; // 跳过太短的关键词
    
    const matchingImage = availableImages.find(img => 
      img.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (matchingImage) {
      return matchingImage;
    }
  }
  
  // 如果没有找到匹配的图片，返回一个默认图片
  return availableImages[0] || '/kepu/fallback-space.jpg';
};

const Gallery = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentProject, setCommentProject] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  // 添加视图模式状态
  const [viewMode, setViewMode] = useState('gallery'); // 'gallery', 'experiments', 'sciencePop', or 'challenge'
  // 个人资料模态窗口相关状态
  const [showOtherUserProfile, setShowOtherUserProfile] = useState(false);
  const [viewingUser, setViewingUser] = useState('');
  // 在组件内部添加翻页相关的状态
  const [currentSciencePage, setCurrentSciencePage] = useState(1);
  const scienceItemsPerPage = 7; // 每页显示7个科普项目

  // --- Timeline Logic --- >
  const competitionYear = new Date().getFullYear(); // Use current year or set specific year
  const registrationEndDate = new Date(competitionYear, 3, 30, 23, 59, 59); // April 30th EOD (Month is 0-indexed)
  const preliminaryDate = new Date(competitionYear, 4, 25); // May 25th
  const finalDate = new Date(competitionYear, 6, 28); // July 28th
  const now = new Date();

  // Determine current step based on date comparison
  let currentStep = 'register';
  if (now > registrationEndDate && now < preliminaryDate) currentStep = 'preliminary_prep'; // Between registration end and preliminary start
  if (now >= preliminaryDate && now < finalDate) currentStep = 'preliminary'; // Preliminary phase
  if (now >= finalDate) currentStep = 'final'; // Final phase or ended

  const getStatusClass = (step) => {
    switch (step) {
      case 'register':
        return now > registrationEndDate ? 'past' : (currentStep === 'register' ? 'current' : 'future');
      case 'preliminary':
        if (now >= finalDate) return 'past'; // If final is reached, prelim is past
        if (now >= preliminaryDate) return 'current'; // If prelim date reached and final not yet
        return now > registrationEndDate ? 'future' : 'future'; // If registration ended, it's upcoming, otherwise future
      case 'final':
        return now >= finalDate ? 'current' : 'future'; // If final date reached
      case 'ended': // Represent the state after the final date
         return now > finalDate ? 'current' : 'future'; // Marking 'ended' as current if final date passed
      default:
        return 'future';
    }
  };
  // --- Timeline Logic End ---

  // 检查登录状态
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const storedToken = localStorage.getItem('token');
      const user = localStorage.getItem('username') || '';
      
      setIsLoggedIn(loggedIn && !!storedToken);
      setToken(storedToken);
      setUsername(user);
    };
    
    checkAuth();
    window.addEventListener('storage', checkAuth);
    
    // 添加事件监听器处理Navbar中打开个人资料模态框的事件
    const handleOpenProfileModal = (event) => {
      if (event.detail && event.detail.username) {
        setViewingUser(event.detail.username);
        setShowOtherUserProfile(true);
      }
    };
    
    window.addEventListener('openProfileModal', handleOpenProfileModal);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('openProfileModal', handleOpenProfileModal);
    };
  }, []);

  // 检查管理员状态
  useEffect(() => {
    setIsAdmin(checkIsAdmin());
  }, []);

  // 更新全局项目数据
  const updateGlobalProjects = (updatedProjects) => {
    // 保存更新后的项目数据到localStorage
    localStorage.setItem('globalProjects', JSON.stringify(updatedProjects));
  };

  // 加载示例项目数据
  useEffect(() => {
    // 检查是否有保存的全局项目数据
    const savedProjects = localStorage.getItem('globalProjects');
    
    // 如果有保存的数据，使用它；否则使用示例数据
    let baseProjects;
    if (savedProjects) {
      baseProjects = JSON.parse(savedProjects);
    } else {
      // 模拟从API获取数据
      baseProjects = [
        {
          id: 1,
          title: '太空站模拟器',
          description: '一个交互式太空站模拟器，可以体验失重环境下的生活和工作。',
          imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          author: '刘明',
          date: '2023-09-15',
          tags: ['VR', '太空', '模拟'],
          detailedDescription: `这个太空站模拟器是一个沉浸式VR体验项目，旨在让用户体验国际空间站中的日常生活和工作。

模拟器基于真实的国际空间站内部结构和设备设计，通过VR技术重现了失重环境下的物理效果和交互方式。用户可以尝试在失重环境中进行日常活动，如吃饭、睡觉、锻炼等，也可以参与科学实验和空间站维护工作。

项目特点：
1. 高度还原的国际空间站内部环境
2. 真实的失重物理模拟
3. 丰富的交互式任务和实验
4. 多人协作模式，支持团队任务

技术实现：
- 使用Unity引擎开发
- 基于Oculus Quest 2硬件平台
- 采用NVIDIA PhysX物理引擎模拟失重环境
- 通过手部追踪技术实现自然交互`,
          equipment: '推荐设备：Oculus Quest 2或更高版本的VR头显',
          requirements: '系统要求：Windows 10, i7处理器, 16GB内存, RTX 2070或更高显卡',
          collaborators: ['王小明（环境设计）', '李华（物理引擎）', '张三（UI设计）'],
          likes: 24,
          liked: false,
          comments: [
            { id: 1, user: '张三', text: '非常棒的模拟器，体验很真实！', date: '2023-09-16' },
            { id: 2, user: '李四', text: '失重环境的物理效果做得太好了', date: '2023-09-17' }
          ]
        },
        {
          id: 2,
          title: '火星探测车控制系统',
          description: '基于实际NASA数据开发的火星探测车控制系统，可以模拟在火星表面的探索任务。',
          imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          author: '张伟',
          date: '2023-10-22',
          tags: ['火星', '机器人', '控制系统'],
          detailedDescription: `火星探测车控制系统是一个基于NASA开源数据开发的模拟软件，允许用户控制虚拟的火星探测车在火星表面进行探索任务。

该系统使用了NASA好奇号和毅力号探测车的真实技术参数和火星地形数据，创建了一个高度逼真的火星环境。用户可以通过控制面板操作探测车的移动、取样、分析等功能，体验火星探索的挑战和乐趣。

系统功能：
1. 精确的火星地形导航
2. 模拟探测车的所有科学仪器操作
3. 真实的通信延迟模拟
4. 任务规划和执行模块
5. 数据收集和分析功能

技术亮点：
- 使用Python和C++开发
- 基于NASA开源的火星地形数据
- 采用机器学习算法优化路径规划
- 3D渲染引擎展示火星环境`,
          equipment: '标准计算机设备，支持键盘、鼠标或游戏手柄控制',
          requirements: '系统要求：Windows/Mac/Linux, i5处理器, 8GB内存, 集成显卡即可',
          collaborators: ['李明（算法开发）', '赵芳（UI设计）', '钱进（3D建模）'],
          likes: 18,
          liked: false,
          comments: [
            { id: 1, user: '王五', text: '控制系统非常精确，火星地形也很逼真', date: '2023-10-23' },
            { id: 2, user: '赵六', text: '通信延迟模拟很有创意，增加了真实感', date: '2023-10-25' }
          ]
        },
        {
          id: 3,
          title: '太阳系行星轨道可视化',
          description: '基于真实天文数据的太阳系行星轨道三维可视化项目，包含历史轨迹和未来预测。',
          imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          author: '王芳',
          date: '2023-08-30',
          tags: ['天文', '可视化', '数据'],
          detailedDescription: `太阳系行星轨道可视化项目是一个基于WebGL技术的交互式天文可视化工具，展示了太阳系八大行星及主要卫星的轨道运行。

该项目使用了NASA JPL提供的精确天文数据，可以展示从公元前3000年到公元3000年的行星轨道位置，让用户直观地了解太阳系天体的运行规律。用户可以自由调整时间、视角和缩放比例，观察行星运动和天体相对位置。

项目特色：
1. 精确的开普勒轨道计算
2. 真实比例的行星大小和轨道距离
3. 时间控制功能，可加速、减速或回放行星运动
4. 支持行星信息查询和轨道参数显示
5. 天文事件预测（如日食、月食、行星冲日等）

技术实现：
- 前端：Three.js + React
- 后端：Node.js + Express
- 数据源：NASA JPL Horizons系统
- 轨道计算：基于VSOP87行星理论`,
          equipment: '支持WebGL的现代浏览器',
          requirements: '推荐使用Chrome或Firefox最新版本，需要良好的网络连接',
          collaborators: ['陈明（天文数据处理）', '黄晓（前端开发）', '吴强（3D渲染）'],
          likes: 32,
          liked: true,
          comments: [
            { id: 1, user: '黄七', text: '轨道计算非常精确，视觉效果也很棒', date: '2023-09-01' },
            { id: 2, user: '吴八', text: '时间控制功能很实用，可以清晰看到行星运动规律', date: '2023-09-03' }
          ]
        },
        {
          id: 4,
          title: '太空垃圾追踪系统',
          description: '实时追踪地球轨道上的太空垃圾，并提供碰撞风险评估。',
          imageUrl: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          author: '李强',
          date: '2023-11-05',
          tags: ['太空', '数据', '安全'],
          detailedDescription: `太空垃圾追踪系统是一个用于监测和分析地球轨道上太空碎片的专业工具，旨在提高空间安全意识并辅助航天任务规划。

该系统使用美国空间监视网络(SSN)和欧洲空间局(ESA)提供的公开数据，追踪超过20,000个已知的太空碎片对象。系统可以预测这些碎片的轨道演变，评估它们与在轨航天器的碰撞风险，并提供可视化的风险分析报告。

核心功能：
1. 实时太空碎片轨道可视化
2. 碰撞风险预测和预警
3. 历史碎片数据分析和趋势研究
4. 卫星避碰策略建议
5. 太空环境污染评估

技术亮点：
- 使用SGP4/SDP4轨道传播算法
- 基于Python和TLE数据的轨道计算
- 采用机器学习模型预测碎片轨道演变
- WebGL实现的3D地球和轨道可视化
- REST API支持第三方应用集成`,
          equipment: '标准计算机设备，支持现代浏览器',
          requirements: '系统要求：任何支持HTML5和WebGL的现代浏览器',
          collaborators: ['张伟（数据科学）', '刘芳（前端开发）', '王强（算法研究）'],
          likes: 15,
          liked: false,
          comments: [
            { id: 1, user: '钱九', text: '碰撞风险预测功能非常实用', date: '2023-11-06' },
            { id: 2, user: '孙十', text: '数据可视化做得很直观，易于理解', date: '2023-11-08' }
          ]
        }
      ];
      // 初始化时保存示例数据
      updateGlobalProjects(baseProjects);
    }
    
    // 从localStorage获取用户的点赞记录
    const userLikes = JSON.parse(localStorage.getItem(`userLikes_${username}`)) || [];
    
    // 从localStorage获取用户的评论记录
    const userComments = JSON.parse(localStorage.getItem(`userComments_${username}`)) || {};
    
    // 更新项目的点赞状态和评论
    const updatedProjects = baseProjects.map(project => {
      // 合并已有评论和用户存储的评论
      let projectComments = [...(project.comments || [])];
      
      // 如果有该项目的用户评论，添加到评论列表中
      if (userComments[project.id]) {
        // 过滤掉可能重复的评论（基于评论ID）
        const existingCommentIds = projectComments.map(comment => comment.id);
        const newComments = userComments[project.id].filter(
          comment => !existingCommentIds.includes(comment.id)
        );
        
        projectComments = [...projectComments, ...newComments];
      }
      
      return {
        ...project,
        liked: userLikes.includes(project.id),
        comments: projectComments
      };
    });
    
    setProjects(updatedProjects);
  }, [username]);

  // 处理文件选择
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // 创建预览URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理标签添加
  const handleAddTag = () => {
    if (tagInput.trim()) {
      // 添加新标签并去重
      const newTag = tagInput.trim();
      if (!uploadData.tags.includes(newTag)) {
        setUploadData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput(''); // 清空输入
    }
  };

  // 处理按键事件，按Enter键添加标签
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 阻止表单提交
      handleAddTag();
    }
  };

  // 处理删除标签
  const handleRemoveTag = (tagToRemove) => {
    setUploadData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理标签输入变化
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  // 处理上传表单提交
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!isLoggedIn || !token) {
      alert('请先登录后再上传作品');
      return;
    }

    if (!selectedFile) {
      alert('请选择要上传的文件');
      return;
    }

    try {
      // 检查服务器是否可用 - 使用已有的API端点而不是健康检查
      try {
        const serverCheck = await fetch('http://localhost:5000/api/projects', { 
          method: 'GET',
          signal: AbortSignal.timeout(2000) // 2秒超时
        });
        
        if (!serverCheck.ok) {
          throw new Error('服务器不可用');
        }
      } catch (error) {
        // 服务器不可用，使用本地存储模拟上传
        console.log('服务器不可用，使用本地存储模拟上传');
        
        // 创建新项目对象
        const newProject = {
          id: Date.now(), // 使用时间戳作为临时ID
          title: uploadData.title,
          description: uploadData.description,
          tags: uploadData.tags,
          imageUrl: previewUrl, // 使用预览URL作为图片
          author: username,
          date: new Date().toISOString().split('T')[0], // 当前日期
          detailedDescription: uploadData.description,
          equipment: '未指定',
          requirements: '未指定',
          collaborators: [],
          likes: 0,
          liked: false,
          comments: []
        };
        
        // 添加到项目列表
        setProjects(prevProjects => {
          const updatedProjects = [newProject, ...prevProjects];
          updateGlobalProjects(updatedProjects);
          return updatedProjects;
        });
        
        // 重置表单
        setUploadData({
          title: '',
          description: '',
          tags: []
        });
        setSelectedFile(null);
        setPreviewUrl('');
        setShowUploadModal(false);
        
        alert('作品已本地保存！(服务器当前不可用)');
        return;
      }

      // 如果服务器可用，继续原有的上传逻辑
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('tags', JSON.stringify(uploadData.tags));

      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '上传失败');
      }

      const result = await response.json();

      // 确保新项目有必要的属性
      const newProject = {
        ...result.project,
        comments: result.project.comments || [], // 添加空的comments数组如果不存在
        likes: result.project.likes || 0,        // 确保likes存在
        liked: false,                            // 默认未点赞
        tags: result.project.tags || []          // 确保tags存在
      };
      
      // 添加新项目到项目列表
      setProjects(prevProjects => {
        const updatedProjects = [newProject, ...prevProjects];
        
        // 保存更新后的项目列表到localStorage
        saveProjectsToLocalStorage(updatedProjects);
        
        // 触发自定义事件，通知其他组件项目数据已更新
        window.dispatchEvent(new CustomEvent('projectsUpdated'));
        
        return updatedProjects;
      });

      // 重置表单
      setUploadData({
        title: '',
        description: '',
        tags: []
      });
      setSelectedFile(null);
      setPreviewUrl('');
      setShowUploadModal(false);

      alert('作品上传成功！');
    } catch (error) {
      console.error('上传错误:', error);
      if (error.message === '未找到认证令牌' || error.message === '令牌无效或已过期') {
        // 清除无效的登录状态
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setToken(null);
        alert('登录已过期，请重新登录');
      } else {
        alert(error.message || '上传失败，请稍后重试');
      }
    }
  };

  // 处理登录点击
  const handleLoginClick = () => {
    navigate('/login');
  };

  // 处理项目点击，显示详情
  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  // 修改点赞处理函数
  const handleLike = async (e, projectId) => {
    e.stopPropagation();
    
    if (!isLoggedIn) {
      alert('请先登录后再点赞');
      return;
    }

    try {
      const method = projects.find(p => p.id === projectId).liked ? 'DELETE' : 'POST';
      
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/like`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '操作失败');
      }

      setProjects(prevProjects => {
        const updatedProjects = prevProjects.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              liked: !project.liked,
              likes: project.liked ? project.likes - 1 : project.likes + 1
            };
          }
          return project;
        });
        
        // 保存更新后的项目列表到localStorage
        saveProjectsToLocalStorage(updatedProjects);
        
        // 触发自定义事件，通知其他组件项目数据已更新
        window.dispatchEvent(new CustomEvent('projectsUpdated'));
        
        return updatedProjects;
      });

      // 显示操作成功提示
      alert(data.message);
    } catch (error) {
      console.error('点赞错误:', error);
      alert(error.message || '操作失败，请稍后重试');
    }
  };

  // 打开评论模态窗口
  const handleCommentClick = (e, project) => {
    e.stopPropagation(); // 阻止冒泡，避免触发卡片点击
    
    if (!isLoggedIn) {
      alert('请先登录后再评论');
      return;
    }
    
    setCommentProject(project);
    setCommentText('');
    setShowCommentModal(true);
  };

  // 修改提交评论函数
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      alert('评论内容不能为空');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/projects/${commentProject.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: commentText.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '评论失败');
      }

      const data = await response.json();

      setProjects(prevProjects => {
        const updatedProjects = prevProjects.map(project => {
          if (project.id === commentProject.id) {
            return {
              ...project,
              comments: [...(project.comments || []), data.comment]
            };
          }
          return project;
        });
        
        // 保存更新后的项目列表到localStorage
        saveProjectsToLocalStorage(updatedProjects);
        
        // 触发自定义事件，通知其他组件项目数据已更新
        window.dispatchEvent(new CustomEvent('projectsUpdated'));
        
        return updatedProjects;
      });

      setShowCommentModal(false);
      setCommentText('');
      alert('评论成功');
    } catch (error) {
      console.error('评论错误:', error);
      alert(error.message || '评论失败，请稍后重试');
    }
  };

  // 用于将项目列表保存到localStorage的辅助函数
  const saveProjectsToLocalStorage = (updatedProjects) => {
    try {
      localStorage.setItem('globalProjects', JSON.stringify(updatedProjects));
    } catch (error) {
      console.error('保存项目列表到localStorage时出错:', error);
    }
  };

  // 过滤项目
  const filteredProjects = filter === 'all' 
    ? projects 
    : projects?.filter(project => project.tags?.includes(filter)) || [];

  // 获取所有标签
  const allTags = [...new Set(projects?.flatMap(project => project.tags || []) || [])];

  const handlePublish = () => {
    if (!isLoggedIn) {
      alert('请先登录后再上传作品');
      return;
    }
    setShowUploadModal(true);
  };

  // 修改删除处理函数
  const handleDelete = async (e, projectId) => {
    e.stopPropagation(); // 阻止冒泡
    
    if (window.confirm('确定要删除这个实验吗？')) {
      try {
        const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '删除失败');
        }

        // 从本地状态中移除项目
        setProjects(prevProjects => {
          const updatedProjects = prevProjects.filter(project => project.id !== projectId);
          
          // 保存更新后的项目列表到localStorage
          saveProjectsToLocalStorage(updatedProjects);
          
          // 触发自定义事件，通知其他组件项目数据已更新
          window.dispatchEvent(new CustomEvent('projectsUpdated'));
          
          return updatedProjects;
        });

        alert('删除成功');
      } catch (error) {
        console.error('删除错误:', error);
        alert(error.message || '删除失败，请稍后重试');
      }
    }
  };

  // 检查管理员状态
  const checkIsAdmin = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const { username } = JSON.parse(userData);
        return username === 'qydycg';  // 使用配置文件中定义的管理员用户名
      } catch (error) {
        console.error('解析用户数据失败:', error);
        return false;
      }
    }
    return false;
  };

  // 在组件加载时获取项目列表
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        try {
          const response = await fetch('http://localhost:5000/api/projects', {
            signal: AbortSignal.timeout(3000) // 3秒超时
          });
          
          if (!response.ok) {
            throw new Error('获取项目列表失败');
          }
          
          const data = await response.json();
          setProjects(data);
        } catch (error) {
          console.error('获取项目列表错误:', error);
          // 服务器不可用时，使用本地存储的数据
          const savedProjects = localStorage.getItem('globalProjects');
          if (savedProjects) {
            setProjects(JSON.parse(savedProjects));
          }
        }
      } catch (error) {
        console.error('获取项目列表错误:', error);
      }
    };

    fetchProjects();
  }, []);

  // 处理删除评论函数
  const handleDeleteComment = async (projectId, commentId) => {
    if (!isLoggedIn) {
      alert('请先登录后再进行操作');
      return;
    }
    
    if (window.confirm('确定要删除这条评论吗？')) {
      try {
        const response = await fetch(`http://localhost:5000/api/projects/${projectId}/comments/${commentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '删除评论失败');
        }

        setProjects(prevProjects => {
          const updatedProjects = prevProjects.map(project => {
            if (project.id === projectId) {
              return {
                ...project,
                comments: project.comments.filter(comment => comment.id !== commentId)
              };
            }
            return project;
          });
          
          // 保存更新后的项目列表到localStorage
          saveProjectsToLocalStorage(updatedProjects);
          
          // 触发自定义事件，通知其他组件项目数据已更新
          window.dispatchEvent(new CustomEvent('projectsUpdated'));
          
          return updatedProjects;
        });

        // 如果当前有选中的项目，更新该项目的评论列表
        if (selectedProject && selectedProject.id === projectId) {
          setSelectedProject({
            ...selectedProject,
            comments: selectedProject.comments.filter(comment => comment.id !== commentId)
          });
        }

        alert('评论已成功删除');
      } catch (error) {
        console.error('删除评论错误:', error);
        alert(error.message || '删除评论失败，请稍后重试');
      }
    }
  };
  
  // 处理作者名称点击，查看用户个人资料
  const handleAuthorClick = (e, authorName) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发卡片点击
    
    // 如果点击的是当前登录用户，使用普通的个人资料模态框
    if (authorName === username) {
      // 使用导航组件中的个人资料模态框
      // 触发一个自定义事件，通知Navbar组件打开个人资料模态框
      const event = new CustomEvent('openProfileModal', { detail: { username: authorName } });
      window.dispatchEvent(event);
      return;
    }
    
    // 设置要查看的用户名
    setViewingUser(authorName);
    // 显示其他用户的个人资料模态框
    setShowOtherUserProfile(true);
  };

  // ---> 太空科普内容数据 <---
  const originalSciencePopContent = [
    {
      id: 'jwst-1',
      type: 'article',
      title: '韦伯望远镜揭示宇宙奥秘',
      summary: '探索詹姆斯·韦伯太空望远镜拍摄的最新震撼图像和科学发现，以前所未有的清晰度揭示遥远星系和恒星的诞生。',
      imageUrl: '/kepu/weibo.jpg', 
      linkUrl: 'https://science.nasa.gov/mission/webb/',
    },
    {
      id: 'mars-life-1',
      type: 'article',
      title: '毅力号：在火星寻找生命的痕迹',
      summary: 'NASA的"毅力号"火星车继续在红色星球上寻找古代微生物生命的迹象。了解它的任务、最新发现和面临的挑战。',
      imageUrl: '/kepu/yilihao.jpg', 
      linkUrl: 'https://science.nasa.gov/mission/perseverance/',
    },
    {
      id: 'blackhole-1',
      type: 'video',
      title: '视频：黑洞是如何运作的？',
      summary: '一个引人入胜的科普视频，解释了黑洞背后的奇妙物理学、它们如何形成以及对时空产生的深刻影响。',
      imageUrl: '/kepu/heidong.jpeg', 
      linkUrl: 'https://www.youtube.com/watch?v=e-P5IFTqB9c',
    },
    {
      id: 'starship-1',
      type: 'article',
      title: '星舰：通往月球和火星的阶梯',
      summary: '了解SpaceX的星舰计划，其探索月球和火星的宏伟目标，以及最近测试飞行的进展和未来的展望。',
      imageUrl: '/kepu/xingjian.jpeg', 
      linkUrl: 'https://www.spacex.com/vehicles/starship/',
    },
    // 已有的新增科普内容
    {
      id: 'iss-life-1',
      type: 'article',
      title: '国际空间站：太空中的生活实验室',
      summary: '探索宇航员在国际空间站上的日常生活，从睡眠、饮食到科学实验和太空行走，了解人类如何在太空环境中生存和工作。',
      imageUrl: '/kepu/iss.jpg',
      linkUrl: 'https://www.nasa.gov/mission/international-space-station/',
    },
    {
      id: 'exoplanets-1',
      type: 'article',
      title: '系外行星探索：寻找第二个地球',
      summary: '科学家已发现超过5000颗系外行星，其中一些可能适合生命存在。了解天文学家如何发现这些遥远的世界，以及它们对寻找地外生命的意义。',
      imageUrl: '/kepu/exoplanets.jpg',
      linkUrl: 'https://exoplanets.nasa.gov/',
    },
    {
      id: 'moon-return-1',
      type: 'video',
      title: '视频：阿尔忒弥斯计划 - 人类重返月球',
      summary: 'NASA的阿尔忒弥斯计划旨在将宇航员送回月球表面，并建立可持续的月球基地。这个视频详细介绍了这一雄心勃勃的计划及其科学目标。',
      imageUrl: '/kepu/artemis.jpg',
      linkUrl: 'https://www.youtube.com/watch?v=_T8cn2J13-4',
    },
    {
      id: 'dark-matter-1',
      type: 'article',
      title: '暗物质与暗能量：宇宙的隐藏成分',
      summary: '宇宙中约95%的内容是我们无法直接观测到的暗物质和暗能量。探索科学家如何推断它们的存在，以及它们对宇宙结构和命运的影响。',
      imageUrl: '/kepu/dark-matter.jpg',
      linkUrl: 'https://science.nasa.gov/astrophysics/focus-areas/what-is-dark-energy/',
    },
    {
      id: 'space-debris-1',
      type: 'article',
      title: '太空垃圾危机：轨道上的威胁',
      summary: '地球轨道上有数百万碎片在高速飞行，对卫星和空间站构成威胁。了解太空垃圾的来源、危害以及科学家正在开发的清理解决方案。',
      imageUrl: '/kepu/space-debris.jpg',
      linkUrl: 'https://www.esa.int/Space_Safety/Space_Debris',
    },
    {
      id: 'quantum-physics-space-1',
      type: 'video',
      title: '视频：量子物理学如何改变我们对宇宙的理解',
      summary: '量子物理学的奇特现象挑战了我们对现实的基本认知。这个视频探讨了量子理论如何帮助我们理解黑洞、宇宙起源和多重宇宙的可能性。',
      imageUrl: '/kepu/quantum.jpg',
      linkUrl: 'https://www.youtube.com/watch?v=q3MWRvLndzs',
    },
    // 新增更多科普内容
    {
      id: 'solar-storm-1',
      type: 'article',
      title: '太阳风暴：地球面临的宇宙威胁',
      summary: '太阳风暴可能导致全球通信中断、电网瘫痪和卫星损坏。了解这些壮观的太阳活动如何形成，以及科学家如何预测和应对它们。',
      imageUrl: '/kepu/solar-storm.jpg',
      linkUrl: 'https://www.nasa.gov/mission/sdo/',
    },
    {
      id: 'neutron-stars-1',
      type: 'article',
      title: '中子星：宇宙中最极端的天体',
      summary: '中子星是恒星死亡后形成的超致密天体，一茶匙物质重达数十亿吨。探索这些奇特天体的形成过程、物理特性和它们在宇宙中的角色。',
      imageUrl: '/kepu/neutron-star.jpg',
      linkUrl: 'https://science.nasa.gov/astrophysics/focus-areas/black-holes-and-neutron-stars/',
    },
    {
      id: 'space-medicine-1',
      type: 'article',
      title: '太空医学：失重环境下的人体变化',
      summary: '长期太空飞行对人体有哪些影响？从骨质流失到视力变化，了解宇航员面临的健康挑战以及科学家如何解决这些问题。',
      imageUrl: '/kepu/space-medicine.jpg',
      linkUrl: 'https://www.nasa.gov/hrp/bodyinspace',
    },
    {
      id: 'space-telescopes-1',
      type: 'video',
      title: '视频：太空望远镜如何改变天文学',
      summary: '从哈勃到韦伯，太空望远镜如何突破大气层限制，彻底改变了我们对宇宙的认知。这个视频回顾了太空望远镜的发展历程和重大发现。',
      imageUrl: '/kepu/space-telescopes.jpg',
      linkUrl: 'https://www.youtube.com/watch?v=4PGEYRqTwCs',
    },
    {
      id: 'mars-colony-1',
      type: 'article',
      title: '火星殖民：人类的多行星未来',
      summary: '在火星建立永久基地面临哪些挑战？从生命支持系统到辐射防护，探索科学家和工程师如何规划人类在红色星球上的长期生存。',
      imageUrl: '/kepu/mars-colony.jpg',
      linkUrl: 'https://www.nasa.gov/mars-exploration-zones',
    },
    {
      id: 'gravitational-waves-1',
      type: 'article',
      title: '引力波：聆听宇宙的涟漪',
      summary: '爱因斯坦预言的时空涟漪终于被探测到，开启了天文学的新时代。了解引力波如何形成、如何被探测，以及它们揭示的宇宙奥秘。',
      imageUrl: '/kepu/gravitational-waves.jpg',
      linkUrl: 'https://www.ligo.caltech.edu/page/what-are-gw',
    },
    {
      id: 'cosmic-microwave-1',
      type: 'article',
      title: '宇宙微波背景辐射：大爆炸的回声',
      summary: '宇宙微波背景辐射是宇宙大爆炸留下的"化石"，提供了宇宙早期状态的珍贵信息。探索科学家如何通过研究这种辐射来了解宇宙的起源和演化。',
      imageUrl: '/kepu/cosmic-microwave.jpg',
      linkUrl: 'https://science.nasa.gov/astrophysics/focus-areas/what-powered-the-big-bang/',
    },
    {
      id: 'space-mining-1',
      type: 'article',
      title: '太空采矿：开发小行星资源',
      summary: '小行星蕴含丰富的稀有金属和水资源，可能成为未来太空经济的关键。了解太空采矿的技术挑战、经济前景和法律问题。',
      imageUrl: '/kepu/space-mining.jpg',
      linkUrl: 'https://www.nasa.gov/solar-system/nasa-selects-studies-for-future-asteroid-reconnaissance-mission/',
    },
    {
      id: 'space-tourism-1',
      type: 'video',
      title: '视频：太空旅游的兴起与未来',
      summary: '随着商业航天公司的崛起，太空旅游正从科幻变为现实。这个视频探讨了太空旅游的现状、未来发展和对航天产业的影响。',
      imageUrl: '/kepu/space-tourism.jpg',
      linkUrl: 'https://www.youtube.com/watch?v=k3y7G5Y95Jw',
    },
    {
      id: 'multiverse-theory-1',
      type: 'article',
      title: '多重宇宙理论：我们的宇宙只是众多宇宙之一？',
      summary: '多重宇宙理论提出我们的宇宙可能只是无数平行宇宙中的一个。探索这一前沿理论的科学基础、不同模型和可能的验证方法。',
      imageUrl: '/kepu/multiverse.jpg',
      linkUrl: 'https://www.space.com/multiverse-theory-explained',
    },
    {
      id: 'space-radiation-1',
      type: 'article',
      title: '太空辐射：深空探索的隐形杀手',
      summary: '太空辐射是长期太空任务面临的主要危险之一。了解不同类型的太空辐射、它们对人体的影响，以及科学家如何开发防护技术。',
      imageUrl: '/kepu/space-radiation.jpg',
      linkUrl: 'https://www.nasa.gov/hrp/radiation',
    },
    {
      id: 'space-food-1',
      type: 'article',
      title: '太空食品：宇航员如何在太空中吃饭',
      summary: '从早期的压缩食品到现代的3D打印食物，太空食品技术不断发展。探索宇航员的饮食挑战、营养需求和未来长期太空任务的食品解决方案。',
      imageUrl: '/kepu/space-food.jpg',
      linkUrl: 'https://www.nasa.gov/stem-ed-resources/space-food-and-nutrition.html',
    },
    {
      id: 'space-suits-1',
      type: 'video',
      title: '视频：太空服的演变与工作原理',
      summary: '太空服是宇航员在真空环境中生存的个人飞船。这个视频展示了太空服的历史演变、复杂结构和最新技术进展。',
      imageUrl: '/kepu/space-suits.jpg',
      linkUrl: 'https://www.youtube.com/watch?v=fhBKtNDPP54',
    },
    {
      id: 'space-weather-1',
      type: 'article',
      title: '太空天气：预测宇宙风暴',
      summary: '太空天气包括太阳活动和宇宙射线对地球环境的影响。了解科学家如何监测和预测太空天气，以及它对卫星、通信和电网的影响。',
      imageUrl: '/kepu/space-weather.jpg',
      linkUrl: 'https://www.swpc.noaa.gov/impacts',
    },
    {
      id: 'rocket-science-1',
      type: 'article',
      title: '火箭科学：如何将物体送入太空',
      summary: '火箭是人类进入太空的唯一途径。探索火箭的基本原理、不同类型的推进系统，以及现代火箭技术面临的挑战和创新。',
      imageUrl: '/kepu/rocket-science.jpg',
      linkUrl: 'https://www.nasa.gov/audience/forstudents/5-8/features/nasa-knows/what-is-a-rocket-58.html',
    },
    {
      id: 'space-time-1',
      type: 'video',
      title: '视频：时空弯曲与引力的关系',
      summary: '爱因斯坦的广义相对论描述了质量如何弯曲时空，产生我们感知的引力。这个视频用生动的可视化方式解释这一复杂概念。',
      imageUrl: '/kepu/space-time.jpg',
      linkUrl: 'https://www.youtube.com/watch?v=AwhKZ3fd9JA',
    },
    {
      id: 'space-law-1',
      type: 'article',
      title: '太空法：谁拥有外太空？',
      summary: '随着太空活动的商业化，太空法律问题变得日益重要。探索现有的国际太空条约、资源开发权、领土主权和未来太空治理的挑战。',
      imageUrl: '/kepu/space-law.jpg',
      linkUrl: 'https://www.unoosa.org/oosa/en/ourwork/spacelaw/index.html',
    },
    {
      id: 'space-robotics-1',
      type: 'article',
      title: '太空机器人：人类的太空探索先锋',
      summary: '从火星车到空间站机械臂，机器人在太空探索中扮演着关键角色。了解太空机器人的设计挑战、自主技术和未来发展方向。',
      imageUrl: '/kepu/space-robotics.jpg',
      linkUrl: 'https://www.nasa.gov/robotics',
    },
    {
      id: 'space-propulsion-1',
      type: 'article',
      title: '未来推进技术：超越化学火箭',
      summary: '离子推进、核推进、太阳帆——这些先进推进技术可能彻底改变太空旅行。探索这些技术的工作原理、发展现状和潜在应用。',
      imageUrl: '/kepu/space-propulsion.jpg',
      linkUrl: 'https://www.nasa.gov/directorates/spacetech/game_changing_development/projects/NEXT-C',
    },
    {
      id: 'space-habitats-1',
      type: 'video',
      title: '视频：未来太空栖息地设计',
      summary: '长期太空居住需要解决重力、辐射和心理健康等多方面挑战。这个视频展示了科学家和工程师设计的各种太空栖息地概念。',
      imageUrl: '/kepu/space-habitats.jpg',
      linkUrl: 'https://www.youtube.com/watch?v=vTNP01Sg-Ss',
    },
    {
      id: 'space-psychology-1',
      type: 'article',
      title: '太空心理学：孤立环境中的人类行为',
      summary: '长期太空任务对宇航员的心理健康提出了独特挑战。了解太空环境中的心理压力、团队动力和科学家如何帮助宇航员保持心理健康。',
      imageUrl: '/kepu/space-psychology.jpg',
      linkUrl: 'https://www.nasa.gov/hrp/bodyinspace/psychosocial',
    },
    {
      id: 'space-communication-1',
      type: 'article',
      title: '深空通信：如何与遥远的航天器对话',
      summary: '与数十亿公里外的航天器通信需要克服巨大的技术挑战。探索深空网络的工作原理、光通信技术和未来星际通信的可能性。',
      imageUrl: '/kepu/space-communication.jpg',
      linkUrl: 'https://www.nasa.gov/directorates/heo/scan/index.html',
    },
    {
      id: 'space-agriculture-1',
      type: 'article',
      title: '太空农业：在其他星球上种植食物',
      summary: '在太空和其他星球上种植食物是长期太空任务的关键。了解科学家如何解决无重力、辐射和有限资源下的植物生长问题。',
      imageUrl: '/kepu/space-agriculture.jpg',
      linkUrl: 'https://www.nasa.gov/content/growing-plants-in-space',
    }
  ];

  // 在组件中添加状态
  const [sciencePopContent, setSciencePopContent] = useState([]);

  // 提取科普内容的关键词
  const extractKeywords = (content) => {
    const keywords = new Set();
    
    // 从ID中提取关键词
    content.id.split('-').forEach(word => {
      if (word.length > 2) keywords.add(word.toLowerCase());
    });
    
    // 从标题中提取关键词
    content.title.toLowerCase().split(/\s+/).forEach(word => {
      // 过滤掉常见的停用词
      const stopWords = ['的', '在', '和', '与', '如何', '是', '：', '视频'];
      if (word.length > 1 && !stopWords.includes(word)) {
        keywords.add(word);
      }
    });
    
    // 从摘要中提取关键词
    const importantWords = [
      '太空', '宇宙', '火星', '月球', '黑洞', '望远镜', '卫星', 
      '行星', '恒星', '引力', '辐射', '航天', '宇航员', '太阳', 
      '星系', '轨道', '探测', '科学', '技术', '物理', '天文'
    ];
    
    importantWords.forEach(word => {
      if (content.summary.includes(word)) {
        keywords.add(word);
      }
    });
    
    return Array.from(keywords);
  };

  // 计算图片与科普内容的相关性分数
  const calculateRelevanceScore = (imagePath, keywords) => {
    let score = 0;
    const imageNameLower = imagePath.toLowerCase();
    
    keywords.forEach(keyword => {
      if (imageNameLower.includes(keyword)) {
        score += 10; // 直接匹配加10分
      } else {
        // 部分匹配检查
        const partialMatches = keyword.length > 4 ? 
          imageNameLower.includes(keyword.substring(0, 4)) : false;
        
        if (partialMatches) {
          score += 3; // 部分匹配加3分
        }
      }
    });
    
    return score;
  };

  // 添加一个状态来存储匹配调试信息
  const [matchingDebugInfo, setMatchingDebugInfo] = useState([]);
  const [showMatchingDebug, setShowMatchingDebug] = useState(false);

  // 修改findMostRelevantImage函数，收集调试信息
  const findMostRelevantImage = (content) => {
    const keywords = extractKeywords(content);
    
    // 计算每张图片的相关性分数
    const scoredImages = availableImages.map(imagePath => ({
      path: imagePath,
      score: calculateRelevanceScore(imagePath, keywords)
    }));
    
    // 按分数排序
    scoredImages.sort((a, b) => b.score - a.score);
    
    // 收集调试信息
    const debugInfo = {
      contentId: content.id,
      contentTitle: content.title,
      keywords: keywords,
      topMatches: scoredImages.slice(0, 5).map(img => ({
        path: img.path,
        score: img.score
      })),
      selectedImage: scoredImages[0].score > 0 ? scoredImages[0].path : availableImages[Math.floor(Math.random() * availableImages.length)]
    };
    
    // 返回分数最高的图片，如果所有图片分数为0，则随机选择一张
    if (scoredImages[0].score > 0) {
      return {
        path: scoredImages[0].path,
        debugInfo
      };
    } else {
      const randomIndex = Math.floor(Math.random() * availableImages.length);
      return {
        path: availableImages[randomIndex],
        debugInfo
      };
    }
  };

  // 修改useEffect，收集所有调试信息
  useEffect(() => {
    // 为每个科普内容分配相关图片，避免同一页面重复
    const assignImagesWithoutDuplication = () => {
      // 创建一个已分配图片的集合
      const assignedImages = new Set();
      // 创建一个调试信息列表
      const debugInfoList = [];
      // 按页面分组处理科普内容
      const totalPages = Math.ceil(originalSciencePopContent.length / scienceItemsPerPage);
      
      // 创建结果数组
      const result = [...originalSciencePopContent];
      
      // 为每一页分配图片
      for (let page = 0; page < totalPages; page++) {
        // 获取当前页的内容
        const startIndex = page * scienceItemsPerPage;
        const endIndex = Math.min(startIndex + scienceItemsPerPage, originalSciencePopContent.length);
        const currentPageItems = result.slice(startIndex, endIndex);
        
        // 当前页已使用的图片
        const currentPageImages = new Set();
        
        // 为当前页的每个内容项分配图片
        for (let i = 0; i < currentPageItems.length; i++) {
          const item = currentPageItems[i];
          const itemIndex = startIndex + i;
          
          // 获取内容的关键词
          const keywords = extractKeywords(item);
          
          // 计算每张图片的相关性分数
          const scoredImages = availableImages.map(imagePath => ({
            path: imagePath,
            score: calculateRelevanceScore(imagePath, keywords)
          }));
          
          // 按分数排序
          scoredImages.sort((a, b) => b.score - a.score);
          
          // 找到一个尚未在当前页使用的最高分图片
          let selectedImage = null;
          for (const img of scoredImages) {
            if (!currentPageImages.has(img.path) && img.score > 0) {
              selectedImage = img;
              break;
            }
          }
          
          // 如果没有找到合适的图片，使用随机未使用的图片
          if (!selectedImage) {
            const unusedImages = availableImages.filter(img => !currentPageImages.has(img));
            if (unusedImages.length > 0) {
              const randomIndex = Math.floor(Math.random() * unusedImages.length);
              selectedImage = { 
                path: unusedImages[randomIndex], 
                score: 0 
              };
            } else {
              // 如果所有图片都已使用，选择一个随机图片
              const randomIndex = Math.floor(Math.random() * availableImages.length);
              selectedImage = { 
                path: availableImages[randomIndex], 
                score: 0 
              };
            }
          }
          
          // 标记图片为已使用
          currentPageImages.add(selectedImage.path);
          assignedImages.add(selectedImage.path);
          
          // 收集调试信息
          const debugInfo = {
            contentId: item.id,
            contentTitle: item.title,
            keywords: keywords,
            topMatches: scoredImages.slice(0, 5).map(img => ({
              path: img.path,
              score: img.score
            })),
            selectedImage: selectedImage.path,
            page: page + 1
          };
          
          debugInfoList.push(debugInfo);
          
          // 更新结果数组
          result[itemIndex] = {
            ...item,
            imageUrl: selectedImage.path
          };
        }
      }
      
      return { contentWithImages: result, debugInfoList };
    };
    
    // 执行分配
    const { contentWithImages, debugInfoList } = assignImagesWithoutDuplication();
    
    // 更新状态
    setSciencePopContent(contentWithImages);
    setMatchingDebugInfo(debugInfoList);
  }, []);

  // 在组件中修改useEffect
  useEffect(() => {
    // 为每个科普内容分配相关图片
    const contentWithRelevantImages = originalSciencePopContent.map(item => {
      return {
        ...item,
        imageUrl: findMostRelevantImage(item).path
      };
    });
    
    setSciencePopContent(contentWithRelevantImages);
  }, []);

  // 修改获取当前页科普内容的函数，使用带有随机图片的内容
  const getCurrentPageScienceItems = () => {
    const startIndex = (currentSciencePage - 1) * scienceItemsPerPage;
    const endIndex = startIndex + scienceItemsPerPage;
    return sciencePopContent.slice(startIndex, endIndex);
  };
  
  // 计算科普内容的总页数
  const totalSciencePages = Math.ceil(sciencePopContent.length / scienceItemsPerPage);

  // 处理页码变化
  const handleSciencePageChange = (pageNumber) => {
    setCurrentSciencePage(pageNumber);
    // 滚动到页面顶部
    window.scrollTo({
      top: document.querySelector('.science-popularization-container').offsetTop - 100,
      behavior: 'smooth'
    });
  };

  // 在组件内添加图片错误处理函数
  const handleImageError = (e) => {
    e.target.src = '/kepu/fallback-space.jpg'; // 备用图片路径
  };

  // 在组件中添加预加载效果
  useEffect(() => {
    // 预加载当前页和下一页的图片
    const preloadImages = () => {
      const currentItems = getCurrentPageScienceItems();
      const nextPageItems = [];
      
      if (currentSciencePage < totalSciencePages) {
        const startIndex = currentSciencePage * scienceItemsPerPage;
        const endIndex = Math.min(startIndex + scienceItemsPerPage, sciencePopContent.length);
        nextPageItems.push(...sciencePopContent.slice(startIndex, endIndex));
      }
      
      // 合并当前页和下一页的项目
      const itemsToPreload = [...currentItems, ...nextPageItems];
      
      // 预加载图片
      itemsToPreload.forEach(item => {
        const img = new Image();
        img.src = item.imageUrl;
      });
    };
    
    preloadImages();
  }, [currentSciencePage]);

  // 修改调试面板组件
  const MatchingDebugPanel = () => {
    if (!showMatchingDebug) return null;
    
    // 按页面分组调试信息
    const groupedByPage = {};
    matchingDebugInfo.forEach(info => {
      if (!groupedByPage[info.page]) {
        groupedByPage[info.page] = [];
      }
      groupedByPage[info.page].push(info);
    });
    
    return (
      <div className="matching-debug-panel">
        <h2>图片匹配调试信息</h2>
        <button onClick={() => setShowMatchingDebug(false)}>关闭</button>
        
        {Object.keys(groupedByPage).map(page => (
          <div key={page} className="debug-page">
            <h3 className="page-title">第 {page} 页</h3>
            <div className="page-items">
              {groupedByPage[page].map((info, index) => (
                <div key={index} className="debug-item">
                  <h4>{info.contentTitle} (ID: {info.contentId})</h4>
                  <p><strong>提取的关键词:</strong> {info.keywords.join(', ')}</p>
                  <p><strong>选择的图片:</strong> {info.selectedImage}</p>
                  <div className="top-matches">
                    <h5>最佳匹配 (前5名):</h5>
                    <ul>
                      {info.topMatches.map((match, idx) => (
                        <li key={idx}>
                          {match.path} - 分数: {match.score}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <hr />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="gallery-container">
      <div className="gallery-page">
        <div className="gallery-header">
          <div className="header-content">
            <h1>太空科学交流社区</h1>
            <p>展示最优秀的太空科学实验项目和创新作品</p>
          </div>
          {isLoggedIn && <PublishButton onClick={handlePublish} />}
        </div>
        
        <div className="view-mode-tabs">
          <button
            className={`gallery-tab ${viewMode === 'gallery' ? 'active' : ''}`}
            onClick={() => setViewMode('gallery')}
          >
            太空论坛
          </button>
          <button
            className={`gallery-tab ${viewMode === 'experiments' ? 'active' : ''}`}
            onClick={() => setViewMode('experiments')}
          >
            实验示例
          </button>
          <button
            className={`gallery-tab ${viewMode === 'sciencePop' ? 'active' : ''}`}
            onClick={() => setViewMode('sciencePop')}
          >
            太空科普
          </button>
          <button
            className={`gallery-tab ${viewMode === 'challenge' ? 'active' : ''}`}
            onClick={() => setViewMode('challenge')}
          >
            太空实验挑战赛
          </button>
        </div>
        
        {viewMode === 'gallery' && (
          <div className="filter-buttons">
            <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>全部作品</button>
            <button onClick={() => setFilter('VR')} className={filter === 'VR' ? 'active' : ''}>VR</button>
            <button onClick={() => setFilter('太空')} className={filter === '太空' ? 'active' : ''}>太空</button>
            <button onClick={() => setFilter('模拟')} className={filter === '模拟' ? 'active' : ''}>模拟</button>
            <button onClick={() => setFilter('火星')} className={filter === '火星' ? 'active' : ''}>火星</button>
            <button onClick={() => setFilter('机器人')} className={filter === '机器人' ? 'active' : ''}>机器人</button>
            <button onClick={() => setFilter('控制系统')} className={filter === '控制系统' ? 'active' : ''}>控制系统</button>
            <button onClick={() => setFilter('天文')} className={filter === '天文' ? 'active' : ''}>天文</button>
            <button onClick={() => setFilter('可视化')} className={filter === '可视化' ? 'active' : ''}>可视化</button>
            <button onClick={() => setFilter('数据')} className={filter === '数据' ? 'active' : ''}>数据</button>
            <button onClick={() => setFilter('安全')} className={filter === '安全' ? 'active' : ''}>安全</button>
          </div>
        )}
        
        {viewMode === 'gallery' && (
          <>
      <div className="gallery-grid">
              {(filteredProjects?.length || 0) > 0 ? (
                filteredProjects.map(project => (
                  <div 
                    className="project-card" 
                    key={project.id}
                    data-project-id={project.id}
                    onClick={() => handleProjectClick(project)}
                  >
                    <div className="project-image">
                      <img 
                        src={project.imageUrl} 
                        alt={project.title}
                        onError={(e) => {
                          e.target.onerror = null; // 防止无限循环
                          e.target.src = 'https://via.placeholder.com/300x200?text=图片加载失败';
                        }}
                      />
                    </div>
                    <div className="project-content">
                      <h3>{project.title}</h3>
                      <p className="project-description">{project.description}</p>
                      <div className="project-meta">
                        <span 
                          className="project-author clickable-author" 
                          onClick={(e) => handleAuthorClick(e, project.author)}
                        >
                          作者: {project.author}
                        </span>
                        <span className="project-date">{project.date}</span>
                      </div>
                      <div className="project-tags">
                        {(project.tags || []).map(tag => (
                          <span 
                            className="tag" 
                            key={tag} 
                            onClick={(e) => {
                              e.stopPropagation(); // 阻止冒泡，避免触发卡片点击
                              setFilter(tag);
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="project-actions">
                        <button 
                          className={`action-button like-button ${project.liked ? 'liked' : ''}`}
                          onClick={(e) => handleLike(e, project.id)}
                        >
                          <i className="icon-like"></i>
                          <span>{project.likes}</span>
                        </button>
                        <button 
                          className="action-button comment-button"
                          onClick={(e) => handleCommentClick(e, project)}
                        >
                          <i className="icon-comment"></i>
                          <span>{(project.comments || []).length}</span>
                        </button>
                        {(project.author === username || isAdmin) && (
                          <button 
                            className="action-button delete-button"
                            onClick={(e) => handleDelete(e, project.id)}
                          >
                            <i className="icon-delete"></i>
                            <span>{isAdmin && project.author !== username ? '管理员删除' : '删除'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-projects">
                  <p>暂无符合条件的作品</p>
                </div>
              )}
            </div>
          </>
        )}
        
        {viewMode === 'experiments' && (
          <div className="experiments-container">
            <div className="experiments-grid">
              <div className="experiment-card">
                <div className="experiment-thumbnail" style={{
                  backgroundImage: "url('/images/space-simulator.jpg')"
                }}>
                  <span className="experiment-badge">最新</span>
                </div>
                <div className="experiment-content">
                  <h3 className="experiment-title">太空站模拟器</h3>
                  <p>一个交互式太空站模拟器，可以体验失重环境下的生活和工作</p>
                  <div className="experiment-meta">
                    <span className="experiment-date">2023年10月</span>
                    <span className="experiment-author">作者: 陈明</span>
                  </div>
                  <a href="/experiment/1" className="experiment-link">开始实验</a>
                </div>
              </div>
              
              <div className="experiment-card">
                <div className="experiment-thumbnail" style={{
                  backgroundImage: "url('/images/rocket-simulator.jpg')"
                }}></div>
                <div className="experiment-content">
                  <h3 className="experiment-title">火星探测车控制系统</h3>
                  <p>基于实际NASA数据开发的火星探测车控制系统，可以模拟在火星表面的探索任务</p>
                  <div className="experiment-meta">
                    <span className="experiment-date">2023年9月</span>
                    <span className="experiment-author">作者: 张伟</span>
                  </div>
                  <a href="/experiment/2" className="experiment-link">开始实验</a>
                </div>
              </div>
              
              <div className="experiment-card">
                <div className="experiment-thumbnail" style={{
                  backgroundImage: "url('/images/galaxy-formation.jpg')"
                }}></div>
                <div className="experiment-content">
                  <h3 className="experiment-title">太阳系行星轨道可视化</h3>
                  <p>基于真实天文数据的太阳系行星轨道三维可视化项目，包含历史轨迹和未来预测</p>
                  <div className="experiment-meta">
                    <span className="experiment-date">2023年8月</span>
                    <span className="experiment-author">作者: 王芳</span>
                  </div>
                  <a href="/experiment/3" className="experiment-link">开始实验</a>
                </div>
              </div>
              
              <div className="experiment-card">
                <div className="experiment-thumbnail" style={{
                  backgroundImage: "url('/images/space-debris.jpg')"
                }}></div>
                <div className="experiment-content">
                  <h3 className="experiment-title">太空垃圾追踪系统</h3>
                  <p>实时追踪地球轨道上的太空垃圾，并提供碰撞风险评估</p>
                  <div className="experiment-meta">
                    <span className="experiment-date">2023年7月</span>
                    <span className="experiment-author">作者: 李强</span>
                  </div>
                  <a href="/experiment/4" className="experiment-link">开始实验</a>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {viewMode === 'sciencePop' && (
          <div className="science-popularization-container" > 
            <h2 className="science-pop-title">
              太空科普知识
            </h2>
            <div className="science-pop-list"> 
              {getCurrentPageScienceItems().map(item => (
                <div key={item.id} className="science-item-card-horizontal"> 
                  <div className="science-item-image-container-horizontal">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="science-item-image-horizontal" 
                      onError={handleImageError} // 添加错误处理
                    />
                    {item.type === 'video' && 
                      <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="video-overlay-link">
                        <div className="video-overlay"><span className="play-icon">▶</span></div>
                      </a>
                    }
                  </div>
                  <div className="science-item-content-horizontal">
                    <h3 className="science-item-title">{item.title}</h3>
                    <p className="science-item-summary">{item.summary}</p>
                    {item.type === 'article' && 
                      <a 
                        href={item.linkUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="science-item-link"
                      >
                        阅读更多
                      </a>
                    }
                  </div>
                </div>
              ))}
            </div>
            
            {/* 添加分页控件 */}
            {totalSciencePages > 1 && (
              <div className="pagination-container">
                <button 
                  className="pagination-button"
                  onClick={() => handleSciencePageChange(currentSciencePage - 1)}
                  disabled={currentSciencePage === 1}
                >
                  上一页
                </button>
                
                <div className="pagination-numbers">
                  {Array.from({ length: totalSciencePages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      className={`pagination-number ${pageNum === currentSciencePage ? 'active' : ''}`}
                      onClick={() => handleSciencePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                
                <button 
                  className="pagination-button"
                  onClick={() => handleSciencePageChange(currentSciencePage + 1)}
                  disabled={currentSciencePage === totalSciencePages}
                >
                  下一页
                </button>
              </div>
            )}
          </div>
        )}
        
        {viewMode === 'challenge' && (
          <div className="challenge-section-layout">
            <div className="challenge-main-content">
              <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '2.2rem', color: '#e0f2fe', fontWeight: '600' }}>
                "问天杯"太空实验挑战赛 
              </h2>
              <div style={{ 
                background: 'rgba(30, 41, 59, 0.8)', 
                padding: '40px', 
                borderRadius: '15px',
                border: '1px solid rgba(97, 218, 251, 0.2)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
              }}>
                <h3 style={{color: '#90cdf4', borderBottom: '1px solid rgba(97, 218, 251, 0.1)', paddingBottom: '10px', marginBottom: '20px'}}>激发创意，探索无垠</h3>
                <p style={{ lineHeight: 1.8, fontSize: '1.1rem', marginBottom: '25px' }}>
                  欢迎加入首届"问天杯"太空实验挑战赛！我们邀请富有创造力和探索精神的你，设计能够在太空环境中进行的创新科学实验。这是一个将你的奇思妙想转化为潜在太空任务的绝佳机会。
                </p>

                <h3 style={{color: '#90cdf4', borderBottom: '1px solid rgba(97, 218, 251, 0.1)', paddingBottom: '10px', marginBottom: '20px'}}>参赛赛道</h3>
                <p style={{ lineHeight: 1.8, fontSize: '1.1rem', marginBottom: '10px' }}>本次挑战赛分为两个赛道：</p>
                <ul style={{ listStyle: 'disc', marginLeft: '25px', marginBottom: '25px', lineHeight: 1.7, fontSize: '1.05rem'}}>
                  <li><strong style={{color: '#faf089'}}>K-12 赛道：</strong>面向小学、初中及高中学生。鼓励提出富有想象力、原理清晰、具有教育意义或趣味性的实验方案。</li>
                  <li><strong style={{color: '#faf089'}}>大学生赛道：</strong>面向本科生及研究生。鼓励提出具有较高科学价值、技术可行性相对明确、具备创新性的实验方案。</li>
                </ul>

                <h3 style={{color: '#90cdf4', borderBottom: '1px solid rgba(97, 218, 251, 0.1)', paddingBottom: '10px', marginBottom: '20px'}}>方案提交</h3>
                <p style={{ lineHeight: 1.8, fontSize: '1.1rem', marginBottom: '15px' }}>
                  请根据您的赛道，下载对应的方案提交模板，详细阐述您的实验目的、原理、步骤、预期结果及可行性分析。我们鼓励图文并茂的方案。
                </p>
                <p style={{ lineHeight: 1.8, fontSize: '1.1rem', marginBottom: '25px' }}>
                  完成方案后，请将其发送至指定邮箱： 
                  <strong style={{color: '#63b3ed'}}>space.challenge@yourdomain.com</strong>。
                  邮件标题请注明："[赛道] 姓名 - 挑战赛方案提交"，例如："[K-12] 张三 - 挑战赛方案提交"。
                </p>
                <p style={{ lineHeight: 1.8, fontSize: '1.1rem', marginBottom: '25px', fontWeight: 'bold', color: '#faf089'}}>
                  提交截止日期：{registrationEndDate.toLocaleDateString('zh-CN')}
                </p>

                <h3 style={{color: '#90cdf4', borderBottom: '1px solid rgba(97, 218, 251, 0.1)', paddingBottom: '10px', marginBottom: '20px'}}>模板下载</h3>
                <p style={{ lineHeight: 1.8, fontSize: '1.1rem', marginBottom: '15px' }}>
                  点击下方链接下载方案提交模板（.docx 格式）：
                </p>
                <div style={{textAlign: 'center'}}>
                  <a 
                    href="/templates/space_challenge_template.docx" 
                    download 
                    className="science-item-link"
                  >
                    下载方案模板
                  </a>
                </div>

                <h3 style={{color: '#90cdf4', borderBottom: '1px solid rgba(97, 218, 251, 0.1)', paddingBottom: '10px', marginBottom: '20px'}}>奖项设置</h3>
                <p style={{ lineHeight: 1.8, fontSize: '1.1rem', marginBottom: '15px' }}>
                  各赛道将评选出一、二、三等奖及优秀奖若干名，颁发丰厚奖品及荣誉证书。
                </p>
                <p style={{ lineHeight: 1.8, fontSize: '1.15rem', fontWeight: 'bold', color: '#faf089', marginBottom: '10px'}}>
                  ✨ 特别大奖：最具潜力的优胜方案将有机会获得专家团队的全方位指导，并争取搭载我们的合作飞船，真正将您的实验送入太空！✨
                </p>
                
                <p style={{ lineHeight: 1.8, fontSize: '1.1rem', marginTop: '30px', borderTop: '1px solid rgba(97, 218, 251, 0.1)', paddingTop: '20px' }}>
                  如有任何疑问，请联系：<strong style={{color: '#63b3ed'}}>space.challenge@yourdomain.com</strong>
                </p>
              </div>
            </div>

            <div className="challenge-sidebar">
              <div className="timeline">
                <h3 className="timeline-title">比赛流程</h3>
                <div className={`timeline-step ${getStatusClass('register')}`}>
                  <div className="step-content">
                    <h4 className="step-title">报名阶段</h4>
                    <p className="step-date">截止：{registrationEndDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</p>
                    <p className="step-desc">提交您的创新实验方案。</p>
                  </div>
                </div>
                <div className={`timeline-step ${getStatusClass('preliminary')}`}>
                  <div className="step-content">
                    <h4 className="step-title">初赛评审</h4>
                    <p className="step-date">日期：{preliminaryDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</p>
                    <p className="step-desc">专家评审，筛选入围决赛作品。</p>
                  </div>
                </div>
                <div className={`timeline-step ${getStatusClass('final')}`}>
                  <div className="step-content">
                    <h4 className="step-title">决赛答辩</h4>
                    <p className="step-date">日期：{finalDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</p>
                    <p className="step-desc">现场展示与答辩，角逐最终大奖。</p>
                  </div>
                </div>
                 <div className={`timeline-step ${getStatusClass('ended')}`}>
                  <div className="step-content">
                    <h4 className="step-title">公布结果</h4>
                    <p className="step-desc">比赛结束，感谢您的参与！</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {showUploadModal && (
          <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="upload-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>上传您的作品</h2>
                <button className="close-button" onClick={() => setShowUploadModal(false)}>×</button>
              </div>
              
              <form className="upload-form" onSubmit={handleUpload}>
                <div className="form-group">
                  <label htmlFor="title">作品标题</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={uploadData.title}
                    onChange={handleInputChange}
                    placeholder="请输入作品标题"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">作品描述</label>
                  <textarea
                    id="description"
                    name="description"
                    value={uploadData.description}
                    onChange={handleInputChange}
                    placeholder="请描述您的作品..."
                    required
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label htmlFor="tags">标签</label>
                  <div className="tags-input-container">
                    <input
                      type="text"
                      id="tags"
                      value={tagInput}
                      onChange={handleTagInputChange}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="输入标签后按回车键添加"
                    />
                    <button 
                      type="button" 
                      className="add-tag-button" 
                      onClick={handleAddTag}
                    >
                      添加
                    </button>
                  </div>
                  
                  {uploadData.tags.length > 0 && (
                    <div className="tags-container">
                      {uploadData.tags.map((tag, index) => (
                        <div className="tag-item" key={index}>
                          <span>{tag}</span>
                          <button 
                            type="button"
                            className="remove-tag-button"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <small className="form-hint">添加标签可以帮助他人更好地发现您的作品</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="file">上传文件</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.zip,.doc,.docx"
                      className="file-input"
                    />
                    <div className="file-upload-button">
                      选择文件
                    </div>
                    <span className="selected-file-name">
                      {selectedFile ? selectedFile.name : '未选择文件'}
                    </span>
                  </div>
                </div>
                
                {previewUrl && (
                  <div className="preview-container">
                    <h4>预览</h4>
                    <img src={previewUrl} alt="预览" className="file-preview" />
                  </div>
                )}
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setShowUploadModal(false)}
                  >
                    取消
                  </button>
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={!selectedFile || !uploadData.title}
                  >
                    上传作品
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDetailModal && selectedProject && (
          <div className="detail-modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="detail-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedProject.title}</h2>
                <button className="close-button" onClick={() => setShowDetailModal(false)}>×</button>
              </div>
              
              <div className="detail-content">
                <div className="detail-image">
                  <img src={selectedProject.imageUrl} alt={selectedProject.title} />
                </div>
                
                <div className="detail-info">
                  <div className="detail-meta">
                    <span 
                      className="detail-author clickable-author"
                      onClick={(e) => handleAuthorClick(e, selectedProject.author)}
                    >
                      作者: {selectedProject.author}
                    </span>
                    <span className="detail-date">发布日期: {selectedProject.date}</span>
                  </div>
                  
                  <div className="detail-tags">
                    {selectedProject.tags.map(tag => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="detail-section">
                    <h3>项目描述</h3>
                    <div className="detail-description">
                      {selectedProject.detailedDescription.split('\n\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h3>设备要求</h3>
                    <p>{selectedProject.equipment}</p>
                  </div>
                  
                  <div className="detail-section">
                    <h3>系统要求</h3>
                    <p>{selectedProject.requirements}</p>
                  </div>
                  
                  {selectedProject.collaborators && selectedProject.collaborators.length > 0 && (
                    <div className="detail-section">
                      <h3>项目合作者</h3>
                      <ul className="collaborators-list">
                        {selectedProject.collaborators.map((collaborator, index) => (
                          <li key={index}>{collaborator}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="detail-section">
                    <div className="detail-comments-header">
                      <h3>评论 ({selectedProject.comments.length})</h3>
                      {isLoggedIn && (
                        <button 
                          className="add-comment-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCommentProject(selectedProject);
                            setCommentText('');
                            setShowCommentModal(true);
                          }}
                        >
                          添加评论
                        </button>
                      )}
                    </div>
                    
                    {selectedProject.comments.length > 0 ? (
                      <ul className="comments-list">
                        {(selectedProject.comments || []).map(comment => (
                          <li key={comment.id} className="comment-item">
                            <div className="comment-header">
                              <span 
                                className="comment-author clickable-author"
                                onClick={(e) => handleAuthorClick(e, comment.user)}
                              >
                                {comment.user}
                              </span>
                              <span className="comment-date">{comment.date}</span>
                              {(comment.user === username || isAdmin) && (
                                <button
                                  className="delete-comment-button"
                                  onClick={(e) => handleDeleteComment(selectedProject.id, comment.id)}
                                >
                                  删除
                                </button>
                              )}
                            </div>
                            <p className="comment-text">{comment.text}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-comments">暂无评论，快来发表第一条评论吧！</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {showCommentModal && commentProject && (
          <div className="comment-modal-overlay" onClick={() => setShowCommentModal(false)}>
            <div className="comment-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>发表评论</h2>
                <button className="close-button" onClick={() => setShowCommentModal(false)}>×</button>
              </div>
              
              <form className="comment-form" onSubmit={handleSubmitComment}>
                <div className="form-group">
                  <label htmlFor="comment">您对"{commentProject.title}"的评论</label>
                  <textarea
                    id="comment"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="请输入您的评论..."
                    required
                  ></textarea>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setShowCommentModal(false)}
                  >
                    取消
                  </button>
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={!commentText.trim()}
                  >
                    提交评论
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 其他用户个人资料模态框 */}
        {showOtherUserProfile && viewingUser && (
          <ProfileModal
            isOpen={showOtherUserProfile}
            onClose={() => setShowOtherUserProfile(false)}
            username={viewingUser}
          />
        )}
      </div>
    </div>
  );
};

export default Gallery; 