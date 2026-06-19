import { useCRM } from '../context/CRMContext';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie } from 'recharts';
import { SafeResponsiveContainer } from '../components/SafeResponsiveContainer';
import { TrendingUp, Award, AlertCircle, Sparkles } from 'lucide-react';

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

export const Analytics = () => {
  const { leads, customers } = useCRM();

  // Stage probability weights helper
  const getProbability = (status) => {
    switch (status) {
      case 'New': return 0.10;
      case 'Contacted': return 0.30;
      case 'Qualified': return 0.50;
      case 'Proposal Sent': return 0.70;
      case 'Won': return 1.00;
      case 'Lost': return 0.00;
      default: return 0.00;
    }
  };

  // Won Revenue (Total customer purchases)
  const wonRevenue = customers.reduce((sum, c) => {
    const custSum = c.revenue !== undefined 
      ? Number(c.revenue) || 0 
      : (c.purchaseHistory?.reduce((s, p) => s + p.amount, 0) || 0);
    return sum + custSum;
  }, 0);

  // Lost Revenue
  const lostRevenue = leads
    .filter(l => l.status === 'Lost')
    .reduce((sum, l) => sum + l.value, 0);

  // Expected Pipeline Revenue (Open opportunities weighted by probability)
  const openLeads = leads.filter(l => l.status !== 'Won' && l.status !== 'Lost');
  const expectedRevenue = openLeads.reduce((sum, l) => {
    return sum + (l.value * getProbability(l.status));
  }, 0);

  // Total Forecasted
  const totalForecastedRevenue = wonRevenue + expectedRevenue;

  // Funnel calculations: Lead progression count
  const pipelineStages = ["New", "Contacted", "Qualified", "Proposal Sent", "Won"];
  const funnelData = pipelineStages.map(stage => {
    // Cumulative: leads that reached at least this stage.
    // For mock demonstration, we filter directly or aggregate counts
    const count = leads.filter(l => {
      if (stage === 'New') return true; // everything was new once
      if (stage === 'Contacted') return l.status !== 'New';
      if (stage === 'Qualified') return l.status !== 'New' && l.status !== 'Contacted';
      if (stage === 'Proposal Sent') return l.status === 'Proposal Sent' || l.status === 'Won';
      return l.status === 'Won';
    }).length;
    
    return { name: stage, value: count };
  });

  // Lead source counts breakdown
  const sourceBreakdown = {
    "Website": 0,
    "LinkedIn": 0,
    "Referral": 0,
    "Email Campaign": 0,
    "Direct Contact": 0,
    "Other": 0
  };

  leads.forEach(l => {
    if (sourceBreakdown[l.source] !== undefined) {
      sourceBreakdown[l.source]++;
    } else {
      sourceBreakdown["Other"]++;
    }
  });

  // Filter out 0% categories to prevent label overlaps
  const sourceChartData = Object.keys(sourceBreakdown)
    .map(key => ({
      name: key,
      value: sourceBreakdown[key]
    }))
    .filter(item => item.value > 0);

  // Recharts colors
  const COLORS = ['#3b82f6', '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* 4 columns Forecast Metric card grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px'
        }}
      >
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Closed Won Revenue</span>
          <h3 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--success-text)' }}>
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(wonRevenue)}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <Award size={12} />
            <span>Contracted values in billing</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Weighted Pipeline Expected</span>
          <h3 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--primary)' }}>
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(expectedRevenue)}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <TrendingUp size={12} />
            <span>Based on stage probabilities</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Forecasted (Won + Expected)</span>
          <h3 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalForecastedRevenue)}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <Sparkles size={12} style={{ color: 'var(--accent)' }} />
            <span>Projected sales target total</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Lost Deals Revenue</span>
          <h3 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--error-text)' }}>
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(lostRevenue)}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <AlertCircle size={12} />
            <span>Missed opportunities sum</span>
          </div>
        </div>
      </div>

      {/* Probability Legend Alert Panel */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '12px 18px', 
          fontSize: '12px', 
          color: 'var(--text-secondary)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center'
        }}
      >
        <strong>Weighted Probability Model:</strong>
        <span>New Prospects: 10%</span>
        <span>Contacted: 30%</span>
        <span>Qualified: 50%</span>
        <span>Proposal Sent: 70%</span>
        <span>Won: 100%</span>
      </div>

      {/* Two columns charts row */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}
      >
        {/* Conversion Funnel Bar Chart */}
        <div className="glass-card" style={{ height: '340px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Sales Stage Conversion Funnel</h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cumulative lead flow transitions through pipeline stages</span>
          </div>
          <div style={{ flex: 1, minHeight: '240px', height: '100%', width: '100%', position: 'relative' }}>
            {leads.length === 0 ? (
              <EmptyState message="No leads in pipeline" />
            ) : (
              <SafeResponsiveContainer>
                <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={11} width={80} />
                  <Tooltip 
                    formatter={(value) => [`${value} leads`, 'Lead Count']}
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} name="Lead Count" />
                </BarChart>
              </SafeResponsiveContainer>
            )}
          </div>
        </div>

        {/* Lead Source Pie Chart */}
        <div className="glass-card" style={{ height: '340px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Lead Sourcing Distribution</h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Workspace opportunities segmented by customer source channels</span>
          </div>
          <div style={{ flex: 1, minHeight: '240px', height: '100%', width: '100%', position: 'relative' }}>
            {leads.length === 0 ? (
              <EmptyState message="No lead source data" />
            ) : (
              <SafeResponsiveContainer>
                <PieChart>
                  <Pie
                    data={sourceChartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {sourceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => {
                      const total = sourceChartData.reduce((sum, item) => sum + item.value, 0);
                      const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                      return [`${value} leads (${pct}%)`, 'Share'];
                    }}
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </SafeResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Forecasting Data Table Breakdown */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Weighted Lead Pipeline Breakdown</h4>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Detailed probability evaluation for all open opportunities</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Lead / Company</th>
                <th>Assigned Rep</th>
                <th>Current Stage</th>
                <th>Probability</th>
                <th>Contract Value</th>
                <th style={{ textAlign: 'right' }}>Weighted Expectancy</th>
              </tr>
            </thead>
            <tbody>
              {openLeads.map(l => {
                const prob = getProbability(l.status);
                const weightedVal = l.value * prob;
                return (
                  <tr key={l.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{l.company}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ref: {l.name}</span>
                      </div>
                    </td>
                    <td>{l.owner}</td>
                    <td>
                      <span className="badge badge-warning" style={{ fontSize: '11px' }}>{l.status}</span>
                    </td>
                    <td>
                      <strong>{(prob * 100).toFixed(0)}%</strong>
                    </td>
                    <td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(l.value)}</td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--primary)' }}>
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(weightedVal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
