import { useState } from 'react';
import { useCRM } from '../context/CRMContext';

export const ActivityHeatmap = () => {
  const { heatmapActivities } = useCRM();
  const [hoveredCell, setHoveredCell] = useState(null);

  // Helper to format date for tooltips
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Determine shading intensity based on activity count
  const getIntensityClass = (count) => {
    if (count === 0) return 'bg-empty';
    if (count <= 2) return 'bg-low';
    if (count <= 4) return 'bg-medium';
    if (count <= 6) return 'bg-high';
    return 'bg-expert';
  };

  // Group activities into weeks (53 columns, 7 rows)
  const columns = [];
  const chunkSize = 7;
  for (let i = 0; i < heatmapActivities.length; i += chunkSize) {
    columns.push(heatmapActivities.slice(i, i + chunkSize));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <style>{`
        .heatmap-grid {
          display: flex;
          gap: 3px;
          overflow-x: auto;
          padding-bottom: 8px;
        }
        .heatmap-col {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .heatmap-cell {
          width: 10px;
          height: 10px;
          border-radius: 2px;
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        .heatmap-cell:hover {
          transform: scale(1.3);
          outline: 1px solid var(--primary);
        }
        /* CSS Shading Overrides */
        .bg-empty { background-color: var(--border-color); }
        .bg-low { background-color: rgba(37, 99, 235, 0.2); }
        .bg-medium { background-color: rgba(37, 99, 235, 0.45); }
        .bg-high { background-color: rgba(37, 99, 235, 0.7); }
        .bg-expert { background-color: var(--primary); }
        
        .dark .bg-empty { background-color: #1e1e24; }
        .dark .bg-low { background-color: rgba(59, 130, 246, 0.2); }
        .dark .bg-medium { background-color: rgba(59, 130, 246, 0.45); }
        .dark .bg-high { background-color: rgba(59, 130, 246, 0.7); }
        .dark .bg-expert { background-color: var(--primary); }
      `}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Workspace Activities (Heatmap)</h4>
        
        {/* Color Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>Less</span>
          <div className="heatmap-cell bg-empty" style={{ cursor: 'default' }} />
          <div className="heatmap-cell bg-low" style={{ cursor: 'default' }} />
          <div className="heatmap-cell bg-medium" style={{ cursor: 'default' }} />
          <div className="heatmap-cell bg-high" style={{ cursor: 'default' }} />
          <div className="heatmap-cell bg-expert" style={{ cursor: 'default' }} />
          <span>More</span>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        {/* Heatmap Grid Wrapper */}
        <div className="heatmap-grid">
          {/* Day of Week Labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '8px', color: 'var(--text-muted)', justifyContent: 'space-around', paddingRight: '4px', height: '88px' }}>
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          {columns.map((week, wIdx) => (
            <div key={wIdx} className="heatmap-col">
              {week.map((day, dIdx) => (
                <div
                  key={dIdx}
                  className={`heatmap-cell ${getIntensityClass(day.count)}`}
                  onMouseEnter={(e) => {
                    setHoveredCell({
                      date: day.date,
                      count: day.count,
                      x: e.target.offsetLeft,
                      y: e.target.offsetTop - 36
                    });
                  }}
                  onMouseLeave={() => setHoveredCell(null)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Hover Tooltip Card */}
        {hoveredCell && (
          <div 
            className="glass-panel"
            style={{
              position: 'absolute',
              left: `${hoveredCell.x}px`,
              top: `${hoveredCell.y}px`,
              padding: '6px 10px',
              fontSize: '11px',
              whiteSpace: 'nowrap',
              zIndex: 10,
              pointerEvents: 'none',
              transform: 'translateX(-50%)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--card-shadow)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)'
            }}
          >
            <strong>{hoveredCell.count} actions</strong> on {formatDate(hoveredCell.date)}
          </div>
        )}
      </div>
    </div>
  );
};
