import { z } from "zod";
import { transformDDMMYYYY, transformISODate } from "../../utils/parsing";
import { TimetableTypeSchema } from "./timetable";

export const ThresholdSchema = z.object({
  absenceLimitExceededLast: z.any(),
  remainingPercentage: z.number(),
});

export const AttendanceSubjectGroupSchema = z.object({
  subjectGroupId: z.number(),
  learnerPersonalId: z.number().meta({
    description: "The personal id of the learner",
  }),
  subjectGroupName: z.string().meta({
    description:
      "Class name and UDIR subject name seperated by a /, e.g 2ITA/ITK2002",
  }),
  subjectCode: z.string().meta({
    description: "UDIR subject code",
  }),
  subjectName: z.string().meta({
    description: "UDIR subject name",
  }),
  subjectShortName: z.string().meta({
    description: "A short version of the subject name",
  }),
  warningLimit: z.number().meta({
    description:
      "A percentage value that determines the threshold at which you receive an absence warning",
  }),
  defaultLimit: z.number().meta({
    description:
      "A percentage value that determines when you have exceeded the maximum allowed absence",
  }),
  schoolName: z.string().meta({
    description: "Full name of the school",
  }),
  mainSchool: z.boolean().meta({
    description: "A boolean indicating if this is your primary school",
  }),
  learnerInTeachingGroup: z.boolean(),
  externalSchool: z.boolean(),
  yearlyHours: z.number().meta({
    description: "Amount of yearly hours you have in this subject",
  }),
  scheduledHoursTermOne: z.number().meta({
    description: "How many hours are scheduled for term one",
  }),
  totalScheduledHours: z.number().meta({
    description: "Total scheduled hours for this subject",
  }),
  totalAbsenceTermOne: z.number().meta({
    description: "Total absence in term one",
  }),
  totalAbsenceTermTwo: z.number().meta({
    description: "Total absence in term two",
  }),
  totalAbsence: z.number().meta({
    description: "Total absence",
  }),
  absencePercentageTermOne: z.number().meta({
    description: "Absence percentage in term one",
  }),
  absencePercentageTermOneAndTwo: z.number().meta({
    description: "Absence percentage in term one and two combined",
  }),
  threshold: ThresholdSchema,
});

export type AttendanceSubjectGroup = z.infer<
  typeof AttendanceSubjectGroupSchema
>;

export const MembershipFilterSchema = z.enum(["MEMBER", "ALL"]);
export type MembershipFilter = z.infer<typeof MembershipFilterSchema>;

export const AttendanceCodeSchema = z.enum(["!", "D", "M", "R", "X", "§"]);
export type AttendanceCode = z.infer<typeof AttendanceCodeSchema>;

export const AbsenceTimeSchema = z.object({
  startTime: z.iso.time().nullable().meta({
    description: "Start time in HH:mm format",
  }),
  endTime: z.iso.time().nullable().meta({
    description: "End time in HH:mm format",
  }),
});

export const PersonRefSchema = z.object({
  id: z.number().meta({ description: "Unique id of the person" }),
  name: z.string().meta({ description: "Full name of the person" }),
});

export const TeachingGroupSchema = z.object({
  id: z.number().meta({ description: "Teaching group id" }),
  name: z.string().meta({
    description:
      "A string which combines the classes name, UDIR subject code. E.g 2ITA/ITK2001/1",
  }),
  subjectCode: z.string().nullable().optional().meta({
    description: "UDIR subject code",
  }),
  subjectName: z.string().nullable().optional().meta({
    description: "UDIR subject name",
  }),
});

export const CodeSchema = z.object({
  value: AttendanceCodeSchema.meta({
    description:
      "Absence code value, e.g. X or M. See https://inschool.zendesk.com/hc/no/articles/360023264091-4b-09-Forklaring-p%C3%A5-frav%C3%A6rskoder",
  }),
  description: z.string().nullable().meta({
    description: "Human readable description, empty string in some cases.",
  }),
  subCode: z.string().nullable().optional().meta({
    description: "Optional sub-code",
  }),
});

