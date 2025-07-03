// src/pages/BattleArena.js
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import AnimatedBackground from '../components/AnimatedBackground';
import BattleSetup from '../components/BattleSetup';
import BattleScreen from '../components/BattleScreen';
import BattleResults from '../components/BattleResults';

function BattleArena() {
  const [battleState, setBattleState] = useState('setup'); // setup, battle, results
  const [players, setPlayers] = useState({ player1: null, player2: null });
  const [battleData, setBattleData] = useState(null);
  const containerRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    // Animate entrance
    gsap.fromTo(titleRef.current,
      { opacity: 0, y: -50, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" }
    );

    gsap.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, delay: 0.3 }
    );
  }, []);

  const startBattle = (player1Handle, player2Handle, settings) => {
    setPlayers({ player1: player1Handle, player2: player2Handle, settings });
    setBattleState('battle');
  };

  const endBattle = (results) => {
    setBattleData(results);
    setBattleState('results');
  };

  const resetBattle = () => {
    setBattleState('setup');
    setPlayers({ player1: null, player2: null });
    setBattleData(null);
  };

  return (
    <>
      <AnimatedBackground />
      <div ref={containerRef} style={{ 
        position: 'relative', 
        zIndex: 1,
        minHeight: 'calc(100vh - 70px)',
        padding: '20px'
      }}>
        <h1 ref={titleRef} style={{
          background: 'linear-gradient(45deg, #dc3545, #fd7e14)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '3em',
          fontWeight: 'bold',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          ⚔️ Code Battle Arena ⚔️
        </h1>

        {battleState === 'setup' && (
          <BattleSetup onStartBattle={startBattle} />
        )}

        {battleState === 'battle' && (
          <BattleScreen 
            player1={players.player1} 
            player2={players.player2}
            settings={players.settings}
            onBattleEnd={endBattle}
          />
        )}

        {battleState === 'results' && (
          <BattleResults 
            battleData={battleData}
            onPlayAgain={resetBattle}
          />
        )}
      </div>
    </>
  );
}

export default BattleArena;