import { z } from "zod";
import {
  AttendanceSubjectGroupSchema,
  LessonAttendanceSchema,
} from "../../api/types/attendance";
import { AcademicYearSchema } from "../../api/types/calendar";
import { TimetableItemSchema } from "../../api/types/timetable";

/**
 * Feature-driven schemas: validate only the fields the calculator needs.
 * Fields are picked from the catalog schemas in src/api/types so transforms
 * (e.g. dd/mm/yyyy -> Date) come along.
 */
export const CalcSubjectGroupSchema = AttendanceSubjectGroupSchema.pick({
  subjectGroupId: true,
  subjectCode: true,
  subjectName: true,
  subjectShortName: true,
  yearlyHours: true,
  totalScheduledHours: true,
  totalAbsence: true,
  warningLimit: true,
  defaultLimit: true,
});

export const CalcSubjectGroupsSchema = z.array(CalcSubjectGroupSchema);

export const CalcTimetableItemSchema = TimetableItemSchema.pick({
  id: true,
  type: true,
  originalType: true,
  subjectCode: true,
  subject: true,
  label: true,
  teachingGroupId: true,
  date: true,
  startTime: true,
  endTime: true,
  colour: true,
});

export const CalcTimetableSchema = z.object({
  timetableItems: z.array(CalcTimetableItemSchema),
});

export const CalcLessonAttendancesSchema = z.array(
  LessonAttendanceSchema.pick({
    timetableItemId: true,
    attendanceCode: true,
    attendanceCodeDescription: true,
  }),
);

export const CalcAcademicYearsSchema = z.array(
  AcademicYearSchema.pick({
    id: true,
    name: true,
    currentYear: true,
  }),
);

export type CalcSubjectGroup = z.infer<typeof CalcSubjectGroupSchema>;
export type CalcTimetableItem = z.infer<typeof CalcTimetableItemSchema>;
export type CalcLessonAttendance = z.infer<
  typeof CalcLessonAttendancesSchema
>[number];
export type CalcAcademicYear = z.infer<typeof CalcAcademicYearsSchema>[number];
