// Shared types and mock data for attendance view components

export interface Student {
  id: number;
  sno: number;
  rollNo: string;
  name: string;
  batch: string;
  period1: string;
  period2: string;
  period3: string;
  period4: string;
  period5: string;
}

export const mockStudents: Student[] = [
  {
    id: 1, sno: 1, rollNo: '2021001', name: 'John Doe', batch: 'A',
    period1: 'P', period2: 'P', period3: 'P', period4: 'P', period5: 'P',
  },
  {
    id: 2, sno: 2, rollNo: '2021002', name: 'Jane Smith', batch: 'A',
    period1: 'P', period2: 'P', period3: 'A', period4: 'P', period5: 'P',
  },
  {
    id: 3, sno: 3, rollNo: '2021003', name: 'Mike Johnson', batch: 'B',
    period1: 'P', period2: 'P', period3: 'P', period4: 'P', period5: 'P',
  },
  {
    id: 4, sno: 4, rollNo: '2021004', name: 'Sarah Williams', batch: 'B',
    period1: 'P', period2: 'OD', period3: 'OD', period4: 'OD', period5: 'OD',
  },
  {
    id: 5, sno: 5, rollNo: '2021005', name: 'Tom Brown', batch: 'C',
    period1: 'P', period2: 'P', period3: 'IL', period4: 'P', period5: 'P',
  },
  {
    id: 6, sno: 6, rollNo: '2021006', name: 'Emma Davis', batch: 'C',
    period1: 'A', period2: 'A', period3: 'A', period4: 'P', period5: 'P',
  },
];
