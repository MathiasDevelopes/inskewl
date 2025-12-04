import { z } from "zod";

export const SchoolSchema = z.object({
  tenant: z.number(),
  misTenant: z.number(),
  name: z.string(),
  independentSchool: z.boolean(),
  privateSchool: z.boolean(),
  examSchool: z.boolean(),
  adultSchool: z.boolean(),
  schoolTypes: z.array(z.string()),
});

export type School = z.infer<typeof SchoolSchema>;
