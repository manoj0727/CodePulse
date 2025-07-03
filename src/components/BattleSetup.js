import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function BattleSetup({ onStartBattle }) {
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [gameMode, setGameMode] = useState('random'); // random, rating-based
  const [difficulty, setDifficulty] = useState('medium');
  const setupRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    // Animate cards entrance
    gsap.fromTo(cardsRef.current,
      { opacity: 0, y: 50, scale: 0.8 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      }
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (player1 && player2) {
      // Animate out
      gsap.to(setupRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        onComplete: () => {
          onStartBattle(player1, player2, { gameMode, difficulty });
        }
      });
    }
  };

  return (
    <div ref={setupRef} style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '40px',
          fontSize: '2em',
          color: '#333'
        }}>
          Prepare for Battle!
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
            marginBottom: '40px'
          }}>
            {/* Player 1 Card */}
            <div
              ref={el => cardsRef.current[0] = el}
              style={{
                background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                padding: '30px',
                borderRadius: '15px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                fontSize: '150px',
                opacity: 0.1
              }}>
                👤
              </div>
              <h3 style={{ marginBottom: '20px', fontSize: '1.5em' }}>Player 1</h3>
              <input
                type="text"
                placeholder="Codeforces Handle"
                value={player1}
                onChange={(e) => setPlayer1(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#333'
                }}
                onFocus={(e) => {
                  gsap.to(e.target, { scale: 1.02, duration: 0.2 });
                }}
                onBlur={(e) => {
                  gsap.to(e.target, { scale: 1, duration: 0.2 });
                }}
              />
            </div>

            {/* VS Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3em',
              fontWeight: 'bold',
              color: '#dc3545',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            }}>
              VS
            </div>

            {/* Player 2 Card */}
            <div
              ref={el => cardsRef.current[1] = el}
              style={{
                background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                padding: '30px',
                borderRadius: '15px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                fontSize: '150px',
                opacity: 0.1
              }}>
                👤
              </div>
              <h3 style={{ marginBottom: '20px', fontSize: '1.5em' }}>Player 2</h3>
              <input
                type="text"
                placeholder="Codeforces Handle"
                value={player2}
                onChange={(e) => setPlayer2(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#333'
                }}
                onFocus={(e) => {
                  gsap.to(e.target, { scale: 1.02, duration: 0.2 });
                }}
                onBlur={(e) => {
                  gsap.to(e.target, { scale: 1, duration: 0.2 });
                }}
              />
            </div>
          </div>

          {/* Battle Settings */}
          <div
            ref={el => cardsRef.current[2] = el}
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              padding: '30px',
              borderRadius: '15px',
              marginBottom: '30px'
            }}
          >
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Battle Settings</h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#666' }}>
                  Problem Selection
                </label>
                <select
                  value={gameMode}
                  onChange={(e) => setGameMode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value="random">Random Problem</option>
                  <option value="rating-based">Based on Average Rating</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#666' }}>
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value="easy">Easy (800-1200)</option>
                  <option value="medium">Medium (1200-1600)</option>
                  <option value="hard">Hard (1600-2000)</option>
                  <option value="expert">Expert (2000+)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Start Battle Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              style={{
                background: 'linear-gradient(45deg, #fd7e14, #dc3545)',
                color: 'white',
                border: 'none',
                padding: '15px 50px',
                fontSize: '20px',
                fontWeight: 'bold',
                borderRadius: '30px',
                cursor: 'pointer',
                boxShadow: '0 5px 20px rgba(220, 53, 69, 0.3)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                gsap.to(e.target, { 
                  scale: 1.05, 
                  boxShadow: '0 8px 30px rgba(220, 53, 69, 0.5)'
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.target, { 
                  scale: 1, 
                  boxShadow: '0 5px 20px rgba(220, 53, 69, 0.3)'
                });
              }}
            >
              🚀 Start Battle!
            </button>
          </div>
        </form>
      </div>

      {/* Features */}
      <div
        ref={el => cardsRef.current[3] = el}
        style={{
          marginTop: '40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}
      >
        {[
          {
            icon: '⚡',
            title: 'Real-time Competition',
            desc: 'Track submission status live'
          },
          {
            icon: '🏆',
            title: 'Fair Matchmaking',
            desc: 'Problems based on skill level'
          },
          {
            icon: '📊',
            title: 'Detailed Analytics',
            desc: 'Compare solving approaches'
          },
          {
            icon: '🎯',
            title: 'Skill Development',
            desc: 'Learn from head-to-head battles'
          }
        ].map((feature, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '25px',
              borderRadius: '15px',
              textAlign: 'center',
              boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s'
            }}
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, { y: -5, duration: 0.3 });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, { y: 0, duration: 0.3 });
            }}
          >
            <div style={{ fontSize: '3em', marginBottom: '15px' }}>{feature.icon}</div>
            <h4 style={{ marginBottom: '10px', color: '#333' }}>{feature.title}</h4>
            <p style={{ color: '#666', fontSize: '14px' }}>{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BattleSetup;