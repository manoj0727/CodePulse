import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function Globe3D({ location }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    // Set canvas size
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    // Globe parameters
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2.5;
    let rotation = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    // Create points for continents (simplified)
    const continents = [
      // North America
      { lat: 45, lon: -100, size: 40, name: 'North America' },
      // South America
      { lat: -15, lon: -60, size: 35, name: 'South America' },
      // Europe
      { lat: 50, lon: 10, size: 25, name: 'Europe' },
      // Africa
      { lat: 0, lon: 20, size: 45, name: 'Africa' },
      // Asia
      { lat: 35, lon: 100, size: 50, name: 'Asia' },
      // Australia
      { lat: -25, lon: 135, size: 30, name: 'Australia' }
    ];

    // Location marker
    const locationCoords = getLocationCoordinates(location);

    // Grid lines
    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
      ctx.lineWidth = 0.5;

      // Latitude lines
      for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath();
        for (let lon = -180; lon <= 180; lon += 5) {
          const pos = project3D(lat, lon, rotation + currentRotationY, currentRotationX);
          if (pos.visible) {
            if (lon === -180) {
              ctx.moveTo(pos.x, pos.y);
            } else {
              ctx.lineTo(pos.x, pos.y);
            }
          }
        }
        ctx.stroke();
      }

      // Longitude lines
      for (let lon = -180; lon <= 180; lon += 30) {
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 5) {
          const pos = project3D(lat, lon, rotation + currentRotationY, currentRotationX);
          if (pos.visible) {
            if (lat === -90) {
              ctx.moveTo(pos.x, pos.y);
            } else {
              ctx.lineTo(pos.x, pos.y);
            }
          }
        }
        ctx.stroke();
      }
    };

    // 3D projection
    const project3D = (lat, lon, rotY, rotX) => {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lon + rotY) * Math.PI / 180;
      
      let x = radius * Math.sin(phi) * Math.cos(theta);
      let y = radius * Math.cos(phi);
      let z = radius * Math.sin(phi) * Math.sin(theta);

      // Apply X rotation
      const cosRotX = Math.cos(rotX * Math.PI / 180);
      const sinRotX = Math.sin(rotX * Math.PI / 180);
      const y1 = y * cosRotX - z * sinRotX;
      const z1 = y * sinRotX + z * cosRotX;
      y = y1;
      z = z1;

      const visible = z > 0;
      const scale = 1 + z / radius * 0.3;
      
      return {
        x: centerX + x,
        y: centerY - y,
        visible,
        scale,
        z
      };
    };

    // Draw continent
    const drawContinent = (continent) => {
      const pos = project3D(continent.lat, continent.lon, rotation + currentRotationY, currentRotationX);
      if (pos.visible) {
        const size = continent.size * pos.scale * 0.5;
        
        // Glow effect
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size);
        gradient.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
        gradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.2)');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = 'rgba(0, 212, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Draw location marker
    const drawLocationMarker = () => {
      if (!locationCoords) return;
      
      const pos = project3D(locationCoords.lat, locationCoords.lon, rotation + currentRotationY, currentRotationX);
      if (pos.visible) {
        // Pulsing effect
        const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 1;
        const size = 10 * pos.scale * pulse;
        
        // Glow
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 3);
        gradient.addColorStop(0, 'rgba(255, 0, 110, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 0, 110, 0.4)');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Marker
        ctx.fillStyle = '#ff006e';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Inner dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Mouse interaction
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      targetRotationY = ((x - centerX) / radius) * 30;
      targetRotationX = ((y - centerY) / radius) * -20;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', () => {
      targetRotationY = 0;
      targetRotationX = 0;
    });

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.95)';
      ctx.fillRect(0, 0, size, size);

      // Smooth rotation
      currentRotationX += (targetRotationX - currentRotationX) * 0.1;
      currentRotationY += (targetRotationY - currentRotationY) * 0.1;

      // Draw globe outline
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw grid
      drawGrid();

      // Draw continents
      continents.forEach(drawContinent);

      // Draw location
      drawLocationMarker();

      // Auto rotation
      rotation += 0.5;

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [location]);

  // Get coordinates for location
  const getLocationCoordinates = (location) => {
    if (!location) return null;
    
    // Simple mapping of common locations
    const coords = {
      'USA': { lat: 40, lon: -100 },
      'United States': { lat: 40, lon: -100 },
      'UK': { lat: 51, lon: 0 },
      'United Kingdom': { lat: 51, lon: 0 },
      'India': { lat: 20, lon: 77 },
      'China': { lat: 35, lon: 105 },
      'Japan': { lat: 36, lon: 138 },
      'Germany': { lat: 51, lon: 9 },
      'France': { lat: 46, lon: 2 },
      'Canada': { lat: 56, lon: -106 },
      'Australia': { lat: -25, lon: 133 },
      'Brazil': { lat: -14, lon: -51 },
      'Russia': { lat: 61, lon: 105 },
      'South Korea': { lat: 36, lon: 128 }
    };
    
    // Check if location matches any known coordinates
    for (const [key, value] of Object.entries(coords)) {
      if (location.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    // Default to random location if not found
    return { lat: Math.random() * 180 - 90, lon: Math.random() * 360 - 180 };
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          borderRadius: '50%',
          boxShadow: '0 0 60px rgba(0, 212, 255, 0.5)',
          cursor: 'grab'
        }}
      />
      {location && (
        <div style={{
          textAlign: 'center',
          color: '#e0e0e0'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '5px' }}>📍 {location}</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            Drag to rotate the globe
          </div>
        </div>
      )}
    </div>
  );
}

export default Globe3D;