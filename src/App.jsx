import React, { useState, useEffect } from 'react';
import Desktop from './components/Desktop';
import Ribbon from './components/Ribbon';
import SlidePanel from './components/SlidePanel';
import Canvas from './components/Canvas';
import OutlineView from './components/OutlineView';
import ReadingViewControls from './components/ReadingViewControls';
import PresentOverlay from './components/PresentOverlay';

const STORAGE_KEY = 'kiddieSlides_presentations_v1';
const uid = () => Math.random().toString(36).slice(2, 10);

export const THEMES = {
  waveforms:    { label: 'Waveforms',     cls: 'theme-waveforms',    accent: '#1e7ba0' },
  facet:        { label: 'Facet',         cls: 'theme-facet',        accent: '#4b6178' },
  ionboardroom: { label: 'Ion Boardroom', cls: 'theme-ionboardroom', accent: '#1e4d7b' },
  atlas:        { label: 'Atlas',         cls: 'theme-atlas',        accent: '#8b3a62' },
  circuit:      { label: 'Circuit',       cls: 'theme-circuit',      accent: '#2e7d5e' },
  integral:     { label: 'Integral',      cls: 'theme-integral',     accent: '#1a4b8c' },
  organic:      { label: 'Organic',       cls: 'theme-organic',      accent: '#5e7a28' },
  parallax:     { label: 'Parallax',      cls: 'theme-parallax',     accent: '#c23b22' },
  retrospect:   { label: 'Retrospect',    cls: 'theme-retrospect',   accent: '#b07334' },
  slate:        { label: 'Slate',         cls: 'theme-slate',        accent: '#395c7a' },
  celestial:    { label: 'Celestial',     cls: 'theme-celestial',    accent: '#6a3d8f' },
  minimal:      { label: 'Minimal',       cls: 'theme-minimal',      accent: '#333333' },
};

export const ANIMATIONS = { none:'None', fade:'Fade', appear:'Appear', flyin:'Fly In', floatin:'Float In', split:'Split', wipe:'Wipe', zoom:'Zoom' };
export const TRANSITIONS = { none:'None', cut:'Cut', fade:'Fade', push:'Push', wipe:'Wipe', reveal:'Reveal', randombars:'Random Bars', shape:'Shape', clock:'Clock' };

export function blankSlide(layout) {
  const s = { id: uid(), theme: 'waveforms', transition: 'none', notes: '', elements: [] };
  if(layout === 'title'){
    s.elements.push({ id: uid(), type:'text', role:'title', x:80, y:210, w:800, h:80, content:'', fontFamily:'Calibri', fontSize:44, color:'#222222', bold:true, italic:false, underline:false, align:'center', placeholder:'Click to add title', animation:'none' });
    s.elements.push({ id: uid(), type:'text', role:'subtitle', x:80, y:300, w:800, h:50, content:'', fontFamily:'Calibri', fontSize:22, color:'#222222', bold:false, italic:false, underline:false, align:'center', placeholder:'Click to add subtitle', animation:'none' });
  } else if(layout === 'title-picture'){
    s.elements.push({ id: uid(), type:'text', role:'title', x:60, y:30, w:840, h:60, fontSize:32, bold:true, align:'left', placeholder:'Click to add title', animation:'none' });
    s.elements.push({ id: uid(), type:'image', x:230, y:120, w:500, h:340, src:null, animation:'none' });
  } else if(layout === 'title-text'){
    s.elements.push({ id: uid(), type:'text', role:'title', x:60, y:30, w:840, h:60, fontSize:32, bold:true, align:'left', placeholder:'Click to add title', animation:'none' });
    s.elements.push({ id: uid(), type:'text', role:'body', x:80, y:120, w:800, h:360, fontSize:22, align:'left', placeholder:'Click to add text', animation:'none' });
  } else if(layout === 'picture-only'){
    s.elements.push({ id: uid(), type:'image', x:180, y:60, w:600, h:420, src:null, animation:'none' });
  }
  return s;
}

