import type { AttendanceCode } from "../../api/types/attendance";
import { startOfWeek } from "../../utils/time";
import {
  type AttendanceCalculatorState,
  attendanceCodeCountsTowardsLimit,
  lessonDurationHours,
  type SelectableLesson,
} from "./attendance-calculator.helpers";
import type {
  CalcAcademicYear,
  CalcSubjectGroup,
  CalcTimetableItem,
} from "./attendance-calculator.schemas";

const demoYear: CalcAcademicYear = {
  id: 20252026,
  name: "Skoleåret 2025/2026",
  currentYear: true,
};

const groups: CalcSubjectGroup[] = [
  subjectGroup("MAT1023", "Matematikk 2P", "Matematikk", 112, 112.7, 4.5),
  subjectGroup("NOR1267", "Norsk hovedmål", "Norsk", 112, 112.7, 9.5),
  subjectGroup("ITK2002", "Informasjonsteknologi 1", "IT", 84, 84.5, 2),
  subjectGroup("ENG1007", "Engelsk", "Engelsk", 84, 84.3, 5),
  subjectGroup("KRO1006", "Kroppsøving", "Gym", 56, 56.4, 5),
];

export function createAttendanceCalculatorDemoState(
  week: Date = new Date(),
): AttendanceCalculatorState {
  const selectedWeek = startOfWeek(week);
  const demoLesson = (
    id: number,
    dayOffset: number,
    startTime: string,
    endTime: string,
    subjectCode: string,
    subject: string,
    colour: string,
    attendance?: {
      code: AttendanceCode;
      description: string;
    },
  ) =>
    lesson(
      id,
      selectedWeek,
      dayOffset,
      startTime,
      endTime,
      subjectCode,
      subject,
      colour,
      attendance,
    );

  return {
    currentYear: demoYear,
    groups,
    selectedWeek,
    lessons: [
      demoLesson(1, 0, "08:15", "09:45", "MAT1023", "Matematikk", "#d7ecff"),
      demoLesson(2, 0, "10:00", "11:30", "NOR1267", "Norsk", "#ffe0e7", {
        code: "D",
        description: "Dokumentert fravær",
      }),
      demoLesson(3, 0, "12:15", "13:45", "ITK2002", "IT", "#dff7e8"),
      demoLesson(4, 1, "08:15", "09:45", "ENG1007", "Engelsk", "#fff1c2"),
      demoLesson(5, 1, "10:00", "11:30", "KRO1006", "Gym", "#e8ddff"),
      demoLesson(6, 1, "12:15", "13:45", "MAT1023", "Matematikk", "#d7ecff"),
      demoLesson(7, 2, "08:15", "10:00", "ITK2002", "IT", "#dff7e8"),
      demoLesson(8, 2, "10:15", "11:45", "NOR1267", "Norsk", "#ffe0e7", {
        code: "X",
        description: "Udokumentert fravær",
      }),
      demoLesson(9, 2, "12:15", "13:45", "ENG1007", "Engelsk", "#fff1c2"),
      demoLesson(10, 3, "08:15", "09:45", "MAT1023", "Matematikk", "#d7ecff"),
      demoLesson(11, 3, "10:00", "11:30", "NOR1267", "Norsk", "#ffe0e7"),
      demoLesson(12, 3, "12:15", "13:45", "KRO1006", "Gym", "#e8ddff"),
      demoLesson(13, 4, "08:15", "09:45", "ITK2002", "IT", "#dff7e8"),
      demoLesson(14, 4, "10:00", "11:30", "ENG1007", "Engelsk", "#fff1c2"),
    ],
  };
}

function subjectGroup(
  subjectCode: string,
  subjectName: string,
  subjectShortName: string,
  yearlyHours: number,
  totalScheduledHours: number,
  totalAbsence: number,
): CalcSubjectGroup {
  return {
    subjectGroupId: Number(subjectCode.replace(/\D/g, "")),
    subjectCode,
    subjectName,
    subjectShortName,
    warningLimit: 8,
    defaultLimit: 10,
    yearlyHours,
    totalScheduledHours,
    totalAbsence,
  };
}

function lesson(
  id: number,
  weekStart: Date,
  dayOffset: number,
  startTime: string,
  endTime: string,
  subjectCode: string,
  subject: string,
  colour: string,
  attendance?: {
    code: AttendanceCode;
    description: string;
  },
): SelectableLesson {
  const item: CalcTimetableItem = {
    id,
    startTime,
    endTime,
    date: demoWeekday(weekStart, dayOffset),
    label: `2ITA/${subjectCode}/1`,
    type: "LESSON",
    originalType: null,
    colour,
    teachingGroupId: 2000 + id,
    subject,
    subjectCode,
  };

  return {
    item,
    durationHours: lessonDurationHours(item),
    selected: false,
    attendanceCode: attendance?.code ?? null,
    attendanceCodeDescription: attendance?.description ?? null,
    registeredAttendance: attendance != null,
    countsTowardsLimit: attendanceCodeCountsTowardsLimit(attendance?.code),
  };
}

function demoWeekday(weekStart: Date, dayOffset: number): Date {
  return new Date(
    weekStart.getFullYear(),
    weekStart.getMonth(),
    weekStart.getDate() + dayOffset,
  );
}
