import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function VoiceCommands({ onCommand }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('Click to start voice commands');
  const recognitionRef = useRef(null);
  const buttonRef = useRef(null);
  const visualizerRef = useRef(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setStatus('Voice commands not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('Listening...');
      animateButton(true);
      speak('Voice commands activated. How can I help you?');
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase();
      setTranscript(transcript);

      if (event.results[current].isFinal) {
        processCommand(transcript);
      }
    };

    recognition.onerror = (event) => {
      setStatus(`Error: ${event.error}`);
      setIsListening(false);
      animateButton(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatus('Click to start voice commands');
      animateButton(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const processCommand = (command) => {
    // Define voice commands
    const commands = {
      'analyze profile': () => {
        speak('Starting profile analysis');
        onCommand({ action: 'analyze' });
      },
      'show github': () => {
        speak('Showing GitHub statistics');
        onCommand({ action: 'showGitHub' });
      },
      'show codeforces': () => {
        speak('Showing Codeforces statistics');
        onCommand({ action: 'showCodeforces' });
      },
      'battle mode': () => {
        speak('Entering battle arena');
        onCommand({ action: 'battle' });
      },
      'export report': () => {
        speak('Exporting profile report');
        onCommand({ action: 'export' });
      },
      'dark mode': () => {
        speak('Switching to dark mode');
        onCommand({ action: 'darkMode' });
      },
      'light mode': () => {
        speak('Switching to light mode');
        onCommand({ action: 'lightMode' });
      },
      'help': () => {
        speak('Available commands: analyze profile, show github, show codeforces, battle mode, export report, dark mode, light mode');
      },
      'stop': () => {
        speak('Stopping voice commands');
        stopListening();
      }
    };

    // Find matching command
    let commandFound = false;
    for (const [key, action] of Object.entries(commands)) {
      if (command.includes(key)) {
        action();
        commandFound = true;
        break;
      }
    }

    if (!commandFound) {
      speak(`Sorry, I didn't understand "${command}". Say "help" for available commands.`);
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const animateButton = (active) => {
    if (!buttonRef.current) return;

    if (active) {
      gsap.to(buttonRef.current, {
        scale: 1.1,
        boxShadow: '0 0 30px rgba(255, 0, 110, 0.8)',
        duration: 0.3
      });
      
      // Pulsing animation
      gsap.to(buttonRef.current, {
        scale: 1.2,
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
    } else {
      gsap.killTweensOf(buttonRef.current);
      gsap.to(buttonRef.current, {
        scale: 1,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        duration: 0.3
      });
    }
  };

  // Audio visualizer
  useEffect(() => {
    if (!isListening || !visualizerRef.current) return;

    const canvas = visualizerRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 50;

    let animationId;
    const bars = 20;
    const barWidth = canvas.width / bars;

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < bars; i++) {
        const height = Math.random() * canvas.height;
        const hue = (i / bars) * 120 + 180; // Blue to purple
        
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;
        ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 2, height);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isListening]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      zIndex: 1000
    }}>
      <div
        ref={buttonRef}
        onClick={toggleListening}
        className="glass-dark"
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: isListening 
            ? 'linear-gradient(135deg, rgba(255, 0, 110, 0.3), rgba(0, 212, 255, 0.3))'
            : 'rgba(20, 20, 30, 0.8)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s ease'
        }}
      >
        <span style={{ fontSize: '24px' }}>
          {isListening ? '🎤' : '🎙️'}
        </span>
      </div>

      {isListening && (
        <div
          className="glass-dark"
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '0',
            padding: '15px',
            borderRadius: '15px',
            minWidth: '250px',
            maxWidth: '300px'
          }}
        >
          <canvas
            ref={visualizerRef}
            style={{
              width: '100%',
              height: '50px',
              borderRadius: '10px',
              marginBottom: '10px'
            }}
          />
          
          <div style={{ fontSize: '12px', color: '#00d4ff', marginBottom: '5px' }}>
            {status}
          </div>
          
          {transcript && (
            <div style={{ 
              fontSize: '14px', 
              color: '#e0e0e0',
              padding: '10px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '10px',
              marginTop: '10px'
            }}>
              "{transcript}"
            </div>
          )}
          
          <div style={{
            fontSize: '11px',
            color: '#999',
            marginTop: '10px',
            textAlign: 'center'
          }}>
            Say "help" for commands
          </div>
        </div>
      )}
    </div>
  );
}

export default VoiceCommands;