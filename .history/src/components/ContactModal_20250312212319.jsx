import React from 'react';
import './ContactModal.css';

function ContactModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="contact-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>联系我们</h2>
        <div className="contact-content">
          <p>如果您想进行更多实验，欢迎通过以下方式联系我们：</p>
          <div className="contact-info">
            <div className="contact-item">
              <span className="icon">📧</span>
              <span>邮箱：contact@spacelab.edu.cn</span>
            </div>
            <div className="contact-item">
              <span className="icon">📱</span>
              <span>电话：123-4567-8900</span>
            </div>
            <div className="contact-item">
              <span className="icon">💬</span>
              <span>微信：SpaceLab2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactModal; 