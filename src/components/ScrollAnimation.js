import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function ScrollAnimation({ 
  children, 
  animation = 'fadeUp', 
  duration = 1, 
  delay = 0,
  stagger = 0,
  className = '' 
}) {
  const elementRef = useRef(null);
  const childrenRefs = useRef([]);

  useEffect(() => {
    const element = elementRef.current;
    const childElements = element.children;
    
    // Store children refs
    childrenRefs.current = Array.from(childElements);

    // Define animations
    const animations = {
      fadeUp: {
        from: { y: 50, opacity: 0, scale: 0.95 },
        to: { y: 0, opacity: 1, scale: 1 }
      },
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 }
      },
      slideInLeft: {
        from: { x: -100, opacity: 0 },
        to: { x: 0, opacity: 1 }
      },
      slideInRight: {
        from: { x: 100, opacity: 0 },
        to: { x: 0, opacity: 1 }
      },
      scaleIn: {
        from: { scale: 0.5, opacity: 0 },
        to: { scale: 1, opacity: 1 }
      },
      rotateIn: {
        from: { rotation: -90, opacity: 0, scale: 0.8 },
        to: { rotation: 0, opacity: 1, scale: 1 }
      },
      flipIn: {
        from: { rotationX: -90, opacity: 0, transformPerspective: 1000 },
        to: { rotationX: 0, opacity: 1, transformPerspective: 1000 }
      },
      bounceIn: {
        from: { scale: 0, opacity: 0 },
        to: { 
          scale: 1, 
          opacity: 1,
          ease: "elastic.out(1, 0.5)"
        }
      }
    };

    const selectedAnimation = animations[animation] || animations.fadeUp;
    
    // Set initial state
    if (stagger > 0 && childrenRefs.current.length > 0) {
      gsap.set(childrenRefs.current, selectedAnimation.from);
    } else {
      gsap.set(element, selectedAnimation.from);
    }

    // Create scroll trigger
    const scrollTrigger = ScrollTrigger.create({
      trigger: element,
      start: "top 80%",
      end: "bottom 20%",
      onEnter: () => {
        if (stagger > 0 && childrenRefs.current.length > 0) {
          gsap.to(childrenRefs.current, {
            ...selectedAnimation.to,
            duration,
            delay,
            stagger: {
              each: stagger,
              from: "start",
              ease: "power2.inOut"
            },
            ease: selectedAnimation.to.ease || "power3.out"
          });
        } else {
          gsap.to(element, {
            ...selectedAnimation.to,
            duration,
            delay,
            ease: selectedAnimation.to.ease || "power3.out"
          });
        }
      },
      onLeaveBack: () => {
        if (stagger > 0 && childrenRefs.current.length > 0) {
          gsap.to(childrenRefs.current, {
            ...selectedAnimation.from,
            duration: duration * 0.5,
            stagger: stagger * 0.5,
            ease: "power2.in"
          });
        } else {
          gsap.to(element, {
            ...selectedAnimation.from,
            duration: duration * 0.5,
            ease: "power2.in"
          });
        }
      }
    });

    // Parallax effect on scroll
    if (animation === 'parallax') {
      gsap.to(element, {
        y: -100,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      });
    }

    return () => {
      scrollTrigger.kill();
    };
  }, [animation, duration, delay, stagger]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

export default ScrollAnimation;