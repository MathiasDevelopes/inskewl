import { z } from "zod";

export const ThresholdSchema = z.object({
  absenceLimitExceededLast: z.any(),
  remainingPercentage: z.number(),
});

export const AttendanceSubjectGroupSchema = z.object({
  subjectGroupId: z.number(),
  learnerPersonalId: z.number(),
  subjectGroupName: z.string(),
  subjectCode: z.string(),
  subjectName: z.string(),
  subjectShortName: z.string(),
  warningLimit: z.number(),
  defaultLimit: z.number(),
  schoolName: z.string(),
  mainSchool: z.boolean(),
  learnerInTeachingGroup: z.boolean(),
  externalSchool: z.boolean(),
  yearlyHours: z.number(),
  scheduledHoursTermOne: z.number(),
  totalScheduledHours: z.number(),
  totalAbsenceTermOne: z.number(),
  totalAbsenceTermTwo: z.number(),
  totalAbsence: z.number(),
  absencePercentageTermOne: z.number(),
  absencePercentageTermOneAndTwo: z.number(),
  threshold: ThresholdSchema,
});

export type AttendanceSubjectGroup = z.infer<
  typeof AttendanceSubjectGroupSchema
>;
