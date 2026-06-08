import { api } from "../../api/api";
import type { AcademicYear } from "../../api/types/calendar";
import type { AttendanceSubjectGroup } from "../../api/types/attendance";
import type { TimetableItem } from "../../api/types/timetable";
import {
  AttendanceCalculatorState,
  isLessonLike,
  lessonDurationHours,
  resolveTimetableSubjectCode,
  type SelectableLesson,
} from "./attendance-calculator.helpers";

export interface AttendanceCalculatorBaseData {
  currentYear: AcademicYear;
  groups: AttendanceSubjectGroup[];
}

export async function loadCurrentAttendanceGroups(): Promise<AttendanceCalculatorBaseData> {
  const academicYears = await api.calendar.getAcademicYears();
  const currentYear = academicYears.find((y) => y.currentYear);
  if (!currentYear) {
    throw new Error("Fant ikke gjeldende skoleår.");
  }

  const groups = await api.attendance.getAttendanceForSubjectGroups(currentYear);
  return {
    currentYear,
    groups: groups.filter((g) => g.totalScheduledHours > 0),
  };
}

export async function loadAttendanceCalculatorState(): Promise<AttendanceCalculatorState> {
  const base = await loadCurrentAttendanceGroups();
  if (base.groups.length === 0) {
    return { ...base, lessons: [] };
  }

  const timetable = await api.timetable.getTimetable(new Date());
  return {
    ...base,
    lessons: createSelectableLessons(timetable.timetableItems, base.groups),
  };
}

export function createSelectableLessons(
  timetableItems: TimetableItem[],
  groups: AttendanceSubjectGroup[],
): SelectableLesson[] {
  const subjectCodes = new Set(groups.map((g) => g.subjectCode));

  return timetableItems
    .map((item) => {
      const subjectCode = resolveTimetableSubjectCode(item);
      return subjectCode && subjectCode !== item.subjectCode
        ? { ...item, subjectCode }
        : item;
    })
    .filter((item) => {
      if (!isLessonLike(item)) return false;
      return !!item.subjectCode && subjectCodes.has(item.subjectCode);
    })
    .sort((a, b) => {
      const dateCmp = a.date.getTime() - b.date.getTime();
      return dateCmp !== 0 ? dateCmp : a.startTime.localeCompare(b.startTime);
    })
    .map((item) => ({
      item,
      durationHours: lessonDurationHours(item),
      selected: false,
    }));
}
