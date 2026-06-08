import type { TimetableItem } from "../../api/types/timetable";
import type { AttendanceSubjectGroup } from "../../api/types/attendance";
import type { AcademicYear } from "../../api/types/calendar";
import { timeToMinutes } from "../../utils/time";

export interface SubjectAbsenceInfo {
  subjectCode: string;
  subjectName: string;
  totalScheduledHours: number;
  totalAbsence: number;
  absencePercentage: number;
  warningLimit: number;
  defaultLimit: number;
  remainingHours: number;
  status: "ok" | "warning" | "exceeded";
}

export interface SelectableLesson {
  item: TimetableItem;
  durationHours: number;
  selected: boolean;
}

export interface AttendanceCalculatorState {
  currentYear: AcademicYear;
  groups: AttendanceSubjectGroup[];
  lessons: SelectableLesson[];
}

export function lessonDurationHours(item: TimetableItem): number {
  return (timeToMinutes(item.endTime) - timeToMinutes(item.startTime)) / 60;
}

export function extractSubjectCodeFromLabel(
  label: string | null | undefined,
): string | null {
  if (!label) return null;
  const match = label.match(/([A-ZÆØÅ]{2,6}\d{4})/i);
  return match?.[1]?.toUpperCase() ?? null;
}

export function isLessonLike(item: TimetableItem): boolean {
  return item.type === "LESSON" || (
    item.type === "SUBSTITUTION" &&
    item.originalType === "LESSON"
  );
}

export function resolveTimetableSubjectCode(item: TimetableItem): string | null {
  return item.subjectCode ?? extractSubjectCodeFromLabel(item.label);
}

export function computeAbsenceInfo(
  group: AttendanceSubjectGroup,
  extraHours = 0,
): SubjectAbsenceInfo {
  const totalAbsence = group.totalAbsence + extraHours;
  const absencePercentage =
    group.totalScheduledHours > 0
      ? (totalAbsence / group.totalScheduledHours) * 100
      : 0;
  const maxAbsenceHours =
    (group.defaultLimit / 100) * group.totalScheduledHours;
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
    totalScheduledHours: group.totalScheduledHours,
    totalAbsence,
    absencePercentage,
    warningLimit: group.warningLimit,
    defaultLimit: group.defaultLimit,
    remainingHours,
    status,
  };
}

export function canSkipLesson(
  group: AttendanceSubjectGroup | undefined,
  lessonHours: number,
): { safe: boolean; newPct: number } {
  if (!group || group.totalScheduledHours <= 0) {
    return { safe: true, newPct: 0 };
  }

  const newAbsence = group.totalAbsence + lessonHours;
  const newPct = (newAbsence / group.totalScheduledHours) * 100;
  return { safe: newPct < group.defaultLimit, newPct };
}

export const STATUS_COLORS = {
  ok: "#4caf50",
  warning: "#ff9800",
  exceeded: "#f44336",
} as const;

export const STATUS_LABELS = {
  ok: "OK",
  warning: "Advarsel",
  exceeded: "Over grensen",
} as const;

export const WEEKDAYS_SHORT = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];

export const BADGE_ATTR = "data-inskewl-badge";
