import { z } from "zod";
import { transformISODateTime } from "../../utils/parsing";

// User roles are labeled differently for different endpoints.
// It seems the inbox/messages endpoint does not have ROLE_ prefix before the role name.
export const UserRole = z.enum([
  "TEACHER",
  "PRINCIPAL",
  "LEARNER",
  "CONTACT",
  "ADMIN",
  "SCHOOL_OWNER",
  "BASIC",
]);

// The filter type for the getMessages endpoint. ALL returns all messages, while INBOX returns only unread messages.
export const FilterTypeSchema = z.enum(["ALL", "INBOX"]);
export type FilterType = z.infer<typeof FilterTypeSchema>;

export const MessageUserSchema = z.object({
  id: z.number().meta({
    description: "ID of the message user",
  }),
  displayName: z.string().meta({
    description: "The full name of the message user",
  }),
  role: UserRole,
});

export const MessageSchema = z.object({
  id: z.number().meta({
    description: "ID of the message",
  }),
  owner: MessageUserSchema,
  allOwners: z.array(MessageUserSchema),
  sender: MessageUserSchema,
  title: z.string().meta({
    description: "Title of the message",
  }),
  titleTranslation: z.string().meta({
    description: "Translation string of the title",
  }),
  content: z.string().nullable().meta({
    description: "Content of the message. Can contain HTML",
  }),
  contentTranslation: z.string().nullable().optional().meta({
    description: "Translation string of the message",
  }),
  status: z.string(),
  lineType: z.string(),
  createdOn: z.iso
    .datetime({ offset: true })
    .transform(transformISODateTime)
    .meta({
      description: "The datetime the message was created on",
    }),
  modifiedOn: z.iso
    .datetime({ offset: true })
    .nullable()
    .optional()
    .transform((val) => (val ? transformISODateTime(val) : val))
    .meta({
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
