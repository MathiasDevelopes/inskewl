import { api } from "../../api/api";
import type { AcademicYear } from "../../api/types/calendar";
import type {
  AttendanceSubjectGroup,
  LessonAttendance,
} from "../../api/types/attendance";
import type { TimetableItem } from "../../api/types/timetable";
import {
  AttendanceCalculatorState,
  attendanceCodeCountsTowardsLimit,
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

  const [timetable, lessonAttendances] = await Promise.all([
    api.timetable.getTimetable(new Date()),
    api.attendance.getLessonAttendancesForTeachingGroups(
      base.currentYear,
      base.groups.map((g) => g.subjectGroupId),
    ),
  ]);

  return {
    ...base,
    lessons: createSelectableLessons(
      timetable.timetableItems,
      base.groups,
      lessonAttendances,
    ),
  };
}

export function createSelectableLessons(
  timetableItems: TimetableItem[],
  groups: AttendanceSubjectGroup[],
  lessonAttendances: LessonAttendance[] = [],
): SelectableLesson[] {
  const subjectCodes = new Set(groups.map((g) => g.subjectCode));
  const attendanceByTimetableItemId = new Map(
    lessonAttendances.map((attendance) => [
      String(attendance.timetableItemId),
      attendance,
    ]),
  );

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
      ...lessonAttendanceStatusForItem(item, attendanceByTimetableItemId),
    }));
}

function lessonAttendanceStatusForItem(
  item: TimetableItem,
  attendanceByTimetableItemId: Map<string, LessonAttendance>,
): Pick<
  SelectableLesson,
  | "attendanceCode"
  | "attendanceCodeDescription"
  | "registeredAttendance"
  | "countsTowardsLimit"
> {
  const attendance = attendanceByTimetableItemId.get(String(item.id));
  if (!attendance) {
    return {
      attendanceCode: null,
      attendanceCodeDescription: null,
      registeredAttendance: false,
      countsTowardsLimit: true,
    };
  }

  return {
    attendanceCode: attendance.attendanceCode,
    attendanceCodeDescription: attendance.attendanceCodeDescription,
    registeredAttendance: true,
    countsTowardsLimit: attendanceCodeCountsTowardsLimit(
      attendance.attendanceCode,
    ),
  };
}
