import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useScrollReveal = (options = {}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const {
      animation = 'fadeUp',
      duration = 1,
      delay = 0,
      start = 'top 80%',
      end = 'bottom 20%',
      scrub = false,
      markers = false,
      once = true
    } = options;

    // Define animations
    const animations = {
      fadeUp: {
        from: { y: 60, opacity: 0 },
        to: { y: 0, opacity: 1 }
      },
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 }
      },
      slideLeft: {
        from: { x: 100, opacity: 0 },
        to: { x: 0, opacity: 1 }
      },
      slideRight: {
        from: { x: -100, opacity: 0 },
        to: { x: 0, opacity: 1 }
      },
      scale: {
        from: { scale: 0.8, opacity: 0 },
        to: { scale: 1, opacity: 1 }
      },
      rotate: {
        from: { rotation: -15, opacity: 0 },
        to: { rotation: 0, opacity: 1 }
      }
    };

    const selectedAnimation = animations[animation] || animations.fadeUp;

    // Set initial state
    gsap.set(element, selectedAnimation.from);

    // Create scroll trigger
    const scrollTrigger = {
      trigger: element,
      start,
      end,
      markers,
      scrub: scrub ? 1 : false,
      onEnter: () => {
        gsap.to(element, {
          ...selectedAnimation.to,
          duration,
          delay,
          ease: 'power3.out'
        });
      },
      onLeaveBack: () => {
        if (!once) {
          gsap.to(element, {
            ...selectedAnimation.from,
            duration: duration * 0.7,
            ease: 'power2.in'
          });
        }
      }
    };

    if (scrub) {
      gsap.fromTo(element, selectedAnimation.from, {
        ...selectedAnimation.to,
        scrollTrigger
      });
    } else {
      ScrollTrigger.create(scrollTrigger);
    }

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [options]);

  return elementRef;
};