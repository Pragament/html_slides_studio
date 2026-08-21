import React, { useState, useRef, useEffect, useCallback } from 'react';
import { THEMES } from '../App';

/* ─────────────────────────────────────────────────────────────────────
   Resize handle descriptors
   dir: [horizontal, vertical]
     1 = right/bottom edge moves   →  grow in that direction
    -1 = left/top edge moves       →  shift origin, shrink opposite
     0 = this axis not affected
───────────────────────────────────────────────────────────────────── */
const HANDLES = [
  { id: 'nw', dx: -1, dy: -1 },
  { id: 'n',  dx:  0, dy: -1 },
  { id: 'ne', dx:  1, dy: -1 },
  { id: 'e',  dx:  1, dy:  0 },
  { id: 'se', dx:  1, dy:  1 },
  { id: 's',  dx:  0, dy:  1 },
  { id: 'sw', dx: -1, dy:  1 },
  { id: 'w',  dx: -1, dy:  0 },
];

/* ─────────────────────────────────────────────────────────────────────
   getSlideScale — reads the rendered slide dimensions once and returns
   the px-to-slide-unit scale factors.
───────────────────────────────────────────────────────────────────── */
function getSlideScale(handleEl) {
  const slide = handleEl.closest('.slide');
  if (!slide) return { sx: 1, sy: 1 };
  const r = slide.getBoundingClientRect();
  return { sx: 960 / r.width, sy: 540 / r.height };
}

