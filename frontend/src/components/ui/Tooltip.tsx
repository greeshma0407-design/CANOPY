import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top'
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            [position === 'top' ? 'bottom' : 'top']: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: position === 'top' ? '8px' : 0,
            marginTop: position === 'bottom' ? '8px' : 0,
            backgroundColor: 'var(--card-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.4rem 0.65rem',
            fontSize: '0.75rem',
            lineHeight: 1.3,
            whiteSpace: 'normal',
            maxWidth: '240px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
            zIndex: 1100,
            pointerEvents: 'none'
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
