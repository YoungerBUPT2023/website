import React from 'react';
import './ContactModal.css';

function ContactModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="contact-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>太空实验申请</h2>
        <div className="contact-content">
          <p className="application-intro">我们为优质的科学实验提供太空实验机会。请按以下要求提交您的实验申请：</p>
          
          <div className="application-requirements">
            <h3>申请材料要求</h3>
            <ul>
              <li>
                <strong>实验计划书</strong>：需包含实验目的、科学价值、技术路线、预期成果等内容，格式规范，不超过20页
              </li>
              <li>
                <strong>COMSOL仿真文件</strong>：提供完整的仿真模型及相关参数设置，确保模型可复现
              </li>
              <li>
                <strong>技术报告</strong>：详细描述实验方法、所需设备、环境要求及预期结果分析
              </li>
            </ul>
          </div>
          
          <div className="evaluation-process">
            <h3>评估流程</h3>
            <p>我们将从以下多个维度对您的实验进行量化评估：</p>
            <ul>
              <li>科学价值与创新性</li>
              <li>技术可行性与风险</li>
              <li>资源需求与效益比</li>
              <li>执行难度与时间预估</li>
              <li>教育意义与推广价值</li>
            </ul>
          </div>
          
          <div className="timeline">
            <h3>处理时间</h3>
            <p>我们将在收到您的完整申请材料后<strong>5~7个工作日内</strong>给予回复，包括：</p>
            <ul>
              <li>实验方案评审意见</li>
              <li>建议修改与优化方向</li>
              <li>实验资源分配计划</li>
              <li>后续流程安排</li>
            </ul>
          </div>
          
          <div className="submission">
            <h3>提交方式</h3>
            <div className="contact-info">
              <div className="contact-item">
                <span className="icon">📧</span>
                <span>申请邮箱：application@spacelab.edu.cn</span>
              </div>
              <div className="contact-item">
                <span className="icon">📝</span>
                <span>邮件主题格式：[太空实验申请]_实验名称_申请人</span>
              </div>
              <div className="contact-item">
                <span className="icon">❓</span>
                <span>咨询电话：123-4567-8900（工作日 9:00-17:00）</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactModal; 