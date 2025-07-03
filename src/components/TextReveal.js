import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function TextReveal({ children, className = '', delay = 0 }) {
  const textRef = useRef(null);
  const lettersRef = useRef([]);

  useEffect(() => {
    const text = textRef.current;
    
    // Split text into spans for each letter
    const textContent = text.innerText;
    text.innerHTML = '';
    
    textContent.split('').forEach((char, index) => {
      const span = document.createElement('span');
      span.innerText = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = 'translateY(50px) rotateX(-90deg)';
      span.style.transformStyle = 'preserve-3d';
      text.appendChild(span);
      lettersRef.current.push(span);
    });

    // Animate letters
    gsap.to(lettersRef.current, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 0.8,
      stagger: 0.02,
      delay: delay,
      ease: "power3.out",
      onComplete: () => {
        // Add hover effect after reveal
        lettersRef.current.forEach((letter, index) => {
          letter.addEventListener('mouseenter', () => {
            gsap.to(letter, {
              y: -5,
              color: '#00d4ff',
              textShadow: '0 0 20px rgba(0, 212, 255, 0.8)',
              duration: 0.3,
              ease: "power2.out"
            });
          });
          
          letter.addEventListener('mouseleave', () => {
            gsap.to(letter, {
              y: 0,
              color: '',
              textShadow: '',
              duration: 0.3,
              ease: "power2.out"
            });
          });
        });
      }
    });

    // Intersection observer for scroll-triggered animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            gsap.to(lettersRef.current, {
              opacity: 1,
              y: 0,
              rotationX: 0,
              duration: 0.8,
              stagger: 0.02,
              ease: "power3.out"
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(text);

    return () => {
      observer.disconnect();
    };
  }, [delay]);

  return (
    <div ref={textRef} className={className} style={{ perspective: '1000px' }}>
      {children}
    </div>
  );
}

export default TextReveal;