import React, { useEffect, useState } from 'react';

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: number;
  bg?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, color, height = 6, bg }) => {
  const [w, setW] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setW(value));
    return () => cancelAnimationFrame(id);
  }, [value]);

  return (
    <div style={{
      height, background: bg || 'var(--bg)', borderRadius: height,
      overflow: 'hidden', width: '100%',
    }}>
      <div style={{
        height: '100%', width: `${w}%`,
        background: color || 'var(--primary)',
        borderRadius: height,
        transition: 'width 900ms cubic-bezier(.2,.8,.2,1)',
      }}/>
    </div>
  );
};
