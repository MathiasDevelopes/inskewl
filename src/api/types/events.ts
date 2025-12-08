import { z } from "zod";

export const LearnerSchema = z.object({
  className: z.any(),
  givenName: z.string(),
  familyName: z.string(),
  id: z.number(),
  identifier: z.number(),
});

export const WorkForceSchema = z.object({
  userRole: z.string(),
  workforcePersonalId: z.number(),
  displayCode: z.any(),
  preferredGivenName: z.string().optional(),
  givenName: z.string(),
  familyName: z.string(),
  id: z.number(),
  identifier: z.number(),
});

export const RoomSchema = z.object({
  id: z.number(),
  name: z.string(),
  location: z.string(),
  capacity: z.number(),
  available: z.boolean(),
  facilities: z.array(z.any()),
});

export const EventSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  requiredAttendance: z.boolean(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  creatorName: z.string(),
  createdBy: z.number(),
  lastEditor: z.number(),
  learners: z.array(LearnerSchema),
  workForces: z.array(WorkForceSchema),
  rooms: z.array(RoomSchema),
  hasDeletePermission: z.boolean(),
});

export type Event = z.infer<typeof EventSchema>;
