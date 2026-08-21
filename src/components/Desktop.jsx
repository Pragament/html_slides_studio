import React, { useState } from 'react';

function Desktop({ presentations, createPres, openPres, duplicatePres, deletePres, showToast }) {
  const [contextMenu, setContextMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [renameVal, setRenameVal] = useState('');

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: 'View', submenu: [
            { label: 'Large Icons', onClick: () => showToast('View changed to Large Icons') },
            { label: 'Medium Icons', onClick: () => showToast('View changed to Medium Icons') }
          ]
        },
        { label: 'Sort by', submenu: [
            { label: 'Name', onClick: () => showToast('Sorted by Name') },
            { label: 'Date', onClick: () => showToast('Sorted by Date') }
          ]
        },
        { label: 'Refresh', onClick: () => { showToast('Desktop Refreshed') } },
        { separator: true },
        { label: 'New', submenu: [
            { label: 'Microsoft PowerPoint Presentation', onClick: () => {
                createPres('New PowerPoint Presentation');
              }
            }
          ]
        }
      ]
    });
  };

  const handleIconContextMenu = (e, p) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: 'Open', onClick: () => openPres(p.id) },
        { label: 'Rename', onClick: () => {
            setEditingId(p.id);
            setRenameVal(p.title);
          }
        },
        { label: 'Duplicate', onClick: () => duplicatePres(p.id) },
        { label: 'Delete', onClick: () => deletePres(p.id) }
      ]
    });
  };

  const handleRenameBlur = (p) => {
    setEditingId(null);
    if(renameVal.trim() && renameVal.trim() !== p.title) {
      p.title = renameVal.trim();
      createPres(null); // trigger state update / save
    }
  };

  const handleRenameKeyDown = (e, p) => {
    if(e.key === 'Enter') {
      e.preventDefault();
      handleRenameBlur(p);
    }
  };

  return (
    <div 
      className="desktop-container" 
      onContextMenu={handleContextMenu}
      onClick={() => setContextMenu(null)}
    >
      <div className="desktop-header">
        <h1>🖥️ Windows Desktop Studio</h1>
        <button className="new-btn" onClick={() => createPres('My Role Model')}>+ New Presentation</button>
      </div>

      <div className="desktop-grid">
        {presentations.map(p => (
          <div 
            key={p.id} 
            className="desktop-icon"
            onDoubleClick={() => openPres(p.id)}
            onContextMenu={(e) => handleIconContextMenu(e, p)}
          >
            <div className="icon-img">📽️</div>
            {editingId === p.id ? (
              <input 
                type="text"
                className="icon-label editing"
                value={renameVal}
                onChange={(e) => setRenameVal(e.target.value)}
                onBlur={() => handleRenameBlur(p)}
                onKeyDown={(e) => handleRenameKeyDown(e, p)}
                autoFocus
              />
            ) : (
              <div className="icon-label">{p.title}</div>
            )}
          </div>
        ))}
      </div>

      {contextMenu && (
        <div 
          className="context-menu" 
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.items.map((item, idx) => {
            if (item.separator) {
              return <div key={idx} style={{ height: '1px', background: 'var(--border)', margin: '6px 0' }} />;
            }
            return (
              <div 
                key={idx} 
                className="context-menu-item"
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setContextMenu(null);
                }}
              >
                <span>{item.label}</span>
                {item.submenu && <span>▶</span>}
                {item.submenu && (
                  <div className="context-submenu">
                    {item.submenu.map((sub, sIdx) => (
                      <div 
                        key={sIdx} 
                        className="context-menu-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          sub.onClick();
                          setContextMenu(null);
                        }}
                      >
                        {sub.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Desktop;
