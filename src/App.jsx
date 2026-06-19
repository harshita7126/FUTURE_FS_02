import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeProvider';
import { CRMProvider } from './context/CRMProvider';
import { useCRM } from './context/CRMContext';
import { AuthGateway } from './components/AuthGateway';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Leads } from './views/Leads';
import { Customers } from './views/Customers';
import { Pipeline } from './views/Pipeline';
import { Tasks } from './views/Tasks';
import { Analytics } from './views/Analytics';
import { Settings } from './views/Settings';
import { FAB } from './components/FAB';
import { CommandPalette } from './components/CommandPalette';
import { VelocityAssistant } from './components/VelocityAssistant';
import { OnboardingModal } from './components/OnboardingModal';
import { TEAM_MEMBERS } from './utils/mockData';
import { X } from 'lucide-react';

const AppContent = () => {
  const { isAuthenticated, isAuthLoading, activeView, addLead, addTask } = useCRM();
  
  // Overlay display states
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState(null); // 'add-lead' or 'add-task'

  // Listen for global Ctrl+K keystroke
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickAction = (type) => {
    setQuickAddType(type);
  };

  // Avoid login screen flash during auth session recovery
  if (isAuthLoading) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh', 
          width: '100vw', 
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}
      >
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Verifying security session...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated, lock screens inside Gateway layout
  if (!isAuthenticated) {
    return <AuthGateway />;
  }

  return (
    <Layout 
      onOpenAssistant={() => setIsAssistantOpen(true)}
      onOpenPalette={() => setIsPaletteOpen(true)}
    >
      {/* Active Navigation Views Routing */}
      {activeView === 'dashboard' && <Dashboard />}
      {activeView === 'leads' && <Leads />}
      {activeView === 'customers' && <Customers />}
      {activeView === 'pipeline' && <Pipeline />}
      {activeView === 'tasks' && <Tasks />}
      {activeView === 'analytics' && <Analytics />}
      {activeView === 'settings' && <Settings />}

      {/* Floating Action Buttons */}
      <FAB onQuickAction={handleQuickAction} />

      {/* Global Command Palette Ctrl+K */}
      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)}
        onQuickAction={handleQuickAction}
      />

      {/* Nexus AI Drawer Assistant */}
      <VelocityAssistant 
        isOpen={isAssistantOpen} 
        onClose={() => setIsAssistantOpen(false)}
      />

      {/* Onboarding Wizard popup */}
      <OnboardingModal />

      {/* Quick Add Lead Modal Overlay */}
      {quickAddType === 'add-lead' && (
        <div className="modal-overlay" onClick={() => setQuickAddType(null)}>
          <div 
            className="glass-modal animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '460px', padding: '30px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Quick Add CRM Lead</h3>
              <button onClick={() => setQuickAddType(null)} className="btn btn-ghost" style={{ padding: '6px', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                addLead({
                  name: formData.get('name'),
                  company: formData.get('company'),
                  email: formData.get('email'),
                  phone: formData.get('phone'),
                  value: parseFloat(formData.get('value')) || 0,
                  status: 'New',
                  source: formData.get('source'),
                  owner: formData.get('owner')
                });
                setQuickAddType(null);
                alert('Lead added successfully!');
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div>
                <label>Contact Name *</label>
                <input type="text" name="name" placeholder="John Doe" required />
              </div>
              <div>
                <label>Company *</label>
                <input type="text" name="company" placeholder="Acme Systems" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Email *</label>
                  <input type="email" name="email" placeholder="name@company.com" required />
                </div>
                <div>
                  <label>Phone</label>
                  <input type="text" name="phone" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Deal Value (₹) *</label>
                  <input type="number" name="value" placeholder="8500" required />
                </div>
                <div>
                  <label>Lead Source</label>
                  <select name="source">
                    <option>Website</option>
                    <option>LinkedIn</option>
                    <option>Referral</option>
                    <option>Email Campaign</option>
                    <option>Direct Contact</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label>Owner</label>
                <select name="owner">
                  {TEAM_MEMBERS.map(rep => <option key={rep} value={rep}>{rep}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
                Create Lead Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Task Modal Overlay */}
      {quickAddType === 'add-task' && (
        <div className="modal-overlay" onClick={() => setQuickAddType(null)}>
          <div 
            className="glass-modal animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '420px', padding: '30px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Quick Schedule Task</h3>
              <button onClick={() => setQuickAddType(null)} className="btn btn-ghost" style={{ padding: '6px', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                addTask({
                  title: formData.get('title'),
                  dueDate: formData.get('dueDate'),
                  priority: formData.get('priority'),
                  assignedTo: formData.get('assignedTo'),
                  leadName: formData.get('leadName')
                });
                setQuickAddType(null);
                alert('Task scheduled successfully!');
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div>
                <label>Task Title *</label>
                <input type="text" name="title" placeholder="Follow up call..." required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Due Date *</label>
                  <input type="date" name="dueDate" defaultValue={new Date().toISOString().split('T')[0]} required />
                </div>
                <div>
                  <label>Priority</label>
                  <select name="priority">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Assignee</label>
                  <select name="assignedTo">
                    {TEAM_MEMBERS.map(rep => <option key={rep} value={rep}>{rep}</option>)}
                  </select>
                </div>
                <div>
                  <label>Ref. Lead Name</label>
                  <input type="text" name="leadName" placeholder="David Chen" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
                Schedule Task
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <CRMProvider>
        <AppContent />
      </CRMProvider>
    </ThemeProvider>
  );
}

export default App;
