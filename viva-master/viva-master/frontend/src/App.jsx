import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HoistingDemo from './components/HoistingDemo';
import PromisesVsCallbacksDemo from './components/PromisesVsCallbacksDemo';
import SqlJoinsDemo from './components/SqlJoinsDemo';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hoisting-demo" element={
            <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
              <HoistingDemo />
            </div>
          } />
          <Route path="/promises-vs-callbacks" element={
            <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
              <PromisesVsCallbacksDemo />
            </div>
          } />
          <Route path="/sql-joins" element={
            <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
              <SqlJoinsDemo />
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
