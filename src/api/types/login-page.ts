import { z } from "zod";
import { Tenant, TenantSchema } from "./tenant";

export const IdentityProviderSchema = z.enum(["FEIDE", "ID_PORTEN"]).meta({
  description: "An identity provider",
});

export const LoginPageSchema = z.object({
  validUrl: z.boolean().meta({
    description: "Whether this is a valid tenant or school URL",
  }),
  identityProviders: z
    .object({
      identityProviders: z.array(IdentityProviderSchema).meta({
        description: "The identity providers you can sign in with",
      }),
    })
    .nullable(),
  schoolInfo: TenantSchema.nullable(),
});

export type IdentityProvider = z.infer<typeof IdentityProviderSchema>;
export type SchoolInfo = Tenant;
export type LoginPage = z.infer<typeof LoginPageSchema>;
