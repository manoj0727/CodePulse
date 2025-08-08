import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function SkillRadar({ topTags }) {
  const svgRef = useRef(null);
  const polygonRef = useRef(null);

  useEffect(() => {
    if (!topTags || topTags.length === 0) return;

    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    const angleStep = (2 * Math.PI) / topTags.length;

    // Calculate max count for scaling
    const maxCount = Math.max(...topTags.map(t => t.count));

    // Generate polygon points
    const points = topTags.map((tag, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const value = (tag.count / maxCount) * radius;
      const x = centerX + value * Math.cos(angle);
      const y = centerY + value * Math.sin(angle);
      return { x, y, angle, tag: tag.tag, count: tag.count };
    });

    // Create polygon path
    points.map(p => `${p.x},${p.y}`).join(' ');

    // Animate polygon
    gsap.fromTo(polygonRef.current,
      { opacity: 0, scale: 0 },
      { 
        opacity: 0.7, 
        scale: 1, 
        duration: 1.5,
        ease: "power3.out"
      }
    );

    // Animate dots and labels
    const dots = svgRef.current.querySelectorAll('.skill-dot');
    const labels = svgRef.current.querySelectorAll('.skill-label');

    gsap.fromTo(dots,
      { scale: 0 },
      {
        scale: 1,
        duration: 0.5,
        stagger: 0.05,
        delay: 0.5,
        ease: "back.out(1.7)"
      }
    );

    gsap.fromTo(labels,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.05,
        delay: 0.7,
        ease: "power2.out"
      }
    );

    // Add rotation animation
    gsap.to(svgRef.current, {
      rotation: 360,
      duration: 60,
      repeat: -1,
      ease: "none"
    });

  }, [topTags]);

  if (!topTags || topTags.length === 0) return null;

  const centerX = 150;
  const centerY = 150;
  const radius = 100;
  const angleStep = (2 * Math.PI) / topTags.length;
  const maxCount = Math.max(...topTags.map(t => t.count));

  // Generate points for radar chart
  const points = topTags.map((tag, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const value = (tag.count / maxCount) * radius;
    const x = centerX + value * Math.cos(angle);
    const y = centerY + value * Math.sin(angle);
    const labelX = centerX + (radius + 30) * Math.cos(angle);
    const labelY = centerY + (radius + 30) * Math.sin(angle);
    return { x, y, labelX, labelY, angle, tag: tag.tag, count: tag.count };
  });

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '20px',
      borderRadius: '10px',
      marginTop: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <h4 style={{ marginBottom: '20px', color: '#333' }}>Skill Radar</h4>
      <svg ref={svgRef} width="300" height="300" style={{ overflow: 'visible' }}>
        {/* Background circles */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale, index) => (
          <circle
            key={index}
            cx={centerX}
            cy={centerY}
            r={radius * scale}
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="1"
            opacity="0.3"
          />
        ))}

        {/* Axis lines */}
        {points.map((point, index) => (
          <line
            key={index}
            x1={centerX}
            y1={centerY}
            x2={centerX + radius * Math.cos(point.angle)}
            y2={centerY + radius * Math.sin(point.angle)}
            stroke="#e0e0e0"
            strokeWidth="1"
            opacity="0.3"
          />
        ))}

        {/* Skill polygon */}
        <polygon
          ref={polygonRef}
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          fill="url(#skillGradient)"
          stroke="#007bff"
          strokeWidth="2"
          opacity="0.7"
        />

        {/* Gradient definition */}
        <defs>
          <radialGradient id="skillGradient">
            <stop offset="0%" stopColor="#007bff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00ff88" stopOpacity="0.3" />
          </radialGradient>
        </defs>

        {/* Skill dots and labels */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              className="skill-dot"
              cx={point.x}
              cy={point.y}
              r="6"
              fill="#007bff"
              stroke="white"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, { scale: 1.5, duration: 0.2 });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
              }}
            />
            <text
              className="skill-label"
              x={point.labelX}
              y={point.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill="#666"
              style={{ fontWeight: '500' }}
            >
              {point.tag}
            </text>
            <text
              className="skill-label"
              x={point.labelX}
              y={point.labelY + 15}
              textAnchor="middle"
              fontSize="10"
              fill="#007bff"
              style={{ fontWeight: 'bold' }}
            >
              ({point.count})
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default SkillRadar;