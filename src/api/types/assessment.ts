import { z } from "zod";

export const SchoolInfoSchema = z.object({
  tenant: z.number().meta({
    description: "ID of the school tenant",
  }),
  schoolName: z.string().meta({
    description: "Full name of the school",
  }),
  external: z.boolean(),
});

export const RemarksCountByTypeSchema = z.object({});

export const RemarkTypeSchema = z.union([z.literal("CONDUCT")]);

export const RemarkSchema = z.object({
  id: z.number(),
  assessmentId: z.number(),
  learnerId: z.number().meta({
    description: "ID of the learner who was given the remark",
  }),
  teacherId: z.number().meta({
    description: "ID of the teacher who gave you the remark",
  }),
  lessonId: z.number().meta({
    description: "ID of the lesson the remark was given for",
  }),
  teacherName: z.string().meta({
    description: "Full name of the teacher who gave you the remark",
  }),
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
  remark: z.string().meta({
    description: "Reason for the remark",
  }),
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
  orderliness: z.number().meta({
    description: "Upper limit for how many orderliness remarks you can have",
  }),
  conduct: z.number().meta({
    description: "Upper limit for how many conduct remarks you can have",
  }),
});

export type RemarkLimit = z.infer<typeof RemarkLimitSchema>;
