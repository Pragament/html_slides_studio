import React, { useState } from 'react';
import Canvas from './Canvas';
import { blankSlide } from '../App';

function SlidePanel({ currentPres, currentSlideIndex, setCurrentSlideIndex, updateCurrentPres, setSelectedElementId, view }) {
  const [contextMenu, setContextMenu] = useState(null);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const fromIndex = +e.dataTransfer.getData('text/plain');
    const slides = [...currentPres.slides];
    const [moved] = slides.splice(fromIndex, 1);
    slides.splice(index, 0, moved);
    updateCurrentPres({ slides });
    if(currentSlideIndex === fromIndex) {
      setCurrentSlideIndex(index);
    }
  };

  const handleContextMenu = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: 'New Slide', onClick: () => {
            const s = blankSlide('title-text');
            const slides = [...currentPres.slides];
            slides.splice(index + 1, 0, s);
            updateCurrentPres({ slides });
            setCurrentSlideIndex(index + 1);
          }
        },
        { label: 'Duplicate Slide', onClick: () => {
            const copy = JSON.parse(JSON.stringify(currentPres.slides[index]));
            copy.id = Math.random().toString(36).slice(2);
            copy.elements.forEach(el => el.id = Math.random().toString(36).slice(2));
            const slides = [...currentPres.slides];
            slides.splice(index + 1, 0, copy);
            updateCurrentPres({ slides });
            setCurrentSlideIndex(index + 1);
          }
        },
        { label: 'Delete Slide', onClick: () => {
            if(currentPres.slides.length <= 1) return;
            const slides = currentPres.slides.filter((_, idx) => idx !== index);
            updateCurrentPres({ slides });
            setCurrentSlideIndex(Math.max(0, index - 1));
          }
        }
      ]
    });
  };

  return (
    <div 
      className="slide-panel"
      onClick={() => setContextMenu(null)}
    >
      {currentPres.slides.map((slide, idx) => (
        <div 
          key={slide.id}
          className="slide-thumb-wrap"
          draggable
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, idx)}
          onContextMenu={(e) => handleContextMenu(e, idx)}
        >
          <div 
            className={`slide-thumb ${idx === currentSlideIndex ? 'selected' : ''}`}
            onClick={() => {
              setCurrentSlideIndex(idx);
              setSelectedElementId(null);
            }}
          >
            <span className="num">{idx + 1}</span>
            <div className="slide-thumb-inner">
              <Canvas slide={slide} interactive={false} />
            </div>
          </div>
        </div>
      ))}
      <button 
        id="add-slide-btn"
        onClick={() => {
          const s = blankSlide('title-text');
          updateCurrentPres({ slides: [...currentPres.slides, s] });
          setCurrentSlideIndex(currentPres.slides.length);
        }}
      >
        + New Slide
      </button>

      {contextMenu && (
        <div 
          className="context-menu" 
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.items.map((item, idx) => (
            <div 
              key={idx} 
              className="context-menu-item"
              onClick={() => {
                item.onClick();
                setContextMenu(null);
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SlidePanel;
