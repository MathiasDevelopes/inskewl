import { z } from "zod";
import { AcademicYearSchema, TermSchema } from "../../../api/types/calendar";
import { TimetableItemSchema } from "../../../api/types/timetable";

/**
 * Feature-driven schemas: validate only the fields the exporter needs.
 * Fields are picked from the catalog schemas in src/api/types so transforms
 * (e.g. dd/mm/yyyy -> Date) come along.
 */
export const ExportTimetableItemSchema = TimetableItemSchema.pick({
  id: true,
  tenant: true,
  entityId: true,
  type: true,
  subject: true,
  label: true,
  date: true,
  startTime: true,
  endTime: true,
  teachers: true,
  locations: true,
});

export const ExportTimetableSchema = z.object({
  timetableItems: z.array(ExportTimetableItemSchema),
});

export const ExportAcademicYearSchema = AcademicYearSchema.pick({
  currentYear: true,
}).extend({
  terms: z.array(TermSchema.pick({ current: true, endDate: true })),
});

export type ExportTimetableItem = z.infer<typeof ExportTimetableItemSchema>;
