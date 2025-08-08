import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import TextReveal from '../components/TextReveal';
import TypewriterText from '../components/TypewriterText';
import ScrollAnimation from '../components/ScrollAnimation';
import tournamentService from '../services/tournamentService';

function Tournament() {
  const [stage, setStage] = useState('create'); // create, join, bracket, match
  const [tournamentId, setTournamentId] = useState('');
  const [tournament, setTournament] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [cfHandle, setCfHandle] = useState('');
  const [currentMatch, setCurrentMatch] = useState(null);
  const [submissionCode, setSubmissionCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('54'); // C++ 17
  const [submissionResults, setSubmissionResults] = useState({});
  const [matchStartTime, setMatchStartTime] = useState(null);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const containerRef = useRef(null);
  const checkInterval = useRef(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    // Set up tournament update listener
    const handleTournamentUpdate = (updatedTournament) => {
      setTournament(updatedTournament);
      if (updatedTournament.status === 'ready' && stage === 'waiting') {
        setStage('bracket');
      }
    };

    const handleMatchWinner = (data) => {
      if (currentMatch && currentMatch.id === data.matchId) {
        setCurrentMatch({ ...currentMatch, winner: data.winner });
        setTimeout(() => {
          setStage('bracket');
          setCurrentMatch(null);
        }, 3000);
      }
    };

    tournamentService.on('tournament-update', handleTournamentUpdate);
    tournamentService.on('match-winner', handleMatchWinner);

    return () => {
      tournamentService.off('tournament-update', handleTournamentUpdate);
      tournamentService.off('match-winner', handleMatchWinner);
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, [stage, currentMatch]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (matchStartTime && currentMatch && !currentMatch.winner) {
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - matchStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [matchStartTime, currentMatch]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Create tournament
  const createTournament = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await tournamentService.createTournament();
      setTournamentId(data.tournamentId);
      setTournament(data.tournament);
      setStage('waiting');
    } catch (err) {
      setError('Failed to create tournament. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Join tournament
  const joinTournament = async () => {
    if (!playerName || !cfHandle) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await tournamentService.joinTournament(tournamentId, playerName, cfHandle);
      setTournament(data.tournament);
      const player = data.tournament.players.find(p => p.cfHandle === cfHandle);
      setCurrentPlayer(player);
      
      // Connect to WebSocket for real-time updates
      tournamentService.connect(tournamentId, player.id);
      
      // Clear inputs
      setPlayerName('');
      setCfHandle('');
    } catch (err) {
      setError(err.message || 'Failed to join tournament');
    } finally {
      setLoading(false);
    }
  };

  // Join existing tournament
  const joinExistingTournament = async () => {
    if (!tournamentId) return;
    
    setLoading(true);
    setError('');
    try {
      const tournament = await tournamentService.getTournament(tournamentId);
      setTournament(tournament);
      setStage('waiting');
    } catch (err) {
      setError('Tournament not found');
    } finally {
      setLoading(false);
    }
  };

  // Start a match
  const startMatch = (match) => {
    setCurrentMatch(match);
    setMatchStartTime(Date.now());
    setTimer(0);
    setSubmissionResults({});
    setStage('match');
    
    // Start checking for submissions
    startSubmissionChecking(match);
  };

  // Check CF submissions in real-time
  const startSubmissionChecking = (match) => {
    if (checkInterval.current) {
      clearInterval(checkInterval.current);
    }

    // Check immediately, then every 10 seconds
    checkSubmissions(match);
    checkInterval.current = setInterval(() => {
      checkSubmissions(match);
    }, 10000);
  };

  const checkSubmissions = async (match) => {
    try {
      const data = await tournamentService.checkSubmissions(
        tournamentId,
        match.id,
        matchStartTime
      );
      setSubmissionResults(data.results);
      
      // Update match if winner is found
      if (data.match.winner) {
        setCurrentMatch(data.match);
        clearInterval(checkInterval.current);
      }
    } catch (error) {
      console.error('Error checking submissions:', error);
    }
  };

  // Get problem URL
  const getProblemUrl = (problem) => {
    return `https://codeforces.com/problemset/problem/${problem.contest}/${problem.index}`;
  };

  // Find match in bracket - currently unused but may be needed later
  // const findMatch = (bracket, matchId) => {
  //   if (!bracket) return null;
  //   
  //   const semifinal = bracket.semifinals?.find(m => m.id === matchId);
  //   if (semifinal) return semifinal;
  //   
  //   const consolation = bracket.consolation?.find(m => m.id === matchId);
  //   if (consolation) return consolation;
  //   
  //   if (bracket.finals?.id === matchId) return bracket.finals;
  //   
  //   return null;
  // };

  return (
    <div ref={containerRef} style={{ minHeight: '100vh', padding: '100px 20px 50px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <ScrollAnimation>
          <TextReveal>
            <h1 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '20px',
              background: 'linear-gradient(45deg, #00d4ff, #ff006e, #ffaa00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Codeforces Live Tournament
            </h1>
          </TextReveal>
        </ScrollAnimation>

        <TypewriterText
          text="Real-time tournament with live Codeforces problem solving!"
          speed={50}
          style={{
            fontSize: '20px',
            textAlign: 'center',
            marginBottom: '50px',
            color: 'var(--text-secondary)'
          }}
        />

        {error && (
          <div style={{
            background: 'rgba(255, 0, 110, 0.1)',
            border: '2px solid #ff006e',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '20px',
            textAlign: 'center',
            color: '#ff006e'
          }}>
            {error}
          </div>
        )}

        {/* Create/Join Stage */}
        {stage === 'create' && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            flexWrap: 'wrap'
          }}>
            {/* Create Tournament */}
            <div className="glass-dark" style={{
              padding: '40px',
              borderRadius: '20px',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏆</div>
              <h2 style={{
                fontSize: '28px',
                marginBottom: '20px',
                color: '#00d4ff'
              }}>
                Create Tournament
              </h2>
              <p style={{
                marginBottom: '30px',
                color: 'var(--text-secondary)'
              }}>
                Start a new tournament and invite 3 friends to compete
              </p>
              <button
                onClick={createTournament}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '10px',
                  border: 'none',
                  background: loading ? '#666' : 'linear-gradient(45deg, #00d4ff, #00ff88)',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Creating...' : 'Create New Tournament'}
              </button>
            </div>

            {/* Join Tournament */}
            <div className="glass-dark" style={{
              padding: '40px',
              borderRadius: '20px',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎮</div>
              <h2 style={{
                fontSize: '28px',
                marginBottom: '20px',
                color: '#ff006e'
              }}>
                Join Tournament
              </h2>
              <p style={{
                marginBottom: '20px',
                color: 'var(--text-secondary)'
              }}>
                Enter the tournament code to join
              </p>
              <input
                type="text"
                placeholder="Tournament Code"
                value={tournamentId}
                onChange={(e) => setTournamentId(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '18px',
                  textAlign: 'center',
                  marginBottom: '20px',
                  letterSpacing: '3px'
                }}
              />
              <button
                onClick={joinExistingTournament}
                disabled={!tournamentId || loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '10px',
                  border: 'none',
                  background: !tournamentId || loading ? '#666' : 'linear-gradient(45deg, #ff006e, #ffaa00)',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: !tournamentId || loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Joining...' : 'Join Tournament'}
              </button>
            </div>
          </div>
        )}

        {/* Waiting Room */}
        {stage === 'waiting' && tournament && (
          <div className="glass-dark" style={{
            padding: '40px',
            borderRadius: '20px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '32px',
              textAlign: 'center',
              marginBottom: '30px',
              color: '#00d4ff'
            }}>
              Tournament Lobby
            </h2>
            
            {/* Tournament Code Display */}
            <div style={{
              textAlign: 'center',
              marginBottom: '40px',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px'
            }}>
              <p style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>
                Share this code with friends:
              </p>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                letterSpacing: '5px',
                color: '#00ff88'
              }}>
                {tournamentId}
              </div>
            </div>

            {/* Player Registration */}
            {!currentPlayer && tournament.players.length < 4 && (
              <div style={{
                marginBottom: '30px',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '10px'
              }}>
                <h3 style={{ marginBottom: '20px', color: '#ffaa00' }}>
                  Register to Join ({tournament.players.length}/4 players)
                </h3>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'white'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Codeforces Handle"
                    value={cfHandle}
                    onChange={(e) => setCfHandle(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'white'
                    }}
                  />
                  <button
                    onClick={joinTournament}
                    disabled={!playerName || !cfHandle || loading}
                    style={{
                      padding: '12px 30px',
                      borderRadius: '8px',
                      border: 'none',
                      background: !playerName || !cfHandle || loading ? '#666' : 'linear-gradient(45deg, #00d4ff, #00ff88)',
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: !playerName || !cfHandle || loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Joining...' : 'Join'}
                  </button>
                </div>
              </div>
            )}

            {/* Players List */}
            <div>
              <h3 style={{ marginBottom: '20px', color: '#00d4ff' }}>
                Registered Players
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                {[...Array(4)].map((_, index) => {
                  const player = tournament.players[index];
                  return (
                    <div key={index} style={{
                      padding: '20px',
                      borderRadius: '10px',
                      background: player ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      border: `2px solid ${player ? '#00ff88' : 'rgba(255, 255, 255, 0.1)'}`,
                      textAlign: 'center'
                    }}>
                      {player ? (
                        <>
                          <div style={{ fontSize: '36px', marginBottom: '10px' }}>
                            {player.avatar}
                          </div>
                          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                            {player.name}
                          </div>
                          <div style={{ fontSize: '14px', color: '#00d4ff' }}>
                            @{player.cfHandle}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                            Rating: {player.rating || 'Unrated'}
                          </div>
                          {player.rank && (
                            <div style={{ 
                              fontSize: '11px', 
                              color: player.rating >= 2100 ? '#ff8c00' : 
                                     player.rating >= 1900 ? '#a0a' :
                                     player.rating >= 1600 ? '#06f' :
                                     player.rating >= 1400 ? '#0a0' :
                                     player.rating >= 1200 ? '#0aa' : '#808080',
                              fontWeight: 'bold',
                              marginTop: '3px'
                            }}>
                              {player.rank}
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ color: '#666', padding: '20px' }}>
                          Waiting for player...
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {tournament.players.length === 4 && (
              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <div style={{
                  fontSize: '24px',
                  color: '#00ff88',
                  marginBottom: '10px'
                }}>
                  ✅ All players ready!
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Tournament bracket has been generated...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tournament Bracket */}
        {stage === 'bracket' && tournament?.bracket && (
          <div className="glass-dark" style={{
            padding: '40px',
            borderRadius: '20px'
          }}>
            <h2 style={{
              fontSize: '32px',
              textAlign: 'center',
              marginBottom: '40px',
              background: 'linear-gradient(45deg, #ff006e, #00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Tournament Bracket
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 200px 1fr',
              gap: '40px',
              alignItems: 'start'
            }}>
              {/* Left Side - Semifinals & Consolation */}
              <div>
                <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#00d4ff' }}>
                  Semifinals
                </h3>
                {tournament.bracket.semifinals.map((match) => (
                  <div key={match.id} style={{
                    marginBottom: '30px',
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    border: `2px solid ${match.winner ? '#00ff88' : '#00d4ff'}40`
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px'
                    }}>
                      <span style={{ fontSize: '14px', color: '#00d4ff' }}>
                        Match {match.id}
                      </span>
                      {match.cfProblem && (
                        <span style={{ fontSize: '12px', color: '#ffaa00' }}>
                          CF {match.cfProblem.contest}{match.cfProblem.index} ({match.cfProblem.rating})
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '24px' }}>{match.player1?.avatar}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: match.winner?.id === match.player1?.id ? 'bold' : 'normal' }}>
                          {match.player1?.name} (@{match.player1?.cfHandle})
                        </div>
                      </div>
                      {match.winner?.id === match.player1?.id && (
                        <span style={{ color: '#00ff88' }}>WIN</span>
                      )}
                    </div>
                    
                    <div style={{ textAlign: 'center', margin: '10px 0', color: '#ff006e' }}>VS</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                      <span style={{ fontSize: '24px' }}>{match.player2?.avatar}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: match.winner?.id === match.player2?.id ? 'bold' : 'normal' }}>
                          {match.player2?.name} (@{match.player2?.cfHandle})
                        </div>
                      </div>
                      {match.winner?.id === match.player2?.id && (
                        <span style={{ color: '#00ff88' }}>WIN</span>
                      )}
                    </div>
                    
                    {!match.winner && (
                      <button
                        onClick={() => startMatch(match)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'linear-gradient(45deg, #00d4ff, #ff006e)',
                          color: 'white',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Start Match
                      </button>
                    )}
                  </div>
                ))}

                {/* Consolation Matches */}
                {tournament.bracket.consolation[0].player1 && (
                  <>
                    <h3 style={{ textAlign: 'center', margin: '40px 0 20px', color: '#ffaa00' }}>
                      3rd Place Match
                    </h3>
                    {tournament.bracket.consolation.map((match) => (
                      match.player1 && match.player2 && (
                        <div key={match.id} style={{
                          marginBottom: '30px',
                          padding: '20px',
                          background: 'rgba(255, 165, 0, 0.05)',
                          borderRadius: '10px',
                          border: '2px solid #ffaa0040'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '15px'
                          }}>
                            <span style={{ fontSize: '14px', color: '#ffaa00' }}>
                              Bronze Match
                            </span>
                            {match.cfProblem && (
                              <span style={{ fontSize: '12px', color: '#00d4ff' }}>
                                CF {match.cfProblem.contest}{match.cfProblem.index}
                              </span>
                            )}
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '24px' }}>{match.player1?.avatar}</span>
                            <div style={{ flex: 1 }}>{match.player1?.name}</div>
                            {match.winner?.id === match.player1?.id && (
                              <span style={{ color: '#ffaa00' }}>3rd</span>
                            )}
                          </div>
                          
                          <div style={{ textAlign: 'center', margin: '10px 0', color: '#ff006e' }}>VS</div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <span style={{ fontSize: '24px' }}>{match.player2?.avatar}</span>
                            <div style={{ flex: 1 }}>{match.player2?.name}</div>
                            {match.winner?.id === match.player2?.id && (
                              <span style={{ color: '#ffaa00' }}>3rd</span>
                            )}
                          </div>
                          
                          {!match.winner && (
                            <button
                              onClick={() => startMatch(match)}
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'linear-gradient(45deg, #ffaa00, #ff006e)',
                                color: 'white',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                            >
                              Start Match
                            </button>
                          )}
                        </div>
                      )
                    ))}
                  </>
                )}
              </div>

              {/* Center - Connection Lines */}
              <div style={{ position: 'relative', height: '400px' }}>
                <svg style={{ width: '100%', height: '100%' }}>
                  <path
                    d="M 0 100 L 100 100 L 100 200 L 200 200"
                    stroke="#00d4ff40"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M 0 300 L 100 300 L 100 200 L 200 200"
                    stroke="#00d4ff40"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>

              {/* Right Side - Finals */}
              <div>
                <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#ffaa00' }}>
                  Grand Final
                </h3>
                <div style={{
                  padding: '20px',
                  background: 'rgba(255, 170, 0, 0.05)',
                  borderRadius: '10px',
                  border: '2px solid #ffaa0040'
                }}>
                  {tournament.bracket.finals.player1 && tournament.bracket.finals.player2 ? (
                    <>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '15px'
                      }}>
                        <span style={{ fontSize: '14px', color: '#ffaa00' }}>
                          Championship Match
                        </span>
                        {tournament.bracket.finals.cfProblem && (
                          <span style={{ fontSize: '12px', color: '#00d4ff' }}>
                            CF {tournament.bracket.finals.cfProblem.contest}{tournament.bracket.finals.cfProblem.index}
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '24px' }}>{tournament.bracket.finals.player1?.avatar}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: tournament.bracket.finals.winner?.id === tournament.bracket.finals.player1?.id ? 'bold' : 'normal' }}>
                            {tournament.bracket.finals.player1?.name}
                          </div>
                        </div>
                        {tournament.bracket.finals.winner?.id === tournament.bracket.finals.player1?.id && (
                          <span style={{ fontSize: '24px' }}>🏆</span>
                        )}
                      </div>
                      
                      <div style={{ textAlign: 'center', margin: '10px 0', color: '#ff006e' }}>VS</div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <span style={{ fontSize: '24px' }}>{tournament.bracket.finals.player2?.avatar}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: tournament.bracket.finals.winner?.id === tournament.bracket.finals.player2?.id ? 'bold' : 'normal' }}>
                            {tournament.bracket.finals.player2?.name}
                          </div>
                        </div>
                        {tournament.bracket.finals.winner?.id === tournament.bracket.finals.player2?.id && (
                          <span style={{ fontSize: '24px' }}>🏆</span>
                        )}
                      </div>
                      
                      {!tournament.bracket.finals.winner && (
                        <button
                          onClick={() => startMatch(tournament.bracket.finals)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(45deg, #ffaa00, #ff006e)',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          Start Final Match
                        </button>
                      )}
                    </>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#666'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '10px' }}>⏳</div>
                      Waiting for semifinal winners...
                    </div>
                  )}
                </div>

                {/* Champion Display */}
                {tournament.bracket.finals.winner && (
                  <div style={{
                    marginTop: '40px',
                    padding: '30px',
                    background: 'linear-gradient(135deg, #ffaa00, #ff006e)',
                    borderRadius: '15px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '72px', marginBottom: '20px' }}>🏆</div>
                    <h2 style={{ fontSize: '32px', marginBottom: '10px', color: 'white' }}>
                      Tournament Champion!
                    </h2>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {tournament.bracket.finals.winner.name}
                    </div>
                    <div style={{ fontSize: '16px', marginTop: '10px', opacity: 0.9 }}>
                      @{tournament.bracket.finals.winner.cfHandle}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Match Stage */}
        {stage === 'match' && currentMatch && (
          <div className="glass-dark" style={{
            padding: '40px',
            borderRadius: '20px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px'
            }}>
              <h2 style={{
                fontSize: '32px',
                background: 'linear-gradient(45deg, #00d4ff, #ff006e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Match in Progress
              </h2>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: timer > 1800 ? '#ff006e' : '#00ff88'
              }}>
                ⏱️ {formatTime(timer)}
              </div>
            </div>

            {/* Match Complete */}
            {currentMatch.winner && (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                background: 'rgba(0, 255, 136, 0.1)',
                borderRadius: '20px',
                marginBottom: '30px'
              }}>
                <div style={{ fontSize: '72px', marginBottom: '20px' }}>🎉</div>
                <h3 style={{
                  fontSize: '36px',
                  color: '#00ff88',
                  marginBottom: '20px'
                }}>
                  Match Complete!
                </h3>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                  Winner: <strong>{currentMatch.winner.name}</strong>
                </div>
                <div style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
                  @{currentMatch.winner.cfHandle}
                </div>
              </div>
            )}

            {/* Players */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '15px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                  {currentMatch.player1.avatar}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                  {currentMatch.player1.name}
                </div>
                <div style={{ fontSize: '14px', color: '#00d4ff' }}>
                  @{currentMatch.player1.cfHandle}
                </div>
                {submissionResults[currentMatch.player1.id] && (
                  <div style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    background: submissionResults[currentMatch.player1.id].verdict === 'OK' ? '#00ff8820' : '#ff006e20',
                    color: submissionResults[currentMatch.player1.id].verdict === 'OK' ? '#00ff88' : '#ff006e',
                    fontSize: '12px'
                  }}>
                    {submissionResults[currentMatch.player1.id].verdict}
                  </div>
                )}
              </div>

              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#ff006e'
              }}>
                VS
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                  {currentMatch.player2.avatar}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                  {currentMatch.player2.name}
                </div>
                <div style={{ fontSize: '14px', color: '#00d4ff' }}>
                  @{currentMatch.player2.cfHandle}
                </div>
                {submissionResults[currentMatch.player2.id] && (
                  <div style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    background: submissionResults[currentMatch.player2.id].verdict === 'OK' ? '#00ff8820' : '#ff006e20',
                    color: submissionResults[currentMatch.player2.id].verdict === 'OK' ? '#00ff88' : '#ff006e',
                    fontSize: '12px'
                  }}>
                    {submissionResults[currentMatch.player2.id].verdict}
                  </div>
                )}
              </div>
            </div>

            {/* Problem Details */}
            <div style={{
              padding: '20px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '10px',
              marginBottom: '30px'
            }}>
              <h3 style={{ marginBottom: '15px', color: '#00ff88' }}>
                Codeforces Problem
              </h3>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                {currentMatch.cfProblem.contest}{currentMatch.cfProblem.index} - {currentMatch.cfProblem.name}
              </div>
              <div style={{ fontSize: '16px', color: '#ffaa00', marginBottom: '15px' }}>
                Rating: {currentMatch.cfProblem.rating}
              </div>
              <a
                href={getProblemUrl(currentMatch.cfProblem)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: 'linear-gradient(45deg, #00d4ff, #00ff88)',
                  borderRadius: '8px',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                Open Problem on Codeforces
              </a>
            </div>

            {/* Instructions */}
            <div style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginBottom: '15px', color: '#00d4ff' }}>
                How to Compete
              </h3>
              <ol style={{ 
                lineHeight: '1.8',
                color: 'var(--text-secondary)',
                paddingLeft: '20px'
              }}>
                <li>Click "Open Problem on Codeforces" above</li>
                <li>Login to your Codeforces account</li>
                <li>Solve the problem and submit your solution</li>
                <li>First player to get "Accepted" wins!</li>
                <li>We check submissions automatically every 10 seconds</li>
              </ol>
            </div>

            {/* Code Reference Area */}
            <div style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <h3 style={{ color: '#00d4ff' }}>
                  Solution Notes (Optional)
                </h3>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  style={{
                    padding: '8px 15px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="54">C++17</option>
                  <option value="50">C++14</option>
                  <option value="73">Python 3</option>
                  <option value="74">Java 11</option>
                  <option value="55">JavaScript</option>
                </select>
              </div>

              <textarea
                value={submissionCode}
                onChange={(e) => setSubmissionCode(e.target.value)}
                placeholder="// You can paste your solution here for reference..."
                style={{
                  width: '100%',
                  height: '200px',
                  padding: '15px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#00ff88',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Status */}
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: 'rgba(0, 212, 255, 0.05)',
              borderRadius: '10px',
              marginTop: '20px'
            }}>
              <p style={{ fontSize: '16px', color: '#00d4ff' }}>
                🔄 Checking submissions every 10 seconds...
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '10px' }}>
                {currentMatch.winner 
                  ? 'Match completed! Returning to bracket...'
                  : 'First player to get "Accepted" wins the match!'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tournament;