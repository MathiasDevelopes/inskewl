import { z } from "zod";

export const TimetableTypeSchema = z.union([
  z.literal("LESSON"),
  z.literal("EVENT"),
  z.literal("ACTIVITY"),
  z.literal("SUBSTITUTION"),
  z.literal("EXAM"),
  z.literal("ASSESSMENT"),
]);

export const TimetableItemSchema = z.object({
  id: z.any(),
  startTime: z.string(),
  endTime: z.string(),
  date: z.string(),
  tenant: z.number(),
  academicYearId: z.any(),
  entityId: z.number(),
  label: z.string(),
  type: TimetableTypeSchema,
  originalType: z.string().nullable().optional(),
  locations: z.array(z.string()),
  mainRoom: z.string().nullable().optional(),
  additionalRooms: z.array(z.any()).nullable().optional(),
  colour: z.string(),
  teachingGroupId: z.number().nullable(),
  blockName: z.any(),
  blockId: z.any(),
  blockDescription: z.any(),
  subject: z.string().nullable().optional(),
  subjectCode: z.string().nullable().optional(),
  assessment: z.any(),
  hasFutureAbsence: z.boolean(),
  teacherName: z.string().nullable().optional(),
  teachers: z.array(z.string()).nullable(),
  extraInfo: z.any(),
  periodNumberInDay: z.any(),
});

export const SchoolSchema = z.object({
  tenant: z.number(),
  name: z.string(),
  isMainSchool: z.boolean(),
});

export const TimetableSchema = z.object({
  startDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  timetableItems: z.array(TimetableItemSchema),
  warnings: z.array(z.any()),
  daysInWeek: z.number(),
  presence: z.any(),
  absences: z.array(z.any()),
  schools: z.array(SchoolSchema),
});

export type Timetable = z.infer<typeof TimetableSchema>;
export type TimetableItem = z.infer<typeof TimetableItemSchema>;
export type TimetableType = z.infer<typeof TimetableTypeSchema>;

export const ActivityDetailSchema = z.object({
  activityTimeslotId: z.number(),
  subjects: z.array(
    z.object({ subjectName: z.string(), minutesDeliverable: z.number() }),
  ),
  baseClasses: z.array(z.unknown()),
});

export type ActivityDetail = z.infer<typeof ActivityDetailSchema>;
