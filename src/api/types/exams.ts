import { z } from "zod";
import { transformISODate } from "../../utils/parsing";

export const ExamAddressSchema = z.object({
  addressLine1: z.string().meta({
    description: "First address line for the exam room building",
  }),
  addressLine2: z.string(),
  addressLine3: z.string(),
  addressLine4: z.string(),
  county: z.string().meta({
    description: "County where the exam room building is located",
  }),
  postCode: z.string().meta({
    description: "Postal code and place for the exam room building",
  }),
});

export type ExamAddress = z.infer<typeof ExamAddressSchema>;

export const ExamRoomSchema = z.object({
  id: z.number().meta({
    description: "ID of the room",
  }),
  name: z.string().meta({
    description: "Name of the room",
  }),
  buildingId: z.number().meta({
    description: "ID of the building the room belongs to",
  }),
  buildingName: z.string().meta({
    description: "Name of the building the room belongs to",
  }),
  address: ExamAddressSchema,
});

export type ExamRoom = z.infer<typeof ExamRoomSchema>;

export const ExamGroupSchema = z.object({
  id: z.number().meta({
    description: "ID of the exam group",
  }),
  tenant: z.number().meta({
    description: "ID of the school tenant",
  }),
  examForm: z.string().meta({
    description: "Form of exam, e.g. PRACTICAL",
  }),
  examType: z.string().meta({
    description: "Type of exam, e.g. MANDATORY",
  }),
  examPlanningType: z.string().meta({
    description: "Planning level for the exam, e.g. LOCAL",
  }),
  meetingTime: z.iso.time().nullable().meta({
    description: "Optional meeting time before the exam starts",
  }),
  startDate: z.iso.date().transform(transformISODate).meta({
    description: "Date the exam starts",
  }),
  startTime: z.iso.time().meta({
    description: "Time the exam starts",
  }),
  duration: z.number().meta({
    description: "Exam duration in minutes",
  }),
  schoolName: z.string().meta({
    description: "Name of the school responsible for the exam",
  }),
  preparationStartDate: z.iso.date().transform(transformISODate).nullable().meta({
    description: "Optional date the preparation part starts",
  }),
  preparationStartTime: z.iso.time().nullable().meta({
    description: "Optional time the preparation part starts",
  }),
  preparationDuration: z.number().nullable().meta({
    description: "Optional preparation duration in minutes",
  }),
  preparationRoom: ExamRoomSchema.nullable().meta({
    description: "Optional room used for the preparation part",
  }),
  subjectCode: z.string().meta({
    description: "UDIR subject code for the exam",
  }),
  subjectName: z.string().meta({
    description: "UDIR subject name for the exam",
  }),
  room: ExamRoomSchema.nullable().meta({
    description: "Room used for the exam",
  }),
  name: z.string().meta({
    description: "Display name of the exam group",
  }),
});

export type ExamGroup = z.infer<typeof ExamGroupSchema>;

export const ExamGroupsSchema = z.object({
  term1: z.array(ExamGroupSchema).meta({
    description: "Exam groups in term 1",
  }),
  term2: z.array(ExamGroupSchema).meta({
    description: "Exam groups in term 2",
  }),
});

export type ExamGroups = z.infer<typeof ExamGroupsSchema>;
