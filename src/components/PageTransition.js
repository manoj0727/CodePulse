import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';

function PageTransition({ children }) {
  const location = useLocation();
  const containerRef = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    
    if (firstRender.current) {
      // Initial page load animation
      gsap.fromTo(container,
        { 
          opacity: 0,
          y: 50,
          scale: 0.95
        },
        { 
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out'
        }
      );
      firstRender.current = false;
    } else {
      // Page transition animation
      const tl = gsap.timeline();
      
      // Exit animation
      tl.to(container, {
        opacity: 0,
        y: -30,
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.in'
      })
      // Enter animation
      .set(container, { y: 30 })
      .to(container, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: 'power3.out'
      });
    }

    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);

  return (
    <div ref={containerRef} style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}

export default PageTransition;