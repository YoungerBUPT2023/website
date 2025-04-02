import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

const Debug = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const [info, setInfo] = useState({});
  
  useEffect(() => {
    // 收集调试信息
    const debugInfo = {
      location: {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        state: location.state,
      },
      params,
      window: {
        location: window.location.href,
        origin: window.location.origin,
        pathname: window.location.pathname,
        hash: window.location.hash,
      },
      localStorage: {
        isLoggedIn: localStorage.getItem('isLoggedIn'),
        username: localStorage.getItem('username'),
      }
    };
    
    setInfo(debugInfo);
    console.log('调试信息:', debugInfo);
  }, [location, params]);
  
  return (
    <div style={{
      padding: '100px 20px',
      background: 'black',
      color: 'lime',
      fontFamily: 'monospace',
      minHeight: '100vh',
    }}>
      <h1>路由调试页面</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/')}
          style={{ margin: '5px', padding: '5px 10px' }}
        >
          首页
        </button>
        <button 
          onClick={() => navigate('/profile/younger')}
          style={{ margin: '5px', padding: '5px 10px' }}
        >
          个人主页
        </button>
        <button 
          onClick={() => navigate('/experiment')}
          style={{ margin: '5px', padding: '5px 10px' }}
        >
          实验室
        </button>
      </div>
      
      <div style={{
        background: '#111',
        padding: '20px',
        borderRadius: '5px',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'left',
        overflow: 'auto',
      }}>
        <h2>路由信息</h2>
        <pre>{JSON.stringify(info, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Debug; 