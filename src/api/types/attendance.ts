import { z } from "zod";

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