/* ─────────────────────────────────────────────────────────────────────
   SelectionFrame — the 8 handles + toolbar rendered inside a selected el
───────────────────────────────────────────────────────────────────── */
function SelectionFrame({ el, onResize, onDelete, onDuplicate }) {
  // We store resize state in a plain object ref — no React state, no re-renders during drag
  const rs = useRef(null);

  const startResize = (e, dx, dy) => {
    e.stopPropagation();
    e.preventDefault();

    const { sx, sy } = getSlideScale(e.currentTarget);
    rs.current = {
      x0: e.clientX, y0: e.clientY,   // mouse start
      ex: el.x, ey: el.y,             // element start pos
      ew: el.w, eh: el.h,             // element start size
      sx, sy, dx, dy,
    };

    const onMove = (ev) => {
      const r = rs.current;
      if (!r) return;

      const rawDx = (ev.clientX - r.x0) * r.sx;
      const rawDy = (ev.clientY - r.y0) * r.sy;

      let nx = r.ex, ny = r.ey, nw = r.ew, nh = r.eh;

      /* Horizontal axis */
      if (r.dx === 1) {
        // right/bottom-right/top-right: grow right
        nw = Math.max(30, r.ew + rawDx);
      } else if (r.dx === -1) {
        // left edge: shift x, shrink width
        const clampedDx = Math.min(rawDx, r.ew - 30);
        nx = r.ex + clampedDx;
        nw = r.ew - clampedDx;
      }

      /* Vertical axis */
      if (r.dy === 1) {
        nh = Math.max(20, r.eh + rawDy);
      } else if (r.dy === -1) {
        const clampedDy = Math.min(rawDy, r.eh - 20);
        ny = r.ey + clampedDy;
        nh = r.eh - clampedDy;
      }

      onResize({
        x: Math.round(nx),
        y: Math.round(ny),
        w: Math.round(nw),
        h: Math.round(nh),
      });
    };

    const onUp = () => {
      rs.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <>
      {/* ── Toolbar above ── */}
      <div className="sel-toolbar" onMouseDown={(e) => e.stopPropagation()}>
        <button
          className="sel-toolbar-btn"
          title="Duplicate (Ctrl+D)"
          onMouseDown={(e) => { e.stopPropagation(); onDuplicate(); }}
        >
          ⎘ Copy
        </button>
        <button
          className="sel-toolbar-btn danger"
          title="Delete (Delete key)"
          onMouseDown={(e) => { e.stopPropagation(); onDelete(); }}
        >
          🗑 Delete
        </button>
      </div>

      {/* ── 8 resize handles ── */}
      {HANDLES.map(({ id, dx, dy }) => (
        <div
          key={id}
          className={`sel-handle ${id}`}
          onMouseDown={(e) => startResize(e, dx, dy)}
        />
      ))}

      {/* ── Dimension label ── */}
      <div className="sel-dimension-label" onMouseDown={(e) => e.stopPropagation()}>
        {Math.round(el.w)} × {Math.round(el.h)}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   SlideElement
───────────────────────────────────────────────────────────────────── */
function SlideElement({ el, interactive, isSelected, onSelect, onUpdateEl, onDelete, onDuplicate }) {
  const dragState = useRef(null);
  const textRef   = useRef(null);

  /* ── Select + drag ────────────────────────────────────── */
  const handleMouseDown = (e) => {
    if (!interactive) return;
    if (e.button !== 0) return;
    // If already selected and clicking inside a contentEditable div, let the browser
    // handle cursor placement — don't start a drag.
    if (isSelected && e.target.isContentEditable) {
      e.stopPropagation(); // still must stop so slide onClick doesn't deselect
      return;
    }

    e.stopPropagation();
    onSelect(el.id);

    const { sx, sy } = getSlideScale(e.currentTarget);
    dragState.current = {
      x0: e.clientX, y0: e.clientY,
      ex: el.x,      ey: el.y,
      sx, sy,
      moved: false,
    };

    const onMove = (ev) => {
      const d = dragState.current;
      if (!d) return;
      const dx = (ev.clientX - d.x0) * d.sx;
      const dy = (ev.clientY - d.y0) * d.sy;
      if (!d.moved && Math.hypot(dx, dy) < 5) return; // dead-zone
      d.moved = true;
      onUpdateEl({
        x: Math.max(0, Math.round(d.ex + dx)),
        y: Math.max(0, Math.round(d.ey + dy)),
      });
    };

    const onUp = () => {
      dragState.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  /* ── Text editing ─────────────────────────────────────── */
  const handleTextBlur = () => {
    if (!textRef.current) return;
    onUpdateEl({ content: textRef.current.innerHTML });
  };

  const handleTextFocus = () => {
    if (!textRef.current) return;
    // Clear placeholder on first focus
    if (!el.content && textRef.current.innerHTML === (el.placeholder || '')) {
      textRef.current.innerHTML = '';
    }
  };

  /* Sync DOM from state whenever the component renders,
     but leave it alone while the user is actively typing */
  useEffect(() => {
    if (!textRef.current || el.type !== 'text') return;
    if (document.activeElement === textRef.current) return;
    const want = el.content || el.placeholder || '';
    if (textRef.current.innerHTML !== want) {
      textRef.current.innerHTML = want;
    }
  });

  /* ── SmartArt helpers ─────────────────────────────────── */
  const COLORS = ['#e8734a', '#4fb0c6', '#8a5fbf', '#5fa86e', '#e0b23f'];

  const smartBox = (txt, c) => (
    <div style={{ background: c, color: '#fff', padding: '7px 10px', borderRadius: '7px', fontSize: '12px', fontWeight: '600', maxWidth: '130px', textAlign: 'center' }}>
      {txt}
    </div>
  );

  const renderSmartArt = () => {
    const items = el.items || [];
    if (el.saType === 'process') {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          {items.map((txt, i) => (
            <React.Fragment key={i}>
              {smartBox(txt, COLORS[i % COLORS.length])}
              {i < items.length - 1 && <span style={{ fontSize: '18px' }}>➜</span>}
            </React.Fragment>
          ))}
        </div>
      );
    }
    if (el.saType === 'cycle') {
      const n = items.length || 1;
      const R = Math.min(el.w, el.h) * 0.32;
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {items.map((txt, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            return (
              <div key={i} style={{ position: 'absolute', left: `calc(50% + ${R * Math.cos(angle)}px - 55px)`, top: `calc(50% + ${R * Math.sin(angle)}px - 20px)` }}>
                {smartBox(txt, COLORS[i % COLORS.length])}
              </div>
            );
          })}
        </div>
      );
    }
    if (el.saType === 'list') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '90%', justifyContent: 'center', height: '100%' }}>
          {items.map((txt, i) => (
            <div key={i} style={{ background: COLORS[i % COLORS.length], color: '#fff', padding: '8px 12px', borderRadius: '7px', fontSize: '13px', fontWeight: '600' }}>
              • {txt}
            </div>
          ))}
        </div>
      );
    }
    if (el.saType === 'hierarchy') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', height: '100%' }}>
          {smartBox(items[0] || 'Top', COLORS[0])}
          <div style={{ display: 'flex', gap: '8px' }}>
            {items.slice(1).map((txt, i) => <React.Fragment key={i}>{smartBox(txt, COLORS[(i + 1) % COLORS.length])}</React.Fragment>)}
          </div>
        </div>
      );
    }
    return null;
  };

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div
      className={`slide-el${isSelected && interactive ? ' is-selected' : ''}`}
      data-elid={el.id}
      style={{
        position: 'absolute',
        left:   el.x,
        top:    el.y,
        width:  el.w,
        height: el.h,
        cursor: interactive ? 'move' : 'default',
        overflow: 'visible', // allow handles to poke outside
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()} /* prevent click bubbling to slide deselect handler */
    >
      {/* clip inner content so it doesn't overflow visually */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit' }}>

        {/* TEXT */}
        {el.type === 'text' && (
          <div
            ref={textRef}
            contentEditable={!!interactive}
            suppressContentEditableWarning
            onFocus={handleTextFocus}
            onBlur={handleTextBlur}
            onMouseDown={(e) => {
              // Once selected, inner clicks move the cursor — don't start a drag
              if (interactive && isSelected) e.stopPropagation();
            }}
            style={{
              fontFamily:     el.fontFamily || 'Calibri, sans-serif',
              fontSize:       (el.fontSize || 20) + 'px',
              fontWeight:     el.bold      ? '700' : '400',
              fontStyle:      el.italic    ? 'italic' : 'normal',
              textDecoration: el.underline ? 'underline' : 'none',
              textAlign:      el.align     || 'left',
              color:          el.color     || 'inherit',
              width:          '100%',
              height:         '100%',
              padding:        '6px 8px',
              boxSizing:      'border-box',
              outline:        'none',
              lineHeight:     1.3,
              whiteSpace:     'pre-wrap',
              wordBreak:      'break-word',
              cursor:         interactive ? (isSelected ? 'text' : 'move') : 'default',
              userSelect:     interactive && isSelected ? 'text' : 'none',
            }}
          />
        )}

        {/* IMAGE */}
        {el.type === 'image' && (
          el.src
            ? <img src={el.src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
            : <div style={{ border: '3px dashed rgba(0,0,0,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(0,0,0,.35)', fontWeight: '600', fontSize: '14px', borderRadius: '6px' }}>
                Click to add picture
              </div>
        )}

        {/* SHAPE */}
        {el.type === 'shape' && (() => {
          if (el.shapeType === 'triangle') {
            return (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{ width: 0, height: 0, borderLeft: (el.w / 2) + 'px solid transparent', borderRight: (el.w / 2) + 'px solid transparent', borderBottom: el.h + 'px solid ' + (el.fillColor || '#e8734a') }} />
              </div>
            );
          }
          if (el.shapeType === 'star') {
            return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: el.fillColor || '#e8734a', fontSize: Math.min(el.w, el.h) * 0.85 + 'px', lineHeight: 1 }}>★</div>;
          }
          return <div style={{ width: '100%', height: '100%', background: el.fillColor || '#e8734a', borderRadius: el.shapeType === 'circle' ? '50%' : '8px' }} />;
        })()}

        {/* STICKER */}
        {el.type === 'sticker' && (
          <div style={{ width: '100%', height: '100%', fontSize: Math.min(el.w, el.h) * 0.75 + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
            {el.emoji}
          </div>
        )}

        {/* SMARTART */}
        {el.type === 'smartart' && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {renderSmartArt()}
          </div>
        )}

        {/* AUDIO */}
        {el.type === 'audio' && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '40px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); if (el.src) new Audio(el.src).play(); }}>🔊</div>
          </div>
        )}

        {/* VIDEO */}
        {el.type === 'video' && (
          <div style={{ width: '100%', height: '100%', background: '#000' }}>
            {el.src
              ? <video src={el.src} controls style={{ width: '100%', height: '100%' }} onMouseDown={(e) => e.stopPropagation()} />
              : <div style={{ color: '#fff', textAlign: 'center', paddingTop: '40%', fontSize: '14px' }}>Video Placeholder</div>
            }
          </div>
        )}

      </div>{/* /inner clip div */}

      {/* SELECTION FRAME (handles + toolbar) — rendered OUTSIDE the clip div */}
      {isSelected && interactive && (
        <SelectionFrame
          el={el}
          onResize={onUpdateEl}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   SmartArt Text Pane
───────────────────────────────────────────────────────────────────── */
function SmartArtTextPane({ el, onUpdate, onClose }) {
  const [text, setText] = useState((el.items || []).join('\n'));
  return (
    <div className="smartart-textpane" onClick={(e) => e.stopPropagation()}>
      <div className="textpane-header">
        <span>SmartArt Text Pane</span>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>×</button>
      </div>
      <div className="textpane-body">
        <textarea
          value={text}
          placeholder="Type items here, one per line."
          onChange={(e) => {
            const val = e.target.value;
            setText(val);
            onUpdate({ items: val.split('\n').map(s => s.trim()).filter(Boolean) });
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Canvas
───────────────────────────────────────────────────────────────────── */
function Canvas({ slide, interactive, selectedElementId, setSelectedElementId, updateCurrentSlide }) {
  // ── ALL hooks must be called unconditionally ──
  const [textPaneElId, setTextPaneElId] = useState(null);

  const handleUpdateEl = useCallback((id, patch) => {
    if (!updateCurrentSlide || !slide) return;
    updateCurrentSlide({ elements: slide.elements.map(el => el.id === id ? { ...el, ...patch } : el) });
  }, [slide, updateCurrentSlide]);

  const handleDeleteEl = useCallback((id) => {
    if (!updateCurrentSlide || !slide) return;
    updateCurrentSlide({ elements: slide.elements.filter(el => el.id !== id) });
    setSelectedElementId?.(null);
    setTextPaneElId(null);
  }, [slide, updateCurrentSlide, setSelectedElementId]);

  const handleDuplicateEl = useCallback((id) => {
    if (!updateCurrentSlide || !slide) return;
    const src = slide.elements.find(el => el.id === id);
    if (!src) return;
    const copy = { ...JSON.parse(JSON.stringify(src)), id: `el-${Date.now()}`, x: src.x + 20, y: src.y + 20 };
    updateCurrentSlide({ elements: [...slide.elements, copy] });
    setSelectedElementId?.(copy.id);
  }, [slide, updateCurrentSlide, setSelectedElementId]);

  const handleSelectEl = useCallback((id) => {
    setSelectedElementId?.(id);
    if (!slide) return;
    const el = slide.elements.find(e => e.id === id);
    setTextPaneElId(el?.type === 'smartart' ? id : null);
  }, [slide, setSelectedElementId]);

  const handleSlideClick = useCallback(() => {
    if (!interactive) return;
    setSelectedElementId?.(null);
    setTextPaneElId(null);
  }, [interactive, setSelectedElementId]);

  // ── Early return AFTER all hooks ──
  if (!slide) return <div className="slide theme-waveforms" />;

  const themeClass = (THEMES[slide.theme] || THEMES.waveforms).cls;
  const textPaneEl = textPaneElId ? slide.elements.find(e => e.id === textPaneElId) : null;

  return (
    <div
      className={`slide ${themeClass}`}
      style={slide.customBg ? { background: slide.customBg } : {}}
      onClick={handleSlideClick}
    >
      {slide.elements.map(el => (
        <SlideElement
          key={el.id}
          el={el}
          interactive={interactive}
          isSelected={!!(interactive && el.id === selectedElementId)}
          onSelect={handleSelectEl}
          onUpdateEl={(patch) => handleUpdateEl(el.id, patch)}
          onDelete={() => handleDeleteEl(el.id)}
          onDuplicate={() => handleDuplicateEl(el.id)}
        />
      ))}

      {textPaneEl && interactive && (
        <SmartArtTextPane
          el={textPaneEl}
          onUpdate={(patch) => handleUpdateEl(textPaneEl.id, patch)}
          onClose={() => setTextPaneElId(null)}
        />
      )}
    </div>
  );
}

export default Canvas;
