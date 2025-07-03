import { useEffect } from 'react';

function SmoothScroll() {
  useEffect(() => {
    // Option to disable smooth scrolling - just return early
    const ENABLE_SMOOTH_SCROLL = false; // Set to true to enable smooth scrolling
    
    if (!ENABLE_SMOOTH_SCROLL) {
      // Just add smooth anchor scrolling
      const handleAnchorClick = (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        // Only handle anchor links that are not router paths
        if (href && href.startsWith('#') && !href.includes('/')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      };
      
      document.addEventListener('click', handleAnchorClick);
      
      // Add CSS for native smooth scrolling
      const style = document.createElement('style');
      style.textContent = `
        html {
          scroll-behavior: smooth;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.removeEventListener('click', handleAnchorClick);
        document.head.removeChild(style);
      };
    }
    
    // Original smooth scrolling code (now disabled by default)
    let currentScrollY = window.scrollY;
    let targetScrollY = window.scrollY;
    let scrollSpeed = 0.25; // Much faster
    let isScrolling = false;

    // Smooth scroll animation
    const smoothScroll = () => {
      currentScrollY += (targetScrollY - currentScrollY) * scrollSpeed;
      
      if (Math.abs(targetScrollY - currentScrollY) > 0.5) {
        window.scrollTo(0, currentScrollY);
        requestAnimationFrame(smoothScroll);
      } else {
        window.scrollTo(0, targetScrollY);
        isScrolling = false;
      }
    };

    // Handle wheel events
    const handleWheel = (e) => {
      e.preventDefault();
      
      // Calculate scroll amount
      const scrollAmount = e.deltaY * 3; // Much faster scrolling
      targetScrollY = Math.max(
        0,
        Math.min(
          targetScrollY + scrollAmount,
          document.documentElement.scrollHeight - window.innerHeight
        )
      );
      
      if (!isScrolling) {
        isScrolling = true;
        requestAnimationFrame(smoothScroll);
      }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
      const scrollAmount = window.innerHeight * 0.8;
      
      switch (e.key) {
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          targetScrollY = Math.min(
            targetScrollY + scrollAmount,
            document.documentElement.scrollHeight - window.innerHeight
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          targetScrollY = Math.max(targetScrollY - scrollAmount, 0);
          break;
        case 'Home':
          e.preventDefault();
          targetScrollY = 0;
          break;
        case 'End':
          e.preventDefault();
          targetScrollY = document.documentElement.scrollHeight - window.innerHeight;
          break;
        default:
          return;
      }
      
      if (!isScrolling) {
        isScrolling = true;
        requestAnimationFrame(smoothScroll);
      }
    };

    // Handle touch events for mobile
    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      touchEndY = e.touches[0].clientY;
      const touchDelta = touchStartY - touchEndY;
      targetScrollY = Math.max(
        0,
        Math.min(
          targetScrollY + touchDelta * 1.5,
          document.documentElement.scrollHeight - window.innerHeight
        )
      );
      touchStartY = touchEndY;
      
      if (!isScrolling) {
        isScrolling = true;
        requestAnimationFrame(smoothScroll);
      }
    };

    // Smooth scroll to anchor links
    const handleAnchorClick = (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      
      const href = link.getAttribute('href');
      // Only handle anchor links that are not router paths
      if (href && href.startsWith('#') && !href.includes('/')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          targetScrollY = target.offsetTop - 80; // 80px offset for fixed header
          if (!isScrolling) {
            isScrolling = true;
            requestAnimationFrame(smoothScroll);
          }
        }
      }
    };

    // Add CSS for smooth scroll behavior
    const style = document.createElement('style');
    style.textContent = `
      html {
        scroll-behavior: auto !important;
      }
      body {
        overscroll-behavior: none;
      }
    `;
    document.head.appendChild(style);

    // Add event listeners
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('click', handleAnchorClick);

    // Handle browser native scroll (scrollbar dragging)
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          targetScrollY = window.scrollY;
          currentScrollY = window.scrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleAnchorClick);
      document.head.removeChild(style);
    };
  }, []);

  return null;
}

export default SmoothScroll;