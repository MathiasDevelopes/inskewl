import { z } from "zod";

export const TenantSchema = z.object({
  tenant: z.number().meta({
    description: "ID of the tenant",
  }),
  subDomain: z.string().meta({
    description: "Subdomain for the tenant",
  }),
  description: z.string().meta({
    description: "Display name of the tenant",
  }),
});

export type Tenant = z.infer<typeof TenantSchema>;
