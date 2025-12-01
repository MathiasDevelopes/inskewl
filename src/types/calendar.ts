export interface AcademicYear {
  id: number;
  version: number;
  tenant: number;
  code: string;
  name: string;
  studentStartDate: string;
  currentYear: boolean;
  terms: Term[];
  year: number;
  daysInCycle: number;
  editable: boolean;
  endDate: string;
  startDate: string;
}

export interface Term {
  id: number;
  version: number;
  startDate: string;
  endDate: string;
  code: string;
  name: string;
  term: string;
  current: boolean;
}
