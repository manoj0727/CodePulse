import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Apply theme on mount
    applyTheme(isDark);
  }, []);

  const applyTheme = (dark) => {
    const root = document.documentElement;
    
    if (dark) {
      gsap.to(root, {
        '--bg-primary': '#0a0a0a',
        '--bg-secondary': 'rgba(20, 20, 30, 0.8)',
        '--text-primary': '#ffffff',
        '--text-secondary': '#e0e0e0',
        '--accent-primary': '#00d4ff',
        '--accent-secondary': '#ff006e',
        duration: 0.5,
        ease: 'power2.inOut'
      });
      document.body.style.background = '#0a0a0a';
    } else {
      gsap.to(root, {
        '--bg-primary': '#f5f5f5',
        '--bg-secondary': 'rgba(255, 255, 255, 0.9)',
        '--text-primary': '#333333',
        '--text-secondary': '#666666',
        '--accent-primary': '#0066cc',
        '--accent-secondary': '#cc0055',
        duration: 0.5,
        ease: 'power2.inOut'
      });
      document.body.style.background = '#f5f5f5';
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    applyTheme(newTheme);
    
    // Animate toggle button
    const button = document.querySelector('.theme-toggle-btn');
    gsap.to(button, {
      rotation: 360,
      scale: 1.2,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.2
        });
      }
    });
  };

  return (
    <button
      className="theme-toggle-btn glass-dark"
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        background: isDark 
          ? 'linear-gradient(135deg, #1a1a2e, #16213e)'
          : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        transition: 'all 0.3s ease',
        boxShadow: isDark 
          ? '0 4px 20px rgba(0, 0, 0, 0.5)'
          : '0 4px 20px rgba(0, 0, 0, 0.1)',
        zIndex: 1001
      }}
      onMouseEnter={(e) => {
        gsap.to(e.currentTarget, {
          scale: 1.1,
          boxShadow: isDark 
            ? '0 6px 30px rgba(0, 212, 255, 0.5)'
            : '0 6px 30px rgba(255, 215, 0, 0.5)'
        });
      }}
      onMouseLeave={(e) => {
        gsap.to(e.currentTarget, {
          scale: 1,
          boxShadow: isDark 
            ? '0 4px 20px rgba(0, 0, 0, 0.5)'
            : '0 4px 20px rgba(0, 0, 0, 0.1)'
        });
      }}
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  );
}

export default ThemeToggle;