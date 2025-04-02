import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gallery.css';
import PublishButton from '../components/PublishButton';

const Gallery = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    tags: ''
  });
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
    
    return () => window.removeEventListener('storage', checkAuth);
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
      let projectComments = [...project.comments];
      
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

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理作品上传
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
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('tags', JSON.stringify(uploadData.tags.split(',').map(tag => tag.trim())));
      
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
      setProjects([result.project, ...projects]);
      
      // 重置表单
      setUploadData({
        title: '',
        description: '',
        tags: ''
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
        return prevProjects.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              liked: !project.liked,
              likes: project.liked ? project.likes - 1 : project.likes + 1
            };
          }
          return project;
        });
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
        return prevProjects.map(project => {
          if (project.id === commentProject.id) {
            return {
              ...project,
              comments: [...project.comments, data.comment]
            };
          }
          return project;
        });
      });

      setShowCommentModal(false);
      setCommentText('');
      alert('评论成功');
    } catch (error) {
      console.error('评论错误:', error);
      alert(error.message || '评论失败，请稍后重试');
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
        setProjects(prevProjects => 
          prevProjects.filter(project => project.id !== projectId)
        );

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
        const response = await fetch('http://localhost:5000/api/projects');
        if (!response.ok) {
          throw new Error('获取项目列表失败');
        }
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('获取项目列表错误:', error);
      }
    };

    fetchProjects();
  }, []);

  // 添加删除评论函数
  const handleDeleteComment = async (projectId, commentId) => {
    if (window.confirm('确定要删除这条评论吗？')) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/projects/${projectId}/comments/${commentId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '删除失败');
        }

        // 更新项目列表中的评论
        setProjects(prevProjects => {
          return prevProjects.map(project => {
            if (project.id === projectId) {
              return {
                ...project,
                comments: project.comments.filter(comment => comment.id !== commentId)
              };
            }
            return project;
          });
        });

        alert('评论删除成功');
      } catch (error) {
        console.error('删除评论错误:', error);
        alert(error.message || '删除失败，请稍后重试');
      }
    }
  };

  // ---> 太空科普内容数据 <---
  const sciencePopContent = [
    {
      id: 'jwst-1',
      type: 'article',
      title: '韦伯望远镜揭示宇宙奥秘',
      summary: '探索詹姆斯·韦伯太空望远镜拍摄的最新震撼图像和科学发现，以前所未有的清晰度揭示遥远星系和恒星的诞生。',
      // Updated JWST Image (Carina Nebula by JWST)
      imageUrl: 'https://images.unsplash.com/photo-1657664042448-c955b6c1effa?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
      linkUrl: 'https://science.nasa.gov/mission/webb/',
    },
    {
      id: 'mars-life-1',
      type: 'article',
      title: '毅力号：在火星寻找生命的痕迹',
      summary: 'NASA的"毅力号"火星车继续在红色星球上寻找古代微生物生命的迹象。了解它的任务、最新发现和面临的挑战。',
      // Updated Perseverance Image
      imageUrl: 'https://images.unsplash.com/photo-1614729936577-98145a137921?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
      linkUrl: 'https://science.nasa.gov/mission/perseverance/',
    },
    {
      id: 'blackhole-1',
      type: 'video',
      title: '视频：黑洞是如何运作的？',
      summary: '一个引人入胜的科普视频，解释了黑洞背后的奇妙物理学、它们如何形成以及对时空产生的深刻影响。',
      // Updated Black Hole Visualization Image
      imageUrl: 'https://images.unsplash.com/photo-1584967907538-43c6ae603f3d?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
      linkUrl: 'https://www.youtube.com/watch?v=e-P5IFTqB9c',
    },
      {
      id: 'starship-1',
      type: 'article',
      title: '星舰：通往月球和火星的阶梯',
      summary: '了解SpaceX的星舰计划，其探索月球和火星的宏伟目标，以及最近测试飞行的进展和未来的展望。',
      // Updated Starship Image
      imageUrl: 'https://images.unsplash.com/photo-1638286167548-0e0492a7f047?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
      linkUrl: 'https://www.spacex.com/vehicles/starship/',
    },
  ];

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
            作品展
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
                        <span className="project-author">作者: {project.author}</span>
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
                          <span>{project.comments.length}</span>
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
              {sciencePopContent.map(item => (
                <div key={item.id} className="science-item-card-horizontal"> 
                  <div className="science-item-image-container-horizontal">
                     <img src={item.imageUrl} alt={item.title} className="science-item-image-horizontal" />
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
                  <strong style={{color: '#63b3ed'}}>space.challenge@yourdomain.com</strong> 
                  <span style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)'}}> (请替换为您的真实邮箱地址)</span>。
                  邮件标题请注明："[赛道] 姓名 - 挑战赛方案提交"，例如："[K-12] 张三 - 挑战赛方案提交"。
                </p>
                <p style={{ lineHeight: 1.8, fontSize: '1.1rem', marginBottom: '25px', fontWeight: 'bold', color: '#faf089'}}>
                  提交截止日期：{registrationEndDate.toLocaleDateString('zh-CN')} (请设置具体日期)
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
                 <p style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: '10px'}}> 
                   (请确保 /public/templates/space_challenge_template.docx 文件存在)
                 </p>

                <h3 style={{color: '#90cdf4', borderBottom: '1px solid rgba(97, 218, 251, 0.1)', paddingBottom: '10px', margin: '35px 0 20px 0'}}>奖项设置</h3>
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
                <div className={`timeline-step ${getStatusClass('register')}">
                  <h4 className="step-title">报名阶段</h4>
                  <p className="step-date">截止：{registrationEndDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</p>
                  <p className="step-desc">提交您的创新实验方案。</p>
                </div>
                <div className={`timeline-step ${getStatusClass('preliminary')}">
                  <h4 className="step-title">初赛评审</h4>
                  <p className="step-date">日期：{preliminaryDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</p>
                  <p className="step-desc">专家评审，筛选入围决赛作品。</p>
                </div>
                <div className={`timeline-step ${getStatusClass('final')}">
                  <h4 className="step-title">决赛答辩</h4>
                  <p className="step-date">日期：{finalDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</p>
                  <p className="step-desc">现场展示与答辩，角逐最终大奖。</p>
                </div>
                 <div className={`timeline-step ${getStatusClass('ended')}">
                  <h4 className="step-title">公布结果</h4>
                  <p className="step-desc">比赛结束，感谢您的参与！</p>
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
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={uploadData.tags}
                    onChange={handleInputChange}
                    placeholder="用逗号分隔多个标签，如：太空,模拟,VR"
                  />
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
                    <span className="detail-author">作者: {selectedProject.author}</span>
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
                        {selectedProject.comments.map(comment => (
                          <li key={comment.id} className="comment-item">
                            <div className="comment-header">
                              <span className="comment-author">{comment.user}</span>
                              <span className="comment-date">{comment.date}</span>
                              {(comment.user === username || isAdmin) && (
                                <button
                                  className="delete-comment-button"
                                  onClick={() => handleDeleteComment(selectedProject.id, comment.id)}
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
      </div>
    </div>
  );
};

export default Gallery; 