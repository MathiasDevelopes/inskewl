export interface Behaviour {
  learnerName: string;
  learnerId: number;
  remarks: Remark[];
  remarksCountByType: RemarksCountByType;
  results: any[];
  currentSchoolIsMain: any;
}

export interface Remark {
  id: number;
  assessmentId: number;
  learnerId: number;
  teacherId: number;
  lessonId: number;
  teacherName: string;
  subjectCode: string;
  subjectName: string;
  dateTime: string;
  remark: string;
  remarkType: string;
  schoolInfo: SchoolInfo;
}

export interface SchoolInfo {
  tenant: number;
  schoolName: string;
  external: boolean;
}

export interface RemarksCountByType {}
