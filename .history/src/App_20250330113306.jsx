import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CodeGeneration from './pages/SpaceView';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import UserProfile from './pages/UserProfile';
import Debug from './pages/Debug';
import VRLab from './pages/VRLab';
import Gallery from './pages/Gallery';
import ExperimentLab from './pages/ExperimentLab';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ServiceAgreement from './pages/ServiceAgreement';
import NotFound from './pages/NotFound';

function PrivateRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  console.log('PrivateRoute - 当前登录状态:', isLoggedIn);
  
  // 临时取消路由保护，直接显示内容
  return children;
  
  // 取消注释下面的代码以恢复路由保护
  // return isLoggedIn ? children : <Navigate to="/" />;
}

function App() {
  return (
    <Router>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/debug" element={<Debug />} />
          <Route path="/lab" element={
            <div>
              {window.location.replace('http://localhost:3001/lab')}
            </div>
          } />
          <Route
            path="/experiment"
            element={
              <PrivateRoute>
                <CodeGeneration />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <div style={{
                  padding: '100px 20px',
                  textAlign: 'center',
                  backgroundColor: '#000',
                  color: '#fff',
                  minHeight: '100vh'
                }}>
                  <h1>仪表盘页面</h1>
                  <p>这是一个简单的跳转测试页面</p>
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/:username"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />
          <Route path="/vr" element={<div style={{padding: '100px 20px', textAlign: 'center'}}>VR实验页面正在开发中...</div>} />
          <Route path="/showcase" element={<Gallery />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/space" element={<div style={{padding: '100px 20px', textAlign: 'center'}}>宇宙视角页面正在开发中...</div>} />
          <Route path="/vr-lab" element={<VRLab />} />
          <Route path="/vr-lab-redirect" element={
            <Navigate to="/vr-lab" replace />
          } />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/service-agreement" element={<ServiceAgreement />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 