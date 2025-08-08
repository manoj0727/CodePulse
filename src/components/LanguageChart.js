import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function LanguageChart({ languageStats, totalCount }) {
  const chartRef = useRef(null);
  const segmentsRef = useRef([]);

  useEffect(() => {
    if (!languageStats || Object.keys(languageStats).length === 0) return;

    // Sort languages by count
    const sortedLanguages = Object.entries(languageStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 6);

    // Calculate percentages
    let currentAngle = -90; // Start from top
    
    segmentsRef.current.forEach((segment, index) => {
      if (index < sortedLanguages.length) {
        const [, stats] = sortedLanguages[index];
        const percentage = (stats.count / totalCount) * 100;
        const angle = (percentage / 100) * 360;
        
        // Animate segment
        gsap.fromTo(segment,
          { 
            rotation: currentAngle,
            scale: 0,
            opacity: 0
          },
          {
            rotation: currentAngle,
            scale: 1,
            opacity: 1,
            duration: 0.8,
            delay: index * 0.1,
            ease: "back.out(1.7)"
          }
        );
        
        currentAngle += angle;
      }
    });

    // Animate center circle
    const centerCircle = chartRef.current?.querySelector('.center-circle');
    if (centerCircle) {
      gsap.fromTo(centerCircle,
        { scale: 0 },
        { scale: 1, duration: 1, delay: 0.5, ease: "back.out(1.7)" }
      );
    }

  }, [languageStats, totalCount]);

  if (!languageStats || Object.keys(languageStats).length === 0) return null;

  const colors = [
    '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6610f2',
    '#e83e8c', '#fd7e14', '#20c997', '#6c757d'
  ];

  const sortedLanguages = Object.entries(languageStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6);

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '20px',
      borderRadius: '10px',
      marginTop: '20px'
    }}>
      <h4 style={{ marginBottom: '20px', color: '#333' }}>Language Distribution</h4>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        {/* Pie Chart */}
        <div style={{ position: 'relative', width: '200px', height: '200px' }}>
          <svg ref={chartRef} width="200" height="200" viewBox="0 0 200 200">
            {sortedLanguages.map(([language, stats], index) => {
              const percentage = (stats.count / totalCount) * 100;
              const radius = 80;
              const circumference = 2 * Math.PI * radius;
              const strokeDasharray = (percentage / 100) * circumference;
              
              return (
                <g key={language} ref={el => segmentsRef.current[index] = el}>
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke={colors[index]}
                    strokeWidth="40"
                    strokeDasharray={`${strokeDasharray} ${circumference}`}
                    transform="rotate(-90 100 100)"
                    style={{
                      transition: 'stroke-dasharray 0.5s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      gsap.to(e.currentTarget, { strokeWidth: 45, duration: 0.2 });
                    }}
                    onMouseLeave={(e) => {
                      gsap.to(e.currentTarget, { strokeWidth: 40, duration: 0.2 });
                    }}
                  />
                </g>
              );
            })}
            
            {/* Center circle */}
            <circle
              className="center-circle"
              cx="100"
              cy="100"
              r="50"
              fill="white"
              opacity="0.95"
            />
            <text
              x="100"
              y="100"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="24"
              fontWeight="bold"
              fill="#333"
            >
              {sortedLanguages.length}
            </text>
            <text
              x="100"
              y="120"
              textAnchor="middle"
              fontSize="12"
              fill="#666"
            >
              Languages
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          {sortedLanguages.map(([language, stats], index) => {
            const percentage = ((stats.count / totalCount) * 100).toFixed(1);
            
            return (
              <div key={language} style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
                opacity: 0,
                animation: `fadeIn 0.5s ${index * 0.1}s forwards`
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: colors[index],
                  borderRadius: '4px',
                  marginRight: '10px',
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '500', color: '#333' }}>{language}</span>
                    <span style={{ color: '#666', fontSize: '14px' }}>{percentage}%</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                    {stats.count} repos • ⭐ {stats.stars} • 🍴 {stats.forks}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default LanguageChart;