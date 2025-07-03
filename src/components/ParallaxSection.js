import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function ParallaxSection({ children, speed = 0.5, className = '', style = {} }) {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    
    if (!section || !content) return;

    // Create parallax effect
    const parallax = gsap.to(content, {
      yPercent: -100 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    // Add subtle fade effect
    const fade = gsap.fromTo(content, 
      { opacity: 0.7 },
      {
        opacity: 1,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 20%',
          scrub: true
        }
      }
    );

    return () => {
      parallax.kill();
      fade.kill();
    };
  }, [speed]);

  return (
    <div 
      ref={sectionRef}
      className={`parallax-section ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      <div
        ref={contentRef}
        style={{
          position: 'relative',
          willChange: 'transform'
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default ParallaxSection;