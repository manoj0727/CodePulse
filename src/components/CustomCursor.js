import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function CustomCursor() {
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorTrailRef = useRef([]);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    let mouseX = 0;
    let mouseY = 0;
    let isHovering = false;

    // Create trail elements
    for (let i = 0; i < 5; i++) {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.cssText = `
        position: fixed;
        width: ${30 - i * 4}px;
        height: ${30 - i * 4}px;
        background: radial-gradient(circle, rgba(0, 212, 255, ${0.3 - i * 0.05}) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s;
        opacity: 0;
      `;
      document.body.appendChild(trail);
      cursorTrailRef.current.push(trail);
    }

    // Mouse move handler
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Immediate dot position
      gsap.to(cursorDot, {
        x: mouseX,
        y: mouseY,
        duration: 0,
      });

      // Smooth cursor follow
      gsap.to(cursor, {
        x: mouseX,
        y: mouseY,
        duration: 0.5,
        ease: "power2.out",
      });

      // Trail effect
      cursorTrailRef.current.forEach((trail, index) => {
        gsap.to(trail, {
          x: mouseX,
          y: mouseY,
          duration: 0.1 + index * 0.05,
          ease: "power2.out",
          opacity: isHovering ? 0.8 - index * 0.15 : 0.4 - index * 0.08,
        });
      });
    };

    // Hover effects
    const handleMouseOver = (e) => {
      if (e.target.tagName === 'A' || 
          e.target.tagName === 'BUTTON' || 
          e.target.classList.contains('clickable') ||
          e.target.closest('button') ||
          e.target.closest('a')) {
        isHovering = true;
        gsap.to(cursor, {
          scale: 1.5,
          borderColor: 'rgba(255, 0, 110, 0.8)',
          backgroundColor: 'rgba(255, 0, 110, 0.1)',
          duration: 0.3,
        });
        gsap.to(cursorDot, {
          scale: 0.5,
          backgroundColor: '#ff006e',
          duration: 0.3,
        });
      }
    };

    const handleMouseOut = () => {
      isHovering = false;
      gsap.to(cursor, {
        scale: 1,
        borderColor: 'rgba(0, 212, 255, 0.5)',
        backgroundColor: 'transparent',
        duration: 0.3,
      });
      gsap.to(cursorDot, {
        scale: 1,
        backgroundColor: '#00d4ff',
        duration: 0.3,
      });
    };

    // Click effect
    const handleClick = () => {
      gsap.fromTo(cursor, 
        { scale: 1.5 },
        { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" }
      );
      
      // Ripple effect
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: fixed;
        width: 50px;
        height: 50px;
        border: 2px solid rgba(0, 212, 255, 0.8);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        left: ${mouseX}px;
        top: ${mouseY}px;
      `;
      document.body.appendChild(ripple);
      
      gsap.to(ripple, {
        width: 100,
        height: 100,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => ripple.remove()
      });
    };

    // Hide default cursor
    document.body.style.cursor = 'none';

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleClick);

    return () => {
      document.body.style.cursor = 'auto';
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('click', handleClick);
      cursorTrailRef.current.forEach(trail => trail.remove());
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          width: '40px',
          height: '40px',
          border: '2px solid rgba(0, 212, 255, 0.5)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 10000,
          transform: 'translate(-50%, -50%)',
          transition: 'border-color 0.3s, background-color 0.3s',
          mixBlendMode: 'difference',
        }}
      />
      <div
        ref={cursorDotRef}
        style={{
          position: 'fixed',
          width: '8px',
          height: '8px',
          backgroundColor: '#00d4ff',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 10001,
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 10px rgba(0, 212, 255, 0.8)',
        }}
      />
    </>
  );
}

export default CustomCursor;