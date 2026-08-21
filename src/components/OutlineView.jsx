import React from 'react';

function OutlineView({ currentPres, updateCurrentPres, currentSlide, updateCurrentSlide }) {
  const handleTitleBlur = (e, slide) => {
    const textVal = e.target.textContent.trim();
    const titleEl = slide.elements.find(el => el.role === 'title') || slide.elements.find(el => el.type === 'text');

    const updatedSlides = currentPres.slides.map(s => {
      if(s.id === slide.id) {
        if(titleEl) {
          return {
            ...s,
            elements: s.elements.map(el => el.id === titleEl.id ? { ...el, content: textVal } : el)
          };
        } else {
          // add title element if missing
          const newTitle = {
            id: Math.random().toString(36).slice(2),
            type: 'text',
            role: 'title',
            x: 80, y: 50, w: 800, h: 60,
            content: textVal,
            fontFamily: 'Calibri', fontSize: 32, bold: true, align: 'left',
            animation: 'none'
          };
          return { ...s, elements: [...s.elements, newTitle] };
        }
      }
      return s;
    });
    updateCurrentPres({ slides: updatedSlides });
  };

  const handleBulletBlur = (e, slide, bulletId) => {
    const textVal = e.target.textContent.trim();
    const updatedSlides = currentPres.slides.map(s => {
      if(s.id === slide.id) {
        return {
          ...s,
          elements: s.elements.map(el => el.id === bulletId ? { ...el, content: textVal } : el)
        };
      }
      return s;
    });
    updateCurrentPres({ slides: updatedSlides });
  };

  return (
    <div className="outline-container">
      {currentPres.slides.map((slide, idx) => {
        const titleEl = slide.elements.find(el => el.role === 'title') || slide.elements.find(el => el.type === 'text');
        const titleText = titleEl ? titleEl.content : '';

        return (
          <div key={slide.id} className="outline-slide-node">
            <div className="outline-slide-header">
              <span className="outline-slide-num">{idx + 1}</span>
              <div 
                className="outline-slide-title" 
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleTitleBlur(e, slide)}
              >
                {titleText || 'Click to edit title'}
              </div>
            </div>
            <div className="outline-slide-bullets">
              {slide.elements.filter(el => el !== titleEl && el.type === 'text').map(el => (
                <div 
                  key={el.id}
                  className="outline-bullet-item"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleBulletBlur(e, slide, el.id)}
                >
                  {el.content || 'Bullet item'}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OutlineView;
