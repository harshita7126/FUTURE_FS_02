import { useState, useEffect } from 'react';
import { ResponsiveContainer } from 'recharts';

export const SafeResponsiveContainer = ({ children, ...props }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: '100%', height: '100%', minHeight: '200px' }} />;
  }

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '100%', position: 'relative' }}>
      <ResponsiveContainer 
        width="100%" 
        height="100%" 
        {...props}
      >
        {children}
      </ResponsiveContainer>
    </div>
  );
};

