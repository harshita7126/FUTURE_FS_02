import { useState, useEffect } from 'react';
import { CRMContext } from './CRMContext';
import { supabase } from '../lib/supabase';
import { 
  INITIAL_LEADS, 
  INITIAL_CUSTOMERS, 
  INITIAL_TASKS, 
  INITIAL_NOTIFICATIONS, 
  generateActivityData 
} from '../utils/mockData';

// Helper to generate unique IDs outside of component render scope
const generateUniqueId = (prefix) => {
  return `${prefix}-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;
};

// Helper to generate negative numeric IDs outside of component render scope
const generateNegativeNumericId = () => {
  return -Math.floor(Date.now() + Math.random() * 1000000);
};

// Helper to get ISO date string outside of component render scope
const getNowISODateString = () => {
  return new Date().toISOString();
};

export const CRMProvider = ({ children }) => {
  // Authentication & Onboarding state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem('velocity_onboarded') === 'true';
  });

  // Supabase Auth Session listener
  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false);
      return;
    }

    // Restore previous session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Navigation
  const [activeView, setActiveView] = useState('dashboard');
  
  // Data State starting clean and empty for new users
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('velocity_leads');
    return saved ? JSON.parse(saved) : [];
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('velocity_customers');
    if (saved) {
      return JSON.parse(saved).map(c => {
        const savedInteractions = localStorage.getItem(`velocity_interactions_${c.id}`);
        return {
          ...c,
          interactionHistory: savedInteractions ? JSON.parse(savedInteractions) : (c.interactionHistory || [])
        };
      });
    }
    return [];
  });

  const [isCustomersLoading, setIsCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState(null);

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('velocity_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState(null);

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('velocity_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Dynamic user activities timeline (recent operations in current session)
  const [activities, setActivities] = useState([]);

  // Heatmap Data (Simulated daily activities, incremented when users do actions)
  const [heatmapActivities, setHeatmapActivities] = useState(() => {
    return generateActivityData("2026-06-18", true);
  });

  // Helper to add system notification (declared before useEffect/actions call it)
  const addNotification = (title, message, type = "info") => {
    const newNotif = {
      id: generateUniqueId('notif'),
      title,
      message,
      type,
      time: "Just now",
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Helper to log user activity and increment heatmap contribution count for today (2026-06-18)
  const logActivity = (text, type = "info") => {
    const newActivity = {
      id: generateUniqueId('act'),
      text,
      time: "Just now",
      type
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 19)]); // Limit to 20 logs

    // Increment today's contribution count in heatmap
    const todayStr = "2026-06-18";
    setHeatmapActivities(prev => {
      return prev.map(item => {
        if (item.date === todayStr) {
          return { ...item, count: item.count + 1 };
        }
        return item;
      });
    });
  };

  // Fetch Leads from Supabase on authentication change
  useEffect(() => {
    if (!supabase) {
      return;
    }
    if (!isAuthenticated || !user) {
      setLeads([]);
      return;
    }

    const fetchLeadsFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('id, created_at, name, email, company, status, value, source, owner')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Map data to ensure lead.date is derived dynamically from created_at
        const mapped = (data || []).map(l => ({
          ...l,
          value: Number(l.value) || 0,
          date: l.created_at ? l.created_at.split('T')[0] : getNowISODateString().split('T')[0]
        }));

        setLeads(mapped);
      } catch (err) {
        console.error("Supabase leads fetch failed:", err);
        addNotification(
          "Database Load Error",
          `Supabase query failed: ${err.message || err.toString()}`,
          "error"
        );
      }
    };

    fetchLeadsFromSupabase();
  }, [isAuthenticated, user]);

  // Fetch Customers from Supabase on authentication change
  useEffect(() => {
    if (!supabase) {
      return;
    }
    if (!isAuthenticated || !user) {
      setCustomers([]);
      return;
    }

    const fetchCustomersFromSupabase = async () => {
      setIsCustomersLoading(true);
      setCustomersError(null);
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('id, created_at, name, email, company, revenue, status, segment')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Map data to ensure fields are aligned with existing UI expectations
        const mapped = (data || []).map(c => {
          const savedInteractions = localStorage.getItem(`velocity_interactions_${c.id}`);
          const savedOwner = localStorage.getItem(`velocity_customer_owner_${c.id}`);
          return {
            ...c,
            revenue: Number(c.revenue) || 0,
            joinedDate: c.created_at ? c.created_at.split('T')[0] : getNowISODateString().split('T')[0],
            owner: savedOwner || c.owner || (
              (c.email === 'c.beaumont@velolog.fr' || c.email === 'torvalds@kernel.org') ? 'Sophia Chen' :
              (c.email === 'joconnor@dublincap.ie' || c.email === 'bruce@waynecorp.com') ? 'Marcus Johnson' :
              'Alex Rivera'
            ),
            purchaseHistory: [],
            interactionHistory: savedInteractions ? JSON.parse(savedInteractions) : []
          };
        });

        setCustomers(mapped);
      } catch (err) {
        console.error("Supabase customers fetch failed:", err);
        setCustomersError(err.message || err.toString());
        addNotification(
          "Database Load Error",
          `Supabase customers query failed: ${err.message || err.toString()}`,
          "error"
        );
      } finally {
        setIsCustomersLoading(false);
      }
    };

    fetchCustomersFromSupabase();
  }, [isAuthenticated, user]);

  // Fetch Tasks from Supabase on authentication change
  useEffect(() => {
    if (!supabase) {
      return;
    }
    if (!isAuthenticated || !user) {
      setTasks([]);
      return;
    }

    const fetchTasksFromSupabase = async () => {
      setIsTasksLoading(true);
      setTasksError(null);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('id, created_at, title, priority, status, due_date, assignee')
          .eq('user_id', user.id)
          .order('due_date', { ascending: true });

        if (error) throw error;

        // Map data to align with React state keys
        const mapped = (data || []).map(t => ({
          id: t.id,
          created_at: t.created_at,
          title: t.title,
          priority: t.priority,
          status: t.status,
          dueDate: t.due_date ? t.due_date : getNowISODateString().split('T')[0],
          assignedTo: t.assignee ? t.assignee : "Unassigned",
          leadName: ""
        }));

        setTasks(mapped);
      } catch (err) {
        console.error("Supabase tasks fetch failed:", err);
        setTasksError(err.message || err.toString());
        addNotification(
          "Database Load Error",
          `Supabase tasks query failed: ${err.message || err.toString()}`,
          "error"
        );
      } finally {
        setIsTasksLoading(false);
      }
    };

    fetchTasksFromSupabase();
  }, [isAuthenticated, user]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('velocity_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('velocity_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('velocity_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('velocity_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Real Supabase Authentication Methods
  const login = async (email, password) => {
    if (!supabase) {
      setIsAuthenticated(true);
      logActivity("User signed into CRM dashboard (mock fallback)", "auth");
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    logActivity(`User signed in: ${email}`, "auth");
    return data;
  };

  const signup = async (email, password, name) => {
    if (!supabase) {
      setIsAuthenticated(true);
      logActivity("User registered account (mock fallback)", "auth");
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'Sales Representative' // Default role
        }
      }
    });
    if (error) throw error;
    logActivity(`User registered account: ${email}`, "auth");
    return data;
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setUser(null);
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
    localStorage.setItem('velocity_onboarded', 'true');
    logActivity("User completed product onboarding tutorial", "auth");
    addNotification("Onboarding completed", "Welcome to Nexus! Your workspace is fully set up.", "success");
  };

  const loadDemoData = async () => {
    if (!isAuthenticated || !user) return;
    
    // 1. Prepare demo data with user_id
    const demoLeads = INITIAL_LEADS.map(l => ({
      name: l.name,
      company: l.company,
      email: l.email,
      status: l.status,
      value: l.value,
      source: l.source,
      owner: l.owner,
      user_id: user.id
    }));

    const demoCustomers = INITIAL_CUSTOMERS.map(c => ({
      name: c.name,
      company: c.company,
      email: c.email,
      revenue: c.revenue,
      status: c.status,
      segment: c.segment,
      user_id: user.id
    }));

    const demoTasks = INITIAL_TASKS.map(t => ({
      title: t.title,
      due_date: t.dueDate,
      priority: t.priority,
      status: t.status,
      assignee: t.assignedTo || "Alex Rivera",
      user_id: user.id
    }));

    if (!supabase) {
      setLeads(INITIAL_LEADS);
      setCustomers(INITIAL_CUSTOMERS.map(c => ({
        ...c,
        interactionHistory: c.interactionHistory || []
      })));
      setTasks(INITIAL_TASKS.map(t => ({
        ...t,
        assignedTo: t.assignedTo || 'Alex Rivera'
      })));
      logActivity("Demo workspace data loaded locally", "info");
      alert("Demo data loaded successfully (Local Cache)!");
      return;
    }

    try {
      setIsCustomersLoading(true);
      
      // Clear current user's existing records first to avoid duplicates
      await supabase.from('leads').delete().eq('user_id', user.id);
      await supabase.from('customers').delete().eq('user_id', user.id);
      await supabase.from('tasks').delete().eq('user_id', user.id);

      // Insert demo records
      const { error: leadsError } = await supabase.from('leads').insert(demoLeads);
      if (leadsError) throw leadsError;

      const { error: custError } = await supabase.from('customers').insert(demoCustomers);
      if (custError) throw custError;

      const { error: tasksError } = await supabase.from('tasks').insert(demoTasks);
      if (tasksError) throw tasksError;

      // Refetch
      const { data: leadsData } = await supabase.from('leads').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      const { data: custData } = await supabase.from('customers').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      const { data: tasksData } = await supabase.from('tasks').select('*').eq('user_id', user.id).order('due_date', { ascending: true });

      // Cache interaction histories in localStorage dynamically using Supabase customer IDs
      (custData || []).forEach(newCust => {
        const mockCust = INITIAL_CUSTOMERS.find(c => c.email.toLowerCase() === newCust.email.toLowerCase());
        if (mockCust && mockCust.interactionHistory) {
          localStorage.setItem(`velocity_interactions_${newCust.id}`, JSON.stringify(mockCust.interactionHistory));
        }
      });

      setLeads((leadsData || []).map(l => ({ ...l, value: Number(l.value) || 0, date: l.created_at.split('T')[0] })));
      setCustomers((custData || []).map(c => {
        const savedInteractions = localStorage.getItem(`velocity_interactions_${c.id}`);
        const savedOwner = localStorage.getItem(`velocity_customer_owner_${c.id}`);
        return {
          ...c,
          revenue: Number(c.revenue) || 0,
          joinedDate: c.created_at.split('T')[0],
          owner: savedOwner || c.owner || (
            (c.email === 'c.beaumont@velolog.fr' || c.email === 'torvalds@kernel.org') ? 'Sophia Chen' :
            (c.email === 'joconnor@dublincap.ie' || c.email === 'bruce@waynecorp.com') ? 'Marcus Johnson' :
            'Alex Rivera'
          ),
          purchaseHistory: [],
          interactionHistory: savedInteractions ? JSON.parse(savedInteractions) : []
        };
      }));
      setTasks((tasksData || []).map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        status: t.status,
        dueDate: t.due_date,
        assignedTo: t.assignee,
        leadName: ''
      })));

      logActivity("Demo workspace data loaded from Supabase", "info");
      alert("Demo data successfully loaded into your workspace!");
    } catch (err) {
      console.error("Failed to load demo data:", err);
      alert(`Error loading demo data: ${err.message}`);
    } finally {
      setIsCustomersLoading(false);
    }
  };

  const clearWorkspaceData = async () => {
    if (!isAuthenticated || !user) return;
    
    if (!confirm("Are you sure you want to permanently clear all workspace data for your account? This action cannot be undone.")) {
      return;
    }

    if (!supabase) {
      setLeads([]);
      setCustomers([]);
      setTasks([]);
      setActivities([]);
      localStorage.removeItem('velocity_leads');
      localStorage.removeItem('velocity_customers');
      localStorage.removeItem('velocity_tasks');
      logActivity("Workspace data cleared locally", "info");
      alert("Workspace data cleared successfully!");
      return;
    }

    try {
      setIsCustomersLoading(true);
      // Delete user's leads
      const { error: leadsError } = await supabase.from('leads').delete().eq('user_id', user.id);
      if (leadsError) throw leadsError;

      // Delete user's customers
      const { error: custError } = await supabase.from('customers').delete().eq('user_id', user.id);
      if (custError) throw custError;

      // Delete user's tasks
      const { error: tasksError } = await supabase.from('tasks').delete().eq('user_id', user.id);
      if (tasksError) throw tasksError;

      setLeads([]);
      setCustomers([]);
      setTasks([]);
      setActivities([]);

      logActivity("Workspace data cleared from database", "info");
      alert("All workspace data has been cleared!");
    } catch (err) {
      console.error("Failed to clear workspace data:", err);
      alert(`Error clearing data: ${err.message}`);
    } finally {
      setIsCustomersLoading(false);
    }
  };

  // LEADS ACTIONS
  const addLead = async (leadData) => {
    // Generate temporary negative numeric ID for optimistic UI state
    const tempId = generateNegativeNumericId();
    const tempCreatedAt = getNowISODateString();
    
    const newLeadOptimistic = {
      id: tempId,
      created_at: tempCreatedAt,
      date: tempCreatedAt.split('T')[0],
      ...leadData
    };

    // Optimistic UI state update
    setLeads(prev => [newLeadOptimistic, ...prev]);
    logActivity(`Created new lead ${newLeadOptimistic.name} (${newLeadOptimistic.company})`, "lead");
    addNotification(
      "New lead added", 
      `${newLeadOptimistic.name} from ${newLeadOptimistic.company} was added via ${newLeadOptimistic.source || 'Other'}.`, 
      "info"
    );

    // If added as Won directly, promote immediately
    if (newLeadOptimistic.status === "Won") {
      promoteToCustomer(newLeadOptimistic);
    }

    if (!supabase) {
      // LocalStorage mode: convert temp ID to standard string format and update
      const finalMockId = generateUniqueId('lead');
      setLeads(prev => prev.map(l => l.id === tempId ? { ...l, id: finalMockId } : l));
      return;
    }

    try {
      // Omit properties not present in Supabase table schema
      const { name, company, email, status, value, source, owner } = leadData;
      const insertData = { name, company, email, status, value, source, owner, user_id: user?.id };

      const { data, error } = await supabase
        .from('leads')
        .insert([insertData])
        .select('id, created_at, name, email, company, status, value, source, owner');

      if (error) throw error;

      if (data && data.length > 0) {
        const savedLead = {
          ...data[0],
          date: data[0].created_at ? data[0].created_at.split('T')[0] : new Date().toISOString().split('T')[0]
        };
        // Resolve temp ID with final database ID and timestamp details
        setLeads(prev => prev.map(l => l.id === tempId ? savedLead : l));
      }
    } catch (err) {
      console.error("Supabase add lead failed:", err);
      addNotification(
        "Database Sync Error",
        `Supabase lead insert failed: ${err.message || err.toString()}`,
        "error"
      );
      // Roll back the optimistic addition
      setLeads(prev => prev.filter(l => l.id !== tempId));
    }
  };

  const updateLead = async (leadId, updatedData) => {
    let originalLead = null;

    // Optimistic UI state update
    setLeads(prev => {
      const existingLead = prev.find(l => l.id === leadId);
      if (existingLead) {
        originalLead = { ...existingLead };
      }
      const wasWon = existingLead?.status === "Won";
      const isWonNow = updatedData.status === "Won";

      // If status changed to Won, convert to customer
      if (!wasWon && isWonNow) {
        promoteToCustomer({ ...existingLead, ...updatedData });
      }

      return prev.map(lead => {
        if (lead.id === leadId) {
          return { ...lead, ...updatedData };
        }
        return lead;
      });
    });
    
    const leadName = updatedData.name || "Lead";
    logActivity(`Updated details for lead: ${leadName}`, "lead");

    if (!supabase) {
      return;
    }

    try {
      // Filter out properties not in user's schema (date, phone, notes, created_at, id)
      const { name, company, email, status, value, source, owner } = updatedData;
      const patchData = {};
      if (name !== undefined) patchData.name = name;
      if (company !== undefined) patchData.company = company;
      if (email !== undefined) patchData.email = email;
      if (status !== undefined) patchData.status = status;
      if (value !== undefined) patchData.value = value;
      if (source !== undefined) patchData.source = source;
      if (owner !== undefined) patchData.owner = owner;

      const { error } = await supabase
        .from('leads')
        .update(patchData)
        .eq('id', leadId);

      if (error) throw error;
    } catch (err) {
      console.error("Supabase update lead failed:", err);
      addNotification(
        "Database Sync Error",
        `Supabase lead update failed: ${err.message || err.toString()}`,
        "error"
      );
      // Roll back update
      if (originalLead) {
        setLeads(prev => prev.map(l => l.id === leadId ? originalLead : l));
      }
    }
  };

  const deleteLead = async (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    const originalLeads = [...leads];

    // Optimistic UI state update
    setLeads(prev => prev.filter(l => l.id !== leadId));
    if (lead) {
      logActivity(`Deleted lead: ${lead.name} (${lead.company})`, "lead");
    }

    if (!supabase) {
      return;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
    } catch (err) {
      console.error("Supabase delete lead failed:", err);
      addNotification(
        "Database Sync Error",
        `Supabase lead deletion failed: ${err.message || err.toString()}`,
        "error"
      );
      // Roll back deletion
      setLeads(originalLeads);
    }
  };

  // Helper to promote Won Leads to Customer profiles
  const promoteToCustomer = async (lead) => {
    // Check if customer already exists (based on email)
    const exists = customers.some(c => c.email.toLowerCase() === lead.email.toLowerCase());
    if (exists) return;

    // Determine segment based on value
    let segment = "SMB";
    if (lead.value >= 25000) segment = "Enterprise";
    else if (lead.value >= 7500) segment = "Mid-Market";

    const tempId = generateNegativeNumericId();
    const tempCreatedAt = getNowISODateString();
    
    // Description for interaction history entry
    const initialLogDesc = `Lead converted to customer. Initial sales deal closed successfully by ${lead.owner || 'Unassigned'} for $${lead.value.toLocaleString()}.`;
    
    const initialLog = {
      type: "Follow-up History",
      description: initialLogDesc,
      timestamp: tempCreatedAt.replace('T', ' ').substring(0, 16)
    };

    const newCustomerOptimistic = {
      id: tempId,
      created_at: tempCreatedAt,
      joinedDate: tempCreatedAt.split('T')[0],
      name: lead.name,
      company: lead.company,
      email: lead.email,
      segment,
      status: "Active",
      revenue: Number(lead.value) || 0,
      purchaseHistory: [],
      interactionHistory: [initialLog]
    };

    // Store the initial log entry into LocalStorage keyed by tempId
    localStorage.setItem(`velocity_interactions_${tempId}`, JSON.stringify([initialLog]));

    setCustomers(prev => [newCustomerOptimistic, ...prev]);
    logActivity(`Deal Won! Promoted lead ${lead.name} to Customer`, "deal");
    addNotification(
      "Deal won notification", 
      `Congratulations! ${lead.name} (${lead.company}) was promoted to Customer. Revenue: +$${lead.value.toLocaleString()}`, 
      "success"
    );

    if (!supabase) {
      const finalMockId = generateUniqueId('cust');
      setCustomers(prev => prev.map(c => {
        if (c.id === tempId) {
          localStorage.setItem(`velocity_interactions_${finalMockId}`, JSON.stringify([initialLog]));
          localStorage.removeItem(`velocity_interactions_${tempId}`);
          return { 
            ...c, 
            id: finalMockId,
            purchaseHistory: [
              {
                id: generateUniqueId('p'),
                product: "Nexus Premium Deal",
                amount: lead.value,
                date: tempCreatedAt.split('T')[0]
              }
            ]
          };
        }
        return c;
      }));
      return;
    }

    try {
      const insertData = {
        name: lead.name,
        company: lead.company,
        email: lead.email,
        revenue: Number(lead.value) || 0,
        status: "Active",
        segment,
        user_id: user?.id
      };

      const { data, error } = await supabase
        .from('customers')
        .insert([insertData])
        .select('id, created_at, name, email, company, revenue, status, segment');

      if (error) throw error;

      if (data && data.length > 0) {
        const savedCust = {
          ...data[0],
          revenue: Number(data[0].revenue) || 0,
          joinedDate: data[0].created_at ? data[0].created_at.split('T')[0] : getNowISODateString().split('T')[0],
          purchaseHistory: [],
          interactionHistory: [initialLog]
        };
        // Move the interactions cache to the new database ID key
        localStorage.setItem(`velocity_interactions_${data[0].id}`, JSON.stringify([initialLog]));
        localStorage.removeItem(`velocity_interactions_${tempId}`);

        setCustomers(prev => prev.map(c => c.id === tempId ? savedCust : c));
      }
    } catch (err) {
      console.error("Supabase promote to customer failed:", err);
      addNotification(
        "Database Sync Error",
        `Supabase customer promotion failed: ${err.message || err.toString()}`,
        "error"
      );
      // Rollback
      setCustomers(prev => prev.filter(c => c.id !== tempId));
    }
  };

  // CUSTOMER ACTIONS
  const addCustomer = async (customerData) => {
    const tempId = generateNegativeNumericId();
    const tempCreatedAt = getNowISODateString();
    
    // Optimistically save owner to LocalStorage
    if (customerData.owner) {
      localStorage.setItem(`velocity_customer_owner_${tempId}`, customerData.owner);
    }
    
    const newCustomerOptimistic = {
      id: tempId,
      created_at: tempCreatedAt,
      joinedDate: tempCreatedAt.split('T')[0],
      purchaseHistory: [],
      interactionHistory: [],
      ...customerData,
      revenue: Number(customerData.revenue) || 0,
      owner: customerData.owner || 'Alex Rivera'
    };

    setCustomers(prev => [newCustomerOptimistic, ...prev]);
    logActivity(`Added customer ${newCustomerOptimistic.name} (${newCustomerOptimistic.company})`, "deal");
    addNotification(
      "Customer added",
      `${newCustomerOptimistic.name} from ${newCustomerOptimistic.company} was added as a customer.`,
      "success"
    );

    if (!supabase) {
      const finalMockId = generateUniqueId('cust');
      if (customerData.owner) {
        localStorage.setItem(`velocity_customer_owner_${finalMockId}`, customerData.owner);
        localStorage.removeItem(`velocity_customer_owner_${tempId}`);
      }
      setCustomers(prev => prev.map(c => c.id === tempId ? { ...c, id: finalMockId } : c));
      return;
    }

    try {
      const { name, email, company, revenue, status, segment } = customerData;
      const insertData = { name, email, company, revenue: Number(revenue) || 0, status, segment, user_id: user?.id };

      const { data, error } = await supabase
         .from('customers')
         .insert([insertData])
         .select('id, created_at, name, email, company, revenue, status, segment');

      if (error) throw error;

      if (data && data.length > 0) {
        const savedCust = {
          ...data[0],
          revenue: Number(data[0].revenue) || 0,
          joinedDate: data[0].created_at ? data[0].created_at.split('T')[0] : getNowISODateString().split('T')[0],
          owner: customerData.owner || 'Alex Rivera',
          purchaseHistory: [],
          interactionHistory: []
        };
        if (customerData.owner) {
          localStorage.setItem(`velocity_customer_owner_${data[0].id}`, customerData.owner);
          localStorage.removeItem(`velocity_customer_owner_${tempId}`);
        }
        setCustomers(prev => prev.map(c => c.id === tempId ? savedCust : c));
      }
    } catch (err) {
      console.error("Supabase add customer failed:", err);
      addNotification(
        "Database Sync Error",
        `Supabase customer insert failed: ${err.message || err.toString()}`,
        "error"
      );
      // Roll back
      setCustomers(prev => prev.filter(c => c.id !== tempId));
    }
  };

  const updateCustomer = async (customerId, updatedData) => {
    let originalCustomer = null;

    if (updatedData.owner !== undefined) {
      localStorage.setItem(`velocity_customer_owner_${customerId}`, updatedData.owner);
    }

    setCustomers(prev => {
      const existingCust = prev.find(c => c.id === customerId);
      if (existingCust) {
        originalCustomer = { ...existingCust };
      }
      return prev.map(c => {
        if (c.id === customerId) {
          return { 
            ...c, 
            ...updatedData, 
            revenue: updatedData.revenue !== undefined ? Number(updatedData.revenue) || 0 : c.revenue 
          };
        }
        return c;
      });
    });

    const custName = updatedData.name || "Customer";
    logActivity(`Updated details for customer: ${custName}`, "deal");

    if (!supabase) {
      return;
    }

    try {
      const { name, email, company, revenue, status, segment } = updatedData;
      const patchData = {};
      if (name !== undefined) patchData.name = name;
      if (email !== undefined) patchData.email = email;
      if (company !== undefined) patchData.company = company;
      if (revenue !== undefined) patchData.revenue = Number(revenue) || 0;
      if (status !== undefined) patchData.status = status;
      if (segment !== undefined) patchData.segment = segment;

      const { error } = await supabase
        .from('customers')
        .update(patchData)
        .eq('id', customerId);

      if (error) throw error;
    } catch (err) {
      console.error("Supabase update customer failed:", err);
      addNotification(
        "Database Sync Error",
        `Supabase customer update failed: ${err.message || err.toString()}`,
        "error"
      );
      if (originalCustomer) {
        setCustomers(prev => prev.map(c => c.id === customerId ? originalCustomer : c));
      }
    }
  };

  const deleteCustomer = async (customerId) => {
    const cust = customers.find(c => c.id === customerId);
    const originalCustomers = [...customers];

    setCustomers(prev => prev.filter(c => c.id !== customerId));
    if (cust) {
      logActivity(`Deleted customer: ${cust.name} (${cust.company})`, "deal");
    }

    if (!supabase) {
      return;
    }

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;
    } catch (err) {
      console.error("Supabase delete customer failed:", err);
      addNotification(
        "Database Sync Error",
        `Supabase customer deletion failed: ${err.message || err.toString()}`,
        "error"
      );
      setCustomers(originalCustomers);
    }
  };

  const addCustomerInteraction = (customerId, type, description) => {
    setCustomers(prev => prev.map(cust => {
      if (cust.id === customerId) {
        const newInteraction = {
          type,
          description,
          timestamp: getNowISODateString().replace('T', ' ').substring(0, 16)
        };
        const updatedHistory = [newInteraction, ...(cust.interactionHistory || [])];
        localStorage.setItem(`velocity_interactions_${customerId}`, JSON.stringify(updatedHistory));
        return {
          ...cust,
          interactionHistory: updatedHistory
        };
      }
      return cust;
    }));
    
    const cust = customers.find(c => c.id === customerId);
    logActivity(`Logged ${type} for customer ${cust ? cust.name : ''}`, "call");
  };

  // TASKS ACTIONS
  const addTask = async (taskData) => {
    const tempId = generateNegativeNumericId();
    const tempCreatedAt = getNowISODateString();
    
    const newTaskOptimistic = {
      id: tempId,
      created_at: tempCreatedAt,
      status: "Pending",
      assignedTo: "Alex Rivera", // Default assignment
      ...taskData
    };

    setTasks(prev => [newTaskOptimistic, ...prev]);
    logActivity(`Added task: "${newTaskOptimistic.title}"`, "task");
    
    // Check if task is due today to trigger an alert
    const todayStr = getNowISODateString().split('T')[0];
    if (newTaskOptimistic.dueDate === todayStr) {
      addNotification("Task due today", `New task "${newTaskOptimistic.title}" is due today.`, "warning");
    }

    if (!supabase) {
      const finalMockId = generateUniqueId('task');
      setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: finalMockId } : t));
      return;
    }

    try {
      const { title, dueDate, priority, assignedTo } = taskData;
      const insertData = {
        title,
        due_date: dueDate,
        priority,
        assignee: assignedTo || "Alex Rivera",
        status: "Pending",
        user_id: user?.id
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([insertData])
        .select('id, created_at, title, priority, status, due_date, assignee');

      if (error) throw error;

      if (data && data.length > 0) {
        const savedTask = {
          id: data[0].id,
          created_at: data[0].created_at,
          title: data[0].title,
          priority: data[0].priority,
          status: data[0].status,
          dueDate: data[0].due_date ? data[0].due_date : getNowISODateString().split('T')[0],
          assignedTo: data[0].assignee ? data[0].assignee : "Unassigned",
          leadName: ""
        };
        setTasks(prev => prev.map(t => t.id === tempId ? savedTask : t));
      }
    } catch (err) {
      console.error("Supabase add task failed:", err);
      addNotification(
        "Database Sync Error",
        `Supabase task insert failed: ${err.message || err.toString()}`,
        "error"
      );
      // Rollback
      setTasks(prev => prev.filter(t => t.id !== tempId));
    }
  };

  const toggleTaskStatus = async (taskId) => {
    let originalTask = null;
    let targetStatus = "Pending";

    setTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (task) {
        originalTask = { ...task };
        targetStatus = task.status === "Pending" ? "Completed" : "Pending";
      }
      return prev.map(t => {
        if (t.id === taskId) {
          logActivity(`${targetStatus === "Completed" ? "Completed" : "Reopened"} task: "${t.title}"`, "task");
          return { ...t, status: targetStatus };
        }
        return t;
      });
    });

    if (!supabase) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: targetStatus })
        .eq('id', taskId);

      if (error) throw error;
    } catch (err) {
      console.error("Supabase toggle task status failed:", err);
      addNotification(
        "Database Sync Error",
        `Supabase task status update failed: ${err.message || err.toString()}`,
        "error"
      );
      // Rollback
      if (originalTask) {
        setTasks(prev => prev.map(t => t.id === taskId ? originalTask : t));
      }
    }
  };

  const deleteTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const originalTasks = [...tasks];

    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (task) {
      logActivity(`Deleted task: "${task.title}"`, "task");
    }

    if (!supabase) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    } catch (err) {
      console.error("Supabase delete task failed:", err);
      addNotification(
        "Database Sync Error",
        `Supabase task deletion failed: ${err.message || err.toString()}`,
        "error"
      );
      // Rollback
      setTasks(originalTasks);
    }
  };

  // NOTIFICATION ACTIONS
  const markNotifAsRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <CRMContext.Provider value={{
      isAuthenticated,
      isAuthLoading,
      user,
      login,
      signup,
      logout,
      isOnboarded,
      completeOnboarding,
      loadDemoData,
      clearWorkspaceData,
      activeView,
      setActiveView,
      leads,
      addLead,
      updateLead,
      deleteLead,
      customers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      isCustomersLoading,
      customersError,
      addCustomerInteraction,
      tasks,
      addTask,
      toggleTaskStatus,
      deleteTask,
      isTasksLoading,
      tasksError,
      notifications,
      markNotifAsRead,
      clearAllNotifications,
      activities,
      heatmapActivities,
      logActivity
    }}>
      {children}
    </CRMContext.Provider>
  );
};
