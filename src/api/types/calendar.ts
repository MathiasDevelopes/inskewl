import { z } from "zod";

export const TermSchema = z.object({
  id: z.number(),
  version: z.number(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
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
  studentStartDate: z.iso.date(),
  currentYear: z.boolean(),
  terms: z.array(TermSchema),
  year: z.number(),
  daysInCycle: z.number(),
  editable: z.boolean(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
});

export type AcademicYear = z.infer<typeof AcademicYearSchema>;

export const DayCountSchema = z.object({
  learningDays: z.number(),
  planningDays: z.number(),
  vacationDays: z.number(),
});

export type DayCount = z.infer<typeof DayCountSchema>;
