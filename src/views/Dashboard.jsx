import { useCRM } from '../context/CRMContext';
import { StatCard } from '../components/StatCard';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { SafeResponsiveContainer } from '../components/SafeResponsiveContainer';
import { Users, UserCheck, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  CartesianGrid 
} from 'recharts';

const EmptyState = ({ message = "No data available" }) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100%', 
    width: '100%', 
    minHeight: '200px',
    color: 'var(--text-muted)',
    gap: '8px'
  }}>
    <span style={{ fontSize: '13px', fontWeight: '500' }}>{message}</span>
    <span style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.7 }}>Add records to see analysis</span>
  </div>
);

export const Dashboard = () => {
  const { 
    leads, 
    customers, 
    tasks,
    activities, 
    isLeadsLoading, 
    isCustomersLoading, 
    isTasksLoading, 
    leadsError, 
    customersError, 
    tasksError 
  } = useCRM();

  // Metrics calculations
  const totalCustomers = customers.length;
  const activeLeads = leads.filter(l => l.status !== "Won" && l.status !== "Lost").length;
  
  const opportunitiesValue = leads
    .filter(l => l.status !== "Won" && l.status !== "Lost")
    .reduce((sum, l) => sum + l.value, 0);

  const totalWonRevenue = customers.reduce((sum, c) => {
    return sum + (Number(c.revenue) || 0);
  }, 0);

  // Helper to calculate MoM trend dynamically
  const calculateTrend = (items, dateField = 'created_at', valField = null) => {
    const thisMonth = [];
    const lastMonth = [];

    items.forEach(item => {
      const dateStr = item[dateField] || (item.joinedDate ? item.joinedDate : '');
      if (!dateStr) return;
      const d = new Date(dateStr);
      // This Month: June 2026 (Month is 0-indexed, so 5 is June)
      if (d.getFullYear() === 2026 && d.getMonth() === 5) {
        thisMonth.push(item);
      }
      // Last Month: May 2026 (Month is 4)
      else if (d.getFullYear() === 2026 && d.getMonth() === 4) {
        lastMonth.push(item);
      }
    });

    const thisMonthVal = valField 
      ? thisMonth.reduce((sum, item) => sum + (Number(item[valField]) || 0), 0)
      : thisMonth.length;
       
    const lastMonthVal = valField
      ? lastMonth.reduce((sum, item) => sum + (Number(item[valField]) || 0), 0)
      : lastMonth.length;

    // Safety boundary for zero value check MoM
    if (lastMonthVal === 0) {
      if (thisMonthVal === 0) {
        return "No Activity";
      }
      return valField ? "New" : "New This Month";
    }

    const pct = ((thisMonthVal - lastMonthVal) / lastMonthVal) * 100;
    return (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%";
  };

  const customerTrend = calculateTrend(customers, 'created_at');
  const activeLeadsTrend = calculateTrend(leads.filter(l => l.status !== "Won" && l.status !== "Lost"), 'created_at');
  const pipelineTrend = calculateTrend(leads.filter(l => l.status !== "Won" && l.status !== "Lost"), 'created_at', 'value');
  const revenueTrend = calculateTrend(customers, 'created_at', 'revenue');

  const getTrendType = (trendStr) => {
    if (trendStr === 'No Activity') return 'neutral';
    if (trendStr === 'New' || trendStr === 'New This Month') return 'info';
    if (trendStr.startsWith('-')) return 'negative';
    return 'positive';
  };

  // Recharts Chart 1: Revenue Timeline (actual monthly revenue timeline)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthlyRevenue = { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0 };
  
  customers.forEach(c => {
    const joined = c.joinedDate || (c.created_at ? c.created_at.split('T')[0] : '');
    if (joined) {
      const monthIdx = new Date(joined).getMonth(); // 0-11
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = monthNames[monthIdx];
      if (monthlyRevenue[monthName] !== undefined) {
        monthlyRevenue[monthName] += Number(c.revenue) || 0;
      }
    }
  });

  const activeMonths = Object.keys(monthlyRevenue).filter(m => monthlyRevenue[m] > 0);
  const isSingleMonthData = activeMonths.length === 1;

  let runningTotal = 0;
  const targets = { Jan: 40000, Feb: 45000, Mar: 50000, Apr: 55000, May: 60000, Jun: 70000 };
  const revenueHistoryData = months.map(m => {
    runningTotal += monthlyRevenue[m];
    return {
      name: m,
      revenue: runningTotal, // actual monthly cumulative revenue only
      targets: targets[m]
    };
  });

  // Recharts Chart 2: Sales Reps performance (counts of open deals) - dynamically calculated from actual lead ownership
  const repPerformanceMap = {};
  leads.forEach(l => {
    const owner = l.owner || 'Unassigned';
    if (!repPerformanceMap[owner]) {
      repPerformanceMap[owner] = { name: owner, deals: 0, value: 0 };
    }
    if (l.status !== 'Lost') {
      repPerformanceMap[owner].deals++;
      repPerformanceMap[owner].value += Number(l.value) || 0;
    }
  });

  const repPerformanceData = Object.values(repPerformanceMap).map(rep => ({
    name: rep.name,
    deals: rep.deals,
    value: rep.value / 1000
  }));

  // Segment breakdown
  const customersBySegment = customers.reduce((acc, c) => {
    acc[c.segment] = (acc[c.segment] || 0) + 1;
    return acc;
  }, {});

  // Lead status breakdown
  const leadsByStatus = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});

  // Tasks checklist counts
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;

  const isLoading = isLeadsLoading || isCustomersLoading || isTasksLoading;
  const hasError = leadsError || customersError || tasksError;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', width: '100%' }}>
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {hasError && (
        <div 
          className="glass-card animate-fade-in" 
          style={{ 
            padding: '16px', 
            backgroundColor: 'var(--error-bg)', 
            borderColor: 'var(--error)', 
            color: 'var(--error-text)',
            borderRadius: '12px' 
          }}
        >
          <p style={{ fontWeight: '600', fontSize: '14px' }}>
            Error loading dynamic metrics from Supabase. Displaying local data fallback if available.
          </p>
        </div>
      )}

      {/* 4 columns KPI counters grid */}
      <div className="dashboard-grid">
        <StatCard 
          title="Total Customers"
          value={totalCustomers}
          icon={<UserCheck size={20} />}
          trend={customerTrend}
          trendType={getTrendType(customerTrend)}
        />
        <StatCard 
          title="Active Opportunities"
          value={activeLeads}
          icon={<Users size={20} />}
          trend={activeLeadsTrend}
          trendType={getTrendType(activeLeadsTrend)}
        />
        <StatCard 
          title="Pipeline Value"
          value={opportunitiesValue}
          icon={<TrendingUp size={20} />}
          prefix="₹"
          trend={pipelineTrend}
          trendType={getTrendType(pipelineTrend)}
        />
        <StatCard 
          title="Closed Revenue"
          value={totalWonRevenue}
          icon={<DollarSign size={20} />}
          prefix="₹"
          trend={revenueTrend}
          trendType={getTrendType(revenueTrend)}
        />
      </div>

      {/* GitHub-style Heatmap row */}
      <div className="glass-card animate-fade-in" style={{ padding: '20px' }}>
        <ActivityHeatmap />
      </div>

      {/* Two charts side-by-side (responsive split) */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '24px'
        }}
      >
        {/* Revenue Growth Area Chart */}
        <div className="glass-card" style={{ height: '360px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Revenue Development</h4>
              {isSingleMonthData && (
                <span className="badge" style={{ fontSize: '10px', backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)' }}>
                  Historical trend unavailable
                </span>
              )}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Comparison of closed sales vs quarterly targets • Segments: Enterprise ({customersBySegment['Enterprise'] || 0}) • Mid-Market ({customersBySegment['Mid-Market'] || 0}) • SMB ({customersBySegment['SMB'] || 0})
            </span>
          </div>
          <div style={{ flex: 1, minHeight: '250px', height: '100%', width: '100%', position: 'relative' }}>
            {totalWonRevenue === 0 ? (
              <EmptyState message="No revenue data recorded" />
            ) : (
              <SafeResponsiveContainer>
                <AreaChart data={revenueHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip 
                    formatter={(value, name) => [
                      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value), 
                      name === 'revenue' ? 'Won Revenue' : 'Target'
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} name="Won Revenue (₹)" />
                </AreaChart>
              </SafeResponsiveContainer>
            )}
          </div>
        </div>

        {/* Rep Performance Bar Chart */}
        <div className="glass-card" style={{ height: '360px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Teammate Performance</h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Total active pipeline value per representative • Status: New ({leadsByStatus['New'] || 0}) • Contacted ({leadsByStatus['Contacted'] || 0}) • Qualified ({leadsByStatus['Qualified'] || 0}) • Proposal ({leadsByStatus['Proposal Sent'] || 0}) • Won ({leadsByStatus['Won'] || 0}) • Lost ({leadsByStatus['Lost'] || 0})
            </span>
          </div>
          <div style={{ flex: 1, minHeight: '250px', height: '100%', width: '100%', position: 'relative' }}>
            {repPerformanceData.every(r => r.deals === 0) ? (
              <EmptyState message="No active pipeline deals" />
            ) : (
              <SafeResponsiveContainer>
                <BarChart data={repPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip 
                    formatter={(value) => [
                      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value * 1000), 
                      'Pipeline Value'
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Pipeline (₹k)" />
                </BarChart>
              </SafeResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Activities Timeline and Recent Leads Split row */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px'
        }}
      >
        {/* Recent Activities Timeline */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 2' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Recent Activities Timeline</h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Real-time log of sales events and user actions • Tasks: {pendingTasks} Pending / {completedTasks} Completed
            </span>
          </div>

          <div className="timeline" style={{ marginTop: '8px' }}>
            {activities.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
                No activities logged yet.
              </p>
            ) : (
              activities.map(act => (
                <div key={act.id} className="timeline-item">
                  <div className="timeline-dot">
                    <Activity size={12} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{act.text}</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{act.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
