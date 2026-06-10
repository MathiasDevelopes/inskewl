import { z } from "zod";

export const IdentityProviderSchema = z.enum(["FEIDE", "ID_PORTEN"]).meta({
  description: "An identity provider",
});

export const SchoolInfoSchema = z.object({
  tenant: z.number().meta({
    description: "The id of the tenant",
  }),
  subDomain: z.string().meta({
    description: "The subdomain of the URL",
  }),
  description: z.string().meta({
    description: "The school's full name",
  }),
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
  schoolInfo: SchoolInfoSchema.nullable(),
});

export type IdentityProvider = z.infer<typeof IdentityProviderSchema>;
export type SchoolInfo = z.infer<typeof SchoolInfoSchema>;
export type LoginPage = z.infer<typeof LoginPageSchema>;
