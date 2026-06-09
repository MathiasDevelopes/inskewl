import { api } from "../../api/api";
import type { AcademicYear } from "../../api/types/calendar";
import type {
  AttendanceSubjectGroup,
  LessonAttendance,
} from "../../api/types/attendance";
import type { TimetableItem } from "../../api/types/timetable";
import { startOfWeek } from "../../utils/time";
import {
  attendanceCodeCountsTowardsLimit,
  isLessonLike,
  lessonDurationHours,
  resolveTimetableSubjectCode,
  type AttendanceCalculatorState,
  type SelectableLesson,
} from "./attendance-calculator.helpers";

export interface AttendanceCalculatorBaseData {
  currentYear: AcademicYear;
  groups: AttendanceSubjectGroup[];
}

export async function loadCurrentAttendanceGroups(): Promise<AttendanceCalculatorBaseData> {
  const currentYear = await api.calendar.getCurrentAcademicYear();
  const groups = await api.attendance.getAttendanceForSubjectGroups(currentYear);
  return {
    currentYear,
    groups: groups.filter((g) => g.totalScheduledHours > 0),
  };
}

export async function loadAttendanceCalculatorState(
  week: Date = new Date(),
): Promise<AttendanceCalculatorState> {
  const selectedWeek = startOfWeek(week);
  const base = await loadCurrentAttendanceGroups();
  if (base.groups.length === 0) {
    return { ...base, selectedWeek, lessons: [] };
  }

  const lessons = await loadAttendanceCalculatorLessons(
    selectedWeek,
    base.currentYear,
    base.groups,
  );

  return {
    ...base,
    selectedWeek,
    lessons,
  };
}

export async function loadAttendanceCalculatorLessons(
  week: Date,
  currentYear: AcademicYear,
  groups: AttendanceSubjectGroup[],
): Promise<SelectableLesson[]> {
  const [timetable, lessonAttendances] = await Promise.all([
    api.timetable.getTimetable(week),
    api.attendance.getLessonAttendancesForTeachingGroups(
      currentYear,
      groups.map((g) => g.subjectGroupId),
    ),
  ]);

  return createSelectableLessons(
    timetable.timetableItems,
    groups,
    lessonAttendances,
  );
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
