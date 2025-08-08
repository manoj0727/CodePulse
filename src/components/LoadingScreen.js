import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function LoadingScreen() {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    
    // Create loading particles
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        background: linear-gradient(45deg, #00d4ff, #ff006e);
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
      `;
      container.appendChild(particle);
      particlesRef.current.push(particle);
    }

    // Animate particles in a circle
    particlesRef.current.forEach((particle, index) => {
      const angle = (index / 8) * Math.PI * 2;
      const radius = 50;
      
      gsap.set(particle, {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });

      gsap.to(particle, {
        rotation: 360,
        duration: 2,
        repeat: -1,
        ease: "none",
        transformOrigin: `${-Math.cos(angle) * radius}px ${-Math.sin(angle) * radius}px`
      });

      gsap.to(particle, {
        scale: 1.5,
        opacity: 0.3,
        duration: 1,
        repeat: -1,
        yoyo: true,
        delay: index * 0.1,
        ease: "power2.inOut"
      });
    });

    // Animate loading text
    gsap.to(text, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: "power3.out"
    });

    // Pulsing effect
    gsap.to(text, {
      textShadow: '0 0 30px rgba(0, 212, 255, 0.8)',
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut"
    });

    return () => {
      const particles = particlesRef.current;
      particles.forEach(particle => particle.remove());
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          ref={textRef}
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#ffffff',
            opacity: 0,
            scale: 0.8,
            background: 'linear-gradient(45deg, #00d4ff, #ff006e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center'
          }}
        >
          Analyzing<br />Profile
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;