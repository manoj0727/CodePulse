import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

function TypewriterText({ text, delay = 0, speed = 50 }) {
  const [displayText, setDisplayText] = useState('');
  const cursorRef = useRef(null);

  useEffect(() => {
    let currentIndex = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, delay, speed]);

  useEffect(() => {
    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
    }
  }, []);

  return (
    <span style={{ position: 'relative' }}>
      {displayText}
      <span ref={cursorRef} style={{
        display: 'inline-block',
        width: '2px',
        height: '1em',
        background: '#007bff',
        marginLeft: '2px',
        verticalAlign: 'text-bottom'
      }} />
    </span>
  );
}

export default TypewriterText;