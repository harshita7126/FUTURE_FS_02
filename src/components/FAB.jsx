import { useState, useEffect, useRef } from 'react';
import { Plus, Users, CheckSquare } from 'lucide-react';

export const FAB = ({ onQuickAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fabRef = useRef(null);

  // Close floating items on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fabRef.current && !fabRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      ref={fabRef}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 95,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px'
      }}
    >
      {/* Expanded Actions */}
      {isOpen && (
        <div 
          className="glass-panel animate-fade-in"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '8px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--modal-shadow)',
            minWidth: '150px'
          }}
        >
          <button 
            onClick={() => { onQuickAction('add-lead'); setIsOpen(false); }}
            className="btn btn-ghost" 
            style={{ 
              width: '100%', 
              justifyContent: 'flex-start', 
              padding: '8px 12px', 
              fontSize: '13px',
              gap: '10px'
            }}
          >
            <Users size={16} style={{ color: 'var(--primary)' }} />
            <span>Add Lead</span>
          </button>
          
          <button 
            onClick={() => { onQuickAction('add-task'); setIsOpen(false); }}
            className="btn btn-ghost" 
            style={{ 
              width: '100%', 
              justifyContent: 'flex-start', 
              padding: '8px 12px', 
              fontSize: '13px',
              gap: '10px'
            }}
          >
            <CheckSquare size={16} style={{ color: 'var(--success)' }} />
            <span>Add Task</span>
          </button>
        </div>
      )}

      {/* Primary FAB Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = isOpen ? 'rotate(45deg) scale(1.08)' : 'scale(1.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isOpen ? 'rotate(45deg)' : 'scale(1)';
        }}
      >
        <Plus size={24} />
      </button>
    </div>
  );
};
