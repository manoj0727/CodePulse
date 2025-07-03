import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function BattleResults({ battleData, onPlayAgain }) {
  const resultsRef = useRef(null);
  const trophyRef = useRef(null);
  const statsRef = useRef([]);

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(resultsRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }
    );

    // Trophy animation
    gsap.fromTo(trophyRef.current,
      { scale: 0, rotation: -180 },
      { 
        scale: 1, 
        rotation: 0, 
        duration: 1.5, 
        delay: 0.3,
        ease: "elastic.out(1, 0.5)"
      }
    );

    // Stats animation
    gsap.fromTo(statsRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.8,
        ease: "power2.out"
      }
    );

    // Confetti effect
    createConfetti();
  }, []);

  const createConfetti = () => {
    const colors = ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}vw;
        top: -20px;
        opacity: 1;
        transform: rotate(${Math.random() * 360}deg);
        pointer-events: none;
        z-index: 9999;
      `;
      document.body.appendChild(confetti);

      gsap.to(confetti, {
        y: window.innerHeight + 20,
        x: (Math.random() - 0.5) * 200,
        rotation: Math.random() * 360,
        opacity: 0,
        duration: 2 + Math.random() * 2,
        ease: "power1.out",
        onComplete: () => confetti.remove()
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!battleData) return null;

  const winner = battleData.winner === 'player1' ? battleData.player1 : battleData.player2;
  const loser = battleData.winner === 'player1' ? battleData.player2 : battleData.player1;

  return (
    <div ref={resultsRef} style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }}>
      {/* Victory Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
        padding: '40px',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 15px 50px rgba(255, 215, 0, 0.3)',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle, transparent 20%, rgba(255,255,255,0.3) 20.1%, rgba(255,255,255,0.3) 30%, transparent 30.1%)',
          backgroundSize: '20px 20px',
          animation: 'shine 3s linear infinite'
        }} />
        
        <div ref={trophyRef} style={{
          fontSize: '100px',
          marginBottom: '20px'
        }}>
          🏆
        </div>
        
        <h1 style={{
          fontSize: '3em',
          color: 'white',
          textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
          marginBottom: '20px'
        }}>
          Victory!
        </h1>
        
        <h2 style={{
          fontSize: '2em',
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          {winner.handle} Wins!
        </h2>
      </div>

      {/* Battle Stats */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '30px',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: '#333'
        }}>
          Battle Statistics
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div
            ref={el => statsRef.current[0] = el}
            style={{
              textAlign: 'center',
              padding: '20px',
              background: 'rgba(0, 123, 255, 0.1)',
              borderRadius: '10px'
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>⏱️</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {formatTime(battleData.time)}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Battle Duration</div>
          </div>

          <div
            ref={el => statsRef.current[1] = el}
            style={{
              textAlign: 'center',
              padding: '20px',
              background: 'rgba(40, 167, 69, 0.1)',
              borderRadius: '10px'
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>📝</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {battleData.problem?.name || 'Problem'}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>
              Rating: {battleData.problem?.rating || 'N/A'}
            </div>
          </div>
        </div>

        {/* Player Comparison */}
        <div style={{
          marginTop: '30px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}>
          <div
            ref={el => statsRef.current[2] = el}
            style={{
              padding: '20px',
              background: winner === battleData.player1 
                ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))'
                : 'rgba(0, 0, 0, 0.05)',
              borderRadius: '10px',
              border: winner === battleData.player1 ? '2px solid #FFD700' : 'none'
            }}
          >
            <h4 style={{ marginBottom: '15px', color: '#007bff' }}>
              {battleData.player1.handle}
              {winner === battleData.player1 && ' 👑'}
            </h4>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Status: <strong style={{ 
                color: battleData.player1.status === 'accepted' ? '#28a745' : '#dc3545' 
              }}>
                {battleData.player1.status.toUpperCase()}
              </strong>
            </div>
          </div>

          <div
            ref={el => statsRef.current[3] = el}
            style={{
              padding: '20px',
              background: winner === battleData.player2 
                ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))'
                : 'rgba(0, 0, 0, 0.05)',
              borderRadius: '10px',
              border: winner === battleData.player2 ? '2px solid #FFD700' : 'none'
            }}
          >
            <h4 style={{ marginBottom: '15px', color: '#dc3545' }}>
              {battleData.player2.handle}
              {winner === battleData.player2 && ' 👑'}
            </h4>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Status: <strong style={{ 
                color: battleData.player2.status === 'accepted' ? '#28a745' : '#dc3545' 
              }}>
                {battleData.player2.status.toUpperCase()}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onPlayAgain}
          style={{
            background: 'linear-gradient(45deg, #28a745, #20c997)',
            color: 'white',
            border: 'none',
            padding: '15px 40px',
            fontSize: '18px',
            fontWeight: 'bold',
            borderRadius: '30px',
            cursor: 'pointer',
            marginRight: '20px',
            boxShadow: '0 5px 20px rgba(40, 167, 69, 0.3)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            gsap.to(e.target, { scale: 1.05 });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.target, { scale: 1 });
          }}
        >
          🎮 Play Again
        </button>

        <button
          onClick={() => window.location.href = '/'}
          style={{
            background: 'transparent',
            color: '#666',
            border: '2px solid #666',
            padding: '15px 40px',
            fontSize: '18px',
            fontWeight: 'bold',
            borderRadius: '30px',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#333';
            e.target.style.color = '#333';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#666';
            e.target.style.color = '#666';
          }}
        >
          Back to Home
        </button>
      </div>

      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export default BattleResults;