function App() {
  const [presentations, setPresentations] = useState([]);
  const [currentPresId, setCurrentPresId] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [view, setView] = useState('normal'); // normal, sorter, notes, outline, reading
  const [clipboard, setClipboard] = useState(null);
  const [showPresenter, setShowPresenter] = useState(false);
  const [presentFromIndex, setPresentFromIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('home');

  // Load presentations on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPresentations(JSON.parse(raw));
    } catch(e) { console.error(e); }
  }, []);

  // Save presentations to storage
  const save = (updated) => {
    setPresentations(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      const el = document.getElementById('save-indicator');
      if (el) {
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 1400);
      }
    } catch(e) {
      showToast("Error saving: quota exceeded");
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    const t = document.getElementById('toast');
    if (t) {
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 1800);
    }
  };

  const currentPres = presentations.find(p => p.id === currentPresId);
  const currentSlide = currentPres ? currentPres.slides[currentSlideIndex] : null;

  const createPres = (title) => {
    const p = { id: uid(), title: title || 'Untitled Presentation', updatedAt: Date.now(), slides: [blankSlide('title')] };
    const updated = [p, ...presentations];
    save(updated);
    openPres(p.id);
  };

  const openPres = (id) => {
    setCurrentPresId(id);
    setCurrentSlideIndex(0);
    setSelectedElementId(null);
    setView('normal');
    setActiveTab('home');
  };

  const duplicatePres = (id) => {
    const p = presentations.find(x => x.id === id);
    if (!p) return;
    const copy = JSON.parse(JSON.stringify(p));
    copy.id = uid();
    copy.title = p.title + ' (Copy)';
    copy.updatedAt = Date.now();
    save([copy, ...presentations]);
  };

  const deletePres = (id) => {
    if (!confirm('Delete this presentation?')) return;
    save(presentations.filter(x => x.id !== id));
  };

  const updateCurrentPres = (patch) => {
    if (!currentPres) return;
    const updated = presentations.map(p => {
      if (p.id === currentPresId) {
        return { ...p, ...patch, updatedAt: Date.now() };
      }
      return p;
    });
    save(updated);
  };

  const updateCurrentSlide = (patch) => {
    if (!currentPres || !currentSlide) return;
    const updatedSlides = [...currentPres.slides];
    updatedSlides[currentSlideIndex] = { ...currentSlide, ...patch };
    updateCurrentPres({ slides: updatedSlides });
  };

  const addElement = (el) => {
    if (!currentSlide) return;
    const elements = [...currentSlide.elements, el];
    updateCurrentSlide({ elements });
    setSelectedElementId(el.id);
  };

  const deleteSelectedElement = () => {
    if (!currentSlide || !selectedElementId) return;
    const elements = currentSlide.elements.filter(e => e.id !== selectedElementId);
    updateCurrentSlide({ elements });
    setSelectedElementId(null);
  };

  const duplicateSelectedElement = () => {
    if (!currentSlide || !selectedElementId) return;
    const el = currentSlide.elements.find(e => e.id === selectedElementId);
    if (!el) return;
    const copy = { ...JSON.parse(JSON.stringify(el)), id: uid(), x: el.x + 20, y: el.y + 20 };
    updateCurrentSlide({ elements: [...currentSlide.elements, copy] });
    setSelectedElementId(copy.id);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showPresenter) return;
      if (!currentPresId) return;

      const typing = document.activeElement && (
        document.activeElement.isContentEditable || 
        ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)
      );

      if (e.key === 'F5') {
        e.preventDefault();
        setPresentFromIndex(e.shiftKey ? currentSlideIndex : 0);
        setShowPresenter(true);
        return;
      }

      if (typing) return;

      if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        // Trigger layout modal or just blank slide
        const s = blankSlide('title-text');
        const slides = [...currentPres.slides];
        slides.splice(currentSlideIndex + 1, 0, s);
        updateCurrentPres({ slides });
        setCurrentSlideIndex(currentSlideIndex + 1);
        setSelectedElementId(null);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedElementId) {
          duplicateSelectedElement();
        } else {
          // duplicate slide
          const copy = JSON.parse(JSON.stringify(currentSlide));
          copy.id = uid();
          copy.elements.forEach(el => el.id = uid());
          const slides = [...currentPres.slides];
          slides.splice(currentSlideIndex + 1, 0, copy);
          updateCurrentPres({ slides });
          setCurrentSlideIndex(currentSlideIndex + 1);
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        if (selectedElementId) {
          const el = currentSlide.elements.find(x => x.id === selectedElementId);
          if (el) setClipboard(JSON.parse(JSON.stringify(el)));
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === 'v') {
        if (clipboard) {
          const copy = { ...JSON.parse(JSON.stringify(clipboard)), id: uid(), x: clipboard.x + 20, y: clipboard.y + 20 };
          addElement(copy);
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save(presentations);
        showToast('Saved ✓');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          deleteSelectedElement();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPresId, currentSlideIndex, selectedElementId, clipboard, presentations, showPresenter]);

  return (
    <div>
      {!currentPresId ? (
        <Desktop 
          presentations={presentations}
          createPres={createPres}
          openPres={openPres}
          duplicatePres={duplicatePres}
          deletePres={deletePres}
          showToast={showToast}
        />
      ) : (
        <div className={`editor-container ${view === 'reading' ? 'reading-view-active' : ''}`}>
          <div className="topbar">
            <button className="home-link" onClick={() => setCurrentPresId(null)}>🏠 Home</button>
            <input 
              id="pres-title" 
              type="text" 
              value={currentPres.title} 
              onChange={(e) => updateCurrentPres({ title: e.target.value })}
            />
            <span id="save-indicator" className="save-indicator">Saved ✓</span>
            <div className="spacer"></div>
            <button className="present-btn" onClick={() => { setPresentFromIndex(0); setShowPresenter(true); }}>▶ Present (F5)</button>
          </div>

          <Ribbon 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentPres={currentPres}
            currentSlide={currentSlide}
            selectedElementId={selectedElementId}
            updateCurrentSlide={updateCurrentSlide}
            updateCurrentPres={updateCurrentPres}
            setCurrentSlideIndex={setCurrentSlideIndex}
            currentSlideIndex={currentSlideIndex}
            addElement={addElement}
            setSelectedElementId={setSelectedElementId}
            view={view}
            setView={setView}
            setShowPresenter={setShowPresenter}
            setPresentFromIndex={setPresentFromIndex}
            save={save}
            presentations={presentations}
            setCurrentPresId={setCurrentPresId}
            showToast={showToast}
          />

          <div className="editor-body-main">
            {view !== 'reading' && view !== 'sorter' && (
              <SlidePanel 
                currentPres={currentPres}
                currentSlideIndex={currentSlideIndex}
                setCurrentSlideIndex={setCurrentSlideIndex}
                updateCurrentPres={updateCurrentPres}
                setSelectedElementId={setSelectedElementId}
                view={view}
              />
            )}

            <div className="canvas-area">
              {view === 'normal' && (
                <div className="canvas-normal">
                  <div className="canvas-wrap">
                    <Canvas 
                      slide={currentSlide}
                      interactive={true}
                      selectedElementId={selectedElementId}
                      setSelectedElementId={setSelectedElementId}
                      updateCurrentSlide={updateCurrentSlide}
                      showToast={showToast}
                    />
                  </div>
                  <div className="notes-strip">
                    <div className="lbl">Speaker Note</div>
                    <textarea 
                      value={currentSlide ? currentSlide.notes : ''} 
                      onChange={(e) => updateCurrentSlide({ notes: e.target.value })}
                      placeholder="Click to add notes"
                    />
                  </div>
                </div>
              )}

              {view === 'sorter' && (
                <div className="sorter-view">
                  <div className="sorter-grid">
                    {currentPres.slides.map((slide, idx) => (
                      <div 
                        key={slide.id} 
                        className={`sorter-card ${idx === currentSlideIndex ? 'selected' : ''}`}
                        onClick={() => { setCurrentSlideIndex(idx); setView('normal'); }}
                      >
                        <div className="sc-num">Slide {idx + 1}</div>
                        <div className="sorter-thumb">
                          <div className="sorter-inner">
                            <Canvas slide={slide} interactive={false} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {view === 'notes' && (
                <div className="notespage-view">
                  <div className="np-slide-wrap">
                    <div className="np-inner">
                      <Canvas slide={currentSlide} interactive={false} />
                    </div>
                  </div>
                  <textarea 
                    value={currentSlide ? currentSlide.notes : ''} 
                    onChange={(e) => updateCurrentSlide({ notes: e.target.value })}
                    placeholder="Click to add notes"
                  />
                </div>
              )}

              {view === 'outline' && (
                <div className="outline-view">
                  <OutlineView 
                    currentPres={currentPres} 
                    updateCurrentPres={updateCurrentPres} 
                    currentSlide={currentSlide}
                    updateCurrentSlide={updateCurrentSlide}
                  />
                </div>
              )}

              {view === 'reading' && (
                <div className="canvas-wrap">
                  <Canvas slide={currentSlide} interactive={false} />
                </div>
              )}

              {view !== 'reading' && (
                <div id="status-bar" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '4px 16px', background: '#fff', borderTop: '1px solid var(--border)', fontSize: '12px', color: '#5a5a5a' }}>
                  <span>Slide {currentSlideIndex + 1} of {currentPres.slides.length}</span>
                  <span>Tip: PowerPoint's own rule of thumb — 10 slides, 20 minutes, 30pt+ font, 40 words per slide.</span>
                </div>
              )}
            </div>
          </div>

          {view === 'reading' && (
            <ReadingViewControls 
              currentSlideIndex={currentSlideIndex}
              setCurrentSlideIndex={setCurrentSlideIndex}
              totalSlides={currentPres.slides.length}
              setView={setView}
            />
          )}
        </div>
      )}

      {showPresenter && (
        <PresentOverlay 
          currentPres={currentPres}
          startIndex={presentFromIndex}
          onClose={() => setShowPresenter(false)}
        />
      )}

      <div id="toast" className="toast">{toastMessage}</div>
    </div>
  );
}

export default App;
