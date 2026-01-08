import { z } from "zod";

export const SchoolInfoSchema = z.object({
  tenant: z.number(),
  schoolName: z.string(),
  external: z.boolean(),
});

export const RemarksCountByTypeSchema = z.object({});

export const RemarkTypeSchema = z.union([z.literal("CONDUCT")]);

export const RemarkSchema = z.object({
  id: z.number(),
  assessmentId: z.number(),
  learnerId: z.number(),
  teacherId: z.number(),
  lessonId: z.number(),
  teacherName: z.string(),
  // UDIR subject code
  subjectCode: z.string().meta({
    description: "UDIR subject code",
  }),
  subjectName: z.string().meta({
    description: "UDIR subject name",
  }),
  dateTime: z.iso.datetime({ local: true }).meta({
    description: "A local datetime, Europe/Oslo timezone.",
  }),
  remark: z.string(),
  remarkType: RemarkTypeSchema,
  schoolInfo: SchoolInfoSchema,
});

export type RemarkType = z.infer<typeof RemarkTypeSchema>;

export const BehaviourSchema = z.object({
  learnerName: z.string(),
  learnerId: z.number(),
  remarks: z.array(RemarkSchema),
  remarksCountByType: RemarksCountByTypeSchema,
  results: z.array(z.any()),
  currentSchoolIsMain: z.any(),
});

export type Behaviour = z.infer<typeof BehaviourSchema>;

// The upper limit for how many remarks you can have.
export const RemarkLimitSchema = z.object({
  orderliness: z.number(),
  conduct: z.number(),
});

export type RemarkLimit = z.infer<typeof RemarkLimitSchema>;
