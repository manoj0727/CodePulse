import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

function Card3D({ children, className = '', glowColor = '#00d4ff' }) {
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const shineRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const glow = glowRef.current;
    const shine = shineRef.current;
    let rect = card.getBoundingClientRect();

    // Update rect on resize
    const updateRect = () => {
      rect = card.getBoundingClientRect();
    };
    window.addEventListener('resize', updateRect);

    const handleMouseMove = (e) => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;
      
      // 3D rotation
      gsap.to(card, {
        rotationY: percentX * 15,
        rotationX: -percentY * 15,
        duration: 0.5,
        ease: "power2.out",
        transformPerspective: 1000,
        transformOrigin: "center center"
      });

      // Glow effect follows mouse
      gsap.to(glow, {
        x: x - rect.width / 2,
        y: y - rect.height / 2,
        duration: 0.3,
        ease: "power2.out"
      });

      // Shine effect
      const angle = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI;
      gsap.to(shine, {
        background: `linear-gradient(${angle}deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)`,
        duration: 0.3
      });
    };

    const handleMouseEnter = () => {
      gsap.to(card, {
        scale: 1.05,
        boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 60px ${glowColor}40`,
        duration: 0.3,
        ease: "power2.out"
      });
      
      gsap.to(glow, {
        opacity: 1,
        scale: 1,
        duration: 0.3
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotationY: 0,
        rotationX: 0,
        scale: 1,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        duration: 0.5,
        ease: "power2.out"
      });
      
      gsap.to(glow, {
        opacity: 0,
        scale: 0.8,
        duration: 0.3
      });
      
      gsap.to(shine, {
        background: 'transparent',
        duration: 0.3
      });
    };

    // Floating animation
    gsap.to(card, {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });

    // Initial entrance animation
    gsap.fromTo(card, 
      {
        opacity: 0,
        scale: 0.8,
        rotationX: -30,
        y: 50
      },
      {
        opacity: 1,
        scale: 1,
        rotationX: 0,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: Math.random() * 0.3
      }
    );

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', updateRect);
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [glowColor]);

  return (
    <div
      ref={cardRef}
      className={`card-3d ${className}`}
      style={{
        position: 'relative',
        background: 'rgba(20, 20, 30, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '30px',
        transformStyle: 'preserve-3d',
        transition: 'box-shadow 0.3s',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
    >
      {/* Glow effect */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          width: '150%',
          height: '150%',
          background: `radial-gradient(circle, ${glowColor}30 0%, transparent 70%)`,
          borderRadius: '50%',
          pointerEvents: 'none',
          opacity: 0,
          transform: 'translate(-50%, -50%) scale(0.8)',
          top: '50%',
          left: '50%',
          zIndex: -1
        }}
      />
      
      {/* Shine effect */}
      <div
        ref={shineRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '20px',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}

export default Card3D;