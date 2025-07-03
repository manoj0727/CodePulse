// src/pages/Home.js
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import InputForm from '../components/InputForm';
import Results from '../components/Results';
import AnimatedBackground from '../components/AnimatedBackground';
import AILoader from '../components/AILoader';
import LoadingScreen from '../components/LoadingScreen';
import TextReveal from '../components/TextReveal';
import Card3D from '../components/Card3D';
import ScrollAnimation from '../components/ScrollAnimation';
import { fetchGitHubData, fetchCodeforcesData, calculateProfileScore } from '../services/api';

function Home() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const titleRef = useRef(null);
  const containerRef = useRef(null);
  const errorRef = useRef(null);
  const loadingRef = useRef(null);
  const platformRef = useRef(null);

  useEffect(() => {
    // Animate title on mount
    gsap.fromTo(titleRef.current, 
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
    
    // Animate container
    gsap.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, delay: 0.3 }
    );
  }, []);

  useEffect(() => {
    if (error && errorRef.current) {
      gsap.fromTo(errorRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3 }
      );
    }
  }, [error]);

  useEffect(() => {
    if (loading && loadingRef.current) {
      gsap.fromTo(loadingRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.3 }
      );
    }
  }, [loading]);

  useEffect(() => {
    if (platformRef.current) {
      const cards = platformRef.current.querySelectorAll('.platform-selection-card');
      gsap.fromTo(cards,
        { opacity: 0, y: 30, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out"
        }
      );
    }
  }, []);

  const handleAnalyze = async (data) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      let githubResult = null;
      let codeforcesResult = null;

      // Fetch data based on selected platform
      if (selectedPlatform === 'both' || selectedPlatform === 'github') {
        githubResult = await fetchGitHubData(data.github);
      }
      
      if (selectedPlatform === 'both' || selectedPlatform === 'codeforces') {
        codeforcesResult = await fetchCodeforcesData(data.codeforces);
      }

      // Check for errors
      if (selectedPlatform === 'github' && !githubResult?.success) {
        throw new Error('Invalid GitHub username. Please check and try again.');
      }
      if (selectedPlatform === 'codeforces' && !codeforcesResult?.success) {
        throw new Error('Invalid Codeforces handle. Please check and try again.');
      }
      if (selectedPlatform === 'both' && !githubResult?.success && !codeforcesResult?.success) {
        throw new Error('Both usernames are invalid. Please check and try again.');
      }

      // Calculate scores and insights
      const analysis = calculateProfileScore(githubResult, codeforcesResult);

      setResults({
        ...analysis,
        githubData: githubResult?.success ? githubResult.data : null,
        codeforcesData: codeforcesResult?.success ? codeforcesResult.data : null,
        githubError: githubResult && !githubResult.success ? githubResult.error : null,
        codeforcesError: codeforcesResult && !codeforcesResult.success ? codeforcesResult.error : null,
        platform: selectedPlatform
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectPlatform = (platform) => {
    setSelectedPlatform(platform);
    gsap.to(platformRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      onComplete: () => {
        if (platformRef.current) {
          platformRef.current.style.display = 'none';
        }
      }
    });
  };

  return (
    <>
      {/* AnimatedBackground is now in App.js */}
      <div ref={containerRef} style={{ position: 'relative', zIndex: 1 }}>
        <TextReveal delay={0.2}>
          <h1 ref={titleRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <span style={{ 
              fontSize: '60px', 
              filter: 'drop-shadow(0 0 20px rgba(0, 212, 255, 0.8))',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              💻
            </span>
            CodePulse
            <span style={{ 
              fontSize: '60px', 
              filter: 'drop-shadow(0 0 20px rgba(255, 0, 110, 0.8))',
              animation: 'pulse 2s ease-in-out infinite',
              animationDelay: '1s'
            }}>
              ⚡
            </span>
          </h1>
        </TextReveal>
        <TextReveal delay={0.4}>
          <p style={{
            fontSize: '20px',
            color: '#e0e0e0',
            marginTop: '-20px',
            marginBottom: '30px',
            opacity: 0.8
          }}>
            Track Your Developer Journey in Real-Time
          </p>
        </TextReveal>
        
        {!selectedPlatform && (
          <div ref={platformRef} style={{ marginBottom: '40px' }}>
            <ScrollAnimation animation="fadeUp">
              <TextReveal delay={0.3}>
                <h2 style={{ 
                  fontSize: '24px', 
                  marginBottom: '30px',
                  color: '#ffffff'
                }}>
                  Choose Analysis Type
                </h2>
              </TextReveal>
            </ScrollAnimation>
            
            <ScrollAnimation animation="fadeUp" stagger={0.1} delay={0.4}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                maxWidth: '800px',
                margin: '0 auto'
              }}>
              <div
                className="platform-selection-card"
                onClick={() => selectPlatform('github')}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: '30px',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  border: '2px solid transparent',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, { 
                    scale: 1.05, 
                    borderColor: '#007bff',
                    boxShadow: '0 12px 40px rgba(0, 123, 255, 0.3)'
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, { 
                    scale: 1, 
                    borderColor: 'transparent',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  });
                }}
              >
                <img 
                  src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" 
                  alt="GitHub" 
                  style={{ width: '60px', marginBottom: '15px' }}
                />
                <h3 style={{ color: '#007bff', marginBottom: '10px' }}>GitHub Only</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Analyze your GitHub profile, repositories, and contributions
                </p>
              </div>

              <div
                className="platform-selection-card"
                onClick={() => selectPlatform('codeforces')}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: '30px',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  border: '2px solid transparent',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, { 
                    scale: 1.05, 
                    borderColor: '#AA00AA',
                    boxShadow: '0 12px 40px rgba(170, 0, 170, 0.3)'
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, { 
                    scale: 1, 
                    borderColor: 'transparent',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  });
                }}
              >
                <div style={{ fontSize: '60px', marginBottom: '15px' }}>💻</div>
                <h3 style={{ color: '#AA00AA', marginBottom: '10px' }}>Codeforces Only</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Analyze your competitive programming skills and rating
                </p>
              </div>

              <div
                className="platform-selection-card"
                onClick={() => selectPlatform('both')}
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 123, 255, 0.1), rgba(170, 0, 170, 0.1))',
                  padding: '30px',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  border: '2px solid transparent',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, { 
                    scale: 1.05, 
                    borderColor: '#28a745',
                    boxShadow: '0 12px 40px rgba(40, 167, 69, 0.3)'
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, { 
                    scale: 1, 
                    borderColor: 'transparent',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  });
                }}
              >
                <div style={{ fontSize: '60px', marginBottom: '15px' }}>🚀</div>
                <h3 style={{ 
                  background: 'linear-gradient(45deg, #007bff, #AA00AA)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '10px' 
                }}>
                  Complete Analysis
                </h3>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Get comprehensive insights from both platforms
                </p>
              </div>
            </div>
            </ScrollAnimation>
          </div>
        )}

        {selectedPlatform && !results && (
          <>
            <button
              onClick={() => {
                setSelectedPlatform(null);
                setError(null);
                gsap.fromTo(platformRef.current,
                  { opacity: 0, y: -20, display: 'block' },
                  { opacity: 1, y: 0, duration: 0.3 }
                );
              }}
              style={{
                background: 'none',
                border: '1px solid #666',
                color: '#666',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                marginBottom: '20px',
                fontSize: '14px'
              }}
            >
              ← Change Platform
            </button>
            
            <InputForm 
              onAnalyze={handleAnalyze} 
              disabled={loading}
              platform={selectedPlatform}
            />
          </>
        )}
        
        {loading && <LoadingScreen />}
        
        {error && (
          <div ref={errorRef} className="glass-dark" style={{ 
            color: '#ff4757', 
            textAlign: 'center', 
            margin: '20px 0',
            padding: '20px',
            borderRadius: '15px',
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
            border: '1px solid rgba(255, 71, 87, 0.3)',
            boxShadow: '0 4px 20px rgba(255, 71, 87, 0.2)'
          }}>
            <span style={{ fontSize: '24px', marginRight: '10px' }}>⚠️</span>
            {error}
          </div>
        )}
        
        {results && <Results data={results} />}
      </div>
    </>
  );
}

export default Home;