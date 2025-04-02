import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router-dom';
import * as THREE from 'three';
import { FaCopy, FaDownload } from 'react-icons/fa';
import ExperimentCanvas from '../components/ExperimentCanvas';
import './ExperimentLab.css';

function ExperimentLab() {
  const { id } = useParams();
  const [experimentSteps, setExperimentSteps] = useState(`1、在封闭透明实验腔内利用 "静电吸附板" 固定一些水滴在合适位置。
2、在封闭透明实验腔的两头安装 "超声波模块"，并通过 "可编程控制单元与机械微调装置" 调整频率。
3、利用 "高分辨率摄像头与多光谱光源" 实时记录实验过程，同时通过 "多参数传感器套件" 监测实验环境参数，观察水滴实现周期性的排列，相互之间的距离为一个波长。`);
  const [generatedCode, setGeneratedCode] = useState('// 这里将显示根据您的实验流程生成的分析');
  const [displayedCode, setDisplayedCode] = useState('// 这里将显示根据您的实验流程生成的分析');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [processingSteps, setProcessingSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [rawApiResponse, setRawApiResponse] = useState(null);
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);
  
  const fullCodeRef = useRef('');
  const typingSpeedRef = useRef(5); // 基础打字速度（毫秒）
  const typingIntervalRef = useRef(null);
  const codeOutputRef = useRef(null); // 对代码输出区域的引用
  const processingStepsRef = useRef([
    { 
      id: 1, 
      text: "正在连接扣子API平台...", 
      duration: 3000,
      completeText: "调用成功"
    },
    { 
      id: 2, 
      text: "正在提取实验关键信息...", 
      duration: 7000,
      progressText: "已识别实验关键组件和参数",
      showProgressAfter: 2000
    },
    { 
      id: 3, 
      text: "正在分析实验物理原理...", 
      duration: 10000,
      progressText: "已理解实验基本物理模型",
      showProgressAfter: 5000
    },
    { 
      id: 4, 
      text: "正在计算实验预期结果...", 
      duration: 5000
    },
    { 
      id: 5, 
      text: "正在整合分析结论...", 
      duration: 4000
    },
    { 
      id: 6, 
      text: "正在优化实验建议...", 
      duration: 4000
    },
    { 
      id: 7, 
      text: "稍等，正在输出分析报告...", 
      duration: 2000
    }
  ]);

  useEffect(() => {
    initStarryBackground();
    checkWebGLSupport();
  }, []);

  // 安全地清除打字机定时器
  const clearTypingInterval = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  }, []);
  
  // 在组件卸载时清除定时器
  useEffect(() => {
    return () => clearTypingInterval();
  }, [clearTypingInterval]);
  
  // 自动滚动到底部函数
  const scrollToBottom = useCallback(() => {
    if (codeOutputRef.current) {
      codeOutputRef.current.scrollTop = codeOutputRef.current.scrollHeight;
    }
  }, []);
  
  // 处理打字机效果
  useEffect(() => {
    if (isTyping && fullCodeRef.current) {
      let currentIndex = 0;
      const fullText = fullCodeRef.current;
      
      // 清空当前显示的代码，准备逐字显示
      setDisplayedCode('');
      
      // 清除之前的定时器
      clearTypingInterval();
      
      // 设置新的定时器逐字显示文本
      typingIntervalRef.current = setInterval(() => {
        if (currentIndex < fullText.length) {
          // 添加当前字符
          setDisplayedCode(prev => prev + fullText.charAt(currentIndex));
          currentIndex++;
          
          // 更快的打字速度，减少随机延迟
          const currentChar = fullText.charAt(currentIndex);
          if (currentChar === '\n' || currentChar === ';' || currentChar === '.') {
            // 遇到这些字符时，只有轻微延迟
            typingSpeedRef.current = Math.floor(Math.random() * 10) + 5;
          } else {
            // 其他字符更快
            typingSpeedRef.current = Math.floor(Math.random() * 5) + 3;
          }
          
          // 代码注释部分稍微减慢速度
          if (fullText.substring(currentIndex - 2, currentIndex) === '//') {
            typingSpeedRef.current = Math.floor(Math.random() * 10) + 8;
          }
          
          // 如果是大段文本，批量添加字符，提高性能和速度
          if (fullText.length > 1000 && currentIndex % 100 === 0) {
            const nextChunk = Math.min(currentIndex + 100, fullText.length);
            setDisplayedCode(prev => prev + fullText.substring(currentIndex, nextChunk));
            currentIndex = nextChunk;
          }
          
          // 每添加10个字符后滚动到底部
          if (currentIndex % 10 === 0) {
            setTimeout(scrollToBottom, 0);
          }
        } else {
          // 打字完成
          clearTypingInterval();
          setIsTyping(false);
          // 确保最后一次滚动到底部
          setTimeout(scrollToBottom, 0);
        }
      }, typingSpeedRef.current);
    }
    
    return () => clearTypingInterval();
  }, [isTyping, clearTypingInterval, scrollToBottom]);

  // 处理步骤的自动进度
  useEffect(() => {
    if (!isGenerating || currentStepIndex === -1) return;
    
    // 获取当前步骤
    const currentStep = processingStepsRef.current[currentStepIndex];
    if (!currentStep) return;
    
    // 设置当前步骤显示进度文本的定时器
    let progressTextTimer = null;
    if (currentStep.progressText && currentStep.showProgressAfter) {
      progressTextTimer = setTimeout(() => {
        setProcessingSteps(prevSteps => 
          prevSteps.map((step, index) => 
            index === currentStepIndex ? { ...step, showProgress: true } : step
          )
        );
      }, currentStep.showProgressAfter);
    }
    
    // 返回清理函数
    return () => {
      if (progressTextTimer) clearTimeout(progressTextTimer);
    };
  }, [isGenerating, currentStepIndex]);

  // 初始化处理步骤
  useEffect(() => {
    if (isGenerating) {
      // 重置已完成步骤列表
      setCompletedSteps([]);
      
      // 设置处理步骤
      setProcessingSteps(processingStepsRef.current.map(step => ({
        ...step,
        showProgress: false,
        status: 'pending'
      })));
      setCurrentStepIndex(0);
      
      // 使用自定义的定时器链式执行每个步骤
      const executeSteps = async () => {
        for (let i = 0; i < processingStepsRef.current.length; i++) {
          const step = processingStepsRef.current[i];
          
          // 设置当前步骤索引
          setCurrentStepIndex(i);
          
          // 等待当前步骤的执行时间
          await new Promise(resolve => setTimeout(resolve, step.duration));
          
          // 将当前步骤标记为已完成
          setCompletedSteps(prev => [...prev, i]);
          
          // 停止链式执行如果不再处于生成状态
          if (!isGenerating) break;
        }
      };
      
      executeSteps();
    } else {
      // 重置处理步骤
      setCurrentStepIndex(-1);
    }
  }, [isGenerating]);

  const initStarryBackground = () => {
    const canvas = document.getElementById('starry-bg');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const stars = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5
      });
    }
    
    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        ctx.fillStyle = '#61dafb';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
  };

  const handleGenerateCode = async () => {
    if (!experimentSteps.trim()) {
      setDisplayedCode('// 请先输入实验流程！');
      return;
    }

    // 如果正在生成代码或打字，不要重复请求
    if (isGenerating || isTyping) return;

    // 重置状态
    setIsGenerating(true);
    setHasError(false);
    setRawApiResponse(null);
    setShowRawResponse(false);
    
    // 清空当前显示的代码，准备显示处理步骤
    setDisplayedCode('');
    
    try {
      // 添加超时处理，60秒后如果没有响应就超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await axios.post('/chat', {
        message: experimentSteps
      }, {
        signal: controller.signal,
        timeout: 60000 // 设置超时时间为60秒
      });
      
      clearTimeout(timeoutId);
      
      // 保存原始响应以便调试
      setRawApiResponse(response.data);
      
      // 将最后一个步骤标记为完成
      setCompletedSteps(prev => [...prev, processingStepsRef.current.length - 1]);
      
      if (response.data && response.data.response) {
        setGeneratedCode(response.data.response);
        
        // 存储完整代码并开始打字机效果
        fullCodeRef.current = response.data.response;
        setIsTyping(true);
      } else {
        const errorMessage = '// API 返回格式不正确\n// 返回数据：' + JSON.stringify(response.data, null, 2);
        setDisplayedCode(errorMessage);
        setHasError(true);
      }
    } catch (error) {
      console.error('生成分析时出错:', error);
      let errorMessage = error.message;
      
      // 处理特定类型的错误
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        errorMessage = '请求超时，服务器响应时间过长。请稍后重试或检查服务器状态。';
      } else if (error.response) {
        // 服务器返回了错误状态码
        errorMessage = `服务器返回错误 (${error.response.status}): ${error.response.data?.message || '未知错误'}`;
        setRawApiResponse(error.response.data);
      } else if (error.request) {
        // 请求已发送但没有收到响应
        errorMessage = '没有收到服务器响应，请检查API服务是否正在运行。';
      }
      
      setDisplayedCode(`// 生成分析时出现错误：\n// ${errorMessage}`);
      setHasError(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // 切换显示原始API响应
  const toggleRawResponse = () => {
    if (showRawResponse) {
      // 切回显示解析后的代码
      setShowRawResponse(false);
      setDisplayedCode(fullCodeRef.current);
    } else if (rawApiResponse) {
      // 显示原始响应
      setShowRawResponse(true);
      // 格式化JSON以便更好地显示
      setDisplayedCode(
        typeof rawApiResponse === 'string' 
          ? rawApiResponse 
          : JSON.stringify(rawApiResponse, null, 2)
      );
    }
  };

  // 渲染处理步骤和状态指示器
  const renderProcessingSteps = () => {
    if (!isGenerating && !isTyping) return null;
    
    return (
      <div className="processing-steps">
        {processingSteps.map((step, index) => {
          let statusClass = "step-indicator";
          const isCompleted = completedSteps.includes(index);
          const isActive = index === currentStepIndex;
          
          if (isCompleted) {
            statusClass += " completed"; // 已完成步骤显示绿色对钩
          } else if (isActive) {
            statusClass += " active"; // 当前步骤显示转动的圆圈
          }
          
          return (
            <div key={step.id} className={`processing-step ${isActive || isCompleted ? 'visible' : ''}`}>
              <div className={statusClass}>
                {isCompleted ? (
                  <svg className="checkmark" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                ) : isActive ? (
                  <div className="spinner"></div>
                ) : (
                  <div className="dot"></div>
                )}
              </div>
              <div className="step-content">
                <div className="step-text">
                  {step.text}
                  {isActive && step.showProgress && step.progressText && (
                    <span className="step-progress-text">{step.progressText}</span>
                  )}
                </div>
                {isCompleted && step.completeText && (
                  <div className="step-complete-text">{step.completeText}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const checkWebGLSupport = () => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || 
                canvas.getContext('experimental-webgl');
      
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
      
      // 检查 WebGL 功能
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        console.log('WebGL 渲染器:', renderer);
      }
    } catch (e) {
      console.error('WebGL 检测失败:', e);
      setWebGLSupported(false);
    }
  };

  // 添加复制和下载功能
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('内容已复制到剪贴板！');
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制。');
    }
  };

  const downloadAsDocx = (content) => {
    // 创建一个包含内容的Blob对象
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    // 创建一个下载链接
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '实验分析报告.docx';
    document.body.appendChild(a);
    a.click();
    // 清理
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (!webGLSupported) {
    return (
      <div className="experiment-lab-container">
        <div className="webgl-not-supported">
          <h2>WebGL 不受支持</h2>
          <p>
            您的浏览器或设备不支持 WebGL，这是运行此实验所必需的技术。
          </p>
          <div className="suggestions">
            <h3>建议尝试：</h3>
            <ul>
              <li>更新您的浏览器到最新版本</li>
              <li>使用 Chrome、Firefox 或 Edge 的最新版本</li>
              <li>确保您的显卡驱动程序是最新的</li>
              <li>在浏览器设置中启用硬件加速</li>
            </ul>
          </div>
          <div className="alternative-content">
            <h3>替代内容</h3>
            <p>
              您可以查看实验的<a href={`/experiment/${id}`}>详细说明</a>，
              或者观看<a href="#">演示视频</a>了解实验内容。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="experiment-lab-container">
      <div className="experiment-lab">
        <canvas id="starry-bg" className="starry-background"></canvas>
        <div className="lab-container">
          {/* 左侧：实验流程输入区 */}
          <div className="steps-section">
            <div className="section-header">
              <h2>实验流程</h2>
              <p className="section-description">
                请详细描述您的实验步骤，AI 将帮助您分析实验设计
              </p>
            </div>
            <textarea
              className="steps-textarea"
              value={experimentSteps}
              onChange={(e) => setExperimentSteps(e.target.value)}
              placeholder="请输入实验流程..."
            />
          </div>

          {/* 右侧：分析显示区 */}
          <div className="code-section">
            <div className="section-header">
              <h2>实验分析</h2>
              {hasError && rawApiResponse && (
                <button 
                  className="toggle-raw-btn"
                  onClick={toggleRawResponse}
                >
                  {showRawResponse ? '显示分析结果' : '查看原始响应'}
                </button>
              )}
            </div>
            
            {isGenerating ? (
              // 显示处理步骤
              renderProcessingSteps()
            ) : (
              <div className="output-container">
                <div 
                  className={`markdown-content ${isTyping ? 'is-typing' : ''}`} 
                  ref={codeOutputRef}
                >
                  <ReactMarkdown>{displayedCode}</ReactMarkdown>
                </div>
                <div className="output-actions">
                  <button 
                    className="action-button"
                    onClick={() => copyToClipboard(displayedCode)}
                    title="复制内容"
                  >
                    <FaCopy /> 复制
                  </button>
                  <button 
                    className="action-button"
                    onClick={() => downloadAsDocx(displayedCode)}
                    title="下载为Word文档"
                  >
                    <FaDownload /> 下载
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <motion.button
          className="convert-btn"
          onClick={handleGenerateCode}
          disabled={isGenerating || isTyping}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isGenerating ? '分析中...' : isTyping ? '正在显示...' : '开始分析'}
        </motion.button>
      </div>
      <ExperimentCanvas experimentId={id} />
    </div>
  );
}

export default ExperimentLab; 