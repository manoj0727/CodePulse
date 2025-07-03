import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function ScoreVisualization({ score, maxScore, label, color, delay = 0 }) {
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const scoreRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const percentage = (score / maxScore) * 100;
    
    // Animate container entrance
    gsap.fromTo(containerRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, delay, ease: "back.out(1.7)" }
    );

    // Animate progress bar
    gsap.fromTo(progressRef.current,
      { width: '0%' },
      { 
        width: `${percentage}%`, 
        duration: 1.5, 
        delay: delay + 0.3,
        ease: "power3.inOut",
        onUpdate: function() {
          // Add glow effect based on progress
          const progress = this.progress();
          const glowIntensity = progress * 20;
          progressRef.current.style.boxShadow = `0 0 ${glowIntensity}px ${color}`;
        }
      }
    );

    // Animate score number
    let obj = { score: 0 };
    gsap.to(obj, {
      score: score,
      duration: 1.5,
      delay: delay + 0.3,
      ease: "power2.out",
      onUpdate: function() {
        if (scoreRef.current) {
          scoreRef.current.textContent = Math.floor(obj.score);
        }
      }
    });

    // Create and animate particles
    const particleCount = Math.floor(percentage / 10);
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
      `;
      containerRef.current.appendChild(particle);
      particlesRef.current.push(particle);

      // Animate particle
      gsap.set(particle, {
        x: Math.random() * 200 - 100,
        y: 0,
        opacity: 0
      });

      gsap.to(particle, {
        y: -50 - Math.random() * 50,
        opacity: 1,
        duration: 0.5,
        delay: delay + 0.5 + (i * 0.1),
        ease: "power2.out"
      });

      gsap.to(particle, {
        y: -100 - Math.random() * 100,
        opacity: 0,
        duration: 1,
        delay: delay + 1 + (i * 0.1),
        ease: "power2.in",
        onComplete: () => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }
      });
    }

    return () => {
      // Cleanup particles
      particlesRef.current.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
    };
  }, [score, maxScore, color, delay]);

  return (
    <div ref={containerRef} style={{ 
      textAlign: 'center',
      margin: '20px 0',
      position: 'relative'
    }}>
      <h3 style={{ 
        color: '#333', 
        marginBottom: '10px',
        fontSize: '18px',
        fontWeight: '600'
      }}>{label}</h3>
      
      <div style={{
        position: 'relative',
        width: '100%',
        height: '40px',
        background: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '20px',
        overflow: 'hidden',
        marginBottom: '10px'
      }}>
        <div
          ref={progressRef}
          style={{
            position: 'absolute',
            height: '100%',
            background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
            borderRadius: '20px',
            transition: 'box-shadow 0.3s ease'
          }}
        />
        
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          textShadow: '0 0 10px rgba(0,0,0,0.5)'
        }}>
          <span ref={scoreRef}>0</span>/{maxScore}
        </div>
      </div>
    </div>
  );
}

export default ScoreVisualization;