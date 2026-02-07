import { z } from "zod";
import { transformDDMMYYYY } from "../../utils/parsing";

export const TimetableTypeSchema = z.union([
  z.literal("LESSON"),
  z.literal("EVENT"),
  z.literal("ACTIVITY"),
  z.literal("SUBSTITUTION"),
  z.literal("EXAM"),
  z.literal("ASSESSMENT"),
]);

export const TimetableItemSchema = z.object({
  id: z.any(),
  startTime: z.iso.time().meta({
    description: "Start time for the timetable item",
  }),
  endTime: z.iso.time().meta({
    description: "End time of the timetable item",
  }),
  // Date in dd/mm/yyyy format, transformed to Date object
  date: z.string().transform(transformDDMMYYYY).meta({
    description: "A date in the format dd/mm/yyyy",
  }),
  tenant: z.number().meta({
    description: "ID of the tenant the timetable item is in",
  }),
  academicYearId: z.any(),
  entityId: z.number(),
  label: z.string().meta({
    description:
      "A string which combines the classes name, UDIR subject code. E.g 2ITA/ITK2001/1",
  }),
  type: TimetableTypeSchema,
  originalType: z.string().nullable().optional(),
  locations: z.array(z.string()).meta({
    description: "Array of the locations the timetable item takes place in",
  }),
  mainRoom: z.string().nullable().optional().meta({
    description:
      "The identifier of the main room the timetable item takes place in",
  }),
  additionalRooms: z.array(z.any()).nullable().optional(),
  colour: z.string().meta({
    description: "Hexadecimal color for UI display of timetable item entry.",
  }),
  teachingGroupId: z.number().nullable(),
  blockName: z.any(),
  blockId: z.any(),
  blockDescription: z.any(),
  subject: z.string().nullable().optional().meta({
    description: "Name of the subject",
  }),
  subjectCode: z.string().nullable().optional().meta({
    description: "UDIR subject code",
  }),
  assessment: z.any(),
  hasFutureAbsence: z.boolean().meta({
    description:
      "Boolean indicating if future absence is registered on this timetable item",
  }),
  teacherName: z.string().nullable().optional().meta({
    description: "Full name of the teacher",
  }),
  teachers: z.array(z.string()).nullable().meta({
    description:
      "Array of teachers registered for this timetable item. Used if multiple teachers",
  }),
  extraInfo: z.any(),
  periodNumberInDay: z.any(),
});

export const SchoolSchema = z.object({
  tenant: z.number().meta({
    description: "ID of the tenant",
  }),
  name: z.string().meta({
    description: "Full name of the school",
  }),
  isMainSchool: z.boolean().meta({
    description: "Boolean indicating if this is the main school",
  }),
});

export const TimetableSchema = z.object({
  startDate: z.string().transform(transformDDMMYYYY).meta({
    description: "Starting date of the timetable in the format dd/mm/yyyy",
  }),
  startTime: z.iso.time().meta({
    description:
      "Earliest starting time for day in the timetable (approximate)",
  }),
  endTime: z.iso.time().meta({
    description: "End time for the longest day in the timetable (approximate)",
  }),
  timetableItems: z.array(TimetableItemSchema),
  warnings: z.array(z.any()),
  daysInWeek: z.number().meta({
    description: "How many days are in the timetable week",
  }),
  presence: z.any(),
  // TODO: Accuqire more info about timetable, especially absences
  absences: z.array(z.any()),
  schools: z.array(SchoolSchema),
});

export type Timetable = z.infer<typeof TimetableSchema>;
export type TimetableItem = z.infer<typeof TimetableItemSchema>;
export type TimetableType = z.infer<typeof TimetableTypeSchema>;

export const ActivityDetailSchema = z.object({
  activityTimeslotId: z.number(),
  subjects: z.array(
    z.object({ subjectName: z.string(), minutesDeliverable: z.number() }),
  ),
  baseClasses: z.array(z.unknown()),
});

export type ActivityDetail = z.infer<typeof ActivityDetailSchema>;
