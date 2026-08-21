import React, { useState } from 'react';
import { THEMES, ANIMATIONS, TRANSITIONS, blankSlide } from '../App';

function Ribbon({ 
  activeTab, 
  setActiveTab, 
  currentPres, 
  currentSlide, 
  selectedElementId, 
  updateCurrentSlide, 
  updateCurrentPres,
  setCurrentSlideIndex,
  currentSlideIndex,
  addElement,
  setSelectedElementId,
  view,
  setView,
  setShowPresenter,
  setPresentFromIndex,
  save,
  presentations,
  setCurrentPresId,
  showToast
}) {
  const [layoutModal, setLayoutModal] = useState(false);
  const [smartArtModal, setSmartArtModal] = useState(false);
  const [smartArtType, setSmartArtType] = useState('process');
  const [smartArtText, setSmartArtText] = useState('');
  const [emojiPopover, setEmojiPopover] = useState(null);

  const selectedElement = currentSlide ? currentSlide.elements.find(e => e.id === selectedElementId) : null;

  const handleNewSlide = (layout) => {
    const s = blankSlide(layout);
    const slides = [...currentPres.slides];
    slides.splice(currentSlideIndex + 1, 0, s);
    updateCurrentPres({ slides });
    setCurrentSlideIndex(currentSlideIndex + 1);
    setSelectedElementId(null);
    setLayoutModal(false);
  };

  const handleMediaUpload = (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    if(type === 'image') input.accept = 'image/*';
    else if(type === 'audio') input.accept = 'audio/*';
    else if(type === 'video') input.accept = 'video/*';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if(type === 'image') {
          const img = new Image();
          img.onload = () => {
            const maxW = 900;
            const scale = Math.min(1, maxW/img.width);
            const w = Math.round(img.width*scale), h = Math.round(img.height*scale);
            const c = document.createElement('canvas'); c.width=w; c.height=h;
            c.getContext('2d').drawImage(img,0,0,w,h);
            const dataUrl = c.toDataURL('image/jpeg', 0.8);
            addElement({ id: Math.random().toString(36).slice(2), type:'image', x:230, y:120, w:500, h:340, src:dataUrl, animation:'none' });
          };
          img.src = reader.result;
        } else if(type === 'audio') {
          addElement({ id: Math.random().toString(36).slice(2), type:'audio', x:100, y:100, w:60, h:60, src: reader.result, animation:'none' });
        } else if(type === 'video') {
          addElement({ id: Math.random().toString(36).slice(2), type:'video', x:150, y:100, w:400, h:250, src: reader.result, animation:'none' });
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleInsertSmartArt = () => {
    const items = smartArtText.split('\n').map(s=>s.trim()).filter(Boolean);
    if(items.length === 0) {
      showToast('Add at least one line of text.');
      return;
    }
    addElement({
      id: Math.random().toString(36).slice(2),
      type: 'smartart',
      x: 120, y: 100, w: 720, h: 340,
      saType: smartArtType,
      items,
      animation: 'none'
    });
    setSmartArtModal(false);
    setSmartArtText('');
  };

  const EMOJIS = ['⭐','🌟','🎉','🎈','🏆','🚀','🌈','☀️','🌙','🐶','🐱','🦁','🐸','🌸','🌻','🍎','⚽','🎨','📚','✏️','💡','❤️','👍','🙌','🎵','🍀','🔥','✨','🎁','🏅'];

  const rbButton = (icon, text, onClick, active) => (
    <button className={`rb-btn ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="icon">{icon}</span>
      <span>{text}</span>
    </button>
  );

  return (
    <div className="ribbon">
      <div className="ribbon-tabs">
        {['home', 'insert', 'design', 'transitions', 'animations', 'slideshow', 'view', 'file'].map(tab => (
          <button 
            key={tab} 
            className={`ribbon-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="ribbon-body">
        {activeTab === 'home' && (
          <>
            <div className="rb-group">
              <div style={{ display: 'flex', gap: '6px' }}>
                {rbButton('➕', 'New Slide', () => setLayoutModal(true))}
                {rbButton('🗑️', 'Delete Slide', () => {
                  if(currentPres.slides.length <= 1) return showToast("Can't delete the only slide.");
                  if(!confirm('Delete slide?')) return;
                  const slides = currentPres.slides.filter((_, idx) => idx !== currentSlideIndex);
                  updateCurrentPres({ slides });
                  setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
                })}
                {selectedElement && rbButton('🗑', 'Delete Element', () => {
                  const elements = currentSlide.elements.filter(el => el.id !== selectedElementId);
                  updateCurrentSlide({ elements });
                  setSelectedElementId(null);
                })}
              </div>
              <span className="rb-label">Slides</span>
            </div>

            <div className="rb-group">
              <div style={{ display: 'flex', gap: '6px' }}>
                {rbButton('🔤', 'Text Box', () => addElement({ id: Math.random().toString(36).slice(2), type:'text', x:150, y:150, w:300, h:60, content:'', placeholder:'Type here', animation:'none' }))}
              </div>
              <span className="rb-label">Insert</span>
            </div>

            {selectedElement && selectedElement.type === 'text' && (
              <div className="rb-group">
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select 
                    className="rb-select" 
                    value={selectedElement.fontFamily || 'Calibri'}
                    onChange={(e) => updateCurrentSlide({
                      elements: currentSlide.elements.map(el => el.id === selectedElementId ? { ...el, fontFamily: e.target.value } : el)
                    })}
                  >
                    {['Calibri','Candara','Arial','Georgia','Verdana','Times New Roman','Courier New','Comic Sans MS'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>

                  <select 
                    className="rb-select" 
                    value={selectedElement.fontSize || 20}
                    onChange={(e) => updateCurrentSlide({
                      elements: currentSlide.elements.map(el => el.id === selectedElementId ? { ...el, fontSize: +e.target.value } : el)
                    })}
                    style={{ width: '64px' }}
                  >
                    {[8,10,12,14,16,18,20,24,28,32,36,40,44,48,54,60,66,72,80,96].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                  </select>

                  <input 
                    type="color" 
                    className="rb-color"
                    title="Font Color"
                    value={selectedElement.color || '#222222'}
                    onChange={(e) => updateCurrentSlide({
                      elements: currentSlide.elements.map(el => el.id === selectedElementId ? { ...el, color: e.target.value } : el)
                    })}
                  />
                </div>
                <span className="rb-label">Font</span>
              </div>
            )}

            {selectedElement && selectedElement.type === 'text' && (
              <div className="rb-group">
                <div style={{ display: 'flex', gap: '4px' }}>
                  {rbButton('𝐁', 'Bold', () => updateCurrentSlide({
                    elements: currentSlide.elements.map(el => el.id === selectedElementId ? { ...el, bold: !el.bold } : el)
                  }), selectedElement.bold)}
                  {rbButton('𝐼', 'Italic', () => updateCurrentSlide({
                    elements: currentSlide.elements.map(el => el.id === selectedElementId ? { ...el, italic: !el.italic } : el)
                  }), selectedElement.italic)}
                  {rbButton('U̲', 'Underline', () => updateCurrentSlide({
                    elements: currentSlide.elements.map(el => el.id === selectedElementId ? { ...el, underline: !el.underline } : el)
                  }), selectedElement.underline)}
                </div>
                <span className="rb-label">Style</span>
              </div>
            )}

            {selectedElement && selectedElement.type === 'text' && (
              <div className="rb-group">
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[['≡', 'left', 'Align Left'], ['≡', 'center', 'Center'], ['≡', 'right', 'Right'], ['≡', 'justify', 'Justify']].map(([icon, val, label], i) => (
                    <button
                      key={val}
                      className={`rb-btn ${(selectedElement.align || 'left') === val ? 'active' : ''}`}
                      title={label}
                      onClick={() => updateCurrentSlide({
                        elements: currentSlide.elements.map(el => el.id === selectedElementId ? { ...el, align: val } : el)
                      })}
                      style={{ fontSize: '14px', letterSpacing: i === 1 ? '1px' : i === 2 ? '2px' : '0' }}
                    >
                      <span className="icon">
                        {val === 'left' ? '⬅' : val === 'center' ? '↔' : val === 'right' ? '➡' : '⬌'}
                      </span>
                      <span>{label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
                <span className="rb-label">Paragraph</span>
              </div>
            )}

            <div className="rb-group">
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input 
                  type="color" 
                  className="rb-color" 
                  value={currentSlide ? (currentSlide.customBg || '#ffffff') : '#ffffff'}
                  onChange={(e) => updateCurrentSlide({ customBg: e.target.value })}
                />
              </div>
              <span className="rb-label">Slide Background</span>
            </div>
          </>
        )}

        {activeTab === 'insert' && (
          <>
            <div className="rb-group">
              <div style={{ display: 'flex', gap: '6px' }}>
                {rbButton('🔤', 'Text Box', () => addElement({ id: Math.random().toString(36).slice(2), type:'text', x:150, y:150, w:300, h:60, content:'', placeholder:'Type here', animation:'none' }))}
              </div>
              <span className="rb-label">Text</span>
            </div>

            <div className="rb-group">
              <div style={{ display: 'flex', gap: '6px' }}>
                {rbButton('🖼️', 'Picture', () => handleMediaUpload('image'))}
              </div>
              <span className="rb-label">Images</span>
            </div>

            <div className="rb-group">
              <div style={{ display: 'flex', gap: '6px' }}>
                {[['▭','rect'],['⬤','circle'],['▲','triangle'],['★','star']].map(([icon,type])=>(
                  <React.Fragment key={type}>
                    {rbButton(icon, type.charAt(0).toUpperCase()+type.slice(1), () => addElement({ id: Math.random().toString(36).slice(2), type:'shape', x:120, y:120, w:160, h:160, shapeType:type, fillColor:'#4fb0c6', animation:'none' }))}
                  </React.Fragment>
                ))}
              </div>
              <span className="rb-label">Shapes</span>
            </div>

            <div className="rb-group">
              <div style={{ display: 'flex', gap: '6px' }}>
                {rbButton('🧩', 'SmartArt', () => setSmartArtModal(true))}
              </div>
              <span className="rb-label">Illustrations</span>
            </div>

            <div className="rb-group">
              <div style={{ display: 'flex', gap: '6px' }}>
                {rbButton('😊', 'Stickers', (e) => setEmojiPopover(e.currentTarget.getBoundingClientRect()))}
              </div>
              <span className="rb-label">Stickers</span>
            </div>

            <div className="rb-group">
              <div style={{ display: 'flex', gap: '6px' }}>
                {rbButton('🔊', 'Audio', () => handleMediaUpload('audio'))}
                {rbButton('📹', 'Video', () => handleMediaUpload('video'))}
              </div>
              <span className="rb-label">Media</span>
            </div>
          </>
        )}

        {activeTab === 'design' && (
          <div style={{ display: 'flex', gap: '0', height: '100%', width: '100%' }}>
            {/* ── Theme thumbnails ── */}
            <div className="rb-group" style={{ flex: 1, minWidth: 0 }}>
              <div className="design-theme-row">
                {Object.entries(THEMES).map(([key, t]) => {
                  const isActive = currentSlide && currentSlide.theme === key;
                  return (
                    <div
                      key={key}
                      className={`design-theme-card ${isActive ? 'active' : ''}`}
                      title={t.label}
                      onClick={() => updateCurrentSlide({ theme: key, customBg: null })}
                    >
                      <div className={`design-thumb ${t.cls}`}>
                        <div className="design-thumb-title" style={{ background: t.accent }} />
                        <div className="design-thumb-lines">
                          <div style={{ background: t.accent + '55' }} />
                          <div style={{ background: t.accent + '33' }} />
                        </div>
                      </div>
                      <span className="design-theme-label">{t.label}</span>
                    </div>
                  );
                })}
              </div>
              <span className="rb-label">Themes</span>
            </div>

            {/* ── Variants / background ── */}
            <div className="rb-group" style={{ minWidth: '130px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '11px', color: '#666', fontWeight: 600, marginBottom: '2px' }}>Background</div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type="color"
                    className="rb-color"
                    title="Custom Background Color"
                    value={currentSlide ? (currentSlide.customBg || '#ffffff') : '#ffffff'}
                    onChange={(e) => updateCurrentSlide({ customBg: e.target.value })}
                  />
                  <span style={{ fontSize: '11px', color: '#555' }}>Custom</span>
                </div>
                <button
                  className="rb-btn"
                  style={{ fontSize: '11px', padding: '4px 8px', marginTop: '2px' }}
                  onClick={() => updateCurrentSlide({ customBg: null })}
                >
                  Reset
                </button>
              </div>
              <span className="rb-label">Background</span>
            </div>
          </div>
        )}

        {activeTab === 'transitions' && (
          <div className="rb-group">
            <div style={{ display: 'flex', gap: '6px' }}>
              {Object.entries(TRANSITIONS).map(([key, label]) => (
                <React.Fragment key={key}>
                  {rbButton('🌫️', label, () => updateCurrentSlide({ transition: key }), currentSlide && currentSlide.transition === key)}
                </React.Fragment>
              ))}
            </div>
            <span className="rb-label">Transition to This Slide</span>
          </div>
        )}

        {activeTab === 'animations' && (
          <div className="rb-group" style={{ flex: 1 }}>
            {selectedElement ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                <div className="anim-picker-row">
                  {Object.entries(ANIMATIONS).map(([key, label]) => {
                    const icons = { none:'✕', fade:'◎', appear:'●', flyin:'→', floatin:'↑', split:'↔', wipe:'▷', zoom:'⊕' };
                    const isActive = selectedElement.animation === key;
                    return (
                      <div
                        key={key}
                        className={`anim-card ${isActive ? 'active' : ''}`}
                        title={label}
                        onClick={() => updateCurrentSlide({
                          elements: currentSlide.elements.map(el => el.id === selectedElementId ? { ...el, animation: key } : el)
                        })}
                      >
                        <span className="anim-card-icon">{icons[key] || '⚡'}</span>
                        <span className="anim-card-label">{label}</span>
                      </div>
                    );
                  })}
                </div>
                {selectedElement.animation !== 'none' && (
                  <div style={{ fontSize: '11px', color: '#2B7CD3', fontWeight: 600, marginTop: '2px' }}>
                    ⚡ {ANIMATIONS[selectedElement.animation]} — plays on slide show entry
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: '#666', padding: '10px 0' }}>Select an element on the canvas first.</div>
            )}
            <span className="rb-label">Animation</span>
          </div>
        )}

        {activeTab === 'slideshow' && (
          <div className="rb-group">
            <div style={{ display: 'flex', gap: '6px' }}>
              {rbButton('▶️', 'From Beginning (F5)', () => { setPresentFromIndex(0); setShowPresenter(true); })}
              {rbButton('⏵', 'From Current (Shift+F5)', () => { setPresentFromIndex(currentSlideIndex); setShowPresenter(true); })}
            </div>
            <span className="rb-label">Start Slide Show</span>
          </div>
        )}

        {activeTab === 'view' && (
          <div className="rb-group">
            <div style={{ display: 'flex', gap: '6px' }}>
              {rbButton('🗔', 'Normal View', () => setView('normal'), view === 'normal')}
              {rbButton('📄', 'Outline View', () => setView('outline'), view === 'outline')}
              {rbButton('▦', 'Slide Sorter View', () => setView('sorter'), view === 'sorter')}
              {rbButton('📝', 'Notes Page View', () => setView('notes'), view === 'notes')}
              {rbButton('📖', 'Reading View', () => setView('reading'), view === 'reading')}
            </div>
            <span className="rb-label">Presentation Views</span>
          </div>
        )}

        {activeTab === 'file' && (
          <div className="rb-group">
            <div style={{ display: 'flex', gap: '6px' }}>
              {rbButton('💾', 'Save (.pptx)', () => {
                save(presentations);
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentPres, null, 2));
                const a = document.createElement('a');
                a.setAttribute("href", dataStr);
                a.setAttribute("download", `${currentPres.title}.pptx`);
                a.click();
              })}
              {rbButton('➕', 'New', () => {
                const name = prompt('Name:');
                if(name) createPres(name);
              })}
              {rbButton('🚪', 'Close', () => setCurrentPresId(null))}
            </div>
            <span className="rb-label">File Actions</span>
          </div>
        )}
      </div>

      {layoutModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>➕ Choose Layout</h3>
            <div className="sa-type-row" style={{ flexWrap: 'wrap' }}>
              {['title', 'title-picture', 'title-text', 'picture-only'].map(l => (
                <div key={l} className="sa-type-btn" onClick={() => handleNewSlide(l)} style={{ flex: '1 1 45%' }}>
                  {l.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setLayoutModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {smartArtModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🧩 Insert SmartArt</h3>
            <div className="sa-type-row">
              {['process', 'cycle', 'list', 'hierarchy'].map(type => (
                <div 
                  key={type} 
                  className={`sa-type-btn ${smartArtType === type ? 'active' : ''}`}
                  onClick={() => setSmartArtType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </div>
              ))}
            </div>
            <label style={{ marginTop: '14px' }}>Text Pane items (one per line):</label>
            <textarea 
              value={smartArtText}
              onChange={(e) => setSmartArtText(e.target.value)}
              placeholder="Step 1&#10;Step 2&#10;Step 3"
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setSmartArtModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleInsertSmartArt}>Insert</button>
            </div>
          </div>
        </div>
      )}

      {emojiPopover && (
        <div 
          className="popover" 
          style={{ left: emojiPopover.left, top: emojiPopover.bottom + window.scrollY }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 32px)', gap: '4px' }}>
            {EMOJIS.map(em => (
              <button 
                key={em} 
                style={{ fontSize: '20px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                onClick={() => {
                  addElement({ id: Math.random().toString(36).slice(2), type:'sticker', x:400, y:220, w:90, h:90, emoji:em, animation:'none' });
                  setEmojiPopover(null);
                }}
              >
                {em}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Ribbon;
