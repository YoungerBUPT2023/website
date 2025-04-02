import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ExperimentLab from './pages/ExperimentLab';
import VRLab from './pages/VRLab';
import Gallery from './pages/Gallery';
import SpaceView from './pages/SpaceView';
import ExperimentDetail from './pages/ExperimentDetail';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/lab" element={<ExperimentLab />} />
          <Route path="/vr-lab" element={<VRLab />} />
          <Route path="/space-view" element={<SpaceView />} />
          <Route path="/experiment/:id" element={<ExperimentDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 