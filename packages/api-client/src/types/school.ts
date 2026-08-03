import { z } from "zod";

export const SchoolType = z.enum([
  "PRIMARY",
  "EXTERNAL_CANDIDATE",
  "UPPER_SECONDARY",
  "INTERNATIONAL_BACCALAUREATE",
  "VOCATIONAL",
  "APPRENTICESHIP_SCHOOL",
  "REALKOMPETANSE",
  "OTHER",
  "PRIVATE_SCHOOL",
  "ADULT_SCHOOL",
  "ADULT_OFFICE",
  "FIREMAN_SCHOOL",
  "OV_SCHOOL",
  "EXAM_SCHOOL",
]);

export const SchoolBaseSchema = z.object({
  tenant: z.number().meta({
    description: "ID of the tenant",
  }),
  name: z.string().meta({
    description: "Full name of the school",
  }),
});

export const SchoolSchema = SchoolBaseSchema.extend({
  misTenant: z.number().meta({
    description: "Appears to be the same as the ID of the tenant",
  }),
  independentSchool: z.boolean().meta({
    description: "Boolean indicating if the school is independent",
  }),
  privateSchool: z.boolean().meta({
    description: "Boolean indicating if the school is a private school",
  }),
  examSchool: z.boolean().meta({
    description:
      "A boolean indicating whether the school is approved as an exam-administering institution",
  }),
  adultSchool: z.boolean().meta({
    description:
      "System flag indicating whether the school is classified as an adult school",
  }),
  schoolTypes: z.array(SchoolType).meta({
    description: "Array of school types this school provides",
  }),
});

export type School = z.infer<typeof SchoolSchema>;
