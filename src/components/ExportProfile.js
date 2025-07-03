import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { gsap } from 'gsap';

function ExportProfile({ profileData }) {
  const buttonRef = useRef(null);

  const exportAsPNG = async () => {
    animateButton();
    
    // Find the results container
    const element = document.querySelector('.results-container');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      // Convert to PNG and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `profile-analysis-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const exportAsPDF = async () => {
    animateButton();
    
    const element = document.querySelector('.results-container');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`profile-analysis-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const exportAsJSON = () => {
    animateButton();
    
    const dataStr = JSON.stringify(profileData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `profile-data-${Date.now()}.json`);
    link.click();
  };

  const shareProfile = () => {
    animateButton();
    
    // Create shareable link (in real app, this would create a unique URL)
    const shareUrl = `${window.location.origin}/share/${Date.now()}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      // Show success message
      const message = document.createElement('div');
      message.textContent = 'Share link copied to clipboard!';
      message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 255, 136, 0.9);
        color: white;
        padding: 20px 40px;
        border-radius: 10px;
        font-size: 18px;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      `;
      document.body.appendChild(message);
      
      gsap.fromTo(message,
        { scale: 0, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.3,
          ease: "back.out(1.7)",
          onComplete: () => {
            setTimeout(() => {
              gsap.to(message, {
                scale: 0,
                opacity: 0,
                duration: 0.3,
                onComplete: () => message.remove()
              });
            }, 2000);
          }
        }
      );
    });
  };

  const animateButton = () => {
    if (!buttonRef.current) return;
    
    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });
  };

  return (
    <div 
      ref={buttonRef}
      style={{
        position: 'fixed',
        bottom: '30px',
        left: '30px',
        zIndex: 1000
      }}
    >
      <div 
        className="glass-dark"
        style={{
          padding: '15px',
          borderRadius: '20px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}
      >
        <button
          onClick={exportAsPNG}
          className="export-btn"
          style={{
            background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
            border: 'none',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          onMouseEnter={(e) => {
            gsap.to(e.target, { scale: 1.05, boxShadow: '0 5px 15px rgba(0, 212, 255, 0.5)' });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.target, { scale: 1, boxShadow: 'none' });
          }}
        >
          📸 PNG
        </button>

        <button
          onClick={exportAsPDF}
          className="export-btn"
          style={{
            background: 'linear-gradient(135deg, #ff006e, #cc0055)',
            border: 'none',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          onMouseEnter={(e) => {
            gsap.to(e.target, { scale: 1.05, boxShadow: '0 5px 15px rgba(255, 0, 110, 0.5)' });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.target, { scale: 1, boxShadow: 'none' });
          }}
        >
          📄 PDF
        </button>

        <button
          onClick={exportAsJSON}
          className="export-btn"
          style={{
            background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
            border: 'none',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          onMouseEnter={(e) => {
            gsap.to(e.target, { scale: 1.05, boxShadow: '0 5px 15px rgba(0, 255, 136, 0.5)' });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.target, { scale: 1, boxShadow: 'none' });
          }}
        >
          💾 JSON
        </button>

        <button
          onClick={shareProfile}
          className="export-btn"
          style={{
            background: 'linear-gradient(135deg, #ffd700, #ffaa00)',
            border: 'none',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          onMouseEnter={(e) => {
            gsap.to(e.target, { scale: 1.05, boxShadow: '0 5px 15px rgba(255, 215, 0, 0.5)' });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.target, { scale: 1, boxShadow: 'none' });
          }}
        >
          🔗 Share
        </button>
      </div>
    </div>
  );
}

export default ExportProfile;