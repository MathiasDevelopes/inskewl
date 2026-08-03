import { z } from "zod";
import { transformISODate } from "../../../../src/utils/parsing";
import { PrefixedUserRole } from "./models/userRole";

export const LearnerSchema = z.object({
  className: z.any().optional(),
  preferredGivenName: z.string().optional().nullable().meta({
    description: "The nickname of the learner",
  }),
  givenName: z.string(),
  familyName: z.string(),
  id: z.number(),
  identifier: z.number().optional(),
});

export const WorkForceSchema = z.object({
  userRole: PrefixedUserRole.optional(),
  workforcePersonalId: z.number().optional().meta({
    description: "The personal id of the employee",
  }),
  displayCode: z.any().optional(),
  preferredGivenName: z.string().optional().nullable().meta({
    description: "The nickname of the employee",
  }),
  givenName: z.string().meta({
    description: "First name",
  }),
  familyName: z.string().meta({
    description: "Family name",
  }),
  id: z.number().meta({
    description: "The id of the employee",
  }),
  identifier: z.number().optional().meta({
    description: "The id of the employee",
  }),
});

export const RoomSchema = z.object({
  id: z.number().meta({
    description: "ID of the room",
  }),
  name: z.string().meta({
    description: "Name of the room",
  }),
  location: z.string().optional().meta({
    description: "Location of the room",
  }),
  capacity: z.number().meta({
    description: "How many people the room can hold",
  }),
  available: z.boolean().optional(),
  facilities: z.array(z.any()).optional().meta({
    description: "A array of the facilities the room has",
  }),
});

export const EventSchema = z.object({
  id: z.number().meta({
    description: "ID of the Event",
  }),
  name: z.string().meta({
    description: "Name of the event",
  }),
  description: z.string().meta({
    description: "Description of the event",
  }),
  requiredAttendance: z.boolean().meta({
    description:
      "A boolean indicating if you are required to attend this event",
  }),
  date: z.iso.date().transform(transformISODate).meta({
    description: "Date the event is scheduled for",
  }),
  startTime: z.iso.time().meta({
    description: "Start time of the event",
  }),
  endTime: z.iso.time().meta({
    description: "End time of the event",
  }),
  creatorName: z.string().meta({
    description: "Full name of the creator of the event",
  }),
  createdBy: z.number().meta({
    description: "ID of the creator of the event",
  }),
  lastEditor: z.number().meta({
    description: "ID of the last person who edited the event",
  }),
  learners: z.array(LearnerSchema),
  workForces: z.array(WorkForceSchema),
  rooms: z.array(RoomSchema),
  hasDeletePermission: z.boolean(),
});

export type Event = z.infer<typeof EventSchema>;
