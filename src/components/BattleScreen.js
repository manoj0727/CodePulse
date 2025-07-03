import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CodeforcesRealTimeBattle, getRandomProblem, verifyCodeforcesUser } from '../services/battleApi';

function BattleScreen({ player1, player2, onBattleEnd, settings = {} }) {
  const [problem, setProblem] = useState(null);
  const [timer, setTimer] = useState(0);
  const [player1Data, setPlayer1Data] = useState({ status: 'waiting' });
  const [player2Data, setPlayer2Data] = useState({ status: 'waiting' });
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const battleRef = useRef(null);
  const timerRef = useRef(null);
  const battleMonitor = useRef(null);
  const player1CardRef = useRef(null);
  const player2CardRef = useRef(null);

  useEffect(() => {
    initializeBattle();

    // Animate entrance with glassmorphism effect
    gsap.fromTo(battleRef.current,
      { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: "power3.out" }
    );

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (battleMonitor.current) battleMonitor.current.stopMonitoring();
    };
  }, []);

  const initializeBattle = async () => {
    try {
      // Verify both users exist
      const [user1, user2] = await Promise.all([
        verifyCodeforcesUser(player1),
        verifyCodeforcesUser(player2)
      ]);

      if (!user1.exists || !user2.exists) {
        throw new Error('One or both users not found on Codeforces');
      }

      // Set user data
      setPlayer1Data({ ...player1Data, user: user1.user });
      setPlayer2Data({ ...player2Data, user: user2.user });

      // Get random problem
      const selectedProblem = await getRandomProblem(settings.difficulty || 'medium');
      setProblem(selectedProblem);

      // Start timer
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);

      // Start real-time monitoring
      battleMonitor.current = new CodeforcesRealTimeBattle(
        player1, 
        player2, 
        selectedProblem.problemId
      );

      battleMonitor.current.startMonitoring((update) => {
        handleBattleUpdate(update);
      });

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleBattleUpdate = (update) => {
    // Update player 1 status
    if (update.player1.status !== player1Data.status) {
      setPlayer1Data(update.player1);
      if (update.player1.isNew) {
        animateStatusChange(player1CardRef.current, update.player1.status);
      }
    }

    // Update player 2 status
    if (update.player2.status !== player2Data.status) {
      setPlayer2Data(update.player2);
      if (update.player2.isNew) {
        animateStatusChange(player2CardRef.current, update.player2.status);
      }
    }

    // Check for winner
    if (!winner) {
      if (update.player1.status === 'accepted') {
        declareWinner('player1', update);
      } else if (update.player2.status === 'accepted') {
        declareWinner('player2', update);
      }
    }
  };

  const animateStatusChange = (element, status) => {
    const colors = {
      submitted: '#ffc107',
      testing: '#17a2b8',
      accepted: '#28a745',
      wrong: '#dc3545'
    };

    gsap.to(element, {
      scale: 1.1,
      boxShadow: `0 0 50px ${colors[status]}`,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });

    // Ripple effect
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 20px;
      height: 20px;
      background: ${colors[status]};
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    `;
    element.appendChild(ripple);

    gsap.to(ripple, {
      width: 300,
      height: 300,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
      onComplete: () => ripple.remove()
    });
  };

  const declareWinner = (winnerPlayer, update) => {
    setWinner(winnerPlayer);
    if (battleMonitor.current) {
      battleMonitor.current.stopMonitoring();
    }
    clearInterval(timerRef.current);

    // Epic victory animation
    const winnerElement = winnerPlayer === 'player1' ? player1CardRef.current : player2CardRef.current;
    const loserElement = winnerPlayer === 'player1' ? player2CardRef.current : player1CardRef.current;

    gsap.timeline()
      .to(winnerElement, {
        scale: 1.2,
        zIndex: 100,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)"
      })
      .to(winnerElement, {
        boxShadow: '0 0 100px #FFD700',
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.1))',
        duration: 0.5
      }, "-=0.3")
      .to(loserElement, {
        scale: 0.9,
        opacity: 0.7,
        filter: 'grayscale(50%)',
        duration: 0.5
      }, "-=0.5");

    setTimeout(() => {
      onBattleEnd({
        winner: winnerPlayer,
        player1: update.player1,
        player2: update.player2,
        problem,
        time: timer
      });
    }, 3000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusDisplay = (data) => {
    const statusConfig = {
      waiting: { icon: '⏸️', text: 'Waiting', color: '#6c757d' },
      submitted: { icon: '📤', text: 'Submitted', color: '#ffc107' },
      testing: { icon: '⚙️', text: 'Testing', color: '#17a2b8' },
      accepted: { icon: '✅', text: 'Accepted', color: '#28a745' },
      wrong: { icon: '❌', text: 'Wrong Answer', color: '#dc3545' }
    };

    return statusConfig[data.status] || statusConfig.waiting;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'spin 2s linear infinite' }}>⚔️</div>
        <h2>Preparing Battle Arena...</h2>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <h2 style={{ color: '#dc3545' }}>Battle Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div ref={battleRef} style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px'
    }}>
      {/* Timer and Problem Info - Glassmorphism */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '30px',
        borderRadius: '30px',
        marginBottom: '30px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{
          fontSize: '64px',
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #007bff, #00ff88)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '20px',
          fontFamily: 'monospace',
          textShadow: '0 0 30px rgba(0, 123, 255, 0.5)'
        }}>
          {formatTime(timer)}
        </div>
        
        {problem && (
          <div>
            <h2 style={{ 
              marginBottom: '15px', 
              color: '#fff',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }}>
              Problem {problem.contestId}{problem.index}: {problem.name}
            </h2>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '30px',
              flexWrap: 'wrap',
              marginBottom: '20px'
            }}>
              <span style={{ 
                color: '#fff', 
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '8px 16px',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                Rating: {problem.rating}
              </span>
              <span style={{ 
                color: '#fff',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '8px 16px',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                Tags: {problem.tags.slice(0, 3).join(', ')}
              </span>
            </div>
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '12px 30px',
                background: 'linear-gradient(45deg, #007bff, #0056b3)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '25px',
                boxShadow: '0 5px 20px rgba(0, 123, 255, 0.3)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                gsap.to(e.target, { scale: 1.05, boxShadow: '0 8px 30px rgba(0, 123, 255, 0.5)' });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.target, { scale: 1, boxShadow: '0 5px 20px rgba(0, 123, 255, 0.3)' });
              }}
            >
              Open Problem →
            </a>
          </div>
        )}
      </div>

      {/* Battle Arena - Responsive Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        position: 'relative'
      }}>
        {/* Player 1 Card */}
        <div
          ref={player1CardRef}
          style={{
            background: winner === 'player1' 
              ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))' 
              : 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: winner === 'player1' 
              ? '2px solid #FFD700' 
              : '1px solid rgba(255, 255, 255, 0.2)',
            padding: '30px',
            borderRadius: '30px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s'
          }}
        >
          {winner === 'player1' && (
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              fontSize: '72px',
              animation: 'bounce 1s infinite'
            }}>
              🏆
            </div>
          )}
          
          {player1Data.user && (
            <img 
              src={player1Data.user.avatar}
              alt={player1}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                marginBottom: '15px',
                border: '3px solid #007bff',
                boxShadow: '0 0 20px rgba(0, 123, 255, 0.3)'
              }}
            />
          )}
          
          <h2 style={{ 
            color: '#007bff', 
            marginBottom: '10px',
            fontSize: '28px'
          }}>
            {player1}
          </h2>
          
          {player1Data.user && (
            <div style={{ 
              fontSize: '14px', 
              color: '#666',
              marginBottom: '20px'
            }}>
              Rating: {player1Data.user.rating} ({player1Data.user.rank})
            </div>
          )}
          
          <div style={{
            fontSize: '64px',
            marginBottom: '15px',
            filter: `drop-shadow(0 0 20px ${getStatusDisplay(player1Data).color})`
          }}>
            {getStatusDisplay(player1Data).icon}
          </div>
          
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: getStatusDisplay(player1Data).color,
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            {getStatusDisplay(player1Data).text}
          </div>
          
          {player1Data.submission && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              {player1Data.language}<br/>
              {player1Data.passedTests > 0 && `Passed: ${player1Data.passedTests} tests`}
            </div>
          )}
          
          {/* Real-time progress indicator */}
          <div style={{
            marginTop: '20px',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: player1Data.status === 'accepted' ? '100%' : 
                     player1Data.status === 'testing' ? '66%' :
                     player1Data.status === 'submitted' ? '33%' : '0%',
              background: `linear-gradient(90deg, ${getStatusDisplay(player1Data).color}, ${getStatusDisplay(player1Data).color}dd)`,
              transition: 'width 0.5s ease',
              boxShadow: `0 0 10px ${getStatusDisplay(player1Data).color}`
            }} />
          </div>
        </div>

        {/* VS Indicator - Hidden on mobile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '@media (max-width: 768px)': {
            display: 'none'
          }
        }}>
          <div style={{
            fontSize: '72px',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #dc3545, #fd7e14)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(220, 53, 69, 0.5))',
            animation: 'pulse 2s infinite'
          }}>
            VS
          </div>
        </div>

        {/* Player 2 Card */}
        <div
          ref={player2CardRef}
          style={{
            background: winner === 'player2' 
              ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))' 
              : 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: winner === 'player2' 
              ? '2px solid #FFD700' 
              : '1px solid rgba(255, 255, 255, 0.2)',
            padding: '30px',
            borderRadius: '30px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s'
          }}
        >
          {winner === 'player2' && (
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              fontSize: '72px',
              animation: 'bounce 1s infinite'
            }}>
              🏆
            </div>
          )}
          
          {player2Data.user && (
            <img 
              src={player2Data.user.avatar}
              alt={player2}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                marginBottom: '15px',
                border: '3px solid #dc3545',
                boxShadow: '0 0 20px rgba(220, 53, 69, 0.3)'
              }}
            />
          )}
          
          <h2 style={{ 
            color: '#dc3545', 
            marginBottom: '10px',
            fontSize: '28px'
          }}>
            {player2}
          </h2>
          
          {player2Data.user && (
            <div style={{ 
              fontSize: '14px', 
              color: '#666',
              marginBottom: '20px'
            }}>
              Rating: {player2Data.user.rating} ({player2Data.user.rank})
            </div>
          )}
          
          <div style={{
            fontSize: '64px',
            marginBottom: '15px',
            filter: `drop-shadow(0 0 20px ${getStatusDisplay(player2Data).color})`
          }}>
            {getStatusDisplay(player2Data).icon}
          </div>
          
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: getStatusDisplay(player2Data).color,
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            {getStatusDisplay(player2Data).text}
          </div>
          
          {player2Data.submission && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              {player2Data.language}<br/>
              {player2Data.passedTests > 0 && `Passed: ${player2Data.passedTests} tests`}
            </div>
          )}
          
          {/* Real-time progress indicator */}
          <div style={{
            marginTop: '20px',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: player2Data.status === 'accepted' ? '100%' : 
                     player2Data.status === 'testing' ? '66%' :
                     player2Data.status === 'submitted' ? '33%' : '0%',
              background: `linear-gradient(90deg, ${getStatusDisplay(player2Data).color}, ${getStatusDisplay(player2Data).color}dd)`,
              transition: 'width 0.5s ease',
              boxShadow: `0 0 10px ${getStatusDisplay(player2Data).color}`
            }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @media (max-width: 768px) {
          .vs-indicator { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default BattleScreen;