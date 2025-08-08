import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function RatingProgressChart({ ratingHistory }) {
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const dotsRef = useRef([]);

  useEffect(() => {
    if (!ratingHistory || ratingHistory.length === 0) return;

    const svg = svgRef.current;
    const width = 500;
    const height = 200;
    const padding = 40;

    // Calculate min and max ratings
    const ratings = ratingHistory.map(r => r.newRating);
    const minRating = Math.min(...ratings) - 100;
    const maxRating = Math.max(...ratings) + 100;

    // Create scales
    const xScale = (index) => padding + (index / (ratingHistory.length - 1)) * (width - 2 * padding);
    const yScale = (rating) => height - padding - ((rating - minRating) / (maxRating - minRating)) * (height - 2 * padding);

    // Create path data
    ratingHistory
      .map((contest, index) => {
        xScale(index);
        yScale(contest.newRating);
        return `${index === 0 ? 'M' : 'L'}`;
      })
      .join(' ');

    // Animate path drawing
    const path = pathRef.current;
    const pathLength = path.getTotalLength();
    
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength
    });

    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 2,
      ease: "power2.out"
    });

    // Create and animate dots
    ratingHistory.forEach((contest, index) => {
      const x = xScale(index);
      const y = yScale(contest.newRating);
      
      const dot = dotsRef.current[index];
      if (dot) {
        gsap.fromTo(dot,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            delay: 0.5 + index * 0.1,
            ease: "back.out(1.7)"
          }
        );

        // Add hover effect
        dot.addEventListener('mouseenter', () => {
          gsap.to(dot, { scale: 1.5, duration: 0.2 });
          // Show tooltip
          const tooltip = dot.querySelector('.tooltip');
          gsap.to(tooltip, { opacity: 1, y: -10, duration: 0.2 });
        });

        dot.addEventListener('mouseleave', () => {
          gsap.to(dot, { scale: 1, duration: 0.2 });
          // Hide tooltip
          const tooltip = dot.querySelector('.tooltip');
          gsap.to(tooltip, { opacity: 0, y: 0, duration: 0.2 });
        });
      }
    });

    // Animate grid lines
    const gridLines = svg.querySelectorAll('.grid-line');
    gsap.fromTo(gridLines,
      { opacity: 0 },
      { opacity: 0.2, duration: 1, stagger: 0.1 }
    );

  }, [ratingHistory]);

  if (!ratingHistory || ratingHistory.length === 0) {
    return <div>No rating history available</div>;
  }

  const width = 500;
  const height = 200;
  const padding = 40;

  const ratings = ratingHistory.map(r => r.newRating);
  const minRating = Math.min(...ratings) - 100;
  const maxRating = Math.max(...ratings) + 100;

  const xScale = (index) => padding + (index / (ratingHistory.length - 1)) * (width - 2 * padding);
  const yScale = (rating) => height - padding - ((rating - minRating) / (maxRating - minRating)) * (height - 2 * padding);

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '20px',
      borderRadius: '10px',
      marginTop: '20px'
    }}>
      <h4 style={{ marginBottom: '20px', color: '#333' }}>Rating Progress</h4>
      <div style={{ overflowX: 'auto' }}>
        <svg ref={svgRef} width={width} height={height} style={{ minWidth: '500px' }}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => {
            const y = padding + (i / 4) * (height - 2 * padding);
            const rating = maxRating - (i / 4) * (maxRating - minRating);
            return (
              <g key={i}>
                <line
                  className="grid-line"
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#e0e0e0"
                  strokeWidth="1"
                />
                <text
                  x={padding - 10}
                  y={y + 5}
                  textAnchor="end"
                  fontSize="12"
                  fill="#666"
                >
                  {Math.round(rating)}
                </text>
              </g>
            );
          })}

          {/* Main path */}
          <path
            ref={pathRef}
            d={ratingHistory
              .map((contest, index) => {
                const x = xScale(index);
                const y = yScale(contest.newRating);
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              })
              .join(' ')}
            fill="none"
            stroke="url(#ratingGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="ratingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#007bff" />
              <stop offset="50%" stopColor="#28a745" />
              <stop offset="100%" stopColor="#ffc107" />
            </linearGradient>
          </defs>

          {/* Data points */}
          {ratingHistory.map((contest, index) => {
            const x = xScale(index);
            const y = yScale(contest.newRating);
            const ratingChange = contest.newRating - contest.oldRating;

            return (
              <g key={index} ref={el => dotsRef.current[index] = el}>
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill={ratingChange >= 0 ? '#28a745' : '#dc3545'}
                  stroke="white"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                />
                <g className="tooltip" style={{ opacity: 0 }}>
                  <rect
                    x={x - 60}
                    y={y - 40}
                    width="120"
                    height="30"
                    fill="rgba(0, 0, 0, 0.8)"
                    rx="5"
                  />
                  <text
                    x={x}
                    y={y - 20}
                    textAnchor="middle"
                    fontSize="12"
                    fill="white"
                  >
                    Rating: {contest.newRating}
                  </text>
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fill={ratingChange >= 0 ? '#28a745' : '#dc3545'}
                  >
                    {ratingChange >= 0 ? '+' : ''}{ratingChange}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default RatingProgressChart;