export type TimetableType =
  | "LESSON"
  | "EVENT"
  | "ACTIVITY"
  | "SUBSTITUTION"
  | "EXAM"
  | "ASSESSMENT";

export interface Timetable {
  startDate: string;
  startTime: string;
  endTime: string;
  timetableItems: TimetableItem[];
  warnings: any[];
  daysInWeek: number;
  presence: any;
  absences: any[];
  schools: School[];
}

export interface TimetableItem {
  id: any;
  startTime: string;
  endTime: string;
  date: string;
  tenant: number;
  academicYearId: any;
  entityId: number;
  label: string;
  type: TimetableType;
  originalType?: string;
  locations: string[];
  mainRoom?: string;
  additionalRooms?: any[];
  colour: string;
  teachingGroupId: number | null;
  blockName: any;
  blockId: any;
  blockDescription: any;
  subject?: string;
  subjectCode?: string;
  assessment: any;
  hasFutureAbsence: boolean;
  teacherName?: string;
  teachers: string[] | null;
  extraInfo: any;
  periodNumberInDay: any;
}

export interface School {
  tenant: number;
  name: string;
  isMainSchool: boolean;
}
