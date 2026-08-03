import { z } from "zod";

export const UserRole = z.enum([
  "TEACHER",
  "PRINCIPAL",
  "LEARNER",
  "CONTACT",
  "ADMIN",
  "SCHOOL_OWNER",
  "BASIC",
]);

export type UserRole = z.infer<typeof UserRole>;

/**
 * Accepts API roles with optional ROLE_ prefix.
 * Normalizes them into the canonical UserRole format.
 */
export const PrefixedUserRole = z
  .string()
  .transform((role) => role.replace(/^ROLE_/, ""))
  .pipe(UserRole);