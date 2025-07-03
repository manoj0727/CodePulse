// src/components/InputForm.js
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function InputForm({ onAnalyze, disabled, platform = 'both' }) {
  const [github, setGithub] = useState('');
  const [codeforces, setCodeforces] = useState('');
  const formRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Animate form fields on mount
    const fields = formRef.current.querySelectorAll('div');
    gsap.fromTo(fields, 
      { opacity: 0, x: -30 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.6, 
        stagger: 0.2,
        ease: "power2.out"
      }
    );

    // Animate button
    gsap.fromTo(buttonRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, delay: 0.6, ease: "back.out(1.7)" }
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Button click animation
    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
      onComplete: () => {
        console.log('Form submitted:', { github, codeforces }); // Debug log
        onAnalyze({ github, codeforces });
      }
    });
  };

  const handleInputFocus = (e) => {
    gsap.to(e.target, { scale: 1.02, duration: 0.2 });
  };

  const handleInputBlur = (e) => {
    gsap.to(e.target, { scale: 1, duration: 0.2 });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      {(platform === 'both' || platform === 'github') && (
        <div>
          <label>GitHub Username: </label>
          <input
            type="text"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            required={platform === 'github' || platform === 'both'}
          />
        </div>
      )}
      {(platform === 'both' || platform === 'codeforces') && (
        <div>
          <label>Codeforces Handle: </label>
          <input
            type="text"
            value={codeforces}
            onChange={(e) => setCodeforces(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            required={platform === 'codeforces' || platform === 'both'}
          />
        </div>
      )}
      <button ref={buttonRef} type="submit" disabled={disabled}>
        {disabled ? 'Analyzing...' : 'Analyze'}
      </button>
    </form>
  );
}

export default InputForm;