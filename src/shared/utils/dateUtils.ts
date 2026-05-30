export function getLocalYMD(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const TODAY = getLocalYMD();

export const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];


export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(d.getDate() + n);
  return x;
};

export const todayDate = () => new Date(TODAY + 'T00:00:00');
