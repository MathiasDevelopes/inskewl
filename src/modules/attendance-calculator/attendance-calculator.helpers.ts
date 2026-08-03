import type { AttendanceCode } from "@inskewl/api-client";
import { timeToMinutes } from "../../utils/time";
import type {
  CalcAcademicYear,
  CalcSubjectGroup,
  CalcTimetableItem,
} from "./attendance-calculator.schemas";

export interface SubjectAbsenceInfo {
  subjectCode: string;
  subjectName: string;
  absenceBasisHours: number;
  totalAbsence: number;
  absencePercentage: number;
  warningLimit: number;
  defaultLimit: number;
  remainingHours: number;
  status: "ok" | "warning" | "exceeded";
}

export interface SelectableLesson {
  item: CalcTimetableItem;
  durationHours: number;
  selected: boolean;
  attendanceCode: AttendanceCode | null;
  attendanceCodeDescription: string | null;
  registeredAttendance: boolean;
  countsTowardsLimit: boolean;
}

export interface AttendanceCalculatorState {
  currentYear: CalcAcademicYear;
  groups: CalcSubjectGroup[];
  lessons: SelectableLesson[];
  selectedWeek: Date;
}

export function lessonDurationHours(item: CalcTimetableItem): number {
  return (timeToMinutes(item.endTime) - timeToMinutes(item.startTime)) / 60;
}

export function extractSubjectCodeFromLabel(
  label: string | null | undefined,
): string | null {
  if (!label) return null;
  const match = label.match(/([A-ZÆØÅ]{2,6}\d{4})/i);
  return match?.[1]?.toUpperCase() ?? null;
}

export function isLessonLike(item: CalcTimetableItem): boolean {
  return item.type === "LESSON" || (
    item.type === "SUBSTITUTION" &&
    item.originalType === "LESSON"
  );
}

export function resolveTimetableSubjectCode(item: CalcTimetableItem): string | null {
  return item.subjectCode ?? extractSubjectCodeFromLabel(item.label);
}

export function attendanceCodeCountsTowardsLimit(
  code: AttendanceCode | string | null | undefined,
): boolean {
  if (!code) return true;
  return code !== "D" && code !== "!" && code !== "R" && code !== "§";
}

export function absenceBasisHours(group: CalcSubjectGroup): number {
  return group.yearlyHours > 0 ? group.yearlyHours : group.totalScheduledHours;
}

export function isLessonInFuture(
  lesson: SelectableLesson,
  now: Date,
): boolean {
  const startMinutes = timeToMinutes(lesson.item.startTime);
  const lessonStart = new Date(
    lesson.item.date.getFullYear(),
    lesson.item.date.getMonth(),
    lesson.item.date.getDate(),
    Math.floor(startMinutes / 60),
    startMinutes % 60,
  );

  return lessonStart.getTime() > now.getTime();
}

export function canSimulateLessonAbsenceAt(
  lesson: SelectableLesson,
  now: Date,
): boolean {
  return !lesson.registeredAttendance && isLessonInFuture(lesson, now);
}

export function computeAbsenceInfo(
  group: CalcSubjectGroup,
  extraHours = 0,
): SubjectAbsenceInfo {
  const basisHours = absenceBasisHours(group);
  const totalAbsence = group.totalAbsence + extraHours;
  const absencePercentage =
    basisHours > 0
      ? (totalAbsence / basisHours) * 100
      : 0;
  const maxAbsenceHours =
    (group.defaultLimit / 100) * basisHours;
  const remainingHours = Math.max(0, maxAbsenceHours - totalAbsence);

  let status: SubjectAbsenceInfo["status"] = "ok";
  if (absencePercentage >= group.defaultLimit) {
    status = "exceeded";
  } else if (absencePercentage >= group.warningLimit) {
    status = "warning";
  }

  return {
    subjectCode: group.subjectCode,
    subjectName: group.subjectName,
    absenceBasisHours: basisHours,
    totalAbsence,
    absencePercentage,
    warningLimit: group.warningLimit,
    defaultLimit: group.defaultLimit,
    remainingHours,
    status,
  };
}

export function canSkipLesson(
  group: CalcSubjectGroup | undefined,
  lessonHours: number,
): { safe: boolean; newPct: number } {
  if (!group) {
    return { safe: true, newPct: 0 };
  }

  const basisHours = absenceBasisHours(group);
  if (basisHours <= 0) return { safe: true, newPct: 0 };

  const newAbsence = group.totalAbsence + lessonHours;
  const newPct = (newAbsence / basisHours) * 100;
  return { safe: newPct < group.defaultLimit, newPct };
}

export const WEEKDAYS_SHORT = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];
