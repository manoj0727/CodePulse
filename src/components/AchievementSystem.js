import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function AchievementSystem({ githubData, codeforcesData }) {
  const [achievements, setAchievements] = useState([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const containerRef = useRef(null);
  const badgesRef = useRef([]);

  useEffect(() => {
    checkAchievements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [githubData, codeforcesData]);

  const checkAchievements = () => {
    const newAchievements = [];

    // Define all achievements
    const allAchievements = [
      // GitHub Achievements
      {
        id: 'first_repo',
        name: 'Hello World',
        description: 'Create your first repository',
        icon: '🎯',
        condition: () => githubData?.data?.publicRepos >= 1,
        rarity: 'common',
        points: 10
      },
      {
        id: 'repo_master',
        name: 'Repository Master',
        description: 'Create 10+ repositories',
        icon: '📚',
        condition: () => githubData?.data?.publicRepos >= 10,
        rarity: 'rare',
        points: 50
      },
      {
        id: 'star_collector',
        name: 'Star Collector',
        description: 'Earn 50+ stars across all repos',
        icon: '⭐',
        condition: () => githubData?.data?.totalStars >= 50,
        rarity: 'epic',
        points: 100
      },
      {
        id: 'popular_dev',
        name: 'Popular Developer',
        description: 'Gain 100+ followers',
        icon: '👥',
        condition: () => githubData?.data?.followers >= 100,
        rarity: 'legendary',
        points: 200
      },
      {
        id: 'polyglot',
        name: 'Polyglot Programmer',
        description: 'Use 5+ programming languages',
        icon: '🌐',
        condition: () => githubData?.data?.languages?.length >= 5,
        rarity: 'rare',
        points: 75
      },
      {
        id: 'open_source',
        name: 'Open Source Hero',
        description: 'Have repos forked 20+ times',
        icon: '🦸',
        condition: () => githubData?.data?.totalForks >= 20,
        rarity: 'epic',
        points: 150
      },
      
      // Codeforces Achievements
      {
        id: 'first_solve',
        name: 'Problem Solver',
        description: 'Solve your first problem',
        icon: '✅',
        condition: () => codeforcesData?.data?.solvedCount >= 1,
        rarity: 'common',
        points: 10
      },
      {
        id: 'century',
        name: 'Century',
        description: 'Solve 100+ problems',
        icon: '💯',
        condition: () => codeforcesData?.data?.solvedCount >= 100,
        rarity: 'rare',
        points: 100
      },
      {
        id: 'expert_rank',
        name: 'Expert Competitor',
        description: 'Reach 1600+ rating',
        icon: '🏆',
        condition: () => codeforcesData?.data?.rating >= 1600,
        rarity: 'epic',
        points: 200
      },
      {
        id: 'accuracy',
        name: 'Sharp Shooter',
        description: 'Maintain 70%+ acceptance rate',
        icon: '🎯',
        condition: () => codeforcesData?.data?.acceptanceRate >= 70,
        rarity: 'rare',
        points: 80
      },
      {
        id: 'contest_regular',
        name: 'Contest Regular',
        description: 'Participate in 10+ contests',
        icon: '🏁',
        condition: () => codeforcesData?.data?.recentContests?.length >= 10,
        rarity: 'rare',
        points: 60
      },
      
      // Combined Achievements
      {
        id: 'full_stack',
        name: 'Full Stack Developer',
        description: 'Active on both GitHub and Codeforces',
        icon: '🔥',
        condition: () => 
          githubData?.data?.publicRepos >= 5 && 
          codeforcesData?.data?.solvedCount >= 50,
        rarity: 'epic',
        points: 150
      },
      {
        id: 'elite_coder',
        name: 'Elite Coder',
        description: '1400+ CF rating & 30+ GitHub repos',
        icon: '👑',
        condition: () => 
          codeforcesData?.data?.rating >= 1400 && 
          githubData?.data?.publicRepos >= 30,
        rarity: 'legendary',
        points: 300
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Complete profile on both platforms',
        icon: '💎',
        condition: () => 
          githubData?.data?.bio && 
          githubData?.data?.location && 
          codeforcesData?.data?.country,
        rarity: 'rare',
        points: 50
      }
    ];

    // Check which achievements are unlocked
    let unlocked = 0;
    allAchievements.forEach(achievement => {
      const isUnlocked = achievement.condition();
      newAchievements.push({
        ...achievement,
        unlocked: isUnlocked
      });
      if (isUnlocked) unlocked++;
    });

    setAchievements(newAchievements);
    setUnlockedCount(unlocked);

    // Animate new unlocks
    setTimeout(() => {
      animateBadges();
    }, 100);
  };

  const animateBadges = () => {
    if (!badgesRef.current) return;

    gsap.fromTo(badgesRef.current,
      { scale: 0, opacity: 0, rotationY: -180 },
      {
        scale: 1,
        opacity: 1,
        rotationY: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: "back.out(1.7)"
      }
    );
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#00d4ff',
      rare: '#00ff88',
      epic: '#ff006e',
      legendary: '#ffd700'
    };
    return colors[rarity] || '#ffffff';
  };

  const getRarityGlow = (rarity) => {
    const glows = {
      common: '0 0 20px rgba(0, 212, 255, 0.5)',
      rare: '0 0 30px rgba(0, 255, 136, 0.6)',
      epic: '0 0 40px rgba(255, 0, 110, 0.7)',
      legendary: '0 0 50px rgba(255, 215, 0, 0.8)'
    };
    return glows[rarity] || '';
  };

  const totalPoints = achievements.reduce((sum, a) => sum + (a.unlocked ? a.points : 0), 0);

  return (
    <div ref={containerRef} style={{ marginTop: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{
          fontSize: '28px',
          background: 'linear-gradient(45deg, #ffd700, #ff006e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}>
          🏅 Achievements
        </h2>
        
        <div style={{ fontSize: '18px', color: '#e0e0e0', marginBottom: '20px' }}>
          {unlockedCount}/{achievements.length} Unlocked • {totalPoints} Points
        </div>

        {/* Progress bar */}
        <div style={{
          width: '300px',
          height: '10px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '5px',
          margin: '0 auto',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(unlockedCount / achievements.length) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #00d4ff, #ff006e)',
            transition: 'width 1s ease-out',
            boxShadow: '0 0 10px currentColor'
          }} />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {achievements.map((achievement, index) => (
          <div
            key={achievement.id}
            ref={el => badgesRef.current[index] = el}
            className={achievement.unlocked ? 'achievement-unlocked' : 'achievement-locked'}
            style={{
              position: 'relative',
              padding: '20px',
              borderRadius: '15px',
              background: achievement.unlocked 
                ? `rgba(20, 20, 30, 0.8)`
                : 'rgba(20, 20, 30, 0.4)',
              border: `2px solid ${achievement.unlocked ? getRarityColor(achievement.rarity) : 'rgba(255, 255, 255, 0.1)'}`,
              boxShadow: achievement.unlocked ? getRarityGlow(achievement.rarity) : '',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: achievement.unlocked ? 1 : 0.5,
              filter: achievement.unlocked ? 'none' : 'grayscale(100%)',
              transformStyle: 'preserve-3d',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              if (achievement.unlocked) {
                gsap.to(e.currentTarget, {
                  scale: 1.1,
                  rotationY: 15,
                  boxShadow: getRarityGlow(achievement.rarity).replace('0.8', '1')
                });
              }
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1,
                rotationY: 0,
                boxShadow: achievement.unlocked ? getRarityGlow(achievement.rarity) : ''
              });
            }}
          >
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '10px',
              filter: achievement.unlocked ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))' : ''
            }}>
              {achievement.icon}
            </div>
            
            <h4 style={{ 
              fontSize: '14px', 
              color: achievement.unlocked ? '#ffffff' : '#999',
              marginBottom: '5px'
            }}>
              {achievement.name}
            </h4>
            
            <p style={{ 
              fontSize: '11px', 
              color: achievement.unlocked ? '#e0e0e0' : '#666',
              marginBottom: '10px',
              lineHeight: '1.4'
            }}>
              {achievement.description}
            </p>

            <div style={{
              fontSize: '10px',
              color: getRarityColor(achievement.rarity),
              textTransform: 'uppercase',
              fontWeight: 'bold',
              marginBottom: '5px'
            }}>
              {achievement.rarity}
            </div>

            <div style={{
              fontSize: '12px',
              color: achievement.unlocked ? '#ffd700' : '#555'
            }}>
              {achievement.points} pts
            </div>

            {achievement.unlocked && (
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                background: getRarityColor(achievement.rarity),
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: getRarityGlow(achievement.rarity)
              }}>
                ✓
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AchievementSystem;