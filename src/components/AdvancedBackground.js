function AdvancedBackground() {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#0a0a0a',
          zIndex: -2,
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: '600px',
          height: '600px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
          filter: 'blur(100px)',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '20%',
          right: '20%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255, 0, 110, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '10%',
          left: '10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(0, 255, 136, 0.06) 0%, transparent 70%)',
          filter: 'blur(90px)',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
    </>
  );
}

export default AdvancedBackground;