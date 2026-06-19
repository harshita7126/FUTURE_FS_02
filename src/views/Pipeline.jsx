import { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { DollarSign, Calendar, User } from 'lucide-react';

export const Pipeline = () => {
  const { leads, updateLead } = useCRM();
  
  // Highlight active drag column
  const [activeDragCol, setActiveDragCol] = useState(null);

  const stages = [
    { key: "New", title: "New Prospects" },
    { key: "Contacted", title: "Contacted" },
    { key: "Qualified", title: "Qualified Leads" },
    { key: "Proposal Sent", title: "Proposal Sent" },
    { key: "Won", title: "Deals Won 🎉" },
    { key: "Lost", title: "Deals Lost ❌" }
  ];

  // Drag and Drop handlers
  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e, stageKey) => {
    e.preventDefault();
    setActiveDragCol(stageKey);
  };

  const handleDragLeave = () => {
    setActiveDragCol(null);
  };

  const handleDrop = (e, stageKey) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) {
      updateLead(leadId, { status: stageKey });
    }
    setActiveDragCol(null);
  };

  // Get leads for a specific stage
  const getLeadsInStage = (stageKey) => {
    return leads.filter(l => l.status === stageKey);
  };

  // Get column subtotal
  const getStageSubtotal = (stageKey) => {
    return getLeadsInStage(stageKey).reduce((sum, l) => sum + l.value, 0);
  };

  // Expected close date helper (simulated relative to lead date)
  const getExpectedCloseDate = (leadDateStr) => {
    const d = new Date(leadDateStr);
    d.setDate(d.getDate() + 30); // Project 30 days out
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <style>{`
        .kanban-container {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          flex: 1;
          align-items: flex-start;
          padding-bottom: 16px;
        }
        .kanban-column {
          flex: 0 0 280px;
          border-radius: 12px;
          background: var(--pipeline-col-bg);
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          max-height: 100%;
          transition: border-color 0.2s, background-color 0.2s;
        }
        .kanban-column.drag-active {
          border-color: var(--primary);
          background-color: var(--primary-glow);
        }
        .kanban-header {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .kanban-cards-list {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          flex: 1;
        }
        .deal-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 14px;
          cursor: grab;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }
        .deal-card:active {
          cursor: grabbing;
        }
        .deal-card:hover {
          box-shadow: var(--card-shadow);
          transform: translateY(-1px);
          border-color: var(--border-glow);
        }
      `}</style>

      {/* Kanban Info Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '12px 18px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontSize: '13px'
        }}
      >
        <span style={{ color: 'var(--text-secondary)' }}>
          💡 **Drag and drop cards** between columns to advance sales opportunities through pipeline stages.
        </span>
        <strong style={{ color: 'var(--primary)' }}>
          Active Pipeline Total: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(leads.filter(l => l.status !== 'Won' && l.status !== 'Lost').reduce((s, l) => s + l.value, 0))}
        </strong>
      </div>

      {/* Kanban Container */}
      <div className="kanban-container">
        {stages.map(stage => {
          const stageLeads = getLeadsInStage(stage.key);
          const subtotal = getStageSubtotal(stage.key);
          const isDragActive = activeDragCol === stage.key;

          return (
            <div 
              key={stage.key}
              className={`kanban-column ${isDragActive ? 'drag-active' : ''}`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, stage.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.key)}
            >
              {/* Column Header */}
              <div className="kanban-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {stage.title}
                  </span>
                  <span 
                    style={{ 
                      fontSize: '11px', 
                      background: 'var(--border-color)', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      fontWeight: 600
                    }}
                  >
                    {stageLeads.length}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <DollarSign size={13} style={{ color: 'var(--success)' }} />
                  <strong>{new Intl.NumberFormat('en-IN').format(subtotal)}</strong>
                </div>
              </div>

              {/* Column Cards */}
              <div className="kanban-cards-list">
                {stageLeads.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '12px', border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
                    Drag leads here
                  </div>
                ) : (
                  stageLeads.map(lead => (
                    <div 
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className="deal-card"
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {lead.company}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Contact: {lead.name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(lead.value)}
                        </span>
                        <span 
                          style={{
                            fontSize: '9px',
                            padding: '1px 6px',
                            background: 'var(--bg-primary)',
                            borderRadius: '4px',
                            color: 'var(--text-muted)'
                          }}
                        >
                          {lead.source}
                        </span>
                      </div>

                      <div 
                        style={{ 
                          borderTop: '1px solid var(--border-color)', 
                          paddingTop: '8px', 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          fontSize: '11px',
                          color: 'var(--text-muted)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={11} />
                          <span>Exp: {getExpectedCloseDate(lead.date)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={11} />
                          <span>{lead.owner.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
