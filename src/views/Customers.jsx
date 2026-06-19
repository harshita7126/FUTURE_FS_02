import { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { TEAM_MEMBERS } from '../utils/mockData';
import { Search, CreditCard, Clock, MessageSquare, X, Plus, Trash2 } from 'lucide-react';

export const Customers = () => {
  const { 
    customers, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer, 
    isCustomersLoading, 
    customersError, 
    addCustomerInteraction 
  } = useCRM();
  
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('All');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Add Customer Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    company: '',
    email: '',
    revenue: '',
    segment: 'SMB',
    status: 'Active',
    owner: TEAM_MEMBERS[0]
  });

  // Selected customer
  const selectedCust = customers.find(c => c.id === selectedCustomerId);

  // Form handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewCustomerForm(prev => ({
      ...prev,
      [name]: name === 'revenue' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addCustomer(newCustomerForm);
    setIsAddModalOpen(false);
    // Reset Form
    setNewCustomerForm({
      name: '',
      company: '',
      email: '',
      revenue: '',
      segment: 'SMB',
      status: 'Active',
      owner: TEAM_MEMBERS[0]
    });
  };

  const handleCustomerUpdateSubmit = (e, custId) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = {
      name: formData.get('name'),
      company: formData.get('company'),
      email: formData.get('email'),
      revenue: parseFloat(formData.get('revenue')) || 0,
      segment: formData.get('segment'),
      status: formData.get('status'),
      owner: formData.get('owner')
    };
    updateCustomer(custId, updated);
    alert('Customer updated successfully!');
  };

  // Log Interaction state
  const [logType, setLogType] = useState('Call Log');
  const [logText, setLogText] = useState('');

  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!logText.trim() || !selectedCustomerId) return;
    
    addCustomerInteraction(selectedCustomerId, logType, logText);
    setLogText('');
    alert('Customer interaction successfully recorded!');
  };

  // Get total purchases amount helper
  const getPurchaseTotal = (purchaseHistory) => {
    if (!purchaseHistory) return 0;
    return purchaseHistory.reduce((sum, item) => sum + item.amount, 0);
  };

  // Filter logic
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
      
    const matchesSegment = segmentFilter === 'All' || c.segment === segmentFilter;
    
    return matchesSearch && matchesSegment;
  });

  if (isCustomersLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px' }}>
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '24px', height: '100%', position: 'relative' }}>
      
      {/* Primary Customers Table list */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
        
        {customersError && (
          <div className="glass-panel" style={{ padding: '12px 20px', backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', borderRadius: '8px', borderLeft: '4px solid var(--error)' }}>
            <span>Database Error: {customersError}</span>
          </div>
        )}

        {/* Toolbar */}
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
            
            {/* Search */}
            <div style={{ position: 'relative', width: '240px' }}>
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
                placeholder="Search customers..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '36px', height: '38px' }}
              />
            </div>

            {/* Segment filter */}
            <div style={{ width: '150px' }}>
              <select 
                value={segmentFilter} 
                onChange={(e) => setSegmentFilter(e.target.value)}
                style={{ height: '38px', padding: '6px 12px' }}
              >
                <option value="All">All Segments</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Mid-Market">Mid-Market</option>
                <option value="SMB">SMB</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Active Accounts: <strong>{customers.filter(c => c.status === 'Active').length}</strong>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary"
              style={{ height: '38px' }}
            >
              <Plus size={16} />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Customer Table */}
        {filteredCustomers.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>No customers found.</p>
          </div>
        ) : (
          <div className="table-container animate-fade-in" style={{ flex: 1, minHeight: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Customer Profile</th>
                  <th>Company</th>
                  <th>Owner</th>
                  <th>Segment</th>
                  <th>Contract Revenue</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(cust => {
                  const totalPaid = cust.revenue !== undefined 
                    ? Number(cust.revenue) || 0 
                    : getPurchaseTotal(cust.purchaseHistory);
                  return (
                    <tr 
                      key={cust.id}
                      onClick={() => setSelectedCustomerId(cust.id)}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedCustomerId === cust.id ? 'var(--accent-light)' : 'transparent'
                      }}
                    >
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{cust.name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cust.email}</span>
                        </div>
                      </td>
                      <td>{cust.company}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>
                            {(cust.owner || 'Alex Rivera').substring(0, 2).toUpperCase()}
                          </div>
                          <span>{cust.owner || 'Alex Rivera'}</span>
                        </div>
                      </td>
                      <td>
                        <span 
                          className="badge"
                          style={{
                            background: cust.segment === 'Enterprise' ? 'var(--accent-light)' : 'var(--bg-hover)',
                            color: cust.segment === 'Enterprise' ? 'var(--accent)' : 'var(--text-secondary)',
                            fontWeight: 600
                          }}
                        >
                          {cust.segment}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalPaid)}
                        </span>
                      </td>
                      <td>{cust.joinedDate}</td>
                      <td>
                        <span 
                          className={`badge badge-${cust.status === 'Active' ? 'success' : 'danger'}`}
                        >
                          {cust.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          <button 
                            onClick={() => setSelectedCustomerId(cust.id)}
                            className="btn btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            Details
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete customer ${cust.name}?`)) {
                                deleteCustomer(cust.id);
                                if (selectedCustomerId === cust.id) {
                                  setSelectedCustomerId(null);
                                }
                              }
                            }}
                            className="btn btn-ghost" 
                            style={{ padding: '6px', borderRadius: '50%', color: 'var(--error-text)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-out Customer Details & Log Panel Drawer */}
      {selectedCust && (
        <div 
          className="glass-panel animate-slide-in-right"
          style={{
            width: '420px',
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
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '800' }}>{selectedCust.name}</h4>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedCust.company}</span>
            </div>
            <button 
              onClick={() => setSelectedCustomerId(null)} 
              className="btn btn-ghost" 
              style={{ padding: '6px', borderRadius: '50%' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, overflowY: 'auto' }}>
            
            {/* Editable Profile Info Form */}
            <form 
              onSubmit={(e) => handleCustomerUpdateSubmit(e, selectedCust.id)}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div>
                <label>Contact Name</label>
                <input type="text" name="name" defaultValue={selectedCust.name} required />
              </div>

              <div>
                <label>Company</label>
                <input type="text" name="company" defaultValue={selectedCust.company} required />
              </div>

              <div>
                <label>Work Email</label>
                <input type="email" name="email" defaultValue={selectedCust.email} required />
              </div>

              <div>
                <label>Contract Revenue (₹)</label>
                <input 
                  type="number" 
                  name="revenue" 
                  defaultValue={selectedCust.revenue !== undefined ? selectedCust.revenue : getPurchaseTotal(selectedCust.purchaseHistory)} 
                  required 
                />
              </div>

              <div>
                <label>Assigned Representative (Owner)</label>
                <select name="owner" defaultValue={selectedCust.owner || 'Alex Rivera'}>
                  {TEAM_MEMBERS.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Segment</label>
                  <select name="segment" defaultValue={selectedCust.segment}>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Mid-Market">Mid-Market</option>
                    <option value="SMB">SMB</option>
                  </select>
                </div>
                <div>
                  <label>Status</label>
                  <select name="status" defaultValue={selectedCust.status}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '10px' }}>
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete customer ${selectedCust.name}?`)) {
                      deleteCustomer(selectedCust.id);
                      setSelectedCustomerId(null);
                    }
                  }}
                  className="btn btn-danger" 
                  style={{ padding: '10px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </form>

            {/* Purchase History */}
            <div>
              <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Billing & Contracts
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedCust.purchaseHistory?.map((item) => (
                  <div 
                    key={item.id}
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CreditCard size={16} style={{ color: 'var(--primary)' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.product}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.date}</span>
                      </div>
                    </div>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.amount)}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Logger form */}
            <form onSubmit={handleLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Log CRM Interaction
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <select 
                  value={logType} 
                  onChange={(e) => setLogType(e.target.value)}
                  style={{ fontSize: '12px', padding: '6px 8px' }}
                >
                  <option value="Call Log">📞 Call Log</option>
                  <option value="Email Log">✉️ Email Log</option>
                  <option value="Meeting Notes">🤝 Meeting</option>
                  <option value="Follow-up History">🔄 Follow-up</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Record call, email or notes..." 
                  value={logText}
                  onChange={(e) => setLogText(e.target.value)}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '12px', gap: '6px' }}>
                <Plus size={14} />
                <span>Save Log Entry</span>
              </button>
            </form>

            {/* Render Interaction Log History */}
            <div>
              <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Interaction History Logs
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {selectedCust.interactionHistory?.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No logs recorded for this account.</p>
                ) : (
                  selectedCust.interactionHistory?.map((log, idx) => {
                    const iconColor = 
                      log.type === 'Call Log' ? 'var(--primary)' :
                      log.type === 'Email Log' ? 'var(--info)' :
                      log.type === 'Meeting Notes' ? 'var(--accent)' : 'var(--warning)';
                    
                    return (
                      <div key={idx} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                        <div 
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--bg-hover)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <MessageSquare size={12} style={{ color: iconColor }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {log.type}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={10} />
                              {log.timestamp}
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                            {log.description}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      )}
      {/* Add Customer Popup Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div 
            className="glass-modal animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '480px', padding: '30px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Create Workspace Customer</h3>
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
                  value={newCustomerForm.name} 
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
                  value={newCustomerForm.company} 
                  onChange={handleFormChange}
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>

              <div>
                <label>Email *</label>
                <input 
                  type="email" 
                  name="email" 
                  value={newCustomerForm.email} 
                  onChange={handleFormChange}
                  placeholder="john@acme.com"
                  required
                />
              </div>

              <div>
                <label>Contract Revenue (₹) *</label>
                <input 
                  type="number" 
                  name="revenue" 
                  value={newCustomerForm.revenue} 
                  onChange={handleFormChange}
                  placeholder="15000"
                  required
                />
              </div>

              <div>
                <label>Assigned Representative (Owner)</label>
                <select name="owner" value={newCustomerForm.owner} onChange={handleFormChange}>
                  {TEAM_MEMBERS.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Segment</label>
                  <select name="segment" value={newCustomerForm.segment} onChange={handleFormChange}>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Mid-Market">Mid-Market</option>
                    <option value="SMB">SMB</option>
                  </select>
                </div>
                <div>
                  <label>Status</label>
                  <select name="status" value={newCustomerForm.status} onChange={handleFormChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', marginTop: '10px' }}
              >
                Add Customer to CRM
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
