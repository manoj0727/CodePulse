import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function AdvancedBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * 1000;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.speedZ = Math.random() * 1 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = Math.random() > 0.5 ? '#00d4ff' : '#ff006e';
      }

      update() {
        // 3D movement
        this.z -= this.speedZ;
        if (this.z <= 0) {
          this.z = 1000;
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
        }

        // Mouse interaction
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150 && distance > 0) {
          const force = (150 - distance) / 150;
          this.x -= (dx / distance) * force * 2;
          this.y -= (dy / distance) * force * 2;
        }

        // Regular movement
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        const perspective = 1000 / Math.max(1, 1000 - this.z);
        const x = (this.x - canvas.width / 2) * perspective + canvas.width / 2;
        const y = (this.y - canvas.height / 2) * perspective + canvas.height / 2;
        const size = Math.max(0.1, this.size * perspective);

        // Check for valid coordinates
        if (!isFinite(x) || !isFinite(y) || !isFinite(size)) {
          return;
        }

        // Glow effect
        try {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
          gradient.addColorStop(0, this.color + '40');
          gradient.addColorStop(0.5, this.color + '20');
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, size * 4, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) {
          // Skip gradient if values are invalid
        }

        // Core particle
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity * (1 - this.z / 1000)));
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Create particles
    for (let i = 0; i < 100; i++) {
      particlesRef.current.push(new Particle());
    }

    // Mouse tracking
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          
          // Check for valid particle positions
          if (!isFinite(p1.x) || !isFinite(p1.y) || !isFinite(p2.x) || !isFinite(p2.y)) {
            continue;
          }
          
          const distance = Math.sqrt(
            Math.pow(p1.x - p2.x, 2) + 
            Math.pow(p1.y - p2.y, 2)
          );
          
          if (distance < 100 && distance > 0 && Math.abs(p1.z - p2.z) < 100) {
            ctx.globalAlpha = Math.max(0, Math.min(1, (1 - distance / 100) * 0.5));
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Animated gradient background
    const gradientAnimation = gsap.timeline({ repeat: -1 })
      .to(canvas, {
        duration: 10,
        ease: "none",
        onUpdate: function() {
          const time = this.progress();
          const gradient = ctx.createLinearGradient(
            0, 0, 
            canvas.width, canvas.height
          );
          
          const hue1 = (time * 360) % 360;
          const hue2 = ((time * 360) + 120) % 360;
          
          gradient.addColorStop(0, `hsla(${hue1}, 100%, 50%, 0.1)`);
          gradient.addColorStop(0.5, `hsla(${hue2}, 100%, 50%, 0.05)`);
          gradient.addColorStop(1, `hsla(${hue1}, 100%, 50%, 0.1)`);
          
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      });

    animationRef.current = gradientAnimation;

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) animationRef.current.kill();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
}

export default AdvancedBackground;