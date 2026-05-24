export function getLocalYMD(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
export const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const addDays = (d: Date, n: number) => { 
  const x = new Date(d); 
  x.setDate(d.getDate() + n); 
  return x; 
};

// Default TODAY from GoalRow but can be accessed universally
import { TODAY } from '../components/ui/GoalRow';
export const todayDate = () => new Date(TODAY + 'T00:00:00');
