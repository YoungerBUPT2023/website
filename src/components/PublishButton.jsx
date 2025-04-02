import React from 'react';
import './PublishButton.css';

function PublishButton({ onClick }) {
  return (
    <div className="publish-button-container">
      <button className="publish-button" onClick={onClick}>
        <span className="publish-icon">+</span>
        <span className="publish-text">发布作品</span>
      </button>
    </div>
  );
}

export default PublishButton; 