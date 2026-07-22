import { api } from "../../api/api";
import { startOfWeek } from "../../utils/time";
import {
  CalcAcademicYearsSchema,
  CalcLessonAttendancesSchema,
  CalcSubjectGroupsSchema,
  CalcTimetableSchema,
  type CalcAcademicYear,
  type CalcLessonAttendance,
  type CalcSubjectGroup,
  type CalcTimetableItem,
} from "./attendance-calculator.schemas";
import {
  absenceBasisHours,
  attendanceCodeCountsTowardsLimit,
  isLessonLike,
  lessonDurationHours,
  resolveTimetableSubjectCode,
  type AttendanceCalculatorState,
  type SelectableLesson,
} from "./attendance-calculator.helpers";

export interface AttendanceCalculatorBaseData {
  currentYear: CalcAcademicYear;
  groups: CalcSubjectGroup[];
}

export async function loadCurrentAttendanceGroups(): Promise<AttendanceCalculatorBaseData> {
  const currentYear = await api.calendar.getCurrentAcademicYear(
    CalcAcademicYearsSchema,
  );
  const groups = await api.attendance.getAttendanceForSubjectGroups(
    currentYear,
    CalcSubjectGroupsSchema,
  );
  return {
    currentYear,
    groups: groups.filter((g) => absenceBasisHours(g) > 0),
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
  currentYear: CalcAcademicYear,
  groups: CalcSubjectGroup[],
): Promise<SelectableLesson[]> {
  const [timetable, lessonAttendances] = await Promise.all([
    api.timetable.getTimetable(week, CalcTimetableSchema),
    api.attendance.getLessonAttendancesForTeachingGroups(
      currentYear,
      groups.map((g) => g.subjectGroupId),
      CalcLessonAttendancesSchema,
    ),
  ]);

  return createSelectableLessons(
    timetable.timetableItems,
    groups,
    lessonAttendances,
  );
}

export function createSelectableLessons(
  timetableItems: CalcTimetableItem[],
  groups: CalcSubjectGroup[],
  lessonAttendances: CalcLessonAttendance[] = [],
): SelectableLesson[] {
  const groupBySubjectCode = new Map(groups.map((g) => [g.subjectCode, g]));
  const groupById = new Map(groups.map((g) => [g.subjectGroupId, g]));
  const attendanceByTimetableItemId = new Map(
    lessonAttendances.map((attendance) => [
      String(attendance.timetableItemId),
      attendance,
    ]),
  );

  return timetableItems
    .map((item) => {
      const subjectCode = resolveTimetableSubjectCode(item);
      const group = subjectCode
        ? groupBySubjectCode.get(subjectCode)
        : item.teachingGroupId != null
          ? groupById.get(item.teachingGroupId)
          : undefined;
      const resolvedSubjectCode = group?.subjectCode ?? subjectCode;

      return resolvedSubjectCode && resolvedSubjectCode !== item.subjectCode
        ? { ...item, subjectCode: resolvedSubjectCode }
        : item;
    })
    .filter((item) => {
      if (!isLessonLike(item)) return false;
      return !!item.subjectCode && groupBySubjectCode.has(item.subjectCode);
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
  item: CalcTimetableItem,
  attendanceByTimetableItemId: Map<string, CalcLessonAttendance>,
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
