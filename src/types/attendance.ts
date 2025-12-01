export interface AttendanceSubjectGroup {
  subjectGroupId: number;
  learnerPersonalId: number;
  subjectGroupName: string;
  subjectCode: string;
  subjectName: string;
  subjectShortName: string;
  warningLimit: number;
  defaultLimit: number;
  schoolName: string;
  mainSchool: boolean;
  learnerInTeachingGroup: boolean;
  externalSchool: boolean;
  yearlyHours: number;
  scheduledHoursTermOne: number;
  totalScheduledHours: number;
  totalAbsenceTermOne: number;
  totalAbsenceTermTwo: number;
  totalAbsence: number;
  absencePercentageTermOne: number;
  absencePercentageTermOneAndTwo: number;
  threshold: Threshold;
}

export interface Threshold {
  absenceLimitExceededLast: any;
  remainingPercentage: number;
}
