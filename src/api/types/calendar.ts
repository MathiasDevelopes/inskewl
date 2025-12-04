import { z } from "zod";

export const TermSchema = z.object({
  id: z.number(),
  version: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  code: z.string(),
  name: z.string(),
  term: z.string(),
  current: z.boolean(),
});

export const AcademicYearSchema = z.object({
  id: z.number(),
  version: z.number(),
  tenant: z.number(),
  code: z.string(),
  name: z.string(),
  studentStartDate: z.string(),
  currentYear: z.boolean(),
  terms: z.array(TermSchema),
  year: z.number(),
  daysInCycle: z.number(),
  editable: z.boolean(),
  endDate: z.string(),
  startDate: z.string(),
});

export type AcademicYear = z.infer<typeof AcademicYearSchema>;
