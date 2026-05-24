import React from 'react';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  stroke?: number;
  style?: React.CSSProperties;
}

export const Icon: React.FC<IconProps> = ({ name, size = 22, color, stroke = 1.7, style }) => {
  const c = color || 'var(--text-primary)';
  const props = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: c, strokeWidth: stroke,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    style,
  };
  
  switch (name) {
    case 'home': return (<svg {...props}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg>);
    case 'target': return (<svg {...props}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.6" fill={c} stroke="none"/></svg>);
    case 'tasks': return (<svg {...props}><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/><circle cx="19" cy="18" r="2.2" stroke="var(--success)" fill="var(--success)"/></svg>);
    case 'user': return (<svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></svg>);
    case 'plus': return (<svg {...props}><path d="M12 5v14M5 12h14"/></svg>);
    case 'check': return (<svg {...props}><path d="M5 12.5 10 17.5 19 7.5"/></svg>);
    case 'flame': return (<svg {...props}><path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-2 1-4 2 1 2 2 3-4z"/></svg>);
    case 'calendar': return (<svg {...props}><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>);
    case 'chevron-right': return (<svg {...props}><path d="M9 5l7 7-7 7"/></svg>);
    case 'chevron-down': return (<svg {...props}><path d="M5 9l7 7 7-7"/></svg>);
    case 'arrow-left': return (<svg {...props}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>);
    case 'more': return (<svg {...props}><circle cx="6" cy="12" r="1.4" fill={c} stroke="none"/><circle cx="12" cy="12" r="1.4" fill={c} stroke="none"/><circle cx="18" cy="12" r="1.4" fill={c} stroke="none"/></svg>);
    case 'search': return (<svg {...props}><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.5-3.5"/></svg>);
    case 'filter': return (<svg {...props}><path d="M4 5h16M7 12h10M10 19h4"/></svg>);
    case 'edit': return (<svg {...props}><path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="m14 6 4 4"/></svg>);
    case 'clock': return (<svg {...props}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>);
    case 'archive': return (<svg {...props}><rect x="3.5" y="4.5" width="17" height="4" rx="1"/><path d="M5 8.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V8.5"/><path d="M10 13h4"/></svg>);
    case 'sparkle': return (<svg {...props}><path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4z"/></svg>);
    case 'link': return (<svg {...props}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 1 0-5.7-5.7L11.5 7"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.7L12.5 17"/></svg>);
    case 'note': return (<svg {...props}><path d="M5 4h11l4 4v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M15 4v5h5"/><path d="M8 13h8M8 17h5"/></svg>);
    case 'trend': return (<svg {...props}><path d="M4 17l5-5 4 4 7-8"/><path d="M14 8h6v6"/></svg>);
    case 'tag': return (<svg {...props}><path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.5" cy="7.5" r="1.2" fill={c} stroke="none"/></svg>);
    case 'x': return (<svg {...props}><path d="M6 6l12 12M18 6 6 18"/></svg>);
    case 'star': return (<svg {...props}><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>);
    case 'menu': return (<svg {...props}><path d="M3 12h18M3 6h18M3 18h18"/></svg>);
    default: return null;
  }
};
