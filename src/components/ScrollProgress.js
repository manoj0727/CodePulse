import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progressPercentage = (scrolled / documentHeight) * 100;
      setProgress(Math.min(100, Math.max(0, progressPercentage)));
    };

    // Initial update
    updateProgress();

    // Throttled scroll handler
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  useEffect(() => {
    // Animate progress bar
    gsap.to('.scroll-progress-fill', {
      width: `${progress}%`,
      duration: 0.3,
      ease: 'power2.out'
    });
  }, [progress]);

  return (
    <>
      {/* Top progress bar */}
      <div
        className="scroll-progress-bar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '3px',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 10001,
          pointerEvents: 'none'
        }}
      >
        <div
          className="scroll-progress-fill"
          style={{
            height: '100%',
            width: '0%',
            background: 'linear-gradient(90deg, #00d4ff, #ff006e)',
            boxShadow: '0 0 10px rgba(0, 212, 255, 0.8)',
            transition: 'width 0.3s ease-out'
          }}
        />
      </div>

      {/* Side progress indicator */}
      <div
        style={{
          position: 'fixed',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '4px',
          height: '100px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: `${progress}%`,
            transform: 'translateY(-50%)',
            width: '12px',
            height: '12px',
            left: '-4px',
            background: 'linear-gradient(45deg, #00d4ff, #ff006e)',
            borderRadius: '50%',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)',
            transition: 'top 0.3s ease-out'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '20px',
            transform: 'translateY(-50%)',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '12px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}
        >
          {Math.round(progress)}%
        </div>
      </div>
    </>
  );
}

export default ScrollProgress;