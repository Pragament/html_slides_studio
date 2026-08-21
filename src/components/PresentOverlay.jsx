import React, { useState, useEffect, useRef } from 'react';
import Canvas from './Canvas';

function PresentOverlay({ currentPres, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [blackout, setBlackout] = useState(false);
  const [whiteout, setWhiteout] = useState(false);
  const slideRef = useRef(null);

  const total = currentPres.slides.length;
  const slide = currentPres.slides[index];

  const handleNext = () => {
    if (index < total - 1) {
      setIndex(index + 1);
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key.toLowerCase() === 'b') {
        setBlackout(!blackout);
        setWhiteout(false);
      } else if (e.key.toLowerCase() === 'w') {
        setWhiteout(!whiteout);
        setBlackout(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, blackout, whiteout]);

  useEffect(() => {
    // Fit slide to screen scale
    const handleResize = () => {
      if (slideRef.current) {
        const scale = Math.min(window.innerWidth / 960, window.innerHeight / 540) * 0.95;
        slideRef.current.style.transform = `scale(${scale})`;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [index, blackout, whiteout]);

  const transitionClass = {
    fade: 'trans-fade',
    push: 'trans-push-enter',
    wipe: 'trans-wipe-enter',
    reveal: 'trans-reveal-enter',
    randombars: 'trans-randombars-enter',
    shape: 'trans-shape-enter',
    clock: 'trans-clock-enter',
    cut: '',
    none: ''
  }[slide.transition] || '';

  // Trigger animations on slide elements with proper reset
  useEffect(() => {
    if (!slideRef.current) return;

    // Remove all previous anim classes first (for slide re-entry)
    const animClasses = ['anim-fade','anim-appear','anim-flyin','anim-floatin','anim-split','anim-wipe','anim-zoom'];
    const nodes = slideRef.current.querySelectorAll('.slide-el[data-elid]');

    nodes.forEach(node => {
      animClasses.forEach(c => node.classList.remove(c));
      node.style.opacity = '';
      node.style.animationDelay = '';
    });

    // Use rAF to let DOM settle before adding classes
    requestAnimationFrame(() => {
      nodes.forEach((node, i) => {
        const elId = node.getAttribute('data-elid');
        const elData = slide.elements.find(e => e.id === elId);
        if (!elData || !elData.animation || elData.animation === 'none') return;

        const cls = {
          fade:    'anim-fade',
          appear:  'anim-appear',
          flyin:   'anim-flyin',
          floatin: 'anim-floatin',
          split:   'anim-split',
          wipe:    'anim-wipe',
          zoom:    'anim-zoom',
        }[elData.animation];

        if (!cls) return;
        node.style.animationDelay = (i * 0.18) + 's';
        node.classList.add(cls);
      });
    });
  }, [index]);

  return (
    <div className="present-overlay" style={{ background: blackout ? '#000' : whiteout ? '#fff' : '#000' }}>
      <button className="present-exit" onClick={onClose}>Esc to Exit</button>

      <div className="present-slide-host">
        {!blackout && !whiteout && (
          <div ref={slideRef} style={{ transition: 'transform 0.1s' }}>
            <Canvas slide={slide} interactive={false} />
          </div>
        )}
      </div>

      <div className="present-nav">
        <button disabled={index <= 0} onClick={handlePrev}>◀ Previous</button>
        <button disabled={index >= total - 1} onClick={handleNext}>Next ▶</button>
      </div>
    </div>
  );
}

export default PresentOverlay;
