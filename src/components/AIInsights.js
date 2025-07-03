import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import TextReveal from './TextReveal';

function AIInsights({ githubData, codeforcesData }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const insightsRef = useRef([]);

  useEffect(() => {
    generateInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [githubData, codeforcesData]);

  const generateInsights = () => {
    setLoading(true);
    const newInsights = [];

    // GitHub Insights
    if (githubData?.success) {
      const gh = githubData.data;
      
      // Language expertise
      if (gh.languages && gh.languages.length > 0) {
        const topLang = gh.languages[0];
        newInsights.push({
          type: 'language',
          icon: '💻',
          title: 'Language Expert',
          content: `You're a ${topLang.language} specialist with ${topLang.count} repositories. ${topLang.count > 10 ? 'Consider diversifying into other languages!' : 'Keep building your expertise!'}`,
          score: Math.min(100, topLang.count * 10)
        });
      }

      // Contribution patterns
      const avgCommitsPerRepo = gh.publicRepos > 0 ? Math.round(gh.recentCommits / gh.publicRepos) : 0;
      newInsights.push({
        type: 'activity',
        icon: '📊',
        title: 'Activity Analysis',
        content: avgCommitsPerRepo > 10 
          ? `Highly active! You average ${avgCommitsPerRepo} commits per repo. You're in the top 10% of developers!`
          : `You average ${avgCommitsPerRepo} commits per repo. Try to maintain consistent activity.`,
        score: Math.min(100, avgCommitsPerRepo * 5)
      });

      // Community impact
      const impactScore = (gh.followers * 2) + gh.totalStars + (gh.totalForks * 3);
      newInsights.push({
        type: 'impact',
        icon: '🌟',
        title: 'Community Impact',
        content: impactScore > 100 
          ? `Outstanding impact with ${gh.totalStars} stars and ${gh.followers} followers! You're influencing the community.`
          : `Growing influence with ${gh.totalStars} stars. Focus on documentation to attract more users.`,
        score: Math.min(100, impactScore / 5)
      });

      // Repository quality
      const qualityScore = gh.totalStars / Math.max(1, gh.publicRepos);
      newInsights.push({
        type: 'quality',
        icon: '✨',
        title: 'Code Quality',
        content: qualityScore > 5
          ? `Excellent repository quality! Average of ${Math.round(qualityScore)} stars per repo.`
          : `Focus on quality over quantity. Current average: ${qualityScore.toFixed(1)} stars per repo.`,
        score: Math.min(100, qualityScore * 10)
      });
    }

    // Codeforces Insights
    if (codeforcesData?.success) {
      const cf = codeforcesData.data;
      
      // Competitive level
      newInsights.push({
        type: 'competitive',
        icon: '🏆',
        title: 'Competitive Level',
        content: cf.rating >= 1600 
          ? `Expert competitor! Rating: ${cf.rating}. You're in the top tier!`
          : `Current rating: ${cf.rating}. Solve more ${cf.rating < 1200 ? 'easy' : 'medium'} problems to improve.`,
        score: Math.min(100, (cf.rating / 20))
      });

      // Problem solving efficiency
      const efficiency = cf.acceptanceRate;
      newInsights.push({
        type: 'efficiency',
        icon: '🎯',
        title: 'Solution Accuracy',
        content: efficiency > 60
          ? `Impressive ${efficiency}% acceptance rate! You write clean, correct solutions.`
          : `${efficiency}% acceptance rate. Practice debugging and test your solutions thoroughly.`,
        score: efficiency
      });

      // Consistency
      const contestCount = cf.recentContests.length;
      newInsights.push({
        type: 'consistency',
        icon: '📈',
        title: 'Contest Participation',
        content: contestCount >= 5
          ? `Active competitor with ${contestCount} recent contests! Keep the momentum!`
          : `Only ${contestCount} recent contests. Regular participation improves skills faster.`,
        score: Math.min(100, contestCount * 20)
      });
    }

    // Combined insights
    if (githubData?.success && codeforcesData?.success) {
      const gh = githubData.data;
      const cf = codeforcesData.data;
      
      // Well-rounded developer
      const balanceScore = (gh.publicRepos > 10 && cf.solvedCount > 50) ? 100 : 50;
      newInsights.push({
        type: 'balance',
        icon: '⚖️',
        title: 'Developer Balance',
        content: balanceScore === 100
          ? `Perfect balance! Strong in both development (${gh.publicRepos} repos) and algorithms (${cf.solvedCount} problems).`
          : `Work on balance: ${gh.publicRepos} repos, ${cf.solvedCount} problems solved.`,
        score: balanceScore
      });

      // Career readiness
      const careerScore = (gh.hireable && cf.rating > 1200 && gh.publicRepos > 5) ? 90 : 60;
      newInsights.push({
        type: 'career',
        icon: '💼',
        title: 'Career Readiness',
        content: careerScore > 80
          ? `Highly employable! Strong GitHub presence + competitive programming skills = Dream candidate!`
          : `Building career readiness. Focus on ${gh.publicRepos < 5 ? 'more projects' : 'competitive programming'}.`,
        score: careerScore
      });
    }

    setInsights(newInsights);
    setLoading(false);

    // Animate insights
    setTimeout(() => {
      if (containerRef.current) {
        gsap.fromTo(insightsRef.current,
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
    }, 100);
  };

  return (
    <div ref={containerRef} style={{ marginTop: '40px' }}>
      <TextReveal>
        <h2 style={{ 
          fontSize: '28px', 
          marginBottom: '30px',
          background: 'linear-gradient(45deg, #00d4ff, #ff006e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center'
        }}>
          🤖 AI-Powered Insights
        </h2>
      </TextReveal>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="float">Analyzing your profile...</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {insights.map((insight, index) => (
            <div
              key={index}
              ref={el => insightsRef.current[index] = el}
              className="glass-dark"
              style={{
                padding: '25px',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1.05,
                  boxShadow: '0 10px 40px rgba(0, 212, 255, 0.3)'
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                });
              }}
            >
              {/* Background gradient based on score */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(135deg, 
                  ${insight.score > 80 ? 'rgba(0, 255, 136, 0.1)' : 
                    insight.score > 60 ? 'rgba(0, 212, 255, 0.1)' : 
                    'rgba(255, 0, 110, 0.1)'} 0%, 
                  transparent 100%)`,
                pointerEvents: 'none'
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  fontSize: '36px', 
                  marginBottom: '15px',
                  filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))'
                }}>
                  {insight.icon}
                </div>
                
                <h3 style={{ 
                  fontSize: '20px', 
                  marginBottom: '10px',
                  color: '#ffffff'
                }}>
                  {insight.title}
                </h3>
                
                <p style={{ 
                  fontSize: '14px', 
                  color: '#e0e0e0',
                  lineHeight: '1.6',
                  marginBottom: '15px'
                }}>
                  {insight.content}
                </p>

                {/* Score bar */}
                <div style={{
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${insight.score}%`,
                    background: `linear-gradient(90deg, 
                      ${insight.score > 80 ? '#00ff88' : 
                        insight.score > 60 ? '#00d4ff' : 
                        '#ff006e'} 0%, 
                      ${insight.score > 80 ? '#00d4ff' : 
                        insight.score > 60 ? '#ff006e' : 
                        '#ff4757'} 100%)`,
                    boxShadow: '0 0 10px currentColor',
                    transition: 'width 1s ease-out'
                  }} />
                </div>

                <div style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#999',
                  textAlign: 'right'
                }}>
                  Score: {insight.score}/100
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AIInsights;