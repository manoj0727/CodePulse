import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function ProblemRatingDistribution({ problemsByRating }) {
  const containerRef = useRef(null);
  const barsRef = useRef([]);

  useEffect(() => {
    if (!problemsByRating || Object.keys(problemsByRating).length === 0) return;

    // Group problems by rating ranges
    const ratingRanges = {
      '800-999': 0,
      '1000-1199': 0,
      '1200-1399': 0,
      '1400-1599': 0,
      '1600-1799': 0,
      '1800-1999': 0,
      '2000-2199': 0,
      '2200+': 0
    };

    Object.entries(problemsByRating).forEach(([rating, count]) => {
      const r = parseInt(rating);
      if (r < 1000) ratingRanges['800-999'] += count;
      else if (r < 1200) ratingRanges['1000-1199'] += count;
      else if (r < 1400) ratingRanges['1200-1399'] += count;
      else if (r < 1600) ratingRanges['1400-1599'] += count;
      else if (r < 1800) ratingRanges['1600-1799'] += count;
      else if (r < 2000) ratingRanges['1800-1999'] += count;
      else if (r < 2200) ratingRanges['2000-2199'] += count;
      else ratingRanges['2200+'] += count;
    });

    const maxCount = Math.max(...Object.values(ratingRanges));
    
    // Animate bars
    Object.entries(ratingRanges).forEach(([range, count], index) => {
      const bar = barsRef.current[index];
      if (!bar) return;

      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
      
      gsap.fromTo(bar.querySelector('.bar-fill'),
        { width: '0%' },
        {
          width: `${percentage}%`,
          duration: 1,
          delay: index * 0.05,
          ease: "power3.out"
        }
      );

      // Animate count
      const countEl = bar.querySelector('.count');
      let obj = { count: 0 };
      gsap.to(obj, {
        count: count,
        duration: 1,
        delay: index * 0.05,
        ease: "power2.out",
        onUpdate: function() {
          if (countEl) {
            countEl.textContent = Math.floor(obj.count);
          }
        }
      });
    });

  }, [problemsByRating]);

  if (!problemsByRating || Object.keys(problemsByRating).length === 0) {
    return null;
  }

  // Group problems by rating ranges
  const ratingRanges = {
    '800-999': 0,
    '1000-1199': 0,
    '1200-1399': 0,
    '1400-1599': 0,
    '1600-1799': 0,
    '1800-1999': 0,
    '2000-2199': 0,
    '2200+': 0
  };

  Object.entries(problemsByRating).forEach(([rating, count]) => {
    const r = parseInt(rating);
    if (r < 1000) ratingRanges['800-999'] += count;
    else if (r < 1200) ratingRanges['1000-1199'] += count;
    else if (r < 1400) ratingRanges['1200-1399'] += count;
    else if (r < 1600) ratingRanges['1400-1599'] += count;
    else if (r < 1800) ratingRanges['1600-1799'] += count;
    else if (r < 2000) ratingRanges['1800-1999'] += count;
    else if (r < 2200) ratingRanges['2000-2199'] += count;
    else ratingRanges['2200+'] += count;
  });

  const getBarColor = (range) => {
    if (range.includes('800')) return '#28a745';
    if (range.includes('1000')) return '#20c997';
    if (range.includes('1200')) return '#17a2b8';
    if (range.includes('1400')) return '#007bff';
    if (range.includes('1600')) return '#6610f2';
    if (range.includes('1800')) return '#e83e8c';
    if (range.includes('2000')) return '#dc3545';
    return '#fd7e14';
  };

  return (
    <div ref={containerRef} style={{
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '20px',
      borderRadius: '10px',
      marginTop: '20px'
    }}>
      <h4 style={{ marginBottom: '20px', color: '#333' }}>Problem Rating Distribution</h4>
      <div>
        {Object.entries(ratingRanges).map(([range, count], index) => (
          <div
            key={range}
            ref={el => barsRef.current[index] = el}
            style={{
              marginBottom: '15px'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '5px',
              fontSize: '14px'
            }}>
              <span style={{ color: '#666', fontWeight: '500' }}>{range}</span>
              <span className="count" style={{ 
                color: getBarColor(range), 
                fontWeight: 'bold' 
              }}>0</span>
            </div>
            <div style={{
              height: '20px',
              background: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '10px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div
                className="bar-fill"
                style={{
                  height: '100%',
                  background: `linear-gradient(90deg, ${getBarColor(range)} 0%, ${getBarColor(range)}dd 100%)`,
                  borderRadius: '10px',
                  boxShadow: `0 0 10px ${getBarColor(range)}40`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                  animation: 'shimmer 2s infinite',
                  transform: 'translateX(-100%)'
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

export default ProblemRatingDistribution;