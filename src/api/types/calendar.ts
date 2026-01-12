import { z } from "zod";

export const TermSchema = z.object({
  id: z.number().meta({
    description: "ID of the term",
  }),
  version: z.number(),
  startDate: z.iso.date().meta({
    description: "Start date of the term",
  }),
  endDate: z.iso.date().meta({
    description: "End date of the term",
  }),
  code: z.string().meta({
    description:
      "Code of the term, e.g H1 for the first term, and H2 for the second term",
  }),
  name: z.string().meta({
    description:
      "Name of the term, e.g H1 for the first term, and H2 for the second term",
  }),
  term: z.string().meta({
    description:
      "Identifier for the current term, e.g TERM1 for the first term, and TERM2 for the second term",
  }),
  current: z.boolean().meta({
    description: "Boolean that represents if this is the current term",
  }),
});

export type Term = z.infer<typeof TermSchema>;

export const AcademicYearSchema = z.object({
  id: z.number().meta({
    description: "ID of the academic year",
  }),
  version: z.number(),
  tenant: z.number().meta({
    description: "Tenant ID",
  }),
  code: z.string().meta({
    description: "Code of current academic year, e.g 20252026",
  }),
  name: z.string().meta({
    description: "Name of current academic year, e.g 20252026",
  }),
  studentStartDate: z.iso.date(),
  currentYear: z.boolean().meta({
    description: "Boolean that represents if this is the current academic year",
  }),
  terms: z.array(TermSchema),
  year: z.number(),
  daysInCycle: z.number().meta({
    description: "Amount of days in the academic year cycle, e.g 5",
  }),
  editable: z.boolean(),
  startDate: z.iso.date().meta({
    description: "Start date of the academic year",
  }),
  endDate: z.iso.date().meta({
    description: "End date of the academic year",
  }),
});

export type AcademicYear = z.infer<typeof AcademicYearSchema>;

export const DayCountSchema = z.object({
  learningDays: z.number().meta({
    description: "Total number of learning days in the academic year",
  }),
  planningDays: z.number().meta({
    description: "Total number of planning days in the academic year",
  }),
  vacationDays: z.number().meta({
    description: "Total number of vacation days in the academic year",
  }),
});

export type DayCount = z.infer<typeof DayCountSchema>;
