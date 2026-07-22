import type { z, ZodType } from "zod";
import { Endpoint } from "../endpoint";

export class TenantApi extends Endpoint {
  // This endpoint is publicly accessible and requires no authentication.
  // NB: This has to be called from a tenant's url, not callable from the base url "inschool.visma.no"
  async getTenantlist<S extends ZodType>(schema: S): Promise<z.output<S>> {
    return this.client.getWithSchema("tenant/list", schema);
  }
}
