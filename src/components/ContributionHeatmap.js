import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function ContributionHeatmap({ contributionsByDay }) {
  const heatmapRef = useRef(null);
  const cellsRef = useRef([]);

  useEffect(() => {
    if (!contributionsByDay || Object.keys(contributionsByDay).length === 0) return;

    // Get the last 30 days
    const today = new Date();
    const days = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      days.push({
        date: dateKey,
        count: contributionsByDay[dateKey] || 0,
        dayOfWeek: date.getDay(),
        day: date.getDate()
      });
    }

    // Find max contributions for scaling
    const maxContributions = Math.max(...days.map(d => d.count));

    // Animate cells
    cellsRef.current.forEach((cell, index) => {
      if (cell && index < days.length) {
        const intensity = maxContributions > 0 ? days[index].count / maxContributions : 0;
        
        gsap.fromTo(cell,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 0.2 + (intensity * 0.8),
            duration: 0.5,
            delay: index * 0.02,
            ease: "back.out(1.7)"
          }
        );
      }
    });

  }, [contributionsByDay]);

  if (!contributionsByDay || Object.keys(contributionsByDay).length === 0) {
    return null;
  }

  // Generate last 30 days
  const today = new Date();
  const days = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    days.push({
      date: dateKey,
      count: contributionsByDay[dateKey] || 0,
      dayOfWeek: date.getDay(),
      day: date.getDate()
    });
  }

  const maxContributions = Math.max(...days.map(d => d.count));
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getColor = (count) => {
    if (count === 0) return '#e0e0e0';
    const intensity = maxContributions > 0 ? count / maxContributions : 0;
    if (intensity > 0.75) return '#216e39';
    if (intensity > 0.5) return '#30a14e';
    if (intensity > 0.25) return '#40c463';
    return '#9be9a8';
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '20px',
      borderRadius: '10px',
      marginTop: '20px'
    }}>
      <h4 style={{ marginBottom: '20px', color: '#333' }}>Recent Activity Heatmap</h4>
      
      <div ref={heatmapRef} style={{ overflowX: 'auto' }}>
        {/* Week days labels */}
        <div style={{ display: 'flex', marginBottom: '5px', paddingLeft: '20px' }}>
          {weekDays.map((day, index) => (
            <div key={index} style={{
              width: '13px',
              height: '13px',
              margin: '1px',
              fontSize: '10px',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '217px' }}>
          {days.map((day, index) => (
            <div
              key={index}
              ref={el => cellsRef.current[index] = el}
              style={{
                width: '13px',
                height: '13px',
                margin: '1px',
                backgroundColor: getColor(day.count),
                borderRadius: '2px',
                cursor: 'pointer',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, { scale: 1.2, duration: 0.2 });
                
                // Show tooltip
                const tooltip = e.currentTarget.querySelector('.tooltip');
                if (tooltip) {
                  gsap.to(tooltip, { opacity: 1, y: -5, duration: 0.2 });
                }
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
                
                // Hide tooltip
                const tooltip = e.currentTarget.querySelector('.tooltip');
                if (tooltip) {
                  gsap.to(tooltip, { opacity: 0, y: 0, duration: 0.2 });
                }
              }}
            >
              <div className="tooltip" style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                whiteSpace: 'nowrap',
                opacity: 0,
                pointerEvents: 'none',
                zIndex: 10
              }}>
                {day.count} contributions on {day.date}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginTop: '15px',
          fontSize: '12px',
          color: '#666'
        }}>
          <span style={{ marginRight: '10px' }}>Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((intensity, index) => (
            <div
              key={index}
              style={{
                width: '13px',
                height: '13px',
                margin: '0 2px',
                backgroundColor: intensity === 0 ? '#e0e0e0' : getColor(intensity * maxContributions),
                borderRadius: '2px'
              }}
            />
          ))}
          <span style={{ marginLeft: '10px' }}>More</span>
        </div>
      </div>
    </div>
  );
}

export default ContributionHeatmap;