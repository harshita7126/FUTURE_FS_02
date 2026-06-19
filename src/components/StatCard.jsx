import { useState, useEffect } from 'react';

export const StatCard = ({ title, value, icon, prefix = '', suffix = '', trend, trendType = 'positive' }) => {
  const [displayValue, setDisplayValue] = useState(() => {
    return typeof value !== 'number' ? value : 0;
  });

  useEffect(() => {
    // If value is not a number, no counter animation is needed
    if (typeof value !== 'number') {
      return;
    }

    let start = 0;
    const end = value;
    if (end === 0) return;

    // Calculate step increment duration based on target size
    const duration = 800; // ms
    const increment = end / (duration / 16); // ~60fps
    
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        clearInterval(timer);
        setDisplayValue(end);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    if (prefix === '₹') {
      return new Intl.NumberFormat('en-IN').format(num);
    }
    if (prefix === '$') {
      return new Intl.NumberFormat('en-US').format(num);
    }
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>{title}</span>
        <div style={{ color: 'var(--text-muted)' }}>{icon}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <h3 style={{ fontSize: '28px', fontWeight: '800', tracking: '-0.03em' }}>
          {prefix}{formatNumber(displayValue)}{suffix}
        </h3>
        {trend && (
          <span 
            className="badge" 
            style={{ 
              fontSize: '11px',
              backgroundColor: 
                trendType === 'positive' ? 'var(--success-bg)' :
                trendType === 'negative' ? 'var(--error-bg)' :
                trendType === 'info' ? 'var(--info-bg)' :
                'var(--border-color)',
              color: 
                trendType === 'positive' ? 'var(--success-text)' :
                trendType === 'negative' ? 'var(--error-text)' :
                trendType === 'info' ? 'var(--info-text)' :
                'var(--text-secondary)'
            }}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
