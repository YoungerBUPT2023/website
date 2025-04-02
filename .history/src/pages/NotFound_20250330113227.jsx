import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="not-found-container">
      <div className="stars-background"></div>
      <div className="planet-blue"></div>
      <div className="astronaut">
        <img src="/images/tiangong_station.png" alt="宇航员" />
      </div>
      
      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <div className="error-divider"></div>
        <h2 className="error-title">页面未找到</h2>
        <p className="error-message">抱歉，您请求的页面不存在或已被移除。</p>
        <Link to="/" className="home-button">
          返回首页
        </Link>
      </div>
    </div>
  );
}

export default NotFound; 