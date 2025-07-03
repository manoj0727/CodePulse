import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function DifficultyChart({ data }) {
  const chartRef = useRef(null);
  const barsRef = useRef([]);

  const difficulties = ['Easy', 'Medium', 'Hard', 'Expert'];
  const colors = {
    'Easy': '#28a745',
    'Medium': '#ffc107',
    'Hard': '#dc3545',
    'Expert': '#6f42c1'
  };

  useEffect(() => {
    // Get max value for scaling
    const maxValue = Math.max(...difficulties.map(d => data[d] || 0));
    
    // Animate bars
    barsRef.current.forEach((bar, index) => {
      const difficulty = difficulties[index];
      const value = data[difficulty] || 0;
      const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
      
      gsap.fromTo(bar, 
        { height: '0%' },
        { 
          height: `${percentage}%`, 
          duration: 1,
          delay: index * 0.1,
          ease: "power3.out",
          onUpdate: function() {
            const currentHeight = parseFloat(bar.style.height);
            bar.style.boxShadow = `0 0 ${currentHeight / 5}px ${colors[difficulty]}`;
          }
        }
      );
      
      // Animate value display
      const valueEl = bar.querySelector('.value');
      let obj = { value: 0 };
      gsap.to(obj, {
        value: value,
        duration: 1,
        delay: index * 0.1,
        ease: "power2.out",
        onUpdate: function() {
          if (valueEl) {
            valueEl.textContent = Math.floor(obj.value);
          }
        }
      });
    });
  }, [data]);

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '20px',
      borderRadius: '10px',
      marginTop: '20px'
    }}>
      <h4 style={{ marginBottom: '20px', color: '#333' }}>Problems Solved by Difficulty</h4>
      <div ref={chartRef} style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        height: '200px',
        position: 'relative'
      }}>
        {difficulties.map((difficulty, index) => (
          <div key={difficulty} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            height: '100%',
            position: 'relative'
          }}>
            <div style={{
              flex: 1,
              width: '100%',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center'
            }}>
              <div
                ref={el => barsRef.current[index] = el}
                style={{
                  width: '60%',
                  background: `linear-gradient(180deg, ${colors[difficulty]} 0%, ${colors[difficulty]}dd 100%)`,
                  borderRadius: '8px 8px 0 0',
                  position: 'relative',
                  minHeight: '5px',
                  transition: 'box-shadow 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2 });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
                }}
              >
                <div className="value" style={{
                  position: 'absolute',
                  top: '-25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontWeight: 'bold',
                  color: colors[difficulty],
                  fontSize: '18px'
                }}>
                  0
                </div>
              </div>
            </div>
            <div style={{
              marginTop: '10px',
              fontSize: '14px',
              color: '#666',
              fontWeight: '500'
            }}>
              {difficulty}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DifficultyChart;