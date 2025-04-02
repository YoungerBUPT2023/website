import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ExperimentDetail.css';

const ExperimentDetail = () => {
  const { id } = useParams();
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 模拟从服务器获取实验数据
    const fetchExperiment = async () => {
      try {
        setLoading(true);
        
        // 这里可以替换为实际的API调用
        // const response = await fetch(`http://localhost:5000/api/experiments/${id}`);
        // if (!response.ok) throw new Error('实验数据获取失败');
        // const data = await response.json();
        
        // 模拟数据
        const experimentData = {
          1: {
            id: 1,
            title: '太空模拟器',
            description: '探索行星轨道和重力场的交互式宇宙模拟实验',
            fullDescription: `
              <p>太空模拟器是一个交互式的虚拟实验平台，旨在帮助学生和研究人员更好地理解行星运动、重力场以及太空环境中的各种物理现象。</p>
              
              <p>在这个实验中，用户可以：</p>
              <ul>
                <li>创建和配置不同质量、大小的天体</li>
                <li>调整初始速度和轨道参数</li>
                <li>观察重力相互作用和轨道演化</li>
                <li>模拟太阳系中的行星运动</li>
                <li>探索拉格朗日点和引力辅助技术</li>
              </ul>
              
              <p>该模拟器采用高精度的物理引擎，能够准确模拟牛顿力学和开普勒定律描述的天体运动，同时提供直观的可视化界面，帮助用户理解复杂的物理概念。</p>
            `,
            author: '陈明',
            date: '2023年10月',
            imageUrl: '/images/space-simulator.jpg',
            equipment: '标准计算机或平板设备，支持WebGL的浏览器',
            duration: '45-60分钟',
            difficulty: '中级',
            tags: ['天文学', '物理', '模拟', 'WebGL'],
            steps: [
              {
                title: '实验准备',
                content: '确保您的设备已连接互联网，并使用最新版本的Chrome、Firefox或Safari浏览器。'
              },
              {
                title: '基础操作',
                content: '学习如何创建天体、调整视角和控制模拟速度。'
              },
              {
                title: '轨道设计',
                content: '尝试设计稳定的行星轨道，观察开普勒定律的应用。'
              },
              {
                title: '多体系统',
                content: '创建包含多个天体的复杂系统，观察它们之间的相互作用。'
              },
              {
                title: '数据分析',
                content: '收集模拟数据，分析轨道参数和能量守恒情况。'
              }
            ],
            relatedExperiments: [2, 3]
          },
          2: {
            id: 2,
            title: '火箭发射模拟',
            description: '体验火箭发射的各个阶段，调整参数以达到最佳飞行轨迹',
            fullDescription: `
              <p>火箭发射模拟器是一个高度逼真的交互式平台，让用户体验从火箭设计到发射的全过程。</p>
              
              <p>这个实验模拟了火箭发射的各个关键阶段：</p>
              <ul>
                <li>火箭设计与参数配置</li>
                <li>发动机点火与初始升空</li>
                <li>大气层内飞行与气动特性</li>
                <li>级间分离与轨道注入</li>
                <li>轨道机动与任务规划</li>
              </ul>
              
              <p>通过调整推力、燃料比例、气动外形等参数，用户可以优化火箭设计，实现更高效的轨道注入。</p>
            `,
            author: '李华',
            date: '2023年9月',
            imageUrl: '/images/rocket-simulator.jpg',
            equipment: '标准计算机，支持3D图形的浏览器',
            duration: '60-90分钟',
            difficulty: '高级',
            tags: ['航天', '工程', '物理', '模拟'],
            steps: [
              {
                title: '火箭设计',
                content: '选择火箭类型，配置发动机参数和燃料装载量。'
              },
              {
                title: '发射准备',
                content: '设置发射参数，包括发射角度、初始推力等。'
              },
              {
                title: '发射执行',
                content: '启动发射程序，观察火箭升空过程。'
              },
              {
                title: '轨道注入',
                content: '控制火箭进行轨道注入操作，达到预定轨道。'
              },
              {
                title: '任务评估',
                content: '分析发射效率、燃料消耗和轨道精度。'
              }
            ],
            relatedExperiments: [1, 3]
          },
          3: {
            id: 3,
            title: '星系形成',
            description: '观察星系形成过程中的物理现象，互动式调整参数',
            fullDescription: `
              <p>星系形成模拟器是一个基于最新天体物理学理论的计算模型，展示了从宇宙早期气体云到成熟星系的演化过程。</p>
              
              <p>在这个实验中，用户可以：</p>
              <ul>
                <li>模拟不同初始条件下的星系形成</li>
                <li>观察暗物质晕的影响</li>
                <li>研究星系碰撞与合并现象</li>
                <li>分析恒星形成率与气体动力学</li>
                <li>探索不同类型星系的形成机制</li>
              </ul>
              
              <p>该模拟器结合了N体模拟和流体动力学计算，能够呈现从宏观结构到局部恒星形成的多尺度过程。</p>
            `,
            author: '王小明',
            date: '2023年8月',
            imageUrl: '/images/galaxy-formation.jpg',
            equipment: '高性能计算机，支持WebGL 2.0的浏览器',
            duration: '90-120分钟',
            difficulty: '专家',
            tags: ['天体物理', '宇宙学', '计算模拟'],
            steps: [
              {
                title: '初始条件设置',
                content: '配置初始气体分布、暗物质分布和宇宙学参数。'
              },
              {
                title: '演化模拟',
                content: '启动模拟，观察从早期宇宙到现在的星系演化过程。'
              },
              {
                title: '结构分析',
                content: '分析星系形态、密度分布和旋转曲线。'
              },
              {
                title: '参数调整',
                content: '调整关键物理参数，观察对星系形成的影响。'
              },
              {
                title: '比较研究',
                content: '将模拟结果与观测数据进行比较，评估模型准确性。'
              }
            ],
            relatedExperiments: [1, 2]
          }
        };
        
        // 获取指定ID的实验
        const selectedExperiment = experimentData[id];
        
        if (!selectedExperiment) {
          throw new Error('未找到该实验');
        }
        
        setExperiment(selectedExperiment);
        setLoading(false);
      } catch (error) {
        console.error('获取实验数据失败:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchExperiment();
  }, [id]);

  if (loading) {
    return (
      <div className="experiment-detail-container loading">
        <div className="loading-spinner"></div>
        <p>加载实验数据中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="experiment-detail-container error">
        <h2>出错了</h2>
        <p>{error}</p>
        <Link to="/" className="back-button">返回首页</Link>
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="experiment-detail-container error">
        <h2>未找到实验</h2>
        <p>抱歉，您请求的实验不存在。</p>
        <Link to="/" className="back-button">返回首页</Link>
      </div>
    );
  }

  return (
    <div className="experiment-detail-container">
      <div className="experiment-header">
        <div className="experiment-header-content">
          <h1>{experiment.title}</h1>
          <div className="experiment-meta">
            <span className="experiment-author">作者: {experiment.author}</span>
            <span className="experiment-date">发布日期: {experiment.date}</span>
            <span className="experiment-difficulty">难度: {experiment.difficulty}</span>
            <span className="experiment-duration">时长: {experiment.duration}</span>
          </div>
          <div className="experiment-tags">
            {experiment.tags.map((tag, index) => (
              <span key={index} className="experiment-tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="experiment-content">
        <div className="experiment-main">
          <div className="experiment-image">
            <img src={experiment.imageUrl} alt={experiment.title} />
          </div>
          
          <div className="experiment-description">
            <h2>实验概述</h2>
            <p>{experiment.description}</p>
            <div dangerouslySetInnerHTML={{ __html: experiment.fullDescription }} />
          </div>
          
          <div className="experiment-steps">
            <h2>实验步骤</h2>
            <div className="steps-timeline">
              {experiment.steps.map((step, index) => (
                <div key={index} className="step-item">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-content">
                    <h3>{step.title}</h3>
                    <p>{step.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="experiment-sidebar">
          <div className="sidebar-section">
            <h3>设备要求</h3>
            <p>{experiment.equipment}</p>
          </div>
          
          <div className="sidebar-section">
            <h3>开始实验</h3>
            <button className="start-experiment-button">
              立即开始
            </button>
            <p className="experiment-note">
              注意：实验过程中请勿刷新页面，以免丢失实验数据。
            </p>
          </div>
          
          <div className="sidebar-section">
            <h3>相关实验</h3>
            <ul className="related-experiments">
              {experiment.relatedExperiments.map(relId => {
                const relatedExp = {
                  1: { title: '太空模拟器', id: 1 },
                  2: { title: '火箭发射模拟', id: 2 },
                  3: { title: '星系形成', id: 3 }
                }[relId];
                
                return (
                  <li key={relId}>
                    <Link to={`/experiment/${relId}`}>{relatedExp.title}</Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperimentDetail; 