export const AbsenceTimetableItemSchema = z.object({
  timetableItemId: z.number().meta({
    description: "Id of the timetable item",
  }),
  date: z.iso.date().transform(transformISODate).meta({
    description: "ISO date of the absence item",
  }),
  absenceTime: AbsenceTimeSchema.meta({
    description: "Start and end time for this absence segment",
  }),
  timeTotal: z.number().meta({
    description: "Duration in minutes for this absence segment",
  }),
  onDiploma: z.boolean().meta({
    description: "Whether this absence counts towards diploma",
  }),
  subjectAbsence: z.boolean().meta({
    description: "Whether this absence is tied to a subject",
  }),
  againstDayAbsence: z.boolean().meta({
    description: "Whether this absence counts towards whole-day absence",
  }),
  termCode: z.string().meta({
    description: "Term identifier, e.g. TERM2",
  }),
  timetableItemType: TimetableTypeSchema.meta({
    description: "Type of timetable item",
  }),
  teachingGroup: TeachingGroupSchema,
  teacher: PersonRefSchema,
  lessonTeacher: PersonRefSchema.nullable().optional().meta({
    description: "Teacher of the lesson (may differ from teacher)",
  }),
  involvedTeachers: z.array(PersonRefSchema).optional().meta({
    description: "Teachers involved in an activity absence",
  }),
  involvedTeachingGroups: z.array(TeachingGroupSchema).optional().meta({
    description: "Teaching groups involved in an activity absence",
  }),
  name: z.string().optional().meta({
    description: "Display name for activity absence items",
  }),
  code: CodeSchema,
});

export const LessonSchema = AbsenceTimetableItemSchema;
export const ActivitySchema = AbsenceTimetableItemSchema;

export const AbsenceDaySchema = z.object({
  date: z.iso.date().transform(transformISODate).meta({
    description: "ISO date for this day",
  }),
  lessons: z.array(LessonSchema).meta({
    description: "List of lesson-based absences for the day",
  }),
  activities: z.array(ActivitySchema).meta({
    description: "List of activity-based absences for the day",
  }),
  timetableItems: z.array(AbsenceTimetableItemSchema).meta({
    description: "All absence timetable items for the day",
  }),
  dayAbsence: z.boolean().meta({
    description: "Whether the whole day is marked absent",
  }),
  code: CodeSchema.nullable().meta({
    description: "Optional code for the day",
  }),
  lessonAbsence: z.number().meta({
    description: "Number of lessons absent on this day",
  }),
  activitiesAbsent: z.number().meta({
    description: "Number of activities absent on this day",
  }),
  name: z.string().nullable().meta({
    description: "Optional display name for the day",
  }),
  timetableItemId: z.number().nullable().meta({
    description: "Optional timetable item id representing whole-day absence",
  }),
  duration: z.number().meta({
    description: "Total duration in minutes of absence this day",
  }),
  startTime: z.iso.time().nullable().meta({
    description: "Optional first absence time for the day",
  }),
  endTime: z.iso.time().nullable().meta({
    description: "Optional last absence time for the day",
  }),
});

export const AbsenceOverviewSchema = z.array(AbsenceDaySchema);

export const AttendanceCodeOverviewSchema = z.object({
  code: CodeSchema,
  lessons: z.number().meta({
    description: "Number of lesson absences with this code",
  }),
  activities: z.number().meta({
    description: "Number of activity absences with this code",
  }),
  duration: z.number().meta({
    description: "Total duration in minutes for this code",
  }),
});

export const AbsenceCodesByTeachingGroupSchema = z.object({
  teachingGroupName: z.string().meta({
    description: "Display name for the teaching group",
  }),
  attendanceCodeOverviews: z.array(AttendanceCodeOverviewSchema),
});

