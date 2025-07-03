// src/components/Results.js
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import ScoreVisualization from './ScoreVisualization';
import TypewriterText from './TypewriterText';
import DifficultyChart from './DifficultyChart';
import RatingProgressChart from './RatingProgressChart';
import ProblemRatingDistribution from './ProblemRatingDistribution';
import SkillRadar from './SkillRadar';
import LanguageChart from './LanguageChart';
import ContributionHeatmap from './ContributionHeatmap';
import Card3D from './Card3D';
import ScrollAnimation from './ScrollAnimation';
import TextReveal from './TextReveal';
import AIInsights from './AIInsights';
import Globe3D from './Globe3D';
import AchievementSystem from './AchievementSystem';
import ExportProfile from './ExportProfile';

function Results({ data }) {
  const containerRef = useRef(null);
  const insightsRef = useRef(null);
  const githubRef = useRef(null);
  const codeforcesRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    // Animate container entrance with glow effect
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    // Add pulsing glow effect
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        boxShadow: '0 0 30px rgba(0, 123, 255, 0.5)',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
    }

    // Animate platform sections with stagger
    const sections = [githubRef.current, codeforcesRef.current].filter(Boolean);
    gsap.fromTo(sections,
      { opacity: 0, y: 50, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 0.8,
        stagger: 0.2,
        delay: 0.5,
        ease: "power3.out"
      }
    );

    // Create floating animation for sections
    sections.forEach((section, index) => {
      gsap.to(section, {
        y: -5,
        duration: 2 + index * 0.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        delay: index * 0.3
      });
    });
  }, [data]);

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  // Function to create star rating visualization
  const createStarRating = (rating, maxRating) => {
    const percentage = (rating / maxRating) * 5;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= percentage) {
        stars.push('★');
      } else {
        stars.push('☆');
      }
    }
    return stars.join(' ');
  };

  return (
    <div ref={containerRef} style={{ marginTop: '40px' }} className="results-container">
      <ExportProfile profileData={data} />
      <div ref={glowRef} style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: '30px', 
        borderRadius: '15px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        marginBottom: '30px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 123, 255, 0.1)'
      }}>
        <h2 style={{ 
          background: 'linear-gradient(45deg, #007bff, #00ff88)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '30px'
        }}>
          AI-Powered Analysis Complete
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '40px', 
          marginBottom: '40px' 
        }}>
          <ScoreVisualization 
            score={data.profileScore} 
            maxScore={100} 
            label="Profile Score" 
            color="#007bff"
            delay={0.3}
          />
          <ScoreVisualization 
            score={data.readinessScore} 
            maxScore={100} 
            label="Recruiter Readiness" 
            color="#28a745"
            delay={0.5}
          />
        </div>

        <div style={{
          background: 'rgba(0, 123, 255, 0.05)',
          padding: '20px',
          borderRadius: '10px',
          marginTop: '30px',
          border: '1px solid rgba(0, 123, 255, 0.1)'
        }}>
          <h3 style={{ 
            color: '#333', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '24px' }}>🤖</span>
            AI Insights & Recommendations
          </h3>
          <ul ref={insightsRef} style={{ 
            textAlign: 'left', 
            listStyle: 'none',
            padding: 0
          }}>
            {data.insights.map((insight, index) => (
              <li key={index} style={{
                marginBottom: '15px',
                padding: '15px',
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '8px',
                borderLeft: '4px solid #007bff',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '20px', color: '#007bff' }}>→</span>
                <TypewriterText text={insight} delay={1000 + index * 500} speed={30} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '20px' 
      }}>
        {/* GitHub Section */}
        {data.githubData ? (
          <div ref={githubRef} className="platform-card" style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            padding: '25px', 
            borderRadius: '15px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated background gradient */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(0, 123, 255, 0.05) 0%, rgba(0, 255, 136, 0.05) 100%)',
              zIndex: 0
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ 
                color: '#333', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" 
                     alt="GitHub" 
                     style={{ width: '30px', verticalAlign: 'middle' }} />
                GitHub Profile Analysis
              </h3>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '20px',
                padding: '15px',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '10px'
              }}>
                <img src={data.githubData.avatarUrl} 
                     alt={data.githubData.username} 
                     style={{ 
                       width: '80px', 
                       height: '80px', 
                       borderRadius: '50%', 
                       marginRight: '20px',
                       border: '3px solid #007bff',
                       boxShadow: '0 0 20px rgba(0, 123, 255, 0.3)'
                     }} />
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#007bff' }}>
                    {data.githubData.name || data.githubData.username}
                  </h4>
                  <p style={{ color: '#666', margin: '5px 0', fontSize: '14px' }}>
                    @{data.githubData.username}
                  </p>
                  {data.githubData.bio && (
                    <p style={{ fontSize: '13px', color: '#666', margin: '5px 0' }}>
                      {data.githubData.bio}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
                gap: '15px', 
                marginBottom: '20px'
              }}>
                {[
                  { label: 'Repositories', value: data.githubData.publicRepos, icon: '📁' },
                  { label: 'Followers', value: data.githubData.followers, icon: '👥' },
                  { label: 'Total Stars', value: data.githubData.totalStars, icon: '⭐' },
                  { label: 'Total Forks', value: data.githubData.totalForks, icon: '🍴' }
                ].map((stat, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(0, 123, 255, 0.05)',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid rgba(0, 123, 255, 0.1)'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {data.githubData.languages.length > 0 && (
                <>
                  <h4 style={{ marginBottom: '10px', color: '#333' }}>Top Languages</h4>
                  <div style={{ marginBottom: '15px' }}>
                    {data.githubData.languages.map((lang, idx) => (
                      <span key={idx} style={{ 
                        display: 'inline-block', 
                        background: `linear-gradient(135deg, #007bff, #0056b3)`,
                        color: 'white',
                        padding: '6px 12px', 
                        borderRadius: '20px',
                        margin: '5px',
                        fontSize: '13px',
                        fontWeight: '500',
                        boxShadow: '0 2px 10px rgba(0, 123, 255, 0.2)'
                      }}>
                        {lang.language} ({lang.count})
                      </span>
                    ))}
                  </div>
                </>
              )}

              {/* Advanced GitHub Statistics */}
              {data.githubData.languageStats && (
                <LanguageChart 
                  languageStats={data.githubData.languageStats} 
                  totalCount={data.githubData.totalLanguageCount}
                />
              )}

              {data.githubData.contributionsByDay && (
                <ContributionHeatmap contributionsByDay={data.githubData.contributionsByDay} />
              )}

              {/* Repository Statistics */}
              {data.githubData.repoStats && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '20px',
                  borderRadius: '10px',
                  marginTop: '20px'
                }}>
                  <h4 style={{ marginBottom: '15px', color: '#333' }}>Repository Statistics</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
                    <div>
                      <span style={{ color: '#666', fontSize: '14px' }}>Original Repos:</span>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                        {data.githubData.repoStats.originalRepos}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#666', fontSize: '14px' }}>Open Issues:</span>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                        {data.githubData.repoStats.openIssues}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#666', fontSize: '14px' }}>Total Watchers:</span>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                        {data.githubData.repoStats.totalWatchers}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#666', fontSize: '14px' }}>Recent Commits:</span>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                        {data.githubData.recentCommits}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {data.githubData.topRepos.length > 0 && (
                <>
                  <h4 style={{ marginBottom: '10px', color: '#333', marginTop: '20px' }}>Top Repositories</h4>
                  {data.githubData.topRepos.slice(0, 3).map((repo, idx) => (
                    <div key={idx} style={{ 
                      background: 'rgba(255, 255, 255, 0.6)', 
                      padding: '12px', 
                      borderRadius: '8px',
                      marginBottom: '10px',
                      border: '1px solid rgba(0, 123, 255, 0.1)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 123, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <a href={repo.url} target="_blank" rel="noopener noreferrer" 
                         style={{ fontWeight: 'bold', color: '#007bff', textDecoration: 'none' }}>
                        {repo.name}
                      </a>
                      <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                        ⭐ {repo.stars} | 🍴 {repo.forks} {repo.language && `| 💻 ${repo.language}`}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        ) : data.githubError && (
          <div ref={githubRef} style={{ 
            background: 'rgba(248, 215, 218, 0.9)', 
            padding: '25px', 
            borderRadius: '15px',
            boxShadow: '0 8px 32px rgba(220, 53, 69, 0.1)',
            border: '1px solid rgba(220, 53, 69, 0.2)'
          }}>
            <h3 style={{ color: '#721c24' }}>GitHub Profile Error</h3>
            <p style={{ color: '#721c24' }}>{data.githubError}</p>
          </div>
        )}

        {/* Codeforces Section */}
        {data.codeforcesData ? (
          <div ref={codeforcesRef} className="platform-card" style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            padding: '25px', 
            borderRadius: '15px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated background gradient */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.05) 0%, rgba(170, 0, 170, 0.05) 100%)',
              zIndex: 0
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ 
                color: '#333', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '24px' }}>💻</span>
                Codeforces Profile Analysis
              </h3>

              <div style={{ 
                marginBottom: '20px',
                padding: '15px',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{data.codeforcesData.handle}</h4>
                <p style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold', 
                  margin: '10px 0',
                  color: data.codeforcesData.rating >= 2100 ? '#FF8C00' :
                         data.codeforcesData.rating >= 1900 ? '#AA00AA' :
                         data.codeforcesData.rating >= 1600 ? '#0000FF' :
                         data.codeforcesData.rating >= 1400 ? '#03A89E' :
                         data.codeforcesData.rating >= 1200 ? '#008000' :
                         '#808080'
                }}>
                  {data.codeforcesData.rank.charAt(0).toUpperCase() + data.codeforcesData.rank.slice(1)}
                </p>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {createStarRating(data.codeforcesData.rating, 3000)}
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
                gap: '15px', 
                marginBottom: '20px'
              }}>
                {[
                  { label: 'Rating', value: data.codeforcesData.rating, icon: '📊' },
                  { label: 'Max Rating', value: data.codeforcesData.maxRating, icon: '🏆' },
                  { label: 'Problems', value: data.codeforcesData.solvedCount, icon: '✅' },
                  { label: 'Success Rate', value: `${data.codeforcesData.acceptanceRate}%`, icon: '🎯' }
                ].map((stat, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(170, 0, 170, 0.05)',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid rgba(170, 0, 170, 0.1)'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#AA00AA' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {data.codeforcesData.languages.length > 0 && (
                <>
                  <h4 style={{ marginBottom: '10px', color: '#333' }}>Programming Languages</h4>
                  <div style={{ marginBottom: '15px' }}>
                    {data.codeforcesData.languages.map((lang, idx) => (
                      <span key={idx} style={{ 
                        display: 'inline-block', 
                        background: `linear-gradient(135deg, #AA00AA, #7B0099)`,
                        color: 'white',
                        padding: '6px 12px', 
                        borderRadius: '20px',
                        margin: '5px',
                        fontSize: '13px',
                        fontWeight: '500',
                        boxShadow: '0 2px 10px rgba(170, 0, 170, 0.2)'
                      }}>
                        {lang.language.split(' ')[0]} ({lang.count})
                      </span>
                    ))}
                  </div>
                </>
              )}

              {data.codeforcesData.recentContests.length > 0 && (
                <>
                  <h4 style={{ marginBottom: '10px', color: '#333' }}>Recent Contests</h4>
                  {data.codeforcesData.recentContests.slice(0, 3).map((contest, idx) => (
                    <div key={idx} style={{ 
                      background: 'rgba(255, 255, 255, 0.6)', 
                      padding: '12px', 
                      borderRadius: '8px',
                      marginBottom: '10px',
                      border: '1px solid rgba(170, 0, 170, 0.1)',
                      fontSize: '13px'
                    }}>
                      <div style={{ fontWeight: '500' }}>{contest.contestName}</div>
                      <div style={{ color: '#666', marginTop: '5px' }}>
                        🏅 Rank: {contest.rank} | 
                        <span style={{ 
                          color: contest.newRating - contest.oldRating > 0 ? '#28a745' : '#dc3545',
                          fontWeight: 'bold',
                          marginLeft: '5px'
                        }}>
                          {contest.newRating - contest.oldRating > 0 ? '+' : ''}{contest.newRating - contest.oldRating}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Advanced Statistics */}
              {data.codeforcesData.solvedByDifficulty && (
                <DifficultyChart data={data.codeforcesData.solvedByDifficulty} />
              )}

              {data.codeforcesData.problemsByRating && (
                <ProblemRatingDistribution problemsByRating={data.codeforcesData.problemsByRating} />
              )}

              {data.codeforcesData.ratingHistory && data.codeforcesData.ratingHistory.length > 0 && (
                <RatingProgressChart ratingHistory={data.codeforcesData.ratingHistory} />
              )}

              {data.codeforcesData.topTags && data.codeforcesData.topTags.length > 0 && (
                <SkillRadar topTags={data.codeforcesData.topTags.slice(0, 8)} />
              )}

              {/* Detailed Statistics */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '20px',
                borderRadius: '10px',
                marginTop: '20px'
              }}>
                <h4 style={{ marginBottom: '15px', color: '#333' }}>Detailed Statistics</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <span style={{ color: '#666', fontSize: '14px' }}>Total Submissions:</span>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#AA00AA' }}>
                      {data.codeforcesData.submissionCount}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '14px' }}>Average Problem Rating:</span>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#AA00AA' }}>
                      {data.codeforcesData.avgProblemRating}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '14px' }}>Problems Attempted:</span>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#AA00AA' }}>
                      {data.codeforcesData.attemptedCount}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '14px' }}>Contest Participation:</span>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#AA00AA' }}>
                      {data.codeforcesData.ratingHistory ? data.codeforcesData.ratingHistory.length : 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : data.codeforcesError && (
          <div ref={codeforcesRef} style={{ 
            background: 'rgba(248, 215, 218, 0.9)', 
            padding: '25px', 
            borderRadius: '15px',
            boxShadow: '0 8px 32px rgba(220, 53, 69, 0.1)',
            border: '1px solid rgba(220, 53, 69, 0.2)'
          }}>
            <h3 style={{ color: '#721c24' }}>Codeforces Profile Error</h3>
            <p style={{ color: '#721c24' }}>{data.codeforcesError}</p>
          </div>
        )}
      </div>

      {/* AI Insights Section */}
      <AIInsights 
        githubData={data.githubData} 
        codeforcesData={data.codeforcesData} 
      />

      {/* Achievement System */}
      <AchievementSystem 
        githubData={data.githubData} 
        codeforcesData={data.codeforcesData} 
      />

      {/* Globe Visualization */}
      {(data.githubData?.success && data.githubData.data.location) && (
        <div style={{ 
          marginTop: '40px', 
          display: 'flex', 
          justifyContent: 'center' 
        }}>
          <Globe3D location={data.githubData.data.location} />
        </div>
      )}
    </div>
  );
}

export default Results;