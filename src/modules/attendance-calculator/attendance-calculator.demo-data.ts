import type { AttendanceSubjectGroup } from "../../api/types/attendance";
import type { AcademicYear } from "../../api/types/calendar";
import type { TimetableItem } from "../../api/types/timetable";
import {
  type AttendanceCalculatorState,
  lessonDurationHours,
  type SelectableLesson,
} from "./attendance-calculator.helpers";

const demoYear: AcademicYear = {
  id: 20252026,
  version: 1,
  tenant: 1,
  code: "20252026",
  name: "Skoleåret 2025/2026",
  studentStartDate: new Date(2025, 7, 18),
  currentYear: true,
  terms: [
    {
      id: 1,
      version: 1,
      startDate: new Date(2025, 7, 18),
      endDate: new Date(2026, 0, 16),
      code: "H1",
      name: "Termin 1",
      term: "TERM1",
      current: false,
    },
    {
      id: 2,
      version: 1,
      startDate: new Date(2026, 0, 19),
      endDate: new Date(2026, 5, 19),
      code: "H2",
      name: "Termin 2",
      term: "TERM2",
      current: true,
    },
  ],
  year: 2026,
  daysInCycle: 5,
  editable: false,
  startDate: new Date(2025, 7, 18),
  endDate: new Date(2026, 5, 19),
};

const groups: AttendanceSubjectGroup[] = [
  subjectGroup("MAT1023", "Matematikk 2P", "Matematikk", 112, 4.5),
  subjectGroup("NOR1267", "Norsk hovedmål", "Norsk", 112, 9.5),
  subjectGroup("ITK2002", "Informasjonsteknologi 1", "IT", 84, 2),
  subjectGroup("ENG1007", "Engelsk", "Engelsk", 84, 5),
  subjectGroup("KRO1006", "Kroppsøving", "Gym", 56, 5),
];

export function createAttendanceCalculatorDemoState(): AttendanceCalculatorState {
  return {
    currentYear: demoYear,
    groups,
    lessons: [
      lesson(1, 0, "08:15", "09:45", "MAT1023", "Matematikk", "#d7ecff"),
      lesson(2, 0, "10:00", "11:30", "NOR1267", "Norsk", "#ffe0e7"),
      lesson(3, 0, "12:15", "13:45", "ITK2002", "IT", "#dff7e8"),
      lesson(4, 1, "08:15", "09:45", "ENG1007", "Engelsk", "#fff1c2"),
      lesson(5, 1, "10:00", "11:30", "KRO1006", "Gym", "#e8ddff"),
      lesson(6, 1, "12:15", "13:45", "MAT1023", "Matematikk", "#d7ecff"),
      lesson(7, 2, "08:15", "10:00", "ITK2002", "IT", "#dff7e8"),
      lesson(8, 2, "10:15", "11:45", "NOR1267", "Norsk", "#ffe0e7"),
      lesson(9, 2, "12:15", "13:45", "ENG1007", "Engelsk", "#fff1c2"),
      lesson(10, 3, "08:15", "09:45", "MAT1023", "Matematikk", "#d7ecff"),
      lesson(11, 3, "10:00", "11:30", "NOR1267", "Norsk", "#ffe0e7"),
      lesson(12, 3, "12:15", "13:45", "KRO1006", "Gym", "#e8ddff"),
      lesson(13, 4, "08:15", "09:45", "ITK2002", "IT", "#dff7e8"),
      lesson(14, 4, "10:00", "11:30", "ENG1007", "Engelsk", "#fff1c2"),
    ],
  };
}

function subjectGroup(
  subjectCode: string,
  subjectName: string,
  subjectShortName: string,
  totalScheduledHours: number,
  totalAbsence: number,
): AttendanceSubjectGroup {
  const absencePercentage = (totalAbsence / totalScheduledHours) * 100;

  return {
    subjectGroupId: Number(subjectCode.replace(/\D/g, "")),
    learnerPersonalId: 1,
    subjectGroupName: `2ITA/${subjectCode}/1`,
    subjectCode,
    subjectName,
    subjectShortName,
    warningLimit: 8,
    defaultLimit: 10,
    schoolName: "Inskewl videregående skole",
    mainSchool: true,
    learnerInTeachingGroup: true,
    externalSchool: false,
    yearlyHours: totalScheduledHours,
    scheduledHoursTermOne: totalScheduledHours / 2,
    totalScheduledHours,
    totalAbsenceTermOne: totalAbsence / 2,
    totalAbsenceTermTwo: totalAbsence / 2,
    totalAbsence,
    absencePercentageTermOne: absencePercentage,
    absencePercentageTermOneAndTwo: absencePercentage,
    threshold: {
      absenceLimitExceededLast: null,
      remainingPercentage: Math.max(0, 10 - absencePercentage),
    },
  };
}

function lesson(
  id: number,
  dayOffset: number,
  startTime: string,
  endTime: string,
  subjectCode: string,
  subject: string,
  colour: string,
): SelectableLesson {
  const item: TimetableItem = {
    id,
    startTime,
    endTime,
    date: demoWeekday(dayOffset),
    tenant: 1,
    academicYearId: demoYear.id,
    entityId: 1000 + id,
    label: `2ITA/${subjectCode}/1`,
    type: "LESSON",
    originalType: null,
    locations: ["Demo"],
    mainRoom: "D-101",
    additionalRooms: [],
    colour,
    teachingGroupId: 2000 + id,
    blockName: null,
    blockId: null,
    blockDescription: null,
    subject,
    subjectCode,
    assessment: null,
    hasFutureAbsence: false,
    teacherName: "Demo Lærer",
    teachers: ["Demo Lærer"],
    extraInfo: null,
    periodNumberInDay: null,
  };

  return {
    item,
    durationHours: lessonDurationHours(item),
    selected: false,
  };
}

function demoWeekday(dayOffset: number): Date {
  return new Date(2026, 3, 20 + dayOffset);
}
