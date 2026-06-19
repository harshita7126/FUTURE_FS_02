import { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { supabase } from '../lib/supabase';
import { Save, User, Bell, Users, Database } from 'lucide-react';

export const Settings = () => {
  const { logActivity, user, loadDemoData, clearWorkspaceData } = useCRM();

  const [profile, setProfile] = useState({
    name: user?.user_metadata?.name || user?.user_metadata?.full_name || '',
    email: user?.email || '',
    role: user?.user_metadata?.role || 'Sales Representative'
  });

  const [notifs, setNotifs] = useState({
    leadAdded: true,
    dealWon: true,
    taskDue: true,
    weeklyReport: false
  });

  const [crmCustom, setCrmCustom] = useState({
    currency: 'USD ($)',
    timezone: 'EST (GMT-5)',
    fiscalStart: 'January'
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleNotifChange = (e) => {
    const { name, checked } = e.target;
    setNotifs(prev => ({ ...prev, [name]: checked }));
  };

  const handleCrmChange = (e) => {
    const { name, value } = e.target;
    setCrmCustom(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!supabase) {
      logActivity("User saved workspace and notification settings configuration (mock fallback)", "auth");
      alert("Settings updated successfully!");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: profile.name,
          role: profile.role
        }
      });
      if (error) throw error;
      logActivity("User saved workspace and notification settings configuration", "auth");
      alert("Profile and workspace settings updated successfully!");
    } catch (err) {
      console.error(err);
      alert(`Failed to update profile settings: ${err.message || err.toString()}`);
    }
  };

  const teamRoster = [
    { name: "Alex Rivera", role: "Sales Lead", email: "alex.rivera@nexus.com", status: "Active" },
    { name: "Sophia Chen", role: "Key Account Manager", email: "sophia.chen@nexus.com", status: "Active" },
    { name: "Marcus Johnson", role: "Sales Representative", email: "marcus.j@nexus.com", status: "Active" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      
      {/* Profile Settings */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <User size={18} style={{ color: 'var(--primary)' }} />
            <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Workspace User Profile</h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label>Full Name</label>
              <input type="text" name="name" value={profile.name} onChange={handleProfileChange} required />
            </div>
            <div>
              <label>Email Address (Read Only)</label>
              <input type="email" name="email" value={profile.email} disabled required />
            </div>
          </div>
          <div>
            <label>Workspace Role</label>
            <input type="text" name="role" value={profile.role} onChange={handleProfileChange} required />
          </div>
        </div>

        {/* Notification Settings */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <Bell size={18} style={{ color: 'var(--success)' }} />
            <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Notifications Roster Preferences</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                name="leadAdded" 
                checked={notifs.leadAdded} 
                onChange={handleNotifChange}
                style={{ width: 'auto', cursor: 'pointer' }} 
              />
              <label style={{ margin: 0, fontSize: '13px', cursor: 'pointer' }}>Email alert when new Lead is created</label>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                name="dealWon" 
                checked={notifs.dealWon} 
                onChange={handleNotifChange}
                style={{ width: 'auto', cursor: 'pointer' }} 
              />
              <label style={{ margin: 0, fontSize: '13px', cursor: 'pointer' }}>Real-time browser alert when Deal is Won</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                name="taskDue" 
                checked={notifs.taskDue} 
                onChange={handleNotifChange}
                style={{ width: 'auto', cursor: 'pointer' }} 
              />
              <label style={{ margin: 0, fontSize: '13px', cursor: 'pointer' }}>Notify me at 9:00 AM for tasks due today</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                name="weeklyReport" 
                checked={notifs.weeklyReport} 
                onChange={handleNotifChange}
                style={{ width: 'auto', cursor: 'pointer' }} 
              />
              <label style={{ margin: 0, fontSize: '13px', cursor: 'pointer' }}>Receive weekly PDF performance digests (Email)</label>
            </div>
          </div>
        </div>

        {/* CRM Workspace Options */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <Database size={18} style={{ color: 'var(--accent)' }} />
            <h4 style={{ fontSize: '15px', fontWeight: '800' }}>CRM Localization Configuration</h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label>Default Currency</label>
              <select name="currency" value={crmCustom.currency} onChange={handleCrmChange}>
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>JPY (¥)</option>
              </select>
            </div>
            <div>
              <label>Timezone Alignment</label>
              <select name="timezone" value={crmCustom.timezone} onChange={handleCrmChange}>
                <option>EST (GMT-5)</option>
                <option>PST (GMT-8)</option>
                <option>GMT (GMT+0)</option>
                <option>CET (GMT+1)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Team Members List (View Only) */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <Users size={18} style={{ color: 'var(--info)' }} />
            <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Active Workspace Representatives</h4>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Workspace Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {teamRoster.map((rep, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{rep.name}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rep.email}</span>
                      </div>
                    </td>
                    <td>{rep.role}</td>
                    <td>
                      <span className="badge badge-success">{rep.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '15px', gap: '8px' }}>
            <Save size={16} />
            <span>Save Workspace Settings</span>
          </button>
        </div>

      </form>

      {/* Workspace Data Management Section */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <Database size={18} style={{ color: 'var(--accent)' }} />
          <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Workspace Data Management</h4>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          Manage your CRM database workspace. You can seed your workspace with initial mock data (leads, customers, and tasks) for demo purposes, or permanently wipe all records associated with your account.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            type="button"
            onClick={loadDemoData}
            className="btn btn-secondary"
            style={{ padding: '10px 16px', display: 'inline-flex', gap: '8px', alignItems: 'center' }}
          >
            Load Demo Workspace
          </button>
          <button 
            type="button"
            onClick={clearWorkspaceData}
            className="btn btn-danger"
            style={{ padding: '10px 16px', display: 'inline-flex', gap: '8px', alignItems: 'center' }}
          >
            Clear Workspace Data
          </button>
        </div>
      </div>

    </div>
  );
};
