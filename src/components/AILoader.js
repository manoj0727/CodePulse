import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function AILoader() {
  const containerRef = useRef(null);
  const dotsRef = useRef([]);
  const circleRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const dots = dotsRef.current;
    const circle = circleRef.current;
    const text = textRef.current;

    // Create timeline
    const tl = gsap.timeline({ repeat: -1 });

    // Animate circle rotation
    gsap.to(circle, {
      rotation: 360,
      duration: 3,
      ease: "none",
      repeat: -1
    });

    // Animate dots
    dots.forEach((dot, index) => {
      gsap.set(dot, {
        transformOrigin: "50% 50%",
      });

      tl.to(dot, {
        scale: 1.5,
        opacity: 1,
        duration: 0.3,
        ease: "power2.inOut",
      }, index * 0.1)
      .to(dot, {
        scale: 1,
        opacity: 0.3,
        duration: 0.3,
        ease: "power2.inOut",
      }, index * 0.1 + 0.3);
    });

    // Animate text
    gsap.fromTo(text, {
      opacity: 0.5,
    }, {
      opacity: 1,
      duration: 1,
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true
    });

    // Glowing effect
    gsap.to(container, {
      filter: "drop-shadow(0 0 20px rgba(0, 123, 255, 0.8))",
      duration: 1.5,
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div ref={containerRef} style={{
      position: 'relative',
      width: '200px',
      height: '200px',
      margin: '50px auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={{ position: 'absolute' }}
      >
        {/* Outer rotating circle */}
        <circle
          ref={circleRef}
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="2"
          strokeDasharray="10 5"
          opacity="0.5"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#007bff" />
            <stop offset="100%" stopColor="#00ff88" />
          </linearGradient>
        </defs>

        {/* Animated dots */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45) * (Math.PI / 180);
          const x = 100 + 60 * Math.cos(angle);
          const y = 100 + 60 * Math.sin(angle);
          
          return (
            <circle
              key={i}
              ref={el => dotsRef.current[i] = el}
              cx={x}
              cy={y}
              r="4"
              fill="#007bff"
              opacity="0.3"
            />
          );
        })}
      </svg>

      <div ref={textRef} style={{
        position: 'absolute',
        textAlign: 'center',
        color: '#007bff',
        fontSize: '16px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '2px'
      }}>
        <div>AI Analysis</div>
        <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.8 }}>
          Processing...
        </div>
      </div>
    </div>
  );
}

export default AILoader;