// src/pages/Home.js
import React, { useState, useRef } from 'react';
import InputForm from '../components/InputForm';
import Results from '../components/Results';
import LoadingScreen from '../components/LoadingScreen';
import { fetchGitHubData, fetchCodeforcesData, calculateProfileScore } from '../services/api';

function Home() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const platformRef = useRef(null);


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
    if (platformRef.current) {
      platformRef.current.style.display = 'none';
    }
  };

  return (
    <>
      {/* AnimatedBackground is now in App.js */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <span style={{ fontSize: '60px' }}>
            💻
          </span>
          CodePulse
          <span style={{ fontSize: '60px' }}>
            ⚡
          </span>
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#e0e0e0',
          marginTop: '-20px',
          marginBottom: '30px',
          opacity: 0.8
        }}>
          Track Your Developer Journey in Real-Time
        </p>
        
        {!selectedPlatform && (
          <div ref={platformRef} style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              fontSize: '24px', 
              marginBottom: '30px',
              color: '#ffffff'
            }}>
              Choose Analysis Type
            </h2>
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
                  background: 'rgba(15, 15, 15, 0.9)',
                  padding: '30px',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
                }}
              >
                <img 
                  src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" 
                  alt="GitHub" 
                  style={{ width: '60px', marginBottom: '15px' }}
                />
                <h3 style={{ color: '#00d4ff', marginBottom: '10px' }}>GitHub Only</h3>
                <p style={{ color: '#cccccc', fontSize: '14px' }}>
                  Analyze your GitHub profile, repositories, and contributions
                </p>
              </div>

              <div
                className="platform-selection-card"
                onClick={() => selectPlatform('codeforces')}
                style={{
                  background: 'rgba(15, 15, 15, 0.9)',
                  padding: '30px',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
                }}
              >
                <div style={{ fontSize: '60px', marginBottom: '15px' }}>💻</div>
                <h3 style={{ color: '#ff006e', marginBottom: '10px' }}>Codeforces Only</h3>
                <p style={{ color: '#cccccc', fontSize: '14px' }}>
                  Analyze your competitive programming skills and rating
                </p>
              </div>

              <div
                className="platform-selection-card"
                onClick={() => selectPlatform('both')}
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 123, 255, 0.05), rgba(170, 0, 170, 0.05))',
                  backgroundColor: 'rgba(15, 15, 15, 0.9)',
                  padding: '30px',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 212, 255, 0.03)'
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
                <p style={{ color: '#cccccc', fontSize: '14px' }}>
                  Get comprehensive insights from both platforms
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedPlatform && !results && (
          <>
            <button
              onClick={() => {
                setSelectedPlatform(null);
                setError(null);
                if (platformRef.current) {
                  platformRef.current.style.display = 'block';
                }
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
          <div className="glass-dark" style={{ 
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