import React from 'react';

function ReadingViewControls({ currentSlideIndex, setCurrentSlideIndex, totalSlides, setView }) {
  return (
    <div className="reading-controls-bar">
      <button 
        disabled={currentSlideIndex <= 0} 
        onClick={() => setCurrentSlideIndex(currentSlideIndex - 1)}
      >
        ◀ Previous
      </button>
      <span>Slide {currentSlideIndex + 1} of {totalSlides}</span>
      <button 
        disabled={currentSlideIndex >= totalSlides - 1} 
        onClick={() => setCurrentSlideIndex(currentSlideIndex + 1)}
      >
        Next ▶
      </button>
      <button onClick={() => setView('normal')}>Exit Reading View</button>
    </div>
  );
}

export default ReadingViewControls;
