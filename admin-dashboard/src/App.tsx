import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import MapTracking from './pages/MapTracking';
import CallLogs from './pages/CallLogs';
import Settings from './pages/Settings';

function App() {
  const [systemStatus, setSystemStatus] = useState('online');

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout systemStatus={systemStatus} />}>
            <Route index element={<Dashboard />} />
            <Route path="map" element={<MapTracking />} />
            <Route path="calls" element={<CallLogs />} />
            <Route path="settings" element={<Settings setSystemStatus={setSystemStatus} />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;