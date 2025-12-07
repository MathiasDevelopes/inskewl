import { z } from "zod";

export const OwnerSchema = z.object({
  id: z.number(),
  displayName: z.string(),
  role: z.string(),
});

export const AllOwnerSchema = z.object({
  id: z.number(),
  displayName: z.string(),
  role: z.string(),
});

export const SenderSchema = z.object({
  id: z.number(),
  displayName: z.string(),
  role: z.string(),
});

export const MessageSchema = z.object({
  id: z.number(),
  owner: OwnerSchema,
  allOwners: z.array(AllOwnerSchema),
  sender: SenderSchema,
  title: z.string(),
  titleTranslation: z.string(),
  content: z.string(),
  contentTranslation: z.string().nullable().optional(),
  status: z.string(),
  lineType: z.string(),
  createdOn: z.string(),
  modifiedOn: z.string().nullable().optional(),
  origin: z.string(),
});

export const MessagesSchema = z.object({
  totalMessages: z.number(),
  totalPages: z.number(),
  messages: z.array(MessageSchema),
});

export type Messages = z.infer<typeof MessagesSchema>;
