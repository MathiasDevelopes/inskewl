import { z } from "zod";

export const LocaleSchema = z.object({
  country: z.string(),
  language: z.string(),
  locale: z.string(),
});

export const UserSchema = z.object({
  username: z.any(),
  displayName: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  roles: z.array(z.string()),
  academicYearId: z.number(),
  facultyId: z.any(),
  localId: z.any(),
  learnerId: z.number(),
  userInfoId: z.number(),
  locale: LocaleSchema,
  schoolName: z.string(),
  tenant: z.number(),
});

export type User = z.infer<typeof UserSchema>;
