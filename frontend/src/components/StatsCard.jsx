import React from 'react';

export const StatsCard = ({ title, value, subtext, icon: Icon, color = '#6366f1' }) => {
  return (
    <div className="glass-card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
      {/* Top subtle color indicator line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
            {value}
          </div>
          {subtext && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
              {subtext}
            </div>
          )}
        </div>

        {Icon && (
          <div style={{ 
            background: `${color}18`, 
            padding: '0.7rem', 
            borderRadius: 'var(--radius-sm)', 
            display: 'flex',
            border: `1px solid ${color}30`
          }}>
            <Icon size={22} color={color} />
          </div>
        )}
      </div>
    </div>
  );
};
