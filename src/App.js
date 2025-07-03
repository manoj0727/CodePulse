// src/App.js
import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import BattleArena from './pages/BattleArena';
import AdvancedBackground from './components/AdvancedBackground';
import CustomCursor from './components/CustomCursor';
import SmoothScroll from './components/SmoothScroll';
import ScrollProgress from './components/ScrollProgress';
import PageTransition from './components/PageTransition';
import VoiceCommands from './components/VoiceCommands';
import ThemeToggle from './components/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import './styles/App.css';

function AppContent() {
  const navigate = useNavigate();
  
  const handleVoiceCommand = (command) => {
    switch (command.action) {
      case 'battle':
        navigate('/battle');
        break;
      case 'analyze':
        navigate('/');
        break;
      default:
        break;
    }
  };

  return (
    <div className="App">
        <AdvancedBackground />
        <CustomCursor />
        <SmoothScroll />
        <ScrollProgress />
        <nav className="glass-dark" style={{
          padding: '15px 30px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          animation: 'slideDown 0.5s ease-out'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <Link to="/" style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '20px',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #007bff, #00ff88)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '24px' }}>⚡</span>
              CodePulse
            </Link>
            <div style={{ display: 'flex', gap: '30px' }}>
              <Link to="/" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '20px',
                transition: 'all 0.3s',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}>
                Profile Analysis
              </Link>
              <Link to="/battle" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'linear-gradient(45deg, #dc3545, #fd7e14)',
                transition: 'all 0.3s',
                fontSize: '14px',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 0 20px rgba(253, 126, 20, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}>
                ⚔️ Code Battle
              </Link>
            </div>
          </div>
        </nav>
        
        <div style={{ paddingTop: '70px' }}>
          <PageTransition>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/battle" element={<BattleArena />} />
            </Routes>
          </PageTransition>
        </div>
        <VoiceCommands onCommand={handleVoiceCommand} />
        <ThemeToggle />
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;