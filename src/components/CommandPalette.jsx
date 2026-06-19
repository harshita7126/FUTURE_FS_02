import { useState, useEffect, useRef } from 'react';
import { useCRM } from '../context/CRMContext';
import { Search, Compass, PlusCircle, CheckSquare, Settings as SettingsIcon, X } from 'lucide-react';

export const CommandPalette = ({ isOpen, onClose, onQuickAction }) => {
  const { setActiveView } = useCRM();
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keys inside palette
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const items = [
    { category: 'Navigation', name: 'Go to Dashboard', icon: <Compass size={16} />, action: () => { setActiveView('dashboard'); onClose(); } },
    { category: 'Navigation', name: 'Go to Leads list', icon: <Compass size={16} />, action: () => { setActiveView('leads'); onClose(); } },
    { category: 'Navigation', name: 'Go to Sales Pipeline (Kanban)', icon: <Compass size={16} />, action: () => { setActiveView('pipeline'); onClose(); } },
    { category: 'Navigation', name: 'Go to Analytics & Forecasts', icon: <Compass size={16} />, action: () => { setActiveView('analytics'); onClose(); } },
    { category: 'Navigation', name: 'Go to CRM Settings', icon: <SettingsIcon size={16} />, action: () => { setActiveView('settings'); onClose(); } },
    { category: 'Quick Actions', name: 'Add New Lead', icon: <PlusCircle size={16} />, action: () => { onQuickAction('add-lead'); onClose(); } },
    { category: 'Quick Actions', name: 'Add New Task', icon: <CheckSquare size={16} />, action: () => { onQuickAction('add-task'); onClose(); } },
  ];

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="palette-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
      <div 
        className="glass-panel animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '0',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        {/* Search header bar */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid var(--border-color)',
            gap: '12px'
          }}
        >
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Type a command or search shortcuts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              padding: '0',
              fontSize: '16px',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              boxShadow: 'none'
            }}
          />
          <button 
            onClick={onClose}
            className="btn btn-ghost" 
            style={{ padding: '4px', borderRadius: '50%', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Shortcuts list container */}
        <div style={{ padding: '8px', maxHeight: '320px', overflowY: 'auto' }}>
          {filteredItems.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '24px 0' }}>
              No matches found for "{search}"
            </p>
          ) : (
            <div>
              {/* Group items by category */}
              {['Navigation', 'Quick Actions'].map(cat => {
                const catItems = filteredItems.filter(item => item.category === cat);
                if (catItems.length === 0) return null;
                return (
                  <div key={cat} style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', padding: '6px 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {cat}
                    </div>
                    {catItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={item.action}
                        className="btn btn-ghost"
                        style={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          gap: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)' }}>{item.icon}</span>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts key description */}
        <div 
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-hover)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: 'var(--text-muted)'
          }}
        >
          <span>Use search to filter, click items to run</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};