export const AbsenceCodesByTeachingGroupsSchema = z.array(
  AbsenceCodesByTeachingGroupSchema,
);

export const DiplomaAbsencesSchema = z.object({
  days: z.number().meta({
    description: "Diploma absence days",
  }),
  hours: z.number().meta({
    description: "Diploma absence hours",
  }),
  diplomaHours: z.number().optional().meta({
    description: "Diploma absence hours for the academic year",
  }),
  importedDays: z.number().meta({
    description: "Imported diploma absence days",
  }),
  importedHours: z.number().meta({
    description: "Imported diploma absence hours",
  }),
});

export const DiplomaTermAbsencesSchema = DiplomaAbsencesSchema.extend({
  code: z.string().meta({
    description: "Term code, e.g. H1",
  }),
  name: z.string().meta({
    description: "Term name, e.g. H1",
  }),
  term: z.string().meta({
    description: "Term identifier, e.g. TERM1",
  }),
  startDate: z.string().transform(transformDDMMYYYY).meta({
    description: "Start date of the term",
  }),
  endDate: z.string().transform(transformDDMMYYYY).meta({
    description: "End date of the term",
  }),
});

export const LessonAttendanceSchema = z.object({
  timetableItemId: z.number().meta({
    description: "Id of the timetable item",
  }),
  timetableItemType: TimetableTypeSchema.meta({
    description: "Type of timetable item",
  }),
  learnerPersonalId: z.number().meta({
    description: "The personal id of the learner",
  }),
  date: z.iso.date().transform(transformISODate).meta({
    description: "ISO date of the lesson attendance",
  }),
  startTime: z.iso.time().meta({
    description: "Start time in HH:mm format",
  }),
  endTime: z.iso.time().meta({
    description: "End time in HH:mm format",
  }),
  duration: z.number().meta({
    description: "Duration in minutes",
  }),
  attendanceCode: AttendanceCodeSchema.meta({
    description: "The registered attendance code",
  }),
  attendanceSubcategory: z.string().nullable(),
  attendanceCodeDescription: z.string().nullable().meta({
    description: "Human readable attendance code description",
  }),
  attendanceTakenById: z.number().nullable().meta({
    description: "Id of the person who registered attendance",
  }),
  attendanceTakenByName: z.string().nullable().meta({
    description: "Name of the person who registered attendance",
  }),
  academicYearId: z.number().meta({
    description: "Academic year id",
  }),
  tenant: z.number().meta({
    description: "Tenant id",
  }),
  teachingGroupId: z.number().meta({
    description: "Internal teaching group id",
  }),
  teachingGroupName: z.string().meta({
    description: "Display name for the teaching group",
  }),
  note: z.string().nullable(),
  minutesAbsent: z.number().nullable(),
});

export const LessonAttendancesSchema = z.array(LessonAttendanceSchema);

export type AbsenceTime = z.infer<typeof AbsenceTimeSchema>;
export type PersonRef = z.infer<typeof PersonRefSchema>;
export type TeachingGroup = z.infer<typeof TeachingGroupSchema>;
export type AbsenceTimetableItem = z.infer<typeof AbsenceTimetableItemSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type AbsenceDay = z.infer<typeof AbsenceDaySchema>;
export type AbsenceOverview = z.infer<typeof AbsenceOverviewSchema>;
export type AttendanceCodeOverview = z.infer<
  typeof AttendanceCodeOverviewSchema
>;
export type AbsenceCodesByTeachingGroup = z.infer<
  typeof AbsenceCodesByTeachingGroupSchema
>;
export type AbsenceCodesByTeachingGroups = z.infer<
  typeof AbsenceCodesByTeachingGroupsSchema
>;
export type DiplomaAbsences = z.infer<typeof DiplomaAbsencesSchema>;
export type DiplomaTermAbsences = z.infer<typeof DiplomaTermAbsencesSchema>;
export type LessonAttendance = z.infer<typeof LessonAttendanceSchema>;
