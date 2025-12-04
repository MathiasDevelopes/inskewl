import { z } from "zod";

export const SchoolInfoSchema = z.object({
  tenant: z.number(),
  schoolName: z.string(),
  external: z.boolean(),
});

export const RemarksCountByTypeSchema = z.object({});

export const RemarkSchema = z.object({
  id: z.number(),
  assessmentId: z.number(),
  learnerId: z.number(),
  teacherId: z.number(),
  lessonId: z.number(),
  teacherName: z.string(),
  subjectCode: z.string(),
  subjectName: z.string(),
  dateTime: z.string(),
  remark: z.string(),
  remarkType: z.string(),
  schoolInfo: SchoolInfoSchema,
});

export const BehaviourSchema = z.object({
  learnerName: z.string(),
  learnerId: z.number(),
  remarks: z.array(RemarkSchema),
  remarksCountByType: RemarksCountByTypeSchema,
  results: z.array(z.any()),
  currentSchoolIsMain: z.any(),
});

export type Behaviour = z.infer<typeof BehaviourSchema>;

export const RemarkLimitSchema = z.object({
  orderliness: z.number(),
  conduct: z.number(),
});

export type RemarkLimit = z.infer<typeof RemarkLimitSchema>;
