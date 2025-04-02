import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CodeGeneration.css';

function SpaceView() {
  const [experimentSteps, setExperimentSteps] = useState(`1、在封闭透明实验腔内利用 "静电吸附板" 固定一些水滴在合适位置。
2、在封闭透明实验腔的两头安装 "超声波模块"，并通过 "可编程控制单元与机械微调装置" 调整频率。
3、利用 "高分辨率摄像头与多光谱光源" 实时记录实验过程，同时通过 "多参数传感器套件" 监测实验环境参数，观察水滴实现周期性的排列，相互之间的距离为一个波长。`);
  const [displayedCode, setDisplayedCode] = useState('// 这里将显示生成的代码');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [processingSteps, setProcessingSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState([]);

  // 定义处理步骤
  const steps = [
    {
      id: 1,
      text: "正在连接扣子API平台...",
      duration: 2000,
      completeText: "调用成功"
    },
    {
      id: 2,
      text: "正在提取实验关键信息...",
      duration: 3000,
      progressText: "已识别实验关键组件和参数"
    },
    {
      id: 3,
      text: "正在生成代码...",
      duration: 4000,
      progressText: "代码生成中..."
    },
    {
      id: 4,
      text: "正在优化代码结构...",
      duration: 2000
    }
  ];

  // 语言选项
  const languageOptions = [
    { value: 'python', label: 'Python' },
    { value: 'matlab', label: 'Matlab' },
    { value: 'arduino', label: 'Arduino/树莓派' }
  ];

  // 提取代码的函数
  const extractCodeFromResponse = (response) => {
    try {
      const data = typeof response === 'string' ? JSON.parse(response) : response;
      
      if (!data || !data.response) {
        return '// API返回的数据结构不符合预期';
      }

      const responseText = data.response;
      
      // 根据不同语言匹配代码块
      const codeBlockRegex = /```(?:python|matlab|cpp)?\n([\s\S]*?)```/;
      const match = responseText.match(codeBlockRegex);
      
      if (match && match[1]) {
        return match[1].trim();
      }
      
      return responseText;
    } catch (error) {
      console.error('解析响应时出错:', error);
      return `// 解析响应时出错：${error.message}`;
    }
  };

  // 处理步骤的进度
  useEffect(() => {
    if (!isGenerating) {
      setCurrentStepIndex(-1);
      setCompletedSteps([]);
      setProcessingSteps([]);
      return;
    }

    setProcessingSteps(steps);
    let currentStep = 0;

    const processStep = () => {
      if (currentStep < steps.length) {
        setCurrentStepIndex(currentStep);
        
        // 当前步骤的持续时间
        const currentDuration = steps[currentStep].duration;
        
        // 如果当前步骤有完成文本，则增加显示时间
        const extraTime = steps[currentStep].completeText ? 1000 : 0;
        
        setTimeout(() => {
          setCompletedSteps(prev => [...prev, currentStep]);
          
          // 添加延迟再进入下一步
          setTimeout(() => {
            currentStep++;
            if (currentStep < steps.length) {
              processStep();
            }
          }, extraTime);
          
        }, currentDuration);
      }
    };

    processStep();
  }, [isGenerating]);

  const handleGenerateCode = async () => {
    if (!experimentSteps.trim()) {
      setDisplayedCode('// 请先输入实验流程！');
      return;
    }

    setIsGenerating(true);
    setDisplayedCode('');
    
    try {
      // 获取语言前缀并拼接到实验步骤前
      const languagePrefix = getLanguagePrefix(selectedLanguage);
      const fullMessage = languagePrefix + experimentSteps;

      const response = await axios.post('/generate-code', {
        message: fullMessage,
        language: selectedLanguage
      });
      
      // 使用提取函数处理响应
      const extractedCode = extractCodeFromResponse(response.data);
      setDisplayedCode(extractedCode);
    } catch (error) {
      console.error('生成代码时出错:', error);
      const errorMessage = `// 生成代码时出现错误：\n// ${error.message}`;
      setDisplayedCode(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  // 获取语言前缀
  const getLanguagePrefix = (language) => {
    switch (language) {
      case 'python':
        return '我希望通过Python输出代码\n';
      case 'matlab':
        return '我希望通过Matlab输出代码\n';
      case 'arduino':
        return '我希望通过Arduino输出代码\n';
      default:
        return '';
    }
  };

  // 渲染处理步骤
  const renderProcessingSteps = () => {
    if (!isGenerating) return null;

    return (
      <div className="processing-steps">
        {processingSteps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isActive = index === currentStepIndex;
          
          return (
            <div key={step.id} className={`processing-step ${isActive || isCompleted ? 'visible' : ''}`}>
              <div className={`step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
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
                  {isActive && step.progressText && (
                    <div className="step-progress-text">{step.progressText}</div>
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

  return (
    <div className="space-view">
      <div className="code-generation-container">
        <div className="input-section">
          <h3>实验流程</h3>
          <textarea
            value={experimentSteps}
            onChange={(e) => setExperimentSteps(e.target.value)}
            placeholder="请输入实验流程..."
          />
        </div>
        
        <div className="output-section">
          <div className="output-header">
            <h3>生成的代码</h3>
            <select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="language-selector"
            >
              {languageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {isGenerating ? (
            renderProcessingSteps()
          ) : (
            <pre className="code-output">
              <code>{displayedCode}</code>
            </pre>
          )}
          
          <button
            className={`generate-button ${isGenerating ? 'generating' : ''}`}
            onClick={handleGenerateCode}
            disabled={isGenerating}
          >
            {isGenerating ? '生成中...' : '生成代码'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SpaceView; 