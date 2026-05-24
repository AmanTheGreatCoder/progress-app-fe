export function rruleLabel(repeatFlag: string): string {
  if (!repeatFlag) return "Recurring";
  const freqMatch = repeatFlag.match(/FREQ=([^;]+)/);
  if (!freqMatch) return "Recurring";
  
  const freq = freqMatch[1];
  const bydayMatch = repeatFlag.match(/BYDAY=([^;]+)/);
  
  if (freq === 'DAILY') return 'Daily';
  if (freq === 'WEEKLY') {
    if (bydayMatch) {
      const days = bydayMatch[1].split(',').map(d => {
        const map: Record<string, string> = { MO:'Mon', TU:'Tue', WE:'Wed', TH:'Thu', FR:'Fri', SA:'Sat', SU:'Sun' };
        return map[d] || d;
      });
      return days.join(', ');
    }
    return 'Weekly';
  }
  if (freq === 'MONTHLY') return 'Monthly';
  if (freq === 'YEARLY') return 'Yearly';
  
  return 'Recurring';
}
