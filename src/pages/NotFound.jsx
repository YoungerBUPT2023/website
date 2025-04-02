import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>页面未找到</h2>
        <p>抱歉，您请求的页面不存在或已被移除。</p>
        <Link to="/" className="back-home-button">返回首页</Link>
      </div>
      
      <div className="space-background">
        <div className="stars"></div>
        <div className="planet"></div>
        <div className="astronaut">
          <div className="astronaut-body"></div>
          <div className="astronaut-head"></div>
          <div className="astronaut-arm-left"></div>
          <div className="astronaut-arm-right"></div>
          <div className="astronaut-leg-left"></div>
          <div className="astronaut-leg-right"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 