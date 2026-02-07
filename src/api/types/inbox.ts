import { z } from "zod";
import { transformISODateTime } from "../../utils/parsing";

export const UserRole = z.enum([
  "ROLE_TEACHER",
  "ROLE_PRINCIPAL",
  "ROLE_LEARNER",
  "ROLE_CONTACT",
  "ROLE_ADMIN",
  "ROLE_SCHOOL_OWNER",
]);

export const OwnerSchema = z.object({
  id: z.number().meta({
    description: "ID of the owner of the message",
  }),
  displayName: z.string().meta({
    description: "The full name of the owner",
  }),
  role: UserRole,
});

export const SenderSchema = z.object({
  id: z.number().meta({
    description: "The ID of the sender of the message",
  }),
  displayName: z.string().meta({
    description: "The full name of the sender of the message",
  }),
  role: UserRole,
});

export const MessageSchema = z.object({
  id: z.number().meta({
    description: "ID of the message",
  }),
  owner: OwnerSchema,
  allOwners: z.array(OwnerSchema),
  sender: SenderSchema,
  title: z.string().meta({
    description: "Title of the message",
  }),
  titleTranslation: z.string().meta({
    description: "Translation string of the title",
  }),
  content: z.string().meta({
    description: "Content of the message. Can contain HTML",
  }),
  contentTranslation: z.string().nullable().optional().meta({
    description: "Translation string of the message",
  }),
  status: z.string(),
  lineType: z.string(),
  createdOn: z.iso.datetime({ offset: true }).transform(transformISODateTime).meta({
    description: "The datetime the message was created on",
  }),
  modifiedOn: z.iso.datetime({ offset: true }).nullable().optional().transform((val) => val ? transformISODateTime(val) : val).meta({
    description: "The datetime the message was last modified on.",
  }),
  origin: z.string().meta({
    description: "Origin of the message",
  }),
});

export const MessagesSchema = z.object({
  totalMessages: z.number().meta({
    description: "Total amount of messages",
  }),
  totalPages: z.number().meta({
    description: "Total amount of pages",
  }),
  messages: z.array(MessageSchema),
});

export type Messages = z.infer<typeof MessagesSchema>;
