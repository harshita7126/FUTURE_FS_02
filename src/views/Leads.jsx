import { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { TEAM_MEMBERS } from '../utils/mockData';
import { Search, Plus, LayoutGrid, List, Eye, Trash2, X } from 'lucide-react';

export const Leads = () => {
  const { leads, addLead, updateLead, deleteLead } = useCRM();

  // Search and Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  
  // Selected Lead for details drawer
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  
  // Add Lead Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    value: '',
    status: 'New',
    source: 'Website',
    owner: TEAM_MEMBERS[0]
  });

  const selectedLead = leads.find(l => l.id === selectedLeadId);

  // Form handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewLeadForm(prev => ({
      ...prev,
      [name]: name === 'value' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addLead(newLeadForm);
    setIsAddModalOpen(false);
    // Reset Form
    setNewLeadForm({
      name: '',
      company: '',
      email: '',
      phone: '',
      value: '',
      status: 'New',
      source: 'Website',
      owner: TEAM_MEMBERS[0]
    });
  };


  const handleLeadUpdateSubmit = (e, leadId) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = {
      name: formData.get('name'),
      company: formData.get('company'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      value: parseFloat(formData.get('value')) || 0,
      status: formData.get('status'),
      source: formData.get('source'),
      owner: formData.get('owner'),
      notes: formData.get('notes')
    };
    updateLead(leadId, updated);
  };

  // Filter Logic
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.company.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const leadSources = ["Website", "LinkedIn", "Referral", "Email Campaign", "Direct Contact", "Other"];
  const leadStatuses = ["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"];

  return (
    <div style={{ display: 'flex', gap: '24px', height: '100%', position: 'relative' }}>
      
      {/* Primary Leads Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
        
        {/* Filters Toolbar */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '16px', 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '16px', 
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1 }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-muted)' 
                }} 
              />
              <input 
                type="text" 
                placeholder="Search leads..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '36px', height: '38px' }}
              />
            </div>

            {/* Status Filter Dropdown */}
            <div style={{ width: '130px' }}>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ height: '38px', padding: '6px 12px' }}
              >
                <option value="All">All Statuses</option>
                {leadStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Source Filter Dropdown */}
            <div style={{ width: '140px' }}>
              <select 
                value={sourceFilter} 
                onChange={(e) => setSourceFilter(e.target.value)}
                style={{ height: '38px', padding: '6px 12px' }}
              >
                <option value="All">All Sources</option>
                {leadSources.map(src => <option key={src} value={src}>{src}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            
            {/* View Mode Toggle Buttons */}
            <div style={{ display: 'flex', background: 'var(--bg-hover)', borderRadius: '8px', padding: '3px' }}>
              <button 
                onClick={() => setViewMode('table')}
                className="btn btn-ghost"
                style={{ 
                  padding: '6px 10px', 
                  borderRadius: '6px',
                  backgroundColor: viewMode === 'table' ? 'var(--bg-secondary)' : 'transparent',
                  color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-secondary)'
                }}
              >
                <List size={16} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className="btn btn-ghost"
                style={{ 
                  padding: '6px 10px', 
                  borderRadius: '6px',
                  backgroundColor: viewMode === 'grid' ? 'var(--bg-secondary)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-secondary)'
                }}
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            {/* Create Lead Button */}
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary"
              style={{ height: '38px' }}
            >
              <Plus size={16} />
              <span>Add Lead</span>
            </button>
          </div>
        </div>

        {/* View Layouts */}
        {filteredLeads.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>No leads match the active filters.</p>
          </div>
        ) : viewMode === 'table' ? (
          /* List/Spreadsheet View */
          <div className="table-container animate-fade-in" style={{ flex: 1, minHeight: 0 }}>
            <table style={{ minWidth: '700px' }}>
              <thead>
                <tr>
                  <th>Lead Details</th>
                  <th>Company</th>
                  <th>Value</th>
                  <th>Pipeline Status</th>
                  <th>Source</th>
                  <th>Owner</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => (
                  <tr 
                    key={lead.id} 
                    onClick={() => setSelectedLeadId(lead.id)}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedLeadId === lead.id ? 'var(--accent-light)' : 'transparent'
                    }}
                  >
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{lead.name}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.email}</span>
                      </div>
                    </td>
                    <td>{lead.company}</td>
                    <td>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(lead.value)}
                      </span>
                    </td>
                    <td>
                      <span 
                        className={`badge badge-${
                          lead.status === 'Won' ? 'success' : 
                          lead.status === 'Lost' ? 'danger' : 
                          lead.status === 'Proposal Sent' ? 'info' : 'warning'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td>
                      <span 
                        style={{
                          fontSize: '11px', 
                          padding: '3px 8px', 
                          borderRadius: '4px',
                          background: 'var(--bg-hover)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {lead.source}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>
                          {lead.owner.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{lead.owner}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button 
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="btn btn-ghost" 
                          style={{ padding: '6px', borderRadius: '50%' }}
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => deleteLead(lead.id)}
                          className="btn btn-ghost" 
                          style={{ padding: '6px', borderRadius: '50%', color: 'var(--error-text)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards/Grid View */
          <div 
            className="animate-fade-in"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
              flex: 1,
              overflowY: 'auto'
            }}
          >
            {filteredLeads.map(lead => (
              <div 
                key={lead.id} 
                className="glass-card" 
                onClick={() => setSelectedLeadId(lead.id)}
                style={{ 
                  cursor: 'pointer',
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '14px',
                  border: selectedLeadId === lead.id ? '1px solid var(--primary)' : '1px solid var(--glass-border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{lead.name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.company}</span>
                  </div>
                  <span 
                    className={`badge badge-${
                      lead.status === 'Won' ? 'success' : 
                      lead.status === 'Lost' ? 'danger' : 
                      lead.status === 'Proposal Sent' ? 'info' : 'warning'
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Deal Value:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(lead.value)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Source:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{lead.source}</span>
                  </div>
                </div>

                <div 
                  style={{ 
                    paddingTop: '12px', 
                    borderTop: '1px solid var(--border-color)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    fontSize: '12px'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>Owner: {lead.owner}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteLead(lead.id); }}
                    className="btn btn-ghost" 
                    style={{ padding: '4px', borderRadius: '50%', color: 'var(--error-text)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sliding Lead Details Side Panel Drawer (1/3 Width) */}
      {selectedLead && (
        <div 
          className="glass-panel animate-slide-in-right"
          style={{
            width: '360px',
            background: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--border-color)',
            borderRadius: '0px 12px 12px 0px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 85
          }}
        >
          {/* Drawer Header */}
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '800' }}>Lead Overview</h4>
            <button 
              onClick={() => setSelectedLeadId(null)} 
              className="btn btn-ghost" 
              style={{ padding: '6px', borderRadius: '50%' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Edit Form / Details */}
          <form 
            onSubmit={(e) => { handleLeadUpdateSubmit(e, selectedLead.id); alert('Lead updated successfully!'); }}
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}
          >
            <div>
              <label>Contact Name</label>
              <input type="text" name="name" defaultValue={selectedLead.name} required />
            </div>

            <div>
              <label>Company</label>
              <input type="text" name="company" defaultValue={selectedLead.company} required />
            </div>

            <div>
              <label>Work Email</label>
              <input type="email" name="email" defaultValue={selectedLead.email} required />
            </div>

            <div>
              <label>Phone Number</label>
              <input type="text" name="phone" defaultValue={selectedLead.phone} />
            </div>

            <div>
              <label>Deal Value (₹)</label>
              <input type="number" name="value" defaultValue={selectedLead.value} required />
            </div>

            <div>
              <label>Lead Source</label>
              <select name="source" defaultValue={selectedLead.source}>
                {leadSources.map(src => <option key={src} value={src}>{src}</option>)}
              </select>
            </div>

            <div>
              <label>Pipeline Stage</label>
              <select name="status" defaultValue={selectedLead.status}>
                {leadStatuses.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>

            <div>
              <label>Assigned Representative</label>
              <select name="owner" defaultValue={selectedLead.owner}>
                {TEAM_MEMBERS.map(owner => <option key={owner} value={owner}>{owner}</option>)}
              </select>
            </div>

            <div>
              <label>Notes & Activity logs</label>
              <textarea name="notes" rows={3} defaultValue={selectedLead.notes || ''} placeholder="Add specific client interactions..." />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px', marginTop: '8px' }}>
              Save Lead Changes
            </button>
          </form>
        </div>
      )}

      {/* Add Lead Popup Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div 
            className="glass-modal animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '480px', padding: '30px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Create Workspace Lead</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="btn btn-ghost" 
                style={{ padding: '6px', borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label>Contact Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={newLeadForm.name} 
                  onChange={handleFormChange}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div>
                <label>Company *</label>
                <input 
                  type="text" 
                  name="company" 
                  value={newLeadForm.company} 
                  onChange={handleFormChange}
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Email *</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={newLeadForm.email} 
                    onChange={handleFormChange}
                    placeholder="john@acme.com"
                    required
                  />
                </div>
                <div>
                  <label>Phone</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={newLeadForm.phone} 
                    onChange={handleFormChange}
                    placeholder="+1 (555) 0123"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Deal Value (₹) *</label>
                  <input 
                    type="number" 
                    name="value" 
                    value={newLeadForm.value} 
                    onChange={handleFormChange}
                    placeholder="5000"
                    required
                  />
                </div>
                <div>
                  <label>Lead Source</label>
                  <select name="source" value={newLeadForm.source} onChange={handleFormChange}>
                    {leadSources.map(src => <option key={src} value={src}>{src}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Status</label>
                  <select name="status" value={newLeadForm.status} onChange={handleFormChange}>
                    {leadStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
                <div>
                  <label>Assigned Representative</label>
                  <select name="owner" value={newLeadForm.owner} onChange={handleFormChange}>
                    {TEAM_MEMBERS.map(owner => <option key={owner} value={owner}>{owner}</option>)}
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', marginTop: '10px' }}
              >
                Add Lead to CRM
